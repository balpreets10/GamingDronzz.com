/**
 * Game Info Modal Analytics Tracking
 * Tracks user interactions within game info modals
 */
class GameInfoModalTracking {
    constructor(analyticsManager) {
        this.analytics = analyticsManager;
        this.isActive = false;
        this.currentModalId = null;
        this.currentGameData = null;

        this.sessionData = {
            modalOpens: 0,
            totalTimeSpent: 0,
            featuresViewed: new Set(),
            controlsTestUsed: 0,
            performanceTipsViewed: 0,
            interactions: new Map(),
            currentSession: null
        };

        this.interactionTypes = {
            CONTROL_TEST: 'control_test',
            PERFORMANCE_TIPS: 'performance_tips',
            STATUS_CHECK: 'status_check',
            PLATFORM_INFO: 'platform_info',
            FULLSCREEN_INFO: 'fullscreen_info',
            KEY_TEST_PERFORMED: 'key_test_performed'
        };
    }

    /**
     * Initialize game info modal tracking
     */
    init() {
        this.setupModalObservers();
        this.setupInteractionTracking();

        if (this.analytics.isDebugMode) {
            console.log('🎮 Game Info Modal tracking initialized');
            window.gameInfoModalDebug = {
                getSummary: () => this.getSummary(),
                getCurrentSession: () => this.sessionData.currentSession,
                getFeaturesViewed: () => Array.from(this.sessionData.featuresViewed),
                getInteractions: () => Array.from(this.sessionData.interactions.entries())
            };
        }
    }

    /**
     * Setup modal lifecycle observers
     */
    setupModalObservers() {
        // Hook into GameInfoModal's open method
        if (window.gameInfoModal) {
            const originalOpen = window.gameInfoModal.open.bind(window.gameInfoModal);
            window.gameInfoModal.open = (gameData) => {
                this.onModalOpen(gameData);
                return originalOpen(gameData);
            };

            // Monitor modal manager for game info modal close events
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

        // Also hook into the global helper function
        if (window.openGameInfoModal) {
            const originalOpenGameInfoModal = window.openGameInfoModal;
            window.openGameInfoModal = (gameData) => {
                this.onModalOpen(gameData);
                return originalOpenGameInfoModal(gameData);
            };
        }
    }

    /**
     * Setup interaction tracking within modals
     */
    setupInteractionTracking() {
        document.addEventListener('click', (e) => {
            if (!this.isActive) return;

            const modalElement = e.target.closest('.game-info-modal');
            if (!modalElement) return;

            this.handleModalClick(e);
        });

        // Track key testing interactions
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;

            const testDisplay = document.getElementById('keyTest');
            if (testDisplay && testDisplay.closest('.game-info-modal')) {
                this.trackInteraction(this.interactionTypes.KEY_TEST_PERFORMED, {
                    key: e.key,
                    keyCode: e.code,
                    isControlKey: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)
                });
            }
        });

        // Track hover interactions for info cards
        document.addEventListener('mouseover', (e) => {
            if (!this.isActive) return;

            const modalElement = e.target.closest('.game-info-modal');
            if (!modalElement) return;

            this.handleModalHover(e);
        });
    }

    /**
     * Handle modal opening
     */
    onModalOpen(gameData = null) {
        this.isActive = true;
        this.currentGameData = gameData || { status: 'unknown', isGameLoaded: false };
        this.sessionData.modalOpens++;

        this.sessionData.currentSession = {
            gameStatus: this.currentGameData.status,
            isGameLoaded: this.currentGameData.isGameLoaded,
            openTime: Date.now(),
            interactions: [],
            timeSpent: 0,
            featuresExplored: new Set(),
            testsPerformed: new Set()
        };

        this.analytics.trackEvent('game_info_modal_open', {
            game_status: this.currentGameData.status,
            is_game_loaded: this.currentGameData.isGameLoaded,
            modal_trigger: 'info_button'
        });

        if (this.analytics.isDebugMode) {
            console.log('🎮 Game info modal opened:', {
                status: this.currentGameData.status,
                loaded: this.currentGameData.isGameLoaded
            });
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

        this.analytics.trackEvent('game_info_modal_close', {
            game_status: this.sessionData.currentSession.gameStatus,
            time_spent: Math.round(timeSpent / 1000),
            interactions_count: this.sessionData.currentSession.interactions.length,
            features_explored: this.sessionData.currentSession.featuresExplored.size,
            tests_performed: this.sessionData.currentSession.testsPerformed.size,
            engagement_level: this.calculateEngagementLevel(timeSpent, this.sessionData.currentSession.interactions.length)
        });

        if (this.analytics.isDebugMode) {
            console.log('🎮 Game info modal closed:', {
                timeSpent: Math.round(timeSpent / 1000) + 's',
                interactions: this.sessionData.currentSession.interactions.length,
                tests: this.sessionData.currentSession.testsPerformed.size
            });
        }

        this.resetSession();
    }

    /**
     * Handle clicks within modal
     */
    handleModalClick(e) {
        const target = e.target;

        // Action button clicks
        const actionBtn = target.closest('.action-btn');
        if (actionBtn) {
            const action = actionBtn.dataset.action;
            this.handleActionButton(action);
            return;
        }

        // Info card clicks
        const infoCard = target.closest('.info-card');
        if (infoCard) {
            const cardType = this.getCardType(infoCard);
            this.trackInteraction(this.interactionTypes.STATUS_CHECK, {
                card_type: cardType,
                interaction_type: 'click'
            });
            this.sessionData.currentSession.featuresExplored.add(cardType);
        }

        // Control item clicks
        const controlItem = target.closest('.control-item');
        if (controlItem) {
            const controlType = controlItem.querySelector('.control-details span')?.textContent?.trim();
            this.trackInteraction(this.interactionTypes.PLATFORM_INFO, {
                control_type: controlType,
                interaction_type: 'click'
            });
        }

        // Fullscreen option clicks
        const fullscreenOption = target.closest('.fullscreen-option');
        if (fullscreenOption) {
            const optionText = fullscreenOption.textContent.trim();
            this.trackInteraction(this.interactionTypes.FULLSCREEN_INFO, {
                option: optionText,
                interaction_type: 'click'
            });
        }
    }

    /**
     * Handle hover interactions
     */
    handleModalHover(e) {
        const target = e.target;

        // Info card hovers
        const infoCard = target.closest('.info-card');
        if (infoCard) {
            const cardType = this.getCardType(infoCard);
            if (!this.sessionData.currentSession.featuresExplored.has(cardType)) {
                this.sessionData.currentSession.featuresExplored.add(cardType);
                this.trackInteraction(this.interactionTypes.STATUS_CHECK, {
                    card_type: cardType,
                    interaction_type: 'hover'
                });
            }
        }
    }

    /**
     * Handle action button clicks
     */
    handleActionButton(action) {
        switch (action) {
            case 'test-controls':
                this.sessionData.controlsTestUsed++;
                this.sessionData.currentSession.testsPerformed.add('controls');
                this.trackInteraction(this.interactionTypes.CONTROL_TEST, {
                    test_type: 'controls',
                    test_count: this.sessionData.controlsTestUsed
                });
                break;

            case 'performance-tips':
                this.sessionData.performanceTipsViewed++;
                this.sessionData.currentSession.testsPerformed.add('performance');
                this.trackInteraction(this.interactionTypes.PERFORMANCE_TIPS, {
                    tips_viewed_count: this.sessionData.performanceTipsViewed
                });
                break;

            default:
                console.warn('Unknown action button:', action);
        }
    }

    /**
     * Get card type from info card element
     */
    getCardType(infoCard) {
        if (infoCard.classList.contains('status-card')) return 'status';
        if (infoCard.classList.contains('platform-card')) return 'platform';
        if (infoCard.classList.contains('controls-card')) return 'controls';
        if (infoCard.classList.contains('fullscreen-card')) return 'fullscreen';
        if (infoCard.classList.contains('actions-card')) return 'actions';
        return 'unknown';
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

        this.analytics.trackEvent('game_info_modal_interaction', {
            game_status: this.sessionData.currentSession.gameStatus,
            interaction_type: type,
            ...data
        });

        if (this.analytics.isDebugMode) {
            console.log('🎮 Game info modal interaction:', type, data);
        }
    }

    /**
     * Calculate engagement level based on time and interactions
     */
    calculateEngagementLevel(timeSpent, interactionCount) {
        const timeScore = Math.min(timeSpent / 20000, 1); // 20 seconds = max time score (info modals are quicker)
        const interactionScore = Math.min(interactionCount / 4, 1); // 4 interactions = max interaction score
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
        this.currentGameData = null;
        this.sessionData.currentSession = null;
    }

    /**
     * Get analytics summary
     */
    getSummary() {
        return {
            modalOpens: this.sessionData.modalOpens,
            controlsTestUsed: this.sessionData.controlsTestUsed,
            performanceTipsViewed: this.sessionData.performanceTipsViewed,
            uniqueFeaturesViewed: this.sessionData.featuresViewed.size,
            totalTimeSpent: Math.round(this.sessionData.totalTimeSpent / 1000),
            averageTimePerModal: this.sessionData.modalOpens > 0 ?
                Math.round(this.sessionData.totalTimeSpent / this.sessionData.modalOpens / 1000) : 0,
            topInteractions: Array.from(this.sessionData.interactions.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            featuresViewed: Array.from(this.sessionData.featuresViewed),
            currentlyActive: this.isActive,
            currentGameStatus: this.currentGameData?.status || null
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
            console.log('🧹 Game Info Modal tracking cleaned up');
        }
    }
}

// Export to global scope
window.GameInfoModalTracking = GameInfoModalTracking;