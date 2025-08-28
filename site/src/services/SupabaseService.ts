// services/SupabaseService.ts - Fixed Google OAuth configuration
import { createClient, SupabaseClient, Session, User, AuthError, AuthChangeEvent } from '@supabase/supabase-js';
import { config } from '../config';

interface AuthResponse {
    data?: any;
    error?: AuthError | null;
}

interface SessionResponse {
    session: Session | null;
    error?: AuthError | null;
}

interface UserResponse {
    user: User | null;
    error?: AuthError | null;
}

class SupabaseService {
    private client: SupabaseClient;

    constructor() {
        this.client = createClient(
            config.supabase.url,
            config.supabase.anonKey,
            {
                auth: {
                    ...config.supabase.auth,
                    flowType: 'pkce',
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            }
        );

        console.log('SupabaseService initialized');
        console.log('URL:', config.supabase.url);
        console.log('Redirect URL will be:', window.location.origin);
    }

    // ===== GOOGLE OAUTH ===== //
    async signInWithGoogle(): Promise<AuthResponse> {
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
                return { data, error };
            }

            console.log('Google OAuth initiated successfully:', data);
            return { data, error };

        } catch (err) {
            console.error('Google sign-in failed:', err);
            const error = err as AuthError;
            return { data: null, error };
        }
    }

    // ===== EMAIL/PASSWORD AUTHENTICATION ===== //
    async signInWithEmail(email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> {
        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email,
                password
            });

            if (!error && data.session && rememberMe) {
                try {
                    await this.extendSessionDuration(data.session);
                } catch (extendError) {
                    console.warn('Failed to extend session duration:', extendError);
                }
            }

            return { data, error };

        } catch (err) {
            console.error('Email sign-in failed:', err);
            const error = err as AuthError;
            return { data: null, error };
        }
    }

    async signUpWithEmail(email: string, password: string): Promise<AuthResponse> {
        try {
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
            return { data, error };

        } catch (err) {
            console.error('Email sign-up failed:', err);
            const error = err as AuthError;
            return { data: null, error };
        }
    }

    // ===== SESSION MANAGEMENT ===== //
    async signOut(): Promise<{ error?: AuthError | null }> {
        try {
            this.clearExtendedSession();
            const { error } = await this.client.auth.signOut();

            if (error) {
                console.error('Sign out error:', error);
            } else {
                console.log('Signed out successfully');
            }

            return { error };

        } catch (err) {
            console.error('Sign out failed:', err);
            const error = err as AuthError;
            return { error };
        }
    }

    async getSession(): Promise<SessionResponse> {
        try {
            const { data: { session }, error } = await this.client.auth.getSession();
            return { session, error };
        } catch (err) {
            console.error('Get session failed:', err);
            const error = err as AuthError;
            return { session: null, error };
        }
    }

    async getUser(): Promise<UserResponse> {
        try {
            const { data: { user }, error } = await this.client.auth.getUser();
            return { user, error };
        } catch (err) {
            console.error('Get user failed:', err);
            const error = err as AuthError;
            return { user: null, error };
        }
    }

    async refreshSession(): Promise<SessionResponse> {
        try {
            const { data: { session }, error } = await this.client.auth.refreshSession();
            return { session, error };
        } catch (err) {
            console.error('Refresh session failed:', err);
            const error = err as AuthError;
            return { session: null, error };
        }
    }

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

    // ===== PASSWORD RESET ===== //
    async resetPassword(email: string): Promise<AuthResponse> {
        try {
            const { data, error } = await this.client.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`
            });
            return { data, error };
        } catch (err) {
            console.error('Password reset failed:', err);
            const error = err as AuthError;
            return { data: null, error };
        }
    }

    async updatePassword(newPassword: string): Promise<AuthResponse> {
        try {
            const { data, error } = await this.client.auth.updateUser({
                password: newPassword
            });
            return { data, error };
        } catch (err) {
            console.error('Password update failed:', err);
            const error = err as AuthError;
            return { data: null, error };
        }
    }

    // ===== EMAIL VERIFICATION ===== //
    async resendEmailVerification(email: string): Promise<AuthResponse> {
        try {
            const { data, error } = await this.client.auth.resend({
                type: 'signup',
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });
            return { data, error };
        } catch (err) {
            console.error('Email verification resend failed:', err);
            const error = err as AuthError;
            return { data: null, error };
        }
    }

    // ===== AUTH STATE LISTENER ===== //
    onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): () => void {
        const { data: { subscription } } = this.client.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session?.user?.email || 'No user');
            callback(event, session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }

    // ===== ADMIN ROLE CHECK ===== //
    async isAdmin(userId: string): Promise<boolean> {
        try {
            const { data, error } = await this.client
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .eq('role', 'admin')
                .single();

            if (error) {
                console.warn('Admin check error:', error);
                return false;
            }

            return !!data;
        } catch (error) {
            console.warn('Failed to check admin status:', error);
            return false;
        }
    }

    // ===== USER PROFILE MANAGEMENT ===== //
    async updateUserProfile(updates: {
        full_name?: string;
        avatar_url?: string;
        [key: string]: any;
    }): Promise<AuthResponse> {
        try {
            const { data, error } = await this.client.auth.updateUser({
                data: updates
            });
            return { data, error };
        } catch (err) {
            console.error('Profile update failed:', err);
            const error = err as AuthError;
            return { data: null, error };
        }
    }

    // ===== UTILITY METHODS ===== //
    getClient(): SupabaseClient {
        return this.client;
    }

    async checkEmailExists(email: string): Promise<boolean> {
        try {
            // This requires a custom function in your Supabase database
            const { data, error } = await this.client.rpc('check_email_exists', {
                email_input: email
            });

            return !error && !!data;
        } catch (error) {
            console.warn('Failed to check email existence:', error);
            return false;
        }
    }

    // ===== SESSION HELPERS ===== //
    isSessionValid(session: Session | null): boolean {
        if (!session) return false;

        const now = new Date().getTime() / 1000;
        return session.expires_at ? session.expires_at > now : false;
    }

    shouldRefreshSession(session: Session | null): boolean {
        if (!session || !session.expires_at) return false;

        const now = new Date().getTime() / 1000;
        const timeUntilExpiry = session.expires_at - now;

        // Refresh if less than 5 minutes remaining
        return timeUntilExpiry < 300;
    }

    getExtendedSessionInfo(): { isExtended: boolean; expiry: Date | null } {
        try {
            const stored = localStorage.getItem('extended_session');
            if (!stored) return { isExtended: false, expiry: null };

            const parsed = JSON.parse(stored);
            const expiry = new Date(parsed.expiry);
            const isExtended = expiry > new Date();

            return { isExtended, expiry: isExtended ? expiry : null };
        } catch (error) {
            console.warn('Failed to get extended session info:', error);
            return { isExtended: false, expiry: null };
        }
    }

    clearExtendedSession(): void {
        try {
            localStorage.removeItem('extended_session');
        } catch (error) {
            console.warn('Failed to clear extended session:', error);
        }
    }

    // ===== OAUTH CALLBACK HANDLER ===== //
    async handleOAuthCallback(): Promise<{ success: boolean; error?: string }> {
        try {
            const { data, error } = await this.client.auth.getSession();

            if (error) {
                console.error('OAuth callback error:', error);
                return { success: false, error: error.message };
            }

            if (data.session) {
                console.log('OAuth callback successful, user signed in:', data.session.user.email);
                return { success: true };
            } else {
                return { success: false, error: 'No session found after OAuth callback' };
            }
        } catch (err) {
            console.error('OAuth callback handling failed:', err);
            return { success: false, error: 'Failed to handle OAuth callback' };
        }
    }
}

export default new SupabaseService();