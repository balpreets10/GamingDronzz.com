import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useContentManager } from '../../hooks/useContentManager';
import { StatisticsService, type HeroStatistics } from '../../services/StatisticsService';
import './Hero.css';

interface HeroProps {
    title?: string;
    subtitle?: string;
    description?: string;
    primaryCtaText?: string;
    secondaryCtaText?: string;
    onPrimaryCtaClick?: () => void;
    onSecondaryCtaClick?: () => void;
    showParticles?: boolean;
    showAchievements?: boolean;
    autoScroll?: boolean;
}

interface Achievement {
    number: string;
    label: string;
    icon: string;
    ariaLabel?: string;
}

interface Technology {
    name: string;
    icon: string;
    ariaLabel?: string;
}

interface MousePosition {
    x: number;
    y: number;
}

interface ParticleData {
    id: number;
    delay: number;
    duration: number;
    x: number;
    y: number;
    size: number;
}

const Hero: React.FC<HeroProps> = ({
    title = "Gaming Development Excellence",
    subtitle = "Crafting Next-Generation Gaming Experiences",
    description = "We transform innovative ideas into immersive gaming worlds through cutting-edge technology, creative storytelling, and exceptional user experiences.",
    primaryCtaText = "Start Your Project",
    secondaryCtaText = "View Portfolio",
    onPrimaryCtaClick,
    onSecondaryCtaClick,
    showParticles = true,
    showAchievements = true,
    autoScroll = true
}) => {
    // Refs
    const heroRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const particleSystemRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>();

    // State
    const [isVisible, setIsVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [statistics, setStatistics] = useState<HeroStatistics | null>(null);
    const [statisticsLoading, setStatisticsLoading] = useState(true);

    // Hooks
    const { setCurrentSection } = useContentManager();

    // Load statistics from database
    useEffect(() => {
        const loadStatistics = async () => {
            try {
                setStatisticsLoading(true);
                const stats = await StatisticsService.getHeroStatistics();
                setStatistics(stats);
            } catch (error) {
                console.error('Failed to load statistics:', error);
            } finally {
                setStatisticsLoading(false);
            }
        };

        loadStatistics();
    }, []);

    // Achievement stats for the hero based on real database data
    const achievements: Achievement[] = useMemo(() => {
        if (!statistics) {
            return [
                {
                    number: "...",
                    label: "Projects",
                    icon: "🎮",
                    ariaLabel: "Loading projects count"
                },
                {
                    number: "...",
                    label: "Articles",
                    icon: "📝",
                    ariaLabel: "Loading articles count"
                },
                {
                    number: "...",
                    label: "Page Views",
                    icon: "👁️",
                    ariaLabel: "Loading page views count"
                },
                {
                    number: "...",
                    label: "Clients",
                    icon: "👥",
                    ariaLabel: "Loading clients count"
                }
            ];
        }

        const formatNumber = (num: number): string => {
            if (num >= 1000000) {
                return `${(num / 1000000).toFixed(1)}M`;
            } else if (num >= 1000) {
                return `${(num / 1000).toFixed(1)}K`;
            }
            return num.toString();
        };

        return [
            {
                number: statistics.projectsCount > 0 ? `${statistics.projectsCount}+` : "0",
                label: "Projects Delivered",
                icon: "🎮",
                ariaLabel: `${statistics.projectsCount} projects delivered`
            },
            {
                number: statistics.articlesCount > 0 ? `${statistics.articlesCount}+` : "0",
                label: "Articles Published",
                icon: "📝",
                ariaLabel: `${statistics.articlesCount} articles published`
            },
            {
                number: statistics.totalViews > 0 ? `${formatNumber(statistics.totalViews)}+` : "0",
                label: "Page Views",
                icon: "👁️",
                ariaLabel: `${statistics.totalViews} page views`
            },
            {
                number: statistics.clientsCount > 0 ? `${statistics.clientsCount}+` : "0",
                label: "Clients Served",
                icon: "👥",
                ariaLabel: `${statistics.clientsCount} clients served`
            }
        ];
    }, [statistics]);

    // Featured technologies
    const technologies: Technology[] = useMemo(() => [
        { name: "Unity", icon: "🔷", ariaLabel: "Unity game engine" },
        { name: "Unreal", icon: "🔶", ariaLabel: "Unreal Engine" },
        { name: "React", icon: "⚛️", ariaLabel: "React framework" },
        { name: "Node.js", icon: "🟢", ariaLabel: "Node.js runtime" },
        { name: "AI/ML", icon: "🧠", ariaLabel: "Artificial Intelligence and Machine Learning" },
        { name: "Cloud", icon: "☁️", ariaLabel: "Cloud technologies" }
    ], []);

    // Today's theme
    const todaysTheme = useMemo(() => {
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        
        const themes = [
            "🎮 Innovation in Gaming",
            "🚀 Future-Ready Development",
            "🌟 Creative Excellence",
            "⚡ Performance & Precision",
            "🎯 Player-Centric Design",
            "🔥 Cutting-Edge Technology",
            "💎 Quality & Craftsmanship",
            "🌈 Immersive Experiences",
            "🎨 Art Meets Technology",
            "🏆 Award-Winning Solutions"
        ];
        
        const selectedTheme = themes[dayOfYear % themes.length];
        const formattedDate = today.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        return {
            theme: selectedTheme,
            date: formattedDate
        };
    }, []);

    // Generate particles data
    const particlesData: ParticleData[] = useMemo(() => {
        if (!showParticles) return [];

        return Array.from({ length: 30 }, (_, i) => ({
            id: i,
            delay: Math.random() * 4,
            duration: 4 + Math.random() * 3,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 2 + Math.random() * 3
        }));
    }, [showParticles]);

    // Check for reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
            setReducedMotion(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Intersection Observer for visibility
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setCurrentSection('hero');
                    setIsVisible(true);

                    // Add animation classes with reduced motion support
                    if (!reducedMotion) {
                        heroRef.current?.classList.add('hero--animate-in');
                        contentRef.current?.classList.add('hero__content--stagger');
                    }
                }
            },
            {
                threshold: 0.3,
                rootMargin: '0px 0px -10% 0px'
            }
        );

        if (heroRef.current) {
            observer.observe(heroRef.current);
        }

        return () => observer.disconnect();
    }, [setCurrentSection, reducedMotion]);

    // Mouse move handler with throttling for performance
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!heroRef.current || reducedMotion) return;

        const rect = heroRef.current.getBoundingClientRect();
        const newPosition = {
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100
        };

        setMousePosition(newPosition);
    }, [reducedMotion]);

    // Throttled mouse move effect
    useEffect(() => {
        if (!heroRef.current || reducedMotion) return;

        let timeoutId: NodeJS.Timeout;

        const throttledMouseMove = (e: MouseEvent) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => handleMouseMove(e), 16); // ~60fps
        };

        const heroElement = heroRef.current;
        heroElement.addEventListener('mousemove', throttledMouseMove);
        heroElement.addEventListener('mouseenter', () => setIsHovered(true));
        heroElement.addEventListener('mouseleave', () => setIsHovered(false));

        return () => {
            heroElement.removeEventListener('mousemove', throttledMouseMove);
            heroElement.removeEventListener('mouseenter', () => setIsHovered(true));
            heroElement.removeEventListener('mouseleave', () => setIsHovered(false));
            clearTimeout(timeoutId);
        };
    }, [handleMouseMove, reducedMotion]);

    // CTA Click Handlers
    const handlePrimaryCtaClick = useCallback((): void => {
        if (onPrimaryCtaClick) {
            onPrimaryCtaClick();
        } else {
            const contactSection = document.getElementById('contact');
            contactSection?.scrollIntoView({
                behavior: reducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
        }
    }, [onPrimaryCtaClick, reducedMotion]);

    const handleSecondaryCtaClick = useCallback((): void => {
        if (onSecondaryCtaClick) {
            onSecondaryCtaClick();
        } else {
            const projectsSection = document.getElementById('projects');
            projectsSection?.scrollIntoView({
                behavior: reducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
        }
    }, [onSecondaryCtaClick, reducedMotion]);

    // Keyboard navigation for accessibility
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();

            if (autoScroll) {
                const aboutSection = document.getElementById('about');
                aboutSection?.scrollIntoView({
                    behavior: reducedMotion ? 'auto' : 'smooth',
                    block: 'start'
                });
            }
        }
    }, [autoScroll, reducedMotion]);

    // Auto-scroll to next section
    const handleScrollIndicatorClick = useCallback(() => {
        const aboutSection = document.getElementById('about');
        aboutSection?.scrollIntoView({
            behavior: reducedMotion ? 'auto' : 'smooth',
            block: 'start'
        });
    }, [reducedMotion]);


    return (
        <section
            ref={heroRef}
            id="hero"
            className="hero"
            aria-label="Hero section - GamingDronzz introduction"
            role="banner"
        >
            {/* Background Effects */}
            <div className="hero__background" aria-hidden="true">
                <div className="hero__gradient-orb hero__gradient-orb--1"></div>
                <div className="hero__gradient-orb hero__gradient-orb--2"></div>
                <div className="hero__gradient-orb hero__gradient-orb--3"></div>
            </div>

            <div className="hero__container">
                <div className="hero__content-wrapper" ref={contentRef}>
                    {/* Main Content */}
                    <div className="hero__main-content">
                        <div className="hero__text-content">
                            {/* Badge */}
                            <div className="hero__badge" role="img" aria-label="Industry leaders badge">
                                <span className="hero__badge-icon" aria-hidden="true">🚀</span>
                                <span className="hero__badge-text">Industry Leaders in Game Development</span>
                            </div>

                            {/* Today's Theme */}
                            <div className="hero__theme-of-day" role="region" aria-label={`Today's theme: ${todaysTheme.theme}`}>
                                <div className="hero__theme-header">
                                    <span className="hero__theme-label">Today's Focus:</span>
                                    <span className="hero__theme-date">{todaysTheme.date}</span>
                                </div>
                                <div className="hero__theme-content">
                                    <span className="hero__theme-text">{todaysTheme.theme}</span>
                                </div>
                            </div>

                            {/* Main Title */}
                            <h1 className="hero__title">
                                <span className="hero__title-line hero__title-line--primary">
                                    {title}
                                </span>
                            </h1>

                            {/* Subtitle */}
                            <h2 className="hero__subtitle">{subtitle}</h2>

                            {/* Description */}
                            <p className="hero__description">{description}</p>

                            {/* CTA Buttons */}
                            <div className="hero__cta-group" role="group" aria-label="Call to action buttons">
                                <button
                                    className="hero__cta hero__cta--primary"
                                    onClick={handlePrimaryCtaClick}
                                    aria-label={`${primaryCtaText} - Navigate to contact section`}
                                    type="button"
                                >
                                    <span className="hero__cta-text">{primaryCtaText}</span>
                                    <span className="hero__cta-icon" aria-hidden="true">→</span>
                                </button>

                                <button
                                    className="hero__cta hero__cta--secondary"
                                    onClick={handleSecondaryCtaClick}
                                    aria-label={`${secondaryCtaText} - Navigate to projects section`}
                                    type="button"
                                >
                                    <span className="hero__cta-text">{secondaryCtaText}</span>
                                    <span className="hero__cta-icon" aria-hidden="true">👁️</span>
                                </button>
                            </div>

                            {/* Technologies */}
                            <div className="hero__technologies" role="region" aria-label="Featured technologies">
                                <span className="hero__tech-label">Technologies:</span>
                                <div className="hero__tech-grid" role="list">
                                    {technologies.map((tech, index) => (
                                        <div
                                            key={`tech-${index}`}
                                            className="hero__tech-item"
                                            role="listitem"
                                            aria-label={tech.ariaLabel || tech.name}
                                        >
                                            <span className="hero__tech-icon" aria-hidden="true">
                                                {tech.icon}
                                            </span>
                                            <span className="hero__tech-name">{tech.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Visual Element */}
                        <div className="hero__visual" aria-label="Game studio dashboard visualization">
                            <div className="hero__visual-card" role="img" aria-label="Code editor interface mockup">
                                <div className="hero__visual-header">
                                    <div className="hero__visual-dots" aria-hidden="true">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <span className="hero__visual-title">Game Studio Dashboard</span>
                                </div>
                                <div className="hero__visual-content">
                                    <div className="hero__code-lines" aria-hidden="true">
                                        <div className="hero__code-line hero__code-line--1"></div>
                                        <div className="hero__code-line hero__code-line--2"></div>
                                        <div className="hero__code-line hero__code-line--3"></div>
                                        <div className="hero__code-line hero__code-line--4"></div>
                                        <div className="hero__code-line hero__code-line--5"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Achievements Section */}
                    {showAchievements && (
                        <div className="hero__achievements" role="region" aria-label="Company achievements">
                            <div className="hero__achievements-grid" role="list">
                                {achievements.map((achievement, index) => (
                                    <div
                                        key={`achievement-${index}`}
                                        className="hero__achievement"
                                        role="listitem"
                                        aria-label={achievement.ariaLabel || `${achievement.number} ${achievement.label}`}
                                    >
                                        <span className="hero__achievement-icon" aria-hidden="true">
                                            {achievement.icon}
                                        </span>
                                        <div className="hero__achievement-content">
                                            <span className="hero__achievement-number" aria-hidden="true">
                                                {achievement.number}
                                            </span>
                                            <span className="hero__achievement-label">
                                                {achievement.label}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced Particle System */}
            {showParticles && !reducedMotion && (
                <div
                    ref={particleSystemRef}
                    className="hero__particles"
                    aria-hidden="true"
                    role="presentation"
                >
                    {particlesData.map((particle) => (
                        <div
                            key={`particle-${particle.id}`}
                            className="hero__particle"
                            style={{
                                '--delay': `${particle.delay}s`,
                                '--duration': `${particle.duration}s`,
                                '--x': `${particle.x}%`,
                                '--y': `${particle.y}%`,
                                '--size': `${particle.size}px`
                            } as React.CSSProperties}
                        />
                    ))}
                </div>
            )}

            {/* Scroll Indicator */}
            {autoScroll && (
                <button
                    className="hero__scroll-indicator"
                    onClick={handleScrollIndicatorClick}
                    onKeyDown={handleKeyDown}
                    aria-label="Scroll to next section"
                    type="button"
                >
                    <div className="hero__scroll-text" aria-hidden="true">Scroll to explore</div>
                    <div className="hero__scroll-arrow" aria-hidden="true">↓</div>
                </button>
            )}
        </section>
    );
};

export default Hero;