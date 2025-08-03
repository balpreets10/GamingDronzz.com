/**
 * Optimized Skills Section - Streamlined and compact
 */
class SkillsSection {
    constructor() {
        this.config = {
            title: "Skill Matrix",
            subtitle: "Expertise Unlocked Through 8+ Years of Development",
            unity: {
                title: "Unity Engine Mastery",
                level: "Expert Level • 8+ Years",
                description: "Complete mastery of Unity's ecosystem and advanced development techniques",
                skills: [
                    "Architecture", "Addressables", "Debugger", "Scriptable Objects",
                    "Custom Inspectors", "Memory Profiler", "DoTween", "ECS",
                    "IL2CPP", "NavMesh", "UI Toolkit", "Shader Graphs",
                    "GPU/CPU Profiling", "Cloud Build", "IAP", "URP",
                    "Occlusion Culling", "LOD Groups", "Cinemachine"
                ],
                icon: "ᵁ"
            },
            categories: []
        };
        this.skillsData = [];
        this.isDataLoaded = false;
        this.isMobile = window.innerWidth <= 992;
        this.SkillsModal = null;
    }

    // Load JSON data
    async loadSkillsData() {
        try {
            console.log('Loading skills data from JSON...');
            const response = await fetch('data/skills-data.json');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.config = { ...this.config, ...data };
            this.skillsData = data.categories || [];
            this.isDataLoaded = true;

            console.log(`Loaded skills data from JSON successfully`);
            return true;
        } catch (error) {
            console.error('Error loading skills data:', error);

            // Fallback to default config
            this.skillsData = this.getDefaultCategories();
            this.config.categories = this.skillsData;
            this.isDataLoaded = true;
            return false;
        }
    }

    getDefaultCategories() {
        return [
            {
                id: 1,
                title: "Core Programming",
                icon: '<i class="fa-solid fa-laptop-code"></i>',
                color: "#38ac5f",
                skills: ["C#", "OOP", "SOLID", "DOD", "Performance Optimization", "Memory Optimization"],
                description: "Foundation of all development work"
            },
            {
                id: 2,
                title: "Game Development",
                icon: '<i class="fa-solid fa-gamepad"></i>',
                color: "#00d4ff",
                skills: ["Unity Engine", "Game Design", "Physics", "AI", "Multiplayer", "Mobile Games"],
                description: "Creating immersive gaming experiences"
            }
        ];
    }

    createSectionHeader() {
        const header = document.createElement('div');
        header.className = 'section-header';
        header.setAttribute('data-aos', 'fade-down');

        header.innerHTML = `
            <div class="title-container">
                <h2 class="section-title">
                    <span class="title-icon">⚡</span>
                    ${this.config.title}
                </h2>
            </div>
            <div class="header-divider"></div>
            <p class="section-subtitle">${this.config.subtitle}</p>
        `;

        return header;
    }

    createUnitySpotlight() {
        const unity = this.config.unity;
        const spotlight = document.createElement('div');
        spotlight.className = 'unity-spotlight gaming-hover-effect';
        spotlight.setAttribute('data-aos', 'zoom-in');
        spotlight.setAttribute('data-aos-delay', '150');

        // Simplified skill categorization
        const importantSkills = ["Architecture", "Addressables", "Scriptable Objects", "Shader Graphs"];
        const mediumSkills = ["DoTween", "Memory Profiler", "UI Toolkit", "URP", "Cinemachine"];

        const skillsHtml = unity.skills.map((skill, index) => {
            let sizeClass = 'size-small';
            let extraClasses = '';

            if (importantSkills.includes(skill)) {
                sizeClass = 'size-large';
                extraClasses = 'featured';
            } else if (mediumSkills.includes(skill)) {
                sizeClass = 'size-medium';
            }

            return `<div class="skill-pill ${sizeClass} ${extraClasses} gaming-hover-effect">
                <span>${skill}</span>
            </div>`;
        }).join('');

        spotlight.innerHTML = `
            <div class="spotlight-header">
                <div class="unity-emblem">
                    <div class="emblem-core"><i class="fa-brands fa-unity"></i></div>
                </div>
                <div class="unity-info">
                    <h3 class="unity-title">${unity.title}</h3>
                    <div class="unity-level">${unity.level}</div>
                    <p class="unity-description">${unity.description}</p>
                </div>
            </div>
            
            <div class="unity-skills-cloud">
                ${skillsHtml}
            </div>
        `;

        return spotlight;
    }

    // Create skills categories grid with container wrapper
    createSkillCategories() {
        const gridContainer = document.createElement('div');
        gridContainer.className = 'skills-categories-grid-container';

        const categoriesGrid = document.createElement('div');
        categoriesGrid.className = 'skills-categories-grid';
        categoriesGrid.id = 'skillsCategoriesGrid';

        // Show loading state initially
        if (!this.isDataLoaded) {
            categoriesGrid.innerHTML = `
                <div class="skills-loading">
                    <div class="loading-spinner"></div>
                    <p>Loading skills...</p>
                </div>
            `;
        } else {
            this.renderSkillCategories(categoriesGrid);
        }

        gridContainer.appendChild(categoriesGrid);
        return gridContainer;
    }

    // Render skill categories
    renderSkillCategories(container) {
        container.innerHTML = '';

        if (this.skillsData.length === 0) {
            container.innerHTML = `
                <div class="skills-empty">
                    <p>No skills data available at the moment.</p>
                </div>
            `;
            return;
        }

        this.skillsData.forEach((category, index) => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'skill-category gaming-hover-effect';
            categoryCard.setAttribute('data-aos', 'fade-up');
            categoryCard.setAttribute('data-aos-delay', `${100 + (index * 50)}`);
            categoryCard.setAttribute('data-category-id', category.id);

            categoryCard.innerHTML = `
                <div class="category-header">
                    <div class="category-icon" style="--category-color: ${category.color}">
                        <span class="icon-symbol">${category.icon}</span>
                    </div>
                    <div class="category-info">
                        <h4 class="category-title">${category.title}</h4>
                        <p class="category-description">${category.description}</p>
                    </div>
                </div>
                
                <div class="skills-grid">
                    ${category.skills.map((skill) => `
                        <div class="skill-chip gaming-hover-effect">
                            <span class="skill-name">${skill}</span>
                        </div>
                    `).join('')}
                </div>
            `;

            container.appendChild(categoryCard);

            // Add click handler
            categoryCard.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.SkillsModal) {
                    this.SkillsModal.showSkillModal(category.id);
                }
            });
        });
    }

    // Synchronous render method (SectionManager requirement)
    render() {
        const section = document.createElement('section');
        section.id = 'skills';
        section.className = 'skills-section';

        const container = document.createElement('div');
        container.className = 'container';

        const content = document.createElement('div');
        content.className = 'skills-content';

        content.appendChild(this.createSectionHeader());
        content.appendChild(this.createUnitySpotlight());
        content.appendChild(this.createSkillCategories());

        container.appendChild(content);
        section.appendChild(container);

        return section;
    }

    // Load data and update UI
    async loadDataAndUpdate() {
        const success = await this.loadSkillsData();

        if (success || this.isDataLoaded) {
            // Update the categories grid
            const grid = document.getElementById('skillsCategoriesGrid');
            if (grid) {
                this.renderSkillCategories(grid);

                // Reinitialize interactions
                setTimeout(() => {
                    this.initializeInteractions();
                    this.setupMobileScrollIndicators();
                }, 100);
            }
        } else {
            // Show error state
            const grid = document.getElementById('skillsCategoriesGrid');
            if (grid) {
                grid.innerHTML = `
                    <div class="skills-error">
                        <p>Failed to load skills. Please try refreshing the page.</p>
                    </div>
                `;
            }
        }
    }

    // Initialize method called by SectionManager (async data loading)
    async initialize() {
        console.log('Skills section initializing...');

        // Initialize SkillsModal if available
        if (window.SkillsModal) {
            this.SkillsModal = new window.SkillsModal();
        }

        // Load data and update UI
        await this.loadDataAndUpdate();

        console.log('Skills section initialized successfully');
    }

    initializeInteractions() {
        // Simple hover state management
        document.querySelectorAll('.skill-chip, .skill-pill').forEach(chip => {
            chip.addEventListener('mouseenter', () => {
                chip.classList.add('hovered');
            });

            chip.addEventListener('mouseleave', () => {
                chip.classList.remove('hovered');
            });
        });
    }

    // Mobile scroll indicators and enhanced UX
    setupMobileScrollIndicators() {
        if (window.innerWidth > 992) return;

        const skillsGrid = document.querySelector('.skills-section .skills-categories-grid');
        if (!skillsGrid) return;

        // Add touch enhancement
        this.enhanceTouchScrolling(skillsGrid);
    }

    enhanceTouchScrolling(grid) {
        let startX = 0;
        let scrollLeft = 0;
        let isDown = false;
        let isDragging = false;

        // Mouse events for desktop
        grid.addEventListener('mousedown', (e) => {
            isDown = true;
            isDragging = false;
            grid.classList.add('dragging');
            startX = e.pageX - grid.offsetLeft;
            scrollLeft = grid.scrollLeft;
            e.preventDefault();
        });

        grid.addEventListener('mouseleave', () => {
            isDown = false;
            grid.classList.remove('dragging');
        });

        grid.addEventListener('mouseup', () => {
            isDown = false;
            grid.classList.remove('dragging');

            if (isDragging) {
                setTimeout(() => {
                    isDragging = false;
                }, 50);
            }
        });

        grid.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            isDragging = true;
            const x = e.pageX - grid.offsetLeft;
            const walk = (x - startX) * 2;
            grid.scrollLeft = scrollLeft - walk;
        });

        // Enhanced touch scrolling
        grid.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - grid.offsetLeft;
            scrollLeft = grid.scrollLeft;
            isDragging = false;
        }, { passive: true });

        grid.addEventListener('touchmove', (e) => {
            isDragging = true;
            const x = e.touches[0].pageX - grid.offsetLeft;
            const walk = (x - startX) * 2;
            grid.scrollLeft = scrollLeft - walk;
        }, { passive: true });

        grid.addEventListener('touchend', () => {
            if (isDragging) {
                setTimeout(() => {
                    isDragging = false;
                }, 50);
            }
        }, { passive: true });

        // Prevent click events on cards when dragging/swiping
        grid.addEventListener('click', (e) => {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    }

    async updateSkills(newData) {
        this.config = { ...this.config, ...newData };
        this.isDataLoaded = true;
        const existingSection = document.getElementById('skills');
        if (existingSection) {
            const newSection = await this.render();
            existingSection.parentNode.replaceChild(newSection, existingSection);
            await this.initialize();
        }
    }

    async refreshData() {
        this.isDataLoaded = false;
        this.config = null;
        await this.loadDataAndUpdate();
    }

    cleanup() {
        const skillsSection = document.getElementById('skills');
        if (skillsSection) {
            skillsSection.remove();
        }
    }
}

window.SkillsSection = SkillsSection;