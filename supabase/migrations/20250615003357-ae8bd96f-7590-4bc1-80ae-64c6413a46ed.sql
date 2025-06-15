
-- Step 1: Drop the existing unique index which depends on the columns to be dropped.
DROP INDEX IF EXISTS public.idx_income_type_category_mapping_unique;

-- Step 2: Remove duplicate income types based on `display_label`.
-- This uses a window function to identify and remove duplicates, keeping the first created entry for each display_label.
WITH numbered_rows AS (
  SELECT id, ROW_NUMBER() OVER(PARTITION BY display_label ORDER BY created_at) as rn
  FROM public.income_type_category_mapping
)
DELETE FROM public.income_type_category_mapping
WHERE id IN (SELECT id FROM numbered_rows WHERE rn > 1);

-- Step 3: Drop the `income_type` and `category_name` columns as requested.
-- This simplifies the table to be a list of income types rather than a mapping.
ALTER TABLE public.income_type_category_mapping DROP COLUMN income_type;
ALTER TABLE public.income_type_category_mapping DROP COLUMN category_name;

-- Step 4: Add a unique constraint to `display_label`.
-- This enforces that each income type name is unique going forward.
ALTER TABLE public.income_type_category_mapping ADD CONSTRAINT uq_display_label UNIQUE (display_label);
