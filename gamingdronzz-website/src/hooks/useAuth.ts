// hooks/useAuth.ts - Enhanced with notification integration
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import AuthManager from '../managers/AuthManager';
import NotificationManager from '../utils/NotificationManager';

interface UseAuthReturn {
    user: User | null;
    session: any;
    loading: boolean;
    isAdmin: boolean;
    initialized: boolean;
    isAuthenticated: boolean;
    failedAttempts: number;
    isLocked: boolean;
    lockoutTimeRemaining: number;
    signInWithGoogle: () => Promise<{ success: boolean; data?: any; error?: any }>;
    signInWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; data?: any; error?: any }>;
    signUpWithEmail: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: any }>;
    signOut: () => Promise<{ success: boolean; error?: any }>;
    getLockoutMessage: () => string | null;
}

export const useAuth = (): UseAuthReturn => {
    const [authState, setAuthState] = useState(() =>
        AuthManager.getInstance().getState()
    );
    const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

    useEffect(() => {
        const authManager = AuthManager.getInstance();
        const notificationManager = NotificationManager.getInstance();

        // Set up notification callback for auth manager
        authManager.setNotificationCallback((message: string, type: 'success' | 'error') => {
            if (type === 'success') {
                notificationManager.success(message);
            } else {
                notificationManager.error(message);
            }
        });

        authManager.init();

        const unsubscribe = authManager.subscribe(setAuthState);

        return unsubscribe;
    }, []);

    // Handle lockout countdown
    useEffect(() => {
        if (!authState.isLocked) {
            setLockoutTimeRemaining(0);
            return;
        }

        const authManager = AuthManager.getInstance();

        const updateCountdown = () => {
            const remaining = authManager.getRemainingLockoutTime();
            setLockoutTimeRemaining(remaining);

            if (remaining <= 0) {
                // Lockout expired, trigger a state update
                authManager.init();
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [authState.isLocked, authState.lockoutExpiry]);

    const signInWithGoogle = async () => {
        const authManager = AuthManager.getInstance();
        return await authManager.signInWithGoogle();
    };

    const signInWithEmail = async (email: string, password: string, rememberMe: boolean = false) => {
        const authManager = AuthManager.getInstance();
        return await authManager.signInWithEmail(email, password, rememberMe);
    };

    const signUpWithEmail = async (email: string, password: string) => {
        const authManager = AuthManager.getInstance();
        return await authManager.signUpWithEmail(email, password);
    };

    const signOut = async () => {
        const authManager = AuthManager.getInstance();
        return await authManager.signOut();
    };

    const getLockoutMessage = (): string | null => {
        if (!authState.isLocked) return null;

        const minutes = Math.ceil(lockoutTimeRemaining / 60000);
        const seconds = Math.ceil((lockoutTimeRemaining % 60000) / 1000);

        if (minutes > 0) {
            return `Account locked. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`;
        } else if (seconds > 0) {
            return `Account locked. Try again in ${seconds} second${seconds !== 1 ? 's' : ''}.`;
        } else {
            return 'Account locked. Please refresh the page.';
        }
    };

    return {
        ...authState,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        isAuthenticated: authState.user !== null,
        lockoutTimeRemaining,
        getLockoutMessage
    };
};

export default useAuth;