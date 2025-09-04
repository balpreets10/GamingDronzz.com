-- Fix Authentication Metadata Issue - Deploy this to Supabase SQL Editor
-- Date: 2025-09-03
-- Issue: ensure_user_profile function references non-existent metadata fields

-- Drop and recreate the ensure_user_profile function with only available auth.users fields
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_id uuid)
RETURNS JSONB AS $$
DECLARE
    auth_user RECORD;
    existing_profile RECORD;
    user_provider TEXT;
    result JSONB;
    is_google_user BOOLEAN;
    user_display_name TEXT;
BEGIN
    -- Get the auth user data (only available fields: id, email, phone, created_at, updated_at, last_sign_in_at, etc.)
    SELECT id, email, phone, created_at, updated_at, last_sign_in_at 
    INTO auth_user FROM auth.users WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found in auth.users'
        );
    END IF;

    -- Check if profile already exists
    SELECT * INTO existing_profile FROM public.profiles WHERE id = user_id;
    
    -- Determine provider type from email domain (fallback method)
    user_provider := CASE 
        WHEN auth_user.email LIKE '%@gmail.com' THEN 'google'
        ELSE 'email'
    END;
    is_google_user := user_provider = 'google';
    
    -- Generate display name from email
    user_display_name := split_part(auth_user.email, '@', 1);
    
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
                user_display_name,
                NULL, -- No avatar data available from basic auth fields
                user_provider::auth_provider,
                auth_user.email, -- Use email as provider_id fallback
                '{}'::jsonb, -- Empty metadata since no metadata available
                FALSE, -- Cannot determine verification status from basic fields
                is_google_user, -- Google users are considered complete initially
                CASE WHEN is_google_user THEN NOW() ELSE NULL END,
                COALESCE(auth_user.last_sign_in_at, NOW()),
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
        -- Update existing profile with basic auth data
        BEGIN
            UPDATE public.profiles SET
                provider = CASE 
                    WHEN provider IS NULL 
                    THEN user_provider::auth_provider
                    ELSE provider 
                END,
                provider_id = CASE 
                    WHEN provider_id IS NULL 
                    THEN auth_user.email 
                    ELSE provider_id 
                END,
                last_login_at = COALESCE(auth_user.last_sign_in_at, NOW()),
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(uuid) TO authenticated, service_role;

-- Test the function (optional - you can run this with a real user ID)
-- SELECT * FROM public.ensure_user_profile('[your-user-uuid-here]');

-- Record this fix in migrations table (if migrations table exists)
-- INSERT INTO public.migrations (id, name, description, version) VALUES 
-- ('002_fix_auth_metadata', 'Fix Authentication Metadata Issue', 'Fixed ensure_user_profile function to use correct metadata fields', extract(epoch from now()));