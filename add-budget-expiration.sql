-- Add expiration_date column to budgets table
-- Run this in your Supabase SQL Editor if the column doesn't exist

ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS expiration_date DATE;

-- Add comment
COMMENT ON COLUMN budgets.expiration_date IS 'Optional expiration date for the budget. NULL means the budget never expires.';

