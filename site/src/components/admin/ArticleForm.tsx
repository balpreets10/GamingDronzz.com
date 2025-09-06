import React, { useState, useEffect } from 'react';
import './ArticleForm.css';

interface ArticleFormProps {
  article?: any;
  onSubmit: (articleData: any) => Promise<void>;
  onCancel: () => void;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ article, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    image_alt: '',
    tags: [] as string[],
    category: '',
    published: false,
    featured: false,
    reading_time_minutes: 5,
    seo_title: '',
    seo_description: ''
  });
  
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || '',
        slug: article.slug || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        featured_image: article.featured_image || '',
        image_alt: article.image_alt || '',
        tags: article.tags || [],
        category: article.category || '',
        published: article.published || false,
        featured: article.featured || false,
        reading_time_minutes: article.reading_time_minutes || 5,
        seo_title: article.seo_title || '',
        seo_description: article.seo_description || ''
      });
    }
  }, [article]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.round(wordCount / wordsPerMinute));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      const numValue = parseInt(value) || 0;
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Auto-generate slug from title
      if (name === 'title' && !article) {
        setFormData(prev => ({ 
          ...prev, 
          slug: generateSlug(value),
          seo_title: value || prev.seo_title
        }));
      }
      
      // Auto-estimate reading time from content
      if (name === 'content') {
        const estimatedTime = estimateReadingTime(value);
        setFormData(prev => ({ ...prev, reading_time_minutes: estimatedTime }));
      }
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.seo_description && formData.seo_description.length > 160) {
      newErrors.seo_description = 'SEO description should be under 160 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        author_id: '00000000-0000-0000-0000-000000000000' // Replace with actual user ID
      };
      
      if (formData.published && !article?.published) {
        submitData.published_at = new Date().toISOString();
      }
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error saving article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Game Development',
    'Web Development',
    'Technology',
    'Programming',
    'Design',
    'Business',
    'Tutorial',
    'Case Study',
    'Industry News',
    'Other'
  ];

  return (
    <div className="article-form">
      <div className="form-header">
        <h1>{article ? 'Edit Article' : 'Create New Article'}</h1>
        <p>Write and manage your blog content</p>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-grid">
          <div className="form-section main-content">
            <h2>Content</h2>
            
            <div className="form-group">
              <label htmlFor="title">Article Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                placeholder="Enter article title"
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="slug">URL Slug *</label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className={errors.slug ? 'error' : ''}
                placeholder="article-url-slug"
              />
              {errors.slug && <span className="error-message">{errors.slug}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="excerpt">Article Excerpt</label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="Brief summary of the article (optional - will be auto-generated from content if empty)"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Article Content *</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className={errors.content ? 'error' : ''}
                placeholder="Write your article content here. You can use HTML tags for formatting."
                rows={16}
              />
              {errors.content && <span className="error-message">{errors.content}</span>}
              <small className="form-help">
                Estimated reading time: {formData.reading_time_minutes} minutes
              </small>
            </div>
          </div>

          <div className="form-section sidebar">
            <h2>Article Settings</h2>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tags</label>
              <div className="tag-input-group">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button type="button" onClick={handleAddTag} className="add-tag-btn">
                  Add
                </button>
              </div>
              <div className="tag-list">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag-item">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="remove-tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="featured_image">Featured Image URL</label>
              <input
                type="url"
                id="featured_image"
                name="featured_image"
                value={formData.featured_image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-group">
              <label htmlFor="image_alt">Image Alt Text</label>
              <input
                type="text"
                id="image_alt"
                name="image_alt"
                value={formData.image_alt}
                onChange={handleInputChange}
                placeholder="Descriptive text for the image"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reading_time_minutes">Reading Time (minutes)</label>
              <input
                type="number"
                id="reading_time_minutes"
                name="reading_time_minutes"
                value={formData.reading_time_minutes}
                onChange={handleInputChange}
                min="1"
                max="60"
              />
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                />
                <span className="checkbox-custom"></span>
                Featured Article
                <small>Show this article prominently</small>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleInputChange}
                />
                <span className="checkbox-custom"></span>
                Published
                <small>Make this article visible to the public</small>
              </label>
            </div>

            <h3>SEO Settings</h3>

            <div className="form-group">
              <label htmlFor="seo_title">SEO Title</label>
              <input
                type="text"
                id="seo_title"
                name="seo_title"
                value={formData.seo_title}
                onChange={handleInputChange}
                placeholder="SEO optimized title (optional)"
                maxLength={60}
              />
              <small className="char-count">
                {formData.seo_title.length}/60 characters
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="seo_description">SEO Description</label>
              <textarea
                id="seo_description"
                name="seo_description"
                value={formData.seo_description}
                onChange={handleInputChange}
                className={errors.seo_description ? 'error' : ''}
                placeholder="Brief description for search engines"
                rows={3}
                maxLength={160}
              />
              {errors.seo_description && <span className="error-message">{errors.seo_description}</span>}
              <small className="char-count">
                {formData.seo_description.length}/160 characters
              </small>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Saving...' : (article ? 'Update Article' : 'Create Article')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;