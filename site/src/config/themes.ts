/**
 * Themes Configuration (New Implementation)
 * Uses the centralized data loader for theme management
 */

import { getThemes } from '../utils/dataLoader';
import type { Theme, ThemeConfiguration } from '../types/staticData';

// Cache for theme data
let themesCache: ThemeConfiguration | null = null;

/**
 * Initialize themes cache
 */
const initializeThemes = async (): Promise<ThemeConfiguration> => {
  if (!themesCache) {
    try {
      themesCache = await getThemes();
    } catch (error) {
      console.error('Failed to load themes:', error);
      // Fallback theme configuration
      themesCache = {
        availableThemes: [
          {
            id: 'default',
            name: 'Formal',
            icon: '☀️',
            category: 'light',
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
            }
          }
        ],
        defaultTheme: 'default',
        categoryMapping: {
          light: ['default'],
          dark: [],
          colorful: []
        }
      };
    }
  }
  return themesCache;
};

/**
 * Get all available themes
 */
export const getAvailableThemes = async (): Promise<Theme[]> => {
  const config = await initializeThemes();
  return config.availableThemes;
};

/**
 * Get theme by ID
 */
export const getThemeById = async (id: string): Promise<Theme | undefined> => {
  const themes = await getAvailableThemes();
  return themes.find(theme => theme.id === id);
};

/**
 * Get all theme IDs
 */
export const getThemeIds = async (): Promise<string[]> => {
  const themes = await getAvailableThemes();
  return themes.map(theme => theme.id);
};

/**
 * Validate if theme ID exists
 */
export const isValidThemeId = async (id: string): Promise<boolean> => {
  const themeIds = await getThemeIds();
  return themeIds.includes(id);
};

/**
 * Get default theme
 */
export const getDefaultTheme = async (): Promise<string> => {
  const config = await initializeThemes();
  return config.defaultTheme;
};

/**
 * Get themes by category
 */
export const getThemesByCategory = async (category: 'light' | 'dark' | 'colorful'): Promise<Theme[]> => {
  const config = await initializeThemes();
  const themeIds = config.categoryMapping[category] || [];
  const themes = await getAvailableThemes();
  
  return themes.filter(theme => themeIds.includes(theme.id));
};

/**
 * Get theme category mapping
 */
export const getCategoryMapping = async () => {
  const config = await initializeThemes();
  return config.categoryMapping;
};

/**
 * Synchronous versions for backward compatibility
 * Note: These will return empty/default values until themes are loaded
 */

// Legacy exports with async loading
export const availableThemes: Theme[] = [];

// Initialize themes and populate legacy export
initializeThemes().then(config => {
  availableThemes.splice(0, availableThemes.length, ...config.availableThemes);
}).catch(error => {
  console.error('Failed to initialize themes for legacy compatibility:', error);
});

// Legacy functions (now async under the hood)
export { getThemeById as getThemeByIdSync };
export { getThemeIds as getThemeIdsSync };
export { isValidThemeId as isValidThemeIdSync };

// Export the theme configuration getter
export const getThemeConfiguration = initializeThemes;