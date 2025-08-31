# Deployment Information

## Project Structure
The website is located in the `site` folder. All bash commands and npm commands must be run from within the `site` directory.

## Build Commands

### Development Build
```bash
npm run build
```
- Creates development build with debugging enabled
- Outputs to `dist/`
- Includes source maps and debug information
- Optimized for development workflow

### Production Build
```bash
npm run build
```
- Creates production build with full optimizations
- Outputs to `dist/`
- Minified and compressed assets
- Optimized for deployment

### Development Server
```bash
npm run dev
```
- Starts development server with hot reload
- Available at `http://localhost:5173`
- Includes development tools and debugging

### Preview Production Build
```bash
npm run preview
```
- Serves production build locally for testing
- Validates production build before deployment

## Environment Configuration

### Environment Files
- Development: `.env.development`
- Staging: `.env.staging`
- Production: `.env.production`

### Configuration Structure
Environment-specific configuration through `src/config/`:
- `src/config/environments/development.ts`
- `src/config/environments/staging.ts`
- `src/config/environments/production.ts`

### Required Environment Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Application Configuration
VITE_APP_ENV=development|staging|production
VITE_DEBUG_MODE=true|false
```

## Performance Optimization

### Build Optimizations
- Code splitting and lazy loading
- Bundle analysis capabilities
- Tree shaking for unused code elimination
- Asset compression and optimization

### Runtime Optimizations
- Performance monitoring in development
- Lazy loading for components and routes
- Image optimization and lazy loading
- Scroll management for performance

## Deployment Process

### Pre-Deployment Checklist
1. Run `npm run lint` to check code quality
2. Run `npm run build` to create production build
3. Validate environment variables are set
4. Test build locally with `npm run preview`

### Build Outputs
- **Development**: `dist/`
  - Source maps included
  - Debug information available
  - Development-specific configurations
  
- **Production**: `dist/`
  - Minified and optimized assets
  - Compressed CSS and JavaScript
  - Production-ready configuration

### Static Asset Handling
- Assets placed in `public/` directory
- Build process copies assets to build output
- Optimized asset delivery in production

## Security Considerations

### Environment Variable Security
- Never commit `.env` files to version control
- Use environment-specific configuration
- Validate required variables on startup

### Build Security
- Remove debug code in production builds
- Minify and obfuscate production code
- Remove development-only features

## Hosting Requirements

### Static Hosting
- Support for SPA routing (React Router)
- HTTPS required for OAuth authentication
- Modern browser support (ES2020+)

### Server Configuration
- Proper MIME types for assets
- Gzip compression enabled
- Cache headers for static assets
- Fallback to index.html for SPA routing

## Monitoring and Debugging

### Development Tools
- React Developer Tools support
- Vite development server with HMR
- Performance monitoring in development mode

### Production Monitoring
- Error logging and reporting
- Performance metrics collection
- User analytics integration points

## Backup and Recovery

### Code Backup
- Git-based version control
- Regular commits and branching
- Tag releases for rollback capability

### Database Backup
- Supabase handles automatic backups
- Manual backup procedures documented
- Data export capabilities available