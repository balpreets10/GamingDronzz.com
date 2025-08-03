/**
 * Testimonials Section Analytics Tracking
 * Dedicated tracking class for testimonials section interactions
 */
class TestimonialsSectionTracking {
    constructor(analyticsManager) {
        this.analytics = analyticsManager;
        this.isInitialized = false;
        this.engagementData = {
            enterTime: null,
            totalTime: 0,
            viewCount: 0,
            testimonialClicks: 0,
            avatarClicks: 0,
            deepEngagement: false
        };
        this.observers = [];
    }

    /**
     * Initialize all testimonials tracking
     */
    init() {
        if (this.isInitialized) return;

        setTimeout(() => {
            this.setupTestimonialCardTracking();
            this.setupClientInfoTracking();
            this.setupEngagementTracking();
            this.setupScrollTracking();
            this.isInitialized = true;

            if (this.analytics.isDebugMode) {
                console.log('⭐ Testimonials section tracking initialized');
            }
        }, 1000);
    }

    /**
     * Track testimonial card interactions
     */
    setupTestimonialCardTracking() {
        const testimonialsSection = document.querySelector('#testimonials');
        if (!testimonialsSection) return;

        testimonialsSection.addEventListener('click', (e) => {
            const testimonialCard = e.target.closest('.testimonial-card');
            if (!testimonialCard) return;

            const clientName = testimonialCard.querySelector('.client-details h4')?.textContent || 'unknown';
            const clientPosition = testimonialCard.querySelector('.position')?.textContent || 'unknown';
            const isHighlight = testimonialCard.classList.contains('highlight');
            const cardIndex = Array.from(testimonialsSection.querySelectorAll('.testimonial-card')).indexOf(testimonialCard);

            this.engagementData.testimonialClicks++;

            this.analytics.trackEvent('testimonials_card_click', {
                client_name: clientName,
                client_position: clientPosition,
                is_highlight: isHighlight,
                card_index: cardIndex,
                testimonial_click_count: this.engagementData.testimonialClicks
            });

            if (this.analytics.isDebugMode) {
                console.log(`🎯 Testimonial card clicked: ${clientName} (${isHighlight ? 'Highlight' : 'Regular'})`);
            }
        });

        // Track hover interactions
        testimonialsSection.addEventListener('mouseenter', (e) => {
            const testimonialCard = e.target.closest('.testimonial-card');
            if (!testimonialCard) return;

            const clientName = testimonialCard.querySelector('.client-details h4')?.textContent || 'unknown';
            this.analytics.trackEvent('testimonials_card_hover', {
                client_name: clientName,
                hover_timestamp: Date.now()
            });
        }, true);
    }

    /**
     * Track client info interactions
     */
    setupClientInfoTracking() {
        const testimonialsSection = document.querySelector('#testimonials');
        if (!testimonialsSection) return;

        testimonialsSection.addEventListener('click', (e) => {
            const clientAvatar = e.target.closest('.client-avatar');
            if (clientAvatar) {
                const parentCard = clientAvatar.closest('.testimonial-card');
                const clientName = parentCard?.querySelector('.client-details h4')?.textContent || 'unknown';

                this.engagementData.avatarClicks++;

                this.analytics.trackEvent('testimonials_avatar_click', {
                    client_name: clientName,
                    avatar_click_count: this.engagementData.avatarClicks
                });

                if (this.analytics.isDebugMode) {
                    console.log(`👤 Testimonial avatar clicked: ${clientName}`);
                }
                return;
            }

            const clientDetails = e.target.closest('.client-details');
            if (clientDetails) {
                const clientName = clientDetails.querySelector('h4')?.textContent || 'unknown';
                const clientPosition = clientDetails.querySelector('.position')?.textContent || 'unknown';

                this.analytics.trackEvent('testimonials_client_info_click', {
                    client_name: clientName,
                    client_position: clientPosition,
                    click_element: 'client_details'
                });

                if (this.analytics.isDebugMode) {
                    console.log(`📋 Client details clicked: ${clientName}`);
                }
            }
        });
    }

    /**
     * Track section engagement
     */
    setupEngagementTracking() {
        const testimonialsSection = document.querySelector('#testimonials');
        if (!testimonialsSection) return;

        const testimonialsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.engagementData.enterTime = Date.now();
                    this.engagementData.viewCount++;

                    const totalTestimonials = testimonialsSection.querySelectorAll('.testimonial-card').length;
                    const highlightTestimonials = testimonialsSection.querySelectorAll('.testimonial-card.highlight').length;

                    this.analytics.trackEvent('testimonials_section_enter', {
                        view_count: this.engagementData.viewCount,
                        intersection_ratio: Math.round(entry.intersectionRatio * 100),
                        total_testimonials: totalTestimonials,
                        highlight_testimonials: highlightTestimonials
                    });

                    // Track deep engagement after 10 seconds
                    setTimeout(() => {
                        if (this.engagementData.enterTime &&
                            (Date.now() - this.engagementData.enterTime) >= 10000) {
                            if (!this.engagementData.deepEngagement) {
                                this.engagementData.deepEngagement = true;
                                this.analytics.trackEvent('testimonials_deep_engagement', {
                                    engagement_time: 10000,
                                    testimonial_clicks: this.engagementData.testimonialClicks,
                                    avatar_clicks: this.engagementData.avatarClicks
                                });

                                if (this.analytics.isDebugMode) {
                                    console.log('🎯 Testimonials deep engagement tracked (10s+)');
                                }
                            }
                        }
                    }, 10000);

                } else {
                    if (this.engagementData.enterTime) {
                        const sessionTime = Date.now() - this.engagementData.enterTime;
                        this.engagementData.totalTime += sessionTime;

                        this.analytics.trackEvent('testimonials_section_exit', {
                            session_time: Math.round(sessionTime / 1000),
                            total_time: Math.round(this.engagementData.totalTime / 1000),
                            testimonial_clicks: this.engagementData.testimonialClicks,
                            avatar_clicks: this.engagementData.avatarClicks
                        });

                        this.engagementData.enterTime = null;

                        if (this.analytics.isDebugMode) {
                            console.log(`👋 Testimonials section exited: ${Math.round(sessionTime / 1000)}s session`);
                        }
                    }
                }
            });
        }, {
            threshold: [0.1, 0.25, 0.5, 0.75],
            rootMargin: '0px'
        });

        testimonialsObserver.observe(testimonialsSection);
        this.observers.push(testimonialsObserver);
    }

    /**
     * Track scroll interactions within testimonials
     */
    setupScrollTracking() {
        const testimonialsSection = document.querySelector('#testimonials');
        if (!testimonialsSection) return;

        let testimonialsScrollTimeout = null;
        const scrollHandler = () => {
            const testimonialsRect = testimonialsSection.getBoundingClientRect();
            const isInTestimonials = testimonialsRect.top < window.innerHeight && testimonialsRect.bottom > 0;

            if (isInTestimonials && this.engagementData.enterTime) {
                if (testimonialsScrollTimeout) clearTimeout(testimonialsScrollTimeout);
                testimonialsScrollTimeout = setTimeout(() => {
                    this.analytics.trackEvent('testimonials_scroll_interaction', {
                        scroll_y: window.scrollY,
                        testimonials_visibility: Math.max(0, Math.min(1,
                            (window.innerHeight - testimonialsRect.top) / testimonialsRect.height
                        )),
                        testimonials_in_view: this.getTestimonialsInView(testimonialsSection)
                    });
                }, 500);
            }
        };

        window.addEventListener('scroll', scrollHandler);
    }

    /**
     * Get number of testimonials currently in view
     */
    getTestimonialsInView(testimonialsSection) {
        const testimonialCards = testimonialsSection.querySelectorAll('.testimonial-card');
        let inViewCount = 0;

        testimonialCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                inViewCount++;
            }
        });

        return inViewCount;
    }

    /**
     * Track testimonial animation completion
     */
    trackTestimonialAnimation(clientName) {
        this.analytics.trackEvent('testimonials_animation_complete', {
            client_name: clientName,
            animation_timestamp: Date.now()
        });

        if (this.analytics.isDebugMode) {
            console.log(`🎬 Testimonial animation completed: ${clientName}`);
        }
    }

    /**
     * Track quote reading engagement (for longer quotes)
     */
    trackQuoteReadEngagement(quoteElement) {
        const clientName = quoteElement.closest('.testimonial-card')?.querySelector('.client-details h4')?.textContent || 'unknown';
        const quoteLength = quoteElement.textContent.length;
        const estimatedReadTime = Math.max(2000, quoteLength * 50); // 50ms per character, minimum 2s

        setTimeout(() => {
            if (this.engagementData.enterTime) { // Still in section
                this.analytics.trackEvent('testimonials_quote_read', {
                    client_name: clientName,
                    quote_length: quoteLength,
                    estimated_read_time: estimatedReadTime
                });

                if (this.analytics.isDebugMode) {
                    console.log(`📖 Quote reading tracked: ${clientName}`);
                }
            }
        }, estimatedReadTime);
    }

    /**
     * Get testimonials analytics summary
     */
    getSummary() {
        const testimonialsEvents = this.analytics.sessionData.interactions.filter(
            interaction => interaction.event.startsWith('testimonials_')
        );

        const summary = {
            total_testimonials_events: testimonialsEvents.length,
            card_clicks: testimonialsEvents.filter(e => e.event === 'testimonials_card_click').length,
            avatar_clicks: testimonialsEvents.filter(e => e.event === 'testimonials_avatar_click').length,
            client_info_clicks: testimonialsEvents.filter(e => e.event === 'testimonials_client_info_click').length,
            deep_engagement: testimonialsEvents.some(e => e.event === 'testimonials_deep_engagement'),
            section_views: testimonialsEvents.filter(e => e.event === 'testimonials_section_enter').length,
            engagement_data: this.engagementData
        };

        if (this.analytics.isDebugMode) {
            console.group('⭐ Testimonials Analytics Summary');
            console.log(summary);
            console.log('Recent testimonials events:', testimonialsEvents.slice(-5));
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
window.TestimonialsSectionTracking = TestimonialsSectionTracking;