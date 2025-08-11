import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    drop: ['console', 'debugger'], // Remove console and debugger in production
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['framer-motion'],
          utils: ['zustand']
        }
      }
    },
    target: 'es2015',
    minify: 'esbuild'
  },
  server: {
    port: 3000
  }
})