import { developmentConfig } from './environments/development';
import { productionConfig } from './environments/production';

export type ConfigType = typeof developmentConfig;

const env = (process.env.NODE_ENV || 'development') as 'development' | 'production';

const configs = {
    development: developmentConfig,
    production: productionConfig
};

export const config: ConfigType = configs[env];

// Export constants
export * from './constants';

// Config utilities
export const isProduction = env === 'production';
export const isDevelopment = env === 'development';

export default config;
