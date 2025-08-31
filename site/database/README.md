# Database Migrations for Gaming Dronzz Authentication Fix

## Problem Fixed
The original authentication system had:
- Overly complex `profiles` table with 25+ unnecessary columns
- Missing critical RPC functions (`ensure_user_profile`, `handle_user_login`)
- No automatic profile creation on user signup
- Improper RLS policies

## Solution Implemented
This migration creates a clean, simple authentication system based on the working health app reference:

### 1. Simplified Profiles Table
```sql
profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### 2. Created Missing RPC Functions
- `ensure_user_profile(user_id UUID)` - Creates profile if doesn't exist
- `handle_user_login(user_id UUID)` - Handles login flow with profile creation
- `check_email_exists(email TEXT)` - Helper function for email validation

### 3. Proper RLS Policies
- Users can only access their own profiles
- Admins can access all profiles
- Secure by default

### 4. Automatic Profile Creation
- Trigger automatically creates profile when user signs up via OAuth
- No manual intervention needed

## How to Run the Migration

### Step 1: Backup (Optional but Recommended)
If you have existing profile data you want to preserve:
```sql
-- Uncomment the backup line in the migration script before running
CREATE TABLE IF NOT EXISTS profiles_backup AS SELECT * FROM profiles;
```

### Step 2: Run the Main Migration
Execute the migration in Supabase SQL Editor:
```bash
# Copy and paste the contents of:
site/database/migrations/001_simplify_auth_schema.sql
```

### Step 3: Set Up Admin User (Optional)
Uncomment and modify the admin user creation section at the end of the migration:
```sql
-- Find your user ID in auth.users table first
SELECT id, email FROM auth.users;

-- Then uncomment and modify:
INSERT INTO profiles (user_id, email, full_name, role)
VALUES (
    'your-actual-user-id-here',
    'your-email@gamingdronzz.com',
    'Your Name',
    'admin'
) ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### Step 4: Test the Migration
Run the test script to verify everything works:
```bash
# Copy and paste the contents of:
site/database/migrations/002_test_auth_functions.sql
```

## What This Fixes

### Before (Broken):
- Google OAuth sign-in worked
- **No profile creation** after authentication
- **No role assignment**
- Users couldn't access protected features
- Overly complex table structure

### After (Working):
- Google OAuth sign-in works
- **Automatic profile creation** with 'user' role
- **Proper role assignment and checking**
- Users can access all features
- Clean, maintainable table structure
- Matches the working health app pattern

## Verification Steps

After running the migration, test the authentication flow:

1. **Sign out** completely from your app
2. **Clear browser storage** (localStorage/sessionStorage)
3. **Sign in with Google** OAuth
4. Check the browser console - you should see successful profile creation logs
5. Verify in Supabase dashboard that:
   - User exists in `auth.users`
   - Profile exists in `profiles` table with role='user'

## Files Created
- `site/database/migrations/001_simplify_auth_schema.sql` - Main migration
- `site/database/migrations/002_test_auth_functions.sql` - Test script  
- `site/database/README.md` - This documentation

## Technical Details

The migration creates exactly what your code expects:
- RPC function `ensure_user_profile` called by `SupabaseService.ts:419`
- RPC function `handle_user_login` called by `SupabaseService.ts:468`
- Proper role checking via `profiles` table for `isAdmin()` method
- Automatic profile creation on OAuth callback

This follows the exact same pattern as the working health app but adapted for Gaming Dronzz portfolio website needs.