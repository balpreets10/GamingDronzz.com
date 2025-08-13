// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import AuthManager from '../managers/AuthManager';

interface UseAuthReturn {
    user: User | null;
    session: any;
    loading: boolean;
    isAdmin: boolean;
    initialized: boolean;
    isAuthenticated: boolean;
    signInWithGoogle: () => Promise<{ success: boolean; data?: any; error?: any }>;
    signOut: () => Promise<{ success: boolean; error?: any }>;
}

export const useAuth = (): UseAuthReturn => {
    const [authState, setAuthState] = useState(() =>
        AuthManager.getInstance().getState()
    );

    useEffect(() => {
        const authManager = AuthManager.getInstance();

        authManager.init();

        const unsubscribe = authManager.subscribe(setAuthState);

        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        const authManager = AuthManager.getInstance();
        return await authManager.signInWithGoogle();
    };

    const signOut = async () => {
        const authManager = AuthManager.getInstance();
        return await authManager.signOut();
    };

    return {
        ...authState,
        signInWithGoogle,
        signOut,
        isAuthenticated: authState.user !== null
    };
};

export default useAuth;