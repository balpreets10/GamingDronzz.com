-- ROLLBACK for 007_create_services_table
-- Date: 2025-09-08 
-- Reverts: 007_create_services_table.sql
-- Description: Removes services table and all related components

BEGIN;

-- Create backup before rollback (if services table exists and has data)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'services') THEN
        EXECUTE format('CREATE TABLE backup_services_%s AS SELECT * FROM services', to_char(NOW(), 'YYYYMMDD_HH24MISS'));
        RAISE NOTICE 'Backup created: backup_services_%', to_char(NOW(), 'YYYYMMDD_HH24MISS');
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'service_categories') THEN
        EXECUTE format('CREATE TABLE backup_service_categories_%s AS SELECT * FROM service_categories', to_char(NOW(), 'YYYYMMDD_HH24MISS'));
        RAISE NOTICE 'Backup created: backup_service_categories_%', to_char(NOW(), 'YYYYMMDD_HH24MISS');
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'service_process_steps') THEN
        EXECUTE format('CREATE TABLE backup_service_process_steps_%s AS SELECT * FROM service_process_steps', to_char(NOW(), 'YYYYMMDD_HH24MISS'));
        RAISE NOTICE 'Backup created: backup_service_process_steps_%', to_char(NOW(), 'YYYYMMDD_HH24MISS');
    END IF;
END $$;

-- Drop RPC function
DROP FUNCTION IF EXISTS get_services_data(TEXT, BOOLEAN, INTEGER);

-- Drop RLS policies
DROP POLICY IF EXISTS "public_view_published_services" ON services;
DROP POLICY IF EXISTS "admin_full_access_services" ON services;
DROP POLICY IF EXISTS "public_view_service_categories" ON service_categories;
DROP POLICY IF EXISTS "admin_full_access_service_categories" ON service_categories;
DROP POLICY IF EXISTS "public_view_active_process_steps" ON service_process_steps;
DROP POLICY IF EXISTS "admin_full_access_process_steps" ON service_process_steps;

-- Drop triggers
DROP TRIGGER IF EXISTS update_services_updated_at ON services;

-- Drop indexes
DROP INDEX IF EXISTS idx_services_category;
DROP INDEX IF EXISTS idx_services_featured;
DROP INDEX IF EXISTS idx_services_priority;
DROP INDEX IF EXISTS idx_services_published;
DROP INDEX IF EXISTS idx_services_service_id;

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS service_process_steps CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS services CASCADE;

-- Drop the shared trigger function only if no other tables use it
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE action_statement LIKE '%update_updated_at_column%';
    
    IF trigger_count = 0 THEN
        DROP FUNCTION IF EXISTS update_updated_at_column();
        RAISE NOTICE 'Dropped shared trigger function update_updated_at_column()';
    ELSE
        RAISE NOTICE 'Kept shared trigger function update_updated_at_column() - still in use by % triggers', trigger_count;
    END IF;
END $$;

-- Update migration log
INSERT INTO migration_log (migration_name, rollback_executed_at, notes) 
VALUES ('007_create_services_table', NOW(), 'Rolled back services table creation. Backup tables created with timestamp suffix.');

-- Verify rollback
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'services') THEN
        RAISE NOTICE 'SUCCESS: Services table successfully removed';
    ELSE
        RAISE EXCEPTION 'FAILURE: Services table still exists after rollback';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'service_categories') THEN
        RAISE NOTICE 'SUCCESS: Service categories table successfully removed';
    ELSE
        RAISE EXCEPTION 'FAILURE: Service categories table still exists after rollback';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'service_process_steps') THEN
        RAISE NOTICE 'SUCCESS: Service process steps table successfully removed';
    ELSE
        RAISE EXCEPTION 'FAILURE: Service process steps table still exists after rollback';
    END IF;
END $$;

COMMIT;