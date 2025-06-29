
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReportConfiguration, GeneratedReport, ReportFormData, PaginationParams, PaginatedResponse } from '@/types/report';
import { useToast } from '@/hooks/use-toast';
import { ReportGenerator } from '@/utils/reportGenerator';

export const useReportConfigurations = (pagination?: PaginationParams) => {
  return useQuery({
    queryKey: ['report-configurations', pagination],
    queryFn: async (): Promise<PaginatedResponse<ReportConfiguration>> => {
      console.log('Fetching report configurations...');
      
      let query = supabase
        .from('report_configurations')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (pagination) {
        const from = (pagination.page - 1) * pagination.limit;
        const to = from + pagination.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching report configurations:', error);
        throw error;
      }

      console.log('Report configurations fetched:', data);
      
      const totalPages = pagination ? Math.ceil((count || 0) / pagination.limit) : 1;
      
      return {
        data: data as ReportConfiguration[],
        total: count || 0,
        page: pagination?.page || 1,
        limit: pagination?.limit || data?.length || 0,
        totalPages,
      };
    },
  });
};

export const useGeneratedReports = (configurationId?: string, pagination?: PaginationParams) => {
  return useQuery({
    queryKey: ['generated-reports', configurationId, pagination],
    queryFn: async (): Promise<PaginatedResponse<GeneratedReport>> => {
      console.log('Fetching generated reports...');
      
      let query = supabase
        .from('generated_reports')
        .select('*', { count: 'exact' })
        .order('generated_at', { ascending: false });

      if (configurationId) {
        query = query.eq('configuration_id', configurationId);
      }

      if (pagination) {
        const from = (pagination.page - 1) * pagination.limit;
        const to = from + pagination.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching generated reports:', error);
        throw error;
      }

      console.log('Generated reports fetched:', data);
      
      const totalPages = pagination ? Math.ceil((count || 0) / pagination.limit) : 1;
      
      return {
        data: data as GeneratedReport[],
        total: count || 0,
        page: pagination?.page || 1,
        limit: pagination?.limit || data?.length || 0,
        totalPages,
      };
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
        },
        config.nursing_home_id || undefined
      );

      // Store the generated report in the database
      const { data, error } = await supabase
        .from('generated_reports')
        .insert([{
          configuration_id: configurationId,
          report_data: {
            summary: reportData.summary,
            total_records: reportData.data.length,
            generated_at: new Date().toISOString(),
            report_type: config.report_type,
            date_range: reportData.dateRange,
            nursing_home_id: config.nursing_home_id
          },
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
