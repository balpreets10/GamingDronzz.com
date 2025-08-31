// hooks/useRealtimeData.ts - Real-time data synchronization hooks
import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import databaseService from '../services/DatabaseService';
import supabaseService from '../services/SupabaseService';
import type { 
    DatabaseProject, 
    DatabaseService as DBService, 
    DatabaseArticle,
    DatabaseTestimonial,
    IQueryOptions 
} from '../services/DatabaseService';

// ===== GENERIC REALTIME HOOK =====
interface UseRealtimeDataOptions<T> {
    tableName: string;
    initialFetch: () => Promise<T[]>;
    queryOptions?: IQueryOptions;
    enabled?: boolean;
}

interface UseRealtimeDataReturn<T> {
    data: T[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

function useRealtimeData<T extends { id: string }>({
    tableName,
    initialFetch,
    queryOptions,
    enabled = true
}: UseRealtimeDataOptions<T>): UseRealtimeDataReturn<T> {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    const handleInsert = useCallback((payload: RealtimePostgresChangesPayload<T>) => {
        setData(prevData => {
            const newRecord = payload.new as T;
            const exists = prevData.some(item => item.id === newRecord.id);
            
            if (!exists) {
                return [...prevData, newRecord];
            }
            return prevData;
        });
    }, []);

    const handleUpdate = useCallback((payload: RealtimePostgresChangesPayload<T>) => {
        setData(prevData => 
            prevData.map(item => 
                item.id === payload.new.id ? payload.new as T : item
            )
        );
    }, []);

    const handleDelete = useCallback((payload: RealtimePostgresChangesPayload<T>) => {
        setData(prevData => 
            prevData.filter(item => item.id !== payload.old.id)
        );
    }, []);

    const fetchData = useCallback(async () => {
        if (!enabled) return;

        try {
            setLoading(true);
            setError(null);
            const result = await initialFetch();
            setData(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
            setError(errorMessage);
            console.error(`Error fetching ${tableName}:`, err);
        } finally {
            setLoading(false);
        }
    }, [initialFetch, tableName, enabled]);

    const refresh = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!enabled) {
            setData([]);
            setLoading(false);
            return;
        }

        // Initial fetch
        fetchData();

        // Set up real-time subscription
        const client = supabaseService.getClient();
        const channel = client
            .channel(`${tableName}_changes`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: tableName
                },
                handleInsert
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: tableName
                },
                handleUpdate
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: tableName
                },
                handleDelete
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`✅ Subscribed to ${tableName} changes`);
                } else if (status === 'CHANNEL_ERROR') {
                    console.error(`❌ Failed to subscribe to ${tableName} changes`);
                }
            });

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                client.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [tableName, fetchData, handleInsert, handleUpdate, handleDelete, enabled]);

    return {
        data,
        loading,
        error,
        refresh
    };
}

// ===== SPECIALIZED HOOKS =====

export const useRealtimeProjects = (options?: { 
    featuredOnly?: boolean; 
    category?: string;
    enabled?: boolean;
}) => {
    const fetchFunction = useCallback(async () => {
        if (options?.featuredOnly) {
            return await databaseService.projects.getFeatured();
        }
        if (options?.category) {
            return await databaseService.projects.getByCategory(options.category);
        }
        return await databaseService.projects.getPublished();
    }, [options?.featuredOnly, options?.category]);

    return useRealtimeData<DatabaseProject>({
        tableName: 'projects',
        initialFetch: fetchFunction,
        enabled: options?.enabled
    });
};

export const useRealtimeServices = (options?: { 
    featuredOnly?: boolean; 
    category?: string;
    enabled?: boolean;
}) => {
    const fetchFunction = useCallback(async () => {
        if (options?.featuredOnly) {
            return await databaseService.services.getFeatured();
        }
        if (options?.category) {
            return await databaseService.services.getByCategory(options.category);
        }
        return await databaseService.services.getPublished();
    }, [options?.featuredOnly, options?.category]);

    return useRealtimeData<DBService>({
        tableName: 'services',
        initialFetch: fetchFunction,
        enabled: options?.enabled
    });
};

export const useRealtimeArticles = (options?: { 
    featuredOnly?: boolean;
    limit?: number;
    enabled?: boolean;
}) => {
    const fetchFunction = useCallback(async () => {
        if (options?.featuredOnly) {
            return await databaseService.articles.getFeatured();
        }
        return await databaseService.articles.getPublished({
            limit: options?.limit
        });
    }, [options?.featuredOnly, options?.limit]);

    return useRealtimeData<DatabaseArticle>({
        tableName: 'articles',
        initialFetch: fetchFunction,
        enabled: options?.enabled
    });
};

export const useRealtimeTestimonials = (options?: { 
    featuredOnly?: boolean;
    enabled?: boolean;
}) => {
    const fetchFunction = useCallback(async () => {
        if (options?.featuredOnly) {
            return await databaseService.testimonials.getFeatured();
        }
        return await databaseService.testimonials.getPublished();
    }, [options?.featuredOnly]);

    return useRealtimeData<DatabaseTestimonial>({
        tableName: 'testimonials',
        initialFetch: fetchFunction,
        enabled: options?.enabled
    });
};

// ===== PROJECT-SPECIFIC HOOKS =====

export const useProject = (slug: string, options?: { enabled?: boolean }) => {
    const [project, setProject] = useState<DatabaseProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProject = useCallback(async () => {
        if (!options?.enabled && options?.enabled !== undefined) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.projects.getBySlug(slug);
            setProject(result);

            // Increment view count
            if (result?.id) {
                await databaseService.projects.incrementViewCount(result.id);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project';
            setError(errorMessage);
            console.error('Error fetching project:', err);
        } finally {
            setLoading(false);
        }
    }, [slug, options?.enabled]);

    useEffect(() => {
        if (slug) {
            fetchProject();
        }
    }, [fetchProject, slug]);

    return { project, loading, error, refresh: fetchProject };
};

export const useService = (slug: string, options?: { enabled?: boolean }) => {
    const [service, setService] = useState<DBService | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchService = useCallback(async () => {
        if (!options?.enabled && options?.enabled !== undefined) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.services.getBySlug(slug);
            setService(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch service';
            setError(errorMessage);
            console.error('Error fetching service:', err);
        } finally {
            setLoading(false);
        }
    }, [slug, options?.enabled]);

    useEffect(() => {
        if (slug) {
            fetchService();
        }
    }, [fetchService, slug]);

    return { service, loading, error, refresh: fetchService };
};

export const useArticle = (slug: string, options?: { enabled?: boolean }) => {
    const [article, setArticle] = useState<DatabaseArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchArticle = useCallback(async () => {
        if (!options?.enabled && options?.enabled !== undefined) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.articles.getBySlug(slug);
            setArticle(result);

            // Increment view count
            if (result?.id) {
                await databaseService.articles.incrementViewCount(result.id);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch article';
            setError(errorMessage);
            console.error('Error fetching article:', err);
        } finally {
            setLoading(false);
        }
    }, [slug, options?.enabled]);

    useEffect(() => {
        if (slug) {
            fetchArticle();
        }
    }, [fetchArticle, slug]);

    return { article, loading, error, refresh: fetchArticle };
};

// ===== CONTACT FORM HOOK =====
export const useContactForm = () => {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitInquiry = useCallback(async (formData: {
        name: string;
        email: string;
        company?: string;
        phone?: string;
        subject: string;
        message: string;
        serviceInterest?: string;
        projectBudget?: string;
        timeline?: string;
    }) => {
        try {
            setSubmitting(true);
            setError(null);

            await databaseService.inquiries.submitInquiry({
                name: formData.name,
                email: formData.email,
                company: formData.company,
                phone: formData.phone,
                subject: formData.subject,
                message: formData.message,
                service_interest: formData.serviceInterest,
                project_budget: formData.projectBudget,
                timeline: formData.timeline
            });

            setSubmitted(true);
            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to submit inquiry';
            setError(errorMessage);
            console.error('Error submitting inquiry:', err);
            return { success: false, error: errorMessage };
        } finally {
            setSubmitting(false);
        }
    }, []);

    const reset = useCallback(() => {
        setSubmitting(false);
        setSubmitted(false);
        setError(null);
    }, []);

    return {
        submitInquiry,
        submitting,
        submitted,
        error,
        reset
    };
};

// ===== DATABASE HEALTH CHECK HOOK =====
export const useDatabaseHealth = () => {
    const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');
    const [message, setMessage] = useState<string>('Checking database connection...');

    const checkHealth = useCallback(async () => {
        try {
            setStatus('checking');
            const health = await databaseService.healthCheck();
            setStatus(health.status);
            setMessage(health.message);
        } catch (error) {
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Unknown error');
        }
    }, []);

    useEffect(() => {
        checkHealth();
        
        // Check health every 5 minutes
        const interval = setInterval(checkHealth, 5 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, [checkHealth]);

    return { status, message, checkHealth };
};