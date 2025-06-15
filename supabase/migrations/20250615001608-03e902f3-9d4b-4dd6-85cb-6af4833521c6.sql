
-- Add display_label and description to income_type_category_mapping
ALTER TABLE public.income_type_category_mapping ADD COLUMN display_label TEXT;
ALTER TABLE public.income_type_category_mapping ADD COLUMN description TEXT;

-- Update existing records with labels and descriptions
UPDATE public.income_type_category_mapping SET display_label = 'SSI (Supplemental Security Income)', description = 'Federal income supplement program' WHERE income_type = 'ssi';
UPDATE public.income_type_category_mapping SET display_label = 'SSDI (Social Security Disability Insurance)', description = 'Federal insurance program' WHERE income_type = 'ssdi';
UPDATE public.income_type_category_mapping SET display_label = 'Medicaid', description = 'Government health insurance' WHERE income_type = 'medicaid';
UPDATE public.income_type_category_mapping SET display_label = 'Medicare', description = 'Federal health insurance' WHERE income_type = 'medicare';
UPDATE public.income_type_category_mapping SET display_label = 'Private Insurance', description = 'Private health insurance' WHERE income_type = 'private_insurance';
UPDATE public.income_type_category_mapping SET display_label = 'Private Pay', description = 'Private payment' WHERE income_type = 'private_pay';
UPDATE public.income_type_category_mapping SET display_label = 'Grant', description = 'Government or private grants' WHERE income_type = 'grant';
UPDATE public.income_type_category_mapping SET display_label = 'Waiver', description = 'Medicaid waiver programs' WHERE income_type = 'waiver';
UPDATE public.income_type_category_mapping SET display_label = 'Veteran Benefits', description = 'VA benefits and support' WHERE income_type = 'veteran_benefits';
UPDATE public.income_type_category_mapping SET display_label = 'Other', description = 'Other income sources' WHERE income_type = 'other';

-- Make the new columns non-nullable after populating them
ALTER TABLE public.income_type_category_mapping ALTER COLUMN display_label SET NOT NULL;
ALTER TABLE public.income_type_category_mapping ALTER COLUMN description SET NOT NULL;
