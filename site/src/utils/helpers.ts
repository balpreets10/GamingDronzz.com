/**
 * Utility functions for GamingDronzz application
 * General purpose utilities - theme functions are in utils/themeHelper.ts
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