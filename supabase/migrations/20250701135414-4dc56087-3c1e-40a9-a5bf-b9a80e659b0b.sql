
-- Remove the current_residents column from nursing_homes table
ALTER TABLE public.nursing_homes DROP COLUMN current_residents;

-- Remove the constraint that checked current_residents <= capacity
ALTER TABLE public.nursing_homes DROP CONSTRAINT IF EXISTS check_current_residents_capacity;
