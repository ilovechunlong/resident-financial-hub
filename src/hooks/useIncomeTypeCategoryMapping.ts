
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { IncomeTypeCategoryMapping } from '@/types/financial';

export const useIncomeTypeCategoryMapping = () => {
  return useQuery({
    queryKey: ['income-type-category-mapping'],
    queryFn: async (): Promise<IncomeTypeCategoryMapping[]> => {
      console.log('=== useIncomeTypeCategoryMapping Hook Debug ===');
      console.log('Starting to fetch income type category mappings...');
      
      try {
        const { data, error } = await supabase
          .from('income_type_category_mapping')
          .select('*')
          .order('income_type', { ascending: true });

        console.log('Supabase query completed');
        console.log('Raw supabase response data:', data);
        console.log('Supabase error:', error);

        if (error) {
          console.error('Supabase error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }

        console.log('Successfully fetched income type category mappings:', data);
        console.log('Data length:', data?.length || 0);
        
        return data || [];
      } catch (err) {
        console.error('Error in queryFn:', err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
