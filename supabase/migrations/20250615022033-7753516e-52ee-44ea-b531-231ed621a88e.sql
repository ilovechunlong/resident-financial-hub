
-- Enable RLS on tables where it is currently disabled
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;

-- Drop the existing permissive policy on nursing_homes
DROP POLICY "Allow all operations on nursing_homes" ON public.nursing_homes;

-- Create policies to allow any authenticated user to manage records

-- Policy for nursing_homes
CREATE POLICY "Allow authenticated users to manage nursing_homes"
  ON public.nursing_homes
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for residents
CREATE POLICY "Allow authenticated users to manage residents"
  ON public.residents
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for financial_transactions
CREATE POLICY "Allow authenticated users to manage financial_transactions"
  ON public.financial_transactions
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for report_configurations
CREATE POLICY "Allow authenticated users to manage report_configurations"
  ON public.report_configurations
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for generated_reports
CREATE POLICY "Allow authenticated users to manage generated_reports"
  ON public.generated_reports
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for financial_categories
CREATE POLICY "Allow authenticated users to manage financial_categories"
  ON public.financial_categories
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
