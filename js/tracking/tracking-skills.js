/**
 * Skills Section Analytics Tracking
 * Dedicated tracking class for skills section interactions
 */
class SkillsSectionTracking {
    constructor(analyticsManager) {
        this.analytics = analyticsManager;
        this.isInitialized = false;
        this.engagementData = {
            enterTime: null,
            totalTime: 0,
            viewCount: 0,
            categoryClicks: 0,
            skillInteractions: 0,
            modalOpens: 0,
            deepEngagement: false
        };
        this.observers = [];
    }

    /**
     * Initialize all skills tracking
     */
    init() {
        if (this.isInitialized) return;

        setTimeout(() => {
            this.setupUnitySpotlightTracking();
            this.setupSkillCategoryTracking();
            this.setupSkillChipTracking();
            this.setupModalTracking();
            this.setupEngagementTracking();
            this.setupScrollTracking();
            this.isInitialized = true;

            if (this.analytics.isDebugMode) {
                console.log('⚡ Skills section tracking initialized');
            }
        }, 1000);
    }

    /**
     * Track Unity spotlight interactions
     */
    setupUnitySpotlightTracking() {
        const unitySpotlight = document.querySelector('.unity-spotlight');
        if (!unitySpotlight) return;

        // Track spotlight interactions
        unitySpotlight.addEventListener('click', (e) => {
            const skillPill = e.target.closest('.skill-pill');
            if (skillPill) {
                const skillName = skillPill.textContent.trim();
                const skillSize = skillPill.classList.contains('size-large') ? 'large' :
                    skillPill.classList.contains('size-medium') ? 'medium' : 'small';
                const isFeatured = skillPill.classList.contains('featured');

                this.analytics.trackEvent('skills_unity_skill_click', {
                    skill_name: skillName,
                    skill_size: skillSize,
                    is_featured: isFeatured,
                    click_source: 'unity_spotlight'
                });

                if (this.analytics.isDebugMode) {
                    console.log(`🎯 Unity skill clicked: ${skillName} (${skillSize})`);
                }
            }
        });

        // Track hover on Unity XP display
        const xpDisplay = unitySpotlight.querySelector('.xp-display');
        if (xpDisplay) {
            let hoverStartTime = null;

            xpDisplay.addEventListener('mouseenter', () => {
                hoverStartTime = Date.now();
            });

            xpDisplay.addEventListener('mouseleave', () => {
                if (hoverStartTime) {
                    const hoverDuration = Date.now() - hoverStartTime;
                    if (hoverDuration > 1000) { // Only track if hovered for more than 1 second
                        this.analytics.trackEvent('skills_unity_xp_hover', {
                            hover_duration: hoverDuration,
                            xp_value: unitySpotlight.querySelector('.xp-number')?.textContent || 'unknown'
                        });
                    }
                    hoverStartTime = null;
                }
            });
        }
    }

    /**
     * Track skill category interactions
     */
    setupSkillCategoryTracking() {
        const skillsSection = document.querySelector('#skills');
        if (!skillsSection) return;

        skillsSection.addEventListener('click', (e) => {
            const skillCategory = e.target.closest('.skill-category');
            if (!skillCategory) return;

            const categoryId = skillCategory.getAttribute('data-category-id') || 'unknown';
            const categoryTitle = skillCategory.querySelector('.category-title')?.textContent || 'unknown';
            const categoryLevel = skillCategory.querySelector('.level-number')?.textContent || 'unknown';

            this.engagementData.categoryClicks++;

            this.analytics.trackEvent('skills_category_click', {
                category_id: categoryId,
                category_title: categoryTitle,
                category_level: categoryLevel,
                category_click_count: this.engagementData.categoryClicks,
                click_position: Array.from(skillsSection.querySelectorAll('.skill-category')).indexOf(skillCategory)
            });

            if (this.analytics.isDebugMode) {
                console.log(`🏷️ Skills category clicked: ${categoryTitle} (ID: ${categoryId})`);
            }
        });

        // Track category hover for engagement
        skillsSection.addEventListener('mouseenter', (e) => {
            const skillCategory = e.target.closest('.skill-category');
            if (!skillCategory) return;

            const categoryTitle = skillCategory.querySelector('.category-title')?.textContent || 'unknown';
            this.analytics.trackEvent('skills_category_hover', {
                category_title: categoryTitle,
                hover_timestamp: Date.now()
            });
        }, true);
    }

    /**
     * Track individual skill chip interactions
     */
    setupSkillChipTracking() {
        const skillsSection = document.querySelector('#skills');
        if (!skillsSection) return;

        skillsSection.addEventListener('click', (e) => {
            const skillChip = e.target.closest('.skill-chip');
            if (!skillChip) return;

            const skillName = skillChip.querySelector('.skill-name')?.textContent || skillChip.textContent.trim();
            const parentCategory = skillChip.closest('.skill-category');
            const categoryTitle = parentCategory?.querySelector('.category-title')?.textContent || 'unknown';

            this.engagementData.skillInteractions++;

            this.analytics.trackEvent('skills_chip_click', {
                skill_name: skillName,
                parent_category: categoryTitle,
                skill_interaction_count: this.engagementData.skillInteractions,
                click_source: 'category_grid'
            });

            if (this.analytics.isDebugMode) {
                console.log(`🔧 Skill chip clicked: ${skillName} (${categoryTitle})`);
            }
        });
    }

    /**
     * Track skills modal interactions
     */
    setupModalTracking() {
        // Override SkillsModal methods if they exist
        if (window.SkillsModal && window.SkillsModal.prototype) {
            const originalShowSkillModal = window.SkillsModal.prototype.showSkillModal;
            const trackingInstance = this; // ✅ Capture the tracking instance

            window.SkillsModal.prototype.showSkillModal = function (categoryId) {
                trackingInstance.engagementData.modalOpens++; // ✅ Use captured reference

                trackingInstance.analytics.trackEvent('skills_modal_open', {
                    category_id: categoryId,
                    modal_opens_count: trackingInstance.engagementData.modalOpens,
                    trigger_source: 'category_click'
                });

                if (trackingInstance.analytics.isDebugMode) {
                    console.log(`📱 Skills modal opened for category: ${categoryId}`);
                }

                return originalShowSkillModal.call(this, categoryId); // ✅ `this` = SkillsModal instance
            };
        }
    }

    /**
     * Track section engagement
     */
    setupEngagementTracking() {
        const skillsSection = document.querySelector('#skills');
        if (!skillsSection) return;

        const skillsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.engagementData.enterTime = Date.now();
                    this.engagementData.viewCount++;

                    this.analytics.trackEvent('skills_section_enter', {
                        view_count: this.engagementData.viewCount,
                        intersection_ratio: Math.round(entry.intersectionRatio * 100),
                        total_categories: skillsSection.querySelectorAll('.skill-category').length
                    });

                    // Track deep engagement after 20 seconds
                    setTimeout(() => {
                        if (this.engagementData.enterTime &&
                            (Date.now() - this.engagementData.enterTime) >= 20000) {
                            if (!this.engagementData.deepEngagement) {
                                this.engagementData.deepEngagement = true;
                                this.analytics.trackEvent('skills_deep_engagement', {
                                    engagement_time: 20000,
                                    category_clicks: this.engagementData.categoryClicks,
                                    skill_interactions: this.engagementData.skillInteractions,
                                    modal_opens: this.engagementData.modalOpens
                                });

                                if (this.analytics.isDebugMode) {
                                    console.log('🎯 Skills deep engagement tracked (20s+)');
                                }
                            }
                        }
                    }, 20000);

                } else {
                    if (this.engagementData.enterTime) {
                        const sessionTime = Date.now() - this.engagementData.enterTime;
                        this.engagementData.totalTime += sessionTime;

                        this.analytics.trackEvent('skills_section_exit', {
                            session_time: Math.round(sessionTime / 1000),
                            total_time: Math.round(this.engagementData.totalTime / 1000),
                            category_clicks: this.engagementData.categoryClicks,
                            skill_interactions: this.engagementData.skillInteractions
                        });

                        this.engagementData.enterTime = null;

                        if (this.analytics.isDebugMode) {
                            console.log(`👋 Skills section exited: ${Math.round(sessionTime / 1000)}s session`);
                        }
                    }
                }
            });
        }, {
            threshold: [0.1, 0.25, 0.5, 0.75],
            rootMargin: '0px'
        });

        skillsObserver.observe(skillsSection);
        this.observers.push(skillsObserver);
    }

    /**
     * Track scroll interactions within skills
     */
    setupScrollTracking() {
        const skillsSection = document.querySelector('#skills');
        if (!skillsSection) return;

        let skillsScrollTimeout = null;
        const scrollHandler = () => {
            const skillsRect = skillsSection.getBoundingClientRect();
            const isInSkills = skillsRect.top < window.innerHeight && skillsRect.bottom > 0;

            if (isInSkills && this.engagementData.enterTime) {
                if (skillsScrollTimeout) clearTimeout(skillsScrollTimeout);
                skillsScrollTimeout = setTimeout(() => {
                    this.analytics.trackEvent('skills_scroll_interaction', {
                        scroll_y: window.scrollY,
                        skills_visibility: Math.max(0, Math.min(1,
                            (window.innerHeight - skillsRect.top) / skillsRect.height
                        )),
                        unity_visible: document.querySelector('.unity-spotlight')?.getBoundingClientRect().top < window.innerHeight
                    });
                }, 500);
            }
        };

        window.addEventListener('scroll', scrollHandler);
    }

    /**
     * Track progress bar animations
     */
    trackProgressAnimations() {
        const progressBars = document.querySelectorAll('.progress-energy, .stat-fill');
        if (progressBars.length === 0) return;

        this.analytics.trackEvent('skills_progress_animated', {
            animated_bars: progressBars.length,
            animation_timestamp: Date.now()
        });

        if (this.analytics.isDebugMode) {
            console.log(`📊 Skills progress bars animated: ${progressBars.length}`);
        }
    }

    /**
     * Get skills analytics summary
     */
    getSummary() {
        const skillsEvents = this.analytics.sessionData.interactions.filter(
            interaction => interaction.event.startsWith('skills_')
        );

        const summary = {
            total_skills_events: skillsEvents.length,
            category_clicks: skillsEvents.filter(e => e.event === 'skills_category_click').length,
            skill_chip_clicks: skillsEvents.filter(e => e.event === 'skills_chip_click').length,
            unity_skill_clicks: skillsEvents.filter(e => e.event === 'skills_unity_skill_click').length,
            modal_opens: skillsEvents.filter(e => e.event === 'skills_modal_open').length,
            deep_engagement: skillsEvents.some(e => e.event === 'skills_deep_engagement'),
            section_views: skillsEvents.filter(e => e.event === 'skills_section_enter').length,
            engagement_data: this.engagementData
        };

        if (this.analytics.isDebugMode) {
            console.group('⚡ Skills Analytics Summary');
            console.log(summary);
            console.log('Recent skills events:', skillsEvents.slice(-5));
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
window.SkillsSectionTracking = SkillsSectionTracking;