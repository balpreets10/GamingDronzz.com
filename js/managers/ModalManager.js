/**
 * Enhanced Modal Manager - Handles modal creation, display, and interactions
 */
class ModalManager {
    constructor() {
        this.activeModals = new Map();
        this.scrollbarWidth = 0;
        this.init();
    }

    init() {
        // Calculate scrollbar width for body padding compensation
        this.calculateScrollbarWidth();

        // Add global event listeners
        this.addGlobalEventListeners();

        console.log('ModalManager initialized');
    }

    /**
     * Calculate scrollbar width to prevent layout shift
     */
    calculateScrollbarWidth() {
        const div = document.createElement('div');
        div.style.width = '100px';
        div.style.height = '100px';
        div.style.overflow = 'scroll';
        div.style.position = 'absolute';
        div.style.top = '-9999px';
        document.body.appendChild(div);

        this.scrollbarWidth = div.offsetWidth - div.clientWidth;
        document.body.removeChild(div);

        // Set CSS variable for use in styles
        document.documentElement.style.setProperty('--scrollbar-width', `${this.scrollbarWidth}px`);
    }

    /**
     * Add global event listeners
     */
    addGlobalEventListeners() {
        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTopModal();
            }
        });

        // Prevent focus trap outside modals
        document.addEventListener('focusin', (e) => {
            const topModal = this.getTopModal();
            if (topModal && !topModal.element.contains(e.target)) {
                e.preventDefault();
                this.focusModal(topModal.element);
            }
        });
    }

    /**
     * Create and show a modal
     * @param {Object} options - Modal configuration
     */
    createModal(options = {}) {
        const config = {
            id: options.id || `modal-${Date.now()}`,
            title: options.title || 'Modal',
            content: options.content || '',
            size: options.size || 'md', // sm, md, lg, xl, fullscreen
            closeOnBackdrop: options.closeOnBackdrop !== false,
            closeOnEsc: options.closeOnEsc !== false,
            showCloseButton: options.showCloseButton !== false,
            footer: options.footer || null,
            className: options.className || '',
            onShow: options.onShow || null,
            onHide: options.onHide || null,
            onDestroy: options.onDestroy || null
        };

        // Create modal HTML
        const modalHTML = this.createModalHTML(config);

        // Add to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Get modal elements
        const backdrop = document.getElementById(`${config.id}-backdrop`);
        const container = document.getElementById(`${config.id}-container`);
        const modal = document.getElementById(config.id);

        // Store modal data
        this.activeModals.set(config.id, {
            config,
            element: modal,
            backdrop,
            container
        });

        // Add event listeners
        this.addModalEventListeners(config.id);

        // Show modal
        this.showModal(config.id);

        return config.id;
    }

    /**
     * Generate modal HTML
     * @param {Object} config - Modal configuration
     */
    createModalHTML(config) {
        const footerHTML = config.footer ? `
            <div class="modal-footer">
                ${config.footer}
            </div>
        ` : '';

        const closeButtonHTML = config.showCloseButton ? `
            <button class="modal-close" data-modal-close="${config.id}" aria-label="Close modal">
                <i class="fa-solid fa-rectangle-xmark"></i>
            </button>
        ` : '';

        return `
            <!-- Modal Backdrop -->
            <div id="${config.id}-backdrop" class="modal-backdrop" data-modal-backdrop="${config.id}"></div>
            
            <!-- Modal Container -->
            <div id="${config.id}-container" class="modal-container" data-modal-container="${config.id}">
                <div id="${config.id}" class="modal-content modal-${config.size} ${config.className}" 
                     role="dialog" aria-modal="true" aria-labelledby="${config.id}-title" tabindex="-1">
                    
                    <!-- Modal Header -->
                    <div class="modal-header">
                        <h3 id="${config.id}-title" class="modal-title">${config.title}</h3>
                        ${closeButtonHTML}
                    </div>
                    
                    <!-- Modal Body -->
                    <div class="modal-body">
                        ${config.content}
                    </div>
                    
                    <!-- Modal Footer -->
                    ${footerHTML}
                </div>
            </div>
        `;
    }

    /**
     * Add event listeners to a modal
     * @param {string} modalId - Modal identifier
     */
    addModalEventListeners(modalId) {
        const modalData = this.activeModals.get(modalId);
        if (!modalData) return;

        const { config, backdrop, container } = modalData;

        // Close button
        if (config.showCloseButton) {
            const closeBtn = document.querySelector(`[data-modal-close="${modalId}"]`);
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.hideModal(modalId));
            }
        }

        // Backdrop click
        if (config.closeOnBackdrop) {
            backdrop.addEventListener('click', () => this.hideModal(modalId));
            container.addEventListener('click', (e) => {
                if (e.target === container) {
                    this.hideModal(modalId);
                }
            });
        }
    }

    /**
     * Show a modal
     * @param {string} modalId - Modal identifier
     */
    showModal(modalId) {
        const modalData = this.activeModals.get(modalId);
        if (!modalData) return;

        const { config, backdrop, container } = modalData;

        // Lock body scroll
        this.lockBodyScroll();

        // Show modal with animation
        requestAnimationFrame(() => {
            backdrop.classList.add('active');
            container.classList.add('active');
        });

        // Focus modal
        setTimeout(() => {
            this.focusModal(modalData.element);
        }, 300);

        // Trigger onShow callback
        if (config.onShow) {
            config.onShow(modalId);
        }

        console.log(`Modal '${modalId}' shown`);
    }

    /**
     * Hide a modal
     * @param {string} modalId - Modal identifier
     */
    hideModal(modalId) {
        const modalData = this.activeModals.get(modalId);
        if (!modalData) return;

        const { config, backdrop, container } = modalData;

        // Hide modal with animation
        backdrop.classList.remove('active');
        container.classList.remove('active');

        // Wait for animation to complete, then remove from DOM
        setTimeout(() => {
            this.destroyModal(modalId);
        }, 300);

        // Unlock body scroll if no other modals
        if (this.activeModals.size === 1) {
            this.unlockBodyScroll();
        }

        // Trigger onHide callback
        if (config.onHide) {
            config.onHide(modalId);
        }

        console.log(`Modal '${modalId}' hidden`);
    }

    /**
     * Destroy a modal and clean up
     * @param {string} modalId - Modal identifier
     */
    destroyModal(modalId) {
        const modalData = this.activeModals.get(modalId);
        if (!modalData) return;

        const { config, backdrop, container } = modalData;

        // Remove from DOM
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        if (container.parentNode) container.parentNode.removeChild(container);

        // Remove from active modals
        this.activeModals.delete(modalId);

        // Trigger onDestroy callback
        if (config.onDestroy) {
            config.onDestroy(modalId);
        }

        console.log(`Modal '${modalId}' destroyed`);
    }

    /**
     * Close the topmost modal
     */
    closeTopModal() {
        const modals = Array.from(this.activeModals.keys());
        if (modals.length > 0) {
            const topModalId = modals[modals.length - 1];
            this.hideModal(topModalId);
        }
    }

    /**
     * Get the topmost modal
     */
    getTopModal() {
        const modals = Array.from(this.activeModals.values());
        return modals.length > 0 ? modals[modals.length - 1] : null;
    }

    /**
     * Focus the modal for accessibility
     * @param {Element} modalElement - Modal element to focus
     */
    focusModal(modalElement) {
        const focusableElements = modalElement.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        } else {
            modalElement.focus();
        }
    }

    /**
     * Lock body scroll
     */
    lockBodyScroll() {
        document.body.classList.add('modal-open');
    }

    /**
     * Unlock body scroll
     */
    unlockBodyScroll() {
        document.body.classList.remove('modal-open');
    }

    /**
     * Check if any modal is open
     */
    hasOpenModals() {
        return this.activeModals.size > 0;
    }

    /**
     * Get all active modal IDs
     */
    getActiveModalIds() {
        return Array.from(this.activeModals.keys());
    }

    /**
     * Update modal content
     * @param {string} modalId - Modal identifier
     * @param {string} content - New content
     */
    updateModalContent(modalId, content) {
        const modalData = this.activeModals.get(modalId);
        if (!modalData) return;

        const bodyElement = modalData.element.querySelector('.modal-body');
        if (bodyElement) {
            bodyElement.innerHTML = content;
        }
    }

    /**
     * Update modal title
     * @param {string} modalId - Modal identifier
     * @param {string} title - New title
     */
    updateModalTitle(modalId, title) {
        const modalData = this.activeModals.get(modalId);
        if (!modalData) return;

        const titleElement = modalData.element.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
}

// Global instance
window.ModalManager = ModalManager;
window.modalManager = new ModalManager();