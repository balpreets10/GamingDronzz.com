import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './LoginForm.css';

const LoginForm = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { signInWithGoogle } = useAuth();

    const handleGoogleSignIn = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const result = await signInWithGoogle();
            if (!result.success) {
                setError(result.error?.message || 'Sign in failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-form">
            <div className="login-form__container">
                <div className="login-form__header">
                    <h1 className="login-form__title">Admin Access</h1>
                    <p className="login-form__subtitle">
                        Sign in with your Google account to access the admin dashboard
                    </p>
                </div>

                <div className="login-form__content">
                    {error && (
                        <div className="login-form__error">
                            <span className="login-form__error-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    <button
                        className="login-form__google-btn"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                    >
                        <span className="login-form__google-icon">🔑</span>
                        {loading ? 'Signing in...' : 'Sign in with Google'}
                    </button>
                </div>

                <div className="login-form__footer">
                    <p className="login-form__help">
                        Only authorized administrators can access this area.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;