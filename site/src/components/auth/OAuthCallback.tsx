// components/auth/OAuthCallback.tsx - Handle OAuth callback and redirect
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import './ProtectedRoute.css';

const OAuthCallback = () => {
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const { handleOAuthCallback } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const hasProcessed = useRef(false);

    useEffect(() => {
        const processCallback = async () => {
            // Prevent multiple executions in React Strict Mode
            if (hasProcessed.current) {
                console.log('OAuth callback already processed, skipping...');
                return;
            }
            
            hasProcessed.current = true;
            
            try {
                console.log('Processing OAuth callback...');
                
                // Check for error parameters first
                const error = searchParams.get('error');
                const errorDescription = searchParams.get('error_description');
                
                if (error) {
                    console.error('OAuth error:', error, errorDescription);
                    setStatus('error');
                    setErrorMessage(errorDescription || error);
                    return;
                }

                // Handle the OAuth callback
                const result = await handleOAuthCallback();
                
                if (result.success) {
                    setStatus('success');
                    console.log('OAuth callback successful, redirecting to home...');
                    
                    // Redirect immediately to avoid hanging on callback page
                    navigate('/', { replace: true });
                } else {
                    setStatus('error');
                    setErrorMessage(result.error || 'Authentication failed');
                }
            } catch (error: any) {
                console.error('OAuth callback processing error:', error);
                setStatus('error');
                setErrorMessage(error?.message || 'An unexpected error occurred');
                hasProcessed.current = false; // Allow retry on error
            }
        };

        processCallback();
    }, [handleOAuthCallback, navigate, searchParams]);

    const handleRetry = () => {
        navigate('/', { replace: true });
    };

    if (status === 'processing') {
        return (
            <div className="protected-route protected-route--loading">
                <div className="protected-route__container">
                    <div className="protected-route__loading-spinner">
                        <LoadingSpinner />
                    </div>
                    <h2 className="protected-route__title">Completing Sign In...</h2>
                    <p className="protected-route__message">
                        Please wait while we finish setting up your account.
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="protected-route protected-route--loading">
                <div className="protected-route__container">
                    <h2 className="protected-route__title">✅ Sign In Successful!</h2>
                    <p className="protected-route__message">
                        Welcome to Gaming Dronzz! Redirecting you to the homepage...
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="protected-route protected-route--unauthenticated">
                <div className="protected-route__container">
                    <h2 className="protected-route__title">❌ Authentication Error</h2>
                    <p className="protected-route__message">
                        {errorMessage || 'There was a problem completing your sign in.'}
                    </p>
                    <button 
                        onClick={handleRetry}
                        className="protected-route__action-button"
                        style={{ marginTop: '1rem' }}
                    >
                        Return to Homepage
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default OAuthCallback;