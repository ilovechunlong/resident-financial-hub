
-- Create income_type_category_mapping table
CREATE TABLE public.income_type_category_mapping (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  income_type text NOT NULL,
  category_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create unique index to prevent duplicate mappings
CREATE UNIQUE INDEX idx_income_type_category_mapping_unique 
ON public.income_type_category_mapping (income_type, category_name);

-- Add trigger for updated_at
CREATE TRIGGER update_income_type_category_mapping_updated_at
  BEFORE UPDATE ON public.income_type_category_mapping
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the existing mapping data
INSERT INTO public.income_type_category_mapping (income_type, category_name) VALUES
  ('ssi', 'Government Funding'),
  ('ssdi', 'Government Funding'),
  ('medicaid', 'Insurance Payments'),
  ('medicare', 'Insurance Payments'),
  ('private_insurance', 'Insurance Payments'),
  ('private_pay', 'Resident Fees'),
  ('grant', 'Government Funding'),
  ('grant', 'Donations'),
  ('waiver', 'Government Funding'),
  ('veteran_benefits', 'Government Funding'),
  ('other', 'Additional Services'),
  ('other', 'Donations');
