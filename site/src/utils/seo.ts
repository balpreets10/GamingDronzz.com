export interface SEOData {
    title: string;
    description: string;
    keywords?: string[];
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'profile';
    siteName?: string;
}

export interface StructuredData {
    '@context': string;
    '@type': string;
    [key: string]: any;
}

export const updateMetaTags = (seoData: SEOData): void => {
    // Title
    document.title = seoData.title;

    // Description
    updateMetaTag('description', seoData.description);

    // Keywords
    if (seoData.keywords?.length) {
        updateMetaTag('keywords', seoData.keywords.join(', '));
    }

    // Open Graph
    updateMetaTag('og:title', seoData.title);
    updateMetaTag('og:description', seoData.description);
    updateMetaTag('og:type', seoData.type || 'website');
    updateMetaTag('og:site_name', seoData.siteName || 'GamingDronzz');

    if (seoData.image) {
        updateMetaTag('og:image', seoData.image);
    }

    if (seoData.url) {
        updateMetaTag('og:url', seoData.url);
    }

    // Twitter
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', seoData.title);
    updateMetaTag('twitter:description', seoData.description);

    if (seoData.image) {
        updateMetaTag('twitter:image', seoData.image);
    }
};

const updateMetaTag = (name: string, content: string): void => {
    const isProperty = name.startsWith('og:') || name.startsWith('twitter:');
    const attribute = isProperty ? 'property' : 'name';

    let tag = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;

    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
    }

    tag.content = content;
};

export const addStructuredData = (data: StructuredData): void => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
};

export const createOrganizationSchema = (): StructuredData => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GamingDronzz',
    url: 'https://gamingdronzz.com',
    logo: 'https://gamingdronzz.com/logo.png',
    description: 'Expert game development consultancy and services',
    contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-GAMING',
        contactType: 'customer service'
    },
    sameAs: [
        'https://twitter.com/gamingdronzz',
        'https://linkedin.com/company/gamingdronzz'
    ]
});

export const createServiceSchema = (service: any): StructuredData => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: {
        '@type': 'Organization',
        name: 'GamingDronzz'
    },
    serviceType: service.category,
    offers: {
        '@type': 'Offer',
        priceSpecification: {
            '@type': 'PriceSpecification',
            priceCurrency: 'USD',
            valueReference: service.pricing
        }
    }
});

export const createProjectSchema = (project: any): StructuredData => ({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    image: project.image,
    creator: {
        '@type': 'Organization',
        name: 'GamingDronzz'
    },
    datePublished: `${project.year}-01-01`,
    keywords: project.technologies.join(', ')
});

export const generateSEOForSection = (section: string): SEOData => {
    const baseData = {
        siteName: 'GamingDronzz',
        type: 'website' as const,
        url: `https://gamingdronzz.com#${section}`
    };

    switch (section) {
        case 'hero':
            return {
                ...baseData,
                title: 'GamingDronzz - Expert Game Development Services',
                description: 'Transform your gaming ideas into reality with our expert development team. Specializing in mobile, PC, VR/AR games and technical consulting.',
                keywords: ['game development', 'unity', 'unreal engine', 'mobile games', 'VR', 'AR']
            };

        case 'about':
            return {
                ...baseData,
                title: 'About GamingDronzz - Game Development Experts',
                description: 'Learn about our experienced team of game developers, our mission, and our commitment to creating exceptional gaming experiences.',
                keywords: ['game developers', 'team', 'experience', 'mission']
            };

        case 'projects':
            return {
                ...baseData,
                title: 'Our Projects - GamingDronzz Portfolio',
                description: 'Explore our portfolio of successful game development projects including mobile games, PC titles, and VR/AR experiences.',
                keywords: ['game portfolio', 'projects', 'case studies', 'game examples']
            };

        case 'services':
            return {
                ...baseData,
                title: 'Game Development Services - GamingDronzz',
                description: 'Comprehensive game development services including full development, consulting, optimization, and UI/UX design.',
                keywords: ['game development services', 'consulting', 'optimization', 'UI UX design']
            };

        default:
            return {
                ...baseData,
                title: 'GamingDronzz - Professional Game Development',
                description: 'Your trusted partner for professional game development services and consulting.',
                keywords: ['game development', 'gaming', 'professional services']
            };
    }
};