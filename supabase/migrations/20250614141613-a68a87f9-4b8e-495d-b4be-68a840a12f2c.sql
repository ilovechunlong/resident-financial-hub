
-- Remove the monthly_fee column from the residents table since it's not required
ALTER TABLE public.residents DROP COLUMN IF EXISTS monthly_fee;
