// services/AuthService.ts - Comprehensive Authentication Service
import { 
    createClient, 
    SupabaseClient, 
    Session, 
    User, 
    AuthError, 
    AuthChangeEvent 
} from '@supabase/supabase-js';
import { config } from '../config';
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
            ensure_user_profile: {
                Args: { user_id: string };
                Returns: {
                    success: boolean;
                    action?: 'created' | 'updated';
                    profile_completed?: boolean;
                    error?: string;
                };
            };
            complete_user_profile: {
                Args: { 
                    user_id: string; 
                    additional_data?: Record<string, any> 
                };
                Returns: {
                    success: boolean;
                    message?: string;
                    error?: string;
                };
            };
            check_profile_completion: {
                Args: { user_id: string };
                Returns: {
                    exists: boolean;
                    completed: boolean;
                    needs_creation: boolean;
                    has_full_name?: boolean;
                    has_avatar?: boolean;
                    is_verified?: boolean;
                    provider?: string;
                };
            };
        };
    };
}

class AuthService {
    private client: SupabaseClient<Database>;
    private sessionCheckInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.client = createClient<Database>(
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

        console.log('AuthService initialized');
        console.log('URL:', config.supabase.url);
        console.log('Redirect URL base:', window.location.origin);
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

                // Ensure profile is created/updated
                const profileResult = await this.ensureUserProfile(data.session.user.id);
                
                if (rememberMe) {
                    await this.extendSessionDuration(data.session);
                }

                return { 
                    success: true, 
                    data, 
                    profileCreated: profileResult.profileCreated,
                    profileCompleted: profileResult.profileCompleted
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
                
                // Ensure user profile is created/updated with OAuth data
                const profileResult = await this.ensureUserProfile(data.session.user.id);

                if (!profileResult.success) {
                    console.warn('Profile creation/update failed during OAuth:', profileResult.error);
                    // Don't fail the auth, but note the issue
                    return { 
                        success: true, 
                        profileCreated: false,
                        profileCompleted: false,
                        error: `Authentication successful but profile setup failed: ${profileResult.error}`
                    };
                }

                return { 
                    success: true,
                    profileCreated: profileResult.profileCreated,
                    profileCompleted: profileResult.profileCompleted
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

    // ===== PROFILE MANAGEMENT =====
    async ensureUserProfile(userId: string): Promise<ProfileCreationResult> {
        try {
            console.log('Ensuring user profile exists for:', userId);

            // Try to use the database function first
            try {
                const { data, error } = await this.client.rpc('ensure_user_profile', {
                    user_id: userId
                });

                if (error) {
                    console.warn('RPC ensure_user_profile failed, falling back to manual creation:', error);
                    return await this.createProfileManually(userId);
                }

                console.log('Profile ensured via RPC function:', data);
                return {
                    success: data.success,
                    profileCreated: data.action === 'created',
                    profileCompleted: data.profile_completed || false,
                    error: data.error
                };

            } catch (rpcError) {
                console.warn('RPC function not available, creating profile manually:', rpcError);
                return await this.createProfileManually(userId);
            }

        } catch (err) {
            console.error('Profile ensuring failed:', err);
            const errorMessage = (err as Error)?.message || 'Failed to ensure user profile';
            return { 
                success: false, 
                error: errorMessage,
                profileCreated: false,
                profileCompleted: false
            };
        }
    }

    private async createProfileManually(userId: string): Promise<ProfileCreationResult> {
        try {
            // Get user data from auth
            const { user } = await this.getUser();
            if (!user || user.id !== userId) {
                return {
                    success: false,
                    error: 'User not found or ID mismatch',
                    profileCreated: false,
                    profileCompleted: false
                };
            }

            // Check if profile already exists
            const { data: existingProfile, error: selectError } = await this.client
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (selectError && selectError.code !== 'PGRST116') {
                throw selectError;
            }

            // Determine provider and extract metadata
            const provider = user.app_metadata?.provider || 'email';
            const metadata = user.user_metadata || {};
            const isGoogleUser = provider === 'google';

            if (!existingProfile) {
                // Create new profile
                console.log('Creating new profile for user:', userId);

                const newProfile = {
                    id: userId,
                    email: user.email!,
                    full_name: metadata.full_name || metadata.name || user.email?.split('@')[0],
                    avatar_url: metadata.avatar_url || metadata.picture,
                    provider: provider as 'google' | 'email' | 'github' | 'facebook',
                    provider_id: metadata.sub,
                    oauth_metadata: metadata,
                    is_verified: !!user.email_confirmed_at,
                    profile_completed: isGoogleUser, // Google users are considered complete
                    profile_completion_date: isGoogleUser ? new Date().toISOString() : null,
                    last_login_at: new Date().toISOString(),
                    login_count: 1,
                    role: 'user' as const,
                    public_profile: true,
                    email_notifications: true,
                    marketing_emails: false,
                    is_active: true
                };

                const { error: insertError } = await this.client
                    .from('profiles')
                    .insert(newProfile);

                if (insertError) {
                    throw insertError;
                }

                console.log('Profile created successfully');
                return {
                    success: true,
                    profileCreated: true,
                    profileCompleted: isGoogleUser
                };

            } else {
                // Update existing profile
                console.log('Updating existing profile for user:', userId);

                const updates: Partial<UserProfile> = {
                    last_login_at: new Date().toISOString(),
                    login_count: (existingProfile.login_count || 0) + 1,
                    updated_at: new Date().toISOString()
                };

                // Update OAuth metadata if empty or missing
                if (!existingProfile.oauth_metadata || 
                    Object.keys(existingProfile.oauth_metadata).length === 0) {
                    updates.oauth_metadata = metadata;
                }

                // Update missing profile data from OAuth
                if (!existingProfile.avatar_url && metadata.avatar_url) {
                    updates.avatar_url = metadata.avatar_url;
                }

                if (!existingProfile.full_name && (metadata.full_name || metadata.name)) {
                    updates.full_name = metadata.full_name || metadata.name;
                }

                const { error: updateError } = await this.client
                    .from('profiles')
                    .update(updates)
                    .eq('id', userId);

                if (updateError) {
                    throw updateError;
                }

                console.log('Profile updated successfully');
                return {
                    success: true,
                    profileCreated: false,
                    profileCompleted: existingProfile.profile_completed || false
                };
            }

        } catch (error) {
            console.error('Manual profile creation failed:', error);
            return {
                success: false,
                error: (error as Error)?.message || 'Failed to create profile manually',
                profileCreated: false,
                profileCompleted: false
            };
        }
    }

    // ===== ADMIN ROLE CHECKING =====
    async isAdmin(userId: string): Promise<boolean> {
        try {
            const { data, error } = await this.client
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.warn('Admin check error:', error);
                return false;
            }

            return data?.role === 'admin';
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

            // Automatically ensure profile exists on sign-in events
            if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
                try {
                    await this.ensureUserProfile(session.user.id);
                } catch (error) {
                    console.warn('Failed to ensure profile during auth state change:', error);
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