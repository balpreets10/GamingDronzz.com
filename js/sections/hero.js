/**
 * Gaming Dronzz Hero Section - Professional Game Development Consultancy
 * AI-Powered Systems & Agentic AI Workflows
 */
class HeroSection {
    constructor() {
        this.config = {
            name: "AI-Powered Game Development Consultancy",
            title: 'Gaming<span class="accent-text">Dronzz</span>',
            typedItems: [
                "AI-Powered Game Development",
                "Agentic AI Workflows", 
                "Stunning Gameplay Mechanisms",
                "Next-Gen Gaming Solutions"
            ],
            description: "We revolutionize game development through cutting-edge AI systems and agentic workflows. Our consultancy specializes in creating stunning gameplay mechanisms that push the boundaries of interactive entertainment. From concept to deployment, we leverage advanced AI to deliver exceptional gaming experiences that captivate players worldwide.",
            actions: [
                { href: '#services', text: 'Our Services', class: 'btn btn-primary' },
                { href: '#contact', text: 'Start Project', class: 'btn btn-outline' },
                {
                    href: '#portfolio',
                    text: 'View Work',
                    class: 'btn btn-secondary'
                }
            ],
            socialLinks: [
                { href: 'https://linkedin.com/company/gamingdronzz', icon: 'bi-linkedin', label: 'LinkedIn' },
                { href: 'https://github.com/gamingdronzz', icon: 'bi-github', label: 'GitHub' },
                { href: 'https://twitter.com/gamingdronzz', icon: 'bi-twitter', label: 'Twitter' },
                { href: 'https://discord.gg/gamingdronzz', icon: 'bi-discord', label: 'Discord' }
            ],
            stats: [
                {
                    icon: 'bi-robot',
                    count: 50,
                    label: 'AI Systems Deployed',
                    tooltip: 'Advanced AI systems successfully integrated into game development pipelines',
                    delay: 100
                },
                {
                    icon: 'bi-gear-wide-connected',
                    count: 200,
                    label: 'Projects Completed',
                    tooltip: 'Successfully delivered game development projects across multiple platforms',
                    suffix: " +",
                    delay: 150
                },
                {
                    icon: 'bi-graph-up-arrow',
                    count: 95,
                    label: 'Client Success Rate',
                    tooltip: 'Exceptional client satisfaction and project success rate',
                    suffix: '%',
                    delay: 200
                },
                {
                    icon: 'bi-lightning-charge',
                    count: 24,
                    label: 'Hours Response Time',
                    tooltip: 'Average response time for client inquiries and support',
                    suffix: 'h',
                    delay: 250
                }
            ],
            // Professional title animations
            titleAnimations: [
                'professional-glow',
                'minimalist-fade',
                'tech-reveal',
                'ai-pulse',
                'consultancy-shine',
                'gaming-elegant'
            ],
            floatingElements: [
                { icon: "fas fa-robot", position: "top: 15%; left: 8%; font-size: 1.8rem;", color: "rgba(59, 130, 246, 0.3)" },
                { icon: "fas fa-brain", position: "top: 65%; right: 12%; font-size: 1.6rem;", color: "rgba(139, 92, 246, 0.3)", delay: "-2s" },
                { icon: "fas fa-cogs", position: "top: 35%; right: 20%; font-size: 1.5rem;", color: "rgba(6, 182, 212, 0.3)", delay: "-1s" },
                { icon: "fas fa-gamepad", position: "bottom: 25%; left: 15%; font-size: 1.7rem;", color: "rgba(16, 185, 129, 0.3)", delay: "-3s" },
                { icon: "fas fa-code", position: "bottom: 20%; left: 25%; font-size: 1.6rem;", color: "rgba(59, 130, 246, 0.3)", delay: "-4s" },
                { icon: "fas fa-chart-line", position: "top: 45%; left: 12%; font-size: 1.5rem;", color: "rgba(139, 92, 246, 0.3)", delay: "-5s" }
            ],
            currentAnimation: this.getRandomAnimation() // Random animation on each visit
        };
    }

    // Method to get random animation for each visit
    getRandomAnimation() {
        const animations = [
            'professional-glow',
            'minimalist-fade',
            'tech-reveal',
            'ai-pulse',
            'consultancy-shine',
            'gaming-elegant'
        ];
        const randomIndex = Math.floor(Math.random() * animations.length);
        return animations[randomIndex];
    }

    createBackgroundElements() {
        const bgElements = document.createElement('div');
        bgElements.className = 'background-elements';
        bgElements.innerHTML = `
            <div class="bg-grid"></div>
            <div class="bg-circle circle-1"></div>
            <div class="bg-circle circle-2"></div>
            <div class="bg-particle particle-1"></div>
            <div class="bg-particle particle-2"></div>
            <div class="bg-particle particle-3"></div>
            <div class="bg-particle particle-4"></div>
            <div class="bg-particle particle-5"></div>
            <div class="bg-ai-network"></div>
        `;
        return bgElements;
    }

    createHeroText() {
        const heroText = document.createElement('div');
        heroText.className = 'hero-text';

        const h1 = document.createElement('h1');
        h1.className = `title-animated ${this.config.currentAnimation}`;
        h1.innerHTML = this.config.title;
        h1.setAttribute('data-text', 'GamingDronzz'); // For glitch effect

        const h2 = document.createElement('h4');
        h2.textContent = this.config.name;

        const leadP = document.createElement('p');
        leadP.className = 'lead';
        leadP.innerHTML = `<span class="typed" data-typed-items="${this.config.typedItems.join(', ')}"></span>`;

        const descP = document.createElement('p');
        descP.className = 'description';
        descP.innerHTML = this.config.description;

        const actions = document.createElement('div');
        actions.className = 'hero-actions';
        this.config.actions.forEach(action => {
            const a = document.createElement('a');
            a.href = action.href;
            a.className = action.class;
            a.textContent = action.text;

            // Handle download attribute
            if (action.download) {
                a.setAttribute('download', action.download);
            }

            // Handle target attribute
            if (action.target) {
                a.setAttribute('target', action.target);
            }
            actions.appendChild(a);
        });

        const socialLinks = document.createElement('div');
        socialLinks.className = 'social-links';
        this.config.socialLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.title = link.label;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.innerHTML = `<i class="${link.icon}"></i>`;
            socialLinks.appendChild(a);
        });

        heroText.appendChild(h1);
        heroText.appendChild(h2);
        heroText.appendChild(leadP);
        heroText.appendChild(descP);
        heroText.appendChild(actions);
        heroText.appendChild(socialLinks);

        return heroText;
    }

    createStatsSection() {
        const statsSection = document.createElement('div');
        statsSection.className = 'hero-stats';

        const statsTitle = document.createElement('h3');
        statsTitle.className = 'stats-title';
        statsTitle.textContent = 'Performance Metrics';

        const statsGrid = document.createElement('div');
        statsGrid.className = 'stats-grid';

        this.config.stats.forEach((stat, index) => {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            statItem.setAttribute('data-aos', 'zoom-in');
            statItem.setAttribute('data-aos-delay', stat.delay);

            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'stat-tooltip';
            tooltip.textContent = stat.tooltip;

            statItem.innerHTML = `
                <div class="stat-icon">
                    <i class="${stat.icon}"></i>
                </div>
                <div class="stat-content">
                    <span class="stat-number" data-target="${stat.count}">0${stat.suffix || ''}</span>
                    <p class="stat-label">${stat.label}</p>
                </div>
            `;

            statItem.appendChild(tooltip);
            statsGrid.appendChild(statItem);
        });

        statsSection.appendChild(statsTitle);
        statsSection.appendChild(statsGrid);

        return statsSection;
    }

    initializeTooltips() {
        const statItems = document.querySelectorAll('.hero .stat-item');

        statItems.forEach(statItem => {
            let hoverTimer = null;
            let isTooltipVisible = false;
            const tooltip = statItem.querySelector('.stat-tooltip');

            if (!tooltip) return;

            // 2-second hover delay functionality
            statItem.addEventListener('mouseenter', () => {
                // Clear any existing timer
                if (hoverTimer) {
                    clearTimeout(hoverTimer);
                }

                // Set 2-second delay before showing tooltip
                hoverTimer = setTimeout(() => {
                    this.showTooltip(statItem, tooltip);
                    isTooltipVisible = true;
                }, 2000);
            });

            // Clear timer on mouse leave
            statItem.addEventListener('mouseleave', () => {
                if (hoverTimer) {
                    clearTimeout(hoverTimer);
                    hoverTimer = null;
                }

                // Hide tooltip if it was shown via hover
                if (isTooltipVisible) {
                    this.hideTooltip(statItem, tooltip);
                    isTooltipVisible = false;
                }
            });

            // Click functionality - immediate show/hide
            statItem.addEventListener('click', (e) => {
                e.preventDefault();

                // Clear hover timer if clicking
                if (hoverTimer) {
                    clearTimeout(hoverTimer);
                    hoverTimer = null;
                }

                if (isTooltipVisible) {
                    this.hideTooltip(statItem, tooltip);
                    isTooltipVisible = false;
                } else {
                    this.showTooltip(statItem, tooltip);
                    isTooltipVisible = true;
                }
            });

            // Hide tooltip when clicking outside
            document.addEventListener('click', (e) => {
                if (!statItem.contains(e.target) && isTooltipVisible) {
                    this.hideTooltip(statItem, tooltip);
                    isTooltipVisible = false;
                }
            });

            // Add visual feedback for interactive elements
            statItem.style.cursor = 'pointer';
            statItem.setAttribute('title', 'Hover 2s or click for details');
        });
    }

    // Add this method to show tooltip with animation
    showTooltip(statItem, tooltip) {
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
        tooltip.style.bottom = '-40px';
        tooltip.style.transform = 'translateX(-50%) translateY(0) scale(1)';

        // Add visual feedback to stat item
        statItem.classList.add('tooltip-active');
    }

    // Add this method to hide tooltip with animation
    hideTooltip(statItem, tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
        tooltip.style.bottom = '-45px';
        tooltip.style.transform = 'translateX(-50%) translateY(5px) scale(0.95)';

        // Remove visual feedback from stat item
        statItem.classList.remove('tooltip-active');
    }

    render() {
        const section = document.createElement('section');
        section.id = 'hero';
        section.className = 'hero section';

        section.appendChild(this.createBackgroundElements());

        const heroContent = document.createElement('div');
        heroContent.className = 'hero-content';

        const container = document.createElement('div');
        container.className = 'container';

        const row = document.createElement('div');
        row.className = 'row align-items-center';

        const leftCol = document.createElement('div');
        leftCol.className = 'col-lg-7';
        leftCol.setAttribute('data-aos', 'fade-right');
        leftCol.setAttribute('data-aos-delay', '100');
        leftCol.appendChild(this.createHeroText());

        const rightCol = document.createElement('div');
        rightCol.className = 'col-lg-5';
        rightCol.setAttribute('data-aos', 'fade-left');
        rightCol.setAttribute('data-aos-delay', '200');
        rightCol.appendChild(this.createStatsSection());

        row.appendChild(leftCol);
        row.appendChild(rightCol);
        container.appendChild(row);
        heroContent.appendChild(container);
        section.appendChild(heroContent);

        return section;
    }

    // Method to switch title animation
    switchTitleAnimation(animationClass) {
        const titleElement = document.querySelector('.hero .title-animated');
        if (titleElement) {
            // Remove all animation classes
            this.config.titleAnimations.forEach(anim => {
                titleElement.classList.remove(anim);
            });
            // Add new animation class
            titleElement.classList.add(animationClass);
            this.config.currentAnimation = animationClass;
        }
    }

    initializeTyped() {
        // Initialize typed.js after render
        if (typeof Typed !== 'undefined') {
            const typed = document.querySelector('.typed');
            if (typed) {
                new Typed('.typed', {
                    strings: this.config.typedItems,
                    typeSpeed: 50,
                    backSpeed: 30,
                    loop: true
                });
            }
        }
    }

    initializeCounters() {
        // Initialize counter animations
        const statNumbers = document.querySelectorAll('.hero .stat-number');

        const animateCounter = (element, target, suffix = '') => {
            let count = 0;
            const increment = target / 100;
            const timer = setInterval(() => {
                count += increment;
                if (count >= target) {
                    count = target;
                    clearInterval(timer);
                }

                let displayValue;
                if (target >= 1000000) {
                    // Handle millions
                    displayValue = (count / 1000000).toFixed(1) + 'M';
                } else if (target >= 1000) {
                    // Handle thousands
                    displayValue = (count / 1000).toFixed(1) + 'K';
                } else {
                    // Handle regular numbers
                    displayValue = Math.floor(count).toString();
                }

                element.textContent = displayValue + suffix;
            }, 20);
        };

        // Intersection Observer for counter animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    const target = parseInt(entry.target.dataset.target);
                    const suffix = entry.target.textContent.includes('%') ? '%' : 
                                 entry.target.textContent.includes('h') ? 'h' : '';
                    entry.target.classList.add('animated'); // Prevent re-animation
                    animateCounter(entry.target, target, suffix);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(stat => observer.observe(stat));
    }

    // Initialize all animations after render
    initialize() {
        console.log(`Gaming Dronzz Hero section initialized with animation: ${this.config.currentAnimation}`);
        this.initializeTyped();
        // Small delay to ensure DOM is ready for counter animation
        setTimeout(() => {
            this.initializeCounters();
            this.initializeTooltips();

            // Track animation with hero tracker
            if (window.analyticsManager) {
                const heroTracker = window.analyticsManager.getSectionTracker('hero');
                if (heroTracker) {
                    heroTracker.trackAnimation(this.config.currentAnimation);
                }
            }
        }, 100);
    }
}

window.HeroSection = HeroSection;