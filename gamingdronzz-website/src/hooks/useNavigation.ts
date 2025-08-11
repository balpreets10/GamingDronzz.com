/**
 * useNavigation Hook - React hook for NavigationManager integration
 * Provides clean React interface for navigation system
 */

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import NavigationManager from '../managers/NavigationManager';
import type {
    NavigationState,
    NavigationConfig,
    UseNavigationOptions,
    UseNavigationReturn,
    NavigationEvent
} from '../types/navigation';

const useNavigation = (options: UseNavigationOptions = {}): UseNavigationReturn => {
    const {
        autoInit = true,
        customConfig,
        onStateChange
    } = options;

    const [state, setState] = useState<NavigationState>({
        isOpen: false,
        activeItem: null,
        hoveredItem: null,
        focusedItem: null,
        keyboardMode: false,
        isAnimating: false
    });

    // Default configuration to ensure all required properties exist
    const defaultConfig: NavigationConfig = useMemo(() => ({
        items: [],
        animationDuration: 300,
        radius: 120,
        centerSize: 60,
        itemSize: 50,
        autoClose: true,
        closeDelay: 1000,
        enableKeyboard: true,
        enableTouch: true,
        centerIcon: 'menu',
        centerLabel: 'Menu'
    }), []);

    const [config, setConfig] = useState<NavigationConfig>(defaultConfig);

    const managerRef = useRef<NavigationManager | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    // Initialize manager
    useEffect(() => {
        if (autoInit) {
            managerRef.current = NavigationManager.getInstance();

            // Apply custom config if provided
            if (customConfig) {
                managerRef.current.updateConfig(customConfig);
            }

            // Get config from manager and merge with defaults
            const managerConfig = managerRef.current.getConfig();
            const mergedConfig: NavigationConfig = {
                ...defaultConfig,
                ...managerConfig
            };
            setConfig(mergedConfig);

            // Subscribe to state changes
            unsubscribeRef.current = managerRef.current.subscribe((newState) => {
                setState(newState);
                onStateChange?.(newState);
            });

            // Set initial state
            setState(managerRef.current.getState());
        }

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [autoInit, customConfig, onStateChange, defaultConfig]);

    // Navigation actions
    const open = useCallback(() => {
        managerRef.current?.open();
    }, []);

    const close = useCallback(() => {
        managerRef.current?.close();
    }, []);

    const toggle = useCallback(() => {
        managerRef.current?.toggle();
    }, []);

    const navigate = useCallback((itemId: string) => {
        managerRef.current?.navigate(itemId);
    }, []);

    const setHovered = useCallback((itemId: string | null) => {
        managerRef.current?.setHoveredItem(itemId);
    }, []);

    const updateConfig = useCallback((newConfig: Partial<NavigationConfig>) => {
        if (managerRef.current) {
            managerRef.current.updateConfig(newConfig);
            const updatedConfig = managerRef.current.getConfig();
            const mergedConfig: NavigationConfig = {
                ...defaultConfig,
                ...config,
                ...updatedConfig
            };
            setConfig(mergedConfig);
        }
    }, [config, defaultConfig]);

    return {
        state,
        actions: {
            open,
            close,
            toggle,
            navigate,
            setHovered
        },
        config,
        updateConfig
    };
};

/**
 * useNavigationEvents Hook - Listen to navigation events
 */
export const useNavigationEvents = (
    eventType: NavigationEvent['type'] | 'all',
    callback: (event: NavigationEvent) => void,
    deps: React.DependencyList = []
) => {
    useEffect(() => {
        const handleEvent = (e: Event) => {
            const customEvent = e as CustomEvent;
            const event: NavigationEvent = {
                type: customEvent.type.replace('navigation:', '') as NavigationEvent['type'],
                item: customEvent.detail?.item,
                state: customEvent.detail?.state || NavigationManager.getInstance().getState(),
                timestamp: Date.now()
            };

            if (eventType === 'all' || event.type === eventType) {
                callback(event);
            }
        };

        if (eventType === 'all') {
            const events = ['navigation:open', 'navigation:close', 'navigation:navigate', 'navigation:hover', 'navigation:focus'];

            events.forEach(eventName => {
                document.addEventListener(eventName, handleEvent);
            });

            return () => {
                events.forEach(eventName => {
                    document.removeEventListener(eventName, handleEvent);
                });
            };
        } else {
            const eventName = `navigation:${eventType}`;
            document.addEventListener(eventName, handleEvent);
            return () => document.removeEventListener(eventName, handleEvent);
        }
    }, [eventType, callback, ...deps]);
};

/**
 * useNavigationItem Hook - Utilities for navigation items
 */
export const useNavigationItem = (itemId: string) => {
    const { state, actions } = useNavigation();

    const isActive = state.activeItem === itemId;
    const isHovered = state.hoveredItem === itemId;
    const isFocused = state.focusedItem === itemId;

    const navigate = useCallback(() => {
        actions.navigate(itemId);
    }, [itemId, actions]);

    const setHovered = useCallback((hovered: boolean) => {
        actions.setHovered(hovered ? itemId : null);
    }, [itemId, actions]);

    return {
        isActive,
        isHovered,
        isFocused,
        navigate,
        setHovered
    };
};

/**
 * useNavigationKeyboard Hook - Keyboard navigation utilities
 */
export const useNavigationKeyboard = () => {
    const { state, actions } = useNavigation();

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!state.isOpen) return;

        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                actions.close();
                break;

            case 'Enter':
            case ' ':
                if (state.focusedItem) {
                    e.preventDefault();
                    actions.navigate(state.focusedItem);
                }
                break;
        }
    }, [state.isOpen, state.focusedItem, actions]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return {
        isKeyboardMode: state.keyboardMode,
        focusedItem: state.focusedItem
    };
};

/**
 * useNavigationAnalytics Hook - Track navigation analytics
 */
export const useNavigationAnalytics = (
    trackEvent: (event: string, data: any) => void
) => {
    useNavigationEvents('all', (event) => {
        const analyticsData = {
            action: `navigation_${event.type}`,
            item_id: event.item?.id,
            item_label: event.item?.label,
            timestamp: event.timestamp,
            state: event.state
        };

        trackEvent('navigation_interaction', analyticsData);
    });
};

/**
 * useNavigationA11y Hook - Accessibility utilities
 */
export const useNavigationA11y = () => {
    const { state } = useNavigation();

    // Announce state changes to screen readers
    useEffect(() => {
        const announcement = state.isOpen
            ? 'Navigation menu opened'
            : 'Navigation menu closed';

        // Create or update live region for announcements
        let liveRegion = document.getElementById('nav-announcements');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'nav-announcements';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            document.body.appendChild(liveRegion);
        }

        liveRegion.textContent = announcement;
    }, [state.isOpen]);

    return {
        announceToScreenReader: (message: string) => {
            const liveRegion = document.getElementById('nav-announcements');
            if (liveRegion) {
                liveRegion.textContent = message;
            }
        }
    };
};

/**
 * useNavigationPerformance Hook - Performance monitoring
 */
export const useNavigationPerformance = () => {
    const startTimeRef = useRef<number>(0);

    useNavigationEvents('open', () => {
        startTimeRef.current = performance.now();
    });

    useNavigationEvents('close', () => {
        if (startTimeRef.current > 0) {
            const duration = performance.now() - startTimeRef.current;
            console.log(`Navigation session duration: ${duration.toFixed(2)}ms`);
            startTimeRef.current = 0;
        }
    });

    return {
        measureNavigationTiming: (callback: (duration: number) => void) => {
            const start = performance.now();
            return () => {
                const duration = performance.now() - start;
                callback(duration);
            };
        }
    };
};

export default useNavigation;