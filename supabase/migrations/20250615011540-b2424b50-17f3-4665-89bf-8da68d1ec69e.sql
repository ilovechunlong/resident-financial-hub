
-- Add a scope to financial categories to distinguish between nursing home and resident categories
ALTER TABLE public.financial_categories ADD COLUMN category_scope TEXT;

-- Set a default scope for all categories, then override for specific ones.
-- Most expenses are at the nursing home level, while some income is at the resident level.
UPDATE public.financial_categories SET category_scope = 'nursing_home';
UPDATE public.financial_categories SET category_scope = 'resident' 
WHERE name IN ('Resident Fees', 'Insurance Payments', 'Additional Services');

-- Now that all rows have a value, make the column NOT NULL
ALTER TABLE public.financial_categories ALTER COLUMN category_scope SET NOT NULL;

-- Add a check constraint to ensure only valid values are used
ALTER TABLE public.financial_categories 
ADD CONSTRAINT financial_categories_scope_check CHECK (category_scope IN ('nursing_home', 'resident'));
