/**
 * Analytics utilities for tracking user interactions
 */

interface AnalyticsEvent {
    action: string;
    category: string;
    label?: string;
    value?: number;
    custom_parameters?: Record<string, any>;
}

export const trackEvent = (event: AnalyticsEvent): void => {
    // In development, just log to console
    if (process.env.NODE_ENV === 'development') {
        console.log('Analytics Event:', event);
        return;
    }

    // Google Analytics 4 implementation
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event.action, {
            event_category: event.category,
            event_label: event.label,
            value: event.value,
            ...event.custom_parameters
        });
    }
};

export const trackPageView = (path: string, title?: string): void => {
    if (process.env.NODE_ENV === 'development') {
        console.log('Page View:', { path, title });
        return;
    }

    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', 'GA_TRACKING_ID', {
            page_path: path,
            page_title: title
        });
    }
};

export const trackPerformance = (metric: string, value: number): void => {
    trackEvent({
        action: 'performance_metric',
        category: 'Performance',
        label: metric,
        value: Math.round(value)
    });
};

export const trackError = (error: Error, context?: string): void => {
    trackEvent({
        action: 'error',
        category: 'Error',
        label: context || 'Unknown',
        custom_parameters: {
            error_message: error.message,
            error_stack: error.stack?.slice(0, 500)
        }
    });
};