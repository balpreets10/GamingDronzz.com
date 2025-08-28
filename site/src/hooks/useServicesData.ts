import { useState, useEffect, useCallback } from 'react';

export interface ServiceData {
    id: string;
    title: string;
    category: 'development' | 'consulting' | 'optimization' | 'design';
    description: string;
    features: string[];
    pricing: string;
    icon: string;
    featured: boolean;
    priority: number;
}

export interface ServiceCategory {
    id: string;
    label: string;
    count: number;
}

export interface ProcessStep {
    number: number;
    title: string;
    description: string;
    duration: string;
}

export interface ServicesDataResponse {
    services: ServiceData[];
    categories: ServiceCategory[];
    process: ProcessStep[];
}

interface UseServicesDataState {
    data: ServicesDataResponse | null;
    loading: boolean;
    error: string | null;
}

interface UseServicesDataOptions {
    loadOnMount?: boolean;
    retryCount?: number;
    retryDelay?: number;
}

export const useServicesData = (options: UseServicesDataOptions = {}) => {
    const {
        loadOnMount = false,
        retryCount = 3,
        retryDelay = 1000
    } = options;

    const [state, setState] = useState<UseServicesDataState>({
        data: null,
        loading: false,
        error: null
    });

    const loadServices = useCallback(async (attempt = 0): Promise<void> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            // Simulate network delay for better UX (remove in production)
            if (process.env.NODE_ENV === 'development') {
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            const response = await fetch('./data/services.json', {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'public, max-age=300' // 5 minute cache
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to load services data: ${response.status} ${response.statusText}`);
            }

            const data: ServicesDataResponse = await response.json();

            // Validate data structure
            if (!data.services || !Array.isArray(data.services)) {
                throw new Error('Invalid services data structure');
            }

            // Sort services by priority
            data.services.sort((a, b) => a.priority - b.priority);

            setState({
                data,
                loading: false,
                error: null
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load services data';

            // Retry logic
            if (attempt < retryCount) {
                console.warn(`Services data load attempt ${attempt + 1} failed, retrying...`, errorMessage);
                setTimeout(() => {
                    loadServices(attempt + 1);
                }, retryDelay * Math.pow(2, attempt)); // Exponential backoff
                return;
            }

            console.error('Failed to load services data after all retries:', errorMessage);
            setState({
                data: null,
                loading: false,
                error: errorMessage
            });
        }
    }, [retryCount, retryDelay]);

    useEffect(() => {
        if (loadOnMount) {
            loadServices();
        }
    }, [loadOnMount, loadServices]);

    // Helper functions
    const getFeaturedServices = useCallback((): ServiceData[] => {
        return state.data?.services.filter(service => service.featured) || [];
    }, [state.data]);

    const getServicesByCategory = useCallback((category: string): ServiceData[] => {
        if (!state.data?.services) return [];
        if (category === 'all') return state.data.services;
        return state.data.services.filter(service => service.category === category);
    }, [state.data]);

    const getServiceById = useCallback((id: string): ServiceData | undefined => {
        return state.data?.services.find(service => service.id === id);
    }, [state.data]);

    return {
        ...state,
        loadServices,
        getFeaturedServices,
        getServicesByCategory,
        getServiceById,
        // Computed properties
        hasData: !!state.data,
        isEmpty: state.data?.services.length === 0,
        isReady: !state.loading && !!state.data && !state.error
    };
};