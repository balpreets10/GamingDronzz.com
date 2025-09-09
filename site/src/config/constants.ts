/**
 * Centralized Constants (New Implementation)
 * Uses the data loader for consistent data access
 */

import { getDesignSystem } from '../utils/dataLoader';

// Design system constants - loaded from centralized data
let designSystemData: any = null;

const getDesignSystemSync = () => {
  if (!designSystemData) {
    // For development - sync loading. In production, this should be loaded at app startup
    getDesignSystem().then(data => {
      designSystemData = data;
    }).catch(error => {
      console.error('Failed to load design system:', error);
      // Fallback to default values
      designSystemData = {
        breakpoints: {
          mobile: 480,
          tablet: 768,
          desktop: 992,
          wide: 1200
        },
        colors: {
          primary: '#007bff',
          secondary: '#6c757d',
          accent: '#007bff',
          background: '#ffffff',
          surface: '#f8f9fa',
          text: '#343a40',
          textSecondary: '#6c757d',
          border: '#dee2e6',
          error: '#dc3545',
          warning: '#ffc107',
          success: '#28a745',
          info: '#17a2b8'
        },
        typography: {
          fontFamily: {
            primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            secondary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            mono: '"JetBrains Mono", "Fira Code", Monaco, Consolas, monospace'
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
            '5xl': '3rem'
          },
          fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          },
          lineHeight: {
            tight: 1.25,
            normal: 1.5,
            relaxed: 1.75
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '2.5rem',
          '3xl': '3rem',
          '4xl': '4rem',
          '5xl': '5rem'
        },
        shadows: {
          sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }
      };
    });
  }
  return designSystemData;
};

// Initialize design system on import
getDesignSystem().then(data => {
  designSystemData = data;
}).catch(error => {
  console.error('Failed to initialize design system:', error);
});

// Export design system constants with backward compatibility
export const BREAKPOINTS = new Proxy({} as any, {
  get(target, prop) {
    const data = getDesignSystemSync();
    return data?.breakpoints?.[prop as string];
  }
});

export const COLORS = new Proxy({} as any, {
  get(target, prop) {
    const data = getDesignSystemSync();
    return data?.colors?.[prop as string];
  }
});

export const TYPOGRAPHY = new Proxy({} as any, {
  get(target, prop) {
    const data = getDesignSystemSync();
    return data?.typography?.[prop as string];
  }
});

export const SPACING = new Proxy({} as any, {
  get(target, prop) {
    const data = getDesignSystemSync();
    return data?.spacing?.[prop as string];
  }
});

export const SHADOWS = new Proxy({} as any, {
  get(target, prop) {
    const data = getDesignSystemSync();
    return data?.shadows?.[prop as string];
  }
});

// Async versions for better performance
export const getBreakpoints = async () => {
  const data = await getDesignSystem();
  return data.breakpoints;
};

export const getColors = async () => {
  const data = await getDesignSystem();
  return data.colors;
};

export const getTypography = async () => {
  const data = await getDesignSystem();
  return data.typography;
};

export const getSpacing = async () => {
  const data = await getDesignSystem();
  return data.spacing;
};

export const getShadows = async () => {
  const data = await getDesignSystem();
  return data.shadows;
};