/**
 * Project Modal Analytics Tracking
 * Tracks user interactions within project modals
 */
class ProjectModalTracking {
    constructor(analyticsManager) {
        this.analytics = analyticsManager;
        this.isActive = false;
        this.currentModalId = null;
        this.currentProject = null;

        this.sessionData = {
            modalOpens: 0,
            totalTimeSpent: 0,
            projectsViewed: new Set(),
            interactions: new Map(),
            currentSession: null
        };

        this.interactionTypes = {
            GALLERY_NAVIGATION: 'gallery_navigation',
            EXTERNAL_LINK_CLICK: 'external_link_click',
            VIDEO_PLAY: 'video_play',
            TECH_TAG_HOVER: 'tech_tag_hover',
            MODAL_SCROLL: 'modal_scroll',
            KEYBOARD_NAVIGATION: 'keyboard_navigation'
        };
    }

    /**
     * Initialize project modal tracking
     */
    init() {
        this.setupModalObservers();
        this.setupInteractionTracking();

        if (this.analytics.isDebugMode) {
            console.log('🖼️ Project Modal tracking initialized');
            window.projectModalDebug = {
                getSummary: () => this.getSummary(),
                getCurrentSession: () => this.sessionData.currentSession,
                getProjectsViewed: () => Array.from(this.sessionData.projectsViewed),
                getInteractions: () => Array.from(this.sessionData.interactions.entries())
            };
        }
    }

    /**
     * Setup modal lifecycle observers
     */
    setupModalObservers() {
        // Hook into ProjectModal's open method
        if (window.projectModal) {
            const originalOpen = window.projectModal.open.bind(window.projectModal);
            window.projectModal.open = (projectData) => {
                this.onModalOpen(projectData);
                return originalOpen(projectData);
            };

            // Monitor modal manager for project modal close events
            if (window.modalManager) {
                const originalHideModal = window.modalManager.hideModal.bind(window.modalManager);
                window.modalManager.hideModal = (modalId) => {
                    if (this.currentModalId === modalId) {
                        this.onModalClose();
                    }
                    return originalHideModal(modalId);
                };
            }
        }
    }

    /**
     * Setup interaction tracking within modals
     */
    setupInteractionTracking() {
        document.addEventListener('click', (e) => {
            if (!this.isActive) return;

            const modalElement = e.target.closest('.project-modal');
            if (!modalElement) return;

            this.handleModalClick(e);
        });

        // Track keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;

            if (['ArrowLeft', 'ArrowRight', 'Escape'].includes(e.key)) {
                this.trackInteraction(this.interactionTypes.KEYBOARD_NAVIGATION, {
                    key: e.key,
                    action: this.getKeyAction(e.key)
                });
            }
        });

        // Track modal scrolling
        let scrollTimeout;
        document.addEventListener('scroll', (e) => {
            if (!this.isActive) return;

            // ADD THIS CHECK:
            if (!e.target.closest) return;

            const modalBody = e.target.closest('.modal-body');
            if (!modalBody) return;

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.trackInteraction(this.interactionTypes.MODAL_SCROLL, {
                    scrollPosition: modalBody.scrollTop,
                    scrollHeight: modalBody.scrollHeight
                });
            }, 500);
        }, true);
    }

    /**
     * Handle modal opening
     */
    onModalOpen(projectData) {
        this.isActive = true;
        this.currentProject = projectData;
        this.sessionData.modalOpens++;
        this.sessionData.projectsViewed.add(projectData.title);

        this.sessionData.currentSession = {
            projectTitle: projectData.title,
            projectCategory: projectData.category,
            openTime: Date.now(),
            interactions: [],
            timeSpent: 0
        };

        this.analytics.trackEvent('project_modal_open', {
            project_title: projectData.title,
            project_category: Array.isArray(projectData.category) ? projectData.category.join(',') : projectData.category,
            project_status: projectData.status,
            has_video: !!projectData.videoUrl,
            has_web_link: !!projectData.webbuildlink,
            has_app_links: !!(projectData.androidapplink || projectData.iosapplink),
            image_count: projectData.images?.length || 0,
            tech_count: projectData.technologies?.length || 0
        });

        if (this.analytics.isDebugMode) {
            console.log('📂 Project modal opened:', projectData.title);
        }
    }

    /**
     * Handle modal closing
     */
    onModalClose() {
        if (!this.sessionData.currentSession) return;

        const timeSpent = Date.now() - this.sessionData.currentSession.openTime;
        this.sessionData.currentSession.timeSpent = timeSpent;
        this.sessionData.totalTimeSpent += timeSpent;

        this.analytics.trackEvent('project_modal_close', {
            project_title: this.sessionData.currentSession.projectTitle,
            time_spent: Math.round(timeSpent / 1000),
            interactions_count: this.sessionData.currentSession.interactions.length,
            engagement_level: this.calculateEngagementLevel(timeSpent, this.sessionData.currentSession.interactions.length)
        });

        if (this.analytics.isDebugMode) {
            console.log('📂 Project modal closed:', {
                project: this.sessionData.currentSession.projectTitle,
                timeSpent: Math.round(timeSpent / 1000) + 's',
                interactions: this.sessionData.currentSession.interactions.length
            });
        }

        this.resetSession();
    }

    /**
     * Handle clicks within modal
     */
    handleModalClick(e) {
        const target = e.target;

        // Gallery navigation
        if (target.closest('.gallery-btn, .thumb-image')) {
            const action = target.closest('.gallery-btn')?.dataset.action || 'thumbnail_click';
            this.trackInteraction(this.interactionTypes.GALLERY_NAVIGATION, {
                action: action,
                image_index: target.dataset.index || 'unknown'
            });
        }

        // External links
        if (target.closest('.project-link')) {
            const linkElement = target.closest('.project-link');
            const linkType = linkElement.className.split(' ').find(cls => cls.includes('-link'));
            this.trackInteraction(this.interactionTypes.EXTERNAL_LINK_CLICK, {
                link_type: linkType,
                link_url: linkElement.href
            });
        }

        // Video interactions
        if (target.closest('.video-container iframe')) {
            this.trackInteraction(this.interactionTypes.VIDEO_PLAY, {
                video_url: this.currentProject.videoUrl
            });
        }

        // Tech tag hovers/clicks
        if (target.closest('.tech-tag')) {
            const techName = target.textContent.trim();
            this.trackInteraction(this.interactionTypes.TECH_TAG_HOVER, {
                technology: techName
            });
        }
    }

    /**
     * Track specific interaction
     */
    trackInteraction(type, data = {}) {
        if (!this.sessionData.currentSession) return;

        const interaction = {
            type: type,
            data: data,
            timestamp: Date.now()
        };

        this.sessionData.currentSession.interactions.push(interaction);

        // Update interaction counts
        const currentCount = this.sessionData.interactions.get(type) || 0;
        this.sessionData.interactions.set(type, currentCount + 1);

        this.analytics.trackEvent('project_modal_interaction', {
            project_title: this.sessionData.currentSession.projectTitle,
            interaction_type: type,
            ...data
        });

        if (this.analytics.isDebugMode) {
            console.log('🎮 Project modal interaction:', type, data);
        }
    }

    /**
     * Get keyboard action description
     */
    getKeyAction(key) {
        const keyActions = {
            'ArrowLeft': 'previous_image',
            'ArrowRight': 'next_image',
            'Escape': 'close_modal'
        };
        return keyActions[key] || 'unknown';
    }

    /**
     * Calculate engagement level based on time and interactions
     */
    calculateEngagementLevel(timeSpent, interactionCount) {
        const timeScore = Math.min(timeSpent / 30000, 1); // 30 seconds = max time score
        const interactionScore = Math.min(interactionCount / 5, 1); // 5 interactions = max interaction score
        const totalScore = (timeScore + interactionScore) / 2;

        if (totalScore >= 0.7) return 'high';
        if (totalScore >= 0.4) return 'medium';
        return 'low';
    }

    /**
     * Reset current session
     */
    resetSession() {
        this.isActive = false;
        this.currentModalId = null;
        this.currentProject = null;
        this.sessionData.currentSession = null;
    }

    /**
     * Get analytics summary
     */
    getSummary() {
        return {
            modalOpens: this.sessionData.modalOpens,
            uniqueProjectsViewed: this.sessionData.projectsViewed.size,
            totalTimeSpent: Math.round(this.sessionData.totalTimeSpent / 1000),
            averageTimePerModal: this.sessionData.modalOpens > 0 ?
                Math.round(this.sessionData.totalTimeSpent / this.sessionData.modalOpens / 1000) : 0,
            topInteractions: Array.from(this.sessionData.interactions.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            projectsViewed: Array.from(this.sessionData.projectsViewed),
            currentlyActive: this.isActive,
            currentProject: this.currentProject?.title || null
        };
    }

    /**
     * Cleanup method
     */
    cleanup() {
        if (this.sessionData.currentSession) {
            this.onModalClose();
        }

        if (this.analytics.isDebugMode) {
            console.log('🧹 Project Modal tracking cleaned up');
        }
    }
}

// Export to global scope
window.ProjectModalTracking = ProjectModalTracking;