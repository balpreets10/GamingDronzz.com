import React, { useState, useEffect } from 'react';
import './ProjectForm.css';

interface ProjectFormProps {
  project?: any;
  onSubmit: (projectData: any) => Promise<void>;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    detailed_description: '',
    image_url: '',
    image_alt: '',
    technologies: [] as string[],
    category: '',
    status: 'in-development',
    client_name: '',
    year: new Date().getFullYear(),
    featured: false,
    published: false,
    external_link: '',
    case_study_url: '',
    github_url: '',
    demo_url: ''
  });
  
  const [techInput, setTechInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        slug: project.slug || '',
        description: project.description || '',
        detailed_description: project.detailed_description || '',
        image_url: project.image_url || '',
        image_alt: project.image_alt || '',
        technologies: project.technologies || [],
        category: project.category || '',
        status: project.status || 'in-development',
        client_name: project.client_name || '',
        year: project.year || new Date().getFullYear(),
        featured: project.featured || false,
        published: project.published || false,
        external_link: project.external_link || '',
        case_study_url: project.case_study_url || '',
        github_url: project.github_url || '',
        demo_url: project.demo_url || ''
      });
    }
  }, [project]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Auto-generate slug from title
      if (name === 'title' && !project) {
        setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
      }
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
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

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.year || formData.year < 2000 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Please enter a valid year';
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
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error saving project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Web Development',
    'Game Development',
    'Mobile App',
    'Desktop Application',
    'API Development',
    'Consulting',
    'Other'
  ];

  const statuses = [
    'planning',
    'in-development',
    'testing',
    'completed',
    'maintenance',
    'archived'
  ];

  return (
    <div className="project-form">
      <div className="form-header">
        <h1>{project ? 'Edit Project' : 'Create New Project'}</h1>
        <p>Fill in the project details below</p>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-grid">
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="title">Project Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                placeholder="Enter project title"
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
                placeholder="project-url-slug"
              />
              {errors.slug && <span className="error-message">{errors.slug}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Short Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={errors.description ? 'error' : ''}
                placeholder="Brief description of the project"
                rows={3}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="detailed_description">Detailed Description</label>
              <textarea
                id="detailed_description"
                name="detailed_description"
                value={formData.detailed_description}
                onChange={handleInputChange}
                placeholder="Detailed project description and features"
                rows={6}
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Project Details</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={errors.category ? 'error' : ''}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <span className="error-message">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="client_name">Client Name</label>
                <input
                  type="text"
                  id="client_name"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleInputChange}
                  placeholder="Client or company name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="year">Year *</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className={errors.year ? 'error' : ''}
                  min="2000"
                  max={new Date().getFullYear() + 1}
                />
                {errors.year && <span className="error-message">{errors.year}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Technologies</label>
              <div className="tech-input-group">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="Add technology (e.g., React, TypeScript)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTechnology();
                    }
                  }}
                />
                <button type="button" onClick={handleAddTechnology} className="add-tech-btn">
                  Add
                </button>
              </div>
              <div className="tech-tags">
                {formData.technologies.map((tech, index) => (
                  <span key={index} className="tech-tag">
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTechnology(tech)}
                      className="remove-tech"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Media & Links</h2>

            <div className="form-group">
              <label htmlFor="image_url">Featured Image URL</label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
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
              <label htmlFor="external_link">Live Site URL</label>
              <input
                type="url"
                id="external_link"
                name="external_link"
                value={formData.external_link}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="github_url">GitHub URL</label>
              <input
                type="url"
                id="github_url"
                name="github_url"
                value={formData.github_url}
                onChange={handleInputChange}
                placeholder="https://github.com/username/repo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="demo_url">Demo URL</label>
              <input
                type="url"
                id="demo_url"
                name="demo_url"
                value={formData.demo_url}
                onChange={handleInputChange}
                placeholder="https://demo.example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="case_study_url">Case Study URL</label>
              <input
                type="url"
                id="case_study_url"
                name="case_study_url"
                value={formData.case_study_url}
                onChange={handleInputChange}
                placeholder="Link to detailed case study"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Publishing Options</h2>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                />
                <span className="checkbox-custom"></span>
                Featured Project
                <small>Show this project prominently on the homepage</small>
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
                <small>Make this project visible to the public</small>
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;