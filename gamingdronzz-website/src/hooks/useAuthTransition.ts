// hooks/useAuthTransition.ts - Authentication state transition manager
// Follows Single Responsibility Principle - only handles transition state management
import { useState, useEffect, useCallback, useRef } from 'react';

export type TransitionState = 'entering' | 'entered' | 'exiting' | 'exited';

interface AuthTransitionConfig {
    transitionDuration: number;
    reducedMotion?: boolean;
}

interface AuthTransitionState {
    currentState: TransitionState;
    isTransitioning: boolean;
    previousAuthState: boolean | null;
}

interface UseAuthTransitionReturn {
    transitionState: TransitionState;
    isTransitioning: boolean;
    transitionClasses: string;
    getLoadingSpinnerClasses: (isLoading: boolean, wasLoading: boolean) => string;
}

const DEFAULT_CONFIG: AuthTransitionConfig = {
    transitionDuration: 300, // 300ms to match CSS transition
    reducedMotion: false
};

/**
 * Custom hook for managing smooth authentication state transitions
 * Separates transition logic from UI components (Dependency Inversion Principle)
 */
export const useAuthTransition = (
    isAuthenticated: boolean,
    config: Partial<AuthTransitionConfig> = {}
): UseAuthTransitionReturn => {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const timeoutRef = useRef<NodeJS.Timeout>();
    const isFirstRender = useRef(true);
    
    const [state, setState] = useState<AuthTransitionState>({
        currentState: 'entered',
        isTransitioning: false,
        previousAuthState: null
    });

    // Handle authentication state changes with transitions
    useEffect(() => {
        // Skip transition on first render
        if (isFirstRender.current) {
            isFirstRender.current = false;
            setState(prev => ({
                ...prev,
                previousAuthState: isAuthenticated,
                currentState: 'entered'
            }));
            return;
        }

        // Only transition if auth state actually changed
        if (state.previousAuthState === isAuthenticated) {
            return;
        }

        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Skip animation if reduced motion is preferred
        if (mergedConfig.reducedMotion) {
            setState({
                currentState: 'entered',
                isTransitioning: false,
                previousAuthState: isAuthenticated
            });
            return;
        }

        // Start exit transition
        setState(prev => ({
            ...prev,
            currentState: 'exiting',
            isTransitioning: true
        }));

        // After half the transition duration, move to entering state
        timeoutRef.current = setTimeout(() => {
            setState(prev => ({
                ...prev,
                currentState: 'entering',
                previousAuthState: isAuthenticated
            }));

            // After another half duration, complete the transition
            timeoutRef.current = setTimeout(() => {
                setState(prev => ({
                    ...prev,
                    currentState: 'entered',
                    isTransitioning: false
                }));
            }, mergedConfig.transitionDuration / 2);

        }, mergedConfig.transitionDuration / 2);

    }, [isAuthenticated, mergedConfig.transitionDuration, mergedConfig.reducedMotion, state.previousAuthState]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Generate CSS classes based on current state
    const getTransitionClasses = useCallback((): string => {
        const baseClass = 'profile-dropdown__state-item';
        const stateClass = `${baseClass}--${state.currentState}`;
        
        return [baseClass, stateClass].join(' ');
    }, [state.currentState]);

    // Generate loading spinner classes for smooth loading state transitions
    const getLoadingSpinnerClasses = useCallback((isLoading: boolean, wasLoading: boolean): string => {
        const baseClass = 'profile-dropdown__loading-spinner';
        
        if (isLoading && !wasLoading) {
            // Loading state starting
            return `${baseClass} ${baseClass}--entering`;
        } else if (!isLoading && wasLoading) {
            // Loading state ending
            return `${baseClass} ${baseClass}--exiting`;
        } else if (isLoading) {
            // Currently loading
            return baseClass;
        } else {
            // Not loading
            return baseClass;
        }
    }, []);

    return {
        transitionState: state.currentState,
        isTransitioning: state.isTransitioning,
        transitionClasses: getTransitionClasses(),
        getLoadingSpinnerClasses
    };
};

/**
 * Helper function to check if user prefers reduced motion
 * Abstracts media query logic (Single Responsibility Principle)
 */
export const useReducedMotion = (): boolean => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleChange = (event: MediaQueryListEvent) => {
            setPrefersReducedMotion(event.matches);
        };

        // Set initial value
        setPrefersReducedMotion(mediaQuery.matches);

        // Listen for changes
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    return prefersReducedMotion;
};