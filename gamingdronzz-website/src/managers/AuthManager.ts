// managers/AuthManager.ts
import { Session, User } from '@supabase/supabase-js';
import SupabaseService from '../services/SupabaseService';

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isAdmin: boolean;
    initialized: boolean;
}

type AuthSubscriber = (state: AuthState) => void;

class AuthManager {
    private static instance: AuthManager;
    private state: AuthState;
    private subscribers: Set<AuthSubscriber>;
    private authListener: { data?: { subscription?: { unsubscribe: () => void } } } | null;

    constructor() {
        this.state = {
            user: null,
            session: null,
            loading: true,
            isAdmin: false,
            initialized: false
        };
        this.subscribers = new Set();
        this.authListener = null;
    }

    static getInstance(): AuthManager {
        if (!AuthManager.instance) {
            AuthManager.instance = new AuthManager();
        }
        return AuthManager.instance;
    }

    async init(): Promise<void> {
        if (this.state.initialized) return;

        try {
            const { session, error } = await SupabaseService.getSession();

            if (!error && session) {
                await this.handleUserSession(session);
            }

            this.authListener = SupabaseService.onAuthStateChange(
                async (event: string, session: Session | null) => {
                    console.log('Auth event:', event, session?.user?.email);

                    switch (event) {
                        case 'SIGNED_IN':
                            if (session) await this.handleUserSession(session);
                            break;
                        case 'SIGNED_OUT':
                            this.handleSignOut();
                            break;
                        case 'TOKEN_REFRESHED':
                            if (session) await this.handleUserSession(session);
                            break;
                    }
                }
            );

            this.setState({ initialized: true, loading: false });
        } catch (error) {
            console.error('Auth initialization error:', error);
            this.setState({ loading: false, initialized: true });
        }
    }

    private async handleUserSession(session: Session): Promise<void> {
        if (!session?.user) return;

        const isAdmin = await SupabaseService.isAdmin(session.user.id);

        this.setState({
            user: session.user,
            session,
            isAdmin,
            loading: false
        });
    }

    private handleSignOut(): void {
        this.setState({
            user: null,
            session: null,
            isAdmin: false,
            loading: false
        });
    }

    async signInWithGoogle(): Promise<{ success: boolean; data?: any; error?: any }> {
        try {
            const { data, error } = await SupabaseService.signInWithGoogle();
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error };
        }
    }

    async signOut(): Promise<{ success: boolean; error?: any }> {
        try {
            const { error } = await SupabaseService.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error };
        }
    }

    private setState(newState: Partial<AuthState>): void {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    getState(): AuthState {
        return { ...this.state };
    }

    subscribe(callback: AuthSubscriber): () => void {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    private notify(): void {
        this.subscribers.forEach(callback => callback(this.state));
    }

    isAuthenticated(): boolean {
        return !!this.state.user;
    }

    isAdminUser(): boolean {
        return this.state.isAdmin;
    }

    getCurrentUser(): User | null {
        return this.state.user;
    }

    destroy(): void {
        if (this.authListener?.data?.subscription) {
            this.authListener.data.subscription.unsubscribe();
        }
        this.subscribers.clear();
        AuthManager.instance = null as any;
    }
}

export default AuthManager;