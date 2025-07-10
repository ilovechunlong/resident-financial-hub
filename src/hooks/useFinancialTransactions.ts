import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FinancialTransaction, FinancialTransactionFormData } from '@/types/financial';
import { useToast } from '@/hooks/use-toast';
import { TransactionFilters } from '@/components/financial/TransactionFilters';

export const useFinancialTransactions = (filters?: TransactionFilters) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['financial-transactions', filters],
    queryFn: async (): Promise<FinancialTransaction[]> => {
      console.log('Fetching financial transactions with filters:', filters);
      
      let query = supabase
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      // Apply filters
      if (filters) {
        // Date range filters
        if (filters.dateRange.from) {
          query = query.gte('transaction_date', filters.dateRange.from.toISOString().split('T')[0]);
        }
        if (filters.dateRange.to) {
          query = query.lte('transaction_date', filters.dateRange.to.toISOString().split('T')[0]);
        }

        // Transaction type filter
        if (filters.type && filters.type !== 'all') {
          query = query.eq('transaction_type', filters.type);
        }

        // Status filter
        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        // Category filter
        if (filters.category) {
          query = query.ilike('category', `%${filters.category}%`);
        }

        // Nursing home filter
        if (filters.nursingHomeId) {
          query = query.eq('nursing_home_id', filters.nursingHomeId);
        }

        // Resident filter
        if (filters.residentId) {
          query = query.eq('resident_id', filters.residentId);
        }
      }

      const { data, error } = await query;

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

export const useUpdateFinancialTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...transactionData }: FinancialTransactionFormData & { id: string }): Promise<FinancialTransaction> => {
      console.log('Updating financial transaction with ID:', id, 'Data:', transactionData);
      
      // Clean the data to ensure we only send valid fields
      const updateData = {
        transaction_type: transactionData.transaction_type,
        category: transactionData.category,
        amount: transactionData.amount,
        description: transactionData.description || null,
        transaction_date: transactionData.transaction_date,
        payment_method: transactionData.payment_method || null,
        reference_number: transactionData.reference_number || null,
        nursing_home_id: transactionData.nursing_home_id || null,
        resident_id: transactionData.resident_id || null,
        status: transactionData.status,
        is_recurring: transactionData.is_recurring || false,
        recurring_frequency: transactionData.recurring_frequency || null,
      };

      const { data, error } = await supabase
        .from('financial_transactions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating financial transaction:', error);
        throw error;
      }

      console.log('Financial transaction updated successfully:', data);
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
        description: "Financial transaction updated successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Failed to update financial transaction:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update financial transaction. Please try again.",
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
        transaction_type: category.transaction_type as 'income' | 'expense',
        category_scope: category.category_scope as 'nursing_home' | 'resident'
      }));
    },
  });
};
