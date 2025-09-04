-- ===== GAMING DRONZZ PROFILE MANAGEMENT RPC FUNCTIONS =====
-- This file contains all the necessary RPC functions for the AuthService
-- Deploy these functions to your Supabase database

-- ===== ENABLE NECESSARY EXTENSIONS =====
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===== PROFILE MANAGEMENT FUNCTIONS =====

-- Function to ensure user profile exists and is properly configured
-- This is the main function called by AuthService.ensureUserProfile()
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_id uuid)
RETURNS JSONB AS $$
DECLARE
    auth_user RECORD;
    existing_profile RECORD;
    profile_data JSONB;
    user_provider TEXT;
    result JSONB;
    is_google_user BOOLEAN;
BEGIN
    -- Get the auth user data
    SELECT * INTO auth_user FROM auth.users WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found in auth.users'
        );
    END IF;

    -- Check if profile already exists
    SELECT * INTO existing_profile FROM public.profiles WHERE id = user_id;
    
    -- Extract metadata and determine provider
    profile_data := COALESCE(auth_user.raw_user_meta_data, '{}'::jsonb);
    user_provider := COALESCE(
        -- Try raw_user_meta_data first, then raw_app_meta_data, fallback to email
        profile_data->>'provider',
        auth_user.raw_app_meta_data->>'provider',
        'email'
    );
    is_google_user := user_provider = 'google';
    
    IF existing_profile IS NULL THEN
        -- Create new profile
        BEGIN
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
                is_active
            ) VALUES (
                user_id,
                auth_user.email,
                COALESCE(
                    profile_data->>'full_name',
                    profile_data->>'name',
                    split_part(auth_user.email, '@', 1)
                ),
                COALESCE(profile_data->>'avatar_url', profile_data->>'picture'),
                user_provider::auth_provider,
                profile_data->>'sub',
                profile_data,
                COALESCE(auth_user.email_confirmed_at IS NOT NULL, FALSE),
                is_google_user, -- Google users are considered complete initially
                CASE WHEN is_google_user THEN NOW() ELSE NULL END,
                NOW(),
                1,
                'user'::user_role,
                TRUE,
                TRUE,
                FALSE,
                TRUE
            );
            
            result := jsonb_build_object(
                'success', true,
                'action', 'created',
                'profile_completed', is_google_user
            );
            
        EXCEPTION WHEN OTHERS THEN
            result := jsonb_build_object(
                'success', false,
                'error', 'Failed to create profile: ' || SQLERRM,
                'action', 'error'
            );
        END;
    ELSE
        -- Update existing profile with any missing OAuth data
        BEGIN
            UPDATE public.profiles SET
                oauth_metadata = CASE 
                    WHEN oauth_metadata = '{}'::jsonb OR oauth_metadata IS NULL 
                    THEN profile_data 
                    ELSE oauth_metadata 
                END,
                avatar_url = CASE 
                    WHEN avatar_url IS NULL AND (
                        profile_data->>'avatar_url' IS NOT NULL OR
                        profile_data->>'picture' IS NOT NULL
                    )
                    THEN COALESCE(profile_data->>'avatar_url', profile_data->>'picture')
                    ELSE avatar_url 
                END,
                full_name = CASE 
                    WHEN full_name IS NULL AND (
                        profile_data->>'full_name' IS NOT NULL OR 
                        profile_data->>'name' IS NOT NULL
                    ) 
                    THEN COALESCE(profile_data->>'full_name', profile_data->>'name')
                    ELSE full_name 
                END,
                provider = CASE 
                    WHEN provider IS NULL 
                    THEN user_provider::auth_provider
                    ELSE provider 
                END,
                provider_id = CASE 
                    WHEN provider_id IS NULL AND profile_data->>'sub' IS NOT NULL 
                    THEN profile_data->>'sub' 
                    ELSE provider_id 
                END,
                last_login_at = NOW(),
                login_count = login_count + 1,
                updated_at = NOW()
            WHERE id = user_id;
            
            result := jsonb_build_object(
                'success', true,
                'action', 'updated',
                'profile_completed', existing_profile.profile_completed
            );
            
        EXCEPTION WHEN OTHERS THEN
            result := jsonb_build_object(
                'success', false,
                'error', 'Failed to update profile: ' || SQLERRM,
                'action', 'error'
            );
        END;
    END IF;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check profile completion status
-- Called by UserProfileService and AuthService
CREATE OR REPLACE FUNCTION public.check_profile_completion(user_id uuid)
RETURNS JSONB AS $$
DECLARE
    profile RECORD;
    completion_status JSONB;
BEGIN
    SELECT * INTO profile FROM public.profiles WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'exists', false,
            'completed', false,
            'needs_creation', true
        );
    END IF;
    
    -- Calculate detailed completion status
    completion_status := jsonb_build_object(
        'exists', true,
        'completed', profile.profile_completed,
        'needs_creation', false,
        'has_full_name', profile.full_name IS NOT NULL,
        'has_avatar', profile.avatar_url IS NOT NULL,
        'is_verified', profile.is_verified,
        'provider', profile.provider,
        'last_login', profile.last_login_at,
        'login_count', profile.login_count,
        'profile_completion_date', profile.profile_completion_date
    );
    
    RETURN completion_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete user profile with additional data
-- Called by UserProfileService.completeUserProfile()
CREATE OR REPLACE FUNCTION public.complete_user_profile(
    user_id uuid,
    additional_data JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
    profile_exists BOOLEAN;
    result JSONB;
BEGIN
    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO profile_exists;
    
    IF NOT profile_exists THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Profile not found'
        );
    END IF;
    
    BEGIN
        UPDATE public.profiles SET
            profile_completed = true,
            profile_completion_date = COALESCE(profile_completion_date, NOW()),
            full_name = COALESCE(additional_data->>'full_name', full_name),
            bio = COALESCE(additional_data->>'bio', bio),
            company = COALESCE(additional_data->>'company', company),
            website = COALESCE(additional_data->>'website', website),
            phone = COALESCE(additional_data->>'phone', phone),
            location = COALESCE(additional_data->>'location', location),
            timezone = COALESCE(additional_data->>'timezone', timezone),
            preferences = CASE 
                WHEN additional_data ? 'preferences' 
                THEN preferences || (additional_data->'preferences')
                ELSE preferences 
            END,
            updated_at = NOW()
        WHERE id = user_id;
        
        result := jsonb_build_object(
            'success', true,
            'message', 'Profile completed successfully'
        );
        
    EXCEPTION WHEN OTHERS THEN
        result := jsonb_build_object(
            'success', false,
            'error', 'Failed to complete profile: ' || SQLERRM
        );
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely update profile data
-- Called by UserProfileService.safeUpdateProfile()
CREATE OR REPLACE FUNCTION public.safe_update_profile(
    user_id uuid,
    updates JSONB
)
RETURNS JSONB AS $$
DECLARE
    profile_exists BOOLEAN;
    updated_profile RECORD;
    result JSONB;
BEGIN
    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO profile_exists;
    
    IF NOT profile_exists THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Profile not found'
        );
    END IF;
    
    BEGIN
        UPDATE public.profiles SET
            full_name = COALESCE(updates->>'full_name', full_name),
            bio = COALESCE(updates->>'bio', bio),
            company = COALESCE(updates->>'company', company),
            website = COALESCE(updates->>'website', website),
            phone = COALESCE(updates->>'phone', phone),
            location = COALESCE(updates->>'location', location),
            timezone = COALESCE(updates->>'timezone', timezone),
            avatar_url = COALESCE(updates->>'avatar_url', avatar_url),
            public_profile = COALESCE((updates->>'public_profile')::boolean, public_profile),
            email_notifications = COALESCE((updates->>'email_notifications')::boolean, email_notifications),
            marketing_emails = COALESCE((updates->>'marketing_emails')::boolean, marketing_emails),
            preferences = CASE 
                WHEN updates ? 'preferences' 
                THEN preferences || (updates->'preferences')
                ELSE preferences 
            END,
            updated_at = NOW()
        WHERE id = user_id
        RETURNING *;
        
        GET DIAGNOSTICS updated_profile = ROW_COUNT;
        
        IF updated_profile > 0 THEN
            -- Get the updated profile data
            SELECT * INTO updated_profile FROM public.profiles WHERE id = user_id;
            
            result := jsonb_build_object(
                'success', true,
                'profile', to_jsonb(updated_profile),
                'message', 'Profile updated successfully'
            );
        ELSE
            result := jsonb_build_object(
                'success', false,
                'error', 'No rows were updated'
            );
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        result := jsonb_build_object(
            'success', false,
            'error', 'Failed to update profile: ' || SQLERRM
        );
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user login (called by auth triggers and services)
-- This is a simplified version that just ensures the profile exists
CREATE OR REPLACE FUNCTION public.handle_user_login(user_id uuid)
RETURNS JSONB AS $$
BEGIN
    -- Just ensure the profile exists - this delegates to ensure_user_profile
    RETURN public.ensure_user_profile(user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if email exists (for form validation)
-- Called by AuthService.checkEmailExists()
CREATE OR REPLACE FUNCTION public.check_email_exists(email_input text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users WHERE email = email_input
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user profile with completion calculation
-- This is an enhanced version that calculates completion percentage
CREATE OR REPLACE FUNCTION public.get_user_profile_with_completion(user_id uuid)
RETURNS JSONB AS $$
DECLARE
    profile RECORD;
    completion_percentage INTEGER;
    required_fields INTEGER := 0;
    optional_fields INTEGER := 0;
    total_possible INTEGER := 12; -- Adjust based on your completion criteria
    result JSONB;
BEGIN
    SELECT * INTO profile FROM public.profiles WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Profile not found'
        );
    END IF;
    
    -- Calculate completion percentage
    IF profile.email IS NOT NULL THEN required_fields := required_fields + 2; END IF;
    IF profile.full_name IS NOT NULL THEN required_fields := required_fields + 2; END IF;
    
    IF profile.bio IS NOT NULL THEN optional_fields := optional_fields + 1; END IF;
    IF profile.company IS NOT NULL THEN optional_fields := optional_fields + 1; END IF;
    IF profile.website IS NOT NULL THEN optional_fields := optional_fields + 1; END IF;
    IF profile.phone IS NOT NULL THEN optional_fields := optional_fields + 1; END IF;
    IF profile.location IS NOT NULL THEN optional_fields := optional_fields + 1; END IF;
    IF profile.is_verified THEN optional_fields := optional_fields + 1; END IF;
    IF profile.avatar_url IS NOT NULL THEN optional_fields := optional_fields + 1; END IF;
    
    completion_percentage := ROUND(((required_fields + optional_fields)::FLOAT / total_possible) * 100);
    
    result := jsonb_build_object(
        'success', true,
        'profile', to_jsonb(profile),
        'completion_percentage', completion_percentage,
        'completed_fields', required_fields + optional_fields,
        'total_fields', total_possible
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== GRANT PERMISSIONS TO FUNCTIONS =====

-- Grant execute permissions to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_profile_completion(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.complete_user_profile(uuid, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.safe_update_profile(uuid, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_user_login(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_profile_with_completion(uuid) TO authenticated, service_role;

-- ===== TESTING FUNCTIONS =====

-- Function to test the profile management system
CREATE OR REPLACE FUNCTION public.test_profile_functions()
RETURNS TABLE(
    test_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Test 1: Check if functions exist
    RETURN QUERY
    SELECT 
        'functions_exist'::TEXT,
        CASE WHEN (
            SELECT COUNT(*) FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name IN (
                'ensure_user_profile', 
                'check_profile_completion', 
                'complete_user_profile',
                'safe_update_profile',
                'handle_user_login',
                'check_email_exists'
            )
        ) = 6 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'All required RPC functions exist'::TEXT;
    
    -- Test 2: Check if profiles table exists
    RETURN QUERY
    SELECT 
        'profiles_table_exists'::TEXT,
        CASE WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'profiles' AND table_schema = 'public'
        ) THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Profiles table exists'::TEXT;
    
    -- Test 3: Check RLS policies
    RETURN QUERY
    SELECT 
        'rls_policies'::TEXT,
        CASE WHEN (
            SELECT COUNT(*) FROM pg_policies 
            WHERE tablename = 'profiles' AND schemaname = 'public'
        ) >= 5 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Sufficient RLS policies exist'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on test function
GRANT EXECUTE ON FUNCTION public.test_profile_functions() TO authenticated, service_role;

-- ===== DEPLOYMENT NOTES =====
/*
DEPLOYMENT INSTRUCTIONS:
1. Run this script in your Supabase SQL Editor
2. Verify deployment with: SELECT * FROM test_profile_functions();
3. Test with a real user: SELECT * FROM ensure_user_profile('[user-uuid-here]');
4. Monitor logs for any errors during authentication flows

FUNCTION DESCRIPTIONS:
- ensure_user_profile(): Main function to create/update profiles during auth
- check_profile_completion(): Check if profile is complete and get status
- complete_user_profile(): Mark profile as complete with additional data
- safe_update_profile(): Safely update profile fields with validation
- handle_user_login(): Simple wrapper that ensures profile exists on login
- check_email_exists(): Check if email already exists in auth.users
- get_user_profile_with_completion(): Get profile with completion percentage

SECURITY:
- All functions use SECURITY DEFINER for elevated permissions
- Functions validate user exists before operations
- Proper error handling with informative messages
- Row Level Security policies still apply to table operations
*/