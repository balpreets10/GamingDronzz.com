/**
 * Skills Modal System - Detailed skill explanations in gaming-themed modals
 */
class SkillsModal {
    constructor() {
        this.skillsData = {
            1: { // Core Programming
                title: "Core Programming",
                icon: '<i class="fa-solid fa-laptop-code"></i>',
                color: "#38ac5f",
                description: "Foundation of all development work with 8+ years of mastery",
                skills: [
                    {
                        name: "C#",
                        level: 98,
                        description: "Expert-level mastery with deep understanding of language features, async/await patterns, LINQ, generics, delegates, and advanced concepts.",
                        expertise: ["Advanced OOP concepts", "Async/Await patterns", "LINQ optimization", "Memory management", "Reflection & Attributes", "Extension methods"]
                    },
                    {
                        name: "OOP",
                        level: 95,
                        description: "Master of object-oriented principles with practical application in large-scale game development projects.",
                        expertise: ["Inheritance hierarchies", "Polymorphism patterns", "Encapsulation strategies", "Abstraction design", "Interface segregation", "Composition over inheritance"]
                    },
                    {
                        name: "SOLID",
                        level: 92,
                        description: "Deep understanding and consistent application of SOLID principles to create maintainable, scalable game architectures.",
                        expertise: ["Single Responsibility", "Open/Closed principle", "Liskov substitution", "Interface segregation", "Dependency inversion", "Clean architecture"]
                    },
                    {
                        name: "DOD",
                        level: 85,
                        description: "Data-Oriented Design expertise for high-performance game systems, especially in Unity ECS and mobile optimization.",
                        expertise: ["Cache-friendly data layouts", "SoA vs AoS patterns", "Performance profiling", "Unity ECS systems", "Burst compiler optimization", "Job system integration"]
                    },
                    {
                        name: "Performance Optimization",
                        level: 90,
                        description: "Extensive experience optimizing game performance across mobile and desktop platforms with measurable improvements.",
                        expertise: ["CPU profiling", "Memory allocation patterns", "Draw call optimization", "Asset optimization", "Algorithm efficiency", "Platform-specific optimizations"]
                    },
                    {
                        name: "Memory Optimization",
                        level: 88,
                        description: "Advanced memory management techniques to prevent leaks and optimize allocation patterns in Unity games.",
                        expertise: ["Garbage collection patterns", "Object pooling", "Memory profiling", "Addressable assets", "Texture compression", "Audio optimization"]
                    }
                ]
            },
            2: { // Design Patterns
                title: "Design Patterns",
                icon: '<i class="fa-solid fa-code"></i>',
                color: "#ca6296ff",
                description: "Architectural excellence and code structure mastery",
                skills: [
                    {
                        name: "MVC",
                        level: 93,
                        description: "Expert implementation of Model-View-Controller pattern in Unity UI systems and game architecture.",
                        expertise: ["UI architecture", "Data binding", "Event-driven design", "Separation of concerns", "Testable code", "Modular systems"]
                    },
                    {
                        name: "Observer",
                        level: 95,
                        description: "Mastery of observer pattern for game events, UI updates, and loosely-coupled system communication.",
                        expertise: ["Event systems", "Pub/Sub patterns", "Unity Events", "Custom delegates", "Performance considerations", "Memory leak prevention"]
                    },
                    {
                        name: "Factory",
                        level: 90,
                        description: "Factory patterns for flexible object creation, especially for game entities, UI elements, and procedural content.",
                        expertise: ["Abstract factories", "Object pools", "Asset instantiation", "Dependency injection", "Configuration-driven creation", "Runtime flexibility"]
                    },
                    {
                        name: "Dependency Injection",
                        level: 87,
                        description: "Modern DI approaches for testable, modular game systems using tools like Zenject/VContainer.",
                        expertise: ["IoC containers", "Constructor injection", "Service locators", "Zenject/VContainer", "Unit testing", "Modular architecture"]
                    },
                    {
                        name: "Strategy",
                        level: 85,
                        description: "Strategy pattern for AI behaviors, game mechanics, and platform-specific implementations.",
                        expertise: ["AI behavior trees", "Platform abstractions", "Runtime strategy switching", "Configurable behaviors", "A/B testing systems", "Modular gameplay"]
                    },
                    {
                        name: "Refactoring Legacy Code",
                        level: 92,
                        description: "Systematic approach to improving existing codebases while maintaining functionality and team productivity.",
                        expertise: ["Safe refactoring techniques", "Legacy system analysis", "Incremental improvements", "Test-driven refactoring", "Architecture migration", "Team coordination"]
                    }
                ]
            },
            3: { // Multiplayer Systems
                title: "Multiplayer Systems",
                icon: '<i class="fa-solid fa-gamepad"></i>',
                color: "#8ae1f3ff",
                description: "Connecting players across the globe with robust networking",
                skills: [
                    {
                        name: "Photon PUN2/Fusion",
                        level: 88,
                        description: "Advanced Photon networking implementation for real-time multiplayer games with optimized performance.",
                        expertise: ["Room management", "Custom properties", "RPC optimization", "Network culling", "Lag compensation", "Connection handling"]
                    },
                    {
                        name: "Playfab",
                        level: 85,
                        description: "Backend-as-a-Service integration for player data, leaderboards, analytics, and cloud functions.",
                        expertise: ["Player authentication", "Cloud scripts", "Leaderboards", "Virtual economies", "Analytics integration", "A/B testing"]
                    },
                    {
                        name: "Mirror",
                        level: 80,
                        description: "Open-source networking solution implementation for dedicated server architectures.",
                        expertise: ["Server authority", "Client prediction", "Network transforms", "Custom messages", "Security patterns", "Performance optimization"]
                    },
                    {
                        name: "Unity NetCode",
                        level: 78,
                        description: "Modern Unity networking stack with ECS integration for high-performance multiplayer experiences.",
                        expertise: ["Entity replication", "Client-server model", "Prediction systems", "Ghost components", "Transport layers", "Performance profiling"]
                    }
                ]
            },
            4: { // AI Development Tools
                title: "AI Development Tools",
                icon: '<i class="fa-solid fa-robot"></i>',
                color: "#ffff00",
                description: "Agentic AI and Next-gen development acceleration with AI assistance",
                skills: [
                    {
                        name: "Copilot",
                        level: 92,
                        description: "Expert utilization of GitHub Copilot for rapid prototyping, code generation, and productivity enhancement.",
                        expertise: ["Code completion", "Pattern recognition", "Rapid prototyping", "Documentation generation", "Test case creation", "Refactoring assistance"]
                    },
                    {
                        name: "Claude",
                        level: 95,
                        description: "Advanced prompt engineering and AI collaboration for complex problem-solving and architecture decisions.",
                        expertise: ["Prompt engineering", "System design", "Code review", "Architecture planning", "Technical documentation", "Problem decomposition"]
                    },
                    {
                        name: "Cursor",
                        level: 85,
                        description: "AI-powered IDE for enhanced development workflow and intelligent code assistance.",
                        expertise: ["Context-aware editing", "Codebase understanding", "Automated refactoring", "Smart completions", "Project navigation", "Bug detection"]
                    },
                    {
                        name: "DeepSeek",
                        level: 82,
                        description: "Specialized AI models for technical problem-solving and code optimization.",
                        expertise: ["Code analysis", "Performance optimization", "Algorithm suggestions", "Technical research", "Pattern matching", "Debugging assistance"]
                    }
                ]
            },
            5: { // DevOps & Pipeline
                title: "DevOps & Pipeline",
                icon: '<i class="fa-solid fa-gears"></i>',
                color: "#ef8438ff",
                description: "Streamlined development workflows and automation",
                skills: [
                    {
                        name: "Git",
                        level: 90,
                        description: "Advanced Git workflows for team collaboration, including complex merge strategies and repository management.",
                        expertise: ["Branching strategies", "Merge conflict resolution", "Git LFS for large assets", "Submodules", "Custom workflows", "History management"]
                    },
                    {
                        name: "Sourcetree",
                        level: 85,
                        description: "Visual Git management for team coordination and complex repository operations.",
                        expertise: ["Visual merging", "Branch visualization", "Team coordination", "Asset management", "Conflict resolution", "Repository organization"]
                    },
                    {
                        name: "CI/CD Pipelines",
                        level: 83,
                        description: "Automated build, test, and deployment pipelines for Unity projects across multiple platforms.",
                        expertise: ["Build automation", "Multi-platform deployment", "Test automation", "Asset validation", "Performance monitoring", "Release management"]
                    },
                    {
                        name: "Github Actions",
                        level: 80,
                        description: "Custom workflow automation for Unity builds, testing, and deployment processes.",
                        expertise: ["Workflow design", "Unity Cloud Build", "Automated testing", "Asset processing", "Deployment automation", "Notification systems"]
                    }
                ]
            },
            6: { // Team Leadership
                title: "Team Leadership",
                icon: '<i class="fa-solid fa-people-group"></i>',
                color: "#a565d9ff",
                description: "Guiding teams to victory through effective leadership",
                skills: [
                    {
                        name: "Team Management",
                        level: 94,
                        description: "Leading development teams of 5-12 developers across multiple projects with focus on growth and productivity.",
                        expertise: ["Performance management", "Career development", "Conflict resolution", "Resource allocation", "Goal setting", "Team building"]
                    },
                    {
                        name: "Mentorship",
                        level: 92,
                        description: "Developing junior and mid-level developers through structured guidance and knowledge transfer.",
                        expertise: ["Skill assessment", "Learning paths", "Code reviews", "Knowledge sharing", "Career guidance", "Technical coaching"]
                    },
                    {
                        name: "SCRUM",
                        level: 88,
                        description: "Scrum Master experience with focus on iterative development and continuous improvement.",
                        expertise: ["Sprint planning", "Daily standups", "Retrospectives", "Backlog management", "Velocity tracking", "Process improvement"]
                    },
                    {
                        name: "AGILE",
                        level: 90,
                        description: "Agile methodology implementation across game development projects with adaptive planning.",
                        expertise: ["Agile principles", "Iterative development", "User stories", "Acceptance criteria", "Risk management", "Stakeholder communication"]
                    },
                    {
                        name: "JIRA",
                        level: 85,
                        description: "Advanced JIRA administration and workflow optimization for game development teams.",
                        expertise: ["Workflow design", "Custom fields", "Reporting dashboards", "Integration setup", "Permission schemes", "Automation rules"]
                    },
                    {
                        name: "Collaboration",
                        level: 95,
                        description: "Cross-functional collaboration with art, design, QA, and business teams to deliver successful products.",
                        expertise: ["Cross-team communication", "Stakeholder management", "Technical translation", "Conflict mediation", "Process alignment", "Knowledge bridging"]
                    }
                ]
            }
        };
    }

    /**
     * Initialize the skills modal system
     */
    // initialize() {
    //     this.addClickHandlers();
    //     console.log('Skills Modal system initialized');
    // }

    /**
     * Add click handlers to skill categories
     */
    // addClickHandlers() {
    //     document.querySelectorAll('.skill-category').forEach(category => {
    //         category.addEventListener('click', (e) => {
    //             e.preventDefault();
    //             const categoryId = parseInt(category.getAttribute('data-category-id'));
    //             this.showSkillModal(categoryId);
    //         });
    //     });
    // }

    /**
     * Show modal for specific skill category
     */
    showSkillModal(categoryId) {
        const categoryData = this.skillsData[categoryId];
        if (!categoryData) return;

        const modalContent = this.generateModalContent(categoryData);

        const modalId = window.modalManager.createModal({
            title: categoryData.title, // Remove icon from title
            content: modalContent,
            size: 'md',
            className: 'skills-modal',
            closeOnBackdrop: true,
            onShow: (id) => {
                // Add icon to title after modal is created
                const titleElement = document.querySelector(`#${id}-title`);
                if (titleElement) {
                    titleElement.innerHTML = `${categoryData.icon} ${categoryData.title}`;
                }
                setTimeout(() => this.initializeSkillAnimations(id), 300);
            }
        });

        return modalId;
    }

    /**
     * Generate complete modal content HTML
     */
    generateModalContent(categoryData) {
        const skillsHtml = categoryData.skills.map((skill, index) =>
            this.generateSkillCard(skill, index, categoryData.color)
        ).join('');

        return `
            <div class="skills-modal-content">
                <div class="modal-category-header">
                    <div class="category-badge" style="--badge-color: ${categoryData.color}">
                        <span class="badge-icon">${categoryData.icon}</span>
                    </div>
                    <div class="category-summary">
                        <p class="category-description">${categoryData.description}</p>
                        <div class="skills-count">
                            <span class="count-number">${categoryData.skills.length}</span>
                            <span class="count-label">Skills Mastered</span>
                        </div>
                    </div>
                </div>
                
                <div class="skills-grid">
                    ${skillsHtml}
                </div>
                
              
            </div>
        `;
    }

    /**
     * Generate individual skill card HTML
     */
    generateSkillCard(skill, index, categoryColor) {
        const expertiseList = skill.expertise.slice(0, 6).map(item =>
            `<li class="expertise-item">${item}</li>`
        ).join('');

        const moreExpertise = skill.expertise.length > 6 ?
            `<li class="expertise-more">+${skill.expertise.length - 4} more...</li>` : '';

        return `
            <div class="skill-card gaming-hover-effect" style="animation-delay: ${index * 0.1}s">
                <div class="skill-header">
                    <div class="skill-name-section">
                        <h4 class="skill-name">${skill.name}</h4>
                      
                    </div>
                    <div class="skill-progress-ring" style="--progress: ${skill.level}; --ring-color: ${categoryColor}">
                        <div class="progress-center">
                            <span class="progress-text">${skill.level}</span>
                        </div>
                    </div>
                </div>
                
                <div class="skill-body">
                    <p class="skill-description">${skill.description}</p>
                    
                    <div class="expertise-section">
                        <h5 class="expertise-title">Key Expertise</h5>
                        <ul class="expertise-list">
                            ${expertiseList}
                            ${moreExpertise}
                        </ul>
                    </div>
                </div>
                
             
                
                <div class="card-glow-effect"></div>
            </div>
        `;
    }

    /**
     * Initialize animations after modal is shown
     */
    initializeSkillAnimations(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Animate skill cards
        const skillCards = modal.querySelectorAll('.skill-card');
        skillCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animated');
            }, index * 100);
        });

        // Animate progress rings
        const progressRings = modal.querySelectorAll('.skill-progress-ring');
        progressRings.forEach((ring, index) => {
            setTimeout(() => {
                ring.classList.add('animate-progress');
            }, 500 + (index * 150));
        });

        // Animate mastery bars
        const masteryBars = modal.querySelectorAll('.mastery-fill');
        masteryBars.forEach((bar, index) => {
            setTimeout(() => {
                bar.style.transform = 'scaleX(1)';
            }, 800 + (index * 100));
        });
    }

    /**
     * Update skills data (for future dynamic updates)
     */
    updateSkillsData(categoryId, newData) {
        if (this.skillsData[categoryId]) {
            this.skillsData[categoryId] = { ...this.skillsData[categoryId], ...newData };
        }
    }

    /**
     * Get skills data for external use
     */
    getSkillsData(categoryId = null) {
        return categoryId ? this.skillsData[categoryId] : this.skillsData;
    }
}

// Global instance
window.SkillsModal = SkillsModal;



/*
  <div class="skill-level-badge" style="--skill-color: ${categoryColor}">
                            <span class="level-number">${skill.level}</span>
                            <span class="level-percent">%</span>
                        </div>


   <div class="skill-footer">
                    <div class="mastery-bar">
                        <div class="mastery-fill" style="--mastery-width: ${skill.level}%; --mastery-color: ${categoryColor}"></div>
                    </div>
                    <div class="mastery-label">Mastery Level</div>
                </div>


                */