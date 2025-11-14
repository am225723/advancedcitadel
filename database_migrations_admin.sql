-- Admin Dashboard Database Migrations
-- Execute these in your Supabase SQL Editor

-- ⚠️ CRITICAL SECURITY NOTICE ⚠️
-- The admin RPC functions in this file MUST be protected by proper RLS policies
-- to prevent privilege escalation. Before deploying to production:
--
-- 1. ENSURE user_profiles.role is IMMUTABLE for non-admins
-- 2. ONLY service_role or admin users should be able to call these functions
-- 3. Verify RLS policies prevent users from modifying their own role
-- 4. Consider using Supabase service_role key for admin operations instead of client calls
--
-- See MIGRATION 2A below for required RLS policies

-- ============================================
-- MIGRATION 1: Fix get_all_users_with_profiles RPC function
-- ============================================

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_all_users_with_profiles();

-- Create the corrected function with proper return types
CREATE OR REPLACE FUNCTION get_all_users_with_profiles()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  display_name TEXT,
  level INTEGER,
  xp INTEGER,
  role TEXT,
  last_active TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::TEXT,
    au.created_at,
    up.display_name::TEXT,
    up.level,
    up.xp,
    up.role::TEXT,
    up.last_active
  FROM auth.users au
  LEFT JOIN user_profiles up ON au.id = up.id
  ORDER BY au.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_users_with_profiles() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_all_users_with_profiles() IS 'Returns all users with their profile information for admin dashboard';

-- ============================================
-- MIGRATION 2A: Critical RLS Policies for user_profiles.role
-- ============================================

-- Enable RLS on user_profiles if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can UPDATE their own profile EXCEPT the role column
DROP POLICY IF EXISTS "Users can update own profile except role" ON user_profiles;
CREATE POLICY "Users can update own profile except role" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM user_profiles WHERE id = auth.uid()) -- Role must remain unchanged
  );

-- Policy: Only service_role can modify user roles
-- Note: This policy will be automatically bypassed by service_role operations
DROP POLICY IF EXISTS "Only service role can modify roles" ON user_profiles;
CREATE POLICY "Only service role can modify roles" ON user_profiles
  FOR UPDATE
  USING (current_setting('role') = 'service_role')
  WITH CHECK (current_setting('role') = 'service_role');

-- Add comment
COMMENT ON TABLE user_profiles IS 'User profiles with RLS protecting role column from self-modification';

-- ============================================
-- MIGRATION 2B: Admin XP/Level Management Functions
-- ============================================

-- Function to set user XP
CREATE OR REPLACE FUNCTION admin_set_user_xp(
  p_user_id UUID,
  p_xp INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user XP
  UPDATE user_profiles
  SET xp = p_xp,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- Function to set user level
CREATE OR REPLACE FUNCTION admin_set_user_level(
  p_user_id UUID,
  p_level INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user level
  UPDATE user_profiles
  SET level = p_level,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- Function to set both XP and level
CREATE OR REPLACE FUNCTION admin_set_user_progress(
  p_user_id UUID,
  p_xp INTEGER,
  p_level INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update both XP and level
  UPDATE user_profiles
  SET xp = p_xp,
      level = p_level,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- IMPORTANT: These functions should ONLY be executable by admins
-- They are marked as SECURITY DEFINER and will run with elevated privileges
-- We add an internal role check to ensure only users with role='admin' can execute them

-- Update functions to include role checking
DROP FUNCTION IF EXISTS admin_set_user_xp(UUID, INTEGER);
CREATE OR REPLACE FUNCTION admin_set_user_xp(
  p_user_id UUID,
  p_xp INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Get the role of the calling user
  SELECT role INTO caller_role
  FROM user_profiles
  WHERE id = auth.uid();
  
  -- Only allow admins to execute (use IS DISTINCT FROM to handle NULL properly)
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Permission denied: User profile not found';
  END IF;
  
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Permission denied: Only admins can modify user XP';
  END IF;
  
  -- Update user XP
  UPDATE user_profiles
  SET xp = p_xp,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$;

DROP FUNCTION IF EXISTS admin_set_user_level(UUID, INTEGER);
CREATE OR REPLACE FUNCTION admin_set_user_level(
  p_user_id UUID,
  p_level INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Get the role of the calling user
  SELECT role INTO caller_role
  FROM user_profiles
  WHERE id = auth.uid();
  
  -- Only allow admins to execute (use IS DISTINCT FROM to handle NULL properly)
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Permission denied: User profile not found';
  END IF;
  
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Permission denied: Only admins can modify user level';
  END IF;
  
  -- Update user level
  UPDATE user_profiles
  SET level = p_level,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$;

DROP FUNCTION IF EXISTS admin_set_user_progress(UUID, INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION admin_set_user_progress(
  p_user_id UUID,
  p_xp INTEGER,
  p_level INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Get the role of the calling user
  SELECT role INTO caller_role
  FROM user_profiles
  WHERE id = auth.uid();
  
  -- Only allow admins to execute (use IS DISTINCT FROM to handle NULL properly)
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Permission denied: User profile not found';
  END IF;
  
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Permission denied: Only admins can modify user progress';
  END IF;
  
  -- Update both XP and level
  UPDATE user_profiles
  SET xp = p_xp,
      level = p_level,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permissions to authenticated users (functions check role internally)
GRANT EXECUTE ON FUNCTION admin_set_user_xp(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_set_user_level(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_set_user_progress(UUID, INTEGER, INTEGER) TO authenticated;

-- Add comments
COMMENT ON FUNCTION admin_set_user_xp(UUID, INTEGER) IS 'Allows admin to manually set user XP (role-checked internally)';
COMMENT ON FUNCTION admin_set_user_level(UUID, INTEGER) IS 'Allows admin to manually set user level (role-checked internally)';
COMMENT ON FUNCTION admin_set_user_progress(UUID, INTEGER, INTEGER) IS 'Allows admin to set both XP and level simultaneously (role-checked internally)';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Test the get_all_users_with_profiles function
SELECT * FROM get_all_users_with_profiles() LIMIT 5;

-- Verify functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_all_users_with_profiles',
    'admin_set_user_xp',
    'admin_set_user_level',
    'admin_set_user_progress'
  );
