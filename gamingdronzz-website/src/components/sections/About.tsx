import React, { useEffect, useRef, useState } from 'react';
import { useContentManager } from '../../hooks/useContentManager';
import { companyData } from '../../data/company';
import './About.css';

interface AboutProps {
    customData?: typeof companyData;
}

const About: React.FC<AboutProps> = ({ customData }) => {
    const aboutRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const skillsRef = useRef<HTMLDivElement>(null);
    const teamRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [skillsVisible, setSkillsVisible] = useState(false);
    const [teamVisible, setTeamVisible] = useState(false);
    const { setCurrentSection } = useContentManager();
    const data = customData || companyData;

    // Use skills from data
    const skills = data.skills;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setCurrentSection('about');
                    setIsVisible(true);

                    // Add animation classes with staggered timing
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
            },
            { threshold: 0.2 }
        );

        if (aboutRef.current) {
            observer.observe(aboutRef.current);
        }

        return () => observer.disconnect();
    }, [setCurrentSection]);

    // Separate observers for skills and team sections for better performance
    useEffect(() => {
        const skillsObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setSkillsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        const teamObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTeamVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (skillsRef.current) {
            skillsObserver.observe(skillsRef.current);
        }

        if (teamRef.current) {
            teamObserver.observe(teamRef.current);
        }

        return () => {
            skillsObserver.disconnect();
            teamObserver.disconnect();
        };
    }, []);

    // Generate fallback avatar with better contrast
    const generateFallbackAvatar = (name: string): string => {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='60' r='60' fill='%234A90E2'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Inter, Arial, sans-serif' font-size='24' font-weight='600' fill='%23FFFFFF'%3E${initials}%3C/text%3E%3C/svg%3E`;
    };

    // Generate fallback team image
    const generateFallbackImage = (): string => {
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Cdefs%3E%3ClinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234A90E2;stop-opacity:0.1' /%3E%3Cstop offset='100%25' style='stop-color:%237DD3FC;stop-opacity:0.1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='400' fill='url(%23grad1)' rx='24'/%3E%3Cg transform='translate(300,200)'%3E%3Ccircle cx='0' cy='-30' r='40' fill='%234A90E2' opacity='0.3'/%3E%3Crect x='-60' y='10' width='120' height='80' rx='12' fill='%237DD3FC' opacity='0.3'/%3E%3C/g%3E%3Ctext x='50%25' y='85%25' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='18' font-weight='500' fill='%234A90E2'%3EGamingDronzz Team%3C/text%3E%3C/svg%3E`;
    };

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

                        <div className="about__stats" role="group" aria-label="Company statistics">
                            {data.stats.map((stat, index) => (
                                <div
                                    key={index}
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
                    </div>

                    <div className="about__image">
                        <img
                            src="/images/about-hero.jpg"
                            alt="GamingDronzz team working collaboratively on innovative game development projects"
                            loading="lazy"
                            width="600"
                            height="400"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = generateFallbackImage();
                            }}
                        />
                    </div>
                </div>

                {/* Skills Section */}
                <div
                    ref={skillsRef}
                    className={`about__skills ${skillsVisible ? 'about__skills--visible' : ''}`}
                >
                    <h3 className="about__skills-title">Our Expertise</h3>
                    <div className="about__skills-grid" role="grid" aria-label="Technical skills">
                        {skills.map((skill, index) => (
                            <div
                                key={index}
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

                {/* Team Section */}
                <div
                    ref={teamRef}
                    className={`about__team ${teamVisible ? 'about__team--visible' : ''}`}
                >
                    <h3 className="about__team-title">Leadership Team</h3>
                    <div className="about__team-grid" role="group" aria-label="Team members">
                        {data.team.map((member, index) => (
                            <article
                                key={index}
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
                                        src={member.avatar}
                                        alt={`${member.name} - ${member.role}`}
                                        loading="lazy"
                                        width="120"
                                        height="120"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = generateFallbackAvatar(member.name);
                                        }}
                                    />
                                </div>
                                <h4 className="about__member-name">{member.name}</h4>
                                <p className="about__member-role">{member.role}</p>
                                <p className="about__member-bio">{member.bio}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;