-- ROLLBACK for 003_cleanup_duplicate_policies
-- Date: 2025-01-06
-- Reverts: 003_cleanup_duplicate_policies.sql

BEGIN;

-- Drop the clean policies we created
DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "service_role_insert_profiles" ON profiles;

-- Restore original policies from backup
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Recreate policies from backup table
    FOR policy_record IN 
        SELECT * FROM policy_cleanup_backup_20250106 
    LOOP
        EXECUTE format('CREATE POLICY %I ON %I.%I FOR %s %s %s',
            policy_record.policyname,
            policy_record.schemaname, 
            policy_record.tablename,
            policy_record.cmd,
            CASE WHEN policy_record.qual IS NOT NULL THEN 'USING (' || policy_record.qual || ')' ELSE '' END,
            CASE WHEN policy_record.with_check IS NOT NULL THEN 'WITH CHECK (' || policy_record.with_check || ')' ELSE '' END
        );
    END LOOP;
END $$;

-- Drop backup table
DROP TABLE IF EXISTS policy_cleanup_backup_20250106;

-- Update rollback log
INSERT INTO migration_log (migration_name, rollback_executed_at) 
VALUES ('003_cleanup_duplicate_policies', NOW());

COMMIT;