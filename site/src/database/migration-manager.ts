// database/migration-manager.ts - Database Migration Management System
import supabaseService from '../services/SupabaseService';

interface Migration {
    id: string;
    name: string;
    description: string;
    sql: string;
    version: number;
    applied_at?: string;
}

interface MigrationResult {
    success: boolean;
    error?: string;
    appliedMigrations?: string[];
}

class MigrationManager {
    private client = supabaseService.getClient();

    constructor() {
        this.ensureMigrationsTable();
    }

    // Create migrations tracking table if it doesn't exist
    private async ensureMigrationsTable(): Promise<void> {
        try {
            const { error } = await this.client.rpc('create_migrations_table');
            
            if (error) {
                // If RPC doesn't exist, create table directly
                await this.client.from('migrations').select('id').limit(1);
            }
        } catch {
            // Table doesn't exist, we'll need to create it manually in Supabase
            console.warn('Migrations table may not exist. Please run the initial setup migration.');
        }
    }

    // Get all applied migrations
    async getAppliedMigrations(): Promise<Migration[]> {
        try {
            const { data, error } = await this.client
                .from('migrations')
                .select('*')
                .order('version', { ascending: true });

            if (error) {
                throw new Error(`Failed to fetch migrations: ${error.message}`);
            }

            return data as Migration[];
        } catch (error) {
            console.error('Error fetching applied migrations:', error);
            return [];
        }
    }

    // Check if a migration has been applied
    async isMigrationApplied(migrationId: string): Promise<boolean> {
        try {
            const { data, error } = await this.client
                .from('migrations')
                .select('id')
                .eq('id', migrationId)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw new Error(`Failed to check migration: ${error.message}`);
            }

            return !!data;
        } catch (error) {
            console.error('Error checking migration status:', error);
            return false;
        }
    }

    // Record a migration as applied
    async recordMigration(migration: Omit<Migration, 'applied_at'>): Promise<void> {
        try {
            const { error } = await this.client
                .from('migrations')
                .insert({
                    ...migration,
                    applied_at: new Date().toISOString()
                });

            if (error) {
                throw new Error(`Failed to record migration: ${error.message}`);
            }

            console.log(`✅ Migration ${migration.id} recorded successfully`);
        } catch (error) {
            console.error('Error recording migration:', error);
            throw error;
        }
    }

    // Execute raw SQL (use with caution)
    async executeSQL(sql: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Note: Supabase doesn't allow raw SQL execution from client-side
            // This would need to be done through the SQL editor or via database functions
            console.warn('Raw SQL execution must be done through Supabase SQL Editor');
            
            return {
                success: false,
                error: 'Raw SQL execution not supported from client. Use Supabase SQL Editor.'
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    // Validate database schema
    async validateSchema(): Promise<{ valid: boolean; issues: string[] }> {
        const issues: string[] = [];

        try {
            // Check if required tables exist
            const requiredTables = [
                'profiles', 'projects', 'services', 'articles', 
                'inquiries', 'testimonials', 'page_views', 'media_files'
            ];

            for (const table of requiredTables) {
                try {
                    await this.client.from(table).select('*').limit(1);
                } catch (error) {
                    issues.push(`Table '${table}' does not exist or is not accessible`);
                }
            }

            // Check if required functions exist
            const requiredFunctions = [
                'handle_new_user',
                'check_email_exists',
                'increment_view_count'
            ];

            // Note: Can't easily check function existence from client-side
            // This would require admin privileges

            // Check if RLS is enabled on tables
            // This also requires admin privileges to check properly

            return {
                valid: issues.length === 0,
                issues
            };
        } catch (error) {
            issues.push(`Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return { valid: false, issues };
        }
    }

    // Get migration status overview
    async getMigrationStatus(): Promise<{
        totalMigrations: number;
        appliedMigrations: number;
        pendingMigrations: string[];
        lastApplied?: string;
    }> {
        try {
            const appliedMigrations = await this.getAppliedMigrations();
            
            // This would be populated with actual migration files in a real scenario
            const allMigrations = [
                '001_initial_setup',
                // Add more migration IDs as they are created
            ];

            const appliedIds = appliedMigrations.map(m => m.id);
            const pendingMigrations = allMigrations.filter(id => !appliedIds.includes(id));
            const lastApplied = appliedMigrations.length > 0 
                ? appliedMigrations[appliedMigrations.length - 1].applied_at 
                : undefined;

            return {
                totalMigrations: allMigrations.length,
                appliedMigrations: appliedMigrations.length,
                pendingMigrations,
                lastApplied
            };
        } catch (error) {
            console.error('Error getting migration status:', error);
            return {
                totalMigrations: 0,
                appliedMigrations: 0,
                pendingMigrations: [],
            };
        }
    }

    // Rollback migrations (use with extreme caution)
    async rollbackMigration(migrationId: string): Promise<MigrationResult> {
        console.warn('Migration rollback is not implemented for safety reasons');
        console.warn('Please perform rollbacks manually through Supabase SQL Editor');
        
        return {
            success: false,
            error: 'Rollback must be performed manually for safety'
        };
    }

    // Health check for migration system
    async healthCheck(): Promise<{ status: 'ok' | 'warning' | 'error'; message: string; details?: any }> {
        try {
            const migrationStatus = await this.getMigrationStatus();
            const schemaValidation = await this.validateSchema();

            if (!schemaValidation.valid) {
                return {
                    status: 'error',
                    message: 'Schema validation failed',
                    details: {
                        issues: schemaValidation.issues,
                        migrationStatus
                    }
                };
            }

            if (migrationStatus.pendingMigrations.length > 0) {
                return {
                    status: 'warning',
                    message: `${migrationStatus.pendingMigrations.length} pending migrations`,
                    details: {
                        pending: migrationStatus.pendingMigrations,
                        applied: migrationStatus.appliedMigrations,
                        total: migrationStatus.totalMigrations
                    }
                };
            }

            return {
                status: 'ok',
                message: 'Migration system healthy',
                details: migrationStatus
            };
        } catch (error) {
            return {
                status: 'error',
                message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    // Generate migration template
    generateMigrationTemplate(name: string, description: string): string {
        const version = Date.now(); // Simple version based on timestamp
        const migrationId = `${String(version).slice(-3).padStart(3, '0')}_${name.toLowerCase().replace(/\s+/g, '_')}`;
        
        return `-- Migration ${migrationId}: ${name}
-- Run date: ${new Date().toISOString().split('T')[0]}
-- Description: ${description}

-- Add your SQL statements here
-- Example:
-- CREATE TABLE example (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name TEXT NOT NULL,
--     created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- Enable RLS if needed
-- ALTER TABLE example ENABLE ROW LEVEL SECURITY;

-- Add policies if needed
-- CREATE POLICY "example_policy" ON example FOR SELECT USING (true);

-- Don't forget to record this migration:
-- INSERT INTO public.migrations (id, name, description, version) VALUES 
-- ('${migrationId}', '${name}', '${description}', ${version});`;
    }
}

export default new MigrationManager();