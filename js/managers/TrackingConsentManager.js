/**
 * Updated Tracking Consent Manager - Analytics Integration
 */
class TrackingConsentManager {
    constructor() {
        this.consentKey = 'tracking_consent';
        this.consentValue = this.getStoredConsent();
        this.notificationElement = null;
        this.isVisible = false;
        this.analyticsId = 'G-X1PDYC9RX3'; // Your Google Analytics ID
    }

    getStoredConsent() {
        try {
            return localStorage.getItem(this.consentKey);
        } catch {
            return null;
        }
    }

    setConsent(value) {
        try {
            localStorage.setItem(this.consentKey, value);
            this.consentValue = value;
        } catch (error) {
            console.warn('Could not save consent preference:', error);
        }
    }

    hasConsent() {
        return this.consentValue === 'accepted';
    }

    needsConsent() {
        return this.consentValue === null;
    }

    createFooterNotification() {
        this.removeFooterNotification();

        const notification = document.createElement('div');
        notification.id = 'tracking-consent-footer';
        notification.className = 'tracking-consent-footer';

        notification.innerHTML = `
            <div class="consent-footer-content">
                <div class="consent-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div class="consent-text">
                    <div class="consent-title">Privacy & Analytics</div>
                    <div class="consent-message">
                        We use analytics to improve your experience. Help us make this website better for everyone.
                    </div>
                </div>
                <div class="consent-actions">
                    <button class="btn btn-outline consent-decline" onclick="trackingConsent.declineTracking()">
                        <i class="fas fa-times me-1"></i>Decline
                    </button>
                    <button class="btn btn-primary consent-accept" onclick="trackingConsent.acceptTracking()">
                        <i class="fas fa-check me-1"></i>Accept
                    </button>
                </div>
                <button class="consent-close" onclick="trackingConsent.dismissTemporarily()" title="Dismiss for now">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="consent-details-toggle" onclick="trackingConsent.toggleDetails()">
                <span class="details-text">Learn more</span>
                <i class="fas fa-chevron-up details-icon"></i>
            </div>
            <div class="consent-details" id="consent-details">
                <div class="details-content">
                    <h6><i class="fas fa-info-circle me-2"></i>What we track:</h6>
                    <ul class="details-list">
                        <li><i class="fas fa-eye me-2"></i>Section views and navigation patterns</li>
                        <li><i class="fas fa-mouse-pointer me-2"></i>Project and skill interactions</li>
                        <li><i class="fas fa-clock me-2"></i>Time spent on different sections</li>
                        <li><i class="fas fa-chart-line me-2"></i>Scroll depth and engagement metrics</li>
                        <li><i class="fas fa-mobile-alt me-2"></i>Device and browser information</li>
                    </ul>
                    <div class="privacy-note">
                        <i class="fas fa-user-shield me-2"></i>
                        <strong>Privacy first:</strong> All data is anonymous and used solely for improving user experience. No personal information is collected.
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);
        this.notificationElement = notification;

        setTimeout(() => {
            notification.classList.add('show');
            this.isVisible = true;
        }, 100);

        return notification;
    }

    showFooterNotification() {
        if (!this.notificationElement) {
            this.createFooterNotification();
        } else if (!this.isVisible) {
            this.notificationElement.classList.add('show');
            this.isVisible = true;
        }
    }

    removeFooterNotification() {
        if (this.notificationElement) {
            this.notificationElement.classList.remove('show');

            setTimeout(() => {
                if (this.notificationElement && this.notificationElement.parentNode) {
                    this.notificationElement.parentNode.removeChild(this.notificationElement);
                }
                this.notificationElement = null;
                this.isVisible = false;
            }, 300);
        }
    }

    toggleDetails() {
        const details = document.getElementById('consent-details');
        const toggle = document.querySelector('.consent-details-toggle');
        const icon = toggle.querySelector('.details-icon');

        if (details && toggle) {
            const isExpanded = details.classList.contains('expanded');

            if (isExpanded) {
                details.classList.remove('expanded');
                icon.style.transform = 'rotate(0deg)';
                toggle.querySelector('.details-text').textContent = 'Learn more';
            } else {
                details.classList.add('expanded');
                icon.style.transform = 'rotate(180deg)';
                toggle.querySelector('.details-text').textContent = 'Show less';
            }
        }
    }

    acceptTracking() {
        this.setConsent('accepted');
        this.removeFooterNotification();
        this.initializeTracking();

        this.showConfirmation('Analytics enabled! Thank you for helping us improve.', 'success');
    }

    declineTracking() {
        this.setConsent('declined');
        this.removeFooterNotification();
        console.log('Tracking declined by user');

        this.showConfirmation('Privacy preferences saved. You can change this anytime.', 'info');
    }

    dismissTemporarily() {
        this.removeFooterNotification();

        // Show again after 24 hours (in session)
        setTimeout(() => {
            if (this.needsConsent()) {
                this.showFooterNotification();
            }
        }, 24 * 60 * 60 * 1000); // 24 hours

        console.log('Consent notification dismissed temporarily');
    }

    showConfirmation(message, type = 'success') {
        const confirmation = document.createElement('div');
        confirmation.className = `tracking-confirmation tracking-confirmation-${type}`;
        confirmation.innerHTML = `
            <div class="confirmation-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                ${message}
            </div>
        `;

        document.body.appendChild(confirmation);

        setTimeout(() => {
            confirmation.classList.add('show');
        }, 100);

        setTimeout(() => {
            confirmation.classList.remove('show');
            setTimeout(() => {
                if (confirmation.parentNode) {
                    confirmation.parentNode.removeChild(confirmation);
                }
            }, 300);
        }, 4000);
    }

    async initializeTracking() {
        if (!this.hasConsent()) {
            console.log('No consent for tracking - initialization skipped');
            return;
        }

        try {
            // Initialize Analytics Manager with consent
            if (window.analyticsManager) {
                await window.analyticsManager.init(this.analyticsId, true);
                console.log('Analytics initialized with user consent');

                // Track consent acceptance
                window.analyticsManager.trackEvent('consent_given', {
                    consent_type: 'analytics',
                    consent_method: 'footer_notification',
                    timestamp: Date.now()
                });

                // Set up automatic tracking
                this.setupAutomaticTracking();
            } else {
                console.warn('Analytics Manager not available');
            }
        } catch (error) {
            console.warn('Analytics initialization failed:', error);
        }
    }

    // Enhanced automatic tracking with Analytics Manager integration
    setupAutomaticTracking() {
        if (!window.analyticsManager || !window.analyticsManager.isInitialized) {
            console.warn('Analytics Manager not initialized for automatic tracking');
            return;
        }

        console.log('Setting up automatic tracking with Analytics Manager');

        // Enhanced external link tracking
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                try {
                    const url = new URL(link.href, window.location.href);
                    if (url.hostname !== window.location.hostname) {
                        window.analyticsManager.trackExternalLink(
                            link.href,
                            link.textContent.trim() || 'External Link',
                            'outbound_click'
                        );
                    }
                } catch (error) {
                    console.warn('Failed to track external link:', error);
                }
            }
        });

        // Enhanced download tracking
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                const url = link.href.toLowerCase();
                const downloadExtensions = ['.pdf', '.doc', '.docx', '.zip', '.rar', '.exe', '.apk', '.dmg'];

                if (downloadExtensions.some(ext => url.includes(ext))) {
                    const fileName = link.href.split('/').pop();
                    const fileType = fileName.split('.').pop();
                    window.analyticsManager.trackDownload(fileName, fileType, 'direct_download');
                }
            }
        });

        // Track resume/CV downloads specifically
        document.addEventListener('click', (e) => {
            const resumeLink = e.target.closest('[href*="resume"], [href*="cv"]');
            if (resumeLink) {
                window.analyticsManager.trackEvent('resume_download', {
                    link_text: resumeLink.textContent.trim(),
                    source_section: this.getCurrentSection()
                });
            }
        });

        // Enhanced page visibility tracking
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                window.analyticsManager.trackEvent('page_hidden', {
                    time_visible: Date.now() - this.pageVisibleStart
                });
            } else {
                this.pageVisibleStart = Date.now();
                window.analyticsManager.trackEvent('page_visible', {
                    timestamp: Date.now()
                });
            }
        });

        this.pageVisibleStart = Date.now();
    }

    getCurrentSection() {
        // Helper method to determine current section based on scroll position
        const sections = ['hero', 'game', 'portfolio', 'skills', 'experience', 'testimonials', 'contact'];

        for (let sectionId of sections) {
            const section = document.getElementById(sectionId);
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                    return sectionId;
                }
            }
        }

        return 'unknown';
    }

    checkConsent() {
        if (this.needsConsent()) {
            // Show footer notification after 2 seconds
            setTimeout(() => {
                this.showFooterNotification();
            }, 2000);
        } else if (this.hasConsent()) {
            // Initialize tracking immediately if consent already given
            this.initializeTracking();
        } else {
            console.log('User has declined tracking');
        }
    }

    // Public API methods
    show() { this.showFooterNotification(); }
    hide() { this.removeFooterNotification(); }
    isShowing() { return this.isVisible; }

    // Method to revoke consent (for privacy settings)
    revokeConsent() {
        this.setConsent('declined');

        // Stop tracking if currently active
        if (window.analyticsManager && window.analyticsManager.isInitialized) {
            window.analyticsManager.trackEvent('consent_revoked', {
                timestamp: Date.now()
            });
        }

        this.showConfirmation('Tracking disabled. Your privacy preferences have been updated.', 'info');
        console.log('User consent revoked');
    }

    // Method to get current consent status (for debugging)
    getConsentStatus() {
        return {
            hasConsent: this.hasConsent(),
            needsConsent: this.needsConsent(),
            consentValue: this.consentValue,
            analyticsInitialized: window.analyticsManager ? window.analyticsManager.isInitialized : false
        };
    }
}

// Initialize consent manager
window.TrackingConsentManager = TrackingConsentManager;
window.trackingConsent = new TrackingConsentManager();