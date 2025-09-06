import React, { useState, useEffect } from 'react';
import SupabaseService from '../../services/SupabaseService';
import ProjectForm from './ProjectForm';
import './ProjectsManager.css';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  detailed_description?: string;
  image_url?: string;
  image_alt?: string;
  technologies: string[];
  category: string;
  status: string;
  client_name?: string;
  year: number;
  featured: boolean;
  published: boolean;
  external_link?: string;
  case_study_url?: string;
  github_url?: string;
  demo_url?: string;
  created_at?: string;
  updated_at?: string;
}

const ProjectsManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await SupabaseService.getProjects();
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await SupabaseService.deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  const handleTogglePublished = async (project: Project) => {
    try {
      const updatedProject = await SupabaseService.updateProject(project.id, {
        published: !project.published
      });
      
      setProjects(projects.map(p => 
        p.id === project.id ? { ...p, published: !p.published } : p
      ));
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project status');
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    try {
      const updatedProject = await SupabaseService.updateProject(project.id, {
        featured: !project.featured
      });
      
      setProjects(projects.map(p => 
        p.id === project.id ? { ...p, featured: !p.featured } : p
      ));
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project status');
    }
  };

  const handleFormSubmit = async (projectData: any) => {
    try {
      if (editingProject) {
        const updatedProject = await SupabaseService.updateProject(editingProject.id, projectData);
        setProjects(projects.map(p => 
          p.id === editingProject.id ? { ...p, ...projectData } : p
        ));
      } else {
        const newProject = await SupabaseService.createProject(projectData);
        setProjects([newProject, ...projects]);
      }
      setShowForm(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' && project.published) ||
                         (filterStatus === 'draft' && !project.published);
    const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(projects.map(p => p.category))];

  if (loading) {
    return (
      <div className="projects-manager loading">
        <div className="loading-spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  if (showForm) {
    return (
      <ProjectForm
        project={editingProject}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingProject(null);
        }}
      />
    );
  }

  return (
    <div className="projects-manager">
      <div className="manager-header">
        <div className="header-left">
          <h1>Projects Management</h1>
          <p>Manage your portfolio projects</p>
        </div>
        <button className="create-btn" onClick={handleCreateProject}>
          <span className="btn-icon">➕</span>
          New Project
        </button>
      </div>

      <div className="manager-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search projects..."
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

      <div className="projects-stats">
        <div className="stat-item">
          <span className="stat-value">{projects.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{projects.filter(p => p.published).length}</span>
          <span className="stat-label">Published</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{projects.filter(p => p.featured).length}</span>
          <span className="stat-label">Featured</span>
        </div>
      </div>

      <div className="projects-table">
        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No projects found</h3>
            <p>Get started by creating your first project</p>
            <button className="create-btn" onClick={handleCreateProject}>
              Create Project
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Year</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id}>
                    <td className="project-cell">
                      <div className="project-info">
                        {project.image_url && (
                          <img 
                            src={project.image_url} 
                            alt={project.image_alt || project.title}
                            className="project-thumbnail"
                          />
                        )}
                        <div className="project-details">
                          <h4 className="project-title">{project.title}</h4>
                          <p className="project-description">
                            {project.description.substring(0, 80)}...
                          </p>
                          <div className="project-badges">
                            {project.featured && <span className="badge featured">Featured</span>}
                            {project.published && <span className="badge published">Published</span>}
                            {!project.published && <span className="badge draft">Draft</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">{project.category}</span>
                    </td>
                    <td>
                      <span className="status-tag">{project.status}</span>
                    </td>
                    <td>{project.year}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit"
                          onClick={() => handleEditProject(project)}
                          title="Edit project"
                        >
                          ✏️
                        </button>
                        <button
                          className={`action-btn toggle ${project.published ? 'published' : 'draft'}`}
                          onClick={() => handleTogglePublished(project)}
                          title={project.published ? 'Unpublish' : 'Publish'}
                        >
                          {project.published ? '👁️' : '🚫'}
                        </button>
                        <button
                          className={`action-btn toggle ${project.featured ? 'featured' : ''}`}
                          onClick={() => handleToggleFeatured(project)}
                          title={project.featured ? 'Unfeature' : 'Feature'}
                        >
                          {project.featured ? '⭐' : '☆'}
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteProject(project.id)}
                          title="Delete project"
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

export default ProjectsManager;