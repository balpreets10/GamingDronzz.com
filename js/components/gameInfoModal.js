/**
 * GameInfoModal.js - Sleek Game Information Modal using ModalManager
 */

class GameInfoModal {
    constructor() {
        this.currentModalId = null;
        this.gameData = {
            isGameLoaded: false,
            status: 'Ready to Load'
        };
    }

    /**
     * Open the game info modal
     * @param {Object} gameData - Optional game data to display
     */
    open(gameData = null) {
        if (gameData) {
            this.gameData = { ...this.gameData, ...gameData };
        }

        const content = this.generateModalContent();

        this.currentModalId = window.modalManager.createModal({
            title: '<i class="fas fa-gamepad"></i> Game Controls',
            content: content,
            size: 'md',
            className: 'game-info-modal',
            onShow: (id) => {
                this.addInteractiveEvents(id);
            },
            onHide: () => {
                this.currentModalId = null;
            }
        });

        return this.currentModalId;
    }

    /**
     * Generate compact modal content with icons
     */
    generateModalContent() {
        const statusColor = this.gameData.isGameLoaded ? 'var(--success-color)' : 'var(--warning-color)';
        const statusIcon = this.gameData.isGameLoaded ? 'fa-check-circle' : 'fa-clock';

        return `
            <div class="game-info-grid">
                <!-- Status Section -->
                <div class="info-card status-card">
                    <div class="card-icon">
                        <i class="fas ${statusIcon}" style="color: ${statusColor}"></i>
                    </div>
                    <div class="card-content">
                        <h5>Status</h5>
                        <span class="status-text" style="color: ${statusColor}">${this.gameData.status}</span>
                    </div>
                </div>

                <!-- Platform Section -->
                <div class="info-card platform-card">
                    <div class="card-icon">
                        <i class="fab fa-unity"></i>
                    </div>
                    <div class="card-content">
                        <h5>Platform</h5>
                        <span>Unity WebGL</span>
                    </div>
                </div>

                <!-- Controls Section -->
                <div class="info-card controls-card full-width">
                    <div class="controls-header">
                        <i class="fas fa-hand-pointer"></i>
                        <h5>Controls</h5>
                    </div>
                    <div class="controls-grid">
                        <div class="control-item">
                            <i class="fas fa-desktop"></i>
                            <div class="control-details">
                                <span class="control-keys">WASD / Arrows</span>
                                <small>Movement</small>
                            </div>
                        </div>
                        <div class="control-item">
                            <i class="fas fa-mouse"></i>
                            <div class="control-details">
                                <span class="control-keys">Mouse</span>
                                <small>Look Around</small>
                            </div>
                        </div>
                        <div class="control-item">
                            <i class="fas fa-mobile-alt"></i>
                            <div class="control-details">
                                <span class="control-keys">Touch</span>
                                <small>Virtual Joystick</small>
                            </div>
                        </div>
                        <div class="control-item">
                            <i class="fas fa-hand-paper"></i>
                            <div class="control-details">
                                <span class="control-keys">E Key</span>
                                <small>Interact</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Fullscreen Section -->
                <div class="info-card fullscreen-card full-width">
                    <div class="fullscreen-header">
                        <i class="fas fa-expand"></i>
                        <h5>Fullscreen</h5>
                    </div>
                    <div class="fullscreen-options">
                        <div class="fullscreen-option">
                            <kbd>F11</kbd>
                            <span>Desktop</span>
                        </div>
                        <div class="fullscreen-option">
                            <i class="fas fa-mobile-alt"></i>
                            <span>Auto-rotate</span>
                        </div>
                        <div class="fullscreen-option">
                            <kbd>ESC</kbd>
                            <span>Exit</span>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="info-card actions-card full-width">
                    <div class="quick-actions">
                        <button class="action-btn" data-action="test-controls">
                            <i class="fas fa-gamepad"></i>
                            <span>Test Controls</span>
                        </button>
                        <button class="action-btn" data-action="performance-tips">
                            <i class="fas fa-tachometer-alt"></i>
                            <span>Performance</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Add interactive events to modal elements
     */
    addInteractiveEvents(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Action buttons
        const actionBtns = modal.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleAction(action, modalId);
            });
        });
    }

    /**
     * Handle action button clicks
     */
    handleAction(action, modalId) {
        switch (action) {
            case 'test-controls':
                this.showControlsTest(modalId);
                break;
            case 'performance-tips':
                this.showPerformanceTips(modalId);
                break;
        }
    }

    /**
     * Show controls test overlay
     */
    showControlsTest(modalId) {
        const testContent = `
            <div class="controls-test">
                <div class="test-header">
                    <i class="fas fa-keyboard"></i>
                    <h4>Press any key to test</h4>
                </div>
                <div class="test-display" id="keyTest">
                    <span>Waiting for input...</span>
                </div>
                <button class="btn btn-secondary" onclick="this.closest('.controls-test').remove()">
                    <i class="fas fa-times"></i> Close Test
                </button>
            </div>
        `;

        const modal = document.getElementById(modalId);
        const modalBody = modal.querySelector('.modal-body');
        modalBody.insertAdjacentHTML('beforeend', testContent);

        // Add keydown listener
        const testDisplay = document.getElementById('keyTest');
        const keyListener = (e) => {
            testDisplay.innerHTML = `
                <div class="key-pressed">
                    <kbd>${e.key}</kbd>
                    <small>Key: ${e.code}</small>
                </div>
            `;
        };

        document.addEventListener('keydown', keyListener);

        // Cleanup when test is removed
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (node.classList && node.classList.contains('controls-test')) {
                        document.removeEventListener('keydown', keyListener);
                        observer.disconnect();
                    }
                });
            });
        });

        observer.observe(modalBody, { childList: true });
    }

    /**
     * Show performance tips
     */
    showPerformanceTips(modalId) {
        const tipsContent = `
            <div class="performance-tips">
                <div class="tips-header">
                    <i class="fas fa-rocket"></i>
                    <h4>Performance Tips</h4>
                </div>
                <div class="tips-list">
                    <div class="tip-item">
                        <i class="fas fa-window-close"></i>
                        <span>Close other browser tabs</span>
                    </div>
                    <div class="tip-item">
                        <i class="fas fa-wifi"></i>
                        <span>Ensure stable internet connection</span>
                    </div>
                    <div class="tip-item">
                        <i class="fas fa-memory"></i>
                        <span>Free up system memory</span>
                    </div>
                    <div class="tip-item">
                        <i class="fas fa-expand"></i>
                        <span>Use fullscreen for better performance</span>
                    </div>
                </div>
                <button class="btn btn-secondary" onclick="this.closest('.performance-tips').remove()">
                    <i class="fas fa-times"></i> Close Tips
                </button>
            </div>
        `;

        const modal = document.getElementById(modalId);
        const modalBody = modal.querySelector('.modal-body');
        modalBody.insertAdjacentHTML('beforeend', tipsContent);
    }

    /**
     * Update game status
     */
    updateStatus(newData) {
        this.gameData = { ...this.gameData, ...newData };

        if (this.currentModalId) {
            // Update existing modal content
            const newContent = this.generateModalContent();
            window.modalManager.updateModalContent(this.currentModalId, newContent);
            this.addInteractiveEvents(this.currentModalId);
        }
    }

    /**
     * Check if modal is open
     */
    isOpen() {
        return this.currentModalId !== null;
    }

    /**
     * Close the modal
     */
    close() {
        if (this.currentModalId) {
            window.modalManager.hideModal(this.currentModalId);
        }
    }
}

// Global instance
window.GameInfoModal = GameInfoModal;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gameInfoModal = new GameInfoModal();
});

// Helper function for easy access
function openGameInfoModal(gameData = null) {
    if (window.gameInfoModal) {
        return window.gameInfoModal.open(gameData);
    } else {
        console.error('GameInfoModal not initialized');
        return null;
    }
}