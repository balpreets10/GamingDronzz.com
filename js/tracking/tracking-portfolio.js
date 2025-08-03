/**
 * Portfolio Section Analytics Tracking
 * Dedicated tracking class for portfolio section interactions
 */
class PortfolioSectionTracking {
    constructor(analyticsManager) {
        this.analytics = analyticsManager;
        this.isInitialized = false;
        this.engagementData = {
            enterTime: null,
            totalTime: 0,
            viewCount: 0,
            projectViews: 0,
            filterUsage: 0,
            deepEngagement: false
        };
        this.observers = [];
    }

    /**
     * Initialize all portfolio tracking
     */
    init() {
        if (this.isInitialized) return;

        setTimeout(() => {
            this.setupProjectCardTracking();
            this.setupFilterTracking();
            this.setupEngagementTracking();
            this.setupScrollTracking();
            this.setupModalTracking();
            this.isInitialized = true;

            if (this.analytics.isDebugMode) {
                console.log('💼 Portfolio section tracking initialized');
            }
        }, 1000);
    }

    /**
     * Track project card interactions
     */
    setupProjectCardTracking() {
        const portfolioSection = document.querySelector('#portfolio');
        if (!portfolioSection) return;

        portfolioSection.addEventListener('click', (e) => {
            const projectCard = e.target.closest('.project-card');
            if (!projectCard) return;

            const categories = projectCard.getAttribute('data-categories') || 'unknown';
            const title = projectCard.querySelector('.card-title')?.textContent || 'unknown';
            const technologies = Array.from(projectCard.querySelectorAll('.tech-tag')).map(tag => tag.textContent);

            this.engagementData.projectViews++;

            this.analytics.trackEvent('portfolio_project_click', {
                project_title: title,
                project_categories: categories,
                technologies_shown: technologies.length,
                click_position: Array.from(portfolioSection.querySelectorAll('.project-card')).indexOf(projectCard),
                total_projects_visible: portfolioSection.querySelectorAll('.project-card[style*="block"], .project-card:not([style*="none"])').length
            });

            if (this.analytics.isDebugMode) {
                console.log(`🎯 Portfolio project clicked: ${title} (${categories})`);
            }
        });

        // Track hover interactions
        portfolioSection.addEventListener('mouseenter', (e) => {
            const projectCard = e.target.closest('.project-card');
            if (!projectCard) return;

            const title = projectCard.querySelector('.card-title')?.textContent || 'unknown';
            this.analytics.trackEvent('portfolio_project_hover', {
                project_title: title,
                hover_timestamp: Date.now()
            });
        }, true);
    }

    /**
     * Track filter usage
     */
    setupFilterTracking() {
        const portfolioSection = document.querySelector('#portfolio');
        if (!portfolioSection) return;

        portfolioSection.addEventListener('click', (e) => {
            const filterBtn = e.target.closest('.filter-btn');
            if (!filterBtn) return;

            const category = filterBtn.getAttribute('data-category') || 'unknown';
            const wasActive = filterBtn.classList.contains('active');

            this.engagementData.filterUsage++;

            this.analytics.trackEvent('portfolio_filter_click', {
                filter_category: category,
                was_already_active: wasActive,
                filter_usage_count: this.engagementData.filterUsage,
                available_filters: portfolioSection.querySelectorAll('.filter-btn').length
            });

            // Track filtered results after a delay
            setTimeout(() => {
                const visibleProjects = portfolioSection.querySelectorAll('.project-card[style*="block"], .project-card:not([style*="none"])').length;
                this.analytics.trackEvent('portfolio_filter_result', {
                    filter_category: category,
                    visible_projects: visibleProjects,
                    filter_timestamp: Date.now()
                });
            }, 500);

            if (this.analytics.isDebugMode) {
                console.log(`🔍 Portfolio filter clicked: ${category}`);
            }
        });
    }

    /**
     * Track project modal interactions (if modal exists)
     */
    setupModalTracking() {
        // Listen for modal events if projectModal exists
        if (window.projectModal) {
            // Override modal open method to track
            const originalOpen = window.projectModal.open;
            window.projectModal.open = (project) => {
                this.analytics.trackEvent('portfolio_modal_open', {
                    project_title: project.title || 'unknown',
                    project_categories: project.category?.join(',') || 'unknown',
                    modal_trigger: 'card_click'
                });

                if (this.analytics.isDebugMode) {
                    console.log(`📱 Portfolio modal opened: ${project.title}`);
                }

                return originalOpen.call(window.projectModal, project);
            };
        }
    }

    /**
     * Track section engagement
     */
    setupEngagementTracking() {
        const portfolioSection = document.querySelector('#portfolio');
        if (!portfolioSection) return;

        const portfolioObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.engagementData.enterTime = Date.now();
                    this.engagementData.viewCount++;

                    this.analytics.trackEvent('portfolio_section_enter', {
                        view_count: this.engagementData.viewCount,
                        intersection_ratio: Math.round(entry.intersectionRatio * 100),
                        viewport_height: window.innerHeight
                    });

                    // Track deep engagement after 15 seconds
                    setTimeout(() => {
                        if (this.engagementData.enterTime &&
                            (Date.now() - this.engagementData.enterTime) >= 15000) {
                            if (!this.engagementData.deepEngagement) {
                                this.engagementData.deepEngagement = true;
                                this.analytics.trackEvent('portfolio_deep_engagement', {
                                    engagement_time: 15000,
                                    project_views: this.engagementData.projectViews,
                                    filter_usage: this.engagementData.filterUsage
                                });

                                if (this.analytics.isDebugMode) {
                                    console.log('🎯 Portfolio deep engagement tracked (15s+)');
                                }
                            }
                        }
                    }, 15000);

                } else {
                    if (this.engagementData.enterTime) {
                        const sessionTime = Date.now() - this.engagementData.enterTime;
                        this.engagementData.totalTime += sessionTime;

                        this.analytics.trackEvent('portfolio_section_exit', {
                            session_time: Math.round(sessionTime / 1000),
                            total_time: Math.round(this.engagementData.totalTime / 1000),
                            project_views: this.engagementData.projectViews,
                            filter_usage: this.engagementData.filterUsage
                        });

                        this.engagementData.enterTime = null;

                        if (this.analytics.isDebugMode) {
                            console.log(`👋 Portfolio section exited: ${Math.round(sessionTime / 1000)}s session`);
                        }
                    }
                }
            });
        }, {
            threshold: [0.1, 0.25, 0.5, 0.75],
            rootMargin: '0px'
        });

        portfolioObserver.observe(portfolioSection);
        this.observers.push(portfolioObserver);
    }

    /**
     * Track scroll interactions within portfolio
     */
    setupScrollTracking() {
        const portfolioSection = document.querySelector('#portfolio');
        if (!portfolioSection) return;

        let portfolioScrollTimeout = null;
        const scrollHandler = () => {
            const portfolioRect = portfolioSection.getBoundingClientRect();
            const isInPortfolio = portfolioRect.top < window.innerHeight && portfolioRect.bottom > 0;

            if (isInPortfolio && this.engagementData.enterTime) {
                if (portfolioScrollTimeout) clearTimeout(portfolioScrollTimeout);
                portfolioScrollTimeout = setTimeout(() => {
                    this.analytics.trackEvent('portfolio_scroll_interaction', {
                        scroll_y: window.scrollY,
                        portfolio_visibility: Math.max(0, Math.min(1,
                            (window.innerHeight - portfolioRect.top) / portfolioRect.height
                        )),
                        visible_projects: portfolioSection.querySelectorAll('.project-card[style*="block"], .project-card:not([style*="none"])').length
                    });
                }, 500);
            }
        };

        window.addEventListener('scroll', scrollHandler);
    }

    /**
     * Get portfolio analytics summary
     */
    getSummary() {
        const portfolioEvents = this.analytics.sessionData.interactions.filter(
            interaction => interaction.event.startsWith('portfolio_')
        );

        const summary = {
            total_portfolio_events: portfolioEvents.length,
            project_clicks: portfolioEvents.filter(e => e.event === 'portfolio_project_click').length,
            filter_clicks: portfolioEvents.filter(e => e.event === 'portfolio_filter_click').length,
            modal_opens: portfolioEvents.filter(e => e.event === 'portfolio_modal_open').length,
            deep_engagement: portfolioEvents.some(e => e.event === 'portfolio_deep_engagement'),
            section_views: portfolioEvents.filter(e => e.event === 'portfolio_section_enter').length,
            engagement_data: this.engagementData
        };

        if (this.analytics.isDebugMode) {
            console.group('💼 Portfolio Analytics Summary');
            console.log(summary);
            console.log('Recent portfolio events:', portfolioEvents.slice(-5));
            console.groupEnd();
        }

        return summary;
    }

    /**
     * Cleanup method
     */
    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        this.isInitialized = false;
    }
}

// Global registration
window.PortfolioSectionTracking = PortfolioSectionTracking;