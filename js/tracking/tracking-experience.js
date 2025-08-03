/**
 * Experience Section Analytics Tracking
 * Dedicated tracking class for experience section interactions
 */
class ExperienceSectionTracking {
    constructor(analyticsManager) {
        this.analytics = analyticsManager;
        this.isInitialized = false;
        this.engagementData = {
            enterTime: null,
            totalTime: 0,
            viewCount: 0,
            cardFlips: 0,
            badgeClicks: 0,
            deepEngagement: false
        };
        this.observers = [];
    }

    /**
     * Initialize all experience tracking
     */
    init() {
        if (this.isInitialized) return;

        setTimeout(() => {
            this.setupExperienceCardTracking();
            this.setupFlipTracking();
            this.setupBadgeTracking();
            this.setupEngagementTracking();
            this.setupScrollTracking();
            this.isInitialized = true;

            if (this.analytics.isDebugMode) {
                console.log('💼 Experience section tracking initialized');
            }
        }, 1000);
    }

    /**
     * Track experience card interactions
     */
    setupExperienceCardTracking() {
        const experienceSection = document.querySelector('#experience');
        if (!experienceSection) return;

        experienceSection.addEventListener('click', (e) => {
            const experienceCard = e.target.closest('.experience-flip-container');
            if (!experienceCard) return;

            // Don't track if clicking on badges
            if (e.target.closest('.tech-badge, .skill-badge, .project-badge')) return;

            const experienceId = experienceCard.getAttribute('data-experience-id') || 'unknown';
            const companyName = experienceCard.querySelector('.company-name')?.textContent || 'unknown';
            const position = experienceCard.querySelector('.position-title')?.textContent || 'unknown';
            const isFlipped = experienceCard.classList.contains('card-flipped');

            this.analytics.trackEvent('experience_card_click', {
                experience_id: experienceId,
                company_name: companyName,
                position: position,
                was_flipped: isFlipped,
                card_position: Array.from(experienceSection.querySelectorAll('.experience-flip-container')).indexOf(experienceCard)
            });

            if (this.analytics.isDebugMode) {
                console.log(`🎯 Experience card clicked: ${companyName} - ${position}`);
            }
        });

        // Track hover interactions
        experienceSection.addEventListener('mouseenter', (e) => {
            const experienceCard = e.target.closest('.experience-flip-container');
            if (!experienceCard) return;

            const companyName = experienceCard.querySelector('.company-name')?.textContent || 'unknown';
            this.analytics.trackEvent('experience_card_hover', {
                company_name: companyName,
                hover_timestamp: Date.now()
            });
        }, true);
    }

    /**
     * Track card flip interactions
     */
    setupFlipTracking() {
        const experienceSection = document.querySelector('#experience');
        if (!experienceSection) return;

        // Override flip functionality to track
        const flipContainers = experienceSection.querySelectorAll('.experience-flip-container');

        flipContainers.forEach((container) => {
            const flipCard = container.querySelector('.flip-card');
            if (!flipCard) return;

            // Track flip state changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const isFlipped = flipCard.classList.contains('flipped');
                        const companyName = container.querySelector('.company-name')?.textContent || 'unknown';

                        if (isFlipped) {
                            this.engagementData.cardFlips++;

                            this.analytics.trackEvent('experience_card_flip', {
                                company_name: companyName,
                                flip_direction: 'front_to_back',
                                flip_count: this.engagementData.cardFlips,
                                flip_timestamp: Date.now()
                            });

                            if (this.analytics.isDebugMode) {
                                console.log(`🔄 Experience card flipped: ${companyName}`);
                            }
                        } else {
                            this.analytics.trackEvent('experience_card_flip', {
                                company_name: companyName,
                                flip_direction: 'back_to_front',
                                flip_count: this.engagementData.cardFlips,
                                flip_timestamp: Date.now()
                            });
                        }
                    }
                });
            });

            observer.observe(flipCard, { attributes: true, attributeFilter: ['class'] });
            this.observers.push(observer);
        });
    }

    /**
     * Track badge/tag interactions
     */
    setupBadgeTracking() {
        const experienceSection = document.querySelector('#experience');
        if (!experienceSection) return;

        experienceSection.addEventListener('click', (e) => {
            const badge = e.target.closest('.tech-badge, .skill-badge, .project-badge');
            if (!badge) return;

            const badgeText = badge.textContent.trim();
            const badgeType = badge.classList.contains('tech-badge') ? 'technology' :
                badge.classList.contains('skill-badge') ? 'skill' : 'project';
            const parentCard = badge.closest('.experience-flip-container');
            const companyName = parentCard?.querySelector('.company-name')?.textContent || 'unknown';

            this.engagementData.badgeClicks++;

            this.analytics.trackEvent('experience_badge_click', {
                badge_text: badgeText,
                badge_type: badgeType,
                company_name: companyName,
                badge_click_count: this.engagementData.badgeClicks
            });

            if (this.analytics.isDebugMode) {
                console.log(`🏷️ Experience badge clicked: ${badgeText} (${badgeType})`);
            }
        });
    }

    /**
     * Track section engagement
     */
    setupEngagementTracking() {
        const experienceSection = document.querySelector('#experience');
        if (!experienceSection) return;

        const experienceObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.engagementData.enterTime = Date.now();
                    this.engagementData.viewCount++;

                    this.analytics.trackEvent('experience_section_enter', {
                        view_count: this.engagementData.viewCount,
                        intersection_ratio: Math.round(entry.intersectionRatio * 100),
                        total_experiences: experienceSection.querySelectorAll('.experience-flip-container').length
                    });

                    // Track deep engagement after 12 seconds
                    setTimeout(() => {
                        if (this.engagementData.enterTime &&
                            (Date.now() - this.engagementData.enterTime) >= 12000) {
                            if (!this.engagementData.deepEngagement) {
                                this.engagementData.deepEngagement = true;
                                this.analytics.trackEvent('experience_deep_engagement', {
                                    engagement_time: 12000,
                                    card_flips: this.engagementData.cardFlips,
                                    badge_clicks: this.engagementData.badgeClicks
                                });

                                if (this.analytics.isDebugMode) {
                                    console.log('🎯 Experience deep engagement tracked (12s+)');
                                }
                            }
                        }
                    }, 12000);

                } else {
                    if (this.engagementData.enterTime) {
                        const sessionTime = Date.now() - this.engagementData.enterTime;
                        this.engagementData.totalTime += sessionTime;

                        this.analytics.trackEvent('experience_section_exit', {
                            session_time: Math.round(sessionTime / 1000),
                            total_time: Math.round(this.engagementData.totalTime / 1000),
                            card_flips: this.engagementData.cardFlips,
                            badge_clicks: this.engagementData.badgeClicks
                        });

                        this.engagementData.enterTime = null;

                        if (this.analytics.isDebugMode) {
                            console.log(`👋 Experience section exited: ${Math.round(sessionTime / 1000)}s session`);
                        }
                    }
                }
            });
        }, {
            threshold: [0.1, 0.25, 0.5, 0.75],
            rootMargin: '0px'
        });

        experienceObserver.observe(experienceSection);
        this.observers.push(experienceObserver);
    }

    /**
     * Track scroll interactions within experience
     */
    setupScrollTracking() {
        const experienceSection = document.querySelector('#experience');
        if (!experienceSection) return;

        let experienceScrollTimeout = null;
        const scrollHandler = () => {
            const experienceRect = experienceSection.getBoundingClientRect();
            const isInExperience = experienceRect.top < window.innerHeight && experienceRect.bottom > 0;

            if (isInExperience && this.engagementData.enterTime) {
                if (experienceScrollTimeout) clearTimeout(experienceScrollTimeout);
                experienceScrollTimeout = setTimeout(() => {
                    const flippedCards = experienceSection.querySelectorAll('.flip-card.flipped').length;

                    this.analytics.trackEvent('experience_scroll_interaction', {
                        scroll_y: window.scrollY,
                        experience_visibility: Math.max(0, Math.min(1,
                            (window.innerHeight - experienceRect.top) / experienceRect.height
                        )),
                        flipped_cards: flippedCards,
                        total_cards: experienceSection.querySelectorAll('.experience-flip-container').length
                    });
                }, 500);
            }
        };

        window.addEventListener('scroll', scrollHandler);
    }

    /**
     * Track ripple effects (visual feedback)
     */
    trackRippleEffect(companyName) {
        this.analytics.trackEvent('experience_ripple_effect', {
            company_name: companyName,
            effect_timestamp: Date.now()
        });
    }

    /**
     * Get experience analytics summary
     */
    getSummary() {
        const experienceEvents = this.analytics.sessionData.interactions.filter(
            interaction => interaction.event.startsWith('experience_')
        );

        const summary = {
            total_experience_events: experienceEvents.length,
            card_clicks: experienceEvents.filter(e => e.event === 'experience_card_click').length,
            card_flips: experienceEvents.filter(e => e.event === 'experience_card_flip').length,
            badge_clicks: experienceEvents.filter(e => e.event === 'experience_badge_click').length,
            deep_engagement: experienceEvents.some(e => e.event === 'experience_deep_engagement'),
            section_views: experienceEvents.filter(e => e.event === 'experience_section_enter').length,
            engagement_data: this.engagementData
        };

        if (this.analytics.isDebugMode) {
            console.group('💼 Experience Analytics Summary');
            console.log(summary);
            console.log('Recent experience events:', experienceEvents.slice(-5));
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
window.ExperienceSectionTracking = ExperienceSectionTracking;