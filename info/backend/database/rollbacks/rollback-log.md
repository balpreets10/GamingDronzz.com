# Database Rollback Log

This file tracks all database rollback operations and maintains a complete history of migration reversals.

## Rollback Entry Format
```
## Migration: [migration_name]
- **Date**: YYYY-MM-DD HH:MM:SS
- **Executed By**: [user/system]
- **Reason**: [reason for rollback]
- **Backup Created**: [backup table names]
- **Rollback Script**: [path to rollback script]
- **Status**: [SUCCESS/FAILURE]
- **Notes**: [additional information]
```

## Rollback History

### Available Rollbacks

## Migration: 007_create_services_table
- **Date**: 2025-09-08 (Created)
- **Rollback Script**: `info/backend/database/rollbacks/rollback_007_create_services_table.sql`
- **Description**: Rollback for services table creation and data upload
- **Backup Strategy**: Creates timestamped backup tables before deletion
- **Components Affected**: 
  - services table
  - service_categories table 
  - service_process_steps table
  - Related RLS policies
  - get_services_data() RPC function
- **Status**: Available (not executed)
- **Notes**: Includes verification checks and automatic backup creation

---

## Rollback Commands

To execute a rollback, run the appropriate SQL script in the Supabase SQL editor:

```sql
-- Example: To rollback services table creation
-- Execute: info/backend/database/rollbacks/rollback_007_create_services_table.sql
```

## Emergency Rollback Procedure

1. **Identify the migration** to rollback from this log
2. **Locate the rollback script** in the rollbacks directory
3. **Review the script** to understand what will be affected
4. **Execute in Supabase** SQL editor with appropriate permissions
5. **Verify the rollback** completed successfully
6. **Update this log** with execution details

## Backup Table Naming Convention

Backup tables are created with the format: `backup_[table_name]_YYYYMMDD_HHMMSS`

Example: `backup_services_20250908_143025`