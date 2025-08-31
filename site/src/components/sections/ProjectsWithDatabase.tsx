// components/sections/ProjectsWithDatabase.tsx - Updated to use database integration
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useContentManager } from '../../hooks/useContentManager';
import { useLazyLoad } from '../../hooks/useLazyLoad';
import { useRealtimeProjects } from '../../hooks/useRealtimeData';
import type { DatabaseProject } from '../../services/DatabaseService';
import './Projects.css';

interface ProjectsProps {
    showFeaturedOnly?: boolean;
    maxProjects?: number;
}

// Type guard for database project data
const isValidDatabaseProject = (project: any): project is DatabaseProject => {
    const validCategories: DatabaseProject['category'][] = ['mobile', 'pc', 'console', 'vr', 'ar'];
    const validStatuses: DatabaseProject['status'][] = ['completed', 'ongoing', 'planning'];

    return project &&
        typeof project === 'object' &&
        typeof project.id === 'string' &&
        typeof project.title === 'string' &&
        typeof project.description === 'string' &&
        typeof project.category === 'string' &&
        validCategories.includes(project.category) &&
        typeof project.status === 'string' &&
        validStatuses.includes(project.status) &&
        typeof project.year === 'number' &&
        typeof project.featured === 'boolean' &&
        Array.isArray(project.technologies) &&
        project.technologies.every((tech: any) => typeof tech === 'string');
};

const ProjectsWithDatabase: React.FC<ProjectsProps> = ({
    showFeaturedOnly = false,
    maxProjects
}) => {
    const projectsRef = useRef<HTMLElement>(null);
    const [filter, setFilter] = useState<'all' | DatabaseProject['category']>('all');
    const [isAnimating, setIsAnimating] = useState(false);

    // Use real-time database hooks
    const { 
        data: projects, 
        loading: isLoading, 
        error: dataError,
        refresh 
    } = useRealtimeProjects({ 
        featuredOnly: showFeaturedOnly,
        enabled: true 
    });

    // Safe hook usage with error handling
    const contentManager = useContentManager();
    const lazyLoadManager = useLazyLoad();

    const setCurrentSection = contentManager?.setCurrentSection;
    const observeImage = lazyLoadManager?.observeImage;

    // Validated and filtered data
    const validatedProjects = useMemo(() => {
        try {
            if (!Array.isArray(projects)) {
                console.warn('Projects data is not an array:', projects);
                return [];
            }

            return projects.filter(isValidDatabaseProject);
        } catch (error) {
            console.error('Error validating projects data:', error);
            return [];
        }
    }, [projects]);

    const filteredProjects = useMemo(() => {
        try {
            if (!Array.isArray(validatedProjects)) {
                return [];
            }

            const filtered = filter === 'all'
                ? validatedProjects
                : validatedProjects.filter(p => p?.category === filter);

            const finalProjects = maxProjects && maxProjects > 0
                ? filtered.slice(0, maxProjects)
                : filtered;

            return finalProjects;
        } catch (error) {
            console.error('Error filtering projects:', error);
            return [];
        }
    }, [validatedProjects, filter, maxProjects]);

    // Safe categories calculation
    const categories = useMemo((): Array<'all' | DatabaseProject['category']> => {
        try {
            if (showFeaturedOnly || !Array.isArray(validatedProjects)) {
                return ['all'];
            }

            const validCategories = validatedProjects
                .map(p => p?.category)
                .filter((category): category is DatabaseProject['category'] =>
                    typeof category === 'string' &&
                    ['mobile', 'pc', 'console', 'vr', 'ar'].includes(category as DatabaseProject['category'])
                );

            const uniqueCategories = ['all' as const, ...new Set(validCategories)];
            return uniqueCategories as Array<'all' | DatabaseProject['category']>;
        } catch (error) {
            console.error('Error calculating categories:', error);
            return ['all'];
        }
    }, [validatedProjects, showFeaturedOnly]);

    // Safe intersection observer setup
    useEffect(() => {
        if (!projectsRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                try {
                    if (entry?.isIntersecting && setCurrentSection) {
                        setCurrentSection('projects');
                    }
                } catch (error) {
                    console.error('Error in projects intersection observer:', error);
                }
            },
            { threshold: 0.3 }
        );

        try {
            observer.observe(projectsRef.current);
        } catch (error) {
            console.error('Failed to observe projects section:', error);
        }

        return () => {
            try {
                observer.disconnect();
            } catch (error) {
                console.error('Error disconnecting projects observer:', error);
            }
        };
    }, [setCurrentSection]);

    // Enhanced filter change handler with error handling
    const handleFilterChange = useCallback((newFilter: 'all' | DatabaseProject['category']) => {
        try {
            if (newFilter === filter || isAnimating) return;

            setIsAnimating(true);

            // Brief animation delay for smooth transition
            setTimeout(() => {
                try {
                    setFilter(newFilter);

                    // Reset animation state after cards animate in
                    setTimeout(() => {
                        setIsAnimating(false);
                    }, 600);
                } catch (error) {
                    console.error('Error during filter transition:', error);
                    setIsAnimating(false);
                }
            }, 150);
        } catch (error) {
            console.error('Error handling filter change:', error);
            setIsAnimating(false);
        }
    }, [filter, isAnimating]);

    // Handle refresh with error recovery
    const handleRefresh = useCallback(async () => {
        try {
            await refresh();
        } catch (error) {
            console.error('Error refreshing projects:', error);
        }
    }, [refresh]);

    // Error boundary fallback
    if (dataError) {
        return (
            <section className="projects projects--error" aria-label="Projects section - Error state">
                <div className="projects__container">
                    <div className="projects__error">
                        <h2>Unable to Load Projects</h2>
                        <p>We're experiencing technical difficulties loading our project portfolio.</p>
                        <p className="projects__error-details">Error: {dataError}</p>
                        <div className="projects__error-actions">
                            <button
                                onClick={handleRefresh}
                                className="projects__retry-button"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Retrying...' : 'Retry Loading'}
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="projects__reload-button"
                            >
                                Reload Page
                            </button>
                        </div>
                        <p className="projects__contact-support">
                            Please contact support if this issue persists.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            ref={projectsRef}
            id="projects"
            className="projects"
            aria-label="Projects section"
        >
            <div className="projects__container">
                <div className="projects__header">
                    <h2 className="projects__title">
                        {showFeaturedOnly ? 'Featured Projects' : 'Our Projects'}
                    </h2>
                    <p className="projects__subtitle">
                        {showFeaturedOnly
                            ? 'Highlighting our most successful game development projects'
                            : 'Showcasing our comprehensive game development portfolio across all platforms'
                        }
                    </p>
                    {/* Real-time indicator */}
                    <div className="projects__realtime-status">
                        <span className="projects__realtime-indicator" aria-label="Live data"></span>
                        <span className="projects__realtime-text">Live updates enabled</span>
                    </div>
                </div>

                {!showFeaturedOnly && categories.length > 1 && (
                    <div className="projects__filters">
                        {categories.map(category => (
                            <button
                                key={`filter-${category}`}
                                className={`projects__filter ${filter === category ? 'projects__filter--active' : ''}`}
                                onClick={() => handleFilterChange(category)}
                                disabled={isAnimating || isLoading}
                                aria-label={`Filter projects by ${category === 'all' ? 'all categories' : category}`}
                            >
                                {category === 'all' ? 'All Projects' : category.toUpperCase()}
                            </button>
                        ))}
                    </div>
                )}

                {/* Loading state for database operations */}
                {isLoading && filteredProjects.length === 0 ? (
                    <div className="projects__loading">
                        <div className="projects__spinner" aria-hidden="true"></div>
                        <p className="projects__loading-text">Loading projects from database...</p>
                    </div>
                ) : (
                    <div className={`projects__grid ${isAnimating ? 'projects__grid--filtering' : ''}`}>
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project, index) => (
                                <DatabaseProjectCard
                                    key={`${project.id}-${filter}-${index}`}
                                    project={project}
                                    observeImage={observeImage}
                                    index={index}
                                    isFilteringIn={isAnimating}
                                />
                            ))
                        ) : (
                            <div className="projects__empty">
                                <p>
                                    {filter === 'all'
                                        ? 'No projects available at the moment.'
                                        : `No projects found for the "${filter}" category.`
                                    }
                                </p>
                                {filter !== 'all' && (
                                    <button
                                        onClick={() => handleFilterChange('all')}
                                        className="projects__show-all-button"
                                    >
                                        Show All Projects
                                    </button>
                                )}
                                <button
                                    onClick={handleRefresh}
                                    className="projects__refresh-button"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Refreshing...' : 'Refresh'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Show loading overlay during refresh */}
                {isLoading && filteredProjects.length > 0 && (
                    <div className="projects__refresh-overlay">
                        <div className="projects__refresh-indicator">
                            <div className="projects__spinner projects__spinner--small"></div>
                            <span>Updating...</span>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

interface DatabaseProjectCardProps {
    project: DatabaseProject;
    observeImage?: (img: HTMLImageElement) => void;
    index: number;
    isFilteringIn: boolean;
}

const DatabaseProjectCard: React.FC<DatabaseProjectCardProps> = ({
    project,
    observeImage,
    index,
    isFilteringIn
}) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageRetryCount, setImageRetryCount] = useState(0);

    // Enhanced image path processing for database URLs
    const processImageUrl = useCallback((url: string | null | undefined): string => {
        try {
            if (!url || typeof url !== 'string' || url.trim() === '') {
                return '';
            }

            const cleanUrl = url.trim();

            // Handle Supabase Storage URLs
            if (cleanUrl.includes('supabase') && cleanUrl.includes('storage')) {
                return cleanUrl;
            }

            // Handle relative paths
            if (!cleanUrl.startsWith('http') && !cleanUrl.startsWith('/')) {
                return `/${cleanUrl}`;
            }

            return cleanUrl;
        } catch (error) {
            console.error('Error processing image URL:', error);
            return '';
        }
    }, []);

    // Image loading handlers
    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
        setImageError(false);
        setImageRetryCount(0);
    }, []);

    const handleImageError = useCallback(() => {
        console.warn('Image failed to load for project:', project.title);
        setImageError(true);
        setImageLoaded(false);

        if (imageRetryCount < 2) {
            setTimeout(() => {
                setImageRetryCount(prev => prev + 1);
                setImageError(false);
                
                if (imgRef.current) {
                    const img = imgRef.current;
                    const timestamp = new Date().getTime();
                    const separator = img.src.includes('?') ? '&' : '?';
                    img.src = `${img.src}${separator}retry=${imageRetryCount + 1}&t=${timestamp}`;
                }
            }, 1000 * (imageRetryCount + 1));
        }
    }, [imageRetryCount, project.title]);

    // Enhanced fallback image for database projects
    const generateFallbackImage = useCallback((): string => {
        try {
            const categoryColorMap: Record<DatabaseProject['category'], string> = {
                'mobile': '#4A90E2',
                'pc': '#7DD3FC', 
                'console': '#34D399',
                'vr': '#F59E0B',
                'ar': '#EF4444'
            };

            const categoryColor = categoryColorMap[project.category] || '#6B7280';
            const encodedTitle = encodeURIComponent(
                project.title.length > 20 ? project.title.substring(0, 17) + '...' : project.title
            );
            const encodedCategory = encodeURIComponent(project.category.toUpperCase());

            return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23F8F9FA' rx='8'/%3E%3Crect x='50' y='75' width='300' height='100' fill='${encodeURIComponent(categoryColor)}' opacity='0.1' rx='4'/%3E%3Ctext x='200' y='115' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='14' font-weight='600' fill='${encodeURIComponent(categoryColor)}'%3E${encodedTitle}%3C/text%3E%3Ctext x='200' y='140' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='12' fill='%236B7280'%3E${encodedCategory}%3C/text%3E%3Ctext x='200' y='190' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='10' fill='%239CA3AF'%3EViews: ${project.view_count || 0}%3C/text%3E%3C/svg%3E`;
        } catch (error) {
            console.error('Error generating fallback image:', error);
            return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23F3F4F6' rx='8'/%3E%3Ctext x='200' y='130' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='%236B7280'%3EProject Image%3C/text%3E%3C/svg%3E`;
        }
    }, [project.title, project.category, project.view_count]);

    // Get appropriate image source
    const imageSource = useMemo(() => {
        const processedUrl = processImageUrl(project.image_url);
        
        if (!processedUrl || (imageError && imageRetryCount >= 2)) {
            return generateFallbackImage();
        }

        return processedUrl;
    }, [project.image_url, processImageUrl, imageError, imageRetryCount, generateFallbackImage]);

    // Safe image observation
    useEffect(() => {
        if (imgRef.current && observeImage) {
            try {
                observeImage(imgRef.current);
            } catch (error) {
                console.error('Error observing image:', error);
            }
        }
    }, [observeImage]);

    // Status display mapping
    const getStatusDisplay = useCallback((status: DatabaseProject['status']) => {
        const statusMap: Record<DatabaseProject['status'], string> = {
            'completed': 'Completed',
            'ongoing': 'In Progress',
            'planning': 'Planning'
        };
        return statusMap[status] || status;
    }, []);

    // Safe link handler
    const handleLinkClick = useCallback((e: React.MouseEvent, url: string | null | undefined) => {
        try {
            if (!url || typeof url !== 'string') {
                e.preventDefault();
                console.warn('Invalid project link');
                return;
            }

            // Basic URL validation
            try {
                new URL(url);
            } catch {
                e.preventDefault();
                console.warn('Malformed project URL:', url);
                return;
            }
        } catch (error) {
            console.error('Error handling link click:', error);
            e.preventDefault();
        }
    }, []);

    return (
        <article
            className={`projects__card ${isFilteringIn ? 'projects__card--filtering-in' : ''}`}
            style={{ animationDelay: `${Math.max(0, index * 0.1)}s` }}
        >
            <div className="projects__card-image">
                {!imageLoaded && !imageError && imageSource && (
                    <div className="projects__image-placeholder">
                        <div className="projects__spinner" aria-label="Loading image"></div>
                        {imageRetryCount > 0 && (
                            <p className="projects__retry-text">
                                Retrying image... ({imageRetryCount}/2)
                            </p>
                        )}
                    </div>
                )}

                <img
                    ref={imgRef}
                    src={imageSource}
                    alt={project.image_alt || `${project.title} - ${project.category} game project screenshot`}
                    className={`projects__image ${imageLoaded ? 'projects__image--loaded' : ''} ${!imageSource || (imageError && imageRetryCount >= 2) ? 'projects__image--fallback' : ''}`}
                    loading="lazy"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    style={{
                        opacity: imageLoaded || (!imageSource || (imageError && imageRetryCount >= 2)) ? 1 : 0,
                    }}
                />

                <div className="projects__card-overlay">
                    <div className="projects__card-actions">
                        {project.external_link && (
                            <a
                                href={project.external_link}
                                className="projects__action"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`View ${project.title} project`}
                                onClick={(e) => handleLinkClick(e, project.external_link)}
                            >
                                View Project
                            </a>
                        )}
                        {project.case_study_url && (
                            <a
                                href={project.case_study_url}
                                className="projects__action projects__action--secondary"
                                aria-label={`Read ${project.title} case study`}
                                onClick={(e) => handleLinkClick(e, project.case_study_url)}
                            >
                                Case Study
                            </a>
                        )}
                        {project.github_url && (
                            <a
                                href={project.github_url}
                                className="projects__action projects__action--github"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`View ${project.title} on GitHub`}
                                onClick={(e) => handleLinkClick(e, project.github_url)}
                            >
                                GitHub
                            </a>
                        )}
                    </div>
                </div>

                {/* Database-specific metadata */}
                <div className="projects__card-metadata">
                    <span className="projects__view-count" title={`${project.view_count || 0} views`}>
                        👁️ {project.view_count || 0}
                    </span>
                    {project.featured && (
                        <span className="projects__featured-badge" title="Featured project">
                            ⭐ Featured
                        </span>
                    )}
                </div>
            </div>

            <div className="projects__card-content">
                <div className="projects__card-header">
                    <h3 className="projects__card-title">{project.title}</h3>
                    <span
                        className={`projects__status projects__status--${project.status.toLowerCase().replace(/\s+/g, '-')}`}
                        aria-label={`Project status: ${getStatusDisplay(project.status)}`}
                    >
                        {getStatusDisplay(project.status)}
                    </span>
                </div>

                <p className="projects__card-description">
                    {project.detailed_description || project.description}
                </p>

                {project.client_name && (
                    <p className="projects__client">
                        <strong>Client:</strong> {project.client_name}
                    </p>
                )}

                {project.team_size && (
                    <p className="projects__team-size">
                        <strong>Team Size:</strong> {project.team_size} developers
                    </p>
                )}

                {project.duration_months && (
                    <p className="projects__duration">
                        <strong>Duration:</strong> {project.duration_months} months
                    </p>
                )}

                {project.technologies.length > 0 && (
                    <div className="projects__technologies" role="list" aria-label="Technologies used">
                        {project.technologies.map((tech, techIndex) => (
                            <span
                                key={`tech-${techIndex}-${tech}`}
                                className="projects__tech-tag"
                                role="listitem"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                )}

                {project.achievements.length > 0 && (
                    <div className="projects__achievements">
                        <h4>Key Achievements:</h4>
                        <ul>
                            {project.achievements.map((achievement, idx) => (
                                <li key={idx}>{achievement}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="projects__meta">
                    <span className="projects__category" aria-label={`Category: ${project.category}`}>
                        {project.category}
                    </span>
                    <time
                        className="projects__year"
                        dateTime={project.year.toString()}
                        aria-label={`Year: ${project.year}`}
                    >
                        {project.year}
                    </time>
                    <span className="projects__updated" title={`Last updated: ${new Date(project.updated_at).toLocaleDateString()}`}>
                        Updated {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </article>
    );
};

export default ProjectsWithDatabase;