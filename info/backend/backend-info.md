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
```sql
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can access their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR ALL USING (auth.uid() = user_id);

-- Policy: Admins can access all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role = 'admin'
        )
    );

**Complete RLS policies are maintained in `info/backend/database/policies/` directory**
```

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

### Database Functions
**Complete function reference available in `info/supabase/functions_split/functions_public.json`**

**Active RPC Functions:**
- `handle_new_user()`: Database trigger function for automatic profile creation
- `get_user_role(user_id_input UUID, return_format TEXT)`: Role checking function
  - `return_format='simple'`: Returns `{is_admin: boolean}`
  - `return_format='detailed'`: Returns full role info with verification status
- `update_user_login(user_id_input UUID)`: Updates login timestamp and count
- `is_admin_user(user_id_input UUID)`: Simple boolean admin check
- `increment_view_count(table_type TEXT, record_id UUID)`: Secure view counter
  - Protected against SQL injection with table type validation
  - Supports 'projects' and 'articles' tables
- `check_email_exists(email TEXT)`: Email existence verification
- `get_profile_analytics()`: Profile statistics and analytics

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