// services/AuthService.ts - Comprehensive Authentication Service
import { 
    SupabaseClient, 
    Session, 
    User, 
    AuthError, 
    AuthChangeEvent 
} from '@supabase/supabase-js';
import { getSupabaseClient } from './supabaseClient';
import { UserProfile } from '../types/profile';
import { 
    AuthResult, 
    OAuthCallbackResult, 
    SessionInfo,
    ProfileCreationResult
} from '../types/auth';

interface Database {
    public: {
        Tables: {
            profiles: {
                Row: UserProfile;
                Insert: Partial<UserProfile>;
                Update: Partial<UserProfile>;
            };
        };
        Functions: {
            is_admin_user: {
                Args: { user_id_input?: string };
                Returns: boolean;
            };
            update_user_login: {
                Args: { user_id_input?: string };
                Returns: {
                    success: boolean;
                    error?: string;
                };
            };
            get_user_role: {
                Args: { user_id_input?: string };
                Returns: {
                    is_admin: boolean;
                    role: string;
                };
            };
        };
    };
}

class AuthService {
    private client: SupabaseClient<Database>;
    private sessionCheckInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.client = getSupabaseClient();
        console.log('AuthService initialized using shared client');
    }

    // ===== GOOGLE OAUTH AUTHENTICATION =====
    async signInWithGoogle(): Promise<AuthResult> {
        try {
            const redirectUrl = `${window.location.origin}/auth/callback`;
            console.log('Initiating Google OAuth with redirect URL:', redirectUrl);

            const { data, error } = await this.client.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    scopes: 'openid email profile'
                }
            });

            if (error) {
                console.error('Google OAuth error:', error);
                return { 
                    success: false, 
                    error: { message: error.message }
                };
            }

            console.log('Google OAuth redirect initiated successfully');
            return { success: true, data };

        } catch (err) {
            console.error('Google sign-in failed:', err);
            const errorMessage = (err as Error)?.message || 'Google sign-in failed';
            return { 
                success: false, 
                error: { message: errorMessage }
            };
        }
    }

    // ===== EMAIL/PASSWORD AUTHENTICATION =====
    async signInWithEmail(email: string, password: string, rememberMe: boolean = false): Promise<AuthResult> {
        try {
            console.log('Attempting email sign-in for:', email);

            const { data, error } = await this.client.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error('Email sign-in error:', error);
                return { 
                    success: false, 
                    error: { message: error.message }
                };
            }

            if (data.session?.user) {
                console.log('Email sign-in successful for:', data.session.user.email);

                // Check user role for role-based adjustments
                const isUserAdmin = await this.isAdmin(data.session.user.id);
                
                // Update login tracking
                try {
                    await this.client.rpc('update_user_login', { user_id_input: data.session.user.id });
                } catch (error) {
                    console.warn('Failed to update login tracking:', error);
                }
                
                if (rememberMe) {
                    await this.extendSessionDuration(data.session);
                }

                return { 
                    success: true, 
                    data, 
                    profileCreated: true, // Profile already exists or created by trigger
                    profileCompleted: true, // Email users can complete profile later
                    isAdmin: isUserAdmin
                };
            }

            return { 
                success: false, 
                error: { message: 'Authentication failed - no session created' }
            };

        } catch (err) {
            console.error('Email sign-in failed:', err);
            const errorMessage = (err as Error)?.message || 'Sign-in failed';
            return { 
                success: false, 
                error: { message: errorMessage }
            };
        }
    }

    async signUpWithEmail(email: string, password: string): Promise<AuthResult> {
        try {
            console.log('Attempting email sign-up for:', email);

            const { data, error } = await this.client.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        email_verify: true
                    }
                }
            });

            if (error) {
                console.error('Email sign-up error:', error);
                return { 
                    success: false, 
                    error: { message: error.message }
                };
            }

            console.log('Email sign-up initiated for:', email);
            
            // Profile will be created automatically via database trigger
            // when the user confirms their email
            return { 
                success: true, 
                data,
                profileCreated: false, // Will be created on email confirmation
                profileCompleted: false
            };

        } catch (err) {
            console.error('Email sign-up failed:', err);
            const errorMessage = (err as Error)?.message || 'Sign-up failed';
            return { 
                success: false, 
                error: { message: errorMessage }
            };
        }
    }

    // ===== SESSION MANAGEMENT =====
    async signOut(): Promise<AuthResult> {
        try {
            console.log('Signing out user...');
            this.clearExtendedSession();
            
            const { error } = await this.client.auth.signOut();

            if (error) {
                console.error('Sign out error:', error);
                return { 
                    success: false, 
                    error: { message: error.message }
                };
            }

            console.log('User signed out successfully');
            return { success: true };

        } catch (err) {
            console.error('Sign out failed:', err);
            const errorMessage = (err as Error)?.message || 'Sign out failed';
            return { 
                success: false, 
                error: { message: errorMessage }
            };
        }
    }

    async getSession(): Promise<{ session: Session | null; error?: AuthError | null }> {
        try {
            const { data: { session }, error } = await this.client.auth.getSession();
            return { session, error };
        } catch (err) {
            console.error('Get session failed:', err);
            const error = err as AuthError;
            return { session: null, error };
        }
    }

    async getUser(): Promise<{ user: User | null; error?: AuthError | null }> {
        try {
            const { data: { user }, error } = await this.client.auth.getUser();
            return { user, error };
        } catch (err) {
            console.error('Get user failed:', err);
            const error = err as AuthError;
            return { user: null, error };
        }
    }

    async refreshSession(): Promise<{ session: Session | null; error?: AuthError | null }> {
        try {
            const { data: { session }, error } = await this.client.auth.refreshSession();
            return { session, error };
        } catch (err) {
            console.error('Refresh session failed:', err);
            const error = err as AuthError;
            return { session: null, error };
        }
    }

    // ===== OAUTH CALLBACK HANDLING =====
    async handleOAuthCallback(): Promise<OAuthCallbackResult> {
        try {
            console.log('Handling OAuth callback...');

            const { data, error } = await this.client.auth.getSession();

            if (error) {
                console.error('OAuth callback session error:', error);
                return { 
                    success: false, 
                    error: error.message 
                };
            }

            if (data.session?.user) {
                console.log('OAuth callback successful for user:', data.session.user.email);
                
                // Check user role for role-based adjustments
                const isUserAdmin = await this.isAdmin(data.session.user.id);
                
                // Update login tracking
                try {
                    await this.client.rpc('update_user_login', { user_id_input: data.session.user.id });
                } catch (error) {
                    console.warn('Failed to update login tracking:', error);
                }

                return { 
                    success: true,
                    profileCreated: true, // Profile created automatically by trigger
                    profileCompleted: true, // Google users are considered complete
                    isAdmin: isUserAdmin
                };
            } else {
                console.error('OAuth callback: No session found');
                return { 
                    success: false, 
                    error: 'No session found after OAuth callback' 
                };
            }

        } catch (err) {
            console.error('OAuth callback handling failed:', err);
            const errorMessage = (err as Error)?.message || 'Failed to handle OAuth callback';
            return { 
                success: false, 
                error: errorMessage 
            };
        }
    }

    // ===== PROFILE MANAGEMENT (DEPRECATED) =====
    // NOTE: Profile creation is now handled automatically by database triggers
    // This function is kept for backward compatibility but is no longer used
    
    /* DEPRECATED: Profile creation now handled automatically by database triggers
    async ensureUserProfile(userId: string): Promise<ProfileCreationResult> {
        console.warn('ensureUserProfile is deprecated - profiles are created automatically');
        return {
            success: true,
            profileCreated: true,
            profileCompleted: true
        };
    }
    */

    // ===== ADMIN ROLE CHECKING =====
    async isAdmin(userId: string): Promise<boolean> {
        try {
            const { data, error } = await this.client.rpc('is_admin_user', {
                user_id_input: userId
            });

            if (error) {
                console.warn('Admin check RPC error:', error);
                return false;
            }

            return Boolean(data);
        } catch (error) {
            console.warn('Failed to check admin status:', error);
            return false;
        }
    }

    // ===== PASSWORD RESET =====
    async resetPassword(email: string): Promise<AuthResult> {
        try {
            const { data, error } = await this.client.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`
            });

            if (error) {
                return { 
                    success: false, 
                    error: { message: error.message }
                };
            }

            return { success: true, data };
        } catch (err) {
            console.error('Password reset failed:', err);
            const errorMessage = (err as Error)?.message || 'Password reset failed';
            return { 
                success: false, 
                error: { message: errorMessage }
            };
        }
    }

    async updatePassword(newPassword: string): Promise<AuthResult> {
        try {
            const { data, error } = await this.client.auth.updateUser({
                password: newPassword
            });

            if (error) {
                return { 
                    success: false, 
                    error: { message: error.message }
                };
            }

            return { success: true, data };
        } catch (err) {
            console.error('Password update failed:', err);
            const errorMessage = (err as Error)?.message || 'Password update failed';
            return { 
                success: false, 
                error: { message: errorMessage }
            };
        }
    }

    // ===== AUTH STATE LISTENER =====
    onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): () => void {
        const { data: { subscription } } = this.client.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email || 'No user');

            // Update login tracking on sign-in events (profile already created by trigger)
            if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
                try {
                    await this.client.rpc('update_user_login', { user_id_input: session.user.id });
                } catch (error) {
                    console.warn('Failed to update login tracking during auth state change:', error);
                }
            }

            callback(event, session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }

    // ===== SESSION MONITORING =====
    isSessionValid(session: Session | null): boolean {
        if (!session) return false;
        const now = new Date().getTime() / 1000;
        return session.expires_at ? session.expires_at > now : false;
    }

    shouldRefreshSession(session: Session | null): boolean {
        if (!session || !session.expires_at) return false;
        const now = new Date().getTime() / 1000;
        const timeUntilExpiry = session.expires_at - now;
        return timeUntilExpiry < 300; // Refresh if less than 5 minutes remaining
    }

    startSessionMonitoring(intervalMs: number = 60000): void {
        if (this.sessionCheckInterval) {
            this.stopSessionMonitoring();
        }

        this.sessionCheckInterval = setInterval(async () => {
            try {
                const { session } = await this.getSession();
                
                if (session && this.shouldRefreshSession(session)) {
                    console.log('Auto-refreshing session...');
                    await this.refreshSession();
                }
            } catch (error) {
                console.warn('Session monitoring error:', error);
            }
        }, intervalMs);

        console.log('Session monitoring started');
    }

    stopSessionMonitoring(): void {
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
            this.sessionCheckInterval = null;
            console.log('Session monitoring stopped');
        }
    }

    // ===== EXTENDED SESSION SUPPORT =====
    private async extendSessionDuration(session: Session): Promise<void> {
        try {
            const extendedExpiry = new Date();
            extendedExpiry.setDate(extendedExpiry.getDate() + 30);

            localStorage.setItem('extended_session', JSON.stringify({
                expiry: extendedExpiry.toISOString(),
                userId: session.user.id
            }));
        } catch (error) {
            console.warn('Failed to set extended session:', error);
        }
    }

    private clearExtendedSession(): void {
        try {
            localStorage.removeItem('extended_session');
        } catch (error) {
            console.warn('Failed to clear extended session:', error);
        }
    }

    // ===== UTILITY METHODS =====
    getClient(): SupabaseClient<Database> {
        return this.client;
    }

    async checkEmailExists(email: string): Promise<boolean> {
        try {
            const { data, error } = await this.client.rpc('check_email_exists', {
                email_input: email
            });

            return !error && !!data;
        } catch (error) {
            console.warn('Failed to check email existence:', error);
            return false;
        }
    }

    getSessionInfo(session: Session | null): SessionInfo {
        const info: SessionInfo = {
            session,
            isValid: this.isSessionValid(session),
            shouldRefresh: this.shouldRefreshSession(session),
            isExtended: false,
            expiresAt: session?.expires_at ? new Date(session.expires_at * 1000) : undefined
        };

        try {
            const stored = localStorage.getItem('extended_session');
            if (stored) {
                const parsed = JSON.parse(stored);
                const expiry = new Date(parsed.expiry);
                info.isExtended = expiry > new Date();
                info.extendedExpiry = info.isExtended ? expiry : undefined;
            }
        } catch (error) {
            console.warn('Failed to get extended session info:', error);
        }

        return info;
    }
}

// Export singleton instance
export default new AuthService();