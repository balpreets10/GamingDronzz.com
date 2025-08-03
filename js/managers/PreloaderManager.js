/**
 * Enhanced Preloader Manager - Handles timing and name animation
 */
class PreloaderManager {
    constructor() {
        this.preloader = null;
        this.nameElement = null;
        this.startTime = Date.now();
        this.minimumDisplayTime = 500; // 0.5 seconds
        this.isLoaded = false;
        this.isAnimating = false;
        this.userName = "Balpreet Singh"; // Update this to your name

        this.init();
    }

    init() {
        // Create enhanced preloader HTML
        this.createPreloaderHTML();
        this.preloader = document.querySelector('#preloader');
        this.nameElement = document.querySelector('.preloader-name');

        if (!this.preloader) {
            console.error('Preloader element not found');
            return;
        }

        console.log('PreloaderManager initialized');
    }

    createPreloaderHTML() {
        const existingPreloader = document.querySelector('#preloader');
        if (existingPreloader) {
            // Update existing preloader with new structure
            existingPreloader.innerHTML = `
                <div class="preloader-name">${this.userName}</div>
                <div class="preloader-progress"></div>
            `;
        }
    }

    /**
     * Mark loading as complete and handle the animation sequence
     */
    async markLoadingComplete() {
        if (this.isLoaded || this.isAnimating) return;

        this.isLoaded = true;
        const elapsedTime = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minimumDisplayTime - elapsedTime);

        console.log(`Loading completed in ${elapsedTime}ms, waiting ${remainingTime}ms more`);

        // Wait for minimum display time if needed
        if (remainingTime > 0) {
            await this.delay(remainingTime);
        }

        // Start the animation sequence
        await this.startAnimationSequence();
    }

    /**
     * Animation sequence: show name → slide to title → fade out preloader
     */
    async startAnimationSequence() {
        if (this.isAnimating || !this.preloader || !this.nameElement) return;

        this.isAnimating = true;

        try {
            // Phase 1: Hide spinner and show name
            await this.showName();

            // Phase 2: Calculate target position and animate name slide
            await this.slideNameToTitle();

            // Phase 3: Fade out preloader
            await this.fadeOutPreloader();

            // Phase 4: Clean up
            this.cleanup();

        } catch (error) {
            console.error('Error during preloader animation:', error);
            this.fallbackRemoval();
        }
    }

    /**
     * Phase 1: Show the name in center
     */
    async showName() {
        if (!this.preloader || !this.nameElement) return;

        this.preloader.classList.add('show-name');

        // Wait for name to fade in
        await this.delay(300);

        console.log('Name shown in center');
    }

    /**
     * Phase 2: Slide name to title position
     */
    async slideNameToTitle() {
        if (!this.nameElement) return;

        // Find the hero title element to calculate target position
        const heroTitle = this.findHeroTitle();
        if (!heroTitle) {
            console.warn('Hero title not found, using default slide distance');
            await this.slideNameWithFallback();
            return;
        }

        // Calculate positions
        const nameRect = this.nameElement.getBoundingClientRect();
        const titleRect = heroTitle.getBoundingClientRect();

        const deltaX = titleRect.left - nameRect.left;
        const deltaY = titleRect.top - nameRect.top;

        console.log(`Sliding name to title position: deltaX=${deltaX}px, deltaY=${deltaY}px`);

        // Apply the slide animation
        this.nameElement.style.setProperty('--slide-distance', `${deltaY}px`);
        this.nameElement.classList.add('sliding');

        // Wait for animation to complete
        await this.delay(800);
    }

    /**
     * Fallback slide animation if hero title not found
     */
    async slideNameWithFallback() {
        if (!this.nameElement) return;

        // Use a default upward slide
        this.nameElement.style.setProperty('--slide-distance', '-200px');
        this.nameElement.classList.add('sliding');

        await this.delay(800);
    }

    /**
     * Phase 3: Fade out the preloader
     */
    async fadeOutPreloader() {
        if (!this.preloader) return;

        this.preloader.classList.add('fade-out');

        // Wait for fade transition
        await this.delay(600);

        console.log('Preloader faded out');
    }

    /**
     * Phase 4: Clean up and remove preloader
     */
    cleanup() {
        if (this.preloader && this.preloader.parentNode) {
            this.preloader.parentNode.removeChild(this.preloader);
            console.log('Preloader removed from DOM');
        }

        this.isAnimating = false;

        // Dispatch custom event for other systems
        window.dispatchEvent(new CustomEvent('preloaderComplete'));
    }

    /**
     * Find the hero title element
     */
    findHeroTitle() {
        // Try multiple selectors to find the hero title
        const selectors = [
            '.hero h1',
            '.hero .hero-title',
            '#hero h1',
            '#hero .hero-title',
            'main .hero h1',
            '[data-aos="fade-up"] h1'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`Found hero title with selector: ${selector}`);
                return element;
            }
        }

        return null;
    }

    /**
     * Fallback: immediate removal if animation fails
     */
    fallbackRemoval() {
        if (this.preloader && this.preloader.parentNode) {
            this.preloader.parentNode.removeChild(this.preloader);
            console.log('Preloader removed via fallback');
        }
        this.isAnimating = false;
    }

    /**
     * Utility: Promise-based delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Force immediate removal (emergency method)
     */
    forceRemove() {
        if (this.preloader && this.preloader.parentNode) {
            this.preloader.parentNode.removeChild(this.preloader);
            console.log('Preloader force removed');
        }
        this.isAnimating = false;
    }

    /**
     * Update the displayed name
     */
    updateName(newName) {
        this.userName = newName;
        if (this.nameElement) {
            this.nameElement.textContent = newName;
        }
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            isLoaded: this.isLoaded,
            isAnimating: this.isAnimating,
            elapsedTime: Date.now() - this.startTime,
            minimumTimeReached: (Date.now() - this.startTime) >= this.minimumDisplayTime
        };
    }
}

// Expose class on window
window.PreloaderManager = PreloaderManager;