/**
 * Enhanced Analytics Manager with All Section and Modal Trackers
 * Complete integration of both section and modal tracking
 */
class AnalyticsManager {
    constructor() {
        this.isInitialized = false;
        this.trackingId = null;
        this.isDebugMode = this.isLocalhost();
        this.isProduction = !this.isDebugMode;

        this.sessionData = {
            startTime: Date.now(),
            sections: new Map(),
            interactions: [],
            scrollDepth: new Set(),
            timeSpent: new Map()
        };

        // Section tracking configuration
        this.sectionConfig = {
            hero: { name: 'Hero Section', trackEngagement: true },
            game: { name: 'Interactive Game', trackEngagement: true },
            portfolio: { name: 'Portfolio', trackEngagement: true },
            skills: { name: 'Skills Matrix', trackEngagement: true },
            experience: { name: 'Experience', trackEngagement: true },
            testimonials: { name: 'Testimonials', trackEngagement: true },
            contact: { name: 'Contact', trackEngagement: true }
        };

        this.observers = new Map();
        this.debugConsole = this.createDebugConsole();

        // Section Trackers
        this.sectionTrackers = new Map();
        this.initializeSectionTrackers();
        this.startTrackingSections();

        // Modal Trackers
        this.modalTrackers = new Map();
        this.initializeModalTrackers();

        // Log environment detection
        console.log(`Analytics Environment: ${this.isDebugMode ? 'DEBUG (localhost)' : 'PRODUCTION'}`);
    }

    initializeSectionTrackers() {
        // Initialize after a delay to ensure DOM is ready
        setTimeout(() => {
            this.initializeHeroTracker();
            this.initializePortfolioTracker();
            this.initializeSkillsTracker();
            this.initializeExperienceTracker();
            this.initializeContactTracker();
            this.initializeTestimonialsTracker();
        }, 1500);
    }

    initializeModalTrackers() {
        // Initialize after a delay to ensure modal classes are loaded
        setTimeout(() => {
            this.initializeGameInfoModalTracker();
            this.initializeProjectModalTracker();
            this.initializeSkillsModalTracker();
        }, 2000);
    }

    /**
     * Initialize hero section tracking
     */
    initializeHeroTracker() {
        if (window.HeroSectionTracking) {
            const heroTracker = new HeroSectionTracking(this);
            heroTracker.init();
            this.sectionTrackers.set('hero', heroTracker);

            if (this.isDebugMode) {
                console.log('🦸 Hero tracker registered');
            }
        }
    }

    /**
     * Initialize portfolio section tracking
     */
    initializePortfolioTracker() {
        if (window.PortfolioSectionTracking) {
            const portfolioTracker = new PortfolioSectionTracking(this);
            portfolioTracker.init();
            this.sectionTrackers.set('portfolio', portfolioTracker);

            if (this.isDebugMode) {
                console.log('💼 Portfolio tracker registered');
            }
        }
    }

    /**
     * Initialize skills section tracking
     */
    initializeSkillsTracker() {
        if (window.SkillsSectionTracking) {
            const skillsTracker = new SkillsSectionTracking(this);
            skillsTracker.init();
            this.sectionTrackers.set('skills', skillsTracker);

            if (this.isDebugMode) {
                console.log('⚡ Skills tracker registered');
            }
        }
    }

    /**
     * Initialize experience section tracking
     */
    initializeExperienceTracker() {
        if (window.ExperienceSectionTracking) {
            const experienceTracker = new ExperienceSectionTracking(this);
            experienceTracker.init();
            this.sectionTrackers.set('experience', experienceTracker);

            if (this.isDebugMode) {
                console.log('💼 Experience tracker registered');
            }
        }
    }

    /**
     * Initialize contact section tracking
     */
    initializeContactTracker() {
        if (window.ContactSectionTracking) {
            const contactTracker = new ContactSectionTracking(this);
            contactTracker.init();
            this.sectionTrackers.set('contact', contactTracker);

            if (this.isDebugMode) {
                console.log('📧 Contact tracker registered');
            }
        }
    }

    /**
     * Initialize testimonials section tracking
     */
    initializeTestimonialsTracker() {
        if (window.TestimonialsSectionTracking) {
            const testimonialsTracker = new TestimonialsSectionTracking(this);
            testimonialsTracker.init();
            this.sectionTrackers.set('testimonials', testimonialsTracker);

            if (this.isDebugMode) {
                console.log('⭐ Testimonials tracker registered');
            }
        }
    }

    /**
     * Initialize game info modal tracking
     */
    initializeGameInfoModalTracker() {
        if (window.GameInfoModalTracking) {
            const gameInfoModalTracker = new GameInfoModalTracking(this);
            gameInfoModalTracker.init();
            this.modalTrackers.set('gameInfo', gameInfoModalTracker);

            if (this.isDebugMode) {
                console.log('🎮 Game Info Modal tracker registered');
            }
        }
    }

    /**
     * Initialize project modal tracking
     */
    initializeProjectModalTracker() {
        if (window.ProjectModalTracking) {
            const projectModalTracker = new ProjectModalTracking(this);
            projectModalTracker.init();
            this.modalTrackers.set('project', projectModalTracker);

            if (this.isDebugMode) {
                console.log('🖼️ Project Modal tracker registered');
            }
        }
    }

    /**
     * Initialize skills modal tracking
     */
    initializeSkillsModalTracker() {
        if (window.SkillsModalTracking) {
            const skillsModalTracker = new SkillsModalTracking(this);
            skillsModalTracker.init();
            this.modalTrackers.set('skills', skillsModalTracker);

            if (this.isDebugMode) {
                console.log('⚡ Skills Modal tracker registered');
            }
        }
    }

    /**
     * Get specific section tracker
     */
    getSectionTracker(sectionName) {
        return this.sectionTrackers.get(sectionName);
    }

    /**
     * Get specific modal tracker
     */
    getModalTracker(modalName) {
        return this.modalTrackers.get(modalName);
    }

    /**
     * Get all section summaries
     */
    getAllSectionSummaries() {
        const summaries = {};
        this.sectionTrackers.forEach((tracker, sectionName) => {
            if (tracker.getSummary) {
                summaries[sectionName] = tracker.getSummary();
            }
        });
        return summaries;
    }

    /**
     * Get all modal summaries
     */
    getAllModalSummaries() {
        const summaries = {};
        this.modalTrackers.forEach((tracker, modalName) => {
            if (tracker.getSummary) {
                summaries[modalName] = tracker.getSummary();
            }
        });
        return summaries;
    }

    /**
     * Enhanced debug console with section and modal tracking data
     */
    createDebugConsole() {
        if (!this.isDebugMode) return null;

        const debugData = {
            events: [],
            sections: new Map(),
            interactions: 0,
            startTime: Date.now()
        };

        // Add debug methods to window for easy testing
        window.analyticsDebug = {
            getEvents: () => debugData.events,
            getSections: () => Array.from(debugData.sections.entries()),
            getInteractions: () => debugData.interactions,
            getSessionTime: () => Math.round((Date.now() - debugData.startTime) / 1000),
            clearEvents: () => { debugData.events = []; console.log('🧹 Debug events cleared'); },

            // Section-specific methods
            getHeroSummary: () => this.getSectionTracker('hero')?.getSummary(),
            getPortfolioSummary: () => this.getSectionTracker('portfolio')?.getSummary(),
            getSkillsSummary: () => this.getSectionTracker('skills')?.getSummary(),
            getExperienceSummary: () => this.getSectionTracker('experience')?.getSummary(),
            getContactSummary: () => this.getSectionTracker('contact')?.getSummary(),
            getTestimonialsSummary: () => this.getSectionTracker('testimonials')?.getSummary(),
            getAllSectionSummaries: () => this.getAllSectionSummaries(),

            // Modal-specific methods
            getGameInfoModalSummary: () => this.getModalTracker('gameInfo')?.getSummary(),
            getProjectModalSummary: () => this.getModalTracker('project')?.getSummary(),
            getSkillsModalSummary: () => this.getModalTracker('skills')?.getSummary(),
            getAllModalSummaries: () => this.getAllModalSummaries(),

            showSummary: () => {
                console.group('📊 Analytics Debug Summary');
                console.log('Environment:', this.isDebugMode ? 'DEBUG MODE' : 'PRODUCTION');
                console.log('Total Events:', debugData.events.length);
                console.log('Sections Tracked:', debugData.sections.size);
                console.log('Total Interactions:', debugData.interactions);
                console.log('Session Time:', Math.round((Date.now() - debugData.startTime) / 1000) + 's');
                console.log('Active Section Trackers:', Array.from(this.sectionTrackers.keys()));
                console.log('Active Modal Trackers:', Array.from(this.modalTrackers.keys()));
                console.log('Recent Events:', debugData.events.slice(-10));
                console.groupEnd();
            },

            showSectionBreakdown: () => {
                console.group('📈 Section Analytics Breakdown');
                this.sectionTrackers.forEach((tracker, sectionName) => {
                    if (tracker.getSummary) {
                        console.group(`${sectionName.toUpperCase()} Section`);
                        console.log(tracker.getSummary());
                        console.groupEnd();
                    }
                });
                console.groupEnd();
            },

            showModalBreakdown: () => {
                console.group('🪟 Modal Analytics Breakdown');
                this.modalTrackers.forEach((tracker, modalName) => {
                    if (tracker.getSummary) {
                        console.group(`${modalName.toUpperCase()} Modal`);
                        console.log(tracker.getSummary());
                        console.groupEnd();
                    }
                });
                console.groupEnd();
            },

            showFullBreakdown: () => {
                console.group('📊 Complete Analytics Breakdown');
                console.log('=== SECTIONS ===');
                this.sectionTrackers.forEach((tracker, sectionName) => {
                    if (tracker.getSummary) {
                        console.group(`${sectionName.toUpperCase()} Section`);
                        console.log(tracker.getSummary());
                        console.groupEnd();
                    }
                });
                console.log('=== MODALS ===');
                this.modalTrackers.forEach((tracker, modalName) => {
                    if (tracker.getSummary) {
                        console.group(`${modalName.toUpperCase()} Modal`);
                        console.log(tracker.getSummary());
                        console.groupEnd();
                    }
                });
                console.groupEnd();
            }
        };

        console.log('🐛 Analytics Debug Mode Active - Enhanced with section and modal tracking');
        console.log('📋 Available methods: showModalBreakdown(), showFullBreakdown(), getProjectModalSummary()');
        return debugData;
    }

    /**
     * Detect if running on localhost or development environment
     */
    isLocalhost() {
        const hostname = window.location.hostname;
        return hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '0.0.0.0' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.includes('local') ||
            window.location.port !== '' ||
            hostname === '';
    }

    /**
     * Initialize Google Analytics with environment-specific configuration
     */
    async init(trackingId, withConsent = false) {
        if (this.isInitialized) {
            console.log('Analytics already initialized');
            return;
        }

        if (!withConsent && this.isProduction) {
            console.log('Analytics initialization blocked - no user consent (production)');
            return;
        }

        this.trackingId = trackingId;

        try {
            if (this.isDebugMode) {
                await this.initDebugMode(trackingId);
            } else {
                await this.initProductionMode(trackingId);
            }

            this.isInitialized = true;
            console.log(`Analytics initialized: ${this.isDebugMode ? 'DEBUG MODE' : 'PRODUCTION MODE'}`);
            this.trackPageView();

        } catch (error) {
            console.error('Failed to initialize analytics:', error);
        }
    }

    /**
     * Initialize debug mode (localhost)
     */
    async initDebugMode(trackingId) {
        console.log('🐛 Initializing Analytics in DEBUG mode');
        console.log('📍 All events will be logged to console instead of sent to Google Analytics');

        window.dataLayer = window.dataLayer || [];
        window.gtag = (...args) => {
            const [command, eventName, parameters] = args;

            if (this.debugConsole) {
                this.debugConsole.events.push({
                    command,
                    eventName,
                    parameters,
                    timestamp: new Date().toISOString(),
                    url: window.location.href
                });
            }

            // if (command === 'event') {
            //     console.group(`📈 Analytics Event: ${eventName}`);
            //     console.log('Parameters:', parameters);
            //     console.log('Timestamp:', new Date().toISOString());
            //     console.log('URL:', window.location.href);
            //     console.groupEnd();
            // } else if (command === 'config') {
            //     console.log('⚙️ Analytics Config:', { trackingId, parameters });
            // }
        };

        gtag('js', new Date());
        gtag('config', trackingId, {
            debug_mode: true,
            page_title: document.title,
            page_location: window.location.href,
            custom_map: {
                'custom_parameter_1': 'section_name',
                'custom_parameter_2': 'interaction_type'
            }
        });
    }

    /**
     * Initialize production mode (live site)
     */
    async initProductionMode(trackingId) {
        console.log('🚀 Initializing Analytics in PRODUCTION mode');
        await this.loadGoogleAnalytics(trackingId);
        this.configureGtag(trackingId);
    }

    /**
     * Load Google Analytics script dynamically (production only)
     */
    loadGoogleAnalytics(trackingId) {
        return new Promise((resolve, reject) => {
            if (window.gtag && !this.isDebugMode) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;

            script.onload = () => {
                window.dataLayer = window.dataLayer || [];
                window.gtag = function () {
                    dataLayer.push(arguments);
                };
                resolve();
            };

            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Configure Google Analytics (production only)
     */
    configureGtag(trackingId) {
        gtag('js', new Date());
        gtag('config', trackingId, {
            page_title: document.title,
            page_location: window.location.href,
            custom_map: {
                'custom_parameter_1': 'section_name',
                'custom_parameter_2': 'interaction_type'
            }
        });
    }

    /**
     * Enhanced event tracking with debug support
     */
    trackEvent(eventName, parameters = {}) {
        const eventData = {
            ...parameters,
            timestamp: Date.now(),
            environment: this.isDebugMode ? 'debug' : 'production'
        };

        // if (this.isDebugMode) {
        //     console.group(`🎯 Analytics Event: ${eventName}`);
        //     console.log('📊 Parameters:', eventData);
        //     console.log('🌍 Environment: DEBUG MODE');
        //     console.log('⏰ Timestamp:', new Date().toISOString());
        //     console.groupEnd();

        //     if (this.debugConsole) {
        //         this.debugConsole.interactions++;
        //     }
        // }

        if (!this.isInitialized) {
            console.log(`Analytics not initialized - would track: ${eventName}`, eventData);
            return;
        }

        gtag('event', eventName, eventData);

        this.sessionData.interactions.push({
            event: eventName,
            parameters: eventData,
            timestamp: Date.now()
        });
    }

    onSectionEnter(sectionId, sectionName, intersectionRatio) {
        const now = Date.now();

        if (!this.sessionData.sections.has(sectionId)) {
            this.sessionData.sections.set(sectionId, {
                name: sectionName,
                firstView: now,
                viewCount: 0,
                totalTime: 0,
                maxScroll: intersectionRatio,
                interactions: 0
            });
        }

        const sectionData = this.sessionData.sections.get(sectionId);
        sectionData.viewCount++;
        sectionData.lastEnter = now;
        sectionData.maxScroll = Math.max(sectionData.maxScroll, intersectionRatio);

        if (this.debugConsole) {
            this.debugConsole.sections.set(sectionId, {
                name: sectionName,
                viewCount: sectionData.viewCount,
                intersectionRatio: Math.round(intersectionRatio * 100) + '%'
            });
        }

        this.trackEvent('section_view', {
            section_name: sectionName,
            section_id: sectionId,
            intersection_ratio: intersectionRatio,
            view_count: sectionData.viewCount
        });

        if (this.isDebugMode) {
            console.log(`👁️ Section entered: ${sectionName} (${Math.round(intersectionRatio * 100)}% visible)`);
        }
    }

    startTrackingSections() {
        setTimeout(() => {
            this.setupSectionObservers();
            this.setupInteractionTracking();
            this.setupScrollTracking();

            if (this.isDebugMode) {
                console.log('🔍 Section tracking started in DEBUG mode');
                setTimeout(() => {
                    console.log('💡 Use window.analyticsDebug.showFullBreakdown() to see all tracking data');
                }, 3000);
            }
        }, 1000);
    }

    setupSectionObservers() {
        const observerOptions = {
            threshold: [0.1, 0.25, 0.5, 0.75],
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const sectionId = entry.target.id;
                const sectionName = this.sectionConfig[sectionId]?.name || sectionId;

                if (entry.isIntersecting) {
                    this.onSectionEnter(sectionId, sectionName, entry.intersectionRatio);
                } else {
                    this.onSectionExit(sectionId, sectionName);
                }
            });
        }, observerOptions);

        Object.keys(this.sectionConfig).forEach(sectionId => {
            const element = document.getElementById(sectionId);
            if (element) {
                observer.observe(element);
                this.observers.set(sectionId, observer);
            }
        });
    }

    onSectionExit(sectionId, sectionName) {
        const sectionData = this.sessionData.sections.get(sectionId);
        if (!sectionData || !sectionData.lastEnter) return;

        const timeSpent = Date.now() - sectionData.lastEnter;
        sectionData.totalTime += timeSpent;

        this.trackEvent('section_time', {
            section_name: sectionName,
            section_id: sectionId,
            time_spent: Math.round(timeSpent / 1000),
            total_time: Math.round(sectionData.totalTime / 1000)
        });

        if (this.isDebugMode) {
            console.log(`👋 Section exited: ${sectionName} (${Math.round(timeSpent / 1000)}s spent)`);
        }
    }

    setupInteractionTracking() {
        document.addEventListener('click', (e) => {
            // Navigation clicks
            const navLink = e.target.closest('#navmenu a');
            if (navLink) {
                const targetSection = navLink.getAttribute('href').replace('#', '');
                this.trackEvent('navigation_click', {
                    target_section: targetSection,
                    link_text: navLink.textContent.trim()
                });
            }
        });
    }

    setupScrollTracking() {
        let ticking = false;

        const trackScroll = () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );

            const milestones = [25, 50, 75, 100];
            milestones.forEach(milestone => {
                if (scrollPercent >= milestone && !this.sessionData.scrollDepth.has(milestone)) {
                    this.sessionData.scrollDepth.add(milestone);
                    this.trackScrollDepth(milestone);
                }
            });

            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(trackScroll);
                ticking = true;
            }
        });
    }

    trackSectionInteraction(sectionId, interactionType, additionalData = {}) {
        const sectionData = this.sessionData.sections.get(sectionId);
        if (sectionData) {
            sectionData.interactions++;
        }

        this.trackEvent('section_interaction', {
            section_id: sectionId,
            section_name: this.sectionConfig[sectionId]?.name || sectionId,
            interaction_type: interactionType,
            ...additionalData
        });

        if (this.isDebugMode) {
            console.log(`🎮 Section interaction: ${sectionId} - ${interactionType}`, additionalData);
        }
    }

    trackScrollDepth(percentage) {
        this.trackEvent('scroll_depth', {
            scroll_percentage: percentage,
            page_url: window.location.pathname
        });

        if (this.isDebugMode) {
            console.log(`📏 Scroll depth: ${percentage}%`);
        }
    }

    trackPageView(title = document.title, location = window.location.href) {
        if (!this.isInitialized) return;

        if (this.isProduction) {
            gtag('config', this.trackingId, {
                page_title: title,
                page_location: location
            });
        }

        this.trackEvent('page_view', {
            page_title: title,
            page_location: location
        });

        if (this.isDebugMode) {
            console.log('📄 Page view tracked:', title);
        }
    }

    trackExternalLink(url, linkText, linkType = 'external_link') {
        this.trackEvent('click', {
            event_category: 'outbound',
            event_label: url,
            link_text: linkText,
            link_type: linkType
        });
    }

    trackDownload(fileName, fileType, downloadType = 'direct_download') {
        this.trackEvent('file_download', {
            file_name: fileName,
            file_type: fileType,
            download_type: downloadType
        });
    }

    getSessionSummary() {
        const totalTime = Date.now() - this.sessionData.startTime;
        const sectionsVisited = Array.from(this.sessionData.sections.entries()).map(([id, data]) => ({
            id,
            name: data.name,
            viewCount: data.viewCount,
            totalTime: Math.round(data.totalTime / 1000),
            interactions: data.interactions,
            maxScroll: Math.round(data.maxScroll * 100)
        }));

        return {
            environment: this.isDebugMode ? 'debug' : 'production',
            totalTime: Math.round(totalTime / 1000),
            sectionsVisited: sectionsVisited.length,
            totalInteractions: this.sessionData.interactions.length,
            scrollDepth: Math.max(...this.sessionData.scrollDepth, 0),
            sections: sectionsVisited,
            debugMode: this.isDebugMode,
            trackingId: this.trackingId,
            activeSectionTrackers: Array.from(this.sectionTrackers.keys()),
            activeModalTrackers: Array.from(this.modalTrackers.keys()),
            modalSummaries: this.getAllModalSummaries()
        };
    }

    sendSessionSummary() {
        if (!this.isInitialized) return;

        const summary = this.getSessionSummary();
        this.trackEvent('session_summary', summary);

        if (this.isDebugMode) {
            console.group('📊 Final Session Summary (DEBUG MODE)');
            console.log(summary);
            console.log('Section Summaries:', this.getAllSectionSummaries());
            console.log('Modal Summaries:', this.getAllModalSummaries());
            console.groupEnd();
        }
    }

    getEnvironmentInfo() {
        return {
            isDebugMode: this.isDebugMode,
            isProduction: this.isProduction,
            hostname: window.location.hostname,
            port: window.location.port,
            protocol: window.location.protocol,
            trackingId: this.trackingId,
            isInitialized: this.isInitialized,
            activeSectionTrackers: Array.from(this.sectionTrackers.keys()),
            activeModalTrackers: Array.from(this.modalTrackers.keys()),
            userAgent: navigator.userAgent.substring(0, 100)
        };
    }

    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();

        this.sectionTrackers.forEach(tracker => {
            if (tracker.cleanup) {
                tracker.cleanup();
            }
        });
        this.sectionTrackers.clear();

        this.modalTrackers.forEach(tracker => {
            if (tracker.cleanup) {
                tracker.cleanup();
            }
        });
        this.modalTrackers.clear();

        this.sendSessionSummary();

        if (this.isDebugMode) {
            console.log('🧹 Analytics cleanup completed (DEBUG MODE) - Sections and Modals');
        }
    }
}

// Global instance
window.AnalyticsManager = AnalyticsManager;
window.analyticsManager = new AnalyticsManager();

// Send session summary on page unload
window.addEventListener('beforeunload', () => {
    if (window.analyticsManager) {
        window.analyticsManager.sendSessionSummary();
    }
});