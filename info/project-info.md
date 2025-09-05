# Project Information

## Application Architecture

### Technology Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with CSS Variables and BEM methodology
- **Backend**: Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth with Google OAuth
- **Deployment**: Static site hosting

### Application Structure
```
site/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── navigation/     # Navigation components
│   │   ├── sections/       # Page sections
│   │   └── ui/             # UI utilities
│   ├── config/             # Configuration files
│   ├── data/               # Static data
│   ├── hooks/              # Custom React hooks
│   ├── managers/           # Business logic managers
│   ├── services/           # API and external services
│   ├── styles/             # Global styles and themes
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
└── public/                 # Static assets
```

## Components

### Core Components
- **ModernNavigation**: Main navigation with radial menu
- **Hero**: Landing page hero section
- **About**: About section with personal information
- **Projects**: Portfolio projects showcase
- **Services**: Services offered section
- **Contact**: Contact information and form
- **Articles**: Blog/article section

### Authentication Components
- **ProtectedRoute**: Route protection wrapper
- **AuthCallback**: OAuth callback handler
- **ProfileDropdown**: User profile management

### UI Components
- **ErrorBoundary**: Error handling wrapper
- **LoadingSpinner**: Loading state indicator
- **NotificationContainer**: Toast notifications
- **Preloader**: Initial app loading

## Data Management

### Supabase Client Architecture
- **Singleton Pattern**: Single shared Supabase client instance prevents multiple GoTrueClient warnings
- **Client Location**: `src/services/supabaseClient.ts` - exports `getSupabaseClient()` and `supabase` instance
- **Service Integration**: All services (AuthService, SupabaseService, etc.) use the shared client
- **Configuration**: Client configured with PKCE flow, auto-refresh, and session persistence

### Static Data
- Projects data stored in `src/data/projects-data.json`
- Services configuration in `src/data/services.ts`
- Company information in `src/data/company.ts`
- Database schema reference in `info/supabase/db_schema.json`
- Database functions by schema in `info/supabase/functions_split/`
- Database migrations in `info/backend/database/migrations/`

### Dynamic Data
- User profiles managed via Supabase
- Real-time data updates using Supabase subscriptions
- Authentication state managed through custom hooks

## Performance Optimizations

### Code Splitting
- Lazy loading for major components
- Dynamic imports for heavy utilities
- Route-based code splitting

### Asset Optimization
- Image lazy loading
- Responsive image sets
- Asset compression and caching

### Runtime Performance
- Memoized components and hooks
- Performance monitoring
- Scroll optimization
- Theme switching optimization

## Maintenance Guidelines

### Code Quality
- TypeScript strict mode enabled
- ESLint configuration enforced
- Component testing recommended
- Performance monitoring in development

### Development Workflow
- Feature branch development
- Code review process
- Automated testing integration
- Documentation updates required

### Security Considerations
- Environment variable protection
- Supabase Row Level Security (RLS)
- OAuth token management
- Input validation and sanitization

## Recent Optimizations (January 2025)

### Streamlined Authentication System Implementation
**Completed comprehensive overhaul of authentication system for automatic profile creation:**

**Database Layer Changes:**
- **Removed Functions**: `ensure_user_profile()`, `handle_user_login()`, `complete_user_profile()`, `safe_update_profile()`, `check_profile_completion()`, `get_user_profile_with_completion()`
- **Active Functions**: 
  - `handle_new_user()` - Automatic profile creation via database trigger
  - `get_user_role(user_id)` - Role checking with JSONB response
  - `update_user_login(user_id)` - Login tracking and count updates
  - `is_admin_user(user_id)` - Boolean admin check
  - `increment_view_count(table_type, record_id)` - Secure view counter
- **Database Trigger**: `on_auth_user_created` trigger for automatic profile creation

**Authentication Flow Improvements:**
- **Automatic Profile Creation**: Profiles created via database triggers, no manual calls needed
- **Role-Based Access**: Admin/user roles determined during signup and cached
- **Streamlined OAuth**: Removed manual profile creation calls from AuthService
- **Enhanced Security**: Updated RLS policies for automatic profile creation support

**Frontend Impact:** 
- Removed `ensureUserProfile` calls from AuthService and useAuth hook
- Profiles now automatically considered complete (100%)
- Added `isAdmin` flag to auth state management
- Simplified authentication flow reduces complexity

**Performance Gains:**
- Eliminated race conditions in profile creation
- Faster authentication flow (no additional RPC calls)
- Reduced function count and simplified database operations
- Automatic profile creation via optimized database triggers

**Migration System:** 
- Migration files: `002_streamlined_auth_system.sql`, `003_execute_streamlined_auth.sql`, `004_test_streamlined_auth.sql`
- Complete rollback capability via `rollback_002_streamlined_auth_system.sql`
- Updated RLS policies in `streamlined_auth_policies.sql`