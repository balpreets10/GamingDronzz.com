import { User, Session } from '@supabase/supabase-js';

export interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isAdmin: boolean;
    initialized: boolean;
}

export interface AuthResponse {
    success: boolean;
    data?: any;
    error?: any;
}

export interface UserRole {
    id: string;
    user_id: string;
    role: 'admin' | 'user';
    created_at: string;
    updated_at: string;
}