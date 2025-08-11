import React, { useEffect, useRef } from 'react';
import { useContentManager } from '../../hooks/useContentManager';
import { companyData } from '../../data/company';
import './About.css';

interface AboutProps {
    customData?: typeof companyData;
}

const About: React.FC<AboutProps> = ({ customData }) => {
    const aboutRef = useRef<HTMLElement>(null);
    const { setCurrentSection } = useContentManager();
    const data = customData || companyData;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setCurrentSection('about');
                }
            },
            { threshold: 0.3 }
        );

        if (aboutRef.current) {
            observer.observe(aboutRef.current);
        }

        return () => observer.disconnect();
    }, [setCurrentSection]);

    return (
        <section
            ref={aboutRef}
            id="about"
            className="about"
            aria-label="About section"
        >
            <div className="about__container">
                <div className="about__header">
                    <h2 className="about__title">{data.title}</h2>
                    <p className="about__subtitle">{data.subtitle}</p>
                </div>

                <div className="about__content">
                    <div className="about__story">
                        <h3 className="about__story-title">Our Story</h3>
                        <p className="about__story-text">{data.story}</p>
                    </div>

                    <div className="about__mission">
                        <h3 className="about__mission-title">Our Mission</h3>
                        <p className="about__mission-text">{data.mission}</p>
                    </div>
                </div>

                <div className="about__stats">
                    {data.stats.map((stat, index) => (
                        <div key={index} className="about__stat">
                            <div className="about__stat-number">{stat.number}</div>
                            <div className="about__stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="about__team">
                    <h3 className="about__team-title">Leadership Team</h3>
                    <div className="about__team-grid">
                        {data.team.map((member, index) => (
                            <div key={index} className="about__team-member">
                                <div className="about__member-avatar">
                                    <img
                                        src={member.avatar}
                                        alt={member.name}
                                        loading="lazy"
                                    />
                                </div>
                                <h4 className="about__member-name">{member.name}</h4>
                                <p className="about__member-role">{member.role}</p>
                                <p className="about__member-bio">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;