import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useContentManager } from '../../hooks/useContentManager';
import { useLazyLoad } from '../../hooks/useLazyLoad';
import { projectsData, ProjectData, getFeaturedProjects } from '../../data/projects';
import './Projects.css';

interface ProjectsProps {
    showFeaturedOnly?: boolean;
    maxProjects?: number;
}

const Projects: React.FC<ProjectsProps> = ({
    showFeaturedOnly = false,
    maxProjects
}) => {
    const projectsRef = useRef<HTMLElement>(null);
    const { setCurrentSection } = useContentManager();
    const { observeImage } = useLazyLoad();
    const [filter, setFilter] = useState<'all' | ProjectData['category']>('all');
    const [isLoading, setIsLoading] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Memoized data to prevent unnecessary recalculations
    const projects = useMemo(() =>
        showFeaturedOnly ? getFeaturedProjects() : projectsData,
        [showFeaturedOnly]
    );

    const filteredProjects = useMemo(() => {
        const filtered = filter === 'all'
            ? projects
            : projects.filter(p => p.category === filter);

        return maxProjects ? filtered.slice(0, maxProjects) : filtered;
    }, [projects, filter, maxProjects]);

    // Available categories based on current projects
    const categories = useMemo((): Array<'all' | ProjectData['category']> => {
        if (showFeaturedOnly) return ['all'];

        const uniqueCategories = ['all' as const, ...new Set(projects.map(p => p.category))];
        return uniqueCategories as Array<'all' | ProjectData['category']>;
    }, [projects, showFeaturedOnly]);

    // Intersection observer for section tracking
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setCurrentSection('projects');
                }
            },
            { threshold: 0.3 }
        );

        if (projectsRef.current) {
            observer.observe(projectsRef.current);
        }

        return () => observer.disconnect();
    }, [setCurrentSection]);

    // Handle filter changes with smooth animation
    const handleFilterChange = useCallback((newFilter: 'all' | ProjectData['category']) => {
        if (newFilter === filter || isAnimating) return;

        setIsAnimating(true);
        setIsLoading(true);

        // Brief loading state for smooth transition
        setTimeout(() => {
            setFilter(newFilter);
            setIsLoading(false);

            // Reset animation state after cards animate in
            setTimeout(() => setIsAnimating(false), 600);
        }, 150);
    }, [filter, isAnimating]);

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
                                key={category}
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
                                    key={`${project.id}-${filter}`}
                                    project={project}
                                    observeImage={observeImage}
                                    index={index}
                                    isFilteringIn={isAnimating}
                                />
                            ))
                        ) : (
                            <div className="projects__empty">
                                <p>No projects found for the selected category.</p>
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
    observeImage: (img: HTMLImageElement) => void;
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

    useEffect(() => {
        if (imgRef.current) {
            observeImage(imgRef.current);
        }
    }, [observeImage]);

    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
        setImageError(false);
    }, []);

    const handleImageError = useCallback(() => {
        setImageError(true);
        setImageLoaded(false);
    }, []);

    // Format status for display
    const getStatusDisplay = (status: string) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'ongoing': return 'In Progress';
            case 'upcoming': return 'Upcoming';
            default: return status;
        }
    };

    return (
        <article
            className={`projects__card ${isFilteringIn ? 'projects__card--filtering-in' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <div className="projects__card-image">
                {!imageLoaded && !imageError && (
                    <div className="projects__image-placeholder">
                        <div className="projects__spinner"></div>
                    </div>
                )}

                <img
                    ref={imgRef}
                    data-src={project.image}
                    alt={`${project.title} - ${project.category} game project`}
                    className={`projects__image ${imageLoaded ? 'projects__image--loaded' : ''}`}
                    loading="lazy"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    style={{
                        opacity: imageLoaded ? 1 : 0,
                        display: imageError ? 'none' : 'block'
                    }}
                />

                {imageError && (
                    <div className="projects__image-fallback">
                        <span>Image not available</span>
                    </div>
                )}

                <div className="projects__card-overlay">
                    <div className="projects__card-actions">
                        {project.link && (
                            <a
                                href={project.link}
                                className="projects__action"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`View ${project.title} project`}
                            >
                                View Project
                            </a>
                        )}
                        {project.caseStudy && (
                            <a
                                href={project.caseStudy}
                                className="projects__action projects__action--secondary"
                                aria-label={`Read ${project.title} case study`}
                            >
                                Case Study
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="projects__card-content">
                <div className="projects__card-header">
                    <h3 className="projects__card-title">{project.title}</h3>
                    <span
                        className={`projects__status projects__status--${project.status}`}
                        aria-label={`Project status: ${getStatusDisplay(project.status)}`}
                    >
                        {getStatusDisplay(project.status)}
                    </span>
                </div>

                <p className="projects__card-description">{project.description}</p>

                {project.client && (
                    <p className="projects__client">
                        <strong>Client:</strong> {project.client}
                    </p>
                )}

                <div className="projects__technologies" role="list" aria-label="Technologies used">
                    {project.technologies.map((tech, techIndex) => (
                        <span
                            key={techIndex}
                            className="projects__tech-tag"
                            role="listitem"
                        >
                            {tech}
                        </span>
                    ))}
                </div>

                <div className="projects__meta">
                    <span
                        className="projects__category"
                        aria-label={`Category: ${project.category}`}
                    >
                        {project.category}
                    </span>
                    <time
                        className="projects__year"
                        dateTime={project.year.toString()}
                        aria-label={`Year: ${project.year}`}
                    >
                        {project.year}
                    </time>
                </div>
            </div>
        </article>
    );
};

export default Projects;