/**
 * Utility functions for GamingDronzz application
 */

// Debounce function for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate = false
): T => {
    let timeout: NodeJS.Timeout | null = null;

    return ((...args: Parameters<T>) => {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };

        const callNow = immediate && !timeout;

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) func(...args);
    }) as T;
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): T => {
    let inThrottle: boolean;

    return ((...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }) as T;
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get viewport dimensions
export const getViewportDimensions = () => ({
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight
});

// Check if element is in viewport
export const isInViewport = (element: HTMLElement, threshold = 0): boolean => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    return (
        rect.top >= -threshold &&
        rect.left >= -threshold &&
        rect.bottom <= windowHeight + threshold &&
        rect.right <= windowWidth + threshold
    );
};

// Generate unique IDs
export const generateId = (prefix = 'gd'): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format numbers with commas
export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
};

// Clamp value between min and max
export const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
};

// Linear interpolation
export const lerp = (start: number, end: number, factor: number): number => {
    return start + (end - start) * factor;
};

// Convert hex to rgba
export const hexToRgba = (hex: string, alpha = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Create CSS custom properties object
export const createCSSVariables = (variables: Record<string, string | number>) => {
    return Object.entries(variables).reduce((acc, [key, value]) => {
        acc[`--${key}`] = typeof value === 'number' ? `${value}px` : value;
        return acc;
    }, {} as Record<string, string>);
};

// ===== THEME ROTATION UTILITIES ===== //

export interface ThemeOption {
    id: string;
    name: string;
    icon: string;
    colors: {
        primary: string;
        secondary: string;
        bg: string;
    };
    description: string;
}

// Available themes - sync with ThemeSwitcher.tsx
export const availableThemes: ThemeOption[] = [
    {
        id: 'default',
        name: 'Formal',
        icon: '☀️',
        colors: { primary: '#007bff', secondary: '#6c757d', bg: '#ffffff' },
        description: 'Clean and professional light theme'
    },
    {
        id: 'dark-cyber',
        name: 'Dark Cyber',
        icon: '🌙',
        colors: { primary: '#00ffff', secondary: '#ff00ff', bg: '#0a0a0f' },
        description: 'Futuristic neon cyberpunk aesthetic'
    },
    {
        id: 'gaming-inferno',
        name: 'Gaming Inferno',
        icon: '🔥',
        colors: { primary: '#ff4500', secondary: '#ff8c00', bg: '#1a0a00' },
        description: 'Fiery red-orange gaming atmosphere'
    },
    {
        id: 'ocean-deep',
        name: 'Ocean Deep',
        icon: '🌊',
        colors: { primary: '#20b2aa', secondary: '#4682b4', bg: '#001122' },
        description: 'Calming deep ocean blues and teals'
    },
    {
        id: 'retro-arcade',
        name: 'Retro Arcade',
        icon: '🎮',
        colors: { primary: '#ff0080', secondary: '#00ff80', bg: '#0a0a0a' },
        description: '80s neon synthwave arcade vibes'
    },
    {
        id: 'minimal-green',
        name: 'Minimal Green',
        icon: '🍃',
        colors: { primary: '#00c851', secondary: '#2e7d32', bg: '#ffffff' },
        description: 'Clean minimalist green design'
    },
    {
        id: 'sakura-bloom',
        name: 'Sakura Bloom',
        icon: '🌸',
        colors: { primary: '#ff69b4', secondary: '#ffc0cb', bg: '#fef7f0' },
        description: 'Soft pink cherry blossom theme'
    },
    // {
    //     id: 'electric-storm',
    //     name: 'Electric Storm',
    //     icon: '⚡',
    //     colors: { primary: '#ffd700', secondary: '#9932cc', bg: '#191970' },
    //     description: 'Lightning yellow and purple energy'
    // },
    {
        id: 'forest-tech',
        name: 'Forest Tech',
        icon: '🌲',
        colors: { primary: '#228b22', secondary: '#8b4513', bg: '#0d2818' },
        description: 'Nature-tech fusion with greens and browns'
    },
    {
        id: 'arctic-frost',
        name: 'Arctic Frost',
        icon: '❄️',
        colors: { primary: '#87ceeb', secondary: '#b0e0e6', bg: '#f0f8ff' },
        description: 'Cool whites and icy light blues'
    }
];

/**
 * Apply theme to the document
 */
export const applyTheme = (themeId: string): void => {
    document.documentElement.setAttribute('data-theme', themeId);
};

/**
 * Get current applied theme
 */
export const getCurrentTheme = (): string => {
    return document.documentElement.getAttribute('data-theme') || 'default';
};

/**
 * Get a random theme, optionally excluding the current one for variety
 */
export const getRandomTheme = (excludeCurrent = true): ThemeOption => {
    const currentTheme = getCurrentTheme();
    let availableOptions = availableThemes;

    if (excludeCurrent && availableOptions.length > 1) {
        availableOptions = availableThemes.filter(theme => theme.id !== currentTheme);
    }

    const randomIndex = Math.floor(Math.random() * availableOptions.length);
    return availableOptions[randomIndex];
};

/**
 * Initialize auto theme rotation on page load
 * This function should be called once when the app starts
 */
export const initAutoThemeRotation = (): ThemeOption => {
    // Generate session seed for consistent theme during the session (prevents flickering on hot reloads in dev)
    const sessionKey = 'gd-session-id';
    let sessionId = sessionStorage.getItem(sessionKey);

    if (!sessionId) {
        sessionId = generateId('session');
        sessionStorage.setItem(sessionKey, sessionId);
    }

    // Use session ID and timestamp to generate consistent random theme for this session
    const sessionSeed = sessionId + Date.now().toString().slice(0, -3); // Remove last 3 digits for some time grouping
    const seedHash = sessionSeed.split('').reduce((hash, char) => {
        hash = ((hash << 5) - hash) + char.charCodeAt(0);
        return hash & hash; // Convert to 32-bit integer
    }, 0);

    const themeIndex = Math.abs(seedHash) % availableThemes.length;
    const selectedTheme = availableThemes[themeIndex];

    // Apply the theme immediately
    applyTheme(selectedTheme.id);

    // Store for potential manual theme switcher reference
    localStorage.setItem('gd-auto-theme', selectedTheme.id);

    // Optional: Log the selected theme (remove in production)
    if (import.meta.env.DEV) {
        console.log(`🎨 Auto-selected theme: ${selectedTheme.name} (${selectedTheme.icon})`);
    }

    return selectedTheme;
};

/**
 * Force rotate to a new random theme (can be used for manual refresh)
 */
export const rotateToNewTheme = (): ThemeOption => {
    const newTheme = getRandomTheme(true);
    applyTheme(newTheme.id);
    localStorage.setItem('gd-auto-theme', newTheme.id);

    // Analytics tracking if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'theme_auto_rotate', {
            theme_name: newTheme.id,
            custom_parameter: 'auto_rotation'
        });
    }

    return newTheme;
};

/**
 * Get the theme that was auto-selected for this session
 */
export const getAutoSelectedTheme = (): string | null => {
    return localStorage.getItem('gd-auto-theme');
};

/**
 * Check if auto-theme rotation is enabled
 * You can use this to toggle between manual and auto theme systems
 */
export const isAutoThemeEnabled = (): boolean => {
    return localStorage.getItem('gd-theme-mode') !== 'manual';
};

/**
 * Enable/disable auto theme rotation
 */
export const setAutoThemeMode = (enabled: boolean): void => {
    if (enabled) {
        localStorage.removeItem('gd-theme-mode');
        // Initialize auto rotation if enabling
        initAutoThemeRotation();
    } else {
        localStorage.setItem('gd-theme-mode', 'manual');
        // Keep current theme when switching to manual
        const currentTheme = getCurrentTheme();
        localStorage.setItem('gd-theme', currentTheme);
    }
};