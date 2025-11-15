-- Add missing columns to user_profiles table
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/brywmjhsrnebfmhrhlmi/editor

-- Add reforge_count column (tracks Reforge exercise completions)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS reforge_count INTEGER DEFAULT 0;

-- Add completed_exercise_types column (tracks which exercise types user has tried)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS completed_exercise_types TEXT[] DEFAULT '{}';

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('reforge_count', 'completed_exercise_types');
