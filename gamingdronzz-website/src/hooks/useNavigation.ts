/**
 * Optimized useNavigation Hook - Fixed infinite loop issues
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
    const { autoInit = true, customConfig } = options;

    // Stable refs
    const managerRef = useRef<NavigationManager | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);
    const onStateChangeRef = useRef(options.onStateChange);

    // Update ref without causing re-render
    onStateChangeRef.current = options.onStateChange;

    // Default config - memoized to prevent re-creation
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

    const [state, setState] = useState<NavigationState>(() => ({
        isOpen: false,
        activeItem: null,
        hoveredItem: null,
        focusedItem: null,
        keyboardMode: false,
        isAnimating: false
    }));

    const [config, setConfig] = useState<NavigationConfig>(defaultConfig);

    // Initialize manager once
    useEffect(() => {
        if (!autoInit) return;

        managerRef.current = NavigationManager.getInstance();

        if (customConfig) {
            managerRef.current.updateConfig(customConfig);
        }

        // Set initial config and state
        const managerConfig = managerRef.current.getConfig();
        setConfig({ ...defaultConfig, ...managerConfig });
        setState(managerRef.current.getState());

        // Subscribe with stable callback
        unsubscribeRef.current = managerRef.current.subscribe((newState) => {
            setState(newState);
            onStateChangeRef.current?.(newState);
        });

        return () => {
            unsubscribeRef.current?.();
            unsubscribeRef.current = null;
        };
    }, [autoInit, defaultConfig]); // Only depend on stable values

    // Update config when customConfig changes
    useEffect(() => {
        if (customConfig && managerRef.current) {
            managerRef.current.updateConfig(customConfig);
            const updatedConfig = managerRef.current.getConfig();
            setConfig({ ...defaultConfig, ...updatedConfig });
        }
    }, [customConfig, defaultConfig]);

    // Memoized actions
    const actions = useMemo(() => ({
        open: () => managerRef.current?.open(),
        close: () => managerRef.current?.close(),
        toggle: () => managerRef.current?.toggle(),
        navigate: (itemId: string) => managerRef.current?.navigate(itemId),
        setHovered: (itemId: string | null) => managerRef.current?.setHoveredItem(itemId)
    }), []);

    const updateConfig = useCallback((newConfig: Partial<NavigationConfig>) => {
        if (managerRef.current) {
            managerRef.current.updateConfig(newConfig);
            const updatedConfig = managerRef.current.getConfig();
            setConfig({ ...defaultConfig, ...updatedConfig });
        }
    }, [defaultConfig]);

    return { state, actions, config, updateConfig };
};

/**
 * Optimized useNavigationEvents Hook
 */
export const useNavigationEvents = (
    eventType: NavigationEvent['type'] | 'all',
    callback: (event: NavigationEvent) => void,
    deps: React.DependencyList = []
) => {
    const callbackRef = useRef(callback);
    callbackRef.current = callback; // Always use latest callback

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
                callbackRef.current(event);
            }
        };

        const events = eventType === 'all'
            ? ['navigation:open', 'navigation:close', 'navigation:navigate', 'navigation:hover', 'navigation:focus']
            : [`navigation:${eventType}`];

        events.forEach(eventName => {
            document.addEventListener(eventName, handleEvent);
        });

        return () => {
            events.forEach(eventName => {
                document.removeEventListener(eventName, handleEvent);
            });
        };
    }, [eventType, ...deps]); // Remove callback from deps
};

/**
 * Simplified navigation item hook
 */
export const useNavigationItem = (itemId: string) => {
    const { state, actions } = useNavigation();

    return useMemo(() => ({
        isActive: state.activeItem === itemId,
        isHovered: state.hoveredItem === itemId,
        isFocused: state.focusedItem === itemId,
        navigate: () => actions.navigate(itemId),
        setHovered: (hovered: boolean) => actions.setHovered(hovered ? itemId : null)
    }), [state.activeItem, state.hoveredItem, state.focusedItem, itemId, actions]);
};

export default useNavigation;