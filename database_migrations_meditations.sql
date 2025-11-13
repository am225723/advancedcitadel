-- Database migration for meditation feature
-- Run this in Supabase SQL Editor

-- Create meditation_sessions table
CREATE TABLE IF NOT EXISTS meditation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meditation_id TEXT NOT NULL,
  guide_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER,
  mood_buff_type TEXT,
  mood_buff_expires_at TIMESTAMP WITH TIME ZONE,
  xp_earned INTEGER DEFAULT 25,
  CONSTRAINT valid_meditation_id CHECK (meditation_id IN (
    'solaire_sun',
    'siegward_respite',
    'artorias_abyss',
    'alonne_honor',
    'patches_traps'
  )),
  CONSTRAINT valid_mood_buff CHECK (mood_buff_type IN (
    'confidence',
    'calm',
    'resilience',
    'focus',
    'clarity'
  ))
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_id ON meditation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_completed_at ON meditation_sessions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_meditation_id ON meditation_sessions(meditation_id);

-- Enable Row Level Security
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meditation_sessions
CREATE POLICY "Users can view their own meditation sessions"
  ON meditation_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meditation sessions"
  ON meditation_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add columns to user_profiles table for meditation tracking
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS meditation_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_mood_buff JSONB DEFAULT NULL;

-- Create a comment explaining the active_mood_buff structure
COMMENT ON COLUMN user_profiles.active_mood_buff IS 'Stores active mood buff: {"type": "confidence", "expires_at": "2024-11-14T12:00:00Z"}';

-- Function to check if mood buff is active
CREATE OR REPLACE FUNCTION is_mood_buff_active(buff JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  IF buff IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN (buff->>'expires_at')::TIMESTAMPTZ > NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get meditation stats for a user
CREATE OR REPLACE FUNCTION get_meditation_stats(p_user_id UUID)
RETURNS TABLE(
  total_meditations BIGINT,
  total_xp_earned BIGINT,
  favorite_guide TEXT,
  current_streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_meditations,
    COALESCE(SUM(xp_earned), 0) as total_xp_earned,
    (
      SELECT guide_id
      FROM meditation_sessions
      WHERE user_id = p_user_id
      GROUP BY guide_id
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as favorite_guide,
    0 as current_streak
  FROM meditation_sessions
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON meditation_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION is_mood_buff_active TO authenticated;
GRANT EXECUTE ON FUNCTION get_meditation_stats TO authenticated;

-- Add comment to document the feature
COMMENT ON TABLE meditation_sessions IS 'Tracks completed meditation sessions with XP rewards and mood buffs';
