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

export interface CompanyData {
    title: string;
    subtitle: string;
    story: string;
    mission: string;
    stats: CompanyStat[];
    team: TeamMember[];
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
    team: [
        {
            name: "Alex Chen",
            role: "Lead Game Developer",
            bio: "10+ years in game development with expertise in Unity and Unreal Engine",
            avatar: "/images/team/alex-chen.jpg"
        },
        {
            name: "Sarah Martinez",
            role: "Technical Director",
            bio: "Former AAA studio technical lead specializing in performance optimization",
            avatar: "/images/team/sarah-martinez.jpg"
        },
        {
            name: "David Kim",
            role: "Creative Director",
            bio: "Award-winning game designer with focus on innovative gameplay mechanics",
            avatar: "/images/team/david-kim.jpg"
        }
    ]
};