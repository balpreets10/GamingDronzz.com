# React Website Template - Core Architecture

## 📋 Overview
This template provides a robust foundation for React-based websites with TypeScript, featuring modern architecture patterns, performance optimizations, and accessibility standards.

---

## 🏗️ Project Foundation

### **Core Tech Stack**
- **React 18+** with TypeScript
- **Custom CSS** with CSS Variables
- **Supabase** for backend services
- **Vite** for build tooling

### **File Structure Template**
```
src/
├── components/
│   ├── navigation/           # Navigation components
│   ├── sections/            # Page sections (customize per project)
│   └── ui/                  # Reusable UI components
├── config/                  # Configuration management
├── data/                    # Static data (customize per project)
├── hooks/                   # Custom React hooks
├── managers/                # Core managers (Manager Pattern)
├── services/                # External service integrations
├── styles/                  # CSS architecture
├── types/                   # TypeScript definitions
└── utils/                   # Utility functions
```

---

## 🎯 Core Architecture - Manager Pattern

### **Essential Managers**
Each manager follows single responsibility principle:

| Manager | Responsibility |
|---------|----------------|
| **ScrollManager** | Scroll animations and section detection |
| **NavigationManager** | Menu systems and navigation state |
| **PerformanceManager** | Web Vitals monitoring and optimization |

---

## ⚙️ Configuration System

### **Multi-Environment Build System**

#### **Available Environments**
1. **Development** (`dev`) - Full debugging, mock data, local API, sourcemaps
2. **Staging** (`staging`) - Production-like with debugging, staging API, limited logging
3. **Production** (`prod`) - Optimized, secure configurations, minified

#### **Build Structure**
```
builds/
├── dev/          # Development build output
├── staging/      # Staging build output  
└── prod/         # Production build output
```

#### **Advanced Build Commands**
```bash
# Development
npm run dev              # Start dev server (port 3100)
npm run build:dev        # Build for development

# Staging  
npm run staging          # Start staging server
npm run build:staging    # Build for staging

# Production
npm run prod            # Start production preview (port 4173)
npm run build:prod      # Build for production
npm run build           # Alias for build:prod

# Quality Checks
npm run type-check      # TypeScript validation
npm run lint           # ESLint validation
```

#### **Environment-Specific Configurations**
```typescript
// vite.config.ts - Multi-environment setup
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    build: {
      outDir: mode === 'production' ? 'builds/prod' : 
              mode === 'staging' ? 'builds/staging' : 'builds/dev',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      target: mode === 'production' ? 'ES2020' : 'ES2022'
    },
    server: {
      port: mode === 'staging' ? 3200 : 3100
    }
  }
})
```

#### **Environment Detection Priority**
1. `import.meta.env.MODE` (Vite)
2. `import.meta.env.VITE_APP_ENV`
3. `process.env.NODE_ENV`
4. `'development'` (fallback)

### **Feature Flags**
```typescript
interface FeatureFlags {
  debugMode: boolean;
  mockData: boolean;
  performanceLogging: boolean;
}
```

---

## 🎨 CSS Architecture

### **CSS Variables Foundation**
```css
:root {
  /* ===== COLORS ===== */
  --app-color-primary: #4A90E2;
  --app-bg-primary: #FAFBFF;
  --app-text-primary: #0F172A;
  
  /* ===== SPACING ===== */
  --app-space-1: 0.25rem;
  --app-space-4: 1rem;
  
  /* ===== TYPOGRAPHY ===== */
  --app-font-size-base: 1rem;
  --app-font-weight-semibold: 600;
  
  /* ===== EFFECTS ===== */
  --app-shadow-base: 0 1px 3px 0 rgba(15, 37, 78, 0.1);
  --app-transition-base: all 0.2s ease;
  --app-radius-xl: 0.75rem;
}
```

### **BEM Methodology**
```css
.component { /* Block */ }
.component__element { /* Element */ }
.component--modifier { /* Modifier */ }
```

**Example:**
```css
.navigation { /* Block */ }
.navigation__item { /* Element */ }
.navigation__item--active { /* Modifier */ }
```

---

## 🔧 Essential Hooks

### **useIntersectionObserver**
```typescript
const useIntersectionObserver = (options: IntersectionObserverInit) => {
  const elementRef = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  
  // Implementation details...
  
  return { elementRef, isIntersecting, hasIntersected };
};
```

**Usage:**
```typescript
const { elementRef, isIntersecting } = useIntersectionObserver({
  threshold: 0.5,
  rootMargin: '10px'
});
```

### **useNavigation**
```typescript
const useNavigation = () => {
  return {
    state: { isOpen, activeItem, hoveredItem },
    actions: { open, close, toggle, navigate },
    config, 
    updateConfig
  };
};
```

### **useContentManager**
```typescript
const useContentManager = () => {
  // Content loading and caching logic
};
```

---

## ♿ Accessibility Standards

### **ARIA Implementation**
- `aria-current="page"` for active navigation items
- `aria-expanded` for collapsible menu states
- Proper heading hierarchy (H1 → H6)
- `role` attributes for semantic clarity

### **Keyboard Navigation**
| Key | Action |
|-----|--------|
| **Tab** | Navigate through focusable elements |
| **Arrow Keys** | Navigate within menus/lists |
| **Escape** | Close modals/dropdowns |
| **Enter/Space** | Activate buttons/links |

### **Focus Management**
```css
.component:focus-visible {
  outline: 2px solid var(--app-color-primary);
  outline-offset: 2px;
  border-radius: var(--app-radius-sm);
}
```

---

## ⚡ Performance Optimization

### **Image Optimization Strategy**

#### **Implementation Features**
- **Lazy Loading**: IntersectionObserver-based
- **Format Support**: WebP with JPG/PNG fallbacks
- **Responsive Images**: `srcset` for device densities
- **Error Handling**: SVG fallback generation

#### **Example Implementation**
```jsx
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="Description" loading="lazy" />
</picture>
```

### **Animation Performance**

#### **Best Practices**
- **GPU Acceleration**: Use `transform` + `opacity` only
- **60fps Target**: `requestAnimationFrame` + batched updates
- **Memory Management**: Proper observer cleanup

#### **Optimized Animation Example**
```css
.animate-element {
  transform: translateX(0);
  opacity: 1;
  transition: transform 0.3s ease, opacity 0.3s ease;
  will-change: transform, opacity;
}

.animate-element--hidden {
  transform: translateX(-100%);
  opacity: 0;
}
```

### **Advanced Build Chunking Strategy**

#### **Manual Chunk Configuration**
Optimize bundle splitting for better caching and performance:

```typescript
// vite.config.ts - Advanced chunking
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries (rarely change)
          vendor: ['react', 'react-dom'],
          
          // Routing (changes independently)
          router: ['react-router-dom'],
          
          // Page-level components
          pages: [
            'src/pages/HomePage.jsx',
            'src/pages/PortfolioPage.jsx',
            'src/pages/SkillsPage.jsx',
            'src/pages/ExperiencePage.jsx',
            'src/pages/TestimonialsPage.jsx',
            'src/pages/ContactPage.jsx'
          ],
          
          // Modal components (lazy loaded)
          modals: [
            'src/components/modals/ProjectModal/index.js',
            'src/components/modals/SkillsModal/index.js',
            'src/components/modals/GameInfoModal/index.js'
          ],
          
          // Layout components
          layout: [
            'src/components/layout/Navigation/index.js',
            'src/components/layout/Footer/index.js',
            'src/components/layout/AppLayout.jsx'
          ],
          
          // Utility functions and managers
          utils: [
            'src/utils',
            'src/managers',
            'src/hooks'
          ]
        },
        
        // Optimize file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    
    // Performance settings
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild', // Faster than Terser
    target: 'ES2020'
  }
})
```

#### **Chunk Loading Benefits**
| Chunk Type | Cache Strategy | Load Priority |
|------------|----------------|---------------|
| **vendor** | Long-term cache (rarely changes) | High |
| **router** | Medium-term cache | High |
| **layout** | Medium-term cache | High |
| **pages** | Short-term cache (frequent updates) | Medium |
| **modals** | Lazy load on demand | Low |
| **utils** | Long-term cache | Medium |

#### **Dynamic Import Strategy**
```typescript
// Lazy load modals and heavy components
const ProjectModal = lazy(() => import('@/components/modals/ProjectModal'))
const SkillsModal = lazy(() => import('@/components/modals/SkillsModal'))

// Lazy load pages
const PortfolioPage = lazy(() => import('@/pages/PortfolioPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))

// Usage with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <Routes>
    <Route path="/portfolio" element={<PortfolioPage />} />
    <Route path="/contact" element={<ContactPage />} />
  </Routes>
</Suspense>
```

---

## 🔐 Environment Variables

### **Required Variables**
```bash
# Application Info
VITE_APP_NAME=Your App Name
VITE_APP_DESCRIPTION=Your App Description

# Environment Configuration
VITE_APP_ENV=development
```

### **Optional Variables**
```bash
# Build Information
VITE_APP_VERSION=1.0.0
VITE_BUILD_TIME=2024-08-18T10:30:00.000Z

# API Configuration
VITE_API_BASE_URL=https://api.example.com
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### **Environment File Structure**
```
├── .env                     # Default environment variables
├── .env.local              # Local overrides (ignored by git)
├── .env.development        # Development-specific variables
├── .env.staging           # Staging-specific variables
└── .env.production        # Production-specific variables
```

---

## 📚 Additional Resources

### **Development Guidelines**
- Follow TypeScript strict mode
- Use semantic HTML elements
- Implement progressive enhancement
- Maintain component isolation
- Write comprehensive tests

### **Code Quality Tools**
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Git hooks for quality gates

---

*This template provides a comprehensive foundation for scalable React applications. Customize sections marked with "customize per project" to match your specific requirements.*