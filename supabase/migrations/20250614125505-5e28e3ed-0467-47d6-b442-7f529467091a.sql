
-- Create a table for report configurations
CREATE TABLE public.report_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('financial_summary', 'transaction_report', 'nursing_home_report', 'resident_report')),
  filters jsonb DEFAULT '{}',
  date_range_start date,
  date_range_end date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create a table for generated reports
CREATE TABLE public.generated_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  configuration_id uuid REFERENCES public.report_configurations(id) ON DELETE CASCADE,
  report_data jsonb NOT NULL,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed'))
);

-- Add trigger to update updated_at column for report_configurations
CREATE TRIGGER update_report_configurations_updated_at
  BEFORE UPDATE ON public.report_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_report_configurations_type ON public.report_configurations(report_type);
CREATE INDEX idx_generated_reports_configuration_id ON public.generated_reports(configuration_id);
CREATE INDEX idx_generated_reports_generated_at ON public.generated_reports(generated_at);
