# Backend Information

## Database System

### Supabase Configuration
- **Database**: PostgreSQL hosted on Supabase
- **Authentication**: Supabase Auth with Google OAuth integration
- **Real-time**: Supabase Realtime for live data updates
- **Storage**: Supabase Storage for file uploads (if needed)

### Database Schema

#### Profiles Table (Current Schema)
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);
```

**Key Features:**
- Streamlined to 10 essential fields for optimal performance
- Role-based access control with 'user' and 'admin' roles  
- Automatic profile creation via `handle_new_user()` trigger
- Proper foreign key constraints and user verification tracking
- Complete schema reference available in `info/supabase/db_schema.json`

#### Projects Table (if dynamic projects are needed)
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    technologies TEXT[],
    github_url TEXT,
    live_url TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Authentication System

### Google OAuth Integration
- **Provider**: Google OAuth 2.0
- **Flow**: Authorization code flow with PKCE
- **Scopes**: `email`, `profile`
- **Client Configuration**: Set in environment variables

### Authentication Flow
1. User clicks sign-in button
2. Redirected to Google OAuth consent screen
3. User grants permissions
4. Callback handled by `AuthCallback` component
5. Supabase creates/updates user session
6. User profile created/updated in database

### Protected Routes
- Routes wrapped with `ProtectedRoute` component
- Automatic redirect to sign-in for unauthenticated users
- Session persistence across browser refreshes

## API Operations

### Supabase Service Layer
Located in `src/services/SupabaseService.ts`:

#### Authentication Methods
- `signInWithGoogle()`: Initiates Google OAuth flow
- `signOut()`: Signs out current user
- `getCurrentUser()`: Gets current user session
- `onAuthStateChange()`: Listens for auth state changes

#### Database Operations
- `getUserRole()`: Checks user role and admin status (calls RPC `get_user_role`)
- `updateUserLogin()`: Updates login tracking (calls RPC `update_user_login`)
- `isAdminUser()`: Simple admin check (calls RPC `is_admin_user`)
- `incrementViewCount()`: View tracking (calls RPC `increment_view_count`)
- `updateUserProfile()`: Profile information updates

### Real-time Data
- **Subscription Management**: Handled via custom hooks
- **Connection Management**: Automatic reconnection on network issues
- **Data Synchronization**: Real-time updates for user profiles

## Security Model

### Row Level Security (RLS)

**RLS Configuration:**
- All tables have RLS enabled with role-based access control
- Admin users (role = 'admin') have full CRUD access to all tables
- Public users have read access to published content only
- Anonymous users can insert inquiries and page views for analytics

**Current RLS Policies:**

**Profiles Table:**
```sql
-- Users can access their own profile
CREATE POLICY "users_view_own_profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_profile" ON profiles  
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admin users have full access to all profiles
CREATE POLICY "admin_full_access_profiles" ON profiles
    FOR ALL TO authenticated USING (is_current_user_admin());
```

**Projects Table:**
```sql
-- Public can view published projects
CREATE POLICY "public_view_published_projects" ON projects
    FOR SELECT USING (published = true);

-- Admins have full access
CREATE POLICY "admin_full_access_projects" ON projects
    FOR ALL TO authenticated USING (is_current_user_admin());
```

**Articles Table:**
```sql
-- Public can view published articles
CREATE POLICY "public_view_published_articles" ON articles
    FOR SELECT USING (published = true);

-- Admins have full access
CREATE POLICY "admin_full_access_articles" ON articles
    FOR ALL TO authenticated USING (is_current_user_admin());
```

**Inquiries Table:**
```sql
-- Only admins can access inquiries (sensitive customer data)
CREATE POLICY "admin_only_access_inquiries" ON inquiries
    FOR ALL TO authenticated USING (is_current_user_admin());

-- Allow anonymous users to insert inquiries (contact form)
CREATE POLICY "allow_anonymous_inquiry_insert" ON inquiries
    FOR INSERT TO anon WITH CHECK (true);
```

**Media Files Table:**
```sql
-- Public can view media files (for published content)
CREATE POLICY "public_view_media_files" ON media_files
    FOR SELECT USING (true);

-- Only admins can manage media files
CREATE POLICY "admin_full_access_media_files" ON media_files
    FOR ALL TO authenticated USING (is_current_user_admin());
```

**Page Views Table:**
```sql
-- Only admins can access analytics data
CREATE POLICY "admin_only_access_page_views" ON page_views
    FOR ALL TO authenticated USING (is_current_user_admin());

-- Allow insert for analytics tracking
CREATE POLICY "allow_insert_page_views" ON page_views
    FOR INSERT WITH CHECK (true);
```

**Complete RLS policies and migration scripts are maintained in `info/backend/database/` directory**

## Admin Dashboard System

### Admin Privileges
- Admin users are identified by `role = 'admin'` in the profiles table
- All admin functions include built-in privilege checking via `is_current_user_admin()`
- Admin access is required for sensitive operations (analytics, content management, user data)

### Admin Dashboard Features

**Dashboard Overview:**
- Complete site statistics via `get_admin_dashboard_stats()`
- Real-time metrics for projects, articles, inquiries, users, and analytics
- Comprehensive summary of all system activity

**Content Management:**
- Bulk publish/unpublish operations for projects and articles
- Bulk featured status management
- Content cleanup and maintenance tools
- Media file management and orphan detection

**Analytics & Reporting:**
- Detailed analytics for projects, articles, inquiries, and page views
- Time-based filtering (7d, 30d, 90d, 1y)
- Traffic analysis and user behavior insights
- Performance metrics and reading time statistics

**Inquiry Management:**
- Full inquiry lifecycle management
- Status tracking (new, pending, in_progress, resolved, closed)
- Priority levels and assignment management
- Admin notes and communication history

**User Management:**
- Profile analytics and user statistics
- Role management and access control
- Active user tracking and verification status

### Admin Security Features
- All admin functions require explicit privilege verification
- Row Level Security prevents unauthorized data access
- Audit trail via `migration_log` table
- Secure bulk operations with transaction safety
- Input validation and SQL injection protection

### API Security
- **Authentication Required**: All database operations require valid session
- **Environment Variables**: Sensitive keys stored securely
- **CORS Configuration**: Proper origin restrictions
- **Rate Limiting**: Supabase built-in rate limiting

## Data Management

### User Profile Management
- **Service Layer**: `UserProfileService.ts`
- **Automatic Creation**: Profile created on first sign-in
- **Profile Updates**: Real-time synchronization
- **Avatar Management**: Google profile image integration

### Static Data Handling
- **Projects Data**: Stored in `src/data/projects-data.json`
- **Services Data**: Managed in `src/data/services.ts`
- **Company Info**: Centralized in `src/data/company.ts`

## Database Migrations

### Migration System
- **Location**: `info/backend/database/migrations/`
- **Naming Convention**: `001_initial_setup.sql`, `002_feature_name.sql`
- **Execution**: Manual execution via Supabase dashboard
- **Rollback System**: Complete rollback scripts in `info/backend/database/rollbacks/`

### Available Migrations
1. `002_streamlined_auth_system.sql`: Streamlined authentication system with automatic profile creation
2. `003_execute_streamlined_auth.sql`: Execute streamlined authentication migration
3. `004_test_streamlined_auth.sql`: Test and verify streamlined authentication system
4. `004_admin_rls_policies.sql`: Comprehensive admin RLS policies for all tables
5. `005_admin_statistics_functions.sql`: Admin dashboard and analytics functions
6. `006_admin_operation_functions.sql`: Bulk operations and content management functions

### Database Functions
**Complete function reference available in `info/supabase/functions_split/functions_public.json`**

**Active RPC Functions:**

**Authentication & User Management:**
- `handle_new_user()`: Database trigger function for automatic profile creation
- `get_user_role(user_id_input UUID, return_format TEXT)`: Role checking function
  - `return_format='simple'`: Returns `{is_admin: boolean}`
  - `return_format='detailed'`: Returns full role info with verification status
- `update_user_login(user_id_input UUID)`: Updates login timestamp and count
- `is_admin_user(user_id_input UUID)`: Simple boolean admin check
- `is_current_user_admin()`: Helper function for admin privilege checking
- `check_email_exists(email TEXT)`: Email existence verification
- `get_profile_analytics()`: Profile statistics and analytics

**Content & Analytics:**
- `increment_view_count(table_type TEXT, record_id UUID)`: Secure view counter
  - Protected against SQL injection with table type validation
  - Supports 'projects' and 'articles' tables

**Admin Dashboard Functions:**
- `get_admin_dashboard_stats()`: Complete dashboard overview statistics
- `get_projects_analytics(time_period TEXT)`: Detailed projects analytics
- `get_articles_analytics(time_period TEXT)`: Comprehensive articles analytics
- `get_inquiries_analytics(time_period TEXT)`: Inquiry management analytics
- `get_page_views_analytics(time_period TEXT)`: Page views and traffic analytics

**Admin Bulk Operations:**
- `bulk_update_projects_published(project_ids UUID[], published_status BOOLEAN)`: Bulk publish/unpublish projects
- `bulk_update_articles_published(article_ids UUID[], published_status BOOLEAN)`: Bulk publish/unpublish articles
- `bulk_update_projects_featured(project_ids UUID[], featured_status BOOLEAN)`: Bulk feature/unfeature projects
- `bulk_update_articles_featured(article_ids UUID[], featured_status BOOLEAN)`: Bulk feature/unfeature articles

**Admin Content Management:**
- `update_inquiry_status(inquiry_id UUID, new_status TEXT, admin_notes TEXT, priority_level INTEGER)`: Update inquiry status with notes
- `bulk_update_inquiries_status(inquiry_ids UUID[], new_status TEXT, admin_notes TEXT)`: Bulk update inquiry status
- `cleanup_unpublished_content(days_old INTEGER, dry_run BOOLEAN)`: Clean up old unpublished content
- `reset_view_counts(content_type TEXT, confirm_reset BOOLEAN)`: Reset view counts for maintenance
- `find_orphaned_media_files()`: Find media files not referenced in content

**Function Documentation:**
Complete function definitions and schemas are maintained in `info/supabase/functions_split/` directory, organized by database schema.

## Error Handling

### Database Errors
- **Connection Errors**: Automatic retry with exponential backoff
- **Authentication Errors**: Clear error messages and re-authentication prompts
- **Validation Errors**: Input validation before database operations

### Logging and Monitoring
- **Error Logging**: Console logging in development
- **Performance Monitoring**: Query performance tracking
- **User Analytics**: Authentication success/failure tracking

## Environment Configuration

### Required Environment Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Configuration Validation
- Startup validation of required environment variables
- Development vs production configuration differences
- Error handling for missing configuration

## Performance Considerations

### Query Optimization
- **Selective Queries**: Fetch only required fields
- **Caching Strategy**: Client-side caching for frequently accessed data
- **Connection Pooling**: Managed by Supabase

### Real-time Performance
- **Selective Subscriptions**: Subscribe only to necessary data changes
- **Connection Management**: Proper cleanup of subscriptions
- **Bandwidth Optimization**: Minimize payload size