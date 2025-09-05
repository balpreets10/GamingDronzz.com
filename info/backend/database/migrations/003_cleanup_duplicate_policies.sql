-- Migration: Cleanup Conflicting Policies and Fix Functions
-- Date: 2025-01-06
-- Purpose: Fix all conflicts from dual implementation
-- This fixes RLS policies and functions using wrong field references

BEGIN;

-- Create backup of current policies before cleanup
CREATE TABLE IF NOT EXISTS policy_cleanup_backup_20250106 AS 
SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles';

-- Drop all existing profile policies to clean slate
DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles; 
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "service_role_can_insert_profiles" ON profiles;
DROP POLICY IF EXISTS "service_role_can_update_profiles" ON profiles;
DROP POLICY IF EXISTS "service_role_insert_profiles" ON profiles;

-- Create clean, consistent policies using user_id
CREATE POLICY "users_view_own_profile" ON profiles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_profile" ON profiles  
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow service role to insert profiles (for triggers)
CREATE POLICY "service_role_insert_profiles" ON profiles
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Fix get_user_role function to use user_id
CREATE OR REPLACE FUNCTION public.get_user_role(user_id_input uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    profile RECORD;
BEGIN
    SELECT role INTO profile FROM public.profiles WHERE user_id = user_id_input;
    
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
$function$;

-- Fix update_user_login function to use user_id
CREATE OR REPLACE FUNCTION public.update_user_login(user_id_input uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.profiles 
    SET 
        last_login_at = NOW(),
        login_count = login_count + 1,
        updated_at = NOW()
    WHERE user_id = user_id_input;
    
    IF FOUND THEN
        RETURN jsonb_build_object('success', true);
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
    END IF;
END;
$function$;

-- Fix get_users_without_profiles function to use user_id
CREATE OR REPLACE FUNCTION public.get_users_without_profiles()
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    result UUID[];
BEGIN
    SELECT ARRAY(
        SELECT au.id FROM auth.users au 
        LEFT JOIN public.profiles p ON au.id = p.user_id 
        WHERE p.user_id IS NULL AND au.deleted_at IS NULL AND au.email IS NOT NULL
    ) INTO result;
    RETURN result;
END;
$function$;

-- Log migration execution
INSERT INTO migration_log (migration_name, notes) 
VALUES ('003_cleanup_duplicate_policies', 'Fixed all conflicts: cleaned policies, fixed functions to use user_id field consistently');

COMMIT;