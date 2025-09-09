-- ROLLBACK for 008_create_get_services_rpc
-- Date: 2025-09-09 
-- Reverts: 008_create_get_services_rpc.sql

BEGIN;

-- Remove the get_services_data function
DROP FUNCTION IF EXISTS get_services_data(TEXT, BOOLEAN, INTEGER);

-- Remove the get_services function
DROP FUNCTION IF EXISTS get_services();

-- Rollback completed

COMMIT;