import React, { useEffect, useState, useMemo } from 'react';
import { useContentManager } from '../../hooks/useContentManager';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { useServicesData, ServiceData } from '../../hooks/useServicesData';
import './Services.css';

interface ServicesProps {
    showFeaturedOnly?: boolean;
    maxServices?: number;
    loadDataOnMount?: boolean;
}

const Services: React.FC<ServicesProps> = ({
    showFeaturedOnly = false,
    maxServices,
    loadDataOnMount = false
}) => {
    const { setCurrentSection } = useContentManager();
    const [filter, setFilter] = useState<'all' | ServiceData['category']>('all');
    const [animateCards, setAnimateCards] = useState(false);

    // Use intersection observer for visibility
    const { elementRef: servicesRef, isIntersecting: isVisible } = useIntersectionObserver({
        threshold: 0.3
    });

    // Initialize services data hook
    const {
        data: servicesResponse,
        loading,
        error,
        loadServices,
        getFeaturedServices,
        getServicesByCategory,
        isReady
    } = useServicesData({
        loadOnMount: loadDataOnMount,
        retryCount: 3,
        retryDelay: 1000
    });

    // Load data when component becomes visible (if not already loaded)
    useEffect(() => {
        if (isVisible && !servicesResponse && !loading) {
            loadServices();
        }
    }, [isVisible, servicesResponse, loading, loadServices]);

    // Set current section and trigger animations
    useEffect(() => {
        if (isVisible) {
            setCurrentSection('services');
            if (isReady) {
                setTimeout(() => setAnimateCards(true), 200);
            }
        }
    }, [isVisible, isReady, setCurrentSection]);

    // Re-trigger animations when data loads or filter changes
    useEffect(() => {
        if (isReady) {
            setAnimateCards(false);
            setTimeout(() => setAnimateCards(true), 100);
        }
    }, [isReady, filter]);

    // Memoized services data based on props and filters
    const { services, categories } = useMemo(() => {
        if (!servicesResponse) {
            return { services: [], categories: [] };
        }

        const baseServices = showFeaturedOnly
            ? getFeaturedServices()
            : servicesResponse.services;

        const filteredServices = filter === 'all'
            ? baseServices
            : getServicesByCategory(filter);

        const displayServices = maxServices
            ? filteredServices.slice(0, maxServices)
            : filteredServices;

        return {
            services: displayServices,
            categories: servicesResponse.categories
        };
    }, [servicesResponse, showFeaturedOnly, filter, maxServices, getFeaturedServices, getServicesByCategory]);

    const handleFilterChange = (category: 'all' | ServiceData['category']) => {
        setFilter(category);
    };

    const handleRetry = () => {
        loadServices();
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

                {/* Error State */}
                {error && (
                    <div className="services__error" role="alert">
                        <div className="services__error-title">Failed to load services</div>
                        <p>{error}</p>
                        <button
                            className="services__error-retry"
                            onClick={handleRetry}
                            type="button"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                            </svg>
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="services__loading">
                        <LoadingSkeleton />
                    </div>
                )}

                {/* Filter Navigation - only show if we have multiple categories and enough services */}
                {isReady && !showFeaturedOnly && services.length > 4 && categories.length > 2 && (
                    <nav className="services__filters" aria-label="Service category filters">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                className={`services__filter ${filter === category.id ? 'services__filter--active' : ''}`}
                                onClick={() => handleFilterChange(category.id as 'all' | ServiceData['category'])}
                                type="button"
                                aria-pressed={filter === category.id}
                            >
                                {category.label}
                                {category.count > 0 && ` (${category.count})`}
                            </button>
                        ))}
                    </nav>
                )}

                {/* Services Grid */}
                {isReady && services.length > 0 && (
                    <div className="services__grid" role="list">
                        {services.map((service, index) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                animate={animateCards}
                                delay={index * 0.1}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {isReady && services.length === 0 && !error && (
                    <div className="services__empty">
                        <p>No services found for the selected category.</p>
                    </div>
                )}

                {/* Process Section - only show on full services page */}
                {isReady && !showFeaturedOnly && servicesResponse?.process && (
                    <ServiceProcess process={servicesResponse.process} />
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
                <div className="services__card-title-group">
                    <h3 className="services__card-title">{service.title}</h3>
                    <div className="services__card-category">
                        {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                    </div>
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
                        {service.pricing}
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

interface ServiceProcessProps {
    process: Array<{
        number: number;
        title: string;
        description: string;
        duration: string;
    }>;
}

const ServiceProcess: React.FC<ServiceProcessProps> = ({ process }) => {
    // Fix: Specify HTMLDivElement as the generic type
    const { elementRef: processRef, isIntersecting: isVisible } = useIntersectionObserver<HTMLDivElement>({
        threshold: 0.2
    });

    return (
        <div
            ref={processRef}
            className={`services__process ${isVisible ? 'services__process--visible' : ''}`}
        >
            <h3 className="services__process-title">Our Process</h3>
            <div className="services__process-steps" role="list">
                {process.map((step, index) => (
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
                        <div className="services__process-step-duration">{step.duration}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LoadingSkeleton: React.FC = () => {
    return (
        <div className="services__skeleton" aria-label="Loading services">
            {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="services__skeleton-card" />
            ))}
        </div>
    );
};

export default Services;