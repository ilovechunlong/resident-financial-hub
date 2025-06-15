export interface FinancialTransaction {
  id: string;
  nursing_home_id?: string;
  resident_id?: string;
  transaction_type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  transaction_date: string;
  payment_method?: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'insurance';
  reference_number?: string;
  is_recurring?: boolean;
  recurring_frequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface FinancialCategory {
  id: string;
  name: string;
  transaction_type: 'income' | 'expense';
  description?: string;
  is_active?: boolean;
  created_at: string;
  category_scope: 'nursing_home' | 'resident';
}

export interface FinancialTransactionFormData {
  nursing_home_id?: string;
  resident_id?: string;
  transaction_type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  transaction_date: string;
  payment_method?: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'insurance';
  reference_number?: string;
  is_recurring?: boolean;
  recurring_frequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  status: 'pending' | 'completed' | 'cancelled';
}
