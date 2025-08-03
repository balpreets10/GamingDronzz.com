/**
 * Portfolio Section - Fixed lazy loading and modal issues
 */
class PortfolioSection {
    constructor() {
        this.config = {
            title: 'PORTFOLIO',
            subtitle: 'Explore my journey through interactive experiences. From Multiplayers to PC strategy games to Web Casino games.</br>Each project represents a unique challenge conquered and innovation achieved.</br>The Design and Development of this website showcases my knack for UX.',
            filterLabel: 'Filter Projects',
            statIcons: {
                downloads: 'bi-download',
                rating: 'bi-star-fill',
                duration: 'bi-clock'
            },
            statusClasses: {
                'Completed': 'status-completed',
                'In Development': 'status-development',
                'Partially Deployed': 'status-deployed',
                'Side Project': 'status-project'
            }
        };
        this.projectsData = [];
        this.activeFilter = 'all';
        this.filteredProjects = [];
        this.isDataLoaded = false;
    }

    async loadProjectsData() {
        try {
            console.log('Loading projects data from JSON...');
            const response = await fetch('data/projects-data.json');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.projectsData = data.projects || [];
            this.filteredProjects = this.projectsData;
            this.isDataLoaded = true;

            console.log(`Loaded ${this.projectsData.length} projects from JSON`);
            return true;
        } catch (error) {
            console.error('Error loading projects data:', error);

            if (window.projectsData && Array.isArray(window.projectsData)) {
                console.log('Falling back to window.projectsData');
                this.projectsData = window.projectsData;
                this.filteredProjects = this.projectsData;
                this.isDataLoaded = true;
                return true;
            }

            this.projectsData = [];
            this.filteredProjects = [];
            this.isDataLoaded = false;
            return false;
        }
    }

    getOptimizedImg(url) {
        return window.imageManager ? window.imageManager.smartUrl(url) : url;
    }

    createProjectCard(project, index) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.setAttribute('data-project-id', project.id || index + 1);
        card.setAttribute('data-categories', project.category.join(',').toLowerCase());
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', `${150 + (index % 3) * 100}`);

        const displayTech = project.technologies.slice(0, 3);
        const remainingCount = project.technologies.length - 3;

        const techList = displayTech.map(tech =>
            `<span class="tech-tag">${tech.trim()}</span>`
        ).join('');

        const techCounter = remainingCount > 0 ?
            `<span class="tech-counter">+${remainingCount}</span>` : '';

        const achievements = project.achievements.slice(0, 2).map(achievement =>
            `<span class="achievement-item">${achievement}</span>`
        ).join('');

        card.innerHTML = `
            <div class="card-image lazy-bg" 
                 data-bg-src="${this.getOptimizedImg(project.images[0])}"
                 data-bg-loaded="false">
                <div class="card-overlay"></div>
                <div class="image-placeholder">
                    <i class="bi bi-image"></i>
                </div>
            </div>
            <div class="status-ribbon ${this.getStatusClass(project.status)}">
                <span class="status-text">${project.status}</span>
            </div>
            <div class="card-content">
                <h3 class="card-title">${project.title}</h3>
                
                <div class="card-stats">
                    <div class="stat-item">
                        <i class="${this.config.statIcons.downloads}"></i>
                        <span class="stat-value downloads">${project.stats.downloads}</span>
                    </div>
                    <div class="stat-item">
                        <i class="${this.config.statIcons.rating}"></i>
                        <span class="stat-value rating">${project.stats.rating}</span>
                    </div>
                    <div class="stat-item">
                        <i class="${this.config.statIcons.duration}"></i>
                        <span class="stat-value duration">${project.stats.duration}</span>
                    </div>
                </div>

                <div class="card-technologies">
                    <div class="tech-label">TECH STACK</div>
                    <div class="tech-list">
                        ${techList}
                        ${techCounter}
                    </div>
                </div>

                <div class="card-achievements">
                    <div class="achievement-label">ACHIEVEMENTS</div>
                    <div class="achievement-list">${achievements}</div>
                </div>
            </div>
        `;

        // Single click event listener - fix for double modal opening
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.target.closest('.card-link')) return;

            if (window.projectModal && !card.hasAttribute('data-opening')) {
                card.setAttribute('data-opening', 'true');
                window.projectModal.open(project);

                // Remove flag after modal opens
                setTimeout(() => {
                    card.removeAttribute('data-opening');
                }, 500);
            }
        });

        return card;
    }

    createProjectsGrid() {
        const gridContainer = document.createElement('div');
        gridContainer.className = 'projects-grid-container';

        const grid = document.createElement('div');
        grid.className = 'projects-grid';
        grid.id = 'projectsGrid';

        if (!this.isDataLoaded) {
            grid.innerHTML = `
                <div class="projects-loading">
                    <div class="loading-spinner"></div>
                    <p>Loading projects...</p>
                </div>
            `;
        } else {
            this.renderProjectCards(grid);
        }

        gridContainer.appendChild(grid);
        return gridContainer;
    }

    renderProjectCards(container) {
        container.innerHTML = '';

        if (this.projectsData.length === 0) {
            container.innerHTML = `
                <div class="projects-empty">
                    <p>No projects available at the moment.</p>
                </div>
            `;
            return;
        }

        this.projectsData.forEach((project, index) => {
            container.appendChild(this.createProjectCard(project, index));
        });
    }

    render() {
        const section = document.createElement('section');
        section.id = 'portfolio';
        section.className = 'portfolio section';

        section.appendChild(this.createBackgroundElements());

        const container = document.createElement('div');
        container.className = 'container';

        container.appendChild(this.createSectionHeader());
        container.appendChild(this.createVideoContainer());
        container.appendChild(this.createCategoryFilter());
        container.appendChild(this.createProjectsGrid());

        section.appendChild(container);

        return section;
    }

    async loadDataAndUpdate() {
        const success = await this.loadProjectsData();

        if (success) {
            const grid = document.getElementById('projectsGrid');
            if (grid) {
                this.renderProjectCards(grid);
                this.updateCategoryFilter();

                setTimeout(() => {
                    this.setupFilters();
                    this.setupCardInteractions();
                    this.initializeAnimations();
                    this.filterProjects(this.activeFilter);
                    this.initializeLazyLoading();
                }, 100);
            }
        } else {
            const grid = document.getElementById('projectsGrid');
            if (grid) {
                grid.innerHTML = `
                    <div class="projects-error">
                        <p>Failed to load projects. Please try refreshing the page.</p>
                    </div>
                `;
            }
        }
    }

    initializeLazyLoading() {
        if (window.imageManager && window.imageManager.observeLazyImages) {
            window.imageManager.observeLazyImages();
            console.log('Portfolio lazy loading initialized');
        }
    }

    async initialize() {
        console.log('Portfolio section initializing...');
        await this.loadDataAndUpdate();
        this.setupMobileScrollIndicators();
        console.log('Portfolio section initialized successfully');
    }

    createBackgroundElements() {
        const bgElements = document.createElement('div');
        bgElements.className = 'portfolio-background-elements';
        bgElements.innerHTML = `
            <div class="portfolio-bg-grid"></div>
            <div class="portfolio-bg-particle particle-1"></div>
            <div class="portfolio-bg-particle particle-2"></div>
            <div class="portfolio-bg-particle particle-3"></div>
            <div class="portfolio-bg-glow glow-1"></div>
            <div class="portfolio-bg-glow glow-2"></div>
        `;
        return bgElements;
    }

    createSectionHeader() {
        const header = document.createElement('div');
        header.className = 'section-header';
        header.setAttribute('data-aos', 'fade-down');

        header.innerHTML = `
            <div class="title-container">
                <h2 class="section-title">${this.config.title}</h2>
            </div>
            <div class="header-divider"></div>
            <p class="section-subtitle">${this.config.subtitle}</p>
        `;

        return header;
    }

    createVideoContainer() {
        const videoSection = document.createElement('div');
        videoSection.className = 'portfolio-video';
        videoSection.setAttribute('data-aos', 'fade-up');
        videoSection.setAttribute('data-aos-delay', '200');

        videoSection.innerHTML = `
        <div class="video-container">
            <h3 class="video-title">Watch My Portfolio Showcase</h3>
            <div class="video-wrapper">
                <iframe 
                    src="https://www.youtube.com/embed/k4RPWlaGaNw?rel=0&modestbranding=1&showinfo=0&color=white&theme=dark" 
                    title="Portfolio Showcase Video"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen>
                </iframe>
            </div>
            <p class="video-description">
                Experience my portfolio in action - showcasing interactive features, design elements, and development expertise.
            </p>
        </div>
    `;

        return videoSection;
    }

    createCategoryFilter() {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'category-filter';
        filterContainer.setAttribute('data-aos', 'fade-up');
        filterContainer.setAttribute('data-aos-delay', '100');

        const allButton = document.createElement('button');
        allButton.className = 'filter-btn active';
        allButton.setAttribute('data-category', 'all');
        allButton.textContent = 'All Projects';
        filterContainer.appendChild(allButton);

        return filterContainer;
    }

    updateCategoryFilter() {
        const filterContainer = document.querySelector('.portfolio .category-filter');
        if (!filterContainer || !this.isDataLoaded) return;

        const categories = new Set(['all']);
        this.projectsData.forEach(project => {
            project.category.forEach(cat => categories.add(cat.toLowerCase()));
        });

        filterContainer.innerHTML = '';
        Array.from(categories).forEach(category => {
            const button = document.createElement('button');
            button.className = `filter-btn ${category === 'all' ? 'active' : ''}`;
            button.setAttribute('data-category', category);
            button.textContent = category === 'all' ? 'All Projects' : category.charAt(0).toUpperCase() + category.slice(1);
            filterContainer.appendChild(button);
        });
    }

    getStatusClass(status) {
        for (const [key, className] of Object.entries(this.config.statusClasses)) {
            if (status.includes(key)) return className;
        }
        return 'status-project';
    }

    setupFilters() {
        const filterButtons = document.querySelectorAll('.portfolio .filter-btn');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const category = button.getAttribute('data-category');
                this.activeFilter = category;
                this.filterProjects(category);
            });
        });
    }

    filterProjects(category) {
        const cards = document.querySelectorAll('.portfolio .project-card');

        cards.forEach(card => {
            const categories = card.getAttribute('data-categories');
            const shouldShow = category === 'all' || categories.includes(category);

            if (shouldShow) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.6s ease forwards';
            } else {
                card.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });

        setTimeout(() => {
            if (window.imageManager && window.imageManager.observeLazyImages) {
                window.imageManager.observeLazyImages();
            }
        }, 350);
    }

    setupCardInteractions() {
        const cards = document.querySelectorAll('.portfolio .project-card');

        cards.forEach((card) => {
            // Only hover effects - no preloading, no duplicate click handlers
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-15px) scale(1.02)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    initializeAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        const animatedElements = document.querySelectorAll('.portfolio .project-card');
        animatedElements.forEach(el => observer.observe(el));
    }

    setupMobileScrollIndicators() {
        if (window.innerWidth > 992) return;

        const gridContainer = document.querySelector('.portfolio .projects-grid-container');
        const projectsGrid = document.querySelector('.portfolio .projects-grid');

        if (!gridContainer || !projectsGrid) return;

        this.createScrollProgress(gridContainer);
        this.createArrowIndicators(gridContainer, projectsGrid);
        this.setupScrollTracking(projectsGrid);
        this.enhanceTouchScrolling(projectsGrid);
    }

    createScrollProgress(container) {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        container.appendChild(progressBar);
    }

    createArrowIndicators(container, grid) {
        const leftArrow = document.createElement('div');
        leftArrow.className = 'scroll-indicator left';
        leftArrow.innerHTML = '<i class="bi bi-chevron-left"></i>';

        const rightArrow = document.createElement('div');
        rightArrow.className = 'scroll-indicator right';
        rightArrow.innerHTML = '<i class="bi bi-chevron-right"></i>';

        container.appendChild(leftArrow);
        container.appendChild(rightArrow);

        setTimeout(() => {
            leftArrow.style.display = 'none';
            rightArrow.style.display = 'none';
        }, 6000);
    }

    setupScrollTracking(grid) {
        let isScrolling = false;

        grid.addEventListener('scroll', () => {
            if (!isScrolling) {
                if (window.analyticsManager) {
                    window.analyticsManager.trackSectionInteraction('portfolio', 'horizontal_scroll');
                }
                isScrolling = true;

                setTimeout(() => {
                    isScrolling = false;
                }, 1000);
            }
        });
    }

    enhanceTouchScrolling(grid) {
        let startX = 0;
        let startY = 0;
        let scrollLeft = 0;
        let isDown = false;
        let isDragging = false;
        let isHorizontalIntent = false;

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

        // FIXED: Enhanced touch events that allow vertical scrolling
        grid.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - grid.offsetLeft;
            startY = e.touches[0].pageY;
            scrollLeft = grid.scrollLeft;
            isDragging = false;
            isHorizontalIntent = false;
        }, { passive: true });

        grid.addEventListener('touchmove', (e) => {
            const currentX = e.touches[0].pageX - grid.offsetLeft;
            const currentY = e.touches[0].pageY;
            const deltaX = Math.abs(currentX - startX);
            const deltaY = Math.abs(currentY - startY);

            // Determine scroll intent on first significant movement
            if (!isDragging && (deltaX > 10 || deltaY > 10)) {
                isHorizontalIntent = deltaX > deltaY;
            }

            // Only handle horizontal scrolling if horizontal intent is detected
            if (isHorizontalIntent) {
                isDragging = true;
                const x = currentX;
                const walk = (x - startX) * 2;
                grid.scrollLeft = scrollLeft - walk;

                // Only prevent default for horizontal scrolling
                e.preventDefault();
            }
            // If vertical intent, allow default vertical scrolling behavior
        }, { passive: false }); // Changed to non-passive to allow preventDefault

        grid.addEventListener('touchend', () => {
            if (isDragging) {
                setTimeout(() => {
                    isDragging = false;
                    isHorizontalIntent = false;
                }, 50);
            }
        }, { passive: true });

        // Enhanced click handling to prevent clicks during horizontal drags
        grid.addEventListener('click', (e) => {
            if (isDragging || isHorizontalIntent) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    }
}

window.PortfolioSection = PortfolioSection;