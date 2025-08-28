export interface TeamMember {
    name: string;
    role: string;
    bio: string;
    avatar: string;
}

export interface CompanyStat {
    number: string;
    label: string;
}

export interface Skill {
    name: string;
    icon: string;
}

export interface CompanyData {
    title: string;
    subtitle: string;
    story: string;
    mission: string;
    stats: CompanyStat[];
    team: TeamMember[];
    skills: Skill[];
}

export const companyData: CompanyData = {
    title: "About GamingDronzz",
    subtitle: "Crafting exceptional gaming experiences through innovative development",
    story: "Founded with a passion for creating immersive gaming worlds, GamingDronzz emerged from a team of dedicated developers who understood that great games require more than just code—they require vision, creativity, and technical excellence. Our journey began with a simple belief: every game has the potential to create unforgettable experiences.",
    mission: "To empower game developers and studios with cutting-edge solutions, expert consultation, and innovative technology that transforms creative visions into compelling gaming realities.",
    stats: [
        {
            number: "50+",
            label: "Games Developed"
        },
        {
            number: "5+",
            label: "Years Experience"
        },
        {
            number: "25+",
            label: "Happy Clients"
        },
        {
            number: "100%",
            label: "Project Success Rate"
        }
    ],
    skills: [
        { name: 'Unity', icon: '🎮' },
        { name: 'Unreal Engine', icon: '🚀' },
        { name: 'C#', icon: '💻' },
        { name: 'JavaScript', icon: '⚡' },
        { name: 'Python', icon: '🐍' },
        { name: 'React', icon: '⚛️' },
        { name: 'Node.js', icon: '🟢' },
        { name: 'MongoDB', icon: '🍃' },
        { name: 'Blender', icon: '🎨' },
        { name: 'Photoshop', icon: '🖼️' },
        { name: 'Git', icon: '📝' },
        { name: 'Docker', icon: '🐳' }
    ],
    team: [
        {
            name: "Alex Chen",
            role: "Lead Game Developer",
            bio: "10+ years in game development with expertise in Unity and Unreal Engine. Specialized in creating immersive gameplay experiences and optimizing performance across multiple platforms.",
            avatar: "/images/team/alex-chen.jpg"
        },
        {
            name: "Sarah Martinez",
            role: "Technical Director",
            bio: "Former AAA studio technical lead specializing in performance optimization and scalable game architecture. Expert in graphics programming and engine development.",
            avatar: "/images/team/sarah-martinez.jpg"
        },
        {
            name: "David Kim",
            role: "Creative Director",
            bio: "Award-winning game designer with focus on innovative gameplay mechanics and user experience design. Passionate about creating memorable gaming moments.",
            avatar: "/images/team/david-kim.jpg"
        }
    ]
};