-- Check and ensure budgets table has all required columns
-- Run this in your Supabase SQL Editor

-- Check if start_date column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'budgets' 
        AND column_name = 'start_date'
    ) THEN
        ALTER TABLE budgets ADD COLUMN start_date DATE;
        RAISE NOTICE 'Added start_date column to budgets table';
    ELSE
        RAISE NOTICE 'start_date column already exists';
    END IF;
END $$;

-- Check if expiration_date column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'budgets' 
        AND column_name = 'expiration_date'
    ) THEN
        ALTER TABLE budgets ADD COLUMN expiration_date DATE;
        RAISE NOTICE 'Added expiration_date column to budgets table';
    ELSE
        RAISE NOTICE 'expiration_date column already exists';
    END IF;
END $$;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'budgets'
ORDER BY ordinal_position;

