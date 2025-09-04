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
- **Database Queries**: `info/backend/database/queries/` - SQL queries, stored procedures, and database scripts
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
- Always offer the clear option AND chat compaction option
- Format: "📊 Conversation stats: [X] words, [Y] tokens used. Run `/clear` to optimize or `/compact` to continue? [C/c/n]"

**Chat Management Options:**
- `/clear` - Start fresh conversation (recommended for token optimization)
- `/compact` - Summarize conversation context to reduce tokens while preserving important information
- User chooses based on whether they want to continue the current conversation thread

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
- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User

### Working Directory
The website is located in the `site` folder. All bash commands and npm commands must be run from within the `site` directory.

### SQL Script Location Requirements - MANDATORY
IMPORTANT: ALL SQL-related scripts and files MUST be created in the appropriate `info/backend` directory structure, NEVER in the `site` folder.

**Required SQL File Organization:**
- **Database Migrations**: `info/backend/database/migrations/` - All database migration scripts
- **Database Queries**: `info/backend/database/queries/` - SQL queries, stored procedures, and database scripts (DEPRECATED - moved to migrations)
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

## Database Operations and Rollback Requirements - CRITICAL REQUIREMENT

### Mandatory Rollback System for ALL SQL Operations
MANDATORY: Every SQL operation MUST include rollback capabilities and be documented in the rollback system.

**Required Actions for ALL SQL Operations:**
1. **Create Rollback Point**: Always create backup tables or rollback scripts before executing changes
2. **Document Changes**: Update `info/backend/database/rollbacks/rollback-log.md` with complete rollback information
3. **Test Rollback**: Verify rollback procedures work before considering migration complete
4. **Use Transactions**: Wrap all operations in BEGIN/COMMIT blocks when possible

**SQL Rollback Requirements:**
- **Backup Creation**: Create backup tables with timestamp: `backup_[table]_YYYYMMDD_HHMMSS`
- **Rollback Script**: Create corresponding `rollback_[migration_name].sql` file in `info/backend/database/rollbacks/`
- **Documentation**: Log entry in `info/backend/database/rollbacks/rollback-log.md` with timestamp, description, and rollback command
- **Transaction Safety**: Use `BEGIN;` and `COMMIT;` blocks for atomic operations

**Rollback Script Template:**
```sql
-- ROLLBACK for [migration_name]
-- Date: YYYY-MM-DD HH:MM:SS
-- Reverts: [original_migration_file]

BEGIN;

-- Restore original state
-- (specific rollback commands here)

-- Update rollback log
INSERT INTO migration_log (migration_name, rollback_executed_at) 
VALUES ('[migration_name]', NOW());

COMMIT;
```

**Process:**
1. Create rollback script BEFORE running migration
2. Execute migration with transaction safety
3. Update documentation immediately
4. Test rollback procedure
5. Store rollback script in version control

This is NON-NEGOTIABLE - no SQL operation should be executed without proper rollback procedures in place.

## Chat Logging System - MANDATORY FOR ALL CONVERSATIONS

### Automatic Chat Logging - CRITICAL REQUIREMENT
MANDATORY: Every conversation with Claude MUST be logged to maintain a record of all development discussions and decisions.

**Required Actions for ALL Conversations:**
1. **Auto-Log Every Chat**: All conversations must be automatically logged to `info/chats/` directory
2. **Proper Naming Convention**: Use format: `DD-MM-YYYY-HH-MM-SS-context-description.md`
3. **Real-Time Logging**: Messages should be logged as the conversation progresses
4. **Context Identification**: Each chat must include proper context/topic identification

**Chat Logging Requirements:**
- **File Location**: All chat logs stored in `info/chats/` directory
- **File Format**: Markdown format with structured message blocks
- **Filename Pattern**: `DD-MM-YYYY-HH-MM-SS-[context-description].md`
- **Content Structure**: Include timestamps, roles, and full message content
- **Message Tracking**: Log both user queries and assistant responses

**Chat Log Structure Template:**
```markdown
# Chat Log: [Context Description]

**Date:** [Date and Time]
**Context:** [Conversation Topic/Context]

---

## Message [Number]
**Role:** [user/assistant]
**Timestamp:** [Date and Time]

[Message Content]

---
```

**Logging Mechanism:**
- Use existing ChatLogger utility in `site/src/utils/chatLogger.js`
- Logger automatically handles directory creation and file management
- Supports both complete conversation logging and incremental message appending
- Includes sanitization for filename safety

**Process:**
1. Initialize ChatLogger at conversation start
2. Log each message exchange in real-time
3. Use proper context identification for filename
4. Ensure all conversations are preserved for future reference

**Integration Points:**
- ChatLogger class provides `logChat()` and `appendToChat()` methods
- CLI utility available for manual chat management
- Example usage provided in `chatLoggerExample.js`

This is NON-NEGOTIABLE - every conversation must be logged to maintain project development history and decision tracking.