-- Gaming Dronzz Authentication System RPC Functions
-- These functions are created by the migration but documented here for reference

-- ============================================================================
-- FUNCTION: ensure_user_profile
-- PURPOSE: Creates a user profile if it doesn't exist
-- CALLED BY: SupabaseService.ensureUserProfile()
-- ============================================================================

CREATE OR REPLACE FUNCTION ensure_user_profile(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user auth.users%ROWTYPE;
    existing_profile profiles%ROWTYPE;
    result JSON;
BEGIN
    -- Get the auth user details
    SELECT * INTO auth_user FROM auth.users WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found in auth.users'
        );
    END IF;
    
    -- Check if profile already exists
    SELECT * INTO existing_profile FROM profiles WHERE profiles.user_id = ensure_user_profile.user_id;
    
    IF FOUND THEN
        -- Profile exists, return success
        RETURN json_build_object(
            'success', true,
            'action', 'exists',
            'profile_completed', true,
            'error', null
        );
    ELSE
        -- Create new profile
        INSERT INTO profiles (user_id, email, full_name, avatar_url, role)
        VALUES (
            ensure_user_profile.user_id,
            auth_user.email,
            COALESCE(auth_user.raw_user_meta_data->>'full_name', auth_user.raw_user_meta_data->>'name'),
            auth_user.raw_user_meta_data->>'avatar_url',
            'user'
        );
        
        RETURN json_build_object(
            'success', true,
            'action', 'created',
            'profile_completed', true,
            'error', null
        );
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- ============================================================================
-- FUNCTION: handle_user_login
-- PURPOSE: Handles user login and ensures profile creation
-- CALLED BY: SupabaseService.handleUserLogin()
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_user_login(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user auth.users%ROWTYPE;
    existing_profile profiles%ROWTYPE;
    result JSON;
BEGIN
    -- Get the auth user details
    SELECT * INTO auth_user FROM auth.users WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found in auth.users'
        );
    END IF;
    
    -- Check if profile exists
    SELECT * INTO existing_profile FROM profiles WHERE profiles.user_id = handle_user_login.user_id;
    
    IF FOUND THEN
        -- Update last login and return existing profile info
        UPDATE profiles 
        SET updated_at = NOW()
        WHERE profiles.user_id = handle_user_login.user_id;
        
        RETURN json_build_object(
            'success', true,
            'action', 'updated',
            'profile_completed', true,
            'error', null
        );
    ELSE
        -- Create new profile
        INSERT INTO profiles (user_id, email, full_name, avatar_url, role)
        VALUES (
            handle_user_login.user_id,
            auth_user.email,
            COALESCE(auth_user.raw_user_meta_data->>'full_name', auth_user.raw_user_meta_data->>'name'),
            auth_user.raw_user_meta_data->>'avatar_url',
            'user'
        );
        
        RETURN json_build_object(
            'success', true,
            'action', 'created',
            'profile_completed', true,
            'error', null
        );
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- ============================================================================
-- FUNCTION: check_email_exists
-- PURPOSE: Check if email exists in auth.users table
-- CALLED BY: SupabaseService.checkEmailExists()
-- ============================================================================

CREATE OR REPLACE FUNCTION check_email_exists(email_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users WHERE email = email_input
    );
END;
$$;

-- ============================================================================
-- TRIGGER FUNCTION: handle_new_user
-- PURPOSE: Automatically create profile when user signs up
-- TRIGGERED BY: INSERT on auth.users
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO profiles (user_id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url',
        'user'
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;