# Backend Information

## Database System

### Supabase Configuration
- **Database**: PostgreSQL hosted on Supabase
- **Authentication**: Supabase Auth with Google OAuth integration
- **Real-time**: Supabase Realtime for live data updates
- **Storage**: Supabase Storage for file uploads (if needed)

### Database Schema

#### Profiles Table (Simplified Auth Schema)
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Key Features:**
- Simplified from 25+ columns to 8 essential fields
- Role-based access control with 'user' and 'admin' roles
- Automatic profile creation via triggers
- Proper foreign key constraints

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
- `ensureUserProfile()`: Creates profile if doesn't exist (calls RPC `ensure_user_profile`)
- `handleUserLogin()`: Manages login flow with profile creation (calls RPC `ensure_user_profile` with action='login')
- `isAdmin()`: Checks admin status (calls RPC `get_user_role` with return_format='simple')
- `isAdmin()`: Checks user role for admin privileges
- `updateUserProfile()`: Updates user profile information

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
- **Location**: `src/database/migrations/`
- **Naming Convention**: `001_initial_setup.sql`, `002_feature_name.sql`
- **Execution**: Manual execution via Supabase dashboard

### Available Migrations
1. `001_simplify_auth_schema.sql`: Authentication system fix - simplifies profiles table and adds RPC functions
2. `002_test_auth_functions.sql`: Test script to verify authentication functions work correctly

### RPC Functions
**Enhanced Functions (Post-Optimization):**
- `ensure_user_profile(user_id UUID, action TEXT DEFAULT 'ensure')`: Multi-purpose profile function
  - `action='ensure'`: Creates profile if doesn't exist
  - `action='login'`: Creates profile and updates login timestamp
  - `action='create'`: Force creates new profile
- `get_user_role(user_id_input UUID DEFAULT auth.uid(), return_format TEXT DEFAULT 'simple')`: Role checking function
  - `return_format='simple'`: Returns `{is_admin: boolean}`
  - `return_format='detailed'`: Returns full role info with verification status
- `increment_view_count(table_type TEXT, record_id UUID)`: Secured view counter
  - `table_type` limited to 'projects' or 'articles' (SQL injection protection)
  - Returns success status and new count

**Deprecated Functions (Removed):**
- ~~`handle_user_login`~~ → Merged into `ensure_user_profile`
- ~~`check_user_role`~~ → Replaced by `get_user_role`
- `check_email_exists(email TEXT)`: Helper function to check if email exists in auth.users

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