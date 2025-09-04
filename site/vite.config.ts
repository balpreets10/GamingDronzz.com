import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '')
  
  // Load environment-specific files
  const envFiles = [
    `.env.${mode}.local`,
    `.env.local`,
    `.env.${mode}`,
    `.env`
  ]

  // Determine if this is a production build
  const isProduction = mode === 'production'
  const isStaging = mode === 'staging'
  const isDevelopment = mode === 'development' || !mode

  return {
    plugins: [react()],

    // Path aliases
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/managers': path.resolve(__dirname, './src/managers'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/services': path.resolve(__dirname, './src/services'),
        '@/utils': path.resolve(__dirname, './src/utils'),
        '@/config': path.resolve(__dirname, './src/config'),
      },
    },

    // Environment variables
    define: {
      __APP_ENV__: JSON.stringify(mode),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },

    // ESBuild configuration
    esbuild: {
      drop: (isProduction || isStaging) ? ['console', 'debugger'] : [], // Remove console/debugger in staging and production
      legalComments: 'none',
    },

    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDevelopment || isStaging, // Source maps for dev and staging
      minify: isProduction ? 'esbuild' : false,
      target: 'es2015',

      rollupOptions: {
        output: {
          // Manual chunks for better caching
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('framer-motion')) {
                return 'vendor-motion';
              }
              if (id.includes('zustand')) {
                return 'vendor-state';
              }
              return 'vendor-other';
            }
          },

          // Asset naming for cache busting
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];

            if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/\.(css)$/i.test(assetInfo.name || '')) {
              return `assets/css/[name]-[hash][extname]`;
            }
            if (/\.(woff|woff2|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
              return `assets/fonts/[name]-[hash][extname]`;
            }

            return `assets/[name]-[hash][extname]`;
          },

          // Chunk naming
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },

      // Compression
      reportCompressedSize: isProduction,
      chunkSizeWarningLimit: 1000,
    },

    // Development server
    server: {
      port: 3000,
      host: true,
      open: false,
    },

    // Preview server (for testing builds)
    preview: {
      port: 4173,
      host: true,
    },

    // CSS configuration
    css: {
      devSourcemap: isDevelopment,
      modules: {
        localsConvention: 'camelCase',
      },
    },
  }
})