// components/auth/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import LoginForm from './LoginForm';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
    children: ReactNode;
    requireAdmin?: boolean;
    fallback?: ReactNode;
}

const ProtectedRoute = ({ children, requireAdmin = false, fallback = null }: ProtectedRouteProps) => {
    const { loading, isAuthenticated, isAdmin, user } = useAuth();

    if (loading) {
        return (
            <div className="protected-route protected-route--loading">
                <LoadingSpinner />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <>{fallback || <LoginForm />}</>;
    }

    if (requireAdmin && !isAdmin) {
        return (
            <div className="protected-route protected-route--unauthorized">
                <div className="protected-route__container">
                    <h2 className="protected-route__title">Access Denied</h2>
                    <p className="protected-route__message">
                        You don't have admin privileges to access this area.
                    </p>
                    <p className="protected-route__user-info">
                        Signed in as: {user?.email}
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

interface AdminRouteProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export const AdminRoute = ({ children, fallback = null }: AdminRouteProps) => (
    <ProtectedRoute requireAdmin={true} fallback={fallback}>
        {children}
    </ProtectedRoute>
);

export default ProtectedRoute;