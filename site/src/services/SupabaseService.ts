// services/SupabaseService.ts
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
    private static instance: SupabaseService;
    private client: SupabaseClient;

    constructor() {
        // Prevent multiple instances
        if (SupabaseService.instance) {
            return SupabaseService.instance;
        }

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

        SupabaseService.instance = this;
    }

    static getInstance(): SupabaseService {
        if (!SupabaseService.instance) {
            SupabaseService.instance = new SupabaseService();
        }
        return SupabaseService.instance;
    }

    // ===== GOOGLE OAUTH ===== //
    async signInWithGoogle(): Promise<AuthResponse> {
        try {
            console.log('Initiating Google OAuth sign-in...');
            
            const { data, error } = await this.client.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    scopes: 'openid email profile'
                }
            });

            if (error) {
                console.error('Google OAuth error:', error);
                return { data: null, error };
            }

            console.log('Google OAuth initiated successfully');
            return { data, error: null };
        } catch (err) {
            console.error('Google sign-in failed:', err);
            const error = err as AuthError;
            return { data: null, error };
        }
    }

    // ===== EMAIL/PASSWORD AUTHENTICATION ===== //
    async signInWithEmail(email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> {
        const error = { message: 'Auth disabled' } as AuthError;
        return { data: null, error };
    }

    async signUpWithEmail(email: string, password: string): Promise<AuthResponse> {
        const error = { message: 'Auth disabled' } as AuthError;
        return { data: null, error };
    }

    // ===== SESSION MANAGEMENT ===== //
    async signOut(): Promise<{ error?: AuthError | null }> {
        try {
            console.log('🔓 SIGN OUT: Starting signout process...');
            
            // Log current session before signing out
            const { session: currentSession } = await this.getSession();
            console.log('🔓 SIGN OUT: Current session before logout:', {
                sessionExists: !!currentSession,
                userId: currentSession?.user?.id || 'none',
                userEmail: currentSession?.user?.email || 'none'
            });
            
            const { error } = await this.client.auth.signOut();
            
            if (error) {
                console.error('❌ SIGN OUT ERROR:', error);
                return { error };
            }
            
            console.log('✅ SIGN OUT: Signout successful');
            this.clearExtendedSession();
            
            // Verify session is cleared
            const { session: afterSession } = await this.getSession();
            console.log('🔓 SIGN OUT: Session after logout:', {
                sessionExists: !!afterSession,
                userId: afterSession?.user?.id || 'none'
            });
            
            return { error: null };
        } catch (err) {
            console.error('❌ SIGN OUT FAILED:', err);
            const error = err as AuthError;
            return { error };
        }
    }

    async getSession(): Promise<SessionResponse> {
        try {
            console.log('🔍 Getting current session...');
            const { data: { session }, error } = await this.client.auth.getSession();
            
            console.log('📋 Session check result:', {
                sessionExists: !!session,
                userId: session?.user?.id || 'none',
                userEmail: session?.user?.email || 'none',
                isValid: session ? this.isSessionValid(session) : false,
                shouldRefresh: session ? this.shouldRefreshSession(session) : false,
                expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'none',
                error: error?.message || 'none'
            });
            
            return { session, error };
        } catch (err) {
            console.error('❌ Failed to get session:', err);
            const error = err as AuthError;
            return { session: null, error };
        }
    }

    async getUser(): Promise<UserResponse> {
        try {
            const { data: { user }, error } = await this.client.auth.getUser();
            return { user, error };
        } catch (err) {
            console.error('Failed to get user:', err);
            const error = err as AuthError;
            return { user: null, error };
        }
    }

    async refreshSession(): Promise<SessionResponse> {
        return { session: null, error: null };
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
        try {
            console.log('🔊 Setting up auth state change listener...');
            const { data: { subscription } } = this.client.auth.onAuthStateChange((event, session) => {
                console.log('🔔 SUPABASE AUTH EVENT:', {
                    event,
                    timestamp: new Date().toISOString(),
                    sessionExists: !!session,
                    userId: session?.user?.id || 'none',
                    userEmail: session?.user?.email || 'none',
                    provider: session?.user?.app_metadata?.provider || 'none'
                });
                callback(event, session);
            });
            
            console.log('✅ Auth state listener setup complete');
            
            return () => {
                console.log('🔊 Unsubscribing auth state listener...');
                subscription.unsubscribe();
            };
        } catch (error) {
            console.error('❌ Failed to set up auth state listener:', error);
            return () => {};
        }
    }

    // ===== ADMIN ROLE CHECK ===== //
    private adminCheckCache = new Map<string, { result: boolean; timestamp: number }>();
    
    async isAdmin(userId: string): Promise<boolean> {
        try {
            // Check cache first to prevent multiple concurrent requests
            const cached = this.adminCheckCache.get(userId);
            const now = Date.now();
            if (cached && (now - cached.timestamp) < 30000) { // 30 second cache
                console.log('🔍 ADMIN CHECK: Using cached result:', cached.result);
                return cached.result;
            }

            console.log('🔍 ADMIN CHECK: Querying profiles table for userId:', userId);
            const { data, error } = await this.client
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .maybeSingle();

            console.log('🔍 ADMIN CHECK: Query result:', { data, error: error?.message || 'none' });

            if (error) {
                // Handle specific database recursion error
                if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
                    console.warn('⚠️ Database policy recursion detected - defaulting to non-admin');
                    const result = false;
                    this.adminCheckCache.set(userId, { result, timestamp: now });
                    return result;
                }
                console.warn('❌ Admin check error:', error);
                return false;
            }

            const isAdminUser = data?.role === 'admin';
            console.log('🔍 ADMIN CHECK: Final result:', { isAdmin: isAdminUser, role: data?.role || 'none' });
            
            // Cache the result
            this.adminCheckCache.set(userId, { result: isAdminUser, timestamp: now });
            
            return isAdminUser;
        } catch (error) {
            console.warn('❌ Failed to check admin status:', error);
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

    // ===== ENHANCED SESSION MANAGEMENT ===== //
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

    getSessionInfo(): {
        session: Session | null;
        isValid: boolean;
        expiresAt?: Date;
        shouldRefresh: boolean;
        isExtended: boolean;
        extendedExpiry?: Date;
        timeRemaining?: number;
    } {
        const { session } = this.getSession() as any; // We'll make this sync-friendly
        const extendedInfo = this.getExtendedSessionInfo();
        
        const info = {
            session,
            isValid: this.isSessionValid(session),
            shouldRefresh: this.shouldRefreshSession(session),
            isExtended: extendedInfo.isExtended,
            extendedExpiry: extendedInfo.expiry
        } as any;

        if (session?.expires_at) {
            info.expiresAt = new Date(session.expires_at * 1000);
            info.timeRemaining = session.expires_at - (new Date().getTime() / 1000);
        }

        return info;
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

    // ===== PROFILE INTEGRATION METHODS ===== //
    private profileEnsureCache = new Map<string, { result: any; timestamp: number }>();
    
    async ensureUserProfile(userId?: string): Promise<{
        success: boolean;
        profileCreated?: boolean;
        profileCompleted?: boolean;
        error?: string;
    }> {
        try {
            console.log('🔍 PROFILE ENSURE: Starting profile ensure process...');
            let targetUserId = userId;
            
            if (!targetUserId) {
                console.log('🔍 PROFILE ENSURE: No userId provided, getting current user...');
                const { user } = await this.getUser();
                if (!user) {
                    console.log('❌ PROFILE ENSURE: No authenticated user found');
                    return { success: false, error: 'No authenticated user found' };
                }
                targetUserId = user.id;
            }

            // Check cache to prevent concurrent requests
            const cached = this.profileEnsureCache.get(targetUserId);
            const now = Date.now();
            if (cached && (now - cached.timestamp) < 10000) { // 10 second cache
                console.log('🔍 PROFILE ENSURE: Using cached result');
                return cached.result;
            }

            console.log('🔍 PROFILE ENSURE: Calling ensure_user_profile RPC for userId:', targetUserId);
            const { data, error } = await this.client
                .rpc('ensure_user_profile', { user_id: targetUserId });

            console.log('🔍 PROFILE ENSURE: RPC result:', { data, error: error?.message || 'none' });

            if (error) {
                console.error('❌ Profile ensuring error:', error);
                return { 
                    success: false, 
                    error: error.message 
                };
            }

            const result = {
                success: data.success,
                profileCreated: data.action === 'created',
                profileCompleted: data.profile_completed,
                error: data.error
            };
            
            // Cache the result
            this.profileEnsureCache.set(targetUserId, { result, timestamp: now });
            
            console.log('🔍 PROFILE ENSURE: Final result:', result);
            return result;
        } catch (err) {
            console.error('❌ Profile ensuring failed:', err);
            const error = err as Error;
            return { 
                success: false, 
                error: error.message || 'Failed to ensure user profile' 
            };
        }
    }

    async handleUserLogin(userId?: string): Promise<{
        success: boolean;
        profileCreated?: boolean;
        profileCompleted?: boolean;
        error?: string;
    }> {
        try {
            let targetUserId = userId;
            
            if (!targetUserId) {
                const { user } = await this.getUser();
                if (!user) {
                    return { success: false, error: 'No authenticated user found' };
                }
                targetUserId = user.id;
            }

            const { data, error } = await this.client
                .rpc('handle_user_login', { user_id: targetUserId });

            if (error) {
                console.error('Login handling error:', error);
                return { 
                    success: false, 
                    error: error.message 
                };
            }

            return {
                success: data.success,
                profileCreated: data.action === 'created',
                profileCompleted: data.profile_completed,
                error: data.error
            };
        } catch (err) {
            console.error('Login handling failed:', err);
            const error = err as Error;
            return { 
                success: false, 
                error: error.message || 'Failed to handle user login' 
            };
        }
    }

    // ===== ENHANCED SESSION MONITORING ===== //
    private sessionCheckInterval: NodeJS.Timeout | null = null;

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


    // ===== OAUTH CALLBACK HANDLER ===== //
    async handleOAuthCallback(): Promise<{ 
        success: boolean; 
        error?: string; 
        profileCreated?: boolean;
        profileCompleted?: boolean;
    }> {
        try {
            console.log('Handling OAuth callback...');
            
            // Get the session from the URL
            const { data: { session }, error: sessionError } = await this.client.auth.getSession();
            
            if (sessionError) {
                console.error('OAuth callback session error:', sessionError);
                return { success: false, error: sessionError.message };
            }
            
            if (!session || !session.user) {
                console.error('No session or user found in OAuth callback');
                return { success: false, error: 'No session found' };
            }
            
            console.log('OAuth callback successful, user:', session.user.id);
            
            // Ensure user profile is created with 'user' role
            const profileResult = await this.handleUserLogin(session.user.id);
            
            if (!profileResult.success) {
                console.error('Failed to create/update user profile:', profileResult.error);
                return { success: false, error: profileResult.error };
            }
            
            return {
                success: true,
                profileCreated: profileResult.profileCreated,
                profileCompleted: profileResult.profileCompleted
            };
            
        } catch (err) {
            console.error('OAuth callback failed:', err);
            const error = err as Error;
            return { 
                success: false, 
                error: error.message || 'OAuth callback failed' 
            };
        }
    }
}

const supabaseService = SupabaseService.getInstance();

// Add global signout function for console access
declare global {
    interface Window {
        forceSignout: () => Promise<void>;
        checkSession: () => Promise<any>;
    }
}

window.forceSignout = async () => {
    try {
        console.log('🔓 Force signout initiated from console...');
        const { error } = await supabaseService.signOut();
        
        if (error) {
            console.error('❌ Force signout failed:', error.message);
        } else {
            console.log('✅ Force signout successful - you have been logged out');
            // Force reload to clear any remaining state
            window.location.reload();
        }
    } catch (err) {
        console.error('❌ Force signout error:', err);
    }
};

// Add session debugging function for console access
window.checkSession = async () => {
    try {
        console.log('🔍 SESSION DEBUG: Checking current session status...');
        
        const { session, error } = await supabaseService.getSession();
        const extendedInfo = supabaseService.getExtendedSessionInfo();
        
        const sessionInfo = {
            'Session Exists': !!session,
            'User ID': session?.user?.id || 'none',
            'User Email': session?.user?.email || 'none',
            'Session Valid': session ? supabaseService.isSessionValid(session) : false,
            'Should Refresh': session ? supabaseService.shouldRefreshSession(session) : false,
            'Expires At': session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'none',
            'Extended Session': extendedInfo.isExtended,
            'Extended Expires': extendedInfo.expiry?.toLocaleString() || 'none',
            'Provider': session?.user?.app_metadata?.provider || 'none',
            'Last Sign In': session?.user?.last_sign_in_at || 'none',
            'Email Confirmed': !!session?.user?.email_confirmed_at,
            'Error': error?.message || 'none'
        };
        
        console.table(sessionInfo);
        
        if (session) {
            console.log('🔐 RAW SESSION OBJECT:', session);
        }
        
        return sessionInfo;
    } catch (err) {
        console.error('❌ Session check error:', err);
        return null;
    }
};

export default supabaseService;