// components/sections/PaginatedProjects.tsx - Projects section with pagination
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useContentManager } from '../../hooks/useContentManager';
import { useLazyLoad } from '../../hooks/useLazyLoad';
import { usePaginatedProjects } from '../../hooks/useRealtimeData';
import ResponsiveImage from '../common/ResponsiveImage';
import Pagination from '../ui/Pagination';
import ProjectDetailsModal from '../modals/ProjectDetailsModal';
import { getProjectFolderName, hasProjectAssets } from '../../utils/projectImageMap';
import type { DatabaseProject } from '../../services/DatabaseService';
import './Projects.css';

interface PaginatedProjectsProps {
    showFeaturedOnly?: boolean;
    itemsPerPage?: number;
    showPagination?: boolean;
}

const PaginatedProjects: React.FC<PaginatedProjectsProps> = ({
    showFeaturedOnly = false,
    itemsPerPage = 4,
    showPagination = true
}) => {
    const projectsRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const filtersRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const [filter, setFilter] = useState<'all' | DatabaseProject['category']>('all');
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const [selectedProject, setSelectedProject] = useState<DatabaseProject | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Use paginated projects hook
    const { 
        data: projects, 
        pagination,
        loading: isLoading, 
        error: dataError,
        setPage,
        refresh 
    } = usePaginatedProjects({ 
        featuredOnly: showFeaturedOnly,
        category: filter !== 'all' ? filter : undefined,
        itemsPerPage,
        enabled: true 
    });

    // Safe hook usage with error handling
    const contentManager = useContentManager();
    const lazyLoadManager = useLazyLoad();

    const setCurrentSection = contentManager?.setCurrentSection;
    const observeImage = lazyLoadManager?.observeImage;

    // Dynamic categories calculation from actual data
    const categories = useMemo((): Array<'all' | DatabaseProject['category']> => {
        try {
            if (showFeaturedOnly || !projects || projects.length === 0) {
                return ['all'];
            }

            // Extract unique categories from actual projects data
            const uniqueCategories = Array.from(new Set(
                projects.map(project => project.category).filter(Boolean)
            )) as DatabaseProject['category'][];

            return ['all', ...uniqueCategories.sort()];
        } catch (error) {
            console.error('Error calculating categories:', error);
            return ['all'];
        }
    }, [showFeaturedOnly, projects]);

    // Web Animations API
    const animateEntry = useCallback(() => {
        if (hasAnimated || !headerRef.current || !gridRef.current) return;

        // Header animation
        headerRef.current.animate([
            { opacity: 0, transform: 'translateY(50px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], {
            duration: 800,
            delay: 200,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fill: 'both'
        });

        // Filters animation (if exists)
        if (filtersRef.current && categories.length > 1) {
            Array.from(filtersRef.current.children).forEach((child, index) => {
                (child as HTMLElement).animate([
                    { opacity: 0, transform: 'translateY(30px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ], {
                    duration: 600,
                    delay: 400 + (index * 100),
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    fill: 'both'
                });
            });
        }

        // Grid animation
        if (gridRef.current) {
            Array.from(gridRef.current.children).forEach((child, index) => {
                // Don't animate the pagination component
                if ((child as HTMLElement).className.includes('pagination')) return;
                
                (child as HTMLElement).animate([
                    { opacity: 0, transform: 'translateY(60px) scale(0.9)' },
                    { opacity: 1, transform: 'translateY(0) scale(1)' }
                ], {
                    duration: 800,
                    delay: 600 + (index * 150),
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    fill: 'both'
                });
            });
        }

        setTimeout(() => setHasAnimated(true), 1400);
    }, [hasAnimated, categories.length]);

    const animateFilterChange = useCallback(() => {
        if (!gridRef.current) return;

        const projectCards = Array.from(gridRef.current.children).filter(
            child => !(child as HTMLElement).className.includes('pagination')
        ) as HTMLElement[];

        // First animate out existing cards
        Promise.all(
            projectCards.map(card => 
                card.animate([
                    { opacity: 1, transform: 'translateY(0) scale(1)' },
                    { opacity: 0, transform: 'translateY(-30px) scale(0.95)' }
                ], {
                    duration: 300,
                    easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
                    fill: 'both'
                }).finished
            )
        ).then(() => {
            // Then animate in new cards after a short delay
            setTimeout(() => {
                projectCards.forEach((card, index) => {
                    card.animate([
                        { opacity: 0, transform: 'translateY(30px) scale(0.95)' },
                        { opacity: 1, transform: 'translateY(0) scale(1)' }
                    ], {
                        duration: 600,
                        delay: index * 100,
                        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        fill: 'both'
                    });
                });
                setTimeout(() => setIsAnimating(false), 600 + (projectCards.length * 100));
            }, 50);
        });
    }, []);

    // Safe intersection observer setup
    useEffect(() => {
        if (!projectsRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                try {
                    if (entry?.isIntersecting) {
                        if (setCurrentSection) {
                            setCurrentSection('projects');
                        }
                        if (!hasAnimated && !isLoading) {
                            animateEntry();
                        }
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
    }, [setCurrentSection, hasAnimated, isLoading, animateEntry]);

    // Enhanced filter change handler
    const handleFilterChange = useCallback((newFilter: 'all' | DatabaseProject['category']) => {
        try {
            if (newFilter === filter || isAnimating) return;

            setIsAnimating(true);
            setFilter(newFilter);
            
            // Reset to first page when filter changes
            setPage(1);

            if (gridRef.current) {
                animateFilterChange();
            } else {
                setTimeout(() => setIsAnimating(false), 600);
            }
        } catch (error) {
            console.error('Error handling filter change:', error);
            setIsAnimating(false);
        }
    }, [filter, isAnimating, animateFilterChange, setPage]);

    // Handle pagination page change
    const handlePageChange = useCallback((page: number) => {
        setPage(page);
        
        // Scroll to top of projects section smoothly
        if (projectsRef.current) {
            projectsRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }, [setPage]);

    // Handle refresh with error recovery
    const handleRefresh = useCallback(async () => {
        try {
            await refresh();
        } catch (error) {
            console.error('Error refreshing projects:', error);
        }
    }, [refresh]);

    // Handle retry for failed state
    const handleRetry = useCallback(() => {
        setHasAnimated(false);
        handleRefresh();
    }, [handleRefresh]);

    // Handle project click for modal
    const handleProjectClick = useCallback((project: DatabaseProject) => {
        console.log('🔥 PaginatedProjects - handleProjectClick called with project:', project);
        console.log('🔥 Project title:', project.title);
        console.log('🔥 Project ID:', project.id);
        setSelectedProject(project);
        setIsModalOpen(true);
        console.log('🔥 Modal state updated - isModalOpen should be true');
    }, []);

    // Handle modal close
    const handleCloseModal = useCallback(() => {
        console.log('🔥 Closing project modal');
        setIsModalOpen(false);
        setSelectedProject(null);
    }, []);

    // Error boundary fallback with animations
    if (dataError) {
        return (
            <section className="projects projects--error" aria-label="Projects section - Error state">
                <div className="projects__container">
                    <div className="projects__error">
                        <div className="projects__error-icon">
                            <span role="img" aria-label="Error">❌</span>
                        </div>
                        <h2>Unable to Load Projects</h2>
                        <p>We're experiencing technical difficulties loading our project portfolio.</p>
                        <p className="projects__error-details">Error: {dataError}</p>
                        <div className="projects__error-actions">
                            <button
                                onClick={handleRetry}
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
                <div ref={headerRef} className="projects__header" style={{ opacity: hasAnimated ? 1 : 0 }}>
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
                        <span className="projects__realtime-indicator" aria-label="Live data">
                            <span className="projects__pulse"></span>
                        </span>
                        <span className="projects__realtime-text">Live updates enabled</span>
                    </div>
                    
                    {/* Pagination info */}
                    {showPagination && pagination.totalItems > 0 && (
                        <div className="projects__pagination-info">
                            <span className="projects__total-count">
                                {pagination.totalItems} {pagination.totalItems === 1 ? 'project' : 'projects'} found
                            </span>
                        </div>
                    )}
                </div>

                {!showFeaturedOnly && categories.length > 1 && (
                    <div ref={filtersRef} className="projects__filters" style={{ opacity: hasAnimated ? 1 : 0 }}>
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

                {/* Loading state */}
                {isLoading && projects.length === 0 ? (
                    <div className="projects__loading">
                        <div className="projects__skeleton-container">
                            {Array.from({ length: itemsPerPage }, (_, index) => (
                                <div key={`skeleton-${index}`} className="projects__skeleton-card">
                                    <div className="projects__skeleton-image"></div>
                                    <div className="projects__skeleton-content">
                                        <div className="projects__skeleton-title"></div>
                                        <div className="projects__skeleton-description"></div>
                                        <div className="projects__skeleton-description projects__skeleton-description--short"></div>
                                        <div className="projects__skeleton-tech">
                                            <div className="projects__skeleton-tag"></div>
                                            <div className="projects__skeleton-tag"></div>
                                            <div className="projects__skeleton-tag"></div>
                                        </div>
                                        <div className="projects__skeleton-meta">
                                            <div className="projects__skeleton-badge"></div>
                                            <div className="projects__skeleton-year"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="projects__loading-text">Loading projects from database...</p>
                    </div>
                ) : (
                    <div ref={gridRef} className="projects__grid-container" style={{ opacity: hasAnimated ? 1 : 0 }}>
                        <div className="projects__grid">
                            {projects.length > 0 ? (
                                projects.map((project, index) => (
                                    <EnhancedProjectCard
                                        key={`${project.id}-${filter}-${pagination.currentPage}-${index}`}
                                        project={project}
                                        observeImage={observeImage}
                                        index={index}
                                        isFilteringIn={isAnimating}
                                        onClick={handleProjectClick}
                                    />
                                ))
                            ) : (
                                <div className="projects__empty">
                                    <div className="projects__empty-icon">
                                        <span role="img" aria-label="No projects">📁</span>
                                    </div>
                                    <h3 className="projects__empty-title">
                                        {filter === 'all' 
                                            ? 'No Projects Available' 
                                            : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Projects`}
                                    </h3>
                                    <p className="projects__empty-message">
                                        {filter === 'all'
                                            ? 'We\'re currently working on exciting new projects. Check back soon!'
                                            : `We haven't completed any ${filter} projects yet, but we're always exploring new opportunities.`
                                        }
                                    </p>
                                    <div className="projects__empty-actions">
                                        {filter !== 'all' && (
                                            <button
                                                onClick={() => handleFilterChange('all')}
                                                className="projects__show-all-button"
                                            >
                                                View All Projects
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
                                </div>
                            )}
                        </div>
                        
                        {/* Pagination */}
                        {showPagination && pagination.totalPages > 1 && (
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                itemsPerPage={pagination.itemsPerPage}
                                totalItems={pagination.totalItems}
                                onPageChange={handlePageChange}
                                isLoading={isLoading}
                                showInfo={true}
                                className="projects__pagination"
                            />
                        )}
                    </div>
                )}

                {/* Show loading overlay during refresh */}
                {isLoading && projects.length > 0 && (
                    <div className="projects__refresh-overlay">
                        <div className="projects__refresh-indicator">
                            <div className="projects__spinner projects__spinner--small"></div>
                            <span>Updating...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Project Details Modal */}
            <ProjectDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                project={selectedProject}
            />
        </section>
    );
};

// Reuse the existing EnhancedProjectCard component logic
interface EnhancedProjectCardProps {
    project: DatabaseProject;
    observeImage?: (img: HTMLImageElement) => void;
    index: number;
    isFilteringIn: boolean;
    onClick?: (project: DatabaseProject) => void;
}

const EnhancedProjectCard: React.FC<EnhancedProjectCardProps> = ({
    project,
    observeImage,
    index,
    isFilteringIn,
    onClick
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageRetryCount, setImageRetryCount] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

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

        // Animate image appearance
        if (imgRef.current) {
            imgRef.current.animate([
                { opacity: 0, transform: 'scale(1.1)' },
                { opacity: 1, transform: 'scale(1)' }
            ], {
                duration: 600,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fill: 'both'
            });
        }
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

    // Card hover animations
    const handleMouseEnter = useCallback(() => {
        if (!cardRef.current) return;
        
        setIsHovered(true);
        cardRef.current.animate([
            { transform: 'translateY(0) scale(1)' },
            { transform: 'translateY(-12px) scale(1.02)' }
        ], {
            duration: 300,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fill: 'both'
        });
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (!cardRef.current) return;
        
        setIsHovered(false);
        cardRef.current.animate([
            { transform: 'translateY(-12px) scale(1.02)' },
            { transform: 'translateY(0) scale(1)' }
        ], {
            duration: 300,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fill: 'both'
        });
    }, []);

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

            return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:${encodeURIComponent(categoryColor)};stop-opacity:0.1'/%3E%3Cstop offset='100%25' style='stop-color:${encodeURIComponent(categoryColor)};stop-opacity:0.05'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='250' fill='url(%23grad)' rx='12'/%3E%3Crect x='50' y='75' width='300' height='100' fill='${encodeURIComponent(categoryColor)}' opacity='0.1' rx='8'/%3E%3Ctext x='200' y='115' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='16' font-weight='600' fill='${encodeURIComponent(categoryColor)}'%3E${encodedTitle}%3C/text%3E%3Ctext x='200' y='140' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='12' fill='%236B7280'%3E${encodedCategory} Project%3C/text%3E%3Ctext x='200' y='190' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='10' fill='%239CA3AF'%3EViews: ${project.view_count || 0}%3C/text%3E%3C/svg%3E`;
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
            ref={cardRef}
            className={`projects__card ${isFilteringIn ? 'projects__card--filtering-in' : ''}`}
            style={{ animationDelay: `${Math.max(0, index * 0.1)}s` }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="projects__card-image">
                {(() => {
                    const projectFolderName = getProjectFolderName(project.title);
                    const hasAssets = hasProjectAssets(project.title);
                    
                    if (hasAssets && projectFolderName) {
                        return (
                            <ResponsiveImage
                                projectName={projectFolderName}
                                imageIndex={0}
                                category={project.category}
                                useLazyLoading={true}
                                alt={project.image_alt || `${project.title} - ${project.category} game project screenshot`}
                                className="projects__image"
                                onLoadComplete={handleImageLoad}
                                onError={handleImageError}
                            />
                        );
                    } else {
                        // Fallback to database image or generated fallback
                        return (
                            <>
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
                            </>
                        );
                    }
                })()}

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

                {/* Compact project details with icons */}
                <div className="projects__details-grid">
                    {project.client_name && (
                        <div className="projects__detail-item">
                            <span className="projects__detail-icon" title="Client">🏢</span>
                            <span className="projects__detail-text">{project.client_name}</span>
                        </div>
                    )}
                    {project.team_size && (
                        <div className="projects__detail-item">
                            <span className="projects__detail-icon" title="Team Size">👥</span>
                            <span className="projects__detail-text">{project.team_size} devs</span>
                        </div>
                    )}
                    {project.duration_months && (
                        <div className="projects__detail-item">
                            <span className="projects__detail-icon" title="Duration">⏱️</span>
                            <span className="projects__detail-text">{project.duration_months}mo</span>
                        </div>
                    )}
                </div>

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
                    <div className="projects__meta-item">
                        <span className="projects__meta-icon">
                            {project.category === 'mobile' && '📱'}
                            {project.category === 'pc' && '💻'}
                            {project.category === 'console' && '🎮'}
                            {project.category === 'vr' && '🥽'}
                            {project.category === 'ar' && '👓'}
                        </span>
                        <span className="projects__category">{project.category}</span>
                    </div>
                    <div className="projects__meta-item">
                        <span className="projects__meta-icon">📅</span>
                        <time className="projects__year" dateTime={project.year.toString()}>
                            {project.year}
                        </time>
                    </div>
                    <div className="projects__meta-item projects__meta-item--updated" title={`Last updated: ${new Date(project.updated_at).toLocaleDateString()}`}>
                        <span className="projects__meta-icon">🔄</span>
                        <span className="projects__updated-short">
                            {new Date(project.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default PaginatedProjects;