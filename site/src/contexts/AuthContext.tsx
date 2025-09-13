// contexts/AuthContext.tsx - Centralized auth state management
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile, ExtendedAuthState, ProfileCompletionStatus } from '../types/profile';
import { AuthResult } from '../types/auth';
import AuthService from '../services/AuthService';

// Context state type
interface AuthContextValue extends ExtendedAuthState {
    profileStatus: ProfileCompletionStatus | null;
    signInWithGoogle: () => Promise<AuthResult>;
    signInWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResult>;
    signUpWithEmail: (email: string, password: string) => Promise<AuthResult>;
    signOut: () => Promise<AuthResult>;
    handleOAuthCallback: () => Promise<{ success: boolean; error?: string }>;
    refreshProfile: () => Promise<AuthResult>;
    completeProfile: (additionalData?: Record<string, any>) => Promise<AuthResult>;
    updateProfile: (updates: Record<string, any>) => Promise<AuthResult>;
    loadUserProfile: (userId: string, forceRefresh?: boolean) => Promise<void>;
    calculateProfileCompletionPercentage: (profile: UserProfile) => number;
}

// Create context with undefined default to enforce provider usage
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider props
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authState, setAuthState] = useState<ExtendedAuthState>({
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

    const [profileStatus] = useState<ProfileCompletionStatus | null>(null);

    const updateAuthState = useCallback(async (session: Session | null) => {
        try {
            await processAuthState(session);
        } catch (error) {
            setAuthState(prev => ({ ...prev, loading: false }));
        }
    }, []);

    // Initialize auth state and set up listener - RUNS ONLY ONCE
    useEffect(() => {
        console.log('🔐 Auth check starting...');
        let isSubscribed = true;
        let unsubscribe: (() => void) | null = null;

        const initializeAuth = async () => {
            try {
                const { session, error } = await AuthService.getSession();
                
                if (error) {
                    if (isSubscribed) {
                        setAuthState(prev => ({ ...prev, loading: false }));
                    }
                    return;
                }

                if (isSubscribed) {
                    await updateAuthState(session);
                }

                if (isSubscribed) {
                    unsubscribe = AuthService.onAuthStateChange(async (event, session) => {
                        if (event === 'INITIAL_SESSION') return;
                        
                        if (isSubscribed) {
                            await updateAuthState(session);
                        }
                    });
                }
            } catch (error) {
                if (isSubscribed) {
                    setAuthState(prev => ({ ...prev, loading: false }));
                }
            }
        };

        initializeAuth();

        return () => {
            isSubscribed = false;
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [updateAuthState]);

    const processAuthState = async (session: Session | null) => {
        try {
            if (!session || !session.user) {
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
                setAuthState(newState);
                console.log('✅ Auth check complete: Not authenticated');
                return;
            }

            let isAdmin = false;
            try {
                isAdmin = await AuthService.isAdmin(session.user.id);
            } catch (adminError) {
                isAdmin = false;
            }

            const newState = {
                user: session.user,
                session: session,
                loading: false,
                isAuthenticated: true,
                isAdmin,
                profile: null,
                profileLoading: false,
                profileCompleted: true,
                profileCompletionPercentage: 100
            };
            
            setAuthState(newState);
            console.log('✅ Auth check complete: Authenticated as', session.user.email || session.user.id);

        } catch (error) {
            setAuthState(prev => ({
                ...prev,
                loading: false
            }));
        }
    };

    // Auth methods
    const loadUserProfile = useCallback(async (userId: string, forceRefresh: boolean = false): Promise<void> => {
        // Profile loading implementation can be added later if needed
    }, []);
    
    const calculateProfileCompletionPercentage = useCallback((profile: UserProfile): number => {
        if (!profile) return 0;
        let completed = 0;
        let total = 0;
        
        if (profile.full_name) completed++;
        total++;
        
        if (profile.email) completed++;
        total++;
        
        return Math.round((completed / total) * 100);
    }, []);

    const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
        try {
            setAuthState(prev => ({ ...prev, loading: true }));
            const result = await AuthService.signInWithGoogle();
            
            if (result.error) {
                setAuthState(prev => ({ ...prev, loading: false }));
                return { success: false, error: result.error };
            }
            
            return { success: true };
        } catch (error) {
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
            setAuthState(prev => ({ ...prev, loading: true }));
            const { error } = await AuthService.signOut();
            
            if (error) {
                setAuthState(prev => ({ ...prev, loading: false }));
                return { success: false, error };
            }
            
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
            setAuthState(prev => ({ ...prev, loading: false }));
            return { success: false, error: { message: 'Sign out failed' } };
        }
    }, []);

    const handleOAuthCallback = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        try {
            const result = await AuthService.handleOAuthCallback();
            return result;
        } catch (error) {
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
            return { success: false, error: { message: 'Profile refresh failed' } };
        }
    }, [authState.user, authState.session, updateAuthState]);

    const completeProfile = useCallback(async (additionalData?: Record<string, any>): Promise<AuthResult> => {
        return { success: false, error: { message: 'Profile completion not implemented' } };
    }, []);

    const updateProfile = useCallback(async (updates: Record<string, any>): Promise<AuthResult> => {
        return { success: false, error: { message: 'Profile update not implemented' } };
    }, []);

    // Context value
    const contextValue: AuthContextValue = {
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

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;