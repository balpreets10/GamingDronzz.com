// hooks/useAuth.ts - Fixed Supabase integration with proper types
import { useState, useEffect, useCallback } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import SupabaseService from '../services/SupabaseService';
import NotificationManager from '../utils/NotificationManager';

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

interface AuthResult {
    success: boolean;
    error?: { message: string } | null;
    data?: any;
}

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        session: null,
        loading: true,
        isAuthenticated: false,
        isAdmin: false
    });

    const notificationManager = NotificationManager.getInstance();

    // Initialize auth state
    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                const { session, error } = await SupabaseService.getSession();

                if (mounted) {
                    if (session?.user) {
                        const adminStatus = await SupabaseService.isAdmin(session.user.id);
                        setAuthState({
                            user: session.user,
                            session,
                            loading: false,
                            isAuthenticated: true,
                            isAdmin: adminStatus
                        });
                    } else {
                        setAuthState({
                            user: null,
                            session: null,
                            loading: false,
                            isAuthenticated: false,
                            isAdmin: false
                        });
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                if (mounted) {
                    setAuthState({
                        user: null,
                        session: null,
                        loading: false,
                        isAuthenticated: false,
                        isAdmin: false
                    });
                }
            }
        };

        initializeAuth();

        return () => {
            mounted = false;
        };
    }, []);

    // Listen for auth changes - FIXED: Properly handle the cleanup function
    useEffect(() => {
        const unsubscribe = SupabaseService.onAuthStateChange(
            async (event: AuthChangeEvent, session: Session | null) => {
                console.log('Auth state change:', event);

                if (session?.user) {
                    const adminStatus = await SupabaseService.isAdmin(session.user.id);
                    setAuthState({
                        user: session.user,
                        session,
                        loading: false,
                        isAuthenticated: true,
                        isAdmin: adminStatus
                    });

                    // Show welcome notification for sign in events
                    if (event === 'SIGNED_IN') {
                        const userName = session.user.user_metadata?.full_name ||
                            session.user.user_metadata?.name ||
                            session.user.email?.split('@')[0] ||
                            'User';

                        notificationManager.show(
                            `Welcome back, ${userName}!`,
                            'success',
                            3000
                        );
                    }
                } else {
                    setAuthState({
                        user: null,
                        session: null,
                        loading: false,
                        isAuthenticated: false,
                        isAdmin: false
                    });

                    // Show sign out notification
                    if (event === 'SIGNED_OUT') {
                        notificationManager.show(
                            'You have been signed out',
                            'info',
                            2000
                        );
                    }
                }
            }
        );

        // FIXED: Return the unsubscribe function directly
        return unsubscribe;
    }, [notificationManager]);

    // Google OAuth sign in
    const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
        try {
            console.log('Starting Google OAuth sign in...');

            const { data, error } = await SupabaseService.signInWithGoogle();

            if (error) {
                console.error('Google OAuth error:', error);
                notificationManager.show(
                    error.message || 'Google sign in failed',
                    'error',
                    5000
                );
                return { success: false, error };
            }

            // OAuth redirect will handle the rest
            console.log('Google OAuth redirect initiated');
            return { success: true, data };

        } catch (error: any) {
            console.error('Google sign in error:', error);
            const errorMessage = error?.message || 'Google sign in failed';
            notificationManager.show(errorMessage, 'error', 5000);
            return { success: false, error: { message: errorMessage } };
        }
    }, [notificationManager]);

    // Email/password sign in
    const signInWithEmail = useCallback(async (
        email: string,
        password: string,
        rememberMe: boolean = false
    ): Promise<AuthResult> => {
        try {
            const { data, error } = await SupabaseService.signInWithEmail(email, password, rememberMe);

            if (error) {
                notificationManager.show(
                    error.message || 'Sign in failed',
                    'error',
                    5000
                );
                return { success: false, error };
            }

            return { success: true, data };

        } catch (error: any) {
            console.error('Email sign in error:', error);
            const errorMessage = error?.message || 'Sign in failed';
            notificationManager.show(errorMessage, 'error', 5000);
            return { success: false, error: { message: errorMessage } };
        }
    }, [notificationManager]);

    // Email/password sign up
    const signUpWithEmail = useCallback(async (
        email: string,
        password: string
    ): Promise<AuthResult> => {
        try {
            const { data, error } = await SupabaseService.signUpWithEmail(email, password);

            if (error) {
                notificationManager.show(
                    error.message || 'Sign up failed',
                    'error',
                    5000
                );
                return { success: false, error };
            }

            notificationManager.show(
                'Account created! Please check your email to verify.',
                'success',
                7000
            );

            return { success: true, data };

        } catch (error: any) {
            console.error('Email sign up error:', error);
            const errorMessage = error?.message || 'Sign up failed';
            notificationManager.show(errorMessage, 'error', 5000);
            return { success: false, error: { message: errorMessage } };
        }
    }, [notificationManager]);

    // Sign out
    const signOut = useCallback(async (): Promise<AuthResult> => {
        try {
            const { error } = await SupabaseService.signOut();

            if (error) {
                notificationManager.show(
                    error.message || 'Sign out failed',
                    'error',
                    5000
                );
                return { success: false, error };
            }

            return { success: true };

        } catch (error: any) {
            console.error('Sign out error:', error);
            const errorMessage = error?.message || 'Sign out failed';
            notificationManager.show(errorMessage, 'error', 5000);
            return { success: false, error: { message: errorMessage } };
        }
    }, [notificationManager]);

    // Handle OAuth callback
    const handleOAuthCallback = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        try {
            console.log('Handling OAuth callback...');
            const result = await SupabaseService.handleOAuthCallback();

            if (result.success) {
                notificationManager.show(
                    'Successfully signed in with Google!',
                    'success',
                    3000
                );
            } else {
                notificationManager.show(
                    result.error || 'OAuth authentication failed',
                    'error',
                    5000
                );
            }

            return result;

        } catch (error: any) {
            console.error('OAuth callback error:', error);
            const errorMessage = error?.message || 'OAuth callback failed';
            notificationManager.show(errorMessage, 'error', 5000);
            return { success: false, error: errorMessage };
        }
    }, [notificationManager]);

    return {
        ...authState,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        handleOAuthCallback
    };
};