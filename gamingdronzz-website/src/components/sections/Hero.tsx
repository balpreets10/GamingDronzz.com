import React, { useEffect, useRef } from 'react';
import { useContentManager } from '../../hooks/useContentManager';
import './Hero.css';

interface HeroProps {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    onCtaClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({
    title = "Gaming Development Excellence",
    subtitle = "Transforming ideas into immersive gaming experiences",
    ctaText = "Start Your Project",
    onCtaClick
}) => {
    const heroRef = useRef<HTMLElement>(null);
    const { setCurrentSection } = useContentManager();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setCurrentSection('hero');
                }
            },
            { threshold: 0.5 }
        );

        if (heroRef.current) {
            observer.observe(heroRef.current);
        }

        return () => observer.disconnect();
    }, [setCurrentSection]);

    const handleCtaClick = (): void => {
        if (onCtaClick) {
            onCtaClick();
        } else {
            // Default scroll to contact section
            const contactSection = document.getElementById('contact');
            contactSection?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section
            ref={heroRef}
            id="hero"
            className="hero"
            aria-label="Hero section"
        >
            <div className="hero__container">
                <div className="hero__content">
                    <h1 className="hero__title">
                        {title}
                    </h1>
                    <p className="hero__subtitle">
                        {subtitle}
                    </p>
                    <button
                        className="hero__cta"
                        onClick={handleCtaClick}
                        aria-label={ctaText}
                    >
                        {ctaText}
                    </button>
                </div>

                <div className="hero__animation">
                    <div className="hero__particles">
                        {Array.from({ length: 50 }, (_, i) => (
                            <div
                                key={i}
                                className="hero__particle"
                                style={{
                                    '--delay': `${Math.random() * 2}s`,
                                    '--duration': `${3 + Math.random() * 2}s`
                                } as React.CSSProperties}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;