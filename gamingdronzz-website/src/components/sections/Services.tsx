import React, { useEffect, useState } from 'react';
import { useContentManager } from '../../hooks/useContentManager';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { servicesData, ServiceData, getFeaturedServices } from '../../data/services';
import './Services.css';

interface ServicesProps {
    showFeaturedOnly?: boolean;
    maxServices?: number;
}

const Services: React.FC<ServicesProps> = ({
    showFeaturedOnly = false,
    maxServices
}) => {
    const { setCurrentSection } = useContentManager();
    const [filter, setFilter] = useState<'all' | ServiceData['category']>('all');
    const [animateCards, setAnimateCards] = useState(false);

    // Use the hook correctly - it returns elementRef, isIntersecting, hasIntersected
    const { elementRef: servicesRef, isIntersecting: isVisible } = useIntersectionObserver({
        threshold: 0.3
    });

    const services = showFeaturedOnly ? getFeaturedServices() : servicesData;

    const filteredServices = filter === 'all'
        ? services
        : services.filter(s => s.category === filter);

    const displayServices = maxServices
        ? filteredServices.slice(0, maxServices)
        : filteredServices;

    useEffect(() => {
        if (isVisible) {
            setCurrentSection('services');
            // Trigger card animations with a small delay
            setTimeout(() => setAnimateCards(true), 200);
        }
    }, [isVisible, setCurrentSection]);

    const categories: Array<'all' | ServiceData['category']> = [
        'all', 'development', 'consulting', 'optimization', 'design'
    ];

    const handleFilterChange = (category: 'all' | ServiceData['category']) => {
        setFilter(category);
        setAnimateCards(false);
        // Re-trigger animations for new filtered results
        setTimeout(() => setAnimateCards(true), 100);
    };

    return (
        <section
            ref={servicesRef}
            id="services"
            className={`services ${isVisible ? 'services--visible' : ''}`}
            aria-label="Our game development services"
        >
            <div className="services__container">
                <header className="services__header">
                    <h2 className="services__title">Our Services</h2>
                    <p className="services__subtitle">
                        Comprehensive game development solutions tailored to bring your vision to life
                    </p>
                </header>

                {!showFeaturedOnly && displayServices.length > 4 && (
                    <nav className="services__filters" aria-label="Service category filters">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`services__filter ${filter === category ? 'services__filter--active' : ''}`}
                                onClick={() => handleFilterChange(category)}
                                type="button"
                                aria-pressed={filter === category}
                            >
                                {category === 'all' ? 'All Services' : category.charAt(0).toUpperCase() + category.slice(1)}
                            </button>
                        ))}
                    </nav>
                )}

                <div className="services__grid" role="list">
                    {displayServices.map((service, index) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            animate={animateCards}
                            delay={index * 0.1}
                        />
                    ))}
                </div>

                {!showFeaturedOnly && (
                    <ServiceProcess />
                )}
            </div>
        </section>
    );
};

interface ServiceCardProps {
    service: ServiceData;
    animate?: boolean;
    delay?: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, animate = false, delay = 0 }) => {
    const handleContactClick = (): void => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
            // Add focus for accessibility
            const firstInput = contactSection.querySelector('input, textarea, button') as HTMLElement;
            firstInput?.focus();
        }
    };

    const cardStyle = animate ? { animationDelay: `${delay}s` } : {};

    return (
        <div
            className={`services__card ${service.featured ? 'services__card--featured' : ''} ${animate ? 'services__card--animate' : ''}`}
            style={cardStyle}
            role="listitem"
        >
            <div className="services__card-header">
                <div className="services__card-icon" aria-hidden="true">
                    {service.icon}
                </div>
                <h3 className="services__card-title">{service.title}</h3>
                <div className="services__card-category">
                    {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                </div>
            </div>

            <p className="services__card-description">{service.description}</p>

            <div className="services__card-features">
                <h4 className="services__card-features-title">What's included:</h4>
                <ul className="services__card-features-list">
                    {service.features.map((feature, index) => (
                        <li key={index} className="services__card-feature">
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="services__card-footer">
                <div className="services__card-pricing">
                    <span className="services__card-price">
                        {service.pricing.replace('-', ' – ')}
                    </span>
                </div>

                <button
                    className="services__card-cta"
                    onClick={handleContactClick}
                    type="button"
                    aria-label={`Get a quote for ${service.title} service`}
                >
                    <span>Get Quote</span>
                    <svg className="services__card-cta-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1L15 8L8 15M15 8H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

const ServiceProcess: React.FC = () => {
    // Use the hook correctly for the process section too
    const { elementRef: processRef, isIntersecting: isVisible } = useIntersectionObserver({
        threshold: 0.2
    });

    const steps = [
        {
            number: 1,
            title: "Discovery & Planning",
            description: "We analyze your requirements and create a comprehensive development roadmap"
        },
        {
            number: 2,
            title: "Design & Prototyping",
            description: "Create wireframes, mockups, and interactive prototypes for validation"
        },
        {
            number: 3,
            title: "Development & Testing",
            description: "Agile development process with continuous testing and quality assurance"
        },
        {
            number: 4,
            title: "Launch & Support",
            description: "Deployment assistance and ongoing support to ensure your success"
        }
    ];

    return (
        <div
            ref={processRef}
            className={`services__process ${isVisible ? 'services__process--visible' : ''}`}
        >
            <h3 className="services__process-title">Our Process</h3>
            <div className="services__process-steps" role="list">
                {steps.map((step, index) => (
                    <div
                        key={step.number}
                        className={`services__process-step ${isVisible ? 'services__process-step--animate' : ''}`}
                        style={{ animationDelay: `${index * 0.2}s` }}
                        role="listitem"
                    >
                        <div className="services__process-step-number" aria-hidden="true">
                            {step.number}
                        </div>
                        <h4 className="services__process-step-title">{step.title}</h4>
                        <p className="services__process-step-description">{step.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Services;