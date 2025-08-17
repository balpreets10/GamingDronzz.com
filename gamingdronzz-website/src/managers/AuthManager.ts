// managers/AuthManager.ts - Fixed Supabase auth integration
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import SupabaseService from '../services/SupabaseService';

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isAdmin: boolean;
    initialized: boolean;
    failedAttempts: number;
    isLocked: boolean;
    lockoutExpiry: number | null;
}

type AuthSubscriber = (state: AuthState) => void;

class AuthManager {
    private static instance: AuthManager;
    private state: AuthState;
    private subscribers: Set<AuthSubscriber>;
    private authListener: (() => void) | null = null;
    private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
    private readonly MAX_ATTEMPTS = 10;
    private readonly LOCKOUT_KEY = 'auth_lockout';
    private readonly ATTEMPTS_KEY = 'auth_attempts';
    private notificationCallback: ((message: string, type: 'success' | 'error') => void) | null = null;

    constructor() {
        this.state = {
            user: null,
            session: null,
            loading: true,
            isAdmin: false,
            initialized: false,
            failedAttempts: this.getStoredAttempts(),
            isLocked: this.checkLockoutStatus(),
            lockoutExpiry: this.getLockoutExpiry()
        };
        this.subscribers = new Set();
    }

    static getInstance(): AuthManager {
        if (!AuthManager.instance) {
            AuthManager.instance = new AuthManager();
        }
        return AuthManager.instance;
    }

    setNotificationCallback(callback: (message: string, type: 'success' | 'error') => void): void {
        this.notificationCallback = callback;
    }

    private showNotification(message: string, type: 'success' | 'error'): void {
        if (this.notificationCallback) {
            this.notificationCallback(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    async init(): Promise<void> {
        if (this.state.initialized) return;

        try {
            this.checkAndUpdateLockout();

            // Fixed: Use correct response structure
            const { session, error } = await SupabaseService.getSession();

            if (!error && session) {
                await this.handleUserSession(session);
                this.resetFailedAttempts();
            }

            // Fixed: Proper Supabase auth listener with correct return type
            this.authListener = SupabaseService.onAuthStateChange(
                async (event: AuthChangeEvent, session: Session | null) => {
                    console.log('Auth event:', event, session?.user?.email);

                    switch (event) {
                        case 'SIGNED_IN':
                            if (session) {
                                await this.handleUserSession(session);
                                this.resetFailedAttempts();

                                const provider = session.user.app_metadata?.provider;
                                if (provider === 'google') {
                                    const userName = this.getDisplayName(session.user);
                                    this.showNotification(`Welcome back, ${userName}!`, 'success');
                                }
                            }
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

    private getDisplayName(user: User): string {
        return user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'User';
    }

    // ===== LOCKOUT MANAGEMENT ===== //
    private getStoredAttempts(): number {
        try {
            const stored = localStorage.getItem(this.ATTEMPTS_KEY);
            return stored ? parseInt(stored, 10) : 0;
        } catch {
            return 0;
        }
    }

    private getLockoutExpiry(): number | null {
        try {
            const stored = localStorage.getItem(this.LOCKOUT_KEY);
            return stored ? parseInt(stored, 10) : null;
        } catch {
            return null;
        }
    }

    private checkLockoutStatus(): boolean {
        const expiry = this.getLockoutExpiry();
        if (!expiry) return false;

        const now = Date.now();
        if (now > expiry) {
            this.clearLockout();
            return false;
        }

        return true;
    }

    private checkAndUpdateLockout(): void {
        const isCurrentlyLocked = this.checkLockoutStatus();
        const lockoutExpiry = this.getLockoutExpiry();

        this.setState({
            isLocked: isCurrentlyLocked,
            lockoutExpiry,
            failedAttempts: this.getStoredAttempts()
        });
    }

    private incrementFailedAttempts(): void {
        const newAttempts = this.state.failedAttempts + 1;

        try {
            localStorage.setItem(this.ATTEMPTS_KEY, newAttempts.toString());
        } catch (error) {
            console.warn('Failed to store auth attempts:', error);
        }

        if (newAttempts >= this.MAX_ATTEMPTS) {
            this.setLockout();
        } else {
            this.setState({ failedAttempts: newAttempts });
        }
    }

    private setLockout(): void {
        const expiry = Date.now() + this.LOCKOUT_DURATION;

        try {
            localStorage.setItem(this.LOCKOUT_KEY, expiry.toString());
        } catch (error) {
            console.warn('Failed to store lockout:', error);
        }

        this.setState({
            isLocked: true,
            lockoutExpiry: expiry,
            failedAttempts: this.MAX_ATTEMPTS
        });
    }

    private resetFailedAttempts(): void {
        try {
            localStorage.removeItem(this.ATTEMPTS_KEY);
            localStorage.removeItem(this.LOCKOUT_KEY);
        } catch (error) {
            console.warn('Failed to clear auth storage:', error);
        }

        this.setState({
            failedAttempts: 0,
            isLocked: false,
            lockoutExpiry: null
        });
    }

    private clearLockout(): void {
        try {
            localStorage.removeItem(this.LOCKOUT_KEY);
            localStorage.removeItem(this.ATTEMPTS_KEY);
        } catch (error) {
            console.warn('Failed to clear lockout:', error);
        }
    }

    // ===== AUTHENTICATION METHODS ===== //
    async signInWithGoogle(): Promise<{ success: boolean; data?: any; error?: any }> {
        if (this.state.isLocked) {
            const message = `Account temporarily locked. Try again in ${Math.ceil((this.state.lockoutExpiry! - Date.now()) / 60000)} minutes.`;
            this.showNotification(message, 'error');
            return {
                success: false,
                error: { message }
            };
        }

        try {
            const { data, error } = await SupabaseService.signInWithGoogle();
            if (error) {
                this.showNotification('Google sign in failed. Please try again.', 'error');
                throw error;
            }

            return { success: true, data };
        } catch (error) {
            console.error('Google sign in error:', error);
            this.showNotification('Google sign in failed. Please try again.', 'error');
            return { success: false, error };
        }
    }

    async signInWithEmail(email: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; data?: any; error?: any }> {
        if (this.state.isLocked) {
            const message = `Account temporarily locked. Try again in ${Math.ceil((this.state.lockoutExpiry! - Date.now()) / 60000)} minutes.`;
            this.showNotification(message, 'error');
            return {
                success: false,
                error: { message }
            };
        }

        try {
            const { data, error } = await SupabaseService.signInWithEmail(email, password, rememberMe);

            if (error) {
                this.incrementFailedAttempts();
                this.showNotification('Invalid email or password.', 'error');
                throw error;
            }

            return { success: true, data };
        } catch (error) {
            console.error('Email sign in error:', error);
            return { success: false, error };
        }
    }

    async signUpWithEmail(email: string, password: string): Promise<{ success: boolean; data?: any; error?: any }> {
        if (this.state.isLocked) {
            const message = `Account temporarily locked. Try again in ${Math.ceil((this.state.lockoutExpiry! - Date.now()) / 60000)} minutes.`;
            this.showNotification(message, 'error');
            return {
                success: false,
                error: { message }
            };
        }

        try {
            const { data, error } = await SupabaseService.signUpWithEmail(email, password);
            if (error) {
                this.showNotification('Failed to create account. Please try again.', 'error');
                throw error;
            }

            this.showNotification('Account created! Please check your email to verify.', 'success');
            return { success: true, data };
        } catch (error) {
            console.error('Email sign up error:', error);
            return { success: false, error };
        }
    }

    async signOut(): Promise<{ success: boolean; error?: any }> {
        try {
            const { error } = await SupabaseService.signOut();
            if (error) throw error;

            this.showNotification('Successfully signed out.', 'success');
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            this.showNotification('Sign out failed. Please try again.', 'error');
            return { success: false, error };
        }
    }

    // ===== STATE MANAGEMENT ===== //
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

    // ===== PUBLIC GETTERS ===== //
    isAuthenticated(): boolean {
        return !!this.state.user;
    }

    isAdminUser(): boolean {
        return this.state.isAdmin;
    }

    getCurrentUser(): User | null {
        return this.state.user;
    }

    getFailedAttempts(): number {
        return this.state.failedAttempts;
    }

    getRemainingLockoutTime(): number {
        if (!this.state.isLocked || !this.state.lockoutExpiry) return 0;
        return Math.max(0, this.state.lockoutExpiry - Date.now());
    }

    isAccountLocked(): boolean {
        return this.state.isLocked;
    }

    // ===== CLEANUP ===== //
    destroy(): void {
        if (this.authListener) {
            this.authListener();
        }
        this.subscribers.clear();
        AuthManager.instance = null as any;
    }
}

export default AuthManager;