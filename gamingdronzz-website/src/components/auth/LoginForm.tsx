import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './LoginForm.css';

const LoginForm = () => {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        rememberMe: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type, checked, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError(null);
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await signInWithGoogle();
            if (!result.success) {
                setError(result.error?.message || 'Google sign in failed');
            }
        } catch (err) {
            setError('An unexpected error occurred with Google sign in');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Basic validation
        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            setLoading(false);
            return;
        }

        if (mode === 'signup' && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const result = mode === 'signin'
                ? await signInWithEmail(formData.email, formData.password, formData.rememberMe)
                : await signUpWithEmail(formData.email, formData.password);

            if (!result.success) {
                setError(result.error?.message || `${mode === 'signin' ? 'Sign in' : 'Sign up'} failed`);
            } else if (mode === 'signup') {
                setSuccess('Account created successfully! Please check your email to verify your account.');
                setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    rememberMe: false
                });
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(prev => prev === 'signin' ? 'signup' : 'signin');
        setError(null);
        setSuccess(null);
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            rememberMe: false
        });
    };

    return (
        <div className="login-form">
            <div className="login-form__container">
                <div className="login-form__header">
                    <h1 className="login-form__title">
                        {mode === 'signin' ? 'Admin Access' : 'Create Admin Account'}
                    </h1>
                    <p className="login-form__subtitle">
                        {mode === 'signin'
                            ? 'Sign in to access the admin dashboard'
                            : 'Create your admin account to get started'
                        }
                    </p>
                </div>

                <div className="login-form__content">
                    {error && (
                        <div className="login-form__error">
                            <span className="login-form__error-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="login-form__success">
                            <span className="login-form__success-icon">✅</span>
                            {success}
                        </div>
                    )}

                    {/* Google Sign In */}
                    <button
                        className="login-form__google-btn"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        type="button"
                    >
                        <span className="login-form__google-icon">🔑</span>
                        {loading ? 'Signing in...' : 'Continue with Google'}
                    </button>

                    <div className="login-form__divider">
                        <span className="login-form__divider-text">or</span>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailAuth} className="login-form__form">
                        <div className="login-form__field">
                            <label htmlFor="email" className="login-form__label">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="login-form__input"
                                placeholder="Enter your email"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="login-form__field">
                            <label htmlFor="password" className="login-form__label">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="login-form__input"
                                placeholder="Enter your password"
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        {mode === 'signup' && (
                            <div className="login-form__field">
                                <label htmlFor="confirmPassword" className="login-form__label">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="login-form__input"
                                    placeholder="Confirm your password"
                                    required
                                    disabled={loading}
                                    minLength={6}
                                />
                            </div>
                        )}

                        {mode === 'signin' && (
                            <div className="login-form__checkbox">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleInputChange}
                                    className="login-form__checkbox-input"
                                    disabled={loading}
                                />
                                <label htmlFor="rememberMe" className="login-form__checkbox-label">
                                    Remember me for 30 days
                                </label>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-form__submit-btn"
                            disabled={loading}
                        >
                            {loading
                                ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                                : (mode === 'signin' ? 'Sign In' : 'Create Account')
                            }
                        </button>
                    </form>
                </div>

                <div className="login-form__footer">
                    <p className="login-form__help">
                        {mode === 'signin'
                            ? "Don't have an admin account? "
                            : "Already have an account? "
                        }
                        <button
                            type="button"
                            className="login-form__mode-toggle"
                            onClick={toggleMode}
                            disabled={loading}
                        >
                            {mode === 'signin' ? 'Create one here' : 'Sign in here'}
                        </button>
                    </p>
                    <p className="login-form__help">
                        Only authorized administrators can access this area.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;