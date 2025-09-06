// hooks/useAuth.ts - Functional auth hook with Google OAuth
import { useState, useCallback, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile, ExtendedAuthState, ProfileCompletionStatus } from '../types/profile';
import { AuthResult } from '../types/auth';
import AuthService from '../services/AuthService';

// Using types from profile.ts for consistency
type AuthState = ExtendedAuthState;

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        session: null,
        loading: true,
        isAuthenticated: false,
        isAdmin: false,
        profile: null,
        profileLoading: false,
        profileCompleted: false,
        profileCompletionPercentage: 0
    });

    // Debug state changes
    useEffect(() => {
        console.log('🔄 AUTH STATE CHANGED:', {
            loading: authState.loading,
            isAuthenticated: authState.isAuthenticated,
            hasUser: !!authState.user,
            hasSession: !!authState.session,
            userId: authState.user?.id || 'none'
        });
    }, [authState]);

    // Initialize auth state and set up listener
    useEffect(() => {
        console.log('useAuth: Initializing...');
        let isSubscribed = true;
        let unsubscribe: (() => void) | null = null;

        const initializeAuth = async () => {
            try {
                // Get initial session
                const { session, error } = await AuthService.getSession();
                
                if (error) {
                    console.error('useAuth: Initial session error:', error);
                    if (isSubscribed) {
                        setAuthState(prev => ({ ...prev, loading: false }));
                    }
                    return;
                }

                console.log('useAuth: Initial session:', session?.user?.id || 'none', session ? 'EXISTS' : 'NULL');
                if (isSubscribed) {
                    await updateAuthState(session);
                }

                // Only set up listener after initial session is processed
                if (isSubscribed) {
                    unsubscribe = AuthService.onAuthStateChange(async (event, session) => {
                        // Ignore INITIAL_SESSION events to prevent duplicate processing
                        if (event === 'INITIAL_SESSION') {
                            console.log('🎯 Ignoring INITIAL_SESSION event to prevent duplicates');
                            return;
                        }
                        
                        console.log('🎯 AUTH STATE CHANGE EVENT:', {
                            event,
                            userId: session?.user?.id || 'none',
                            userEmail: session?.user?.email || 'none',
                            timestamp: new Date().toISOString(),
                            sessionExists: !!session,
                            tokenExists: !!session?.access_token
                        });
                        
                        if (isSubscribed) {
                            await updateAuthState(session);
                        }
                    });
                }
            } catch (error) {
                console.error('useAuth: Failed to initialize auth:', error);
                if (isSubscribed) {
                    setAuthState(prev => ({ ...prev, loading: false }));
                }
            }
        };

        initializeAuth();

        return () => {
            console.log('useAuth: Cleaning up listener');
            isSubscribed = false;
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [])

    const updateAuthState = useCallback(async (session: Session | null) => {
        console.log('🔄 updateAuthState called');
        console.log('📋 Session details:', {
            exists: !!session,
            userId: session?.user?.id || 'none',
            userEmail: session?.user?.email || 'none',
            expiresAt: session?.expires_at ? new Date(session.expires_at * 1000) : 'none',
            accessToken: session?.access_token ? '***EXISTS***' : 'none',
            refreshToken: session?.refresh_token ? '***EXISTS***' : 'none'
        });
        
        // Add timeout protection for updateAuthState to prevent hanging
        const updatePromise = new Promise(async (resolve) => {
            try {
                await processAuthState(session);
                resolve(true);
            } catch (error) {
                console.error('❌ updateAuthState: Error in processAuthState:', error);
                resolve(false);
            }
        });
        
        const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => {
                console.warn('⚠️ updateAuthState: Timeout reached, continuing...');
                resolve(false);
            }, 5000);
        });
        
        await Promise.race([updatePromise, timeoutPromise]);
    }, []);

    const processAuthState = async (session: Session | null) => {
        console.log('🔍 CHECKPOINT 1: About to process session...');
        
        try {
            if (!session || !session.user) {
                console.log('❌ No session or user - setting unauthenticated state');
                const newState = {
                    user: null,
                    session: null,
                    loading: false,
                    isAuthenticated: false,
                    isAdmin: false,
                    profile: null,
                    profileLoading: false,
                    profileCompleted: false,
                    profileCompletionPercentage: 0
                };
                console.log('🔒 Auth state set to:', newState);
                setAuthState(newState);
                return;
            }

            console.log('✅ Valid session found - updating authenticated state');
            console.log('👤 User info:', {
                id: session.user.id,
                email: session.user.email,
                emailVerified: session.user.email_confirmed_at,
                lastSignIn: session.user.last_sign_in_at,
                provider: session.user.app_metadata?.provider
            });

            console.log('🔍 CHECKPOINT 2: About to check admin status...');
            
            // Check admin status - profiles are created automatically by database triggers
            console.log('🔍 Checking admin status...');
            let isAdmin = false;
            
            try {
                isAdmin = await AuthService.isAdmin(session.user.id);
                console.log('🛡️ Admin status:', isAdmin);
                console.log('✅ CHECKPOINT 3: Profile exists (created automatically by database trigger)');
                
                // Perform role-based adjustments
                if (isAdmin) {
                    console.log('👑 Admin user detected - applying admin adjustments');
                    // Add any admin-specific initialization here
                } else {
                    console.log('👤 Regular user - applying user adjustments');
                    // Add any user-specific initialization here
                }
                
            } catch (adminError) {
                console.warn('⚠️ Admin check failed, defaulting to false:', adminError);
                isAdmin = false;
            }
            
            console.log('🔍 CHECKPOINT 4: Profile operations complete, setting final state...');

            const newState = {
                user: session.user,
                session: session,
                loading: false,
                isAuthenticated: true,
                isAdmin,
                profile: null,
                profileLoading: false,
                profileCompleted: true, // Profiles are automatically created and considered complete
                profileCompletionPercentage: 100 // Auto-created profiles are considered 100% complete
            };
            
            console.log('🔓 Auth state set to:', {
                ...newState,
                session: '***SESSION_OBJECT***',
                user: {
                    id: newState.user.id,
                    email: newState.user.email
                }
            });
            
            console.log('🔍 CHECKPOINT 5: About to call setAuthState...');
            setAuthState(newState);
            console.log('🔍 CHECKPOINT 6: setAuthState called successfully - auth flow COMPLETE');

        } catch (error) {
            console.error('❌ processAuthState: Failed to update auth state:', error);
            console.log('🔄 Setting error state with loading: false');
            setAuthState(prev => ({
                ...prev,
                loading: false
            }));
        }
    };
    
    const [profileStatus] = useState<ProfileCompletionStatus | null>(null);

    // Functional auth methods
    const loadUserProfile = useCallback(async (userId: string, forceRefresh: boolean = false): Promise<void> => {
        // Profile loading implementation can be added later if needed
        console.log('loadUserProfile called for:', userId);
    }, []);
    
    const calculateProfileCompletionPercentage = useCallback((profile: UserProfile): number => {
        // Simple profile completion calculation
        if (!profile) return 0;
        let completed = 0;
        let total = 0;
        
        // Check required fields
        if (profile.full_name) completed++;
        total++;
        
        if (profile.email) completed++;
        total++;
        
        return Math.round((completed / total) * 100);
    }, []);

    const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
        try {
            console.log('useAuth: Initiating Google sign-in...');
            setAuthState(prev => ({ ...prev, loading: true }));
            
            const result = await AuthService.signInWithGoogle();
            
            if (result.error) {
                console.error('useAuth: Google sign-in error:', result.error);
                setAuthState(prev => ({ ...prev, loading: false }));
                return { success: false, error: result.error };
            }
            
            // The auth state will be updated automatically via the listener
            return { success: true };
        } catch (error) {
            console.error('useAuth: Google sign-in failed:', error);
            setAuthState(prev => ({ ...prev, loading: false }));
            return { success: false, error: { message: 'Sign-in failed' } };
        }
    }, []);

    const signInWithEmail = useCallback(async (
        email: string,
        password: string,
        rememberMe: boolean = false
    ): Promise<AuthResult> => {
        return { success: false, error: { message: 'Email auth not implemented' } };
    }, []);

    const signUpWithEmail = useCallback(async (
        email: string,
        password: string
    ): Promise<AuthResult> => {
        return { success: false, error: { message: 'Email auth not implemented' } };
    }, []);

    const signOut = useCallback(async (): Promise<AuthResult> => {
        try {
            console.log('useAuth: Signing out...');
            setAuthState(prev => ({ ...prev, loading: true }));
            
            const { error } = await AuthService.signOut();
            
            if (error) {
                console.error('useAuth: Sign out error:', error);
                setAuthState(prev => ({ ...prev, loading: false }));
                return { success: false, error };
            }
            
            // Immediately reset auth state to ensure clean logout
            console.log('useAuth: Resetting auth state after successful logout');
            setAuthState({
                user: null,
                session: null,
                loading: false,
                isAuthenticated: false,
                isAdmin: false,
                profile: null,
                profileLoading: false,
                profileCompleted: false,
                profileCompletionPercentage: 0
            });
            
            return { success: true };
        } catch (error) {
            console.error('useAuth: Sign out failed:', error);
            setAuthState(prev => ({ ...prev, loading: false }));
            return { success: false, error: { message: 'Sign out failed' } };
        }
    }, []);

    const handleOAuthCallback = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        try {
            console.log('useAuth: Handling OAuth callback...');
            const result = await AuthService.handleOAuthCallback();
            
            if (!result.success) {
                console.error('useAuth: OAuth callback failed:', result.error);
            } else {
                console.log('useAuth: OAuth callback successful');
            }
            
            return result;
        } catch (error) {
            console.error('useAuth: OAuth callback error:', error);
            const errorMsg = error instanceof Error ? error.message : 'OAuth callback failed';
            return { success: false, error: errorMsg };
        }
    }, []);

    const refreshProfile = useCallback(async (): Promise<AuthResult> => {
        if (!authState.user) {
            return { success: false, error: { message: 'No user to refresh' } };
        }
        
        try {
            await updateAuthState(authState.session);
            return { success: true };
        } catch (error) {
            console.error('useAuth: Profile refresh failed:', error);
            return { success: false, error: { message: 'Profile refresh failed' } };
        }
    }, [authState.user, authState.session]);

    const completeProfile = useCallback(async (additionalData?: Record<string, any>): Promise<AuthResult> => {
        return { success: false, error: { message: 'Profile completion not implemented' } };
    }, []);

    const updateProfile = useCallback(async (updates: Record<string, any>): Promise<AuthResult> => {
        return { success: false, error: { message: 'Profile update not implemented' } };
    }, []);

    return {
        ...authState,
        profileStatus,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        handleOAuthCallback,
        refreshProfile,
        completeProfile,
        updateProfile,
        loadUserProfile,
        calculateProfileCompletionPercentage
    };
};