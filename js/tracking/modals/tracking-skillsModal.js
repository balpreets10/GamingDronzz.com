/**
 * Skills Modal Analytics Tracking
 * Tracks user interactions within skills modals
 */
class SkillsModalTracking {
    constructor(analyticsManager) {
        this.analytics = analyticsManager;
        this.isActive = false;
        this.currentModalId = null;
        this.currentCategory = null;

        this.sessionData = {
            modalOpens: 0,
            totalTimeSpent: 0,
            categoriesViewed: new Set(),
            skillsExplored: new Set(),
            interactions: new Map(),
            currentSession: null
        };

        this.interactionTypes = {
            SKILL_CARD_HOVER: 'skill_card_hover',
            PROGRESS_RING_VIEW: 'progress_ring_view',
            EXPERTISE_EXPAND: 'expertise_expand',
            CATEGORY_BADGE_CLICK: 'category_badge_click',
            SKILL_ANIMATION_COMPLETE: 'skill_animation_complete',
            MODAL_SCROLL: 'modal_scroll'
        };
    }

    /**
     * Initialize skills modal tracking
     */
    init() {
        this.setupModalObservers();
        this.setupInteractionTracking();

        if (this.analytics.isDebugMode) {
            console.log('⚡ Skills Modal tracking initialized');
            window.skillsModalDebug = {
                getSummary: () => this.getSummary(),
                getCurrentSession: () => this.sessionData.currentSession,
                getCategoriesViewed: () => Array.from(this.sessionData.categoriesViewed),
                getSkillsExplored: () => Array.from(this.sessionData.skillsExplored),
                getInteractions: () => Array.from(this.sessionData.interactions.entries())
            };
        }
    }

    /**
     * Setup modal lifecycle observers
     */
    setupModalObservers() {
        // Hook into SkillsModal's showSkillModal method
        if (window.SkillsModal && window.skillsModal) {
            const originalShowModal = window.skillsModal.showSkillModal.bind(window.skillsModal);
            window.skillsModal.showSkillModal = (categoryId) => {
                const categoryData = window.skillsModal.skillsData[categoryId];
                this.onModalOpen(categoryData, categoryId);
                return originalShowModal(categoryId);
            };

            // Monitor modal manager for skills modal close events
            if (window.modalManager) {
                const originalHideModal = window.modalManager.hideModal.bind(window.modalManager);
                window.modalManager.hideModal = (modalId) => {
                    if (this.currentModalId === modalId && this.isActive) {
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

            const modalElement = e.target.closest('.skills-modal');
            if (!modalElement) return;

            this.handleModalClick(e);
        });

        document.addEventListener('mouseover', (e) => {
            if (!this.isActive) return;

            const modalElement = e.target.closest('.skills-modal');
            if (!modalElement) return;

            this.handleModalHover(e);
        });

        // Track modal scrolling
        let scrollTimeout;
        document.addEventListener('scroll', (e) => {
            if (!this.isActive) return;

            const modalBody = e.target.closest('.modal-body');
            if (!modalBody) return;

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.trackInteraction(this.interactionTypes.MODAL_SCROLL, {
                    scrollPosition: modalBody.scrollTop,
                    scrollHeight: modalBody.scrollHeight,
                    scrollPercentage: Math.round((modalBody.scrollTop / (modalBody.scrollHeight - modalBody.clientHeight)) * 100)
                });
            }, 500);
        }, true);

        // Track animation completions
        document.addEventListener('animationend', (e) => {
            if (!this.isActive) return;

            const modalElement = e.target.closest('.skills-modal');
            if (!modalElement) return;

            if (e.target.classList.contains('skill-progress-ring') && e.animationName === 'animate-progress') {
                this.trackInteraction(this.interactionTypes.SKILL_ANIMATION_COMPLETE, {
                    skill_element: 'progress_ring',
                    animation_name: e.animationName
                });
            }
        });
    }

    /**
     * Handle modal opening
     */
    onModalOpen(categoryData, categoryId) {
        this.isActive = true;
        this.currentCategory = categoryData;
        this.currentModalId = `skills-modal-${categoryId}`;
        this.sessionData.modalOpens++;
        this.sessionData.categoriesViewed.add(categoryData.title);

        // Track individual skills
        categoryData.skills.forEach(skill => {
            this.sessionData.skillsExplored.add(skill.name);
        });

        this.sessionData.currentSession = {
            categoryTitle: categoryData.title,
            categoryId: categoryId,
            skillCount: categoryData.skills.length,
            openTime: Date.now(),
            interactions: [],
            timeSpent: 0,
            skillsViewed: new Set()
        };

        this.analytics.trackEvent('skills_modal_open', {
            category_title: categoryData.title,
            category_id: categoryId,
            skill_count: categoryData.skills.length,
            category_color: categoryData.color,
            average_skill_level: Math.round(
                categoryData.skills.reduce((sum, skill) => sum + skill.level, 0) / categoryData.skills.length
            )
        });

        if (this.analytics.isDebugMode) {
            console.log('⚡ Skills modal opened:', categoryData.title);
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

        this.analytics.trackEvent('skills_modal_close', {
            category_title: this.sessionData.currentSession.categoryTitle,
            category_id: this.sessionData.currentSession.categoryId,
            time_spent: Math.round(timeSpent / 1000),
            interactions_count: this.sessionData.currentSession.interactions.length,
            skills_viewed: this.sessionData.currentSession.skillsViewed.size,
            engagement_level: this.calculateEngagementLevel(timeSpent, this.sessionData.currentSession.interactions.length)
        });

        if (this.analytics.isDebugMode) {
            console.log('⚡ Skills modal closed:', {
                category: this.sessionData.currentSession.categoryTitle,
                timeSpent: Math.round(timeSpent / 1000) + 's',
                interactions: this.sessionData.currentSession.interactions.length,
                skillsViewed: this.sessionData.currentSession.skillsViewed.size
            });
        }

        this.resetSession();
    }

    /**
     * Handle clicks within modal
     */
    handleModalClick(e) {
        const target = e.target;

        // Category badge clicks
        if (target.closest('.category-badge')) {
            this.trackInteraction(this.interactionTypes.CATEGORY_BADGE_CLICK, {
                category_title: this.sessionData.currentSession.categoryTitle
            });
        }

        // Skill card clicks
        if (target.closest('.skill-card')) {
            const skillCard = target.closest('.skill-card');
            const skillName = skillCard.querySelector('.skill-name')?.textContent?.trim();
            if (skillName) {
                this.sessionData.currentSession.skillsViewed.add(skillName);
                this.trackInteraction(this.interactionTypes.SKILL_CARD_HOVER, {
                    skill_name: skillName,
                    interaction_type: 'click'
                });
            }
        }

        // Progress ring clicks
        if (target.closest('.skill-progress-ring')) {
            const skillCard = target.closest('.skill-card');
            const skillName = skillCard?.querySelector('.skill-name')?.textContent?.trim();
            this.trackInteraction(this.interactionTypes.PROGRESS_RING_VIEW, {
                skill_name: skillName,
                interaction_type: 'click'
            });
        }

        // Expertise list interactions
        if (target.closest('.expertise-list')) {
            const skillCard = target.closest('.skill-card');
            const skillName = skillCard?.querySelector('.skill-name')?.textContent?.trim();
            this.trackInteraction(this.interactionTypes.EXPERTISE_EXPAND, {
                skill_name: skillName,
                expertise_item: target.textContent?.trim()
            });
        }
    }

    /**
     * Handle hover interactions
     */
    handleModalHover(e) {
        const target = e.target;

        // Skill card hovers
        if (target.closest('.skill-card')) {
            const skillCard = target.closest('.skill-card');
            const skillName = skillCard.querySelector('.skill-name')?.textContent?.trim();
            if (skillName && !this.sessionData.currentSession.skillsViewed.has(skillName)) {
                this.sessionData.currentSession.skillsViewed.add(skillName);
                this.trackInteraction(this.interactionTypes.SKILL_CARD_HOVER, {
                    skill_name: skillName,
                    interaction_type: 'hover'
                });
            }
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

        this.analytics.trackEvent('skills_modal_interaction', {
            category_title: this.sessionData.currentSession.categoryTitle,
            category_id: this.sessionData.currentSession.categoryId,
            interaction_type: type,
            ...data
        });

        if (this.analytics.isDebugMode) {
            console.log('⚡ Skills modal interaction:', type, data);
        }
    }

    /**
     * Calculate engagement level based on time and interactions
     */
    calculateEngagementLevel(timeSpent, interactionCount) {
        const timeScore = Math.min(timeSpent / 45000, 1); // 45 seconds = max time score (skills need more time to read)
        const interactionScore = Math.min(interactionCount / 8, 1); // 8 interactions = max interaction score
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
        this.currentCategory = null;
        this.sessionData.currentSession = null;
    }

    /**
     * Get analytics summary
     */
    getSummary() {
        return {
            modalOpens: this.sessionData.modalOpens,
            uniqueCategoriesViewed: this.sessionData.categoriesViewed.size,
            uniqueSkillsExplored: this.sessionData.skillsExplored.size,
            totalTimeSpent: Math.round(this.sessionData.totalTimeSpent / 1000),
            averageTimePerModal: this.sessionData.modalOpens > 0 ?
                Math.round(this.sessionData.totalTimeSpent / this.sessionData.modalOpens / 1000) : 0,
            topInteractions: Array.from(this.sessionData.interactions.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            categoriesViewed: Array.from(this.sessionData.categoriesViewed),
            skillsExplored: Array.from(this.sessionData.skillsExplored),
            currentlyActive: this.isActive,
            currentCategory: this.currentCategory?.title || null
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
            console.log('🧹 Skills Modal tracking cleaned up');
        }
    }
}

// Export to global scope
window.SkillsModalTracking = SkillsModalTracking;