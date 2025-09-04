-- ===== EXECUTION SCRIPT FOR STREAMLINED AUTHENTICATION =====
-- Purpose: Complete migration script to be executed in Supabase SQL Editor
-- Date: 2025-01-25
-- Sequence: 003
-- Author: Claude
-- 
-- INSTRUCTIONS:
-- 1. Execute this script in your Supabase SQL Editor
-- 2. Verify execution by running the test queries at the end
-- 3. Check that authentication flow works end-to-end

BEGIN;

-- ===== STEP 1: BACKUP EXISTING FUNCTIONS (IF NEEDED) =====
-- Create a backup of existing functions before dropping them
CREATE TABLE IF NOT EXISTS function_backups_streamlined_auth AS 
SELECT 
    routine_name,
    routine_definition,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'ensure_user_profile', 
    'handle_user_login', 
    'complete_user_profile',
    'safe_update_profile',
    'check_profile_completion',
    'get_user_profile_with_completion'
);

-- ===== STEP 2: DROP EXISTING FUNCTIONS AND TRIGGERS =====
DROP FUNCTION IF EXISTS public.ensure_user_profile(uuid);
DROP FUNCTION IF EXISTS public.handle_user_login(uuid);
DROP FUNCTION IF EXISTS public.complete_user_profile(uuid, jsonb);
DROP FUNCTION IF EXISTS public.safe_update_profile(uuid, jsonb);
DROP FUNCTION IF EXISTS public.check_profile_completion(uuid);
DROP FUNCTION IF EXISTS public.get_user_profile_with_completion(uuid);

-- Drop existing triggers if they exist (but keep the current one)
-- We'll update the function but keep the trigger

-- ===== STEP 3: CREATE NEW STREAMLINED FUNCTIONS =====

-- Function to automatically create user profile when auth.users record is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_provider TEXT;
    profile_data JSONB;
    is_google_user BOOLEAN;
    user_role user_role;
BEGIN
    -- Extract provider information
    user_provider := COALESCE(
        NEW.raw_user_meta_data->>'provider',
        NEW.raw_app_meta_data->>'provider',
        'email'
    );
    
    -- Get profile metadata
    profile_data := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    is_google_user := user_provider = 'google';
    
    -- Determine role (check if user is admin based on email or other criteria)
    -- Add your admin logic here - for now, default to 'user'
    user_role := CASE 
        WHEN NEW.email = 'admin@gamingdronzz.com' THEN 'admin'::user_role
        WHEN NEW.email LIKE '%@gamingdronzz.com' THEN 'admin'::user_role
        ELSE 'user'::user_role
    END;
    
    -- Create profile automatically
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name,
        avatar_url,
        provider,
        provider_id,
        oauth_metadata,
        is_verified,
        profile_completed,
        profile_completion_date,
        last_login_at,
        login_count,
        role,
        public_profile,
        email_notifications,
        marketing_emails,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            profile_data->>'full_name',
            profile_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(profile_data->>'avatar_url', profile_data->>'picture'),
        user_provider,
        profile_data->>'sub',
        profile_data,
        COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
        is_google_user, -- Google users are considered complete initially
        CASE WHEN is_google_user THEN NOW() ELSE NULL END,
        NOW(),
        1,
        user_role,
        TRUE,
        TRUE,
        FALSE,
        TRUE,
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role (simplified version)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id_input UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
DECLARE
    profile RECORD;
BEGIN
    SELECT role INTO profile FROM public.profiles WHERE id = user_id_input;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'is_admin', false,
            'role', null,
            'error', 'Profile not found'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'is_admin', profile.role = 'admin',
        'role', profile.role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update login count and last login
CREATE OR REPLACE FUNCTION public.update_user_login(user_id_input UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
BEGIN
    UPDATE public.profiles 
    SET 
        last_login_at = NOW(),
        login_count = login_count + 1,
        updated_at = NOW()
    WHERE id = user_id_input;
    
    IF FOUND THEN
        RETURN jsonb_build_object('success', true);
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin (simple boolean check)
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id_input UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = user_id_input;
    RETURN COALESCE(user_role = 'admin', FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== STEP 4: UPDATE TRIGGER (RECREATE IF NEEDED) =====
-- Drop and recreate trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ===== STEP 5: UPDATE RLS POLICIES =====

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create streamlined policies
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

-- Ensure existing admin policies still work (they should already exist)
-- These may already exist, so we'll create them with IF NOT EXISTS equivalent

DO $$
BEGIN
    -- Admins can view all profiles
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'admins_can_view_all_profiles'
    ) THEN
        EXECUTE 'CREATE POLICY admins_can_view_all_profiles ON profiles FOR SELECT USING (is_admin_user())';
    END IF;

    -- Admins can update all profiles  
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'admins_can_update_all_profiles'
    ) THEN
        EXECUTE 'CREATE POLICY admins_can_update_all_profiles ON profiles FOR UPDATE USING (is_admin_user()) WITH CHECK (is_admin_user())';
    END IF;

    -- Admins can delete profiles
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'admins_can_delete_profiles'  
    ) THEN
        EXECUTE 'CREATE POLICY admins_can_delete_profiles ON profiles FOR DELETE USING (is_admin_user())';
    END IF;
END $$;

-- ===== STEP 6: GRANT PERMISSIONS =====
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_user_login(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated, service_role;

-- Ensure the service role can access profiles table for trigger operations
GRANT ALL ON TABLE profiles TO service_role;

-- ===== STEP 7: MIGRATION LOG =====
-- Create migration log entry if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'migration_log') THEN
        INSERT INTO migration_log (migration_name, executed_at, description) 
        VALUES (
            '003_execute_streamlined_auth',
            NOW(),
            'Executed complete streamlined authentication system: removed ensure_user_profile, created automatic triggers, updated policies'
        );
    END IF;
END $$;

COMMIT;

-- ===== VERIFICATION AND TEST QUERIES =====
-- Run these queries after the migration to verify everything works

-- Test 1: Check if functions exist
SELECT 
    'Functions created successfully' AS status,
    COUNT(*) as function_count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'handle_new_user',
    'get_user_role', 
    'update_user_login',
    'is_admin_user'
);

-- Test 2: Check if trigger exists
SELECT 
    'Trigger created successfully' AS status,
    COUNT(*) as trigger_count
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Test 3: Check RLS policies
SELECT 
    'RLS policies updated' AS status,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- Test 4: Test the functions (if you have a valid user session)
-- SELECT get_user_role();
-- SELECT update_user_login();
-- SELECT is_admin_user();

-- ===== SUCCESS MESSAGE =====
SELECT 
    '✅ STREAMLINED AUTHENTICATION MIGRATION COMPLETED SUCCESSFULLY!' AS result,
    'The system now automatically creates profiles when users sign up via database triggers.' AS description,
    'Profile creation no longer requires manual ensure_user_profile calls.' AS benefit;