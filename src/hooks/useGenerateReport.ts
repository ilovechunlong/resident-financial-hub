
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GeneratedReport } from '@/types/report';
import { useToast } from '@/hooks/use-toast';
import { ReportGenerator } from '@/utils/reportGenerator';

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (configurationId: string): Promise<GeneratedReport> => {
      console.log('Generating report for configuration:', configurationId);
      
      // Get the configuration details
      const { data: config, error: configError } = await supabase
        .from('report_configurations')
        .select('*')
        .eq('id', configurationId)
        .single();

      if (configError) {
        console.error('Error fetching configuration:', configError);
        throw configError;
      }

      // Generate the actual report data
      const reportData = await ReportGenerator.generateReportData(
        configurationId,
        config.report_type,
        {
          start: config.date_range_start || undefined,
          end: config.date_range_end || undefined,
        }
      );

      // Store the generated report in the database with proper data structure
      const reportDataToStore = {
        summary: reportData.summary,
        total_records: reportData.data.length,
        generated_at: new Date().toISOString(),
        report_type: config.report_type,
        date_range: reportData.dateRange,
        nursing_home_id: config.nursing_home_id,
        data: reportData.data // Include the actual data for preview
      };

      const { data, error } = await supabase
        .from('generated_reports')
        .insert([{
          configuration_id: configurationId,
          report_data: reportDataToStore,
          status: 'completed'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error generating report:', error);
        throw error;
      }

      console.log('Report generated:', data);
      return data as GeneratedReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-reports'] });
      toast({
        title: "Success",
        description: "Report generated successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Failed to generate report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report. Please try again.",
      });
    },
  });
};
