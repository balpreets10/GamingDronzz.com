/**
 * Contact Section Analytics Tracking
 * Dedicated tracking class for contact section interactions
 */
class ContactSectionTracking {
    constructor(analyticsManager) {
        this.analytics = analyticsManager;
        this.isInitialized = false;
        this.engagementData = {
            enterTime: null,
            totalTime: 0,
            viewCount: 0,
            contactClicks: 0,
            socialClicks: 0,
            deepEngagement: false
        };
        this.observers = [];
    }

    /**
     * Initialize all contact tracking
     */
    init() {
        if (this.isInitialized) return;

        setTimeout(() => {
            this.setupContactLinkTracking();
            this.setupSocialLinkTracking();
            this.setupEngagementTracking();
            this.setupScrollTracking();
            this.isInitialized = true;

            if (this.analytics.isDebugMode) {
                console.log('📧 Contact section tracking initialized');
            }
        }, 1000);
    }

    /**
     * Track contact link interactions
     */
    setupContactLinkTracking() {
        const contactSection = document.querySelector('#contact');
        if (!contactSection) return;

        contactSection.addEventListener('click', (e) => {
            const contactLink = e.target.closest('.contact-link');
            if (!contactLink) return;

            const contactType = this.getContactType(contactLink);
            const contactValue = contactLink.querySelector('.contact-value')?.textContent || 'unknown';
            const href = contactLink.getAttribute('href') || '';

            this.engagementData.contactClicks++;

            this.analytics.trackEvent('contact_link_click', {
                contact_type: contactType,
                contact_value: contactValue,
                href: href,
                contact_click_count: this.engagementData.contactClicks,
                opens_external: contactLink.target === '_blank'
            });

            if (this.analytics.isDebugMode) {
                console.log(`📞 Contact link clicked: ${contactType} - ${contactValue}`);
            }
        });
    }

    /**
     * Track social link interactions
     */
    setupSocialLinkTracking() {
        const contactSection = document.querySelector('#contact');
        if (!contactSection) return;

        contactSection.addEventListener('click', (e) => {
            const socialLink = e.target.closest('.social-link');
            if (!socialLink) return;

            const platform = this.getSocialPlatform(socialLink);
            const href = socialLink.getAttribute('href') || '';
            const linkText = socialLink.textContent.trim();

            this.engagementData.socialClicks++;

            this.analytics.trackEvent('contact_social_click', {
                social_platform: platform,
                link_text: linkText,
                href: href,
                social_click_count: this.engagementData.socialClicks,
                position: 'contact_section'
            });

            if (this.analytics.isDebugMode) {
                console.log(`🌐 Contact social clicked: ${platform}`);
            }
        });

        // Track social hover effects
        contactSection.addEventListener('mouseenter', (e) => {
            const socialLink = e.target.closest('.social-link');
            if (!socialLink) return;

            const platform = this.getSocialPlatform(socialLink);
            this.analytics.trackEvent('contact_social_hover', {
                social_platform: platform,
                hover_timestamp: Date.now()
            });
        }, true);
    }

    /**
     * Track section engagement
     */
    setupEngagementTracking() {
        const contactSection = document.querySelector('#contact');
        if (!contactSection) return;

        const contactObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.engagementData.enterTime = Date.now();
                    this.engagementData.viewCount++;

                    this.analytics.trackEvent('contact_section_enter', {
                        view_count: this.engagementData.viewCount,
                        intersection_ratio: Math.round(entry.intersectionRatio * 100),
                        available_contact_methods: contactSection.querySelectorAll('.contact-link').length,
                        available_social_links: contactSection.querySelectorAll('.social-link').length
                    });

                    // Track deep engagement after 8 seconds
                    setTimeout(() => {
                        if (this.engagementData.enterTime &&
                            (Date.now() - this.engagementData.enterTime) >= 8000) {
                            if (!this.engagementData.deepEngagement) {
                                this.engagementData.deepEngagement = true;
                                this.analytics.trackEvent('contact_deep_engagement', {
                                    engagement_time: 8000,
                                    contact_clicks: this.engagementData.contactClicks,
                                    social_clicks: this.engagementData.socialClicks
                                });

                                if (this.analytics.isDebugMode) {
                                    console.log('🎯 Contact deep engagement tracked (8s+)');
                                }
                            }
                        }
                    }, 8000);

                } else {
                    if (this.engagementData.enterTime) {
                        const sessionTime = Date.now() - this.engagementData.enterTime;
                        this.engagementData.totalTime += sessionTime;

                        this.analytics.trackEvent('contact_section_exit', {
                            session_time: Math.round(sessionTime / 1000),
                            total_time: Math.round(this.engagementData.totalTime / 1000),
                            contact_clicks: this.engagementData.contactClicks,
                            social_clicks: this.engagementData.socialClicks
                        });

                        this.engagementData.enterTime = null;

                        if (this.analytics.isDebugMode) {
                            console.log(`👋 Contact section exited: ${Math.round(sessionTime / 1000)}s session`);
                        }
                    }
                }
            });
        }, {
            threshold: [0.1, 0.25, 0.5, 0.75],
            rootMargin: '0px'
        });

        contactObserver.observe(contactSection);
        this.observers.push(contactObserver);
    }

    /**
     * Track scroll interactions within contact
     */
    setupScrollTracking() {
        const contactSection = document.querySelector('#contact');
        if (!contactSection) return;

        let contactScrollTimeout = null;
        const scrollHandler = () => {
            const contactRect = contactSection.getBoundingClientRect();
            const isInContact = contactRect.top < window.innerHeight && contactRect.bottom > 0;

            if (isInContact && this.engagementData.enterTime) {
                if (contactScrollTimeout) clearTimeout(contactScrollTimeout);
                contactScrollTimeout = setTimeout(() => {
                    this.analytics.trackEvent('contact_scroll_interaction', {
                        scroll_y: window.scrollY,
                        contact_visibility: Math.max(0, Math.min(1,
                            (window.innerHeight - contactRect.top) / contactRect.height
                        )),
                        at_page_bottom: (window.scrollY + window.innerHeight) >= document.body.scrollHeight - 100
                    });
                }, 500);
            }
        };

        window.addEventListener('scroll', scrollHandler);
    }

    /**
     * Get contact type from link element
     */
    getContactType(linkElement) {
        const href = linkElement.getAttribute('href') || '';
        const iconClass = linkElement.querySelector('i')?.className || '';

        if (href.startsWith('mailto:') || iconClass.includes('envelope')) return 'email';
        if (href.startsWith('tel:') || iconClass.includes('phone')) return 'phone';
        if (href.includes('maps.google') || iconClass.includes('map-marker')) return 'location';

        return 'unknown';
    }

    /**
     * Get social platform from link element
     */
    getSocialPlatform(linkElement) {
        const href = linkElement.getAttribute('href') || '';
        const iconClass = linkElement.querySelector('i')?.className || '';
        const linkText = linkElement.textContent.toLowerCase();

        if (href.includes('linkedin') || iconClass.includes('linkedin') || linkText.includes('linkedin')) return 'linkedin';
        if (href.includes('github') || iconClass.includes('github') || linkText.includes('github')) return 'github';
        if (href.includes('twitter') || href.includes('x.com') || iconClass.includes('twitter') || linkText.includes('twitter')) return 'twitter';
        if (href.includes('itch.io') || iconClass.includes('itch-io') || linkText.includes('itch')) return 'itch_io';
        if (href.includes('instagram') || iconClass.includes('instagram') || linkText.includes('instagram')) return 'instagram';
        if (href.includes('facebook') || iconClass.includes('facebook') || linkText.includes('facebook')) return 'facebook';

        return 'unknown';
    }

    /**
     * Track contact card animations
     */
    trackContactCardAnimation() {
        this.analytics.trackEvent('contact_card_animated', {
            animation_timestamp: Date.now(),
            animation_type: 'fade_in'
        });

        if (this.analytics.isDebugMode) {
            console.log('🎬 Contact card animation tracked');
        }
    }

    /**
     * Get contact analytics summary
     */
    getSummary() {
        const contactEvents = this.analytics.sessionData.interactions.filter(
            interaction => interaction.event.startsWith('contact_')
        );

        const summary = {
            total_contact_events: contactEvents.length,
            contact_link_clicks: contactEvents.filter(e => e.event === 'contact_link_click').length,
            social_link_clicks: contactEvents.filter(e => e.event === 'contact_social_click').length,
            social_hovers: contactEvents.filter(e => e.event === 'contact_social_hover').length,
            deep_engagement: contactEvents.some(e => e.event === 'contact_deep_engagement'),
            section_views: contactEvents.filter(e => e.event === 'contact_section_enter').length,
            engagement_data: this.engagementData
        };

        if (this.analytics.isDebugMode) {
            console.group('📧 Contact Analytics Summary');
            console.log(summary);
            console.log('Recent contact events:', contactEvents.slice(-5));
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
window.ContactSectionTracking = ContactSectionTracking;