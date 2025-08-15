import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useContentManager } from '../../hooks/useContentManager';
import { useLazyLoad } from '../../hooks/useLazyLoad';
import { projectsData, ProjectData, getFeaturedProjects } from '../../data/projects';
import './Projects.css';

interface ProjectsProps {
    showFeaturedOnly?: boolean;
    maxProjects?: number;
}

// Fix 1: Enhanced Type Guards with Exact Union Type Validation
const isValidProjectData = (project: any): project is ProjectData => {
    // Valid categories exactly matching your ProjectData interface
    const validCategories: ProjectData['category'][] = ['mobile', 'pc', 'console', 'vr', 'ar'];
    const validStatuses: ProjectData['status'][] = ['completed', 'ongoing', 'planning'];

    return project &&
        typeof project === 'object' &&
        typeof project.id === 'string' &&
        typeof project.title === 'string' &&
        typeof project.description === 'string' &&
        typeof project.category === 'string' &&
        validCategories.includes(project.category) && // Now properly typed
        typeof project.status === 'string' &&
        validStatuses.includes(project.status) && // Added status validation
        typeof project.year === 'number' &&
        typeof project.featured === 'boolean' &&
        Array.isArray(project.technologies) &&
        project.technologies.every((tech: any) => typeof tech === 'string');
};

const Projects: React.FC<ProjectsProps> = ({
    showFeaturedOnly = false,
    maxProjects
}) => {
    const projectsRef = useRef<HTMLElement>(null);
    const [filter, setFilter] = useState<'all' | ProjectData['category']>('all');
    const [isLoading, setIsLoading] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [dataError, setDataError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    // Safe hook usage with error handling
    const contentManager = useContentManager();
    const lazyLoadManager = useLazyLoad();

    const setCurrentSection = contentManager?.setCurrentSection;
    const observeImage = lazyLoadManager?.observeImage;

    // Memoized and validated data
    const projects = useMemo(() => {
        try {
            if (showFeaturedOnly) {
                const featured = getFeaturedProjects?.() || [];
                return Array.isArray(featured) ? featured.filter(isValidProjectData) : [];
            }

            if (!Array.isArray(projectsData)) {
                throw new Error('Projects data is not an array');
            }

            return projectsData.filter(isValidProjectData);
        } catch (error) {
            console.error('Error loading projects data:', error);
            setDataError('Failed to load projects data');
            return [];
        }
    }, [showFeaturedOnly]);

    const filteredProjects = useMemo(() => {
        try {
            if (!Array.isArray(projects)) {
                return [];
            }

            const filtered = filter === 'all'
                ? projects
                : projects.filter(p => p?.category === filter);

            const finalProjects = maxProjects && maxProjects > 0
                ? filtered.slice(0, maxProjects)
                : filtered;

            return finalProjects;
        } catch (error) {
            console.error('Error filtering projects:', error);
            return [];
        }
    }, [projects, filter, maxProjects]);

    // Safe categories calculation
    const categories = useMemo((): Array<'all' | ProjectData['category']> => {
        try {
            if (showFeaturedOnly || !Array.isArray(projects)) {
                return ['all'];
            }

            const validCategories = projects
                .map(p => p?.category)
                .filter((category): category is ProjectData['category'] =>
                    typeof category === 'string' &&
                    ['mobile', 'pc', 'console', 'vr', 'ar'].includes(category as ProjectData['category'])
                );

            const uniqueCategories = ['all' as const, ...new Set(validCategories)];
            return uniqueCategories as Array<'all' | ProjectData['category']>;
        } catch (error) {
            console.error('Error calculating categories:', error);
            return ['all'];
        }
    }, [projects, showFeaturedOnly]);

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
    const handleFilterChange = useCallback((newFilter: 'all' | ProjectData['category']) => {
        try {
            if (newFilter === filter || isAnimating) return;

            setIsAnimating(true);
            setIsLoading(true);

            // Brief loading state for smooth transition
            setTimeout(() => {
                try {
                    setFilter(newFilter);
                    setIsLoading(false);

                    // Reset animation state after cards animate in
                    setTimeout(() => {
                        setIsAnimating(false);
                    }, 600);
                } catch (error) {
                    console.error('Error during filter transition:', error);
                    setIsLoading(false);
                    setIsAnimating(false);
                }
            }, 150);
        } catch (error) {
            console.error('Error handling filter change:', error);
            setIsLoading(false);
            setIsAnimating(false);
        }
    }, [filter, isAnimating]);

    // Retry mechanism for data loading
    const handleRetry = useCallback(() => {
        setRetryCount(prev => prev + 1);
        setDataError(null);
        window.location.reload();
    }, []);

    // Error boundary fallback
    if (dataError) {
        return (
            <section className="projects projects--error" aria-label="Projects section - Error state">
                <div className="projects__container">
                    <div className="projects__error">
                        <h2>Unable to Load Projects</h2>
                        <p>We're experiencing technical difficulties loading our project portfolio.</p>
                        <button
                            onClick={handleRetry}
                            className="projects__retry-button"
                            disabled={retryCount >= 3}
                        >
                            {retryCount >= 3 ? 'Max retries reached' : 'Retry Loading'}
                        </button>
                        {retryCount >= 3 && (
                            <p className="projects__contact-support">
                                Please contact support if this issue persists.
                            </p>
                        )}
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
                </div>

                {!showFeaturedOnly && categories.length > 1 && (
                    <div className="projects__filters">
                        {categories.map(category => (
                            <button
                                key={`filter-${category}`}
                                className={`projects__filter ${filter === category ? 'projects__filter--active' : ''}`}
                                onClick={() => handleFilterChange(category)}
                                disabled={isAnimating}
                                aria-label={`Filter projects by ${category === 'all' ? 'all categories' : category}`}
                            >
                                {category === 'all' ? 'All Projects' : category.toUpperCase()}
                            </button>
                        ))}
                    </div>
                )}

                {isLoading ? (
                    <div className="projects__loading">
                        <div className="projects__spinner" aria-hidden="true"></div>
                        <p className="projects__loading-text">Loading projects...</p>
                    </div>
                ) : (
                    <div className={`projects__grid ${isAnimating ? 'projects__grid--filtering' : ''}`}>
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project, index) => (
                                <ProjectCard
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
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

interface ProjectCardProps {
    project: ProjectData;
    observeImage?: (img: HTMLImageElement) => void;
    index: number;
    isFilteringIn: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
    project,
    observeImage,
    index,
    isFilteringIn
}) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageRetryCount, setImageRetryCount] = useState(0);
    const [imagePath, setImagePath] = useState<string>('');

    // Fix 2: Enhanced Image Path Validation and Processing
    const validateAndProcessImagePath = useCallback((path: string): string => {
        try {
            // Handle missing or empty paths
            if (!path || typeof path !== 'string' || path.trim() === '') {
                console.warn('Missing or empty image path for project:', project?.title);
                return '';
            }

            // Clean the path
            const cleanPath = path.trim();

            // Check for valid image extensions
            const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
            const hasValidExtension = validExtensions.some(ext =>
                cleanPath.toLowerCase().endsWith(ext)
            );

            if (!hasValidExtension) {
                console.warn('Invalid image extension for project:', project?.title, 'Path:', cleanPath);
                return '';
            }

            // Handle relative paths - ensure they start with / or are absolute URLs
            if (!cleanPath.startsWith('http') && !cleanPath.startsWith('/') && !cleanPath.startsWith('./')) {
                return `/${cleanPath}`;
            }

            // Validate URL format for absolute URLs
            if (cleanPath.startsWith('http')) {
                try {
                    new URL(cleanPath);
                } catch {
                    console.warn('Invalid URL format for project image:', cleanPath);
                    return '';
                }
            }

            return cleanPath;
        } catch (error) {
            console.error('Error validating image path:', error);
            return '';
        }
    }, [project?.title]);

    // Initialize and validate image path
    useEffect(() => {
        const validatedPath = validateAndProcessImagePath(project?.image || '');
        setImagePath(validatedPath);

        // Reset states when path changes
        setImageLoaded(false);
        setImageError(false);
        setImageRetryCount(0);
    }, [project?.image, validateAndProcessImagePath]);

    // Enhanced image loading with better error handling
    const handleImageLoad = useCallback(() => {
        try {
            setImageLoaded(true);
            setImageError(false);
            setImageRetryCount(0);
        } catch (error) {
            console.error('Error handling image load:', error);
        }
    }, []);

    const handleImageError = useCallback(() => {
        try {
            console.warn('Image failed to load for project:', project?.title, 'Path:', imagePath);
            setImageError(true);
            setImageLoaded(false);

            // Enhanced retry logic with exponential backoff
            if (imageRetryCount < 2 && imagePath) {
                const retryDelay = Math.min(1000 * Math.pow(2, imageRetryCount), 5000);

                setTimeout(() => {
                    setImageRetryCount(prev => prev + 1);
                    setImageError(false);

                    if (imgRef.current) {
                        const img = imgRef.current;
                        const timestamp = new Date().getTime();
                        const separator = imagePath.includes('?') ? '&' : '?';
                        const retryPath = `${imagePath}${separator}retry=${imageRetryCount + 1}&t=${timestamp}`;

                        img.src = retryPath;
                    }
                }, retryDelay);
            } else {
                console.error('Max retries reached or invalid path for project image:', project?.title);
            }
        } catch (error) {
            console.error('Error handling image error:', error);
        }
    }, [imageRetryCount, imagePath, project?.title]);

    // Enhanced fallback image generation with proper category mapping
    const generateFallbackImage = useCallback((): string => {
        try {
            const safeProject = {
                title: project?.title || 'Untitled Project',
                category: project?.category || 'mobile'
            };

            // Map categories to colors using exact ProjectData categories
            const categoryColorMap: Record<ProjectData['category'], string> = {
                'mobile': '#4A90E2',
                'pc': '#7DD3FC',
                'console': '#34D399',
                'vr': '#F59E0B',
                'ar': '#EF4444'
            };

            const categoryColor = categoryColorMap[safeProject.category] || '#6B7280';

            // Safely encode strings for SVG
            const encodedTitle = encodeURIComponent(
                safeProject.title.length > 20
                    ? safeProject.title.substring(0, 17) + '...'
                    : safeProject.title
            );
            const encodedCategory = encodeURIComponent(safeProject.category.toUpperCase());
            const encodedColor = encodeURIComponent(categoryColor);

            return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23F8F9FA' rx='8'/%3E%3Crect x='50' y='75' width='300' height='100' fill='${encodedColor}' opacity='0.1' rx='4'/%3E%3Ctext x='200' y='115' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='14' font-weight='600' fill='${encodedColor}'%3E${encodedTitle}%3C/text%3E%3Ctext x='200' y='140' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='12' fill='%236B7280'%3E${encodedCategory}%3C/text%3E%3Ctext x='200' y='160' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='10' fill='%239CA3AF'%3EImage not available%3C/text%3E%3C/svg%3E`;
        } catch (error) {
            console.error('Error generating fallback image:', error);
            // Ultra-safe fallback
            return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23F3F4F6' rx='8'/%3E%3Ctext x='200' y='130' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='%236B7280'%3EProject Image%3C/text%3E%3C/svg%3E`;
        }
    }, [project?.title, project?.category]);

    // Determine the image source to use
    const getImageSource = useCallback((): string => {
        // If we have a valid path and haven't exceeded retries, use it
        if (imagePath && !imageError) {
            return imagePath;
        }

        // If we've exceeded retries or have no valid path, use fallback
        if (imageError && imageRetryCount >= 2) {
            return generateFallbackImage();
        }

        // During retry attempts, keep trying the original path
        if (imagePath && imageError && imageRetryCount < 2) {
            return imagePath;
        }

        // Default to fallback if no valid path
        return generateFallbackImage();
    }, [imagePath, imageError, imageRetryCount, generateFallbackImage]);

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

    // Safe data access with fallbacks
    const safeProject = useMemo(() => ({
        id: project?.id || 'unknown',
        title: project?.title || 'Untitled Project',
        description: project?.description || 'No description available.',
        category: project?.category || 'mobile',
        status: project?.status || 'planning',
        year: project?.year || new Date().getFullYear(),
        technologies: Array.isArray(project?.technologies) ? project.technologies : [],
        image: project?.image || '',
        link: project?.link || null,
        caseStudy: project?.caseStudy || null,
        client: project?.client || null,
        featured: project?.featured || false
    }), [project]);

    // Enhanced status display with exact status mapping
    const getStatusDisplay = useCallback((status: ProjectData['status']) => {
        try {
            const statusMap: Record<ProjectData['status'], string> = {
                'completed': 'Completed',
                'ongoing': 'In Progress',
                'planning': 'Planning'
            };
            return statusMap[status] || status;
        } catch (error) {
            console.error('Error formatting status:', error);
            return 'Unknown';
        }
    }, []);

    // Safe link handler
    const handleLinkClick = useCallback((e: React.MouseEvent, url: string | null) => {
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
                {/* Enhanced loading state */}
                {!imageLoaded && !imageError && imagePath && (
                    <div className="projects__image-placeholder">
                        <div className="projects__spinner" aria-label="Loading image"></div>
                        {imageRetryCount > 0 && (
                            <p className="projects__retry-text">
                                Retrying image... ({imageRetryCount}/2)
                            </p>
                        )}
                    </div>
                )}

                {/* Image with enhanced error handling */}
                <img
                    ref={imgRef}
                    // src={getImageSource()}
                    alt={`${safeProject.title} - ${safeProject.category} game project screenshot`}
                    className={`projects__image ${imageLoaded ? 'projects__image--loaded' : ''} ${!imagePath || (imageError && imageRetryCount >= 2) ? 'projects__image--fallback' : ''
                        }`}
                    loading="lazy"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    style={{
                        opacity: imageLoaded || (!imagePath || (imageError && imageRetryCount >= 2)) ? 1 : 0,
                    }}
                />

                {/* Error state indicator */}
                {imageError && imageRetryCount >= 2 && imagePath && (
                    <div className="projects__image-error-indicator" aria-label="Image failed to load">
                        <span className="projects__error-icon">⚠️</span>
                    </div>
                )}

                <div className="projects__card-overlay">
                    <div className="projects__card-actions">
                        {safeProject.link && (
                            <a
                                href={safeProject.link}
                                className="projects__action"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`View ${safeProject.title} project`}
                                onClick={(e) => handleLinkClick(e, safeProject.link)}
                            >
                                View Project
                            </a>
                        )}
                        {safeProject.caseStudy && (
                            <a
                                href={safeProject.caseStudy}
                                className="projects__action projects__action--secondary"
                                aria-label={`Read ${safeProject.title} case study`}
                                onClick={(e) => handleLinkClick(e, safeProject.caseStudy)}
                            >
                                Case Study
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="projects__card-content">
                <div className="projects__card-header">
                    <h3 className="projects__card-title">{safeProject.title}</h3>
                    <span
                        className={`projects__status projects__status--${safeProject.status.toLowerCase().replace(/\s+/g, '-')}`}
                        aria-label={`Project status: ${getStatusDisplay(safeProject.status)}`}
                    >
                        {getStatusDisplay(safeProject.status)}
                    </span>
                </div>

                <p className="projects__card-description">{safeProject.description}</p>

                {safeProject.client && (
                    <p className="projects__client">
                        <strong>Client:</strong> {safeProject.client}
                    </p>
                )}

                {safeProject.technologies.length > 0 && (
                    <div className="projects__technologies" role="list" aria-label="Technologies used">
                        {safeProject.technologies.map((tech, techIndex) => {
                            // Validate technology entry
                            const safeTech = typeof tech === 'string' ? tech : String(tech || 'Unknown');

                            return (
                                <span
                                    key={`tech-${techIndex}-${safeTech}`}
                                    className="projects__tech-tag"
                                    role="listitem"
                                >
                                    {safeTech}
                                </span>
                            );
                        })}
                    </div>
                )}

                <div className="projects__meta">
                    <span
                        className="projects__category"
                        aria-label={`Category: ${safeProject.category}`}
                    >
                        {safeProject.category}
                    </span>
                    <time
                        className="projects__year"
                        dateTime={safeProject.year.toString()}
                        aria-label={`Year: ${safeProject.year}`}
                    >
                        {safeProject.year}
                    </time>
                </div>
            </div>
        </article>
    );
};

export default Projects;