-- Add start_date column to budgets table
-- Run this in your Supabase SQL Editor

ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS start_date DATE;

-- Add comment
COMMENT ON COLUMN budgets.start_date IS 'Optional start date for the budget. If not set, uses created_at date. Only expenses from start_date onwards are counted.';

