-- ===== STREAMLINED AUTHENTICATION SYSTEM MIGRATION =====
-- Migration: 002_streamlined_auth_system.sql
-- Purpose: Remove ensure_user_profile function and create automatic profile creation
-- Date: 2025-01-25
-- Author: Claude

BEGIN;

-- ===== DROP EXISTING FUNCTIONS AND TRIGGERS =====

-- Drop existing functions that will be replaced
DROP FUNCTION IF EXISTS public.ensure_user_profile(uuid);
DROP FUNCTION IF EXISTS public.handle_user_login(uuid);
DROP FUNCTION IF EXISTS public.complete_user_profile(uuid, jsonb);
DROP FUNCTION IF EXISTS public.safe_update_profile(uuid, jsonb);
DROP FUNCTION IF EXISTS public.check_profile_completion(uuid);
DROP FUNCTION IF EXISTS public.get_user_profile_with_completion(uuid);

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ===== CREATE NEW AUTOMATIC PROFILE CREATION SYSTEM =====

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
    -- For now, default to 'user' - you can add admin logic here
    user_role := 'user'::user_role;
    
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
        user_provider::auth_provider,
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

-- ===== CREATE TRIGGER FOR AUTOMATIC PROFILE CREATION =====

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ===== CREATE SIMPLIFIED HELPER FUNCTIONS =====

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

-- ===== GRANT PERMISSIONS =====

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_user_login(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated, service_role;

-- ===== MIGRATION LOG =====

-- Create migration log entry if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'migration_log') THEN
        INSERT INTO migration_log (migration_name, executed_at, description) 
        VALUES (
            '002_streamlined_auth_system',
            NOW(),
            'Removed ensure_user_profile function and created automatic profile creation system with database triggers'
        );
    END IF;
END $$;

COMMIT;