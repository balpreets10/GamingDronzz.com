// hooks/useAuth.ts - Simplified hook that uses AuthContext
import { useAuthContext } from '../contexts/AuthContext';

// Re-export the context hook for backward compatibility
export const useAuth = () => {
    return useAuthContext();
};