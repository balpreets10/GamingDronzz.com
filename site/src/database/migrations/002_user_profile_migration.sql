-- Migration 002: User Profile System Enhancement and Data Migration
-- This migration enhances the existing profile system and migrates data

-- ===== STEP 1: Add missing columns to existing profiles table (if running on existing schema) ===== --
-- Note: These will fail gracefully if columns already exist

-- Add new columns for enhanced profile system
DO $$ 
BEGIN
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;

    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE public.profiles ADD COLUMN location TEXT;
    END IF;

    -- Add timezone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'timezone') THEN
        ALTER TABLE public.profiles ADD COLUMN timezone TEXT;
    END IF;

    -- Add provider column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'provider') THEN
        ALTER TABLE public.profiles ADD COLUMN provider TEXT DEFAULT 'email';
    END IF;

    -- Add provider_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'provider_id') THEN
        ALTER TABLE public.profiles ADD COLUMN provider_id TEXT;
    END IF;

    -- Add profile completion tracking columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_completed') THEN
        ALTER TABLE public.profiles ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_completion_date') THEN
        ALTER TABLE public.profiles ADD COLUMN profile_completion_date TIMESTAMPTZ;
    END IF;

    -- Add OAuth metadata column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'oauth_metadata') THEN
        ALTER TABLE public.profiles ADD COLUMN oauth_metadata JSONB DEFAULT '{}';
    END IF;

    -- Add preferences column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferences') THEN
        ALTER TABLE public.profiles ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;

    -- Add visibility and notification columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'public_profile') THEN
        ALTER TABLE public.profiles ADD COLUMN public_profile BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email_notifications') THEN
        ALTER TABLE public.profiles ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'marketing_emails') THEN
        ALTER TABLE public.profiles ADD COLUMN marketing_emails BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add status columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
        ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add tracking columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_login_at') THEN
        ALTER TABLE public.profiles ADD COLUMN last_login_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'login_count') THEN
        ALTER TABLE public.profiles ADD COLUMN login_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Make email NOT NULL if it isn't already
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'email' 
        AND is_nullable = 'YES'
    ) THEN
        -- First, update any NULL emails with a placeholder
        UPDATE public.profiles 
        SET email = 'unknown@example.com' 
        WHERE email IS NULL;
        
        -- Then make the column NOT NULL
        ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;
    END IF;
END $$;

-- ===== STEP 2: Create helper function to find users without profiles ===== --
CREATE OR REPLACE FUNCTION public.get_users_without_profiles()
RETURNS TABLE(user_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT au.id
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL;
END;
$$ LANGUAGE plpgsql security definer;

-- ===== STEP 3: Create migration function to populate missing profiles ===== --
CREATE OR REPLACE FUNCTION public.migrate_existing_users()
RETURNS JSONB AS $$
DECLARE
    user_record RECORD;
    profile_data JSONB;
    user_provider TEXT;
    created_count INTEGER := 0;
    error_count INTEGER := 0;
    total_count INTEGER := 0;
    result JSONB;
BEGIN
    -- Count total users without profiles
    SELECT COUNT(*) INTO total_count FROM public.get_users_without_profiles();
    
    IF total_count = 0 THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'No users found without profiles',
            'total_users', 0,
            'profiles_created', 0,
            'errors', 0
        );
    END IF;

    -- Process each user without a profile
    FOR user_record IN 
        SELECT au.id, au.email, au.raw_user_meta_data, au.app_metadata, au.email_confirmed_at, au.created_at
        FROM auth.users au
        LEFT JOIN public.profiles p ON au.id = p.id
        WHERE p.id IS NULL
    LOOP
        BEGIN
            -- Extract profile data
            profile_data := COALESCE(user_record.raw_user_meta_data, '{}'::jsonb);
            user_provider := COALESCE(user_record.app_metadata->>'provider', 'email');
            
            -- Create profile for this user
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
                created_at
            ) VALUES (
                user_record.id,
                user_record.email,
                COALESCE(
                    profile_data->>'full_name',
                    profile_data->>'name',
                    split_part(user_record.email, '@', 1)
                ),
                profile_data->>'avatar_url',
                user_provider,
                profile_data->>'sub',
                profile_data,
                COALESCE(user_record.email_confirmed_at IS NOT NULL, FALSE),
                CASE 
                    WHEN user_provider = 'google' THEN TRUE
                    ELSE FALSE
                END,
                CASE 
                    WHEN user_provider = 'google' THEN user_record.created_at
                    ELSE NULL
                END,
                user_record.created_at,  -- Set last_login to creation time
                1,                       -- Initial login count
                user_record.created_at   -- Use original creation time
            );
            
            created_count := created_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            -- Log the error but continue with next user
            RAISE WARNING 'Failed to create profile for user %: %', user_record.id, SQLERRM;
        END;
    END LOOP;

    result := jsonb_build_object(
        'success', true,
        'message', format('Migration completed: %s profiles created, %s errors', created_count, error_count),
        'total_users', total_count,
        'profiles_created', created_count,
        'errors', error_count
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql security definer;

-- ===== STEP 4: Create function to update existing profiles with missing data ===== --
CREATE OR REPLACE FUNCTION public.update_existing_profiles()
RETURNS JSONB AS $$
DECLARE
    profile_record RECORD;
    auth_record RECORD;
    profile_data JSONB;
    user_provider TEXT;
    updated_count INTEGER := 0;
    error_count INTEGER := 0;
    total_count INTEGER := 0;
    result JSONB;
BEGIN
    -- Count profiles that might need updates
    SELECT COUNT(*) INTO total_count 
    FROM public.profiles p
    WHERE p.oauth_metadata = '{}'::jsonb 
       OR p.oauth_metadata IS NULL 
       OR p.provider IS NULL;
    
    IF total_count = 0 THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'No profiles found that need updating',
            'total_profiles', 0,
            'profiles_updated', 0,
            'errors', 0
        );
    END IF;

    -- Process each profile that needs updating
    FOR profile_record IN 
        SELECT p.*
        FROM public.profiles p
        WHERE p.oauth_metadata = '{}'::jsonb 
           OR p.oauth_metadata IS NULL 
           OR p.provider IS NULL
    LOOP
        BEGIN
            -- Get corresponding auth user data
            SELECT * INTO auth_record 
            FROM auth.users 
            WHERE id = profile_record.id;
            
            IF FOUND THEN
                -- Extract data from auth user
                profile_data := COALESCE(auth_record.raw_user_meta_data, '{}'::jsonb);
                user_provider := COALESCE(auth_record.app_metadata->>'provider', 'email');
                
                -- Update the profile with missing data
                UPDATE public.profiles SET
                    oauth_metadata = CASE 
                        WHEN oauth_metadata = '{}'::jsonb OR oauth_metadata IS NULL 
                        THEN profile_data 
                        ELSE oauth_metadata 
                    END,
                    avatar_url = CASE 
                        WHEN avatar_url IS NULL AND profile_data->>'avatar_url' IS NOT NULL 
                        THEN profile_data->>'avatar_url' 
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
                        THEN user_provider 
                        ELSE provider 
                    END,
                    provider_id = CASE 
                        WHEN provider_id IS NULL AND profile_data->>'sub' IS NOT NULL 
                        THEN profile_data->>'sub' 
                        ELSE provider_id 
                    END,
                    is_verified = CASE 
                        WHEN NOT is_verified AND auth_record.email_confirmed_at IS NOT NULL
                        THEN TRUE
                        ELSE is_verified
                    END,
                    profile_completed = CASE 
                        WHEN NOT profile_completed AND user_provider = 'google'
                        THEN TRUE
                        ELSE profile_completed
                    END,
                    profile_completion_date = CASE 
                        WHEN profile_completion_date IS NULL AND user_provider = 'google'
                        THEN auth_record.created_at
                        ELSE profile_completion_date
                    END,
                    updated_at = NOW()
                WHERE id = profile_record.id;
                
                updated_count := updated_count + 1;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            RAISE WARNING 'Failed to update profile for user %: %', profile_record.id, SQLERRM;
        END;
    END LOOP;

    result := jsonb_build_object(
        'success', true,
        'message', format('Update completed: %s profiles updated, %s errors', updated_count, error_count),
        'total_profiles', total_count,
        'profiles_updated', updated_count,
        'errors', error_count
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql security definer;

-- ===== STEP 5: Add indexes for the new columns ===== --
DO $$
BEGIN
    -- Create indexes for performance (only if they don't exist)
    
    -- Provider index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_provider') THEN
        CREATE INDEX idx_profiles_provider ON public.profiles(provider);
    END IF;

    -- Profile completion index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_completed') THEN
        CREATE INDEX idx_profiles_completed ON public.profiles(profile_completed) WHERE profile_completed = FALSE;
    END IF;

    -- Active users index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_active') THEN
        CREATE INDEX idx_profiles_active ON public.profiles(is_active) WHERE is_active = TRUE;
    END IF;

    -- Last login index for analytics
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_last_login') THEN
        CREATE INDEX idx_profiles_last_login ON public.profiles(last_login_at DESC);
    END IF;

    -- Email index for lookups
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_email') THEN
        CREATE INDEX idx_profiles_email ON public.profiles(email);
    END IF;

END $$;

-- ===== STEP 6: Update RLS policies if needed ===== --
-- Note: The RLS policies should already exist from the main schema

-- ===== MIGRATION EXECUTION INSTRUCTIONS ===== --
/*
To execute this migration:

1. Run this migration script in your Supabase SQL Editor
2. Execute the migration functions:

-- Check how many users need profiles:
SELECT * FROM public.get_users_without_profiles();

-- Migrate users without profiles:
SELECT public.migrate_existing_users();

-- Update existing profiles with missing data:
SELECT public.update_existing_profiles();

3. Verify the migration results:
SELECT 
    COUNT(*) as total_profiles,
    COUNT(*) FILTER (WHERE profile_completed = true) as completed_profiles,
    COUNT(*) FILTER (WHERE provider = 'google') as google_users,
    COUNT(*) FILTER (WHERE provider = 'email') as email_users,
    COUNT(*) FILTER (WHERE is_verified = true) as verified_users
FROM public.profiles;

4. Clean up if desired (optional):
DROP FUNCTION IF EXISTS public.get_users_without_profiles();
-- Note: Keep migrate_existing_users and update_existing_profiles for future use

*/