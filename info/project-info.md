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
│   ├── database/           # Database migrations and schemas
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

### Static Data
- Projects data stored in `src/data/projects-data.json`
- Services configuration in `src/data/services.ts`
- Company information in `src/data/company.ts`

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