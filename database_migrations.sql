-- Database Migrations for Dark Souls Therapeutic Guides System
-- Execute these in your Supabase SQL Editor

-- ============================================
-- MIGRATION 1: Add active_guide to user_profiles
-- ============================================

-- Add active_guide column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS active_guide TEXT DEFAULT 'solaire';

-- Add constraint to ensure valid guide names
ALTER TABLE user_profiles
ADD CONSTRAINT valid_guide_name 
CHECK (active_guide IN ('solaire', 'siegward', 'artorias', 'gael', 'patches', 'lautrec', 'alonne'));

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.active_guide IS 'The currently selected therapeutic guide persona';

-- ============================================
-- MIGRATION 2: Create guide_interactions table
-- ============================================

-- Create table to track guide interactions
CREATE TABLE IF NOT EXISTS guide_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guide_name TEXT NOT NULL,
  interaction_type TEXT NOT NULL, -- 'journal', 'reframe', 'chat'
  user_input TEXT NOT NULL,
  guide_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_interaction_guide CHECK (guide_name IN ('solaire', 'siegward', 'artorias', 'gael', 'patches', 'lautrec', 'alonne')),
  CONSTRAINT valid_interaction_type CHECK (interaction_type IN ('journal', 'reframe', 'chat'))
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_guide_interactions_user_id ON guide_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_guide_interactions_created_at ON guide_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guide_interactions_guide_name ON guide_interactions(guide_name);
CREATE INDEX IF NOT EXISTS idx_guide_interactions_type ON guide_interactions(interaction_type);

-- Add comments for documentation
COMMENT ON TABLE guide_interactions IS 'Tracks all interactions between users and their therapeutic guides';
COMMENT ON COLUMN guide_interactions.guide_name IS 'The guide persona that provided the response';
COMMENT ON COLUMN guide_interactions.interaction_type IS 'Type of interaction: journal, reframe, or chat';
COMMENT ON COLUMN guide_interactions.user_input IS 'The user''s input text';
COMMENT ON COLUMN guide_interactions.guide_response IS 'The guide''s AI-generated response';

-- ============================================
-- MIGRATION 3: Enable Row Level Security (RLS)
-- ============================================

-- Enable RLS on guide_interactions table
ALTER TABLE guide_interactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own interactions
CREATE POLICY "Users can view own interactions" ON guide_interactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own interactions
CREATE POLICY "Users can insert own interactions" ON guide_interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own interactions
CREATE POLICY "Users can delete own interactions" ON guide_interactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- MIGRATION 4: Create helper functions
-- ============================================

-- Function to get user's interaction count with a specific guide
CREATE OR REPLACE FUNCTION get_guide_interaction_count(
  p_user_id UUID,
  p_guide_name TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  interaction_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO interaction_count
  FROM guide_interactions
  WHERE user_id = p_user_id
    AND guide_name = p_guide_name;
  
  RETURN interaction_count;
END;
$$;

-- Function to get user's most used guide
CREATE OR REPLACE FUNCTION get_most_used_guide(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  most_used_guide TEXT;
BEGIN
  SELECT guide_name
  INTO most_used_guide
  FROM guide_interactions
  WHERE user_id = p_user_id
  GROUP BY guide_name
  ORDER BY COUNT(*) DESC
  LIMIT 1;
  
  RETURN most_used_guide;
END;
$$;

-- Function to get interaction statistics for a user
CREATE OR REPLACE FUNCTION get_user_guide_stats(p_user_id UUID)
RETURNS TABLE (
  guide_name TEXT,
  interaction_count BIGINT,
  last_interaction TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gi.guide_name,
    COUNT(*) as interaction_count,
    MAX(gi.created_at) as last_interaction
  FROM guide_interactions gi
  WHERE gi.user_id = p_user_id
  GROUP BY gi.guide_name
  ORDER BY interaction_count DESC;
END;
$$;

-- ============================================
-- MIGRATION 5: Add guide unlock tracking (optional)
-- ============================================

-- Add array column to track which guides have been unlocked
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS unlocked_guides TEXT[] DEFAULT ARRAY['solaire', 'siegward', 'artorias'];

-- Add comment
COMMENT ON COLUMN user_profiles.unlocked_guides IS 'Array of guide IDs that the user has unlocked';

-- Function to unlock a guide for a user
CREATE OR REPLACE FUNCTION unlock_guide(
  p_user_id UUID,
  p_guide_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_guides TEXT[];
BEGIN
  -- Get current unlocked guides
  SELECT unlocked_guides INTO current_guides
  FROM user_profiles
  WHERE id = p_user_id;
  
  -- Check if guide is already unlocked
  IF p_guide_name = ANY(current_guides) THEN
    RETURN FALSE; -- Already unlocked
  END IF;
  
  -- Add guide to unlocked array
  UPDATE user_profiles
  SET unlocked_guides = array_append(current_guides, p_guide_name),
      updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN TRUE; -- Successfully unlocked
END;
$$;

-- ============================================
-- MIGRATION 6: Create view for guide analytics
-- ============================================

-- Create a view for guide usage analytics
CREATE OR REPLACE VIEW guide_usage_analytics AS
SELECT 
  gi.guide_name,
  gi.interaction_type,
  COUNT(*) as total_interactions,
  COUNT(DISTINCT gi.user_id) as unique_users,
  AVG(LENGTH(gi.user_input)) as avg_input_length,
  AVG(LENGTH(gi.guide_response)) as avg_response_length,
  DATE_TRUNC('day', gi.created_at) as interaction_date
FROM guide_interactions gi
GROUP BY gi.guide_name, gi.interaction_type, DATE_TRUNC('day', gi.created_at)
ORDER BY interaction_date DESC, total_interactions DESC;

-- Add comment
COMMENT ON VIEW guide_usage_analytics IS 'Analytics view for guide usage patterns';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify active_guide column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles' AND column_name = 'active_guide';

-- Verify guide_interactions table exists
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'guide_interactions';

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'guide_interactions';

-- Check all policies on guide_interactions
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'guide_interactions';