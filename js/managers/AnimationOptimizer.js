/**
 * Animation Optimization System
 * Pauses animations when elements are out of viewport and optimizes performance
 */

class AnimationOptimizer {
    constructor() {
        this.animatedElements = new Map();
        this.observer = null;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }

    init() {
        // Create intersection observer
        this.createObserver();

        // Find and register animated elements
        this.registerAnimatedElements();

        // Handle reduced motion preference
        this.handleReducedMotion();

        // Optimize on page load
        this.optimizeOnLoad();
    }

    createObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '50px', // Start animations slightly before element enters viewport
            threshold: [0, 0.1, 0.5] // Multiple thresholds for better control
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const element = entry.target;
                const animationData = this.animatedElements.get(element);

                if (!animationData) return;

                if (entry.isIntersecting) {
                    this.playAnimations(element, animationData);
                } else {
                    this.pauseAnimations(element, animationData);
                }
            });
        }, observerOptions);
    }

    registerAnimatedElements() {
        // Elements with CSS animations
        const animatedSelectors = [
            '[class*="float-animation"]',
            '[class*="rgb-animation"]',
            '[class*="pulse-glow"]',
            '[class*="gaming-hover-effect"]',
            '.hero-content',
            '.gaming-card',
            '.progress-fill',
            '.code-rain',
            '.section-title',
            'body::before', // Background animations
            '.btn',
            '.scroll-top'
        ];

        // Find elements and register them
        animatedSelectors.forEach(selector => {
            // Handle pseudo-elements separately
            if (selector.includes('::')) {
                this.registerPseudoElement(selector);
                return;
            }

            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                this.registerElement(element);
            });
        });

        // Register elements with specific animation classes
        this.registerByAnimationClasses();
    }

    registerElement(element) {
        if (this.animatedElements.has(element)) return;

        const computedStyle = window.getComputedStyle(element);
        const animationData = {
            originalAnimation: computedStyle.animation,
            originalTransition: computedStyle.transition,
            isPlaying: true,
            animationClasses: this.getAnimationClasses(element)
        };

        this.animatedElements.set(element, animationData);
        this.observer.observe(element);
    }

    registerByAnimationClasses() {
        const animationClasses = [
            'float-animation',
            'rgb-animation',
            'pulse-glow',
            'gaming-hover-effect'
        ];

        animationClasses.forEach(className => {
            const elements = document.querySelectorAll(`.${className}`);
            elements.forEach(element => this.registerElement(element));
        });
    }

    getAnimationClasses(element) {
        const animationClasses = [
            'float-animation',
            'rgb-animation',
            'pulse-glow',
            'gaming-hover-effect'
        ];

        return animationClasses.filter(className =>
            element.classList.contains(className)
        );
    }

    playAnimations(element, animationData) {
        if (animationData.isPlaying) return;

        // Resume CSS animations
        element.style.animationPlayState = 'running';
        element.style.animationDelay = '0s';

        // Re-add animation classes if they were removed
        animationData.animationClasses.forEach(className => {
            element.classList.add(className);
        });

        // Trigger reflow to restart animations
        element.offsetHeight;

        animationData.isPlaying = true;
    }

    pauseAnimations(element, animationData) {
        if (!animationData.isPlaying) return;

        // Pause CSS animations instead of removing them
        element.style.animationPlayState = 'paused';

        animationData.isPlaying = false;
    }

    handleReducedMotion() {
        if (this.isReducedMotion) {
            this.disableAllAnimations();
        }

        // Listen for changes in motion preference
        window.matchMedia('(prefers-reduced-motion: reduce)')
            .addEventListener('change', (e) => {
                this.isReducedMotion = e.matches;
                if (e.matches) {
                    this.disableAllAnimations();
                } else {
                    this.enableAllAnimations();
                }
            });
    }

    disableAllAnimations() {
        document.body.classList.add('reduce-motion');

        this.animatedElements.forEach((animationData, element) => {
            element.style.animation = 'none';
            element.style.transition = 'none';
        });
    }

    enableAllAnimations() {
        document.body.classList.remove('reduce-motion');

        this.animatedElements.forEach((animationData, element) => {
            element.style.animation = animationData.originalAnimation;
            element.style.transition = animationData.originalTransition;
        });
    }

    optimizeOnLoad() {
        // Delay non-critical animations until after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.enableDeferredAnimations();
            }, 500);
        });
    }

    enableDeferredAnimations() {
        // Enable background animations after page load
        const backgroundAnimations = document.querySelectorAll('.deferred-animation');
        backgroundAnimations.forEach(element => {
            element.classList.remove('deferred-animation');
            element.classList.add('active-animation');
        });
    }

    // Performance monitoring
    monitorPerformance() {
        let frameCount = 0;
        let lastTime = performance.now();

        const checkFPS = () => {
            frameCount++;
            const currentTime = performance.now();

            if (currentTime >= lastTime + 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;

                // If FPS is too low, reduce animation quality
                if (fps < 30) {
                    this.reduceAnimationQuality();
                } else if (fps > 50) {
                    this.restoreAnimationQuality();
                }
            }

            requestAnimationFrame(checkFPS);
        };

        requestAnimationFrame(checkFPS);
    }

    reduceAnimationQuality() {
        document.body.classList.add('low-performance');
    }

    restoreAnimationQuality() {
        document.body.classList.remove('low-performance');
    }

    // Public methods
    pauseAllAnimations() {
        this.animatedElements.forEach((animationData, element) => {
            this.pauseAnimations(element, animationData);
        });
    }

    resumeAllAnimations() {
        this.animatedElements.forEach((animationData, element) => {
            this.playAnimations(element, animationData);
        });
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.animatedElements.clear();
    }
}

// Initialize the optimizer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.animationOptimizer = new AnimationOptimizer();

    // Optional: Monitor performance
    // window.animationOptimizer.monitorPerformance();
});

// Utility functions for manual control
window.pauseAnimations = () => window.animationOptimizer?.pauseAllAnimations();
window.resumeAnimations = () => window.animationOptimizer?.resumeAllAnimations();

window.AnimationOptimizer = AnimationOptimizer;