import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useContentManager } from '../../hooks/useContentManager';
import { companyData, getCompanyDataAsync, type CompanyData } from '../../data/company';
import './About.css';

interface AboutProps {
    customData?: CompanyData;
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


const About: React.FC<AboutProps> = ({ customData }) => {
    const aboutRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const skillsRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [skillsVisible, setSkillsVisible] = useState(false);
    const [dataError, setDataError] = useState<string | null>(null);
    const [asyncData, setAsyncData] = useState<CompanyData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Safe hook usage with error handling
    const contentManager = useContentManager();
    const setCurrentSection = contentManager?.setCurrentSection;

    // Load async company data
    useEffect(() => {
        const loadCompanyData = async () => {
            try {
                setIsLoading(true);
                const data = await getCompanyDataAsync();
                setAsyncData(data);
                setDataError(null);
            } catch (error) {
                console.error('Failed to load company data:', error);
                setDataError('Failed to load company data');
                // Fallback to sync data
                setAsyncData(companyData);
            } finally {
                setIsLoading(false);
            }
        };

        if (!customData) {
            loadCompanyData();
        } else {
            setAsyncData(customData);
            setIsLoading(false);
        }
    }, [customData]);

    // Validate and safely access data
    const data = useMemo(() => {
        try {
            const sourceData = asyncData || companyData;

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
            };
        }
    }, [asyncData]);

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

    // Safe skills observer
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



    // Loading state
    if (isLoading) {
        return (
            <section className="about about--loading" aria-label="About section - Loading">
                <div className="about__container">
                    <div className="about__loading">
                        <div className="about__spinner"></div>
                        <p>Loading company information...</p>
                    </div>
                </div>
            </section>
        );
    }

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

                        <div className="about__values-section">
                            <h3 className="about__values-title">Our Values</h3>
                            <div className="about__values-grid">
                                <div className="about__value">
                                    <div className="about__value-icon">🎯</div>
                                    <h4>Innovation</h4>
                                    <p>Pushing boundaries with cutting-edge technology and creative solutions</p>
                                </div>
                                <div className="about__value">
                                    <div className="about__value-icon">⚡</div>
                                    <h4>Performance</h4>
                                    <p>Delivering high-quality, optimized experiences that exceed expectations</p>
                                </div>
                                <div className="about__value">
                                    <div className="about__value-icon">🤝</div>
                                    <h4>Collaboration</h4>
                                    <p>Working closely with clients to bring their gaming visions to life</p>
                                </div>
                            </div>
                        </div>

                        <div className="about__approach-section">
                            <h3 className="about__approach-title">Our Approach</h3>
                            <p className="about__approach-text">
                                We combine technical expertise with creative vision to deliver games that not only function flawlessly but also create lasting emotional connections with players. Every project is an opportunity to innovate and push the boundaries of what's possible in interactive entertainment.
                            </p>
                        </div>
                    </div>

                    <div className="about__visual">
                        <div className="about__animated-grid">
                            {Array.from({ length: 24 }, (_, i) => (
                                <div
                                    key={`grid-${i}`}
                                    className="about__grid-item"
                                    style={{
                                        animationDelay: `${i * 50}ms`
                                    }}
                                />
                            ))}
                        </div>
                        <div className="about__floating-shapes">
                            <div className="about__shape about__shape--circle" />
                            <div className="about__shape about__shape--triangle" />
                            <div className="about__shape about__shape--square" />
                            <div className="about__shape about__shape--diamond" />
                        </div>
                        <div className="about__particles">
                            {Array.from({ length: 12 }, (_, i) => (
                                <div
                                    key={`particle-${i}`}
                                    className="about__particle"
                                    style={{
                                        animationDelay: `${i * 200}ms`
                                    }}
                                />
                            ))}
                        </div>
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

            </div>
        </section>
    );
};

export default About;