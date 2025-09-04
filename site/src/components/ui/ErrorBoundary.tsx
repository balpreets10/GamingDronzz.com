// src/components/ui/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    resetOnPropsChange?: boolean;
    resetKeys?: Array<string | number | boolean | null | undefined>;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
    private resetTimeoutId: number | null = null;

    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ''
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
            errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // Call optional error callback
        if (this.props.onError) {
            try {
                this.props.onError(error, errorInfo);
            } catch (callbackError) {
                console.error('Error in onError callback:', callbackError);
            }
        }

        // Log error details for debugging
        console.group(`🚨 Error Boundary Caught Error [${this.state.errorId}]`);
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
        console.error('Component Stack:', errorInfo.componentStack);
        console.groupEnd();

        // Report to analytics/monitoring service
        this.reportError(error, errorInfo);
    }

    componentDidUpdate(prevProps: Props) {
        const { resetKeys, resetOnPropsChange } = this.props;
        const { hasError } = this.state;

        // Reset error boundary when resetKeys change
        if (hasError && resetKeys && prevProps.resetKeys) {
            const hasResetKeyChanged = resetKeys.some((key, idx) =>
                prevProps.resetKeys![idx] !== key
            );

            if (hasResetKeyChanged) {
                this.resetErrorBoundary();
            }
        }

        // Reset on any prop change if enabled
        if (hasError && resetOnPropsChange && prevProps !== this.props) {
            this.resetErrorBoundary();
        }
    }

    componentWillUnmount() {
        if (this.resetTimeoutId) {
            clearTimeout(this.resetTimeoutId);
        }
    }

    private reportError = (error: Error, errorInfo: ErrorInfo) => {
        try {
            // Here you would integrate with your error reporting service
            // Examples: Sentry, LogRocket, Bugsnag, etc.

            // For now, we'll create a simple error report
            const errorReport = {
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                errorId: this.state.errorId
            };

            // In production, send this to your error monitoring service
            if (process.env.NODE_ENV === 'production') {
                // Example: Sentry.captureException(error, { extra: errorReport });
                console.warn('Error reported:', errorReport);
            }
        } catch (reportingError) {
            console.error('Failed to report error:', reportingError);
        }
    };

    private resetErrorBoundary = () => {
        if (this.resetTimeoutId) {
            clearTimeout(this.resetTimeoutId);
        }

        this.resetTimeoutId = window.setTimeout(() => {
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
                errorId: ''
            });
        }, 100);
    };

    private handleRetry = () => {
        this.resetErrorBoundary();
    };

    private handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="error-boundary">
                    <div className="error-boundary__container">
                        <div className="error-boundary__content">
                            <h2 className="error-boundary__title">
                                Oops! Something went wrong
                            </h2>
                            <p className="error-boundary__message">
                                We encountered an unexpected error. This has been automatically reported to our team.
                            </p>

                            <div className="error-boundary__actions">
                                <button
                                    onClick={this.handleRetry}
                                    className="error-boundary__button error-boundary__button--primary"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={this.handleReload}
                                    className="error-boundary__button error-boundary__button--secondary"
                                >
                                    Reload Page
                                </button>
                            </div>

                            {process.env.NODE_ENV === 'development' && (
                                <details className="error-boundary__details">
                                    <summary>Error Details (Development Only)</summary>
                                    <pre className="error-boundary__stack">
                                        <strong>Error:</strong> {this.state.error?.message}
                                        {'\n\n'}
                                        <strong>Stack:</strong> {this.state.error?.stack}
                                        {'\n\n'}
                                        <strong>Component Stack:</strong> {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}

                            <p className="error-boundary__error-id">
                                Error ID: {this.state.errorId}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    errorBoundaryConfig?: Omit<Props, 'children'>
) => {
    const WithErrorBoundaryComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryConfig}>
            <WrappedComponent {...props} />
        </ErrorBoundary>
    );

    WithErrorBoundaryComponent.displayName =
        `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

    return WithErrorBoundaryComponent;
};

// Specialized error boundaries for specific sections
export const SectionErrorBoundary: React.FC<{
    children: ReactNode;
    sectionName: string;
    fallback?: ReactNode;
}> = ({ children, sectionName, fallback }) => {
    const defaultFallback = (
        <section className="section-error">
            <div className="section-error__container">
                <h2>Unable to load {sectionName}</h2>
                <p>This section is temporarily unavailable. Please try refreshing the page.</p>
                <button onClick={() => window.location.reload()}>
                    Refresh Page
                </button>
            </div>
        </section>
    );

    return (
        <ErrorBoundary
            fallback={fallback || defaultFallback}
            onError={(error, errorInfo) => {
                console.error(`Error in ${sectionName} section:`, error, errorInfo);
            }}
        >
            {children}
        </ErrorBoundary>
    );
};

// Hook for manual error reporting
export const useErrorHandler = () => {
    const reportError = React.useCallback((error: Error, context?: string) => {
        console.error(`Manual error report${context ? ` in ${context}` : ''}:`, error);

        // In production, you'd send this to your error monitoring service
        if (process.env.NODE_ENV === 'production') {
            // Example: Sentry.captureException(error, { tags: { context } });
        }
    }, []);

    // Fixed handleAsyncError function with proper typing
    const handleAsyncError = React.useCallback(<T extends unknown[]>(
        asyncFn: (...args: T) => Promise<any>,
        context?: string
    ) => {
        return async (...args: T): Promise<any> => {
            try {
                return await asyncFn(...args);
            } catch (error) {
                reportError(error as Error, context);
                throw error; // Re-throw to allow component-level handling
            }
        };
    }, [reportError]);

    return { reportError, handleAsyncError };
};

export default ErrorBoundary;