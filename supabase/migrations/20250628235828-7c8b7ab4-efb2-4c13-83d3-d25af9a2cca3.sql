
-- Add nursing_home_id column to report_configurations table
ALTER TABLE public.report_configurations 
ADD COLUMN nursing_home_id uuid REFERENCES public.nursing_homes(id);

-- Create index for better performance
CREATE INDEX idx_report_configurations_nursing_home_id ON public.report_configurations(nursing_home_id);
