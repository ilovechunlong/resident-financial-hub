
-- Update the report_configurations table to include the new report type
ALTER TABLE public.report_configurations 
DROP CONSTRAINT IF EXISTS report_configurations_report_type_check;

ALTER TABLE public.report_configurations 
ADD CONSTRAINT report_configurations_report_type_check 
CHECK (report_type IN (
  'transaction_report', 
  'resident_report', 
  'resident_annual_financial_summary', 
  'nursing_home_annual_financial_summary',
  'residents_income_per_nursing_home_monthly',
  'resident_income_expense_summary'
));
