# Gaming Dronzz Supabase Data Integration Setup Guide

This guide walks you through setting up complete data integration with Supabase for your gaming consultancy website.

## 🚀 Quick Start

### Prerequisites
- Supabase account and project created
- Environment variables configured (already done ✅)
- Supabase CLI installed (optional but recommended)

### 1. Database Schema Setup

#### Step 1: Run Schema Migration
1. Open your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. Copy and paste the contents of `schema.sql`
3. Execute the SQL to create all tables, functions, and triggers

#### Step 2: Set Up Row Level Security
1. In the same SQL Editor, copy and paste the contents of `rls-policies.sql`
2. Execute to enable RLS policies for data security

#### Step 3: Add Sample Data
1. Copy and paste the contents of `migrations/001_initial_setup.sql`
2. Execute to populate with sample data

### 2. Code Integration

#### Replace Static Data Usage
Your current components use static data from TypeScript files. Here's how to migrate them:

**Before (static data):**
```typescript
import { projectsData } from '../data/projects';
```

**After (database integration):**
```typescript
import { useRealtimeProjects } from '../hooks/useRealtimeData';

const { data: projects, loading, error } = useRealtimeProjects({
    featuredOnly: true
});
```

#### Example Component Updates

**Projects Section:**
```typescript
// components/sections/Projects.tsx
import { useRealtimeProjects } from '../hooks/useRealtimeData';

export const Projects = () => {
    const { data: projects, loading, error } = useRealtimeProjects({
        featuredOnly: true
    });

    if (loading) return <div>Loading projects...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {projects.map(project => (
                <ProjectCard key={project.id} project={project} />
            ))}
        </div>
    );
};
```

**Services Section:**
```typescript
// components/sections/Services.tsx
import { useRealtimeServices } from '../hooks/useRealtimeData';

export const Services = () => {
    const { data: services, loading } = useRealtimeServices({
        featuredOnly: false
    });

    // Component implementation...
};
```

**Contact Form:**
```typescript
// components/sections/Contact.tsx
import { useContactForm } from '../hooks/useRealtimeData';

export const Contact = () => {
    const { submitInquiry, submitting, submitted, error } = useContactForm();

    const handleSubmit = async (formData) => {
        const result = await submitInquiry(formData);
        if (result.success) {
            // Handle success
        }
    };

    // Component implementation...
};
```

### 3. Environment Configuration

Your environment is already configured correctly:
```env
VITE_SUPABASE_URL=https://kjntsckfsktefmfydlfm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Database Schema Overview

### Core Tables

#### 1. **profiles** - User profiles extending auth.users
- Stores additional user information
- Links to authentication system
- Supports role-based access (admin, client, user)

#### 2. **projects** - Portfolio projects
- Complete project information with SEO fields
- Technology stack tracking
- Client information and testimonials
- View counting for analytics

#### 3. **services** - Service offerings
- Detailed service descriptions
- Pricing information
- Technology requirements
- Featured/published status

#### 4. **articles** - Blog/content management
- Full article content with SEO
- Author relationships
- Publishing workflow
- View tracking

#### 5. **inquiries** - Contact form submissions
- Complete contact information
- Service interest tracking
- Status management for follow-up
- Admin assignment

#### 6. **testimonials** - Client testimonials
- Rating system (1-5 stars)
- Project/service association
- Publication control

## 🔐 Security Features

### Row Level Security (RLS)
All tables have comprehensive RLS policies:

- **Public Read**: Published content is viewable by everyone
- **Authenticated Read**: Logged-in users can see all content
- **Admin Control**: Only admins can create/update/delete
- **Author Rights**: Content creators can manage their own content

### Role-Based Access
Three user roles supported:
- **admin**: Full access to all data and admin functions
- **client**: Limited access to their own projects/inquiries
- **user**: Public read access only

## 🔄 Real-time Features

### Live Data Synchronization
All hooks support real-time updates:
```typescript
// Automatically updates when data changes in database
const { data, loading, error } = useRealtimeProjects();
```

### Available Real-time Hooks
- `useRealtimeProjects()` - Live project updates
- `useRealtimeServices()` - Live service updates  
- `useRealtimeArticles()` - Live article updates
- `useRealtimeTestimonials()` - Live testimonial updates

### Individual Record Hooks
- `useProject(slug)` - Single project with view tracking
- `useService(slug)` - Single service details
- `useArticle(slug)` - Single article with view tracking

## 📈 Analytics & Monitoring

### Page View Tracking
Automatically track page views:
```typescript
import databaseService from '../services/DatabaseService';

// Track page view
await databaseService.trackPageView('/projects/cyber-quest', 'Cyber Quest Project');
```

### Database Health Monitoring
```typescript
import { useDatabaseHealth } from '../hooks/useRealtimeData';

const { status, message } = useDatabaseHealth();
// status: 'checking' | 'ok' | 'error'
```

## 🛠 Admin Functions

### Content Management
Admins can manage all content through the database:
```typescript
// Create new project
await databaseService.projects.create({
    title: 'New Project',
    slug: 'new-project',
    description: 'Project description...',
    // ... other fields
});

// Update existing service
await databaseService.services.update(serviceId, {
    published: true,
    featured: true
});
```

### Inquiry Management
```typescript
// Get all inquiries
const inquiries = await databaseService.inquiries.getAll();

// Get by status
const newInquiries = await databaseService.inquiries.getByStatus('new');
```

## 🔧 Migration Management

### Check Migration Status
```typescript
import migrationManager from '../database/migration-manager';

const status = await migrationManager.getMigrationStatus();
console.log(`Applied: ${status.appliedMigrations}/${status.totalMigrations}`);
```

### Validate Schema
```typescript
const validation = await migrationManager.validateSchema();
if (!validation.valid) {
    console.error('Schema issues:', validation.issues);
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. RLS Policy Errors
If you get permission errors:
- Ensure RLS policies are properly set up
- Check user authentication status
- Verify user roles are assigned correctly

#### 2. Real-time Not Working
- Check Supabase real-time is enabled in dashboard
- Verify table permissions for real-time
- Check browser console for subscription errors

#### 3. Migration Errors
- Run migrations in order
- Check for existing table conflicts
- Verify database permissions

### Debug Mode
Enable debug logging in development:
```typescript
// Check configuration debug info in browser console
// Debug info automatically logged in development mode
```

## 📚 Next Steps

1. **Run Database Setup**: Execute the SQL files in your Supabase project
2. **Update Components**: Replace static data with database hooks
3. **Set Admin Role**: Update your user role to 'admin' in the profiles table
4. **Test Real-time**: Verify live updates work correctly
5. **Add Content**: Start adding real projects and services through admin interface

## 🔗 Useful Links

- [Supabase Dashboard](https://supabase.com/dashboard/project/kjntsckfsktefmfydlfm)
- [SQL Editor](https://supabase.com/dashboard/project/kjntsckfsktefmfydlfm/sql)
- [Table Editor](https://supabase.com/dashboard/project/kjntsckfsktefmfydlfm/editor)
- [Real-time Logs](https://supabase.com/dashboard/project/kjntsckfsktefmfydlfm/logs/realtime)

## 💡 Best Practices

1. **Always use the database hooks** instead of direct Supabase client calls
2. **Handle loading and error states** in your components
3. **Use real-time features** for better user experience
4. **Implement proper error handling** for database operations
5. **Monitor database health** regularly
6. **Keep migrations documented** and version controlled