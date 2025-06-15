
-- This script updates existing general expense categories to be scoped to nursing homes
-- and inserts new nursing home-specific expense categories.

-- First, ensure that common expense categories from the initial setup are scoped to 'nursing_home'
UPDATE public.financial_categories
SET category_scope = 'nursing_home'
WHERE 
    category_scope IS NULL 
    AND transaction_type = 'expense' 
    AND name IN (
        'Staff Salaries',
        'Medical Supplies',
        'Food & Catering',
        'Utilities',
        'Maintenance',
        'Insurance',
        'Legal & Professional',
        'Transportation',
        'Administrative'
    );

-- Next, insert the new list of expense categories for nursing homes.
-- Using ON CONFLICT to prevent duplicates if they already exist with the same scope and type.
INSERT INTO public.financial_categories (name, transaction_type, category_scope, description)
VALUES
    ('Fire Inspection', 'expense', 'nursing_home', 'Costs associated with fire safety inspections.'),
    ('Insurance', 'expense', 'nursing_home', 'Insurance premiums for the nursing home.'),
    ('Accounting Fees', 'expense', 'nursing_home', 'Fees for accounting services.'),
    ('Legal and Professional Fees', 'expense', 'nursing_home', 'Fees for legal and other professional services.'),
    ('Lawn Care (Grass)', 'expense', 'nursing_home', 'Expenses for lawn and garden maintenance.'),
    ('Rent', 'expense', 'nursing_home', 'Rental payments for property or equipment.'),
    ('Repairs and Maintenance', 'expense', 'nursing_home', 'Costs for repairs and general maintenance.'),
    ('Supplies', 'expense', 'nursing_home', 'General supplies for nursing home operations.'),
    ('Licensing Fees', 'expense', 'nursing_home', 'Fees for operational licenses.'),
    ('Equipment', 'expense', 'nursing_home', 'Purchases of new equipment.'),
    ('Payroll Taxes', 'expense', 'nursing_home', 'Taxes related to employee payroll.'),
    ('Water', 'expense', 'nursing_home', 'Water utility bills.'),
    ('Electricity and Gas', 'expense', 'nursing_home', 'Electricity and gas utility bills.'),
    ('Cleaning Expenses', 'expense', 'nursing_home', 'Costs for cleaning services and supplies.'),
    ('Telephone and Internet', 'expense', 'nursing_home', 'Telephone and internet service bills.'),
    ('Printing', 'expense', 'nursing_home', 'Costs related to printing and copying.'),
    ('Trash Removal Fees', 'expense', 'nursing_home', 'Fees for trash and waste removal.'),
    ('Credit Card Fees', 'expense', 'nursing_home', 'Fees charged by credit card processors.'),
    ('Pest Control', 'expense', 'nursing_home', 'Costs for pest control services.'),
    ('Wages', 'expense', 'nursing_home', 'Employee wages.')
ON CONFLICT (name, transaction_type, category_scope) DO NOTHING;
