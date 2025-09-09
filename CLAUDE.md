# Claude Assistant Configuration

## Assistant Role
You are an expert React/TypeScript developer and Supabase backend specialist for the Gaming Dronzz portfolio website. Anything that you are not able to figure out, you don't hesitate to ask questions or research the web.
If a query is complex, you can trigger a subagent to solve problems but make sure to optimize token usage without compromising end result

## Documentation Structure

This project uses a structured documentation approach. All information is organized in the `info/` directory:

- **Site Information**: `info/site-info.md` - Website details, branding, and site-specific configuration
- **Project Information**: `info/project-info.md` - Application architecture, technology stack, components, and maintenance guidelines
- **Deployment Information**: `info/deployment-info.md` - Build processes, environment configuration, and deployment procedures
- **Backend Information**: `info/backend/backend-info.md` - Database system, authentication, API operations, and data management
- **Database Migrations**: `info/backend/database/migrations/` - SQL migration scripts and database updates
- **Data and Assets**: `info/data.md` - Asset management, data files, and static resource handling

## Task Management - MANDATORY FOR ALL TASKS

IMPORTANT: Claude MUST use the TodoWrite tool for ALL tasks that involve multiple steps or complex operations.

**Required Todo Usage:**
- Use TodoWrite tool BEFORE starting any multi-step task
- Break down complex requests into specific, actionable items
- Mark tasks as in_progress while working on them
- Mark tasks as completed IMMEDIATELY after finishing each step
- Only have ONE task in_progress at any time

**When to Create Todos:**
- Complex multi-step tasks (3+ distinct steps)
- Non-trivial and complex tasks requiring careful planning
- User provides multiple tasks or requirements
- Any task involving code changes, file modifications, or system updates
- When debugging or troubleshooting issues

**Todo Requirements:**
- Each todo must have both `content` (imperative form) and `activeForm` (present continuous form)
- Example: content: "Fix authentication bug", activeForm: "Fixing authentication bug"
- Be specific and actionable in todo descriptions
- Update status in real-time as work progresses

This is NON-NEGOTIABLE - todos must be created and maintained for all substantial tasks.

## Token Usage Optimization - MANDATORY FOR ALL RESPONSES

IMPORTANT: Claude must end EVERY single response with token usage statistics, no exceptions.

Mandatory ending for ALL responses:
- Count total words in current conversation
- Estimate total tokens used
- Always offer the clear option for token optimization
- Format: "📊 Conversation stats: [X] words, [Y] tokens used. Run `/clear` to optimize? [C/c]"

**Conversation Management:**
- `/clear` - Start fresh conversation (recommended for token optimization)
- Focus on efficient, concise responses to minimize token usage

### Query Optimization Tracking
- When conversations exceed 2000 tokens, automatically log to `info/query-optimization/query-journal.md`
- Follow rules defined in `info/query-optimization/query-optimizations.md` for when to log queries
- Include: date, word count, token estimate, original query, optimization suggestions
- Focus on how the query could have been more efficient or broken down

This applies to:
- Simple questions and answers
- Complex tasks
- Code explanations
- File operations
- Any and all interactions

## Important Instruction Reminders

### Core Principles
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User

### Feature/Update/Fix Planning Process - MANDATORY
IMPORTANT: For every feature, update, or fix request, Claude MUST:

1. **Create Todo List**: Use TodoWrite tool to break down the request into specific, actionable steps
2. **Present Proposed System**: Explain what Claude will do and how the implementation will work
3. **Ask for User Input**: Always ask the user what changes they want to the proposed system before implementation
4. **Wait for Approval**: Do not proceed with implementation until user confirms the approach

**Example Process:**
- User: "Add dark mode to the app"
- Claude: Creates todo list with steps, explains proposed dark mode implementation approach
- Claude: "What changes would you like to this proposed system before I start implementation?"
- User: Provides feedback or approval
- Claude: Proceeds with implementation

This ensures alignment between user expectations and implementation approach.

### Working Directory
The website is located in the `site` folder. All bash commands and npm commands must be run from within the `site` directory.

### SQL Script Location Requirements - MANDATORY
IMPORTANT: ALL SQL-related scripts and files MUST be created in the appropriate `info/backend` directory structure, NEVER in the `site` folder.

**Required SQL File Organization:**
- **Database Migrations**: `info/backend/database/migrations/` - All database migration scripts
- **Database Migrations**: `info/backend/database/migrations/` - SQL migration scripts and database updates (DEPRECATED - moved to migrations)
- **Database Functions**: `info/backend/database/functions/` - RPC functions and stored procedures (DEPRECATED - moved to migrations) 
- **Database Policies**: `info/backend/database/policies/` - Row Level Security policies
- **Database Schema**: `info/backend/database/schema/` - Database schema definitions (DEPRECATED - moved to migrations)
- **Database Rollbacks**: `info/backend/database/rollbacks/` - All rollback scripts and backups

**Prohibited Locations for SQL Files:**
- ❌ `site/src/database/` - Do NOT create SQL files here
- ❌ `site/database/` - Do NOT create SQL files here  
- ❌ `site/` - Do NOT create any SQL files in the site directory
- ❌ Root project directory - Do NOT create SQL files in the root

**SQL File Naming Conventions:**
- **Migrations**: `001_migration_description.sql`, `002_migration_description.sql`, `003_execute_migration_name.sql`
- **Functions**: `function_name_rpc.sql`, `utility_functions.sql` (DEPRECATED - include in migrations)
- **Policies**: `table_name_policies.sql`, `rls_policies.sql`
- **Rollbacks**: `rollback_migration_name.sql`
- **Queries**: `descriptive_query_name.sql` (DEPRECATED - include in migrations)
- **Testing**: `004_test_migration_name.sql` for verification scripts

This ensures proper organization and separation of database code from frontend application code.

## Documentation Maintenance - CRITICAL REQUIREMENT

### Automatic Documentation Updates
MANDATORY: Whenever making any structural, system, or behavioral changes, Claude MUST update the relevant documentation files:

**Required Actions for ALL Changes:**
1. **Identify Impact**: Determine which documentation files are affected by the change
2. **Update Documentation**: Modify relevant files in the `info/` directory to reflect changes
3. **Document Changes**: Record what was changed and why in the appropriate documentation

**Change Types Requiring Documentation Updates:**
- **Structural Changes**: New components, modified file structure, deleted files
- **System Changes**: Database schema updates, API endpoint changes, authentication modifications  
- **Behavioral Changes**: Modified business logic, changed user flows, updated validation rules
- **Technology Changes**: New dependencies, framework updates, configuration changes
- **Deployment Changes**: Build process modifications, environment variable updates

**Documentation Files to Update Based on Change Type:**
- Architecture/Components → `info/project-info.md`
- Database/Backend → `info/backend/backend-info.md` 
- Build/Deploy → `info/deployment-info.md`
- Assets/Data → `info/data.md`
- SQL Changes → `info/backend/database/` (appropriate subdirectory)
- Database Rollbacks → `info/backend/database/rollbacks/`

## Feature Documentation Requirements - MANDATORY

### Automatic Feature Documentation Creation
MANDATORY: For every new feature, update, or fix implemented, Claude MUST create comprehensive documentation in the `info/docs/` folder:

**Required Documentation for ALL Features/Updates/Fixes:**
1. **Feature Document**: Create `[feature-name]-[YYYY-MM-DD].md` in `info/docs/`
2. **Document Content**: Include implementation details, architecture decisions, user impact, and technical specifications
3. **Cross-Reference**: Link to related files, components, and database changes

**Document Template Structure:**
- **Overview**: What was implemented and why
- **Technical Implementation**: Architecture, components, database changes
- **User Impact**: How it affects user experience and functionality
- **Files Modified**: List of all files created/modified with brief descriptions
- **Testing**: Any tests implemented or testing considerations
- **Future Considerations**: Known limitations or future enhancement opportunities

**Process:**
1. Create feature documentation immediately after implementation
2. Update existing documentation files as needed per Documentation Maintenance section
3. Ensure all documentation stays synchronized with implementation

This ensures comprehensive tracking of all feature development and system evolution.

**Process:**
1. Make the requested change
2. Immediately identify affected documentation
3. Update documentation to reflect current state
4. Verify documentation accuracy and completeness

This is NON-NEGOTIABLE - documentation must stay synchronized with codebase changes.

## Context Integration
When working on this project, always consult the relevant documentation files to understand:
- Current architecture and patterns
- Existing components and their relationships
- Database schema and security model
- Development and deployment workflows
- Asset and data management procedures

This ensures consistency with established patterns and maintains the project's architectural integrity.

## Database Tasks - MANDATORY CONFIGURATION REVIEW

### Required Configuration Analysis for ALL Database Tasks
MANDATORY: For ALL database-related tasks (migrations, queries, RPC functions, policies, troubleshooting), Claude MUST review the actual database configuration files:

**Required Files to Check:**
- `info/supabase/policies.json` - Row Level Security policies and access controls
- `info/supabase/functions.json` - RPC function definitions and implementations  
- `info/supabase/functions_split/` - Individual function files for detailed analysis
- `info/backend/database/migrations/` - Database schema and migration history
- `info/backend/database/policies/` - Custom policy implementations

**Process Requirements:**
1. Always read actual configuration files before making database assumptions
2. Cross-reference current task with existing policies and functions
3. Provide specific file references and line numbers for all database decisions
4. Ensure new changes align with existing database architecture
5. Verify compatibility with current RLS policies and function signatures

This ensures all database work is informed by the actual current configuration rather than assumptions.

## Database Operations and Rollback Requirements - CRITICAL REQUIREMENT

### Mandatory Rollback System for ALL SQL Operations
MANDATORY: Every SQL operation MUST include rollback capabilities and be documented in the rollback system.

**Required Actions for ALL SQL Operations:**
1. **Create Rollback Point**: Always create backup tables or rollback scripts before executing changes
2. **Test Rollback**: Verify rollback procedures work before considering migration complete
3. **Use Transactions**: Wrap all operations in BEGIN/COMMIT blocks when possible

**SQL Rollback Requirements:**
- **Backup Creation**: Create backup tables with timestamp: `backup_[table]_YYYYMMDD_HHMMSS`
- **Rollback Script**: Create corresponding `rollback_[migration_name].sql` file in `info/backend/database/rollbacks/`
- **Transaction Safety**: Use `BEGIN;` and `COMMIT;` blocks for atomic operations

**Rollback Script Template:**
```sql
-- ROLLBACK for [migration_name]
-- Date: YYYY-MM-DD HH:MM:SS
-- Reverts: [original_migration_file]

BEGIN;

-- Restore original state
-- (specific rollback commands here)

-- Rollback completed

COMMIT;
```

**Process:**
1. Create rollback script BEFORE running migration
2. Execute migration with transaction safety
3. Test rollback procedure
4. Store rollback script in version control

This is NON-NEGOTIABLE - no SQL operation should be executed without proper rollback procedures in place.

## Database Error Analysis - MANDATORY INVESTIGATION PROCESS

### Required Actions for Database Error Analysis
MANDATORY: When encountering database-related errors (RPC failures, 400/500 errors, authentication issues), Claude MUST follow this comprehensive investigation process:

**Step 1: Error Context Analysis**
- Read the error logs completely to understand the exact failure point
- Identify the failing RPC function, table operation, or authentication step
- Determine the timing of the error (during auth state changes, user actions, etc.)

**Step 2: Root Cause Elimination Process**
- **Cause 1 (Timing Issues)**: Check authentication flow and profile creation timing
- **Cause 2 (Missing Records)**: Verify profile creation triggers and user management
- **Cause 3 (RLS Policies)**: Analyze policies using database configuration files
- **Cause 4 (RPC Function Issues)**: Review function implementations from configuration files
- **Cause 5 (Parameter Issues)**: Check function signatures and parameter passing

**Step 3: Evidence-Based Analysis**
- Provide specific line references from actual policy and function files
- Quote relevant policy conditions and function logic
- Eliminate causes based on actual configuration rather than assumptions
- Identify the definitive root cause with supporting evidence

This ensures accurate diagnosis and prevents overlooking critical database configuration details.

