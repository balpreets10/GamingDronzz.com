import { User, Session } from '@supabase/supabase-js';
import { UserProfile, UserRole as ProfileUserRole } from './profile';

// ===== CORE AUTHENTICATION TYPES (UI only) =====

export interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    initialized: boolean;
    profile: UserProfile | null;
    profileLoading: boolean;
    profileCompleted: boolean;
}

export interface AuthResult {
    success: boolean;
    error?: { message: string } | null;
    data?: any;
    profile?: UserProfile;
    profileCreated?: boolean;
    profileCompleted?: boolean;
    isAdmin?: boolean;
}

// ===== BASIC TYPES FOR UI COMPATIBILITY =====

export interface OAuthCallbackResult {
    success: boolean;
    error?: string;
    profileCreated?: boolean;
    profileCompleted?: boolean;
    isAdmin?: boolean;
}

export interface ProfileUpdateResult {
    success: boolean;
    error?: string;
    profile?: UserProfile;
}

export type AuthProvider = 'google' | 'email' | 'github' | 'facebook';

export interface AuthResponse extends AuthResult {
    data?: any;
}