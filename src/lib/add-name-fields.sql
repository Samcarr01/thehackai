-- Add first_name and last_name columns to users table
ALTER TABLE public.users 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Update existing users to have empty string defaults (optional)
UPDATE public.users 
SET first_name = '', last_name = '' 
WHERE first_name IS NULL OR last_name IS NULL;