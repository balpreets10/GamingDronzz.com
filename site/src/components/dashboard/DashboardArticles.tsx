import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import './DashboardArticles.css';

interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    featured_image: string | null;
    image_alt: string | null;
    tags: string[];
    category: string | null;
    published: boolean;
    featured: boolean;
    view_count: number;
    reading_time_minutes: number | null;
    seo_title: string | null;
    seo_description: string | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    author_id: string;
}

interface ArticleFormData {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image: string;
    image_alt: string;
    tags: string;
    category: string;
    published: boolean;
    featured: boolean;
    reading_time_minutes: string;
    seo_title: string;
    seo_description: string;
}

const DashboardArticles: React.FC = () => {
    console.log('📰 DashboardArticles: Component rendering');
    
    const { isAdmin, user } = useAuth();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [formData, setFormData] = useState<ArticleFormData>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: '',
        image_alt: '',
        tags: '',
        category: '',
        published: false,
        featured: false,
        reading_time_minutes: '',
        seo_title: '',
        seo_description: ''
    });

    // Component error boundary logging
    useEffect(() => {
        const handleError = (error: ErrorEvent) => {
            if (error.filename?.includes('DashboardArticles')) {
                console.error('❌ DashboardArticles: Component error caught:', error);
            }
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    useEffect(() => {
        if (isAdmin) {
            fetchArticles();
        }
    }, [isAdmin]);

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const calculateReadingTime = (content: string) => {
        const wordsPerMinute = 200;
        const words = content.trim().split(/\s+/).length;
        return Math.max(1, Math.round(words / wordsPerMinute));
    };

    const fetchArticles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔄 DashboardArticles: Fetching articles...');

            const { data, error: fetchError } = await supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) {
                console.error('❌ DashboardArticles: Supabase error:', fetchError);
                throw fetchError;
            }

            console.log('✅ DashboardArticles: Fetched articles:', data?.length || 0);
            
            // Data validation and cleanup
            const validatedArticles = (data || []).map((article, index) => {
                // Log data quality issues
                if (!Array.isArray(article.tags)) {
                    console.warn(`⚠️ DashboardArticles: Article "${article.title}" has invalid tags:`, article.tags);
                    article.tags = []; // Normalize to empty array
                }
                
                // Ensure other required fields
                if (!article.title) {
                    console.warn(`⚠️ DashboardArticles: Article ${index} missing title:`, article);
                }
                
                return article;
            });

            setArticles(validatedArticles);
            console.log('✅ DashboardArticles: Articles loaded and validated');
            
        } catch (err) {
            console.error('❌ DashboardArticles: Error fetching articles:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred while fetching articles';
            setError(errorMessage);
            
            // Log additional error context
            if (err instanceof Error && err.message.includes('JWT')) {
                console.error('❌ DashboardArticles: Authentication error - user may need to re-login');
            }
        } finally {
            setLoading(false);
            console.log('🔄 DashboardArticles: Fetch operation completed');
        }
    }, []);

    const handleCreateArticle = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const tagsArray = formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            const slug = formData.slug || generateSlug(formData.title);
            const readingTime = formData.reading_time_minutes ? 
                parseInt(formData.reading_time_minutes) : 
                calculateReadingTime(formData.content);

            const articleData = {
                title: formData.title,
                slug: slug,
                excerpt: formData.excerpt || null,
                content: formData.content,
                featured_image: formData.featured_image || null,
                image_alt: formData.image_alt || null,
                tags: tagsArray,
                category: formData.category || null,
                published: formData.published,
                featured: formData.featured,
                reading_time_minutes: readingTime,
                seo_title: formData.seo_title || null,
                seo_description: formData.seo_description || null,
                author_id: user?.id,
                published_at: formData.published ? new Date().toISOString() : null
            };

            const { error: createError } = await supabase
                .from('articles')
                .insert([articleData]);

            if (createError) {
                throw createError;
            }

            setShowCreateModal(false);
            resetForm();
            fetchArticles();
        } catch (err) {
            console.error('Error creating article:', err);
            setError(err instanceof Error ? err.message : 'Error creating article');
        }
    };

    const handleUpdateArticle = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editingArticle) return;

        try {
            const tagsArray = formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            const slug = formData.slug || generateSlug(formData.title);
            const readingTime = formData.reading_time_minutes ? 
                parseInt(formData.reading_time_minutes) : 
                calculateReadingTime(formData.content);

            const updateData = {
                title: formData.title,
                slug: slug,
                excerpt: formData.excerpt || null,
                content: formData.content,
                featured_image: formData.featured_image || null,
                image_alt: formData.image_alt || null,
                tags: tagsArray,
                category: formData.category || null,
                published: formData.published,
                featured: formData.featured,
                reading_time_minutes: readingTime,
                seo_title: formData.seo_title || null,
                seo_description: formData.seo_description || null,
                updated_at: new Date().toISOString(),
                published_at: formData.published && !editingArticle.published_at ? new Date().toISOString() : editingArticle.published_at
            };

            const { error: updateError } = await supabase
                .from('articles')
                .update(updateData)
                .eq('id', editingArticle.id);

            if (updateError) {
                throw updateError;
            }

            setEditingArticle(null);
            resetForm();
            fetchArticles();
        } catch (err) {
            console.error('Error updating article:', err);
            setError(err instanceof Error ? err.message : 'Error updating article');
        }
    };

    const handleDeleteArticle = async (articleId: string) => {
        if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
            return;
        }

        try {
            const { error: deleteError } = await supabase
                .from('articles')
                .delete()
                .eq('id', articleId);

            if (deleteError) {
                throw deleteError;
            }

            fetchArticles();
        } catch (err) {
            console.error('Error deleting article:', err);
            setError(err instanceof Error ? err.message : 'Error deleting article');
        }
    };

    const handleBulkUpdatePublished = async (published: boolean) => {
        if (selectedArticles.size === 0) return;

        try {
            const articleIds = Array.from(selectedArticles);
            const { data, error: rpcError } = await supabase
                .rpc('bulk_update_articles_published', {
                    article_ids: articleIds,
                    published_status: published
                });

            if (rpcError) {
                throw rpcError;
            }

            console.log('Bulk update result:', data);
            setSelectedArticles(new Set());
            fetchArticles();
        } catch (err) {
            console.error('Error bulk updating articles:', err);
            setError(err instanceof Error ? err.message : 'Error updating articles');
        }
    };

    const handleBulkUpdateFeatured = async (featured: boolean) => {
        if (selectedArticles.size === 0) return;

        try {
            const articleIds = Array.from(selectedArticles);
            const { data, error: rpcError } = await supabase
                .rpc('bulk_update_articles_featured', {
                    article_ids: articleIds,
                    featured_status: featured
                });

            if (rpcError) {
                throw rpcError;
            }

            console.log('Bulk feature update result:', data);
            setSelectedArticles(new Set());
            fetchArticles();
        } catch (err) {
            console.error('Error bulk updating featured articles:', err);
            setError(err instanceof Error ? err.message : 'Error updating featured articles');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            featured_image: '',
            image_alt: '',
            tags: '',
            category: '',
            published: false,
            featured: false,
            reading_time_minutes: '',
            seo_title: '',
            seo_description: ''
        });
    };

    const openEditModal = (article: Article) => {
        setEditingArticle(article);
        setFormData({
            title: article.title || '',
            slug: article.slug || '',
            excerpt: article.excerpt || '',
            content: article.content || '',
            featured_image: article.featured_image || '',
            image_alt: article.image_alt || '',
            tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
            category: article.category || '',
            published: Boolean(article.published),
            featured: Boolean(article.featured),
            reading_time_minutes: article.reading_time_minutes?.toString() || '',
            seo_title: article.seo_title || '',
            seo_description: article.seo_description || ''
        });
    };

    const toggleArticleSelection = (articleId: string) => {
        const newSelection = new Set(selectedArticles);
        if (newSelection.has(articleId)) {
            newSelection.delete(articleId);
        } else {
            newSelection.add(articleId);
        }
        setSelectedArticles(newSelection);
    };

    const selectAllArticles = () => {
        if (selectedArticles.size === articles.length) {
            setSelectedArticles(new Set());
        } else {
            setSelectedArticles(new Set(articles.map(a => a.id)));
        }
    };

    if (!isAdmin) {
        return (
            <div className="dashboard-articles dashboard-articles--unauthorized">
                <div className="dashboard-articles__error">
                    <h2>Access Denied</h2>
                    <p>You need admin privileges to manage articles.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="dashboard-articles dashboard-articles--loading">
                <div className="dashboard-articles__loading">
                    <div className="dashboard-articles__spinner"></div>
                    <p>Loading articles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-articles">
            <header className="dashboard-articles__header">
                <div className="dashboard-articles__title">
                    <h1>Articles Management</h1>
                    <p>Manage your blog articles, create new content, and organize your publications.</p>
                </div>
                <button 
                    className="dashboard-articles__create-btn"
                    onClick={() => setShowCreateModal(true)}
                >
                    + Create New Article
                </button>
            </header>

            {error && (
                <div className="dashboard-articles__error-banner">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {selectedArticles.size > 0 && (
                <div className="dashboard-articles__bulk-actions">
                    <div className="dashboard-articles__bulk-info">
                        <span>{selectedArticles.size} article(s) selected</span>
                    </div>
                    <div className="dashboard-articles__bulk-buttons">
                        <button onClick={() => handleBulkUpdatePublished(true)}>
                            📢 Publish Selected
                        </button>
                        <button onClick={() => handleBulkUpdatePublished(false)}>
                            📝 Unpublish Selected
                        </button>
                        <button onClick={() => handleBulkUpdateFeatured(true)}>
                            ⭐ Feature Selected
                        </button>
                        <button onClick={() => handleBulkUpdateFeatured(false)}>
                            ⭐ Unfeature Selected
                        </button>
                        <button onClick={() => setSelectedArticles(new Set())}>
                            ✖️ Clear Selection
                        </button>
                    </div>
                </div>
            )}

            <div className="dashboard-articles__content">
                {articles.length === 0 ? (
                    <div className="dashboard-articles__empty">
                        <div className="dashboard-articles__empty-icon">📰</div>
                        <h3>No Articles Yet</h3>
                        <p>Create your first article to get started.</p>
                        <button 
                            className="dashboard-articles__create-btn dashboard-articles__create-btn--primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            Create First Article
                        </button>
                    </div>
                ) : (
                    <div className="dashboard-articles__table-container">
                        <table className="dashboard-articles__table">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={selectedArticles.size === articles.length && articles.length > 0}
                                            onChange={selectAllArticles}
                                        />
                                    </th>
                                    <th>Article</th>
                                    <th>Status</th>
                                    <th>Category</th>
                                    <th>Views</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articles.map((article) => (
                                    <tr key={article.id} className={selectedArticles.has(article.id) ? 'dashboard-articles__row--selected' : ''}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedArticles.has(article.id)}
                                                onChange={() => toggleArticleSelection(article.id)}
                                            />
                                        </td>
                                        <td>
                                            <div className="dashboard-articles__article-info">
                                                {article.featured_image && (
                                                    <img 
                                                        src={article.featured_image} 
                                                        alt={article.image_alt || article.title}
                                                        className="dashboard-articles__article-image"
                                                    />
                                                )}
                                                <div className="dashboard-articles__article-details">
                                                    <h4>{article.title}</h4>
                                                    <p>{article.excerpt ? article.excerpt.substring(0, 100) + '...' : article.content.substring(0, 100) + '...'}</p>
                                                    {article.tags.length > 0 && (
                                                        <div className="dashboard-articles__tags">
                                                            {article.tags.slice(0, 3).map((tag) => (
                                                                <span key={tag} className="dashboard-articles__tag">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {article.tags.length > 3 && (
                                                                <span className="dashboard-articles__tag dashboard-articles__tag--more">
                                                                    +{article.tags.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="dashboard-articles__status">
                                                <span className={`dashboard-articles__badge ${article.published ? 'dashboard-articles__badge--success' : 'dashboard-articles__badge--warning'}`}>
                                                    {article.published ? 'Published' : 'Draft'}
                                                </span>
                                                {article.featured && (
                                                    <span className="dashboard-articles__badge dashboard-articles__badge--featured">
                                                        ⭐ Featured
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="dashboard-articles__category">
                                                {article.category || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="dashboard-articles__views">
                                                {article.view_count || 0} views
                                            </span>
                                        </td>
                                        <td>
                                            {new Date(article.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="dashboard-articles__actions">
                                                <button 
                                                    className="dashboard-articles__action-btn dashboard-articles__action-btn--edit"
                                                    onClick={() => openEditModal(article)}
                                                    title="Edit Article"
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    className="dashboard-articles__action-btn dashboard-articles__action-btn--view"
                                                    onClick={() => window.open(`/articles/${article.slug}`, '_blank')}
                                                    title="View Article"
                                                >
                                                    👁️
                                                </button>
                                                <button 
                                                    className="dashboard-articles__action-btn dashboard-articles__action-btn--delete"
                                                    onClick={() => handleDeleteArticle(article.id)}
                                                    title="Delete Article"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingArticle) && (
                <div className="dashboard-articles__modal-overlay">
                    <div className="dashboard-articles__modal">
                        <header className="dashboard-articles__modal-header">
                            <h2>{editingArticle ? 'Edit Article' : 'Create New Article'}</h2>
                            <button 
                                className="dashboard-articles__modal-close"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingArticle(null);
                                    resetForm();
                                }}
                            >
                                ×
                            </button>
                        </header>
                        
                        <form 
                            className="dashboard-articles__form"
                            onSubmit={editingArticle ? handleUpdateArticle : handleCreateArticle}
                        >
                            <div className="dashboard-articles__form-row">
                                <div className="dashboard-articles__form-group">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => {
                                            setFormData({ ...formData, title: e.target.value });
                                            // Auto-generate slug if not manually set
                                            if (!formData.slug) {
                                                setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                                            }
                                        }}
                                        required
                                    />
                                </div>

                                <div className="dashboard-articles__form-group">
                                    <label>Slug *</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="dashboard-articles__form-group">
                                <label>Excerpt</label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    rows={3}
                                    placeholder="Brief description of the article..."
                                />
                            </div>

                            <div className="dashboard-articles__form-group">
                                <label>Content *</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    required
                                    rows={12}
                                    placeholder="Article content..."
                                />
                            </div>

                            <div className="dashboard-articles__form-row">
                                <div className="dashboard-articles__form-group">
                                    <label>Featured Image URL</label>
                                    <input
                                        type="url"
                                        value={formData.featured_image}
                                        onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                                    />
                                </div>

                                <div className="dashboard-articles__form-group">
                                    <label>Image Alt Text</label>
                                    <input
                                        type="text"
                                        value={formData.image_alt}
                                        onChange={(e) => setFormData({ ...formData, image_alt: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="dashboard-articles__form-row">
                                <div className="dashboard-articles__form-group">
                                    <label>Category</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="Gaming, Development, Reviews, etc."
                                    />
                                </div>

                                <div className="dashboard-articles__form-group">
                                    <label>Reading Time (minutes)</label>
                                    <input
                                        type="number"
                                        value={formData.reading_time_minutes}
                                        onChange={(e) => setFormData({ ...formData, reading_time_minutes: e.target.value })}
                                        placeholder="Auto-calculated if empty"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="dashboard-articles__form-group">
                                <label>Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="React, Gaming, Tutorial, Review"
                                />
                            </div>

                            <div className="dashboard-articles__form-row">
                                <div className="dashboard-articles__form-group">
                                    <label>SEO Title</label>
                                    <input
                                        type="text"
                                        value={formData.seo_title}
                                        onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                                        placeholder="SEO optimized title"
                                    />
                                </div>

                                <div className="dashboard-articles__form-group">
                                    <label>SEO Description</label>
                                    <input
                                        type="text"
                                        value={formData.seo_description}
                                        onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                                        placeholder="SEO meta description"
                                    />
                                </div>
                            </div>

                            <div className="dashboard-articles__form-checkboxes">
                                <label className="dashboard-articles__checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    />
                                    <span>Featured Article</span>
                                </label>

                                <label className="dashboard-articles__checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.published}
                                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                    />
                                    <span>Published</span>
                                </label>
                            </div>

                            <div className="dashboard-articles__form-actions">
                                <button 
                                    type="button"
                                    className="dashboard-articles__btn dashboard-articles__btn--secondary"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setEditingArticle(null);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="dashboard-articles__btn dashboard-articles__btn--primary"
                                >
                                    {editingArticle ? 'Update Article' : 'Create Article'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardArticles;