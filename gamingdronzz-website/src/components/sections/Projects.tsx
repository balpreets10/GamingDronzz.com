import React, { useEffect, useRef, useState } from 'react';
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

    const projects = showFeaturedOnly
        ? getFeaturedProjects()
        : projectsData;

    const filteredProjects = filter === 'all'
        ? projects
        : projects.filter(p => p.category === filter);

    const displayProjects = maxProjects
        ? filteredProjects.slice(0, maxProjects)
        : filteredProjects;

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

    const categories: Array<'all' | ProjectData['category']> = [
        'all', 'mobile', 'pc', 'console', 'vr', 'ar'
    ];

    return (
        <section
            ref={projectsRef}
            id="projects"
            className="projects"
            aria-label="Projects section"
        >
            <div className="projects__container">
                <div className="projects__header">
                    <h2 className="projects__title">Our Projects</h2>
                    <p className="projects__subtitle">
                        Showcasing our latest game development work
                    </p>
                </div>

                {!showFeaturedOnly && (
                    <div className="projects__filters">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`projects__filter ${filter === category ? 'projects__filter--active' : ''}`}
                                onClick={() => setFilter(category)}
                            >
                                {category === 'all' ? 'All' : category.toUpperCase()}
                            </button>
                        ))}
                    </div>
                )}

                <div className="projects__grid">
                    {displayProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            observeImage={observeImage}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

interface ProjectCardProps {
    project: ProjectData;
    observeImage: (img: HTMLImageElement) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, observeImage }) => {
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (imgRef.current) {
            observeImage(imgRef.current);
        }
    }, [observeImage]);

    return (
        <div className="projects__card">
            <div className="projects__card-image">
                <img
                    ref={imgRef}
                    data-src={project.image}
                    alt={project.title}
                    className="projects__image"
                    loading="lazy"
                />
                <div className="projects__card-overlay">
                    <div className="projects__card-actions">
                        {project.link && (
                            <a
                                href={project.link}
                                className="projects__action"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View Project
                            </a>
                        )}
                        {project.caseStudy && (
                            <a
                                href={project.caseStudy}
                                className="projects__action projects__action--secondary"
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
                    <span className={`projects__status projects__status--${project.status}`}>
                        {project.status}
                    </span>
                </div>

                <p className="projects__card-description">{project.description}</p>

                {project.client && (
                    <p className="projects__client">Client: {project.client}</p>
                )}

                <div className="projects__technologies">
                    {project.technologies.map((tech, index) => (
                        <span key={index} className="projects__tech-tag">
                            {tech}
                        </span>
                    ))}
                </div>

                <div className="projects__meta">
                    <span className="projects__category">{project.category}</span>
                    <span className="projects__year">{project.year}</span>
                </div>
            </div>
        </div>
    );
};

export default Projects;