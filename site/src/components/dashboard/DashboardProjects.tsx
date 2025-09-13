import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import './DashboardProjects.css';

interface Project {
    id: string;
    title: string;
    description: string;
    image_url: string | null;
    github_url: string | null;
    live_url: string | null;
    tags: string[];
    featured: boolean;
    published: boolean;
    created_at: string;
    updated_at: string;
    order_index: number | null;
}

interface ProjectFormData {
    title: string;
    description: string;
    image_url: string;
    github_url: string;
    live_url: string;
    tags: string;
    featured: boolean;
    published: boolean;
}

const DashboardProjects: React.FC = () => {
    console.log('🎯 DashboardProjects: Component rendering');
    
    const { isAdmin } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState<ProjectFormData>({
        title: '',
        description: '',
        image_url: '',
        github_url: '',
        live_url: '',
        tags: '',
        featured: false,
        published: false
    });

    // Component error boundary logging
    useEffect(() => {
        const handleError = (error: ErrorEvent) => {
            if (error.filename?.includes('DashboardProjects')) {
                console.error('❌ DashboardProjects: Component error caught:', error);
            }
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    useEffect(() => {
        if (isAdmin) {
            fetchProjects();
        }
    }, [isAdmin]);

    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔄 DashboardProjects: Fetching projects...');

            const { data, error: fetchError } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) {
                console.error('❌ DashboardProjects: Supabase error:', fetchError);
                throw fetchError;
            }

            console.log('✅ DashboardProjects: Fetched projects:', data?.length || 0);
            
            // Data validation and cleanup
            const validatedProjects = (data || []).map((project, index) => {
                // Log data quality issues
                if (!Array.isArray(project.tags)) {
                    console.warn(`⚠️ DashboardProjects: Project "${project.title}" has invalid tags:`, project.tags);
                    project.tags = []; // Normalize to empty array
                }
                
                // Ensure other required fields
                if (!project.title) {
                    console.warn(`⚠️ DashboardProjects: Project ${index} missing title:`, project);
                }
                
                return project;
            });

            setProjects(validatedProjects);
            console.log('✅ DashboardProjects: Projects loaded and validated');
            
        } catch (err) {
            console.error('❌ DashboardProjects: Error fetching projects:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred while fetching projects';
            setError(errorMessage);
            
            // Log additional error context
            if (err instanceof Error && err.message.includes('JWT')) {
                console.error('❌ DashboardProjects: Authentication error - user may need to re-login');
            }
        } finally {
            setLoading(false);
            console.log('🔄 DashboardProjects: Fetch operation completed');
        }
    }, []);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const tagsArray = formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            const projectData = {
                title: formData.title,
                description: formData.description,
                image_url: formData.image_url || null,
                github_url: formData.github_url || null,
                live_url: formData.live_url || null,
                tags: tagsArray,
                featured: formData.featured,
                published: formData.published
            };

            const { error: createError } = await supabase
                .from('projects')
                .insert([projectData]);

            if (createError) {
                throw createError;
            }

            setShowCreateModal(false);
            resetForm();
            fetchProjects();
        } catch (err) {
            console.error('Error creating project:', err);
            setError(err instanceof Error ? err.message : 'Error creating project');
        }
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editingProject) return;

        try {
            const tagsArray = formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            const updateData = {
                title: formData.title,
                description: formData.description,
                image_url: formData.image_url || null,
                github_url: formData.github_url || null,
                live_url: formData.live_url || null,
                tags: tagsArray,
                featured: formData.featured,
                published: formData.published,
                updated_at: new Date().toISOString()
            };

            const { error: updateError } = await supabase
                .from('projects')
                .update(updateData)
                .eq('id', editingProject.id);

            if (updateError) {
                throw updateError;
            }

            setEditingProject(null);
            resetForm();
            fetchProjects();
        } catch (err) {
            console.error('Error updating project:', err);
            setError(err instanceof Error ? err.message : 'Error updating project');
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }

        try {
            const { error: deleteError } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (deleteError) {
                throw deleteError;
            }

            fetchProjects();
        } catch (err) {
            console.error('Error deleting project:', err);
            setError(err instanceof Error ? err.message : 'Error deleting project');
        }
    };

    const handleBulkUpdatePublished = async (published: boolean) => {
        if (selectedProjects.size === 0) return;

        try {
            const projectIds = Array.from(selectedProjects);
            const { data, error: rpcError } = await supabase
                .rpc('bulk_update_projects_published', {
                    project_ids: projectIds,
                    published_status: published
                });

            if (rpcError) {
                throw rpcError;
            }

            console.log('Bulk update result:', data);
            setSelectedProjects(new Set());
            fetchProjects();
        } catch (err) {
            console.error('Error bulk updating projects:', err);
            setError(err instanceof Error ? err.message : 'Error updating projects');
        }
    };

    const handleBulkUpdateFeatured = async (featured: boolean) => {
        if (selectedProjects.size === 0) return;

        try {
            const projectIds = Array.from(selectedProjects);
            const { data, error: rpcError } = await supabase
                .rpc('bulk_update_projects_featured', {
                    project_ids: projectIds,
                    featured_status: featured
                });

            if (rpcError) {
                throw rpcError;
            }

            console.log('Bulk feature update result:', data);
            setSelectedProjects(new Set());
            fetchProjects();
        } catch (err) {
            console.error('Error bulk updating featured projects:', err);
            setError(err instanceof Error ? err.message : 'Error updating featured projects');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            image_url: '',
            github_url: '',
            live_url: '',
            tags: '',
            featured: false,
            published: false
        });
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setFormData({
            title: project.title || '',
            description: project.description || '',
            image_url: project.image_url || '',
            github_url: project.github_url || '',
            live_url: project.live_url || '',
            tags: Array.isArray(project.tags) ? project.tags.join(', ') : '',
            featured: Boolean(project.featured),
            published: Boolean(project.published)
        });
    };

    const toggleProjectSelection = (projectId: string) => {
        const newSelection = new Set(selectedProjects);
        if (newSelection.has(projectId)) {
            newSelection.delete(projectId);
        } else {
            newSelection.add(projectId);
        }
        setSelectedProjects(newSelection);
    };

    const selectAllProjects = () => {
        if (selectedProjects.size === projects.length) {
            setSelectedProjects(new Set());
        } else {
            setSelectedProjects(new Set(projects.map(p => p.id)));
        }
    };

    if (!isAdmin) {
        return (
            <div className="dashboard-projects dashboard-projects--unauthorized">
                <div className="dashboard-projects__error">
                    <h2>Access Denied</h2>
                    <p>You need admin privileges to manage projects.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="dashboard-projects dashboard-projects--loading">
                <div className="dashboard-projects__loading">
                    <div className="dashboard-projects__spinner"></div>
                    <p>Loading projects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-projects">
            <header className="dashboard-projects__header">
                <div className="dashboard-projects__title">
                    <h1>Projects Management</h1>
                    <p>Manage your portfolio projects, create new ones, and organize your content.</p>
                </div>
                <button 
                    className="dashboard-projects__create-btn"
                    onClick={() => setShowCreateModal(true)}
                >
                    + Create New Project
                </button>
            </header>

            {error && (
                <div className="dashboard-projects__error-banner">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {selectedProjects.size > 0 && (
                <div className="dashboard-projects__bulk-actions">
                    <div className="dashboard-projects__bulk-info">
                        <span>{selectedProjects.size} project(s) selected</span>
                    </div>
                    <div className="dashboard-projects__bulk-buttons">
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
                        <button onClick={() => setSelectedProjects(new Set())}>
                            ✖️ Clear Selection
                        </button>
                    </div>
                </div>
            )}

            <div className="dashboard-projects__content">
                {projects.length === 0 ? (
                    <div className="dashboard-projects__empty">
                        <div className="dashboard-projects__empty-icon">🎮</div>
                        <h3>No Projects Yet</h3>
                        <p>Create your first project to get started.</p>
                        <button 
                            className="dashboard-projects__create-btn dashboard-projects__create-btn--primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            Create First Project
                        </button>
                    </div>
                ) : (
                    <div className="dashboard-projects__table-container">
                        <table className="dashboard-projects__table">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={selectedProjects.size === projects.length && projects.length > 0}
                                            onChange={selectAllProjects}
                                        />
                                    </th>
                                    <th>Project</th>
                                    <th>Status</th>
                                    <th>Tags</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project) => (
                                    <tr key={project.id} className={selectedProjects.has(project.id) ? 'dashboard-projects__row--selected' : ''}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedProjects.has(project.id)}
                                                onChange={() => toggleProjectSelection(project.id)}
                                            />
                                        </td>
                                        <td>
                                            <div className="dashboard-projects__project-info">
                                                {project.image_url && (
                                                    <img 
                                                        src={project.image_url} 
                                                        alt={project.title}
                                                        className="dashboard-projects__project-image"
                                                    />
                                                )}
                                                <div className="dashboard-projects__project-details">
                                                    <h4>{project.title}</h4>
                                                    <p>{project.description.substring(0, 100)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="dashboard-projects__status">
                                                <span className={`dashboard-projects__badge ${project.published ? 'dashboard-projects__badge--success' : 'dashboard-projects__badge--warning'}`}>
                                                    {project.published ? 'Published' : 'Draft'}
                                                </span>
                                                {project.featured && (
                                                    <span className="dashboard-projects__badge dashboard-projects__badge--featured">
                                                        ⭐ Featured
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="dashboard-projects__tags">
                                                {Array.isArray(project.tags) && project.tags.length > 0 ? (
                                                    <>
                                                        {project.tags.slice(0, 3).map((tag) => (
                                                            <span key={tag} className="dashboard-projects__tag">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {project.tags.length > 3 && (
                                                            <span className="dashboard-projects__tag dashboard-projects__tag--more">
                                                                +{project.tags.length - 3}
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="dashboard-projects__tag dashboard-projects__tag--empty">
                                                        No tags
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="dashboard-projects__actions">
                                                <button 
                                                    className="dashboard-projects__action-btn dashboard-projects__action-btn--edit"
                                                    onClick={() => openEditModal(project)}
                                                    title="Edit Project"
                                                >
                                                    ✏️
                                                </button>
                                                {project.live_url && (
                                                    <a 
                                                        href={project.live_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="dashboard-projects__action-btn dashboard-projects__action-btn--view"
                                                        title="View Live Project"
                                                    >
                                                        🔗
                                                    </a>
                                                )}
                                                {project.github_url && (
                                                    <a 
                                                        href={project.github_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="dashboard-projects__action-btn dashboard-projects__action-btn--code"
                                                        title="View Code"
                                                    >
                                                        👨‍💻
                                                    </a>
                                                )}
                                                <button 
                                                    className="dashboard-projects__action-btn dashboard-projects__action-btn--delete"
                                                    onClick={() => handleDeleteProject(project.id)}
                                                    title="Delete Project"
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
            {(showCreateModal || editingProject) && (
                <div className="dashboard-projects__modal-overlay">
                    <div className="dashboard-projects__modal">
                        <header className="dashboard-projects__modal-header">
                            <h2>{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
                            <button 
                                className="dashboard-projects__modal-close"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingProject(null);
                                    resetForm();
                                }}
                            >
                                ×
                            </button>
                        </header>
                        
                        <form 
                            className="dashboard-projects__form"
                            onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
                        >
                            <div className="dashboard-projects__form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="dashboard-projects__form-group">
                                <label>Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    rows={4}
                                />
                            </div>

                            <div className="dashboard-projects__form-group">
                                <label>Image URL</label>
                                <input
                                    type="url"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                />
                            </div>

                            <div className="dashboard-projects__form-group">
                                <label>GitHub URL</label>
                                <input
                                    type="url"
                                    value={formData.github_url}
                                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                                />
                            </div>

                            <div className="dashboard-projects__form-group">
                                <label>Live URL</label>
                                <input
                                    type="url"
                                    value={formData.live_url}
                                    onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                                />
                            </div>

                            <div className="dashboard-projects__form-group">
                                <label>Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="React, TypeScript, Game Development"
                                />
                            </div>

                            <div className="dashboard-projects__form-checkboxes">
                                <label className="dashboard-projects__checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    />
                                    <span>Featured Project</span>
                                </label>

                                <label className="dashboard-projects__checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.published}
                                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                    />
                                    <span>Published</span>
                                </label>
                            </div>

                            <div className="dashboard-projects__form-actions">
                                <button 
                                    type="button"
                                    className="dashboard-projects__btn dashboard-projects__btn--secondary"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setEditingProject(null);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="dashboard-projects__btn dashboard-projects__btn--primary"
                                >
                                    {editingProject ? 'Update Project' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardProjects;