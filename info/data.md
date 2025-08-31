# Data and Assets

## Asset Management

### Image Assets

#### Project Images
- **Location**: `images/projects/`
- **Structure**: 
  ```
  images/projects/
  ├── project-name/
  │   ├── 480/project-name-0.png     # Mobile
  │   ├── 576/project-name-0.png     # Small tablet
  │   ├── 768/project-name-0.png     # Tablet
  │   ├── 992/project-name-0.png     # Desktop
  │   ├── 1200/project-name-0.png    # Large desktop
  │   └── project-name-0.png         # Original/fallback
  ```

#### Available Project Images
- **africanbib**: Bibliography management system
- **bingo**: Bingo game application
- **cca**: CCA website project
- **dui**: DUI legal website
- **f7fun**: F7 entertainment platform (3 images)
- **hyike**: Social platform application
- **ludo**: Ludo board game (4 images)
- **match**: Matching game application (4 images)
- **raceforwhitehouse**: Political game (4 images)
- **resume**: Resume builder application (4 images)
- **rsfun**: RS entertainment platform (5 images)
- **ruleof3**: Rule of 3 application (4 images)
- **unt**: UNT project (3 images)
- **website**: Portfolio website showcase (8 images)

#### Brand Assets
- **Favicon**: `images/favicon.png`
- **Logos**: 
  - `site/public/assets/images/logo-dark.png`
  - `site/public/assets/images/logo-light.png`

### Image Optimization

#### Responsive Images
- Multiple breakpoints: 480px, 576px, 768px, 992px, 1200px
- Lazy loading implementation
- WebP format support where available
- Fallback to original images

#### Loading Strategy
- **Above-fold**: Eager loading for hero images
- **Below-fold**: Lazy loading with intersection observer
- **Progressive Enhancement**: Base image → optimized versions

## Static Data Files

### Project Data
**Location**: `site/src/data/projects-data.json`

Structure:
```json
{
  "projects": [
    {
      "id": "project-id",
      "title": "Project Title",
      "description": "Project description",
      "technologies": ["React", "TypeScript"],
      "github": "https://github.com/username/repo",
      "live": "https://project-url.com",
      "images": [
        {
          "src": "project-name-0.png",
          "alt": "Project screenshot",
          "breakpoints": {
            "480": "480/project-name-0.png",
            "576": "576/project-name-0.png",
            "768": "768/project-name-0.png",
            "992": "992/project-name-0.png",
            "1200": "1200/project-name-0.png"
          }
        }
      ]
    }
  ]
}
```

### Services Data
**Location**: `site/src/data/services.ts`

Contains:
- Service categories
- Service descriptions
- Pricing information
- Service features

### Company Information
**Location**: `site/src/data/company.ts`

Contains:
- Company details
- Contact information
- Social media links
- Business information

### Public Data
**Location**: `site/public/data/services.json`

JSON version of services data for API-like access.

## External Data Sources

### Google OAuth Configuration
- **Client Secret**: `data/client_secret_515274851536-sqsed7sjrhdds1ne2rbv9o1vbv7uu3q3.apps.googleusercontent.com.json`
- **Security**: Not committed to version control in production

### Supabase Configuration
- **Credentials**: `data/supa pass.txt` (development only)
- **Database Schema**: `info/supabase/` directory

## Data Processing

### Build-Time Processing
- Image optimization during build
- Asset bundling and compression
- Static data validation

### Runtime Data Handling
- Lazy loading for large datasets
- Caching strategies for frequently accessed data
- Error handling for missing assets

## Content Management

### Static Content Updates
1. Update JSON files in `src/data/`
2. Add new images to appropriate directories
3. Update responsive image breakpoints
4. Rebuild application

### Dynamic Content (Future)
- Supabase integration for dynamic projects
- Real-time content updates
- Content versioning and rollback

## Asset Delivery

### CDN Strategy
- Static assets served from build directory
- Optimized caching headers
- Gzip compression for text assets

### Performance Considerations
- **Image Format Selection**: WebP with fallbacks
- **Bundle Size**: Minimize asset bundle size
- **Lazy Loading**: Implement for below-fold content
- **Preloading**: Critical assets preloaded

## File Organization

### Development Assets
```
data/
├── Website Document.docx          # Project documentation
├── sample_script.fdx             # Sample scripts
├── client_secret_*.json          # OAuth credentials
└── supa pass.txt                 # Database credentials

info/
└── supabase/                     # Database files
    ├── authentication_architecture.md
    ├── corrected_rpc_functions.sql
    ├── corrected_schema.sql
    ├── deploy_authentication_system.sql
    ├── google_oauth_setup.md
    ├── migration_guide.md
    ├── policies.json
    ├── profile_rls_policies.sql
    ├── profile_rpc_functions.sql
    └── testing_guide.md
```

### Production Assets
```
site/public/
├── assets/
│   └── images/
│       ├── logo-dark.png
│       └── logo-light.png
├── data/
│   └── services.json
└── vite.svg
```

## Backup and Versioning

### Asset Versioning
- Git-based version control for all assets
- Tagged releases for major asset updates
- Backup of original high-resolution images

### Data Backup
- Regular backup of JSON data files
- Version control for all configuration files
- Database backup through Supabase