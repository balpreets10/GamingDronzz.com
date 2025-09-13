// hooks/useDataFetch.ts - Data fetching hooks
import { useState, useEffect, useCallback } from 'react';
import databaseService from '../services/DatabaseService';
import type { 
    DatabaseProject, 
    DatabaseService as DBService, 
    DatabaseArticle,
    DatabaseTestimonial,
    IQueryOptions,
    IPaginationResult,
    IPaginationOptions 
} from '../services/DatabaseService';

// ===== GENERIC DATA FETCHING HOOK =====
interface UseDataFetchOptions<T> {
    fetchFunction: () => Promise<T[]>;
    enabled?: boolean;
}

interface UseDataFetchReturn<T> {
    data: T[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

function useDataFetch<T>({
    fetchFunction,
    enabled = true
}: UseDataFetchOptions<T>): UseDataFetchReturn<T> {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!enabled) {
            setData([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const result = await fetchFunction();
            setData(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
            setError(errorMessage);
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchFunction, enabled]);

    const refresh = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refresh
    };
}

// ===== SPECIALIZED HOOKS =====

export const useProjects = (options?: { 
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

    return useDataFetch<DatabaseProject>({
        fetchFunction,
        enabled: options?.enabled
    });
};

// ===== PAGINATED PROJECTS HOOK =====
interface UsePaginatedProjectsOptions {
    featuredOnly?: boolean;
    category?: string;
    itemsPerPage?: number;
    enabled?: boolean;
}

interface UsePaginatedProjectsReturn {
    data: DatabaseProject[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
    loading: boolean;
    error: string | null;
    setPage: (page: number) => void;
    refresh: () => Promise<void>;
}

export const usePaginatedProjects = (options: UsePaginatedProjectsOptions = {}): UsePaginatedProjectsReturn => {
    const {
        featuredOnly = false,
        category,
        itemsPerPage = 4,
        enabled = true
    } = options;

    const [currentPage, setCurrentPage] = useState(1);
    const [paginationResult, setPaginationResult] = useState<IPaginationResult<DatabaseProject> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [featuredOnly, category, itemsPerPage]);

    const fetchData = useCallback(async (page: number = currentPage) => {
        if (!enabled) return;

        try {
            setLoading(true);
            setError(null);

            const paginationOptions: IPaginationOptions = {
                page,
                itemsPerPage,
                orderBy: 'created_at',
                ascending: false
            };

            let result: IPaginationResult<DatabaseProject>;

            if (featuredOnly) {
                result = await databaseService.projects.getFeaturedPaginated(paginationOptions);
            } else if (category) {
                result = await databaseService.projects.getByCategoryPaginated(category, paginationOptions);
            } else {
                result = await databaseService.projects.getPublishedPaginated(paginationOptions);
            }

            setPaginationResult(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
            setError(errorMessage);
            console.error('Error fetching paginated projects:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, featuredOnly, category, enabled]);

    const setPage = useCallback((page: number) => {
        if (page === currentPage) return;
        setCurrentPage(page);
    }, [currentPage]);

    const refresh = useCallback(async () => {
        await fetchData(currentPage);
    }, [fetchData, currentPage]);


    // Initial fetch
    useEffect(() => {
        if (!enabled) {
            setPaginationResult(null);
            setLoading(false);
            return;
        }

        fetchData(currentPage);
    }, [currentPage, fetchData, enabled]);

    return {
        data: paginationResult?.data || [],
        pagination: {
            currentPage: paginationResult?.currentPage || 1,
            totalPages: paginationResult?.totalPages || 0,
            totalItems: paginationResult?.totalCount || 0,
            itemsPerPage: paginationResult?.itemsPerPage || itemsPerPage,
            hasNextPage: paginationResult?.hasNextPage || false,
            hasPreviousPage: paginationResult?.hasPreviousPage || false
        },
        loading,
        error,
        setPage,
        refresh
    };
};

export const useServices = (options?: { 
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

    return useDataFetch<DBService>({
        fetchFunction,
        enabled: options?.enabled
    });
};

export const useArticles = (options?: { 
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

    return useDataFetch<DatabaseArticle>({
        fetchFunction,
        enabled: options?.enabled
    });
};

export const useTestimonials = (options?: { 
    featuredOnly?: boolean;
    enabled?: boolean;
}) => {
    const fetchFunction = useCallback(async () => {
        if (options?.featuredOnly) {
            return await databaseService.testimonials.getFeatured();
        }
        return await databaseService.testimonials.getPublished();
    }, [options?.featuredOnly]);

    return useDataFetch<DatabaseTestimonial>({
        fetchFunction,
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