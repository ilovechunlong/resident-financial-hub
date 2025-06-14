
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
      // Cast the data to match our TypeScript interface
      return data.map(transaction => ({
        ...transaction,
        transaction_type: transaction.transaction_type as 'income' | 'expense',
        payment_method: transaction.payment_method as 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'insurance' | undefined,
        recurring_frequency: transaction.recurring_frequency as 'weekly' | 'monthly' | 'quarterly' | 'yearly' | undefined,
        status: transaction.status as 'pending' | 'completed' | 'cancelled'
      }));
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
      // Cast the data to match our TypeScript interface
      return {
        ...data,
        transaction_type: data.transaction_type as 'income' | 'expense',
        payment_method: data.payment_method as 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'insurance' | undefined,
        recurring_frequency: data.recurring_frequency as 'weekly' | 'monthly' | 'quarterly' | 'yearly' | undefined,
        status: data.status as 'pending' | 'completed' | 'cancelled'
      };
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
      // Cast the data to match our TypeScript interface
      return data.map(category => ({
        ...category,
        transaction_type: category.transaction_type as 'income' | 'expense'
      }));
    },
  });
};

// Re-export the income type category mapping hook for convenience
export { useIncomeTypeCategoryMapping } from './useIncomeTypeCategoryMapping';
