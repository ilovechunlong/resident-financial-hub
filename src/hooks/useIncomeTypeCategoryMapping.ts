
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { IncomeTypeCategoryMapping } from '@/types/financial';

export const useIncomeTypeCategoryMapping = () => {
  return useQuery({
    queryKey: ['income-type-category-mapping'],
    queryFn: async (): Promise<IncomeTypeCategoryMapping[]> => {
      console.log('Fetching income type category mappings...');
      
      const { data, error } = await supabase
        .from('income_type_category_mapping')
        .select('*')
        .order('income_type', { ascending: true });

      if (error) {
        console.error('Error fetching income type category mappings:', error);
        throw error;
      }

      console.log('Income type category mappings fetched:', data);
      return data;
    },
  });
};
