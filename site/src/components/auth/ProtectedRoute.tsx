// components/auth/ProtectedRoute.tsx - Non-functional (UI only)
import { ReactNode } from 'react';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
    children: ReactNode;
    requireAdmin?: boolean;
    requireProfileCompletion?: boolean;
    minCompletionPercentage?: number;
    fallback?: ReactNode;
    profileIncompleteCallback?: () => void;
}

const ProtectedRoute = ({ 
    children, 
    requireAdmin: _requireAdmin = false, 
    requireProfileCompletion: _requireProfileCompletion = false,
    minCompletionPercentage: _minCompletionPercentage = 60,
    fallback: _fallback = null,
    profileIncompleteCallback: _profileIncompleteCallback
}: ProtectedRouteProps) => {
    // Non-functional - always render children
    return <>{children}</>;
};

interface AdminRouteProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ProfileRequiredRouteProps {
    children: ReactNode;
    minCompletionPercentage?: number;
    fallback?: ReactNode;
    onProfileIncomplete?: () => void;
}

export const AdminRoute = ({ children }: AdminRouteProps) => (
    <>{children}</>
);

export const ProfileRequiredRoute = ({ children }: ProfileRequiredRouteProps) => (
    <>{children}</>
);

export default ProtectedRoute;