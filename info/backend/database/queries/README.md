# Database Queries

This directory contains SQL queries, stored procedures, and database scripts for the Gaming Dronzz portfolio website.

## Structure

### Query Organization
```
queries/
├── README.md                    # This file
├── schema/                      # Database schema definitions
├── migrations/                  # Database migration scripts
├── functions/                   # Stored procedures and functions
├── policies/                    # Row Level Security policies
└── indexes/                     # Database index definitions
```

## Query Categories

### Schema Queries
- Table creation scripts
- Column modifications
- Constraint definitions
- Foreign key relationships

### Migration Scripts
- Database version updates
- Data transformation scripts
- Schema evolution queries

### Security Policies
- Row Level Security (RLS) policies
- Authentication-based access controls
- Data privacy implementations

### Performance Queries
- Index creation and optimization
- Query performance analysis
- Database maintenance scripts

## Usage Guidelines

### File Naming Convention
- **Schema**: `001_table_name.sql`
- **Migrations**: `migration_YYYY_MM_DD_description.sql`
- **Functions**: `function_name.sql`
- **Policies**: `table_name_policies.sql`

### Query Documentation
Each query file should include:
- Purpose and description
- Prerequisites or dependencies
- Expected results
- Rollback procedures (if applicable)

### Execution Order
1. Schema definitions
2. Base data setup
3. Security policies
4. Indexes and optimizations
5. Stored procedures and functions

## Integration with Supabase

### Direct Execution
Queries can be executed directly in Supabase SQL Editor:
1. Copy query from file
2. Paste into Supabase SQL Editor
3. Execute and verify results

### Migration Management
For complex changes:
1. Test in development environment
2. Document rollback procedures
3. Execute during low-traffic periods
4. Monitor for issues post-deployment

## Best Practices

### Query Writing
- Use descriptive variable names
- Include comments for complex logic
- Follow PostgreSQL naming conventions
- Test queries before deployment

### Security Considerations
- Always implement Row Level Security
- Use parameterized queries
- Validate input data
- Follow principle of least privilege

### Performance Guidelines
- Add appropriate indexes
- Avoid unnecessary JOINs
- Use EXPLAIN ANALYZE for optimization
- Monitor query performance regularly

## Currently Available Queries

The following query files are referenced from the main database directory:
- `site/src/database/schema.sql` - Main database schema
- `site/src/database/rls-policies.sql` - Row Level Security policies
- `site/src/database/migrations/` - Database migration scripts

## Future Enhancements

### Planned Additions
- [ ] Performance monitoring queries
- [ ] Data analytics queries  
- [ ] Backup and restore scripts
- [ ] Database health check queries

### Optimization Opportunities
- [ ] Query performance analysis
- [ ] Index usage optimization
- [ ] Connection pool tuning
- [ ] Caching strategy implementation