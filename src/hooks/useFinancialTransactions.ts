
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FinancialTransaction, FinancialTransactionFormData } from '@/types/financial';
import { useToast } from '@/hooks/use-toast';

export const useFinancialTransactions = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['financial-transactions'],
    queryFn: async (): Promise<FinancialTransaction[]> => {
      console.log('Fetching financial transactions...');
      
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Error fetching financial transactions:', error);
        throw error;
      }

      console.log('Financial transactions fetched:', data);
      return data;
    },
  });
};

export const useAddFinancialTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (transactionData: FinancialTransactionFormData): Promise<FinancialTransaction> => {
      console.log('Adding financial transaction:', transactionData);
      
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) {
        console.error('Error adding financial transaction:', error);
        throw error;
      }

      console.log('Financial transaction added:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      toast({
        title: "Success",
        description: "Financial transaction added successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Failed to add financial transaction:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add financial transaction. Please try again.",
      });
    },
  });
};

export const useFinancialCategories = () => {
  return useQuery({
    queryKey: ['financial-categories'],
    queryFn: async () => {
      console.log('Fetching financial categories...');
      
      const { data, error } = await supabase
        .from('financial_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching financial categories:', error);
        throw error;
      }

      console.log('Financial categories fetched:', data);
      return data;
    },
  });
};
