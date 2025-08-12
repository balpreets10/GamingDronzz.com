import { developmentConfig } from '../config/environments/development';
import { stagingConfig } from '../config/environments/staging';
import { productionConfig } from '../config/environments/production';

// Types for environment configurations
export type EnvironmentConfig = typeof developmentConfig;

// Get current environment
const getEnvironment = (): string => {
    // Check Vite environment variable first
    if (import.meta.env.MODE) {
        return import.meta.env.MODE;
    }

    // Check React environment variable
    if (import.meta.env.VITE_APP_ENV) {
        return import.meta.env.VITE_APP_ENV;
    }

    // Check process environment (for build time)
    if (typeof process !== 'undefined' && process.env.NODE_ENV) {
        return process.env.NODE_ENV;
    }

    // Default to development
    return 'development';
};

// Environment configurations mapping
const configs = {
    development: developmentConfig,
    staging: stagingConfig,
    production: productionConfig,
} as const;

// Get current environment
export const currentEnvironment = getEnvironment();

// Select configuration based on environment
const getConfig = (): EnvironmentConfig => {
    const env = currentEnvironment as keyof typeof configs;

    if (configs[env]) {
        return configs[env];
    }

    // Fallback to development if environment not found
    console.warn(`Environment "${env}" not found, falling back to development`);
    return developmentConfig;
};

// Export the configuration
export const config = getConfig();

// Export individual configurations for direct access
export { developmentConfig, stagingConfig, productionConfig };

// Helper functions
export const isDevelopment = currentEnvironment === 'development';
export const isStaging = currentEnvironment === 'staging';
export const isProduction = currentEnvironment === 'production';

// Debug information (only in development)
if (isDevelopment && config.features.debugMode) {
    console.group('🔧 GamingDronzz Configuration');
    console.log('Environment:', currentEnvironment);
    console.log('Config:', config);
    console.log('Build Info:', {
        version: (globalThis as any).__APP_VERSION__,
        buildTime: (globalThis as any).__BUILD_TIME__,
        environment: (globalThis as any).__APP_ENV__,
    });
    console.groupEnd();
}

export default config;