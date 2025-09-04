// components/auth/AuthCallback.tsx - Handle OAuth redirects
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const AuthCallback = () => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing authentication...');
    const { handleOAuthCallback } = useAuth();

    useEffect(() => {
        const processCallback = async () => {
            try {
                const result = await handleOAuthCallback();

                if (result.success) {
                    setStatus('success');
                    setMessage('Authentication successful! Redirecting...');

                    // Redirect to home page after 2 seconds
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                } else {
                    setStatus('error');
                    setMessage(result.error || 'Authentication failed');
                }
            } catch (error) {
                console.error('OAuth callback error:', error);
                setStatus('error');
                setMessage('An unexpected error occurred during authentication');
            }
        };

        // Small delay to ensure page is ready
        const timer = setTimeout(processCallback, 500);

        return () => clearTimeout(timer);
    }, [handleOAuthCallback]);

    const handleRetry = () => {
        window.location.href = '/';
    };

    return (
        <div className="login-form">
            <div className="login-form__container">
                <div className="login-form__header">
                    <h1 className="login-form__title">
                        {status === 'loading' && 'Authenticating...'}
                        {status === 'success' && 'Welcome!'}
                        {status === 'error' && 'Authentication Error'}
                    </h1>
                </div>

                <div className="login-form__content">
                    {status === 'loading' && (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <LoadingSpinner />
                            <p style={{ marginTop: '1rem', color: 'var(--gd-text-secondary)' }}>
                                {message}
                            </p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="login-form__success">
                            <span className="login-form__success-icon">✅</span>
                            {message}
                        </div>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="login-form__error">
                                <span className="login-form__error-icon">⚠️</span>
                                {message}
                            </div>

                            <button
                                className="login-form__submit-btn"
                                onClick={handleRetry}
                                type="button"
                            >
                                Return to Home
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthCallback;