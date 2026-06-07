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
Environment-specific configuration through `site/src/config/`:
- `site/src/config/environments/development.ts`
- `site/src/config/environments/staging.ts`
- `site/src/config/environments/production.ts`

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

## Hosting

### Provider
- **DigitalOcean Droplet (VPS)** — site is served from a Linux VPS via Nginx or Apache
- HTTPS required for OAuth authentication
- Modern browser support (ES2020+)

### Nginx SPA Configuration (required on the Droplet)
The web server must be configured to fall back to `index.html` for all routes (React Router requirement):
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Server Configuration
- Proper MIME types for assets
- Gzip compression enabled
- Cache headers for static assets
- Fallback to `index.html` for SPA routing (see Nginx config above)

## CI/CD Deployment (GitHub Actions)

### Deployment Method
Files are deployed via **SSH/SCP** using `appleboy/scp-action` and `appleboy/ssh-action`.

### Required GitHub Secrets
Set these in `Settings → Secrets and variables → Actions` on the GitHub repo:

| Secret | Description |
|---|---|
| `DO_STAGING_HOST` | Staging droplet IP or hostname |
| `DO_STAGING_USER` | SSH username on staging droplet |
| `DO_STAGING_SSH_KEY` | Private SSH key for staging droplet |
| `DO_STAGING_PATH` | Remote path on staging droplet (e.g. `/var/www/staging`) |
| `DO_PROD_HOST` | Production droplet IP or hostname |
| `DO_PROD_USER` | SSH username on production droplet |
| `DO_PROD_SSH_KEY` | Private SSH key for production droplet |
| `DO_PROD_PATH` | Remote path on production droplet (e.g. `/var/www/gamingdronzz`) |

### Setting Up the SSH Key
1. Generate a deploy key: `ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy`
2. Add the **public key** to the droplet: `ssh-copy-id -i ~/.ssh/github_deploy.pub user@droplet-ip`
   - Or append it manually to `/home/user/.ssh/authorized_keys` on the droplet
3. Paste the **private key** contents as the `DO_STAGING_SSH_KEY` / `DO_PROD_SSH_KEY` GitHub secret

> If staging and production share the same droplet, the `HOST`, `USER`, and `SSH_KEY` secrets can be identical — only the `PATH` will differ.

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