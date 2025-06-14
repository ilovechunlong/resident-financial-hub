
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReportConfiguration, GeneratedReport, ReportFormData } from '@/types/report';
import { useToast } from '@/hooks/use-toast';

export const useReportConfigurations = () => {
  return useQuery({
    queryKey: ['report-configurations'],
    queryFn: async (): Promise<ReportConfiguration[]> => {
      console.log('Fetching report configurations...');
      
      const { data, error } = await supabase
        .from('report_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching report configurations:', error);
        throw error;
      }

      console.log('Report configurations fetched:', data);
      return data as ReportConfiguration[];
    },
  });
};

export const useGeneratedReports = (configurationId?: string) => {
  return useQuery({
    queryKey: ['generated-reports', configurationId],
    queryFn: async (): Promise<GeneratedReport[]> => {
      console.log('Fetching generated reports...');
      
      let query = supabase
        .from('generated_reports')
        .select('*')
        .order('generated_at', { ascending: false });

      if (configurationId) {
        query = query.eq('configuration_id', configurationId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching generated reports:', error);
        throw error;
      }

      console.log('Generated reports fetched:', data);
      return data as GeneratedReport[];
    },
  });
};

export const useCreateReportConfiguration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reportData: ReportFormData): Promise<ReportConfiguration> => {
      console.log('Creating report configuration:', reportData);
      
      const { data, error } = await supabase
        .from('report_configurations')
        .insert([reportData])
        .select()
        .single();

      if (error) {
        console.error('Error creating report configuration:', error);
        throw error;
      }

      console.log('Report configuration created:', data);
      return data as ReportConfiguration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-configurations'] });
      toast({
        title: "Success",
        description: "Report configuration created successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Failed to create report configuration:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create report configuration. Please try again.",
      });
    },
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (configurationId: string): Promise<GeneratedReport> => {
      console.log('Generating report for configuration:', configurationId);
      
      // For now, we'll create a simple report with mock data
      // In a real implementation, this would process the actual data
      const reportData = {
        generated_at: new Date().toISOString(),
        summary: "Report generated successfully",
        total_records: 0,
        // Add more fields based on report type
      };

      const { data, error } = await supabase
        .from('generated_reports')
        .insert([{
          configuration_id: configurationId,
          report_data: reportData,
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
