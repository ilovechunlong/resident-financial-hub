
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReportConfiguration, PaginationParams, PaginatedResponse } from '@/types/report';

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
