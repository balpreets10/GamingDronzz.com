-- ROLLBACK for fix_profiles_policy
-- Date: 2025-08-30 14:30:22
-- Reverts: fix_profiles_policy.sql
-- Purpose: Restore original RLS policies and remove new functions/views

BEGIN;

-- =============================================================================
-- ROLLBACK LOG ENTRY
-- =============================================================================

-- Create rollback log table if it doesn't exist
CREATE TABLE IF NOT EXISTS migration_log (
    id SERIAL PRIMARY KEY,
    migration_name TEXT NOT NULL,
    executed_at TIMESTAMP DEFAULT NOW(),
    rollback_executed_at TIMESTAMP,
    rollback_script TEXT,
    notes TEXT
);

-- Log this rollback
INSERT INTO migration_log (migration_name, rollback_executed_at, rollback_script, notes) 
VALUES ('fix_profiles_policy', NOW(), 'rollback_fix_profiles_policy.sql', 'Rolling back profiles policy changes due to issues');

-- =============================================================================
-- STEP 1: DROP NEW FUNCTIONS AND VIEWS CREATED IN MIGRATION
-- =============================================================================

-- Drop the admin check function
DROP FUNCTION IF EXISTS is_admin_user(UUID);
DROP FUNCTION IF EXISTS check_user_role(UUID);

-- Drop the user roles view
DROP VIEW IF EXISTS user_roles_view;

-- =============================================================================
-- STEP 2: DROP ALL POLICIES CREATED IN MIGRATION
-- =============================================================================

-- Drop new profiles policies
DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "service_role_full_access" ON profiles;
DROP POLICY IF EXISTS "admins_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admins_update_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admins_delete_profiles" ON profiles;

-- Drop updated policies on other tables
DROP POLICY IF EXISTS "admins_insert_projects" ON projects;
DROP POLICY IF EXISTS "admins_update_projects" ON projects;
DROP POLICY IF EXISTS "admins_delete_projects" ON projects;
DROP POLICY IF EXISTS "admins_insert_services" ON services;
DROP POLICY IF EXISTS "admins_update_services" ON services;
DROP POLICY IF EXISTS "admins_delete_services" ON services;
DROP POLICY IF EXISTS "authors_update_own_or_admin_any" ON articles;
DROP POLICY IF EXISTS "authors_delete_own_or_admin_any" ON articles;
DROP POLICY IF EXISTS "admins_view_inquiries" ON inquiries;
DROP POLICY IF EXISTS "admins_update_inquiries" ON inquiries;
DROP POLICY IF EXISTS "admins_manage_testimonials" ON testimonials;
DROP POLICY IF EXISTS "admins_view_page_views" ON page_views;
DROP POLICY IF EXISTS "users_update_own_or_admin_any_media" ON media_files;
DROP POLICY IF EXISTS "users_delete_own_or_admin_any_media" ON media_files;

-- =============================================================================
-- STEP 3: RESTORE ORIGINAL RLS POLICIES
-- =============================================================================

-- Restore original profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
    ON profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Restore original project policies  
CREATE POLICY "Admins can insert projects" 
    ON projects FOR INSERT 
    TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update projects" 
    ON projects FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete projects" 
    ON projects FOR DELETE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Restore original services policies
CREATE POLICY "Admins can insert services" 
    ON services FOR INSERT 
    TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update services" 
    ON services FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete services" 
    ON services FOR DELETE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Restore original articles policies
CREATE POLICY "Authors can update their own articles" 
    ON articles FOR UPDATE 
    TO authenticated 
    USING (
        auth.uid() = author_id OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Authors can delete their own articles" 
    ON articles FOR DELETE 
    TO authenticated 
    USING (
        auth.uid() = author_id OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Restore original inquiries policies
CREATE POLICY "Admins can view inquiries" 
    ON inquiries FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update inquiries" 
    ON inquiries FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Restore original testimonials policies
CREATE POLICY "Admins can manage testimonials" 
    ON testimonials FOR ALL 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Restore original page views policies
CREATE POLICY "Admins can view page views" 
    ON page_views FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Restore original media files policies
CREATE POLICY "Users can manage their uploads" 
    ON media_files FOR UPDATE 
    TO authenticated 
    USING (
        auth.uid() = uploaded_by OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can delete their uploads" 
    ON media_files FOR DELETE 
    TO authenticated 
    USING (
        auth.uid() = uploaded_by OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- =============================================================================
-- STEP 4: REVOKE PERMISSIONS THAT WERE GRANTED
-- =============================================================================

-- Note: No specific permissions to revoke as they were for functions we dropped

COMMIT;

-- =============================================================================
-- ROLLBACK COMPLETE
-- =============================================================================

/*
ROLLBACK COMPLETED SUCCESSFULLY

This rollback script has:
✅ Removed new functions: is_admin_user(), check_user_role()
✅ Removed new view: user_roles_view  
✅ Restored all original RLS policies with recursive structure
✅ Logged rollback execution in migration_log table

WARNING: This restores the ORIGINAL INFINITE RECURSION ISSUE!
After running this rollback, you will again experience:
- 500 Internal Server Error on admin checks
- Infinite recursion in RLS policies

NEXT STEPS AFTER ROLLBACK:
1. Fix the SupabaseService.ts query (.eq('user_id', userId) → .eq('id', userId))
2. Consider alternative solutions to the infinite recursion issue
3. Test thoroughly before attempting migration again

ROLLBACK VERIFICATION:
Run these queries to verify rollback success:
SELECT COUNT(*) FROM profiles; -- Should return normal data
\df is_admin_user; -- Should return "No matching functions"
\dv user_roles_view; -- Should return "No matching relations"
*/