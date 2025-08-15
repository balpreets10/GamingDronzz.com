// services/SupabaseService.ts - Fixed config import and enhanced Google OAuth
import { createClient, SupabaseClient, Session, User, AuthError } from '@supabase/supabase-js';
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
                    flowType: 'pkce'
                }
            }
        );

        console.log('Config object:', config);
        console.log('Supabase config:', config.supabase);
    }

    // ===== GOOGLE OAUTH ===== //
    async signInWithGoogle(): Promise<AuthResponse> {
        const redirectUrl = window.location.origin;

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

        return { data, error };
    }

    // ===== EMAIL/PASSWORD AUTHENTICATION ===== //
    async signInWithEmail(email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> {
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
    }

    async signUpWithEmail(email: string, password: string): Promise<AuthResponse> {
        const { data, error } = await this.client.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}`,
                data: {
                    email_verify: true
                }
            }
        });
        return { data, error };
    }

    // ===== SESSION MANAGEMENT ===== //
    async signOut(): Promise<{ error?: AuthError | null }> {
        this.clearExtendedSession();
        const { error } = await this.client.auth.signOut();
        return { error };
    }

    async getSession(): Promise<SessionResponse> {
        const { data: { session }, error } = await this.client.auth.getSession();
        return { session, error };
    }

    async getUser(): Promise<UserResponse> {
        const { data: { user }, error } = await this.client.auth.getUser();
        return { user, error };
    }

    async refreshSession(): Promise<SessionResponse> {
        const { data: { session }, error } = await this.client.auth.refreshSession();
        return { session, error };
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
        const { data, error } = await this.client.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`
        });
        return { data, error };
    }

    async updatePassword(newPassword: string): Promise<AuthResponse> {
        const { data, error } = await this.client.auth.updateUser({
            password: newPassword
        });
        return { data, error };
    }

    // ===== EMAIL VERIFICATION ===== //
    async resendEmailVerification(email: string): Promise<AuthResponse> {
        const { data, error } = await this.client.auth.resend({
            type: 'signup',
            email,
            options: {
                emailRedirectTo: `${window.location.origin}`
            }
        });
        return { data, error };
    }

    // ===== AUTH STATE LISTENER ===== //
    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
        return this.client.auth.onAuthStateChange(callback);
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

            return !error && !!data;
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
        const { data, error } = await this.client.auth.updateUser({
            data: updates
        });
        return { data, error };
    }

    // ===== UTILITY METHODS ===== //
    getClient(): SupabaseClient {
        return this.client;
    }

    async checkEmailExists(email: string): Promise<boolean> {
        try {
            // This is a custom function you'd need to implement in your Supabase database
            // as a stored procedure or edge function, since direct email checking
            // isn't available in the client for security reasons
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
}

export default new SupabaseService();