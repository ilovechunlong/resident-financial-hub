
-- Add the new report type to any existing report configurations if needed
-- This ensures the new report type is available in the system
INSERT INTO financial_categories (name, transaction_type, category_scope, description) 
VALUES ('System Report Types', 'expense', 'nursing_home', 'System-generated report type categories')
ON CONFLICT DO NOTHING;
