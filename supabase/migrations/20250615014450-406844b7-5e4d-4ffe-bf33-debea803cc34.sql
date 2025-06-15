
-- Drop the old, incorrect unique constraint on just the name, if it exists.
ALTER TABLE public.financial_categories DROP CONSTRAINT IF EXISTS financial_categories_name_key;

-- Add a unique constraint to prevent duplicate category names within the same scope and type.
-- This might fail if the constraint already exists from the previous failed attempt, so we make it robust.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_category_name_scope_type'
    ) THEN
        ALTER TABLE public.financial_categories
        ADD CONSTRAINT unique_category_name_scope_type UNIQUE (name, transaction_type, category_scope);
    END IF;
END;
$$;


-- Step 1: Insert standard resident-scoped income categories if they don't exist.
INSERT INTO public.financial_categories (name, transaction_type, category_scope, description, is_active)
VALUES
    ('Government Funding', 'income', 'resident', 'Income from government sources like SSI, SSDI, grants, etc.', true),
    ('Donations', 'income', 'resident', 'Income from donations.', true),
    ('Insurance Payments', 'income', 'resident', 'Payments from insurance providers.', true),
    ('Resident Fees', 'income', 'resident', 'Fees paid by or on behalf of the resident.', true),
    ('Additional Services', 'income', 'resident', 'Fees for services not covered by standard fees.', true)
ON CONFLICT (name, transaction_type, category_scope) DO NOTHING;

-- Step 2: Create financial categories for existing custom income types.
WITH custom_types AS (
    SELECT DISTINCT unnest(income_types) as income_type
    FROM public.residents
    WHERE income_types IS NOT NULL AND income_types != '{}'
),
formatted_custom_types AS (
    SELECT
        income_type,
        INITCAP(REPLACE(SUBSTRING(income_type FROM 8), '_', ' ')) as category_name
    FROM custom_types
    WHERE income_type LIKE 'custom_%'
)
INSERT INTO public.financial_categories (name, transaction_type, category_scope, description, is_active)
SELECT
    category_name,
    'income',
    'resident',
    'Custom income type for a resident.',
    true
FROM formatted_custom_types
ON CONFLICT (name, transaction_type, category_scope) DO NOTHING;

-- Step 3: Migrate resident income types from old IDs to new category names.
WITH resident_income_types AS (
    SELECT id, unnest(income_types) as income_type
    FROM public.residents
    WHERE income_types IS NOT NULL AND income_types != '{}'
),
mapped_categories AS (
    SELECT
    id,
    income_type,
    CASE
        WHEN income_type IN ('ssi', 'ssdi', 'grant', 'waiver', 'veteran_benefits') THEN 'Government Funding'
        WHEN income_type IN ('medicaid', 'medicare', 'private_insurance') THEN 'Insurance Payments'
        WHEN income_type = 'private_pay' THEN 'Resident Fees'
        WHEN income_type = 'other' THEN 'Additional Services'
        WHEN income_type LIKE 'custom_%' THEN INITCAP(REPLACE(SUBSTRING(income_type FROM 8), '_', ' '))
        ELSE NULL
    END as category_name
    FROM resident_income_types
),
aggregated_categories AS (
    SELECT
    id,
    array_agg(DISTINCT category_name) FILTER (WHERE category_name IS NOT NULL) as new_income_categories
    FROM mapped_categories
    GROUP BY id
)
UPDATE public.residents r
SET income_types = ac.new_income_categories
FROM aggregated_categories ac
WHERE r.id = ac.id AND ac.new_income_categories IS NOT NULL;

-- Step 4: Drop the old mapping table.
DROP TABLE IF EXISTS public.income_type_category_mapping;
