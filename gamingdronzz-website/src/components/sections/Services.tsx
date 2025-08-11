import React, { useEffect, useRef, useState } from 'react';
import { useContentManager } from '../../hooks/useContentManager';
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
    const servicesRef = useRef<HTMLElement>(null);
    const { setCurrentSection } = useContentManager();
    const [filter, setFilter] = useState<'all' | ServiceData['category']>('all');

    const services = showFeaturedOnly
        ? getFeaturedServices()
        : servicesData;

    const filteredServices = filter === 'all'
        ? services
        : services.filter(s => s.category === filter);

    const displayServices = maxServices
        ? filteredServices.slice(0, maxServices)
        : filteredServices;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setCurrentSection('services');
                }
            },
            { threshold: 0.3 }
        );

        if (servicesRef.current) {
            observer.observe(servicesRef.current);
        }

        return () => observer.disconnect();
    }, [setCurrentSection]);

    const categories: Array<'all' | ServiceData['category']> = [
        'all', 'development', 'consulting', 'optimization', 'design'
    ];

    return (
        <section
            ref={servicesRef}
            id="services"
            className="services"
            aria-label="Services section"
        >
            <div className="services__container">
                <div className="services__header">
                    <h2 className="services__title">Our Services</h2>
                    <p className="services__subtitle">
                        Comprehensive game development solutions for your project needs
                    </p>
                </div>

                {!showFeaturedOnly && (
                    <div className="services__filters">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`services__filter ${filter === category ? 'services__filter--active' : ''}`}
                                onClick={() => setFilter(category)}
                            >
                                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                            </button>
                        ))}
                    </div>
                )}

                <div className="services__grid">
                    {displayServices.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            </div>
        </section>
    );
};

interface ServiceCardProps {
    service: ServiceData;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
    const handleContactClick = (): void => {
        const contactSection = document.getElementById('contact');
        contactSection?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className={`services__card ${service.featured ? 'services__card--featured' : ''}`}>
            <div className="services__card-header">
                <div className="services__icon">{service.icon}</div>
                <h3 className="services__card-title">{service.title}</h3>
            </div>

            <p className="services__card-description">{service.description}</p>

            <div className="services__features">
                <h4 className="services__features-title">What's included:</h4>
                <ul className="services__features-list">
                    {service.features.map((feature, index) => (
                        <li key={index} className="services__feature">
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="services__card-footer">
                <div className="services__meta">
                    <span className="services__category">{service.category}</span>
                    <span className="services__pricing">{service.pricing.replace('-', ' ')}</span>
                </div>

                <button
                    className="services__cta"
                    onClick={handleContactClick}
                    aria-label={`Get a quote for ${service.title}`}
                >
                    Get Quote
                </button>
            </div>
        </div>
    );
};

export default Services;