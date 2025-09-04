-- ===== ROLLBACK FOR STREAMLINED AUTHENTICATION SYSTEM =====
-- Rollback: rollback_002_streamlined_auth_system.sql
-- Purpose: Restore original ensure_user_profile function and remove automatic triggers
-- Date: 2025-01-25
-- Reverts: 002_streamlined_auth_system.sql

BEGIN;

-- ===== DROP NEW TRIGGER AND FUNCTION =====

-- Drop the new trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop simplified functions
DROP FUNCTION IF EXISTS public.get_user_role(UUID);
DROP FUNCTION IF EXISTS public.update_user_login(UUID);
DROP FUNCTION IF EXISTS public.is_admin_user(UUID);

-- ===== RESTORE ORIGINAL FUNCTIONS =====

-- Restore the original ensure_user_profile function from the original RPC functions file
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
                is_google_user,
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
        -- Update existing profile
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

-- Restore other original functions
CREATE OR REPLACE FUNCTION public.handle_user_login(user_id uuid)
RETURNS JSONB AS $$
BEGIN
    RETURN public.ensure_user_profile(user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== RESTORE PERMISSIONS =====

GRANT EXECUTE ON FUNCTION public.ensure_user_profile(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_user_login(uuid) TO authenticated, service_role;

-- ===== ROLLBACK LOG =====

-- Update rollback log
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'migration_log') THEN
        INSERT INTO migration_log (migration_name, rollback_executed_at, description) 
        VALUES (
            '002_streamlined_auth_system',
            NOW(),
            'ROLLBACK: Restored original ensure_user_profile function and removed automatic triggers'
        );
    END IF;
END $$;

COMMIT;