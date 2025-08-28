export interface ProjectData {
    id: string;
    title: string;
    description: string;
    image: string;
    technologies: string[];
    category: 'mobile' | 'pc' | 'console' | 'vr' | 'ar';
    status: 'completed' | 'ongoing' | 'planning';
    client?: string;
    year: number;
    featured: boolean;
    link?: string;
    caseStudy?: string;
}

export const projectsData: ProjectData[] = [
    {
        id: 'cyber-quest',
        title: 'Cyber Quest',
        description: 'Futuristic RPG with immersive combat system and branching storylines',
        image: '/images/projects/cyber-quest.jpg',
        technologies: ['Unity', 'C#', 'Photon', 'Firebase'],
        category: 'pc',
        status: 'completed',
        client: 'IndieDev Studios',
        year: 2024,
        featured: true,
        link: 'https://store.steampowered.com/cyber-quest',
        caseStudy: '/case-studies/cyber-quest'
    },
    {
        id: 'mobile-runner',
        title: 'Neon Runner',
        description: 'High-speed endless runner with dynamic obstacle generation',
        image: '/images/projects/neon-runner.jpg',
        technologies: ['React Native', 'TypeScript', 'Matter.js'],
        category: 'mobile',
        status: 'completed',
        year: 2024,
        featured: true,
        link: 'https://apps.apple.com/neon-runner'
    },
    {
        id: 'vr-experience',
        title: 'Virtual Worlds VR',
        description: 'Immersive VR experience for education and training',
        image: '/images/projects/vr-worlds.jpg',
        technologies: ['Unreal Engine', 'C++', 'Oculus SDK', 'SteamVR'],
        category: 'vr',
        status: 'ongoing',
        client: 'EduTech Corp',
        year: 2024,
        featured: false
    },
    {
        id: 'puzzle-game',
        title: 'Mind Maze',
        description: 'Challenging puzzle game with procedural level generation',
        image: '/images/projects/mind-maze.jpg',
        technologies: ['Unity', 'C#', 'ProBuilder', 'Analytics'],
        category: 'mobile',
        status: 'completed',
        year: 2023,
        featured: false,
        link: 'https://play.google.com/mind-maze'
    },
    {
        id: 'multiplayer-battle',
        title: 'Arena Champions',
        description: 'Competitive multiplayer battle arena with ranked matchmaking',
        image: '/images/projects/arena-champions.jpg',
        technologies: ['Unreal Engine', 'C++', 'Dedicated Servers', 'AWS'],
        category: 'pc',
        status: 'ongoing',
        year: 2024,
        featured: true
    },
    {
        id: 'ar-shopping',
        title: 'AR Shopping Assistant',
        description: 'Augmented reality app for virtual product placement',
        image: '/images/projects/ar-shopping.jpg',
        technologies: ['ARCore', 'ARKit', 'Unity', 'Machine Learning'],
        category: 'ar',
        status: 'completed',
        client: 'RetailTech Solutions',
        year: 2023,
        featured: false
    }
];

export const getProjectsByCategory = (category: ProjectData['category']): ProjectData[] => {
    return projectsData.filter(project => project.category === category);
};

export const getFeaturedProjects = (): ProjectData[] => {
    return projectsData.filter(project => project.featured);
};

export const getProjectById = (id: string): ProjectData | undefined => {
    return projectsData.find(project => project.id === id);
};