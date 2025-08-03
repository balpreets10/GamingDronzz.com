/**
 * Hero Section Analytics Tracking
 * Dedicated tracking class for hero section interactions
 */
class HeroSectionTracking {
    constructor(analyticsManager) {
        this.analytics = analyticsManager;
        this.isInitialized = false;
        this.engagementData = {
            enterTime: null,
            totalTime: 0,
            viewCount: 0,
            scrollInteractions: 0,
            deepEngagement: false
        };
        this.observers = [];
    }

    /**
     * Initialize all hero tracking
     */
    init() {
        if (this.isInitialized) return;

        setTimeout(() => {
            this.setupActionButtonTracking();
            this.setupSocialLinksTracking();
            this.setupStatsTracking();
            this.setupEngagementTracking();
            this.setupScrollTracking();
            this.isInitialized = true;

            if (this.analytics.isDebugMode) {
                console.log('🦸 Hero section tracking initialized');
            }
        }, 1000);
    }

    /**
     * Track hero action buttons
     */
    setupActionButtonTracking() {
        const heroSection = document.querySelector('#hero');
        if (!heroSection) return;

        heroSection.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.hero-actions .btn');
            if (!actionBtn) return;

            const buttonText = actionBtn.textContent.trim();
            const buttonClass = actionBtn.className;
            const targetHref = actionBtn.getAttribute('href');

            this.analytics.trackEvent('hero_action_click', {
                button_text: buttonText,
                button_type: buttonClass.includes('btn-primary') ? 'primary' : 'secondary',
                target_section: targetHref?.replace('#', '') || 'unknown',
                position: 'hero_actions'
            });

            if (this.analytics.isDebugMode) {
                console.log(`🎯 Hero action clicked: ${buttonText} → ${targetHref}`);
            }
        });
    }

    /**
     * Track social links
     */
    setupSocialLinksTracking() {
        const heroSection = document.querySelector('#hero');
        if (!heroSection) return;

        heroSection.addEventListener('click', (e) => {
            const socialLink = e.target.closest('.social-links a');
            if (!socialLink) return;

            const platform = this.getSocialPlatform(socialLink);
            const href = socialLink.getAttribute('href');

            this.analytics.trackEvent('hero_social_click', {
                social_platform: platform,
                link_url: href,
                position: 'hero_social'
            });

            if (this.analytics.isDebugMode) {
                console.log(`🌐 Hero social clicked: ${platform}`);
            }
        });
    }

    /**
     * Track stats interactions (tooltips)
     */
    setupStatsTracking() {
        const statItems = document.querySelectorAll('#hero .stat-item');

        statItems.forEach((statItem, index) => {
            const statLabel = statItem.querySelector('.stat-label')?.textContent || `stat_${index}`;
            const statValue = statItem.querySelector('.stat-number')?.textContent || '0';

            let hoverStartTime = null;
            let tooltipShown = false;

            // Hover tracking
            statItem.addEventListener('mouseenter', () => {
                hoverStartTime = Date.now();

                this.analytics.trackEvent('hero_stat_hover_start', {
                    stat_label: statLabel,
                    stat_value: statValue,
                    stat_index: index
                });

                // Track 2-second hover completion
                setTimeout(() => {
                    if (hoverStartTime && (Date.now() - hoverStartTime) >= 1900) {
                        this.analytics.trackEvent('hero_stat_tooltip_shown', {
                            stat_label: statLabel,
                            stat_value: statValue,
                            stat_index: index,
                            trigger_type: 'hover_delay',
                            hover_duration: 2000
                        });
                        tooltipShown = true;

                        if (this.analytics.isDebugMode) {
                            console.log(`💡 Hero stat tooltip shown via hover: ${statLabel}`);
                        }
                    }
                }, 2000);
            });

            statItem.addEventListener('mouseleave', () => {
                if (hoverStartTime) {
                    const hoverDuration = Date.now() - hoverStartTime;

                    this.analytics.trackEvent('hero_stat_hover_end', {
                        stat_label: statLabel,
                        stat_value: statValue,
                        stat_index: index,
                        hover_duration: hoverDuration,
                        tooltip_shown: tooltipShown
                    });

                    hoverStartTime = null;
                    tooltipShown = false;
                }
            });

            // Click tracking
            statItem.addEventListener('click', (e) => {
                e.preventDefault();

                this.analytics.trackEvent('hero_stat_click', {
                    stat_label: statLabel,
                    stat_value: statValue,
                    stat_index: index,
                    trigger_type: 'click'
                });

                if (this.analytics.isDebugMode) {
                    console.log(`🖱️ Hero stat clicked: ${statLabel}`);
                }
            });
        });
    }

    /**
     * Track section engagement
     */
    setupEngagementTracking() {
        const heroSection = document.querySelector('#hero');
        if (!heroSection) return;

        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.engagementData.enterTime = Date.now();
                    this.engagementData.viewCount++;

                    this.analytics.trackEvent('hero_section_enter', {
                        view_count: this.engagementData.viewCount,
                        intersection_ratio: Math.round(entry.intersectionRatio * 100),
                        viewport_height: window.innerHeight
                    });

                    // Track deep engagement after 10 seconds
                    setTimeout(() => {
                        if (this.engagementData.enterTime &&
                            (Date.now() - this.engagementData.enterTime) >= 10000) {
                            if (!this.engagementData.deepEngagement) {
                                this.engagementData.deepEngagement = true;
                                this.analytics.trackEvent('hero_deep_engagement', {
                                    engagement_time: 10000,
                                    view_count: this.engagementData.viewCount
                                });

                                if (this.analytics.isDebugMode) {
                                    console.log('🎯 Hero deep engagement tracked (10s+)');
                                }
                            }
                        }
                    }, 10000);

                } else {
                    if (this.engagementData.enterTime) {
                        const sessionTime = Date.now() - this.engagementData.enterTime;
                        this.engagementData.totalTime += sessionTime;

                        this.analytics.trackEvent('hero_section_exit', {
                            session_time: Math.round(sessionTime / 1000),
                            total_time: Math.round(this.engagementData.totalTime / 1000),
                            view_count: this.engagementData.viewCount,
                            scroll_interactions: this.engagementData.scrollInteractions
                        });

                        this.engagementData.enterTime = null;

                        if (this.analytics.isDebugMode) {
                            console.log(`👋 Hero section exited: ${Math.round(sessionTime / 1000)}s session`);
                        }
                    }
                }
            });
        }, {
            threshold: [0.1, 0.25, 0.5, 0.75, 1.0],
            rootMargin: '0px'
        });

        heroObserver.observe(heroSection);
        this.observers.push(heroObserver);
    }

    /**
     * Track scroll interactions within hero
     */
    setupScrollTracking() {
        const heroSection = document.querySelector('#hero');
        if (!heroSection) return;

        let heroScrollTimeout = null;
        const scrollHandler = () => {
            const heroRect = heroSection.getBoundingClientRect();
            const isInHero = heroRect.top < window.innerHeight && heroRect.bottom > 0;

            if (isInHero && this.engagementData.enterTime) {
                this.engagementData.scrollInteractions++;

                if (heroScrollTimeout) clearTimeout(heroScrollTimeout);
                heroScrollTimeout = setTimeout(() => {
                    this.analytics.trackEvent('hero_scroll_interaction', {
                        scroll_y: window.scrollY,
                        hero_visibility: Math.max(0, Math.min(1,
                            (window.innerHeight - heroRect.top) / heroRect.height
                        )),
                        interaction_count: this.engagementData.scrollInteractions
                    });
                }, 500);
            }
        };

        window.addEventListener('scroll', scrollHandler);
    }

    /**
     * Track hero animation type
     */
    trackAnimation(animationType) {
        this.analytics.trackEvent('hero_animation_displayed', {
            animation_type: animationType,
            timestamp: Date.now()
        });

        if (this.analytics.isDebugMode) {
            console.log(`✨ Hero animation tracked: ${animationType}`);
        }
    }

    /**
     * Get social platform from link
     */
    getSocialPlatform(linkElement) {
        const href = linkElement.getAttribute('href') || '';
        const iconClass = linkElement.querySelector('i')?.className || '';

        if (href.includes('linkedin') || iconClass.includes('linkedin')) return 'linkedin';
        if (href.includes('github') || iconClass.includes('github')) return 'github';
        if (href.includes('itch.io') || iconClass.includes('joystick')) return 'itch_io';
        if (href.includes('twitter') || iconClass.includes('twitter')) return 'twitter';
        if (href.includes('instagram') || iconClass.includes('instagram')) return 'instagram';

        return 'unknown';
    }

    /**
     * Get hero analytics summary
     */
    getSummary() {
        const heroEvents = this.analytics.sessionData.interactions.filter(
            interaction => interaction.event.startsWith('hero_')
        );

        const summary = {
            total_hero_events: heroEvents.length,
            action_clicks: heroEvents.filter(e => e.event === 'hero_action_click').length,
            social_clicks: heroEvents.filter(e => e.event === 'hero_social_click').length,
            stat_interactions: heroEvents.filter(e => e.event.includes('hero_stat')).length,
            deep_engagement: heroEvents.some(e => e.event === 'hero_deep_engagement'),
            section_views: heroEvents.filter(e => e.event === 'hero_section_enter').length,
            engagement_data: this.engagementData
        };

        if (this.analytics.isDebugMode) {
            console.group('🦸 Hero Analytics Summary');
            console.log(summary);
            console.log('Recent hero events:', heroEvents.slice(-5));
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
window.HeroSectionTracking = HeroSectionTracking;