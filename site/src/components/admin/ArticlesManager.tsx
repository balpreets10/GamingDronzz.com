import React, { useState, useEffect } from 'react';
import SupabaseService from '../../services/SupabaseService';
import ArticleForm from './ArticleForm';
import './ArticlesManager.css';

interface Article {
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

const ArticlesManager: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await SupabaseService.getArticles();
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArticle = () => {
    setEditingArticle(null);
    setShowForm(true);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      await SupabaseService.deleteArticle(articleId);
      setArticles(articles.filter(a => a.id !== articleId));
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Error deleting article');
    }
  };

  const handleTogglePublished = async (article: Article) => {
    try {
      const updatedData = {
        published: !article.published,
        published_at: !article.published ? new Date().toISOString() : null
      };
      
      await SupabaseService.updateArticle(article.id, updatedData);
      
      setArticles(articles.map(a => 
        a.id === article.id ? { ...a, ...updatedData } : a
      ));
    } catch (error) {
      console.error('Error updating article:', error);
      alert('Error updating article status');
    }
  };

  const handleToggleFeatured = async (article: Article) => {
    try {
      const updatedData = { featured: !article.featured };
      await SupabaseService.updateArticle(article.id, updatedData);
      
      setArticles(articles.map(a => 
        a.id === article.id ? { ...a, featured: !a.featured } : a
      ));
    } catch (error) {
      console.error('Error updating article:', error);
      alert('Error updating article status');
    }
  };

  const handleFormSubmit = async (articleData: any) => {
    try {
      if (editingArticle) {
        const updatedArticle = await SupabaseService.updateArticle(editingArticle.id, articleData);
        setArticles(articles.map(a => 
          a.id === editingArticle.id ? { ...a, ...articleData } : a
        ));
      } else {
        const newArticle = await SupabaseService.createArticle(articleData);
        setArticles([newArticle, ...articles]);
      }
      setShowForm(false);
      setEditingArticle(null);
    } catch (error) {
      console.error('Error saving article:', error);
      throw error;
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (article.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' && article.published) ||
                         (filterStatus === 'draft' && !article.published);
    const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="articles-manager loading">
        <div className="loading-spinner"></div>
        <p>Loading articles...</p>
      </div>
    );
  }

  if (showForm) {
    return (
      <ArticleForm
        article={editingArticle}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingArticle(null);
        }}
      />
    );
  }

  return (
    <div className="articles-manager">
      <div className="manager-header">
        <div className="header-left">
          <h1>Articles Management</h1>
          <p>Manage your blog articles and content</p>
        </div>
        <button className="create-btn" onClick={handleCreateArticle}>
          <span className="btn-icon">📝</span>
          New Article
        </button>
      </div>

      <div className="manager-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="articles-stats">
        <div className="stat-item">
          <span className="stat-value">{articles.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{articles.filter(a => a.published).length}</span>
          <span className="stat-label">Published</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{articles.filter(a => a.featured).length}</span>
          <span className="stat-label">Featured</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {articles.reduce((total, a) => total + (a.view_count || 0), 0).toLocaleString()}
          </span>
          <span className="stat-label">Total Views</span>
        </div>
      </div>

      <div className="articles-table">
        {filteredArticles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📰</div>
            <h3>No articles found</h3>
            <p>Get started by writing your first article</p>
            <button className="create-btn" onClick={handleCreateArticle}>
              Create Article
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article) => (
                  <tr key={article.id}>
                    <td className="article-cell">
                      <div className="article-info">
                        {article.featured_image && (
                          <img 
                            src={article.featured_image} 
                            alt={article.image_alt || article.title}
                            className="article-thumbnail"
                          />
                        )}
                        <div className="article-details">
                          <h4 className="article-title">{article.title}</h4>
                          <p className="article-excerpt">
                            {article.excerpt ? 
                              article.excerpt.substring(0, 80) + '...' :
                              article.content.substring(0, 80).replace(/<[^>]*>/g, '') + '...'
                            }
                          </p>
                          <div className="article-meta">
                            <span className="reading-time">
                              {article.reading_time_minutes || 5} min read
                            </span>
                            <span className="article-date">
                              {new Date(article.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="article-tags">
                            {article.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="tag">{tag}</span>
                            ))}
                            {article.tags.length > 3 && (
                              <span className="tag-more">+{article.tags.length - 3}</span>
                            )}
                          </div>
                          <div className="article-badges">
                            {article.featured && <span className="badge featured">Featured</span>}
                            {article.published && <span className="badge published">Published</span>}
                            {!article.published && <span className="badge draft">Draft</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {article.category && (
                        <span className="category-tag">{article.category}</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-indicator ${article.published ? 'published' : 'draft'}`}>
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <span className="view-count">{(article.view_count || 0).toLocaleString()}</span>
                    </td>
                    <td>
                      {article.published_at ? 
                        new Date(article.published_at).toLocaleDateString() : 
                        'Not published'
                      }
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit"
                          onClick={() => handleEditArticle(article)}
                          title="Edit article"
                        >
                          ✏️
                        </button>
                        <button
                          className={`action-btn toggle ${article.published ? 'published' : 'draft'}`}
                          onClick={() => handleTogglePublished(article)}
                          title={article.published ? 'Unpublish' : 'Publish'}
                        >
                          {article.published ? '👁️' : '🚫'}
                        </button>
                        <button
                          className={`action-btn toggle ${article.featured ? 'featured' : ''}`}
                          onClick={() => handleToggleFeatured(article)}
                          title={article.featured ? 'Unfeature' : 'Feature'}
                        >
                          {article.featured ? '⭐' : '☆'}
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteArticle(article.id)}
                          title="Delete article"
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
    </div>
  );
};

export default ArticlesManager;