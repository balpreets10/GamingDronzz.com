// src/managers/ThemeManager.ts
/**
 * ThemeManager - Optimized theme management for GamingDronzz
 * Follows Manager Pattern with single responsibility for theme loading and application
 * Optimized for startup performance - no runtime switching, just load and apply
 */

import { getAvailableThemes, isValidThemeId, getThemeById, type Theme } from '../config/themes';

interface ThemeManagerConfig {
    fallbackTheme?: string;
    enableSessionConsistency?: boolean;
    enableLogging?: boolean;
}

class ThemeManager {
    private static instance: ThemeManager | null = null;
    private static readonly STORAGE_KEY = 'gd-user-theme';
    private currentTheme: Theme | null = null;
    private config: Required<ThemeManagerConfig>;
    private isInitialized = false;
    private subscribers: Set<(theme: Theme) => void> = new Set();

    private constructor(config: ThemeManagerConfig = {}) {
        this.config = {
            fallbackTheme: 'default',
            enableSessionConsistency: true,
            enableLogging: import.meta.env?.DEV || false,
            ...config
        };
    }

    /**
     * Get ThemeManager singleton instance
     */
    public static getInstance(config?: ThemeManagerConfig): ThemeManager {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager(config);
        }
        return ThemeManager.instance;
    }

    /**
     * Initialize theme system - should be called once at app startup
     * Returns the selected theme for immediate use (e.g., preloader integration)
     */
    public async initialize(): Promise<Theme> {
        if (this.isInitialized) {
            this.log('ThemeManager already initialized');
            return this.currentTheme!;
        }

        const selectedTheme = await this.selectStartupTheme();
        await this.applyTheme(selectedTheme);
        this.currentTheme = selectedTheme;
        this.isInitialized = true;

        this.log(`ThemeManager initialized with theme: ${selectedTheme.name} (${selectedTheme.icon})`);
        return selectedTheme;
    }

    /**
     * Get current active theme
     */
    public getCurrentTheme(): Theme | null {
        return this.currentTheme;
    }

    /**
     * Force reinitialize with new theme (for edge cases)
     */
    public async reinitialize(): Promise<Theme> {
        this.isInitialized = false;
        return this.initialize();
    }

    /**
     * Set theme manually (user selection)
     * Saves to localStorage and applies immediately
     */
    public async setTheme(themeId: string): Promise<Theme | null> {
        const theme = await getThemeById(themeId);
        if (theme) {
            localStorage.setItem(ThemeManager.STORAGE_KEY, themeId);
            await this.applyTheme(theme);
            this.currentTheme = theme;
            this.notifySubscribers();
            this.log(`User selected theme: ${theme.name} (${theme.icon})`);
            return theme;
        }
        this.log(`Invalid theme ID: ${themeId}`);
        return null;
    }

    /**
     * Subscribe to theme changes
     * Returns unsubscribe function
     */
    public subscribe(callback: (theme: Theme) => void): () => void {
        this.subscribers.add(callback);
        return () => {
            this.subscribers.delete(callback);
        };
    }

    /**
     * Clear user theme preference (revert to auto selection)
     */
    public clearUserTheme(): void {
        localStorage.removeItem(ThemeManager.STORAGE_KEY);
        this.log('User theme preference cleared');
    }

    /**
     * Get user-saved theme from localStorage
     */
    private getUserSavedTheme(): string | null {
        try {
            return localStorage.getItem(ThemeManager.STORAGE_KEY);
        } catch {
            return null;
        }
    }

    /**
     * Notify all subscribers of theme change
     */
    private notifySubscribers(): void {
        if (this.currentTheme) {
            this.subscribers.forEach(callback => {
                try {
                    callback(this.currentTheme!);
                } catch (error) {
                    console.error('ThemeManager subscriber error:', error);
                }
            });
        }
    }

    /**
     * Cleanup resources
     */
    public destroy(): void {
        this.currentTheme = null;
        this.isInitialized = false;
        this.subscribers.clear();
        ThemeManager.instance = null;
    }

    // ===== PRIVATE METHODS ===== //

    /**
     * Select theme for startup based on user preference, session consistency, or random
     */
    private async selectStartupTheme(): Promise<Theme> {
        // Priority 1: User-saved theme from localStorage
        const savedThemeId = this.getUserSavedTheme();
        if (savedThemeId) {
            const savedTheme = await getThemeById(savedThemeId);
            if (savedTheme) {
                this.log(`Loaded user-saved theme: ${savedTheme.name}`);
                return savedTheme;
            }
            // Invalid saved theme, clear it
            this.clearUserTheme();
        }

        // Priority 2: Session consistency
        if (this.config.enableSessionConsistency) {
            return this.getSessionConsistentTheme();
        }

        // Priority 3: Random theme
        return this.getRandomTheme();
    }

    /**
     * Generate session-consistent theme to prevent flickering during development
     * but still provides variety across different sessions/days
     */
    private async getSessionConsistentTheme(): Promise<Theme> {
        const sessionKey = 'gd-session-theme-id';
        let sessionId = sessionStorage.getItem(sessionKey);

        if (!sessionId) {
            sessionId = this.generateSessionId();
            sessionStorage.setItem(sessionKey, sessionId);
        }

        // Create deterministic seed from session and current hour for some time-based variety
        const currentHour = new Date().getHours();
        const sessionSeed = `${sessionId}-${Math.floor(currentHour / 6)}`; // Changes every 6 hours

        const availableThemes = await getAvailableThemes();
        const themeIndex = this.generateHashFromString(sessionSeed) % availableThemes.length;
        return availableThemes[themeIndex];
    }

    /**
     * Get completely random theme
     */
    private async getRandomTheme(): Promise<Theme> {
        const availableThemes = await getAvailableThemes();
        const randomIndex = Math.floor(Math.random() * availableThemes.length);
        return availableThemes[randomIndex];
    }

    /**
     * Apply theme to document immediately
     */
    private async applyTheme(theme: Theme): Promise<void> {
        const isValid = await isValidThemeId(theme.id);
        if (!isValid) {
            this.log(`Invalid theme ID: ${theme.id}, falling back to ${this.config.fallbackTheme}`);
            const fallbackTheme = await getThemeById(this.config.fallbackTheme);
            if (fallbackTheme) {
                document.documentElement.setAttribute('data-theme', fallbackTheme.id);
            } else {
                const availableThemes = await getAvailableThemes();
                if (availableThemes.length > 0) {
                    document.documentElement.setAttribute('data-theme', availableThemes[0].id);
                }
            }
            return;
        }

        document.documentElement.setAttribute('data-theme', theme.id);
        this.log(`Applied theme: ${theme.name} (${theme.id})`);
    }

    /**
     * Generate session ID for consistency
     */
    private generateSessionId(): string {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8);
        return `${timestamp}-${random}`;
    }

    /**
     * Generate deterministic hash from string
     */
    private generateHashFromString(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Log messages (only in development or when enabled)
     */
    private log(message: string): void {
        if (this.config.enableLogging) {
            console.log(`🎨 ThemeManager: ${message}`);
        }
    }
}

export default ThemeManager;

// ===== CONVENIENCE EXPORTS ===== //

/**
 * Initialize theme system - convenience function for App.tsx
 * Returns the selected theme for immediate use
 */
export const initializeThemeSystem = async (config?: ThemeManagerConfig): Promise<Theme> => {
    const themeManager = ThemeManager.getInstance(config);
    return themeManager.initialize();
};

/**
 * Get current theme - convenience function
 */
export const getCurrentTheme = (): Theme | null => {
    const themeManager = ThemeManager.getInstance();
    return themeManager.getCurrentTheme();
};

/**
 * Set theme manually - convenience function
 * Saves to localStorage and applies immediately
 */
export const setTheme = async (themeId: string): Promise<Theme | null> => {
    const themeManager = ThemeManager.getInstance();
    return themeManager.setTheme(themeId);
};

/**
 * Subscribe to theme changes - convenience function
 */
export const subscribeToTheme = (callback: (theme: Theme) => void): (() => void) => {
    const themeManager = ThemeManager.getInstance();
    return themeManager.subscribe(callback);
};

/**
 * Export ThemeManager class and types for advanced usage
 */
export { ThemeManager };
export type { ThemeManagerConfig, Theme };