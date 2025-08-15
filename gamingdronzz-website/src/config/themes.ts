// src/config/themes.ts
/**
 * Theme configuration data for GamingDronzz application
 * Pure data container - functionality is in utils/themeHelper.ts
 * Each theme should have a corresponding CSS file in src/styles/themes/
 */

export interface Theme {
    id: string;
    name: string;
    icon: string;
}

export const availableThemes: Theme[] = [

    {
        id: 'arctic-frost',
        name: 'Arctic Frost',
        icon: '❄️'
    },
    {
        id: 'dark-cyber',
        name: 'Dark Cyber',
        icon: '🌙'
    },
    {
        id: 'default',
        name: 'Formal',
        icon: '☀️'
    },
    {
        id: 'electric-storm',
        name: 'Electric Storm',
        icon: '☀️'
    },
    {
        id: 'forest-tech',
        name: 'Forest Tech',
        icon: '🌲'
    },
    {
        id: 'gaming-inferno',
        name: 'Gaming Inferno',
        icon: '🔥'
    },
    {
        id: 'minimal-green',
        name: 'Minimal Green',
        icon: '🍃'
    },
    {
        id: 'ocean-deep',
        name: 'Ocean Deep',
        icon: '🌊'
    },
    {
        id: 'retro-arcade',
        name: 'Retro Arcade',
        icon: '🎮'
    },

    {
        id: 'sakura-bloom',
        name: 'Sakura Bloom',
        icon: '🌸'
    },
    {
        id: 'space-explorer',
        name: 'Space Explorer',
        icon: '🍃'
    },


];

// ===== THEME DATA UTILITIES ===== //

/**
 * Get theme by ID
 */
export const getThemeById = (id: string): Theme | undefined => {
    return availableThemes.find(theme => theme.id === id);
};

/**
 * Get all theme IDs
 */
export const getThemeIds = (): string[] => {
    return availableThemes.map(theme => theme.id);
};

/**
 * Validate if theme ID exists
 */
export const isValidThemeId = (id: string): boolean => {
    return availableThemes.some(theme => theme.id === id);
};