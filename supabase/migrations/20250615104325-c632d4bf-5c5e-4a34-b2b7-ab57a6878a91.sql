
-- Drop the existing CHECK constraint on the report_type column.
ALTER TABLE public.report_configurations DROP CONSTRAINT IF EXISTS report_configurations_report_type_check;

-- Add a new CHECK constraint that includes the new report type.
ALTER TABLE public.report_configurations
ADD CONSTRAINT report_configurations_report_type_check
CHECK (report_type IN ('transaction_report', 'resident_report'));
