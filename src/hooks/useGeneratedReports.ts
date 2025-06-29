
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GeneratedReport, PaginationParams, PaginatedResponse } from '@/types/report';

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
