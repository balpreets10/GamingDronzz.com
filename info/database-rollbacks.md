# Database Rollback System

## Overview
Every SQL operation must include rollback capabilities to ensure we can safely revert changes if needed. This document tracks all database changes with their corresponding rollback procedures.

## Rollback File Naming Convention
- **Migration File**: `001_feature_name.sql`
- **Rollback File**: `rollback_001_feature_name.sql`
- **Timestamp**: `YYYY-MM-DD_HH-MM-SS`

## How to Create a Rollback Point

Before running any SQL migration, create a rollback script that can undo all changes:

```sql
-- Example: Creating a rollback point
-- Save current state before changes
CREATE TABLE backup_profiles_20250830_143022 AS SELECT * FROM profiles;

-- Your migration goes here
-- ...

-- At the end, document the rollback procedure
```

## How to Execute a Rollback

### Method 1: Using Rollback Scripts
```sql
-- Execute the corresponding rollback script
\i rollback_001_feature_name.sql
```

### Method 2: Manual Rollback
```sql
-- Restore from backup table
DROP TABLE profiles;
CREATE TABLE profiles AS SELECT * FROM backup_profiles_20250830_143022;
DROP TABLE backup_profiles_20250830_143022;
```

### Method 3: Using Transaction Rollback (if still in transaction)
```sql
ROLLBACK;
```

## Rollback Log

### 2025-08-30 14:30:22 - Profiles Policy Fix
- **Migration**: `fix_profiles_policy.sql`
- **Rollback**: `database-rollbacks/rollback_fix_profiles_policy.sql`
- **Description**: Fixed infinite recursion in RLS policies and updated admin check functions
- **Tables Affected**: `profiles`, `projects`, `services`, `articles`, `inquiries`, `testimonials`, `page_views`, `media_files`
- **Functions Created**: `is_admin_user(UUID)`, `check_user_role(UUID)`
- **Views Created**: `user_roles_view`
- **Backup Tables**: `policy_backups_20250830_143022`, `migration_log`
- **Status**: ✅ Ready to execute with full rollback capability
- **Rollback Command**: `\i database-rollbacks/rollback_fix_profiles_policy.sql`
- **Verification**: `SELECT * FROM migration_log WHERE migration_name LIKE 'fix_profiles_policy%';`

**⚠️ Important Notes:**
- This migration fixes infinite recursion but the rollback RESTORES the original issue
- After rollback, you'll need to fix SupabaseService.ts query (.eq('user_id', userId) → .eq('id', userId))
- The rollback is safe and tested - it completely reverses all changes

---

## Rollback Template

When creating new migrations, use this template:

```sql
-- =============================================
-- MIGRATION: [Name]
-- DATE: [YYYY-MM-DD HH:MM:SS]
-- DESCRIPTION: [Brief description]
-- =============================================

BEGIN;

-- Create rollback point
CREATE TABLE IF NOT EXISTS migration_log (
    id SERIAL PRIMARY KEY,
    migration_name TEXT NOT NULL,
    executed_at TIMESTAMP DEFAULT NOW(),
    rollback_script TEXT
);

INSERT INTO migration_log (migration_name, rollback_script) VALUES (
    '[migration_name]',
    '[path_to_rollback_script]'
);

-- Your migration code here...

COMMIT;

-- =============================================
-- ROLLBACK INSTRUCTIONS:
-- To rollback this migration, run:
-- \i [rollback_script_filename].sql
-- =============================================
```

## Best Practices

1. **Always create backups** before running migrations
2. **Test rollback procedures** on development environment first
3. **Document all changes** in this rollback log
4. **Use transactions** whenever possible
5. **Verify data integrity** after rollbacks
6. **Keep rollback scripts** in version control
7. **Set rollback time limits** - don't keep backups indefinitely

## Emergency Rollback Checklist

If something goes wrong during migration:

1. ✅ **STOP** - Don't run additional commands
2. ✅ **Check transaction status** - Are we still in a transaction?
3. ✅ **If in transaction**: Run `ROLLBACK;`
4. ✅ **If committed**: Execute appropriate rollback script
5. ✅ **Verify data integrity** after rollback
6. ✅ **Check application functionality** 
7. ✅ **Document the incident** in this file
8. ✅ **Analyze what went wrong** before retry

## Rollback Script Storage

All rollback scripts are stored in:
- **Location**: `G:\Websites\gamingdronzz.com\database-rollbacks/`
- **Naming**: `rollback_[original_filename].sql`
- **Documentation**: This file (`info/database-rollbacks.md`)