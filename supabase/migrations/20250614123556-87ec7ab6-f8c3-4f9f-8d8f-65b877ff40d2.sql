
-- Create a table for financial transactions
CREATE TABLE public.financial_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nursing_home_id uuid REFERENCES public.nursing_homes(id) ON DELETE CASCADE,
  resident_id uuid REFERENCES public.residents(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  category text NOT NULL,
  amount numeric(10,2) NOT NULL,
  description text,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text CHECK (payment_method IN ('cash', 'check', 'credit_card', 'bank_transfer', 'insurance')),
  reference_number text,
  is_recurring boolean DEFAULT false,
  recurring_frequency text CHECK (recurring_frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add trigger to update updated_at column
CREATE TRIGGER update_financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_financial_transactions_nursing_home_id ON public.financial_transactions(nursing_home_id);
CREATE INDEX idx_financial_transactions_resident_id ON public.financial_transactions(resident_id);
CREATE INDEX idx_financial_transactions_type ON public.financial_transactions(transaction_type);
CREATE INDEX idx_financial_transactions_date ON public.financial_transactions(transaction_date);
CREATE INDEX idx_financial_transactions_status ON public.financial_transactions(status);

-- Create a table for financial categories
CREATE TABLE public.financial_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default financial categories
INSERT INTO public.financial_categories (name, transaction_type, description) VALUES
-- Income categories
('Resident Fees', 'income', 'Monthly fees paid by residents'),
('Insurance Payments', 'income', 'Payments from insurance companies'),
('Government Funding', 'income', 'Government subsidies and funding'),
('Additional Services', 'income', 'Extra services provided to residents'),
('Donations', 'income', 'Charitable donations received'),

-- Expense categories
('Staff Salaries', 'expense', 'Employee wages and salaries'),
('Medical Supplies', 'expense', 'Medical equipment and supplies'),
('Food & Catering', 'expense', 'Meals and food supplies'),
('Utilities', 'expense', 'Electricity, water, gas, internet'),
('Maintenance', 'expense', 'Building and equipment maintenance'),
('Insurance', 'expense', 'Insurance premiums'),
('Legal & Professional', 'expense', 'Legal and professional services'),
('Transportation', 'expense', 'Vehicle costs and transportation'),
('Administrative', 'expense', 'Office supplies and administrative costs');
