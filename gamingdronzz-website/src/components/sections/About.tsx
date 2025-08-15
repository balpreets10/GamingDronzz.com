import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useContentManager } from '../../hooks/useContentManager';
import { companyData } from '../../data/company';
import './About.css';

interface AboutProps {
    customData?: typeof companyData;
}

// Type guards for data validation
const isValidStat = (stat: any): stat is { number: string; label: string } => {
    return stat &&
        typeof stat === 'object' &&
        typeof stat.number === 'string' &&
        typeof stat.label === 'string';
};

const isValidSkill = (skill: any): skill is { name: string; icon: string } => {
    return skill &&
        typeof skill === 'object' &&
        typeof skill.name === 'string' &&
        typeof skill.icon === 'string';
};

const isValidTeamMember = (member: any): member is {
    name: string;
    role: string;
    bio: string;
    avatar: string
} => {
    return member &&
        typeof member === 'object' &&
        typeof member.name === 'string' &&
        typeof member.role === 'string' &&
        typeof member.bio === 'string' &&
        typeof member.avatar === 'string';
};

const About: React.FC<AboutProps> = ({ customData }) => {
    const aboutRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const skillsRef = useRef<HTMLDivElement>(null);
    const teamRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [skillsVisible, setSkillsVisible] = useState(false);
    const [teamVisible, setTeamVisible] = useState(false);
    const [dataError, setDataError] = useState<string | null>(null);

    // Safe hook usage with error handling
    const contentManager = useContentManager();
    const setCurrentSection = contentManager?.setCurrentSection;

    // Validate and safely access data
    const data = useMemo(() => {
        try {
            const sourceData = customData || companyData;

            // Validate required data structure
            if (!sourceData || typeof sourceData !== 'object') {
                throw new Error('Invalid data structure provided');
            }

            // Provide safe defaults for missing properties
            return {
                title: sourceData.title || 'About Us',
                subtitle: sourceData.subtitle || 'Learn more about our company',
                story: sourceData.story || 'Our story goes here...',
                mission: sourceData.mission || 'Our mission statement...',
                stats: Array.isArray(sourceData.stats)
                    ? sourceData.stats.filter(isValidStat)
                    : [],
                skills: Array.isArray(sourceData.skills)
                    ? sourceData.skills.filter(isValidSkill)
                    : [],
                team: Array.isArray(sourceData.team)
                    ? sourceData.team.filter(isValidTeamMember)
                    : []
            };
        } catch (error) {
            console.error('Data validation error in About component:', error);
            setDataError('Failed to load component data');

            // Return minimal safe data
            return {
                title: 'About Us',
                subtitle: 'Learn more about our company',
                story: 'Content temporarily unavailable.',
                mission: 'Loading...',
                stats: [],
                skills: [],
                team: []
            };
        }
    }, [customData]);

    // Safe intersection observer setup
    useEffect(() => {
        if (!aboutRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                try {
                    if (entry?.isIntersecting) {
                        if (setCurrentSection) {
                            setCurrentSection('about');
                        }
                        setIsVisible(true);

                        // Safe DOM operations with null checks
                        setTimeout(() => {
                            if (aboutRef.current) {
                                aboutRef.current.classList.add('about--animate-in');
                            }
                        }, 100);

                        setTimeout(() => {
                            if (contentRef.current) {
                                contentRef.current.classList.add('about__content--stagger');
                            }
                        }, 300);
                    }
                } catch (error) {
                    console.error('Error in about section intersection observer:', error);
                }
            },
            { threshold: 0.2 }
        );

        try {
            observer.observe(aboutRef.current);
        } catch (error) {
            console.error('Failed to observe about section:', error);
        }

        return () => {
            try {
                observer.disconnect();
            } catch (error) {
                console.error('Error disconnecting about observer:', error);
            }
        };
    }, [setCurrentSection]);

    // Safe skills and team observers
    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        try {
            if (skillsRef.current) {
                const skillsObserver = new IntersectionObserver(
                    ([entry]) => {
                        try {
                            if (entry?.isIntersecting) {
                                setSkillsVisible(true);
                            }
                        } catch (error) {
                            console.error('Error in skills observer:', error);
                        }
                    },
                    { threshold: 0.3 }
                );

                skillsObserver.observe(skillsRef.current);
                observers.push(skillsObserver);
            }

            if (teamRef.current) {
                const teamObserver = new IntersectionObserver(
                    ([entry]) => {
                        try {
                            if (entry?.isIntersecting) {
                                setTeamVisible(true);
                            }
                        } catch (error) {
                            console.error('Error in team observer:', error);
                        }
                    },
                    { threshold: 0.3 }
                );

                teamObserver.observe(teamRef.current);
                observers.push(teamObserver);
            }
        } catch (error) {
            console.error('Error setting up section observers:', error);
        }

        return () => {
            observers.forEach(observer => {
                try {
                    observer.disconnect();
                } catch (error) {
                    console.error('Error disconnecting observer:', error);
                }
            });
        };
    }, []);

    // Enhanced fallback avatar generation with error handling
    const generateFallbackAvatar = useCallback((name: string): string => {
        try {
            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                return generateDefaultAvatar();
            }

            const cleanName = name.trim();
            const nameParts = cleanName.split(' ').filter(part => part.length > 0);
            const initials = nameParts
                .slice(0, 2) // Take max 2 initials
                .map(part => part[0])
                .join('')
                .toUpperCase();

            if (initials.length === 0) {
                return generateDefaultAvatar();
            }

            return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='60' r='60' fill='%234A90E2'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Inter, Arial, sans-serif' font-size='24' font-weight='600' fill='%23FFFFFF'%3E${encodeURIComponent(initials)}%3C/text%3E%3C/svg%3E`;
        } catch (error) {
            console.error('Error generating fallback avatar:', error);
            return generateDefaultAvatar();
        }
    }, []);

    // Default avatar when name is invalid
    const generateDefaultAvatar = useCallback((): string => {
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='60' r='60' fill='%23CBD5E1'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Inter, Arial, sans-serif' font-size='24' font-weight='600' fill='%23FFFFFF'%3E?%3C/text%3E%3C/svg%3E`;
    }, []);

    // Enhanced fallback team image
    const generateFallbackImage = useCallback((): string => {
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Cdefs%3E%3ClinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234A90E2;stop-opacity:0.1' /%3E%3Cstop offset='100%25' style='stop-color:%237DD3FC;stop-opacity:0.1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='400' fill='url(%23grad1)' rx='24'/%3E%3Cg transform='translate(300,200)'%3E%3Ccircle cx='0' cy='-30' r='40' fill='%234A90E2' opacity='0.3'/%3E%3Crect x='-60' y='10' width='120' height='80' rx='12' fill='%237DD3FC' opacity='0.3'/%3E%3C/g%3E%3Ctext x='50%25' y='85%25' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='18' font-weight='500' fill='%234A90E2'%3EGamingDronzz Team%3C/text%3E%3C/svg%3E`;
    }, []);

    // Enhanced image error handler
    const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>, fallbackGenerator: () => string) => {
        try {
            const target = e.currentTarget;
            if (target && !target.hasAttribute('data-fallback-applied')) {
                target.src = fallbackGenerator();
                target.setAttribute('data-fallback-applied', 'true');
            }
        } catch (error) {
            console.error('Error handling image fallback:', error);
        }
    }, []);

    // Error boundary fallback for data errors
    if (dataError) {
        return (
            <section className="about about--error" aria-label="About section - Error state">
                <div className="about__container">
                    <div className="about__error">
                        <h2>Unable to Load Content</h2>
                        <p>We're experiencing technical difficulties. Please try refreshing the page.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="about__retry-button"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            ref={aboutRef}
            id="about"
            className="about"
            aria-label="About GamingDronzz"
        >
            <div className="about__container">
                <div className="about__content" ref={contentRef}>
                    <div className="about__text">
                        <h2 className="about__heading">{data.title}</h2>
                        <p className="about__subheading">{data.subtitle}</p>
                        <p className="about__description">{data.story}</p>

                        <div className="about__mission-section">
                            <h3 className="about__mission-title">Our Mission</h3>
                            <p className="about__mission-text">{data.mission}</p>
                        </div>

                        {data.stats.length > 0 && (
                            <div className="about__stats" role="group" aria-label="Company statistics">
                                {data.stats.map((stat, index) => (
                                    <div
                                        key={`stat-${index}`}
                                        className="about__stat"
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`${stat.number} ${stat.label}`}
                                    >
                                        <span className="about__stat-number" aria-hidden="true">
                                            {stat.number}
                                        </span>
                                        <span className="about__stat-label">{stat.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="about__image">
                        <img
                            // src="/images/about-hero.jpg"
                            alt="GamingDronzz team working collaboratively on innovative game development projects"
                            loading="lazy"
                            width="600"
                            height="400"
                            onError={(e) => handleImageError(e, generateFallbackImage)}
                        />
                    </div>
                </div>

                {/* Skills Section */}
                {data.skills.length > 0 && (
                    <div
                        ref={skillsRef}
                        className={`about__skills ${skillsVisible ? 'about__skills--visible' : ''}`}
                    >
                        <h3 className="about__skills-title">Our Expertise</h3>
                        <div className="about__skills-grid" role="grid" aria-label="Technical skills">
                            {data.skills.map((skill, index) => (
                                <div
                                    key={`skill-${index}-${skill.name}`}
                                    className="about__skill"
                                    tabIndex={0}
                                    role="gridcell"
                                    aria-label={`Skill: ${skill.name}`}
                                    style={{
                                        animationDelay: skillsVisible ? `${index * 100}ms` : '0ms'
                                    }}
                                >
                                    <span
                                        className="about__skill-icon"
                                        aria-hidden="true"
                                        role="img"
                                        aria-label={`${skill.name} icon`}
                                    >
                                        {skill.icon}
                                    </span>
                                    <span className="about__skill-name">{skill.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Team Section */}
                {data.team.length > 0 && (
                    <div
                        ref={teamRef}
                        className={`about__team ${teamVisible ? 'about__team--visible' : ''}`}
                    >
                        <h3 className="about__team-title">Leadership Team</h3>
                        <div className="about__team-grid" role="group" aria-label="Team members">
                            {data.team.map((member, index) => (
                                <article
                                    key={`member-${index}-${member.name}`}
                                    className="about__team-member"
                                    tabIndex={0}
                                    role="article"
                                    aria-label={`Team member: ${member.name}, ${member.role}`}
                                    style={{
                                        animationDelay: teamVisible ? `${index * 150}ms` : '0ms'
                                    }}
                                >
                                    <div className="about__member-avatar">
                                        <img
                                            // src={member.avatar}
                                            alt={`${member.name} - ${member.role}`}
                                            loading="lazy"
                                            width="120"
                                            height="120"
                                            onError={(e) => handleImageError(e, () => generateFallbackAvatar(member.name))}
                                        />
                                    </div>
                                    <h4 className="about__member-name">{member.name}</h4>
                                    <p className="about__member-role">{member.role}</p>
                                    <p className="about__member-bio">{member.bio}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default About;