import { developmentConfig } from './environments/development';
import { stagingConfig } from './environments/staging';
import { productionConfig } from './environments/production';

// Re-export auth types and utilities
export * from '../types/auth';
export * from './constants';

// Types for environment configurations
export type EnvironmentConfig = typeof developmentConfig;
export type ConfigType = EnvironmentConfig; // Alias for backward compatibility

// Build info type for better type safety
export interface BuildInfo {
    version: string;
    buildTime: string;
    environment: string;
    gitBranch: string;
}

// Environment detection with multiple fallbacks
const getEnvironment = (): string => {
    // Priority order for environment detection:
    // 1. Vite MODE (most reliable in Vite projects)
    if (typeof import.meta !== 'undefined' && import.meta.env?.MODE) {
        return import.meta.env.MODE;
    }

    // 2. Vite custom env variable
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_ENV) {
        return import.meta.env.VITE_APP_ENV;
    }

    // 3. Process env (build time/Node.js)
    if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
        return process.env.NODE_ENV;
    }

    // 4. Window env (runtime injection)
    if (typeof window !== 'undefined' && (window as any).__APP_ENV__) {
        return (window as any).__APP_ENV__;
    }

    // Default fallback
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

// Configuration selector with robust error handling
const getConfig = (): EnvironmentConfig => {
    const env = currentEnvironment as keyof typeof configs;

    // Debug logging for development
    if (currentEnvironment === 'development') {
        console.log('🔍 Environment Detection Debug:', {
            detected: env,
            available: Object.keys(configs),
            exists: !!configs[env],
            viteMode: typeof import.meta !== 'undefined' ? import.meta.env?.MODE : 'undefined',
            viteEnv: typeof import.meta !== 'undefined' ? import.meta.env?.VITE_APP_ENV : 'undefined',
            nodeEnv: typeof process !== 'undefined' ? process.env?.NODE_ENV : 'undefined'
        });
    }

    // Check if the environment exists in configs
    if (configs[env]) {
        return configs[env] as EnvironmentConfig;
    }

    // Enhanced error handling for unknown environments
    const availableEnvs = Object.keys(configs).join(', ');
    console.warn(
        `🚨 Environment "${env}" not found. Available: ${availableEnvs}. Falling back to development.`
    );

    return developmentConfig;
};

// Export the active configuration
export const config = getConfig();

// Direct access to individual configurations
export { developmentConfig, stagingConfig, productionConfig };

// Environment helper functions
export const isDevelopment = currentEnvironment === 'development';
export const isStaging = currentEnvironment === 'staging';
export const isProduction = currentEnvironment === 'production';

// Environment utilities
export const getEnvironmentInfo = () => ({
    current: currentEnvironment,
    isDev: isDevelopment,
    isStaging: isStaging,
    isProd: isProduction,
    config: {
        api: config.api?.baseURL || 'Not configured',
        features: config.features || {},
        debug: config.features?.debugMode || false,
    }
});

// Performance and debugging helpers
export const shouldEnableDebug = () =>
    isDevelopment || (isStaging && config.features?.debugMode);

export const shouldEnableLogging = () =>
    config.performance?.enableLogging || config.features?.performanceLogging;

// Build info extraction (now properly typed and safe)
const getBuildInfo = (): BuildInfo => {
    const globalScope = typeof window !== 'undefined' ? window : globalThis;

    return {
        version: (globalScope as any).__APP_VERSION__ ||
            config.buildInfo?.version ||
            '1.0.0',
        buildTime: (globalScope as any).__BUILD_TIME__ ||
            config.buildInfo?.buildTime ||
            new Date().toISOString(),
        environment: (globalScope as any).__APP_ENV__ ||
            config.environment ||
            currentEnvironment,
        gitBranch: config.buildInfo?.gitBranch || 'unknown'
    };
};

// Debug information (enhanced logging)
if (shouldEnableDebug()) {
    const buildInfo = getBuildInfo();

    console.group('🎮 GamingDronzz Configuration');
    console.log('🏷️ Environment:', currentEnvironment);
    console.log('⚙️ Config:', config);
    console.log('🏗️ Build Info:', buildInfo);
    console.log('🎯 API Endpoint:', config.api?.baseURL || 'Not configured');
    console.log('🔧 Features:', config.features || {});

    if (config.performance?.targets) {
        console.log('📊 Performance Targets:', config.performance.targets);
    }

    console.groupEnd();
}

// Configuration validation (development only)
if (isDevelopment) {
    const validateConfig = () => {
        const issues: string[] = [];

        if (!config.api?.baseURL) {
            issues.push('API baseURL is missing');
        }

        if (config.analytics?.enabled && !config.analytics.trackingId) {
            issues.push('Analytics enabled but trackingId is missing');
        }

        if (config.supabase && (!config.supabase.url || !config.supabase.anonKey)) {
            issues.push('Supabase configuration incomplete');
        }

        if (!config.buildInfo?.version) {
            issues.push('Build version is missing');
        }

        if (issues.length > 0) {
            console.warn('⚠️ Configuration Issues:', issues);
        } else {
            console.log('✅ Configuration validation passed');
        }
    };

    validateConfig();
}

// Export build info for external use
export const buildInfo = getBuildInfo();

// Additional utility functions following project patterns
export const getApiConfig = () => config.api;
export const getAnalyticsConfig = () => config.analytics;
export const getSupabaseConfig = () => config.supabase;
export const getFeaturesConfig = () => config.features;
export const getPerformanceConfig = () => config.performance;
export const getAnimationsConfig = () => config.animations;

// Theme-related configuration helpers (if needed)
export const shouldUseReducedMotion = () => {
    if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return config.animations?.reducedMotion || false;
};

// Performance monitoring helpers
export const getPerformanceTargets = () => config.performance?.targets;

export const shouldEnablePerformanceLogging = () =>
    config.features?.performanceLogging || config.performance?.enableLogging;

// Default export for backward compatibility
export default config;