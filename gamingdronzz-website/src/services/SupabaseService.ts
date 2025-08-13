// services/SupabaseService.ts
import { createClient, SupabaseClient, Session, User, AuthError } from '@supabase/supabase-js';
import config from '../config';

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
        // Fix: Wrap auth config in main options object
        this.client = createClient(
            config.supabase.url,
            config.supabase.anonKey,
            {
                auth: config.supabase.auth
            }
        );
    }

    async signInWithGoogle(): Promise<AuthResponse> {
        const { data, error } = await this.client.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });
        return { data, error };
    }

    async signOut(): Promise<{ error?: AuthError | null }> {
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

    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
        return this.client.auth.onAuthStateChange(callback);
    }

    async isAdmin(userId: string): Promise<boolean> {
        const { data, error } = await this.client
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .eq('role', 'admin')
            .single();

        return !error && !!data;
    }

    getClient(): SupabaseClient {
        return this.client;
    }
}

export default new SupabaseService();