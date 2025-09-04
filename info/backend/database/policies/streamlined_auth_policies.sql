-- ===== STREAMLINED AUTHENTICATION POLICIES =====
-- Purpose: Update RLS policies to work with streamlined authentication system
-- Date: 2025-01-25
-- Author: Claude

BEGIN;

-- ===== UPDATE PROFILE ACCESS POLICIES =====

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- ===== PROFILES TABLE POLICIES =====

-- Users can view their own profile
CREATE POLICY "users_can_view_own_profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_can_update_own_profile" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Service role can insert profiles (for trigger-based creation)
CREATE POLICY "service_role_can_insert_profiles" ON profiles
    FOR INSERT WITH CHECK (true);

-- Admins can view all profiles
CREATE POLICY "admins_can_view_all_profiles" ON profiles
    FOR SELECT USING (is_admin_user());

-- Admins can update all profiles
CREATE POLICY "admins_can_update_all_profiles" ON profiles
    FOR UPDATE USING (is_admin_user())
    WITH CHECK (is_admin_user());

-- Admins can delete profiles
CREATE POLICY "admins_can_delete_profiles" ON profiles
    FOR DELETE USING (is_admin_user());

-- ===== ENSURE PROPER FUNCTION ACCESS =====

-- Grant execute permissions for the new functions
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_user_login(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Ensure the service role can access profiles table for trigger operations
GRANT ALL ON TABLE profiles TO service_role;

COMMIT;

-- ===== VERIFICATION QUERIES =====
-- Run these after applying the policies to verify they work correctly

/*
-- Test queries to verify policies work:

-- 1. Check if authenticated user can view their own profile
-- SELECT * FROM profiles WHERE id = auth.uid();

-- 2. Check if admin can view all profiles
-- SELECT * FROM profiles; -- Should work for admin, fail for regular user

-- 3. Test the new functions
-- SELECT is_admin_user();
-- SELECT update_user_login();
-- SELECT get_user_role();
*/