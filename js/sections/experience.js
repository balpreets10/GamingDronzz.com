/**
 * Experience Section - Fixed to match Portfolio pattern
 */
class ExperienceSection {
    constructor() {
        this.config = {
            title: "Professional Journey",
            subtitle: "Building careers through code and creativity"
        };
        this.experienceData = [];
        this.isDataLoaded = false;
        this.isMobile = window.innerWidth <= 768;
    }

    // Load JSON data
    async loadExperienceData() {
        try {
            console.log('Loading experience data from JSON...');
            const response = await fetch('data/experience-data.json');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.config = { ...this.config, ...data };
            this.experienceData = data.experiences || [];
            this.isDataLoaded = true;

            console.log(`Loaded ${this.experienceData.length} experiences from JSON`);
            return true;
        } catch (error) {
            console.error('Error loading experience data:', error);

            // Fallback to default data
            this.experienceData = this.getDefaultExperiences();
            this.config.experiences = this.experienceData;
            this.isDataLoaded = true;
            return false;
        }
    }

    getDefaultExperiences() {
        return [
            {
                id: 1,
                company: "ArdentInfo Solutions",
                position: "Team Lead",
                duration: "2021 - 2025",
                location: "Chandigarh, IND",
                type: "Full-time",
                projects: ["Narrative E-learning Platform", "Mobile Gaming Portfolio", "Unity 3D Projects"],
                achievements: ["Spearheaded technical development", "Mentored teams of 3-4 developers", "Implemented agile methodologies"],
                technologies: ["Unity", "C#", "Phaser.JS", "Node.js"],
                skills: ["Team Leadership", "Project Management", "Technical Architecture"],
                featured: true
            },
            {
                id: 2,
                company: "Previous Company",
                position: "Senior Developer",
                duration: "2019 - 2021",
                location: "Remote",
                type: "Full-time",
                projects: ["Web Platform", "Mobile App"],
                achievements: ["Led development team", "Reduced bugs by 40%"],
                technologies: ["React", "JavaScript", "MongoDB"],
                skills: ["Frontend Development", "Team Collaboration"],
                featured: false
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
                    <span class="title-icon">💼</span>
                    ${this.config.title}
                </h2>
            </div>
            <div class="header-divider"></div>
            <p class="section-subtitle">${this.config.subtitle}</p>
        `;

        return header;
    }

    createExperienceCard(experience, index) {
        const card = document.createElement('div');
        card.className = 'experience-card-col';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', index * 50);

        // Convert projects to badge format like technologies
        const projectBadges = experience.projects.map(project =>
            `<span class="project-badge">${project}</span>`
        ).join('');

        const achievementsList = experience.achievements.map(achievement =>
            `<li class="achievement-item">${achievement}</li>`
        ).join('');

        const techTags = experience.technologies.map(tech =>
            `<span class="tech-badge">${tech}</span>`
        ).join('');

        const skillTags = experience.skills.map(skill =>
            `<span class="skill-badge">${skill}</span>`
        ).join('');

        const cardClass = experience.featured ? 'experience-card-featured' : 'experience-card-glass';

        card.innerHTML = `
            <div class="experience-flip-container ${cardClass}" data-experience-id="${experience.id} data-company-id="${experience.id}" >
                <!-- Company Header - Fixed, doesn't flip -->
                <div class="company-header-fixed">
                    <h3 class="company-name">${experience.company}</h3>
                    <div class="flip-indicator">
                        <i class="fas fa-sync-alt"></i>
                        <span class="flip-text">Click to flip</span>
                    </div>
                </div>

                <!-- Flip Card Content -->
                <div class="flip-card">
                    <!-- Front Side -->
                    <div class="flip-card-front">
                        <div class="position-info">
                            <h4 class="position-title">${experience.position}</h4>
                            <div class="duration-badge">${experience.duration}</div>
                        </div>

                        <div class="location-info">
                            <span class="location-item">
                                <i class="bi bi-geo-alt"></i>
                                ${experience.location}
                            </span>
                            <span class="type-item">
                                <i class="bi bi-briefcase"></i>
                                ${experience.type}
                            </span>
                        </div>

                        <div class="projects-section">
                            <h6 class="section-label">Key Projects</h6>
                            <div class="project-badges">${projectBadges}</div>
                        </div>

                        <div class="tech-skills-section">
                            <div class="tech-section">
                                <h6 class="tech-label">Technologies</h6>
                                <div class="tech-tags">${techTags}</div>
                            </div>
                            
                            <div class="experience-skills-section">
                                <h6 class="skills-label">Skills</h6>
                                <div class="skill-tags">${skillTags}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Back Side -->
                    <div class="flip-card-back">
                        <div class="achievements-container">
                            <h5 class="achievements-title">Roles & Responsibilities</h5>
                            <ul class="achievements-list">${achievementsList}</ul>
                        </div>
                        
                        <div class="flip-back-footer">
                            <div class="experience-stats">
                                <div class="stat-item">
                                    <span class="stat-number">${experience.projects.length}</span>
                                    <span class="stat-label">Projects</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number">${experience.technologies.length + experience.skills.length}</span>
                                    <span class="stat-label">Skills</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    // Create experience grid - shows loading initially
    createExperienceGrid() {
        const grid = document.createElement('div');
        grid.className = 'experience-grid';
        grid.id = 'experienceGrid';

        // Show loading state initially
        if (!this.isDataLoaded) {
            grid.innerHTML = `
                <div class="experience-loading">
                    <div class="loading-spinner"></div>
                    <p>Loading experience...</p>
                </div>
            `;
        } else {
            this.renderExperienceCards(grid);
        }

        return grid;
    }

    // Render experience cards
    renderExperienceCards(container) {
        container.innerHTML = '';

        if (this.experienceData.length === 0) {
            container.innerHTML = `
                <div class="experience-empty">
                    <p>No experience data available at the moment.</p>
                </div>
            `;
            return;
        }

        this.experienceData.forEach((experience, index) => {
            container.appendChild(this.createExperienceCard(experience, index));
        });
    }

    // Synchronous render method (SectionManager requirement)
    render() {
        const section = document.createElement('section');
        section.id = 'experience';
        section.className = 'experience-section game-section';

        const container = document.createElement('div');
        container.className = 'container';

        container.appendChild(this.createSectionHeader());
        container.appendChild(this.createExperienceGrid());

        section.appendChild(container);

        return section;
    }

    // Load data and update UI
    async loadDataAndUpdate() {
        const success = await this.loadExperienceData();

        if (success || this.isDataLoaded) {
            // Update the experience grid
            const grid = document.getElementById('experienceGrid');
            if (grid) {
                this.renderExperienceCards(grid);

                // Reinitialize interactions
                setTimeout(() => {
                    this.initializeFlipAnimations();
                    this.initializeResponsiveHandling();
                }, 100);
            }
        } else {
            // Show error state
            const grid = document.getElementById('experienceGrid');
            if (grid) {
                grid.innerHTML = `
                    <div class="experience-error">
                        <p>Failed to load experience. Please try refreshing the page.</p>
                    </div>
                `;
            }
        }
    }

    // Initialize method called by SectionManager (async data loading)
    async initialize() {
        console.log('Experience section initializing...');

        // Load data and update UI
        await this.loadDataAndUpdate();

        console.log('Experience section initialized successfully');
    }

    initializeFlipAnimations() {
        const flipContainers = document.querySelectorAll('.experience-flip-container');

        flipContainers.forEach(container => {
            const flipCard = container.querySelector('.flip-card');
            let isFlipped = false;

            // Only handle click events for flipping
            container.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Prevent flipping if clicking on badges or interactive elements
                if (e.target.closest('.tech-badge, .skill-badge, .project-badge')) {
                    return;
                }

                isFlipped = !isFlipped;

                if (isFlipped) {
                    flipCard.classList.add('flipped');
                    container.classList.add('card-flipped');
                } else {
                    flipCard.classList.remove('flipped');
                    container.classList.remove('card-flipped');
                }

                // Update flip indicator
                const flipIndicator = container.querySelector('.flip-indicator i');
                const flipText = container.querySelector('.flip-text');

                if (isFlipped) {
                    flipIndicator.style.transform = 'rotate(180deg)';
                    if (flipText) flipText.textContent = 'Click to return';
                } else {
                    flipIndicator.style.transform = 'rotate(0deg)';
                    if (flipText) flipText.textContent = 'Click to flip';
                }

                // Add ripple effect
                this.createRippleEffect(e, container);
            });

            // Remove any hover effects that might interfere with flip
            container.addEventListener('mouseenter', () => {
                if (!isFlipped) {
                    container.classList.add('card-hover');
                }
            });

            container.addEventListener('mouseleave', () => {
                container.classList.remove('card-hover');
            });
        });
    }

    createRippleEffect(event, container) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';

        const rect = container.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        container.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    initializeResponsiveHandling() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.isMobile = window.innerWidth <= 768;

                // Force re-render of flip indicators on resize
                const flipIndicators = document.querySelectorAll('.flip-indicator i');
                flipIndicators.forEach(indicator => {
                    if (!indicator.closest('.experience-flip-container').querySelector('.flip-card').classList.contains('flipped')) {
                        indicator.style.transform = 'rotate(0deg)';
                    }
                });
            }, 250);
        });
    }

    async updateExperience(newData) {
        this.config = { ...this.config, ...newData };
        this.isDataLoaded = true;
        const existingSection = document.getElementById('experience');
        if (existingSection) {
            const newSection = await this.render();
            existingSection.parentNode.replaceChild(newSection, existingSection);
            await this.initialize();
        }
    }

    async refreshData() {
        this.isDataLoaded = false;
        this.experienceData = [];
        await this.loadDataAndUpdate();
    }

    cleanup() {
        const experienceSection = document.getElementById('experience');
        if (experienceSection) {
            experienceSection.remove();
        }
    }
}

window.ExperienceSection = ExperienceSection;