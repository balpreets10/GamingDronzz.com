export interface ServiceData {
    id: string;
    title: string;
    description: string;
    icon: string;
    features: string[];
    pricing: 'consultation' | 'project-based' | 'hourly';
    category: 'development' | 'consulting' | 'optimization' | 'design';
    featured: boolean;
}

export const servicesData: ServiceData[] = [
    {
        id: 'game-development',
        title: 'Full Game Development',
        description: 'End-to-end game development from concept to deployment',
        icon: '🎮',
        features: [
            'Custom game engine development',
            'Cross-platform compatibility',
            'Performance optimization',
            'Quality assurance testing',
            'Post-launch support'
        ],
        pricing: 'project-based',
        category: 'development',
        featured: true
    },
    {
        id: 'technical-consulting',
        title: 'Technical Consulting',
        description: 'Expert guidance on game architecture and technology decisions',
        icon: '💡',
        features: [
            'Technology stack selection',
            'Architecture design review',
            'Performance analysis',
            'Code review and optimization',
            'Team training and mentoring'
        ],
        pricing: 'consultation',
        category: 'consulting',
        featured: true
    },
    {
        id: 'mobile-games',
        title: 'Mobile Game Development',
        description: 'Native and cross-platform mobile gaming solutions',
        icon: '📱',
        features: [
            'iOS and Android development',
            'Unity and React Native expertise',
            'App store optimization',
            'Monetization strategy',
            'Analytics integration'
        ],
        pricing: 'project-based',
        category: 'development',
        featured: true
    },
    {
        id: 'vr-ar-development',
        title: 'VR/AR Development',
        description: 'Immersive virtual and augmented reality experiences',
        icon: '🥽',
        features: [
            'Oculus and SteamVR integration',
            'ARCore and ARKit development',
            'Spatial audio implementation',
            'Hand tracking and gestures',
            'Cross-platform VR support'
        ],
        pricing: 'project-based',
        category: 'development',
        featured: false
    },
    {
        id: 'performance-optimization',
        title: 'Performance Optimization',
        description: 'Enhance game performance and reduce loading times',
        icon: '⚡',
        features: [
            'Frame rate optimization',
            'Memory usage reduction',
            'Asset optimization',
            'Shader optimization',
            'Platform-specific tuning'
        ],
        pricing: 'hourly',
        category: 'optimization',
        featured: false
    },
    {
        id: 'ui-ux-design',
        title: 'Game UI/UX Design',
        description: 'Intuitive and engaging user interface design',
        icon: '🎨',
        features: [
            'User experience research',
            'Interface prototyping',
            'Accessibility compliance',
            'Visual design systems',
            'Usability testing'
        ],
        pricing: 'project-based',
        category: 'design',
        featured: false
    }
];

export const getServicesByCategory = (category: ServiceData['category']): ServiceData[] => {
    return servicesData.filter(service => service.category === category);
};

export const getFeaturedServices = (): ServiceData[] => {
    return servicesData.filter(service => service.featured);
};

export const getServiceById = (id: string): ServiceData | undefined => {
    return servicesData.find(service => service.id === id);
};