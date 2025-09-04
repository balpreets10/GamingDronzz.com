// services/DatabaseService.ts - Data Access Layer following SOLID principles
import { SupabaseClient } from '@supabase/supabase-js';
import supabaseService from './SupabaseService';

// ===== INTERFACES (Dependency Inversion) =====
export interface IRepository<T> {
    getAll(): Promise<T[]>;
    getById(id: string): Promise<T | null>;
    create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
}

export interface IQueryOptions {
    limit?: number;
    offset?: number;
    orderBy?: string;
    ascending?: boolean;
    filters?: Record<string, unknown>;
}

export interface IPaginationResult<T> {
    data: T[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface IPaginationOptions {
    page?: number;
    itemsPerPage?: number;
    orderBy?: string;
    ascending?: boolean;
    filters?: Record<string, unknown>;
}

export interface ISearchOptions extends IQueryOptions {
    searchTerm?: string;
    searchFields?: string[];
}

// ===== DATABASE TYPES =====
export interface DatabaseProject {
    id: string;
    title: string;
    slug: string;
    description: string;
    detailed_description?: string;
    image_url?: string;
    image_alt?: string;
    technologies: string[];
    category: 'mobile' | 'pc' | 'console' | 'vr' | 'ar';
    status: 'completed' | 'ongoing' | 'planning';
    client_name?: string;
    client_id?: string;
    year: number;
    featured: boolean;
    published: boolean;
    external_link?: string;
    case_study_url?: string;
    github_url?: string;
    demo_url?: string;
    screenshots: string[];
    team_size?: number;
    duration_months?: number;
    budget_range?: string;
    challenges: string[];
    achievements: string[];
    testimonial?: string;
    testimonial_author?: string;
    seo_title?: string;
    seo_description?: string;
    view_count: number;
    created_at: string;
    updated_at: string;
    created_by?: string;
}

export interface IDatabaseService {
    id: string;
    title: string;
    slug: string;
    short_description: string;
    detailed_description?: string;
    icon?: string;
    category: 'development' | 'consulting' | 'design' | 'testing';
    features: string[];
    technologies: string[];
    pricing_model?: string;
    base_price?: number;
    currency: string;
    duration_estimate?: string;
    deliverables: string[];
    requirements: string[];
    published: boolean;
    featured: boolean;
    order_priority: number;
    seo_title?: string;
    seo_description?: string;
    created_at: string;
    updated_at: string;
    created_by?: string;
}

export interface DatabaseArticle {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featured_image?: string;
    image_alt?: string;
    tags: string[];
    category?: string;
    published: boolean;
    featured: boolean;
    view_count: number;
    reading_time_minutes?: number;
    seo_title?: string;
    seo_description?: string;
    published_at?: string;
    created_at: string;
    updated_at: string;
    author_id: string;
}

export interface DatabaseInquiry {
    id: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
    subject: string;
    message: string;
    service_interest?: string;
    project_budget?: string;
    timeline?: string;
    status: string;
    priority: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    assigned_to?: string;
}

export interface DatabaseTestimonial {
    id: string;
    name: string;
    company?: string;
    position?: string;
    content: string;
    rating: number;
    avatar_url?: string;
    project_id?: string;
    service_id?: string;
    published: boolean;
    featured: boolean;
    created_at: string;
    updated_at: string;
}

// ===== BASE REPOSITORY CLASS =====
abstract class BaseRepository<T> implements IRepository<T> {
    protected client: SupabaseClient;
    protected tableName: string;

    constructor(tableName: string) {
        this.client = supabaseService.getClient();
        this.tableName = tableName;
    }

    async getAll(options?: IQueryOptions): Promise<T[]> {
        try {
            let query = this.client.from(this.tableName).select('*');

            if (options?.filters) {
                Object.entries(options.filters).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
            }

            if (options?.orderBy) {
                query = query.order(options.orderBy, { 
                    ascending: options.ascending ?? false 
                });
            }

            if (options?.limit) {
                query = query.limit(options.limit);
            }

            if (options?.offset) {
                query = query.range(options.offset, 
                    options.offset + (options.limit ?? 50) - 1
                );
            }

            const { data, error } = await query;

            if (error) {
                console.error(`Error fetching ${this.tableName}:`, error);
                throw new Error(`Failed to fetch ${this.tableName}: ${error.message}`);
            }

            return data as T[];
        } catch (error) {
            console.error(`Repository error in getAll for ${this.tableName}:`, error);
            throw error;
        }
    }

    async getById(id: string): Promise<T | null> {
        try {
            const { data, error } = await this.client
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Not found
                }
                console.error(`Error fetching ${this.tableName} by id:`, error);
                throw new Error(`Failed to fetch ${this.tableName}: ${error.message}`);
            }

            return data as T;
        } catch (error) {
            console.error(`Repository error in getById for ${this.tableName}:`, error);
            throw error;
        }
    }

    async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
        try {
            const { data: result, error } = await this.client
                .from(this.tableName)
                .insert(data)
                .select()
                .single();

            if (error) {
                console.error(`Error creating ${this.tableName}:`, error);
                throw new Error(`Failed to create ${this.tableName}: ${error.message}`);
            }

            return result as T;
        } catch (error) {
            console.error(`Repository error in create for ${this.tableName}:`, error);
            throw error;
        }
    }

    async update(id: string, data: Partial<T>): Promise<T> {
        try {
            const { data: result, error } = await this.client
                .from(this.tableName)
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error(`Error updating ${this.tableName}:`, error);
                throw new Error(`Failed to update ${this.tableName}: ${error.message}`);
            }

            return result as T;
        } catch (error) {
            console.error(`Repository error in update for ${this.tableName}:`, error);
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const { error } = await this.client
                .from(this.tableName)
                .delete()
                .eq('id', id);

            if (error) {
                console.error(`Error deleting ${this.tableName}:`, error);
                throw new Error(`Failed to delete ${this.tableName}: ${error.message}`);
            }
        } catch (error) {
            console.error(`Repository error in delete for ${this.tableName}:`, error);
            throw error;
        }
    }

    async getPaginated(options: IPaginationOptions = {}): Promise<IPaginationResult<T>> {
        try {
            const {
                page = 1,
                itemsPerPage = 10,
                orderBy,
                ascending = false,
                filters
            } = options;

            // Calculate offset
            const offset = (page - 1) * itemsPerPage;

            // Build base query for count
            let countQuery = this.client
                .from(this.tableName)
                .select('*', { count: 'exact', head: true });

            // Build base query for data
            let dataQuery = this.client
                .from(this.tableName)
                .select('*');

            // Apply filters to both queries
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    countQuery = countQuery.eq(key, value);
                    dataQuery = dataQuery.eq(key, value);
                });
            }

            // Get total count
            const { count: totalCount, error: countError } = await countQuery;

            if (countError) {
                console.error(`Error counting ${this.tableName}:`, countError);
                throw new Error(`Failed to count ${this.tableName}: ${countError.message}`);
            }

            // Apply ordering, pagination to data query
            if (orderBy) {
                dataQuery = dataQuery.order(orderBy, { ascending });
            }

            dataQuery = dataQuery.range(offset, offset + itemsPerPage - 1);

            // Execute data query
            const { data, error: dataError } = await dataQuery;

            if (dataError) {
                console.error(`Error fetching paginated ${this.tableName}:`, dataError);
                throw new Error(`Failed to fetch paginated ${this.tableName}: ${dataError.message}`);
            }

            const totalPages = Math.ceil((totalCount || 0) / itemsPerPage);

            return {
                data: data as T[],
                totalCount: totalCount || 0,
                currentPage: page,
                totalPages,
                itemsPerPage,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            };
        } catch (error) {
            console.error(`Repository error in getPaginated for ${this.tableName}:`, error);
            throw error;
        }
    }
}

// ===== SPECIALIZED REPOSITORIES =====

class ProjectsRepository extends BaseRepository<DatabaseProject> {
    constructor() {
        super('projects');
    }

    async getPublished(options?: IQueryOptions): Promise<DatabaseProject[]> {
        return this.getAll({
            ...options,
            filters: { published: true, ...options?.filters }
        });
    }

    async getFeatured(): Promise<DatabaseProject[]> {
        return this.getAll({
            filters: { published: true, featured: true },
            orderBy: 'created_at',
            ascending: false
        });
    }

    async getByCategory(category: string): Promise<DatabaseProject[]> {
        return this.getAll({
            filters: { published: true, category },
            orderBy: 'year',
            ascending: false
        });
    }

    async getBySlug(slug: string): Promise<DatabaseProject | null> {
        try {
            const { data, error } = await this.client
                .from(this.tableName)
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw new Error(`Failed to fetch project: ${error.message}`);
            }

            return data as DatabaseProject;
        } catch (error) {
            console.error('Repository error in getBySlug:', error);
            throw error;
        }
    }

    async incrementViewCount(id: string): Promise<void> {
        try {
            const { data, error } = await this.client.rpc('increment_view_count', {
                table_type: 'projects',
                record_id: id
            });
            
            if (error || !data?.success) {
                console.warn('Failed to increment view count:', error || data?.error);
            }
        } catch (error) {
            console.warn('Failed to increment view count:', error);
        }
    }

    async search(options: ISearchOptions): Promise<DatabaseProject[]> {
        try {
            let query = this.client
                .from(this.tableName)
                .select('*')
                .eq('published', true);

            if (options.searchTerm) {
                query = query.or(`title.ilike.%${options.searchTerm}%,description.ilike.%${options.searchTerm}%`);
            }

            if (options.filters) {
                Object.entries(options.filters).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
            }

            if (options.orderBy) {
                query = query.order(options.orderBy, { 
                    ascending: options.ascending ?? false 
                });
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Search failed: ${error.message}`);
            }

            return data as DatabaseProject[];
        } catch (error) {
            console.error('Repository error in search:', error);
            throw error;
        }
    }

    async getPublishedPaginated(options: IPaginationOptions = {}): Promise<IPaginationResult<DatabaseProject>> {
        return this.getPaginated({
            ...options,
            filters: { published: true, ...options.filters },
            orderBy: options.orderBy || 'created_at',
            ascending: options.ascending ?? false
        });
    }

    async getFeaturedPaginated(options: IPaginationOptions = {}): Promise<IPaginationResult<DatabaseProject>> {
        return this.getPaginated({
            ...options,
            filters: { published: true, featured: true, ...options.filters },
            orderBy: options.orderBy || 'created_at',
            ascending: options.ascending ?? false
        });
    }

    async getByCategoryPaginated(category: string, options: IPaginationOptions = {}): Promise<IPaginationResult<DatabaseProject>> {
        return this.getPaginated({
            ...options,
            filters: { published: true, category, ...options.filters },
            orderBy: options.orderBy || 'year',
            ascending: options.ascending ?? false
        });
    }
}

class ServicesRepository extends BaseRepository<DatabaseService> {
    constructor() {
        super('services');
    }

    async getPublished(options?: IQueryOptions): Promise<DatabaseService[]> {
        return this.getAll({
            ...options,
            filters: { published: true, ...options?.filters },
            orderBy: 'order_priority',
            ascending: true
        });
    }

    async getFeatured(): Promise<DatabaseService[]> {
        return this.getAll({
            filters: { published: true, featured: true },
            orderBy: 'order_priority',
            ascending: true
        });
    }

    async getByCategory(category: string): Promise<DatabaseService[]> {
        return this.getAll({
            filters: { published: true, category },
            orderBy: 'order_priority',
            ascending: true
        });
    }

    async getBySlug(slug: string): Promise<DatabaseService | null> {
        try {
            const { data, error } = await this.client
                .from(this.tableName)
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw new Error(`Failed to fetch service: ${error.message}`);
            }

            return data as DatabaseService;
        } catch (error) {
            console.error('Repository error in getBySlug:', error);
            throw error;
        }
    }
}

class ArticlesRepository extends BaseRepository<DatabaseArticle> {
    constructor() {
        super('articles');
    }

    async getPublished(options?: IQueryOptions): Promise<DatabaseArticle[]> {
        return this.getAll({
            ...options,
            filters: { published: true, ...options?.filters },
            orderBy: 'published_at',
            ascending: false
        });
    }

    async getFeatured(): Promise<DatabaseArticle[]> {
        return this.getAll({
            filters: { published: true, featured: true },
            orderBy: 'published_at',
            ascending: false,
            limit: 3
        });
    }

    async getBySlug(slug: string): Promise<DatabaseArticle | null> {
        try {
            const { data, error } = await this.client
                .from(this.tableName)
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw new Error(`Failed to fetch article: ${error.message}`);
            }

            return data as DatabaseArticle;
        } catch (error) {
            console.error('Repository error in getBySlug:', error);
            throw error;
        }
    }

    async incrementViewCount(id: string): Promise<void> {
        try {
            const { data, error } = await this.client.rpc('increment_view_count', {
                table_type: 'articles',
                record_id: id
            });
            
            if (error || !data?.success) {
                console.warn('Failed to increment view count:', error || data?.error);
            }
        } catch (error) {
            console.warn('Failed to increment view count:', error);
        }
    }
}

class InquiriesRepository extends BaseRepository<DatabaseInquiry> {
    constructor() {
        super('inquiries');
    }

    async submitInquiry(data: Omit<DatabaseInquiry, 'id' | 'created_at' | 'updated_at' | 'status' | 'priority'>): Promise<DatabaseInquiry> {
        return this.create({
            ...data,
            status: 'new',
            priority: 0
        } as Omit<DatabaseInquiry, 'id' | 'created_at' | 'updated_at'>);
    }

    async getByStatus(status: string): Promise<DatabaseInquiry[]> {
        return this.getAll({
            filters: { status },
            orderBy: 'created_at',
            ascending: false
        });
    }
}

class TestimonialsRepository extends BaseRepository<DatabaseTestimonial> {
    constructor() {
        super('testimonials');
    }

    async getPublished(): Promise<DatabaseTestimonial[]> {
        return this.getAll({
            filters: { published: true },
            orderBy: 'created_at',
            ascending: false
        });
    }

    async getFeatured(): Promise<DatabaseTestimonial[]> {
        return this.getAll({
            filters: { published: true, featured: true },
            orderBy: 'rating',
            ascending: false
        });
    }
}

// ===== DATABASE SERVICE CLASS (Facade Pattern) =====
class DatabaseService {
    public readonly projects: ProjectsRepository;
    public readonly services: ServicesRepository;
    public readonly articles: ArticlesRepository;
    public readonly inquiries: InquiriesRepository;
    public readonly testimonials: TestimonialsRepository;

    constructor() {
        this.projects = new ProjectsRepository();
        this.services = new ServicesRepository();
        this.articles = new ArticlesRepository();
        this.inquiries = new InquiriesRepository();
        this.testimonials = new TestimonialsRepository();
    }

    // Utility method to track page views
    async trackPageView(pagePath: string, pageTitle?: string): Promise<void> {
        try {
            const { session } = await supabaseService.getSession();
            
            await supabaseService.getClient()
                .from('page_views')
                .insert({
                    page_path: pagePath,
                    page_title: pageTitle,
                    user_id: session?.user?.id || null,
                    referrer: document.referrer || null,
                    user_agent: navigator.userAgent
                });
        } catch (error) {
            console.warn('Failed to track page view:', error);
        }
    }

    // Health check method
    async healthCheck(): Promise<{ status: 'ok' | 'error'; message: string }> {
        try {
            const { data, error } = await supabaseService.getClient()
                .from('projects')
                .select('count')
                .limit(1);

            if (error) {
                return { status: 'error', message: error.message };
            }

            return { status: 'ok', message: 'Database connection healthy' };
        } catch (error) {
            return { 
                status: 'error', 
                message: error instanceof Error ? error.message : 'Unknown error' 
            };
        }
    }
}

// Export singleton instance
export default new DatabaseService();