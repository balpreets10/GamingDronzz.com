// services/ArticleService.ts - Article-specific service wrapper
import DatabaseService, { DatabaseArticle } from './DatabaseService';

export interface ArticleData {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    author: string;
    publishDate: string;
    readTime: string;
    image?: string;
    tags: string[];
    featured: boolean;
}

class ArticleService {
    private static instance: ArticleService;

    constructor() {
        if (ArticleService.instance) {
            return ArticleService.instance;
        }
        ArticleService.instance = this;
    }

    static getInstance(): ArticleService {
        if (!ArticleService.instance) {
            ArticleService.instance = new ArticleService();
        }
        return ArticleService.instance;
    }

    // Transform database article to frontend format
    private transformArticle(dbArticle: DatabaseArticle): ArticleData {
        const publishDate = dbArticle.published_at 
            ? new Date(dbArticle.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : new Date(dbArticle.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

        const readTime = dbArticle.reading_time_minutes 
            ? `${dbArticle.reading_time_minutes} min`
            : '5 min';

        return {
            id: dbArticle.id,
            title: dbArticle.title,
            excerpt: dbArticle.excerpt || this.generateExcerpt(dbArticle.content),
            category: dbArticle.category || 'General',
            author: 'Gaming Dronzz Team', // Could be extended to fetch author details
            publishDate,
            readTime,
            image: dbArticle.featured_image,
            tags: dbArticle.tags || [],
            featured: dbArticle.featured
        };
    }

    // Generate excerpt from content if not provided
    private generateExcerpt(content: string): string {
        const plainText = content.replace(/<[^>]*>/g, ''); // Strip HTML
        return plainText.length > 200 
            ? plainText.substring(0, 200) + '...'
            : plainText;
    }

    // Get latest published articles
    async getLatestArticles(limit: number = 4): Promise<ArticleData[]> {
        try {
            console.log('🔍 ArticleService: Fetching latest articles...');
            
            const articles = await DatabaseService.articles.getPublished({
                limit,
                orderBy: 'published_at',
                ascending: false
            });

            console.log('✅ ArticleService: Found', articles.length, 'articles');
            
            return articles.map(article => this.transformArticle(article));
        } catch (error) {
            console.error('❌ ArticleService: Failed to fetch articles:', error);
            throw new Error('Failed to fetch articles from database');
        }
    }

    // Get featured articles
    async getFeaturedArticles(): Promise<ArticleData[]> {
        try {
            console.log('🔍 ArticleService: Fetching featured articles...');
            
            const articles = await DatabaseService.articles.getFeatured();
            
            console.log('✅ ArticleService: Found', articles.length, 'featured articles');
            
            return articles.map(article => this.transformArticle(article));
        } catch (error) {
            console.error('❌ ArticleService: Failed to fetch featured articles:', error);
            throw new Error('Failed to fetch featured articles from database');
        }
    }

    // Get articles by category
    async getArticlesByCategory(category: string, limit?: number): Promise<ArticleData[]> {
        try {
            console.log('🔍 ArticleService: Fetching articles by category:', category);
            
            const articles = await DatabaseService.articles.getPublished({
                filters: { category },
                limit,
                orderBy: 'published_at',
                ascending: false
            });

            console.log('✅ ArticleService: Found', articles.length, 'articles in category:', category);
            
            return articles.map(article => this.transformArticle(article));
        } catch (error) {
            console.error('❌ ArticleService: Failed to fetch articles by category:', error);
            throw new Error(`Failed to fetch articles for category: ${category}`);
        }
    }

    // Get article by slug
    async getArticleBySlug(slug: string): Promise<ArticleData | null> {
        try {
            console.log('🔍 ArticleService: Fetching article by slug:', slug);
            
            const article = await DatabaseService.articles.getBySlug(slug);
            
            if (!article) {
                console.log('ℹ️ ArticleService: No article found for slug:', slug);
                return null;
            }

            console.log('✅ ArticleService: Found article:', article.title);
            
            // Increment view count
            await this.incrementViewCount(article.id);
            
            return this.transformArticle(article);
        } catch (error) {
            console.error('❌ ArticleService: Failed to fetch article by slug:', error);
            throw new Error(`Failed to fetch article: ${slug}`);
        }
    }

    // Increment view count for an article
    async incrementViewCount(id: string): Promise<void> {
        try {
            await DatabaseService.articles.incrementViewCount(id);
            console.log('✅ ArticleService: Incremented view count for article:', id);
        } catch (error) {
            console.warn('⚠️ ArticleService: Failed to increment view count:', error);
            // Don't throw error as this is not critical
        }
    }

    // Get all categories
    async getCategories(): Promise<string[]> {
        try {
            console.log('🔍 ArticleService: Fetching article categories...');
            
            const articles = await DatabaseService.articles.getPublished();
            const categories = Array.from(new Set(
                articles
                    .map(article => article.category)
                    .filter(category => category && category.trim() !== '')
            ));

            console.log('✅ ArticleService: Found categories:', categories);
            
            return categories;
        } catch (error) {
            console.error('❌ ArticleService: Failed to fetch categories:', error);
            return [];
        }
    }

    // Search articles
    async searchArticles(searchTerm: string, limit?: number): Promise<ArticleData[]> {
        try {
            console.log('🔍 ArticleService: Searching articles for:', searchTerm);
            
            const articles = await DatabaseService.articles.getPublished({
                limit,
                orderBy: 'published_at',
                ascending: false
            });

            // Simple client-side search (can be enhanced with database search)
            const filteredArticles = articles.filter(article => 
                article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
                article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (article.category && article.category.toLowerCase().includes(searchTerm.toLowerCase()))
            );

            console.log('✅ ArticleService: Found', filteredArticles.length, 'articles matching:', searchTerm);
            
            return filteredArticles.map(article => this.transformArticle(article));
        } catch (error) {
            console.error('❌ ArticleService: Failed to search articles:', error);
            throw new Error('Failed to search articles');
        }
    }
}

// Export singleton instance
export default ArticleService.getInstance();