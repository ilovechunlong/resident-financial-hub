
-- Add income_types column to the residents table to store the financial profile information
ALTER TABLE public.residents ADD COLUMN income_types text[];

-- Add a comment to document the column
COMMENT ON COLUMN public.residents.income_types IS 'Array of income type identifiers selected during financial profile setup';
