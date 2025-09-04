import React, { useEffect, useRef, useCallback } from 'react';
import './ProjectDetailsModal.css';

interface ProjectDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: {
        id?: string;
        title?: string;
        description?: string;
        detailed_description?: string;
        image?: string;
        image_url?: string;
        category?: string;
        status?: string;
        year?: number;
        technologies?: string[];
        client?: string;
        client_name?: string;
        team_size?: number;
        duration_months?: number;
        achievements?: string[];
        view_count?: number;
        featured?: boolean;
        external_link?: string;
        link?: string;
        github_url?: string;
        case_study_url?: string;
        caseStudy?: string;
        created_at?: string;
        updated_at?: string;
    } | null;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
    isOpen,
    onClose,
    project
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Handle escape key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Handle click outside modal
    const handleOverlayClick = useCallback((e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    }, [onClose]);

    // Animate modal entrance/exit
    useEffect(() => {
        if (!modalRef.current || !contentRef.current || !overlayRef.current) return;

        if (isOpen) {
            // Entrance animation
            overlayRef.current.animate([
                { opacity: 0 },
                { opacity: 1 }
            ], {
                duration: 300,
                easing: 'ease-out',
                fill: 'both'
            });

            contentRef.current.animate([
                { 
                    opacity: 0, 
                    transform: 'scale(0.7) translateY(50px)', 
                    filter: 'blur(10px)' 
                },
                { 
                    opacity: 1, 
                    transform: 'scale(1) translateY(0)', 
                    filter: 'blur(0px)' 
                }
            ], {
                duration: 400,
                delay: 100,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fill: 'both'
            });
        }
    }, [isOpen]);

    // Handle image error for fallback
    const generateFallbackImage = useCallback((): string => {
        if (!project) return '';

        const categoryColorMap: Record<string, string> = {
            'mobile': '#4A90E2',
            'pc': '#7DD3FC',
            'console': '#34D399',
            'vr': '#F59E0B',
            'ar': '#EF4444'
        };

        const category = project.category || 'unknown';
        const title = project.title || 'Untitled Project';
        
        const categoryColor = categoryColorMap[category] || '#6B7280';
        const encodedTitle = encodeURIComponent(
            title.length > 30 ? title.substring(0, 27) + '...' : title
        );
        const encodedCategory = encodeURIComponent(category.toUpperCase());

        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:${encodeURIComponent(categoryColor)};stop-opacity:0.2'/%3E%3Cstop offset='100%25' style='stop-color:${encodeURIComponent(categoryColor)};stop-opacity:0.05'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='400' fill='url(%23grad)' rx='12'/%3E%3Ccircle cx='300' cy='150' r='50' fill='${encodeURIComponent(categoryColor)}' opacity='0.1'/%3E%3Ctext x='300' y='160' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='20' font-weight='600' fill='${encodeURIComponent(categoryColor)}'%3E${encodedTitle}%3C/text%3E%3Ctext x='300' y='185' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='14' fill='%236B7280'%3E${encodedCategory} Project%3C/text%3E%3Ctext x='300' y='350' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='12' fill='%239CA3AF'%3EDetailed view available%3C/text%3E%3C/svg%3E`;
    }, [project]);

    // Get image source (handle both static and database projects)
    const getImageSource = useCallback(() => {
        if (!project) return generateFallbackImage();
        
        // For database projects
        if (project.image_url) {
            return project.image_url;
        }
        
        // For static projects
        if (project.image) {
            return project.image;
        }
        
        return generateFallbackImage();
    }, [project, generateFallbackImage]);

    // Get status display
    const getStatusDisplay = useCallback((status: string) => {
        const statusMap: Record<string, string> = {
            'completed': 'Completed',
            'ongoing': 'In Progress',
            'planning': 'Planning'
        };
        return statusMap[status] || status;
    }, []);

    // Get project data (handle both types)
    const getProjectData = useCallback(() => {
        if (!project) return null;

        return {
            title: project.title || 'Untitled Project',
            description: project.detailed_description || project.description || 'No description available',
            image: getImageSource(),
            category: project.category || 'Unknown',
            status: project.status || 'Unknown',
            year: project.year || new Date().getFullYear(),
            technologies: project.technologies || [],
            client: project.client_name || project.client || null,
            teamSize: project.team_size || null,
            duration: project.duration_months || null,
            achievements: project.achievements || [],
            viewCount: project.view_count || null,
            featured: project.featured || false,
            links: {
                external: project.external_link || project.link || null,
                github: project.github_url || null,
                caseStudy: project.case_study_url || project.caseStudy || null
            },
            dates: {
                created: project.created_at || null,
                updated: project.updated_at || null
            }
        };
    }, [project, getImageSource]);

    if (!isOpen || !project) {
        return null;
    }

    const projectData = getProjectData();
    if (!projectData) return null;

    return (
        <div 
            ref={modalRef}
            className="modal-overlay" 
            aria-modal="true" 
            role="dialog"
            aria-labelledby="modal-title"
        >
            <div 
                ref={overlayRef}
                className="modal-backdrop"
                onClick={handleOverlayClick}
            />
            
            <div ref={contentRef} className="modal-content">
                <button 
                    className="modal-close"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path 
                            d="M18 6L6 18M6 6l12 12" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

                <div className="modal-header">
                    <div className="modal-image-container">
                        <img 
                            src={projectData.image}
                            alt={`${projectData.title} project screenshot`}
                            className="modal-image"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = generateFallbackImage();
                            }}
                        />
                        <div className="modal-image-overlay">
                            <div className="modal-status-badges">
                                <span className={`status-badge status-badge--${projectData.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {getStatusDisplay(projectData.status)}
                                </span>
                                {projectData.featured && (
                                    <span className="featured-badge">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                        </svg>
                                        Featured
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="modal-title-section">
                        <h1 id="modal-title" className="modal-title">{projectData.title}</h1>
                        <div className="modal-meta">
                            <span className="modal-category">{projectData.category}</span>
                            <span className="modal-year">{projectData.year}</span>
                            {projectData.viewCount && (
                                <span className="modal-views">👁️ {projectData.viewCount} views</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-body">
                    <div className="modal-description">
                        <h2>About This Project</h2>
                        <p>{projectData.description}</p>
                    </div>

                    {projectData.achievements.length > 0 && (
                        <div className="modal-achievements">
                            <h3>Key Achievements</h3>
                            <ul>
                                {projectData.achievements.map((achievement, index) => (
                                    <li key={index}>{achievement}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="modal-details-grid">
                        {projectData.client && (
                            <div className="modal-detail">
                                <h4>Client</h4>
                                <p>{projectData.client}</p>
                            </div>
                        )}

                        {projectData.teamSize && (
                            <div className="modal-detail">
                                <h4>Team Size</h4>
                                <p>{projectData.teamSize} developers</p>
                            </div>
                        )}

                        {projectData.duration && (
                            <div className="modal-detail">
                                <h4>Duration</h4>
                                <p>{projectData.duration} months</p>
                            </div>
                        )}

                        {projectData.dates.updated && (
                            <div className="modal-detail">
                                <h4>Last Updated</h4>
                                <p>{new Date(projectData.dates.updated).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>

                    {projectData.technologies.length > 0 && (
                        <div className="modal-technologies">
                            <h3>Technologies Used</h3>
                            <div className="tech-tags">
                                {projectData.technologies.map((tech, index) => (
                                    <span key={index} className="tech-tag">{tech}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="modal-actions">
                        {projectData.links.external && (
                            <a 
                                href={projectData.links.external}
                                className="modal-action modal-action--primary"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                View Project
                            </a>
                        )}

                        {projectData.links.github && (
                            <a 
                                href={projectData.links.github}
                                className="modal-action modal-action--secondary"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                GitHub
                            </a>
                        )}

                        {projectData.links.caseStudy && (
                            <a 
                                href={projectData.links.caseStudy}
                                className="modal-action modal-action--outline"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Case Study
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsModal;