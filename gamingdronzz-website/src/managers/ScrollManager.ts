// src/managers/ScrollManager.ts
/**
 * ScrollManager - Handles all scroll-based animations and tracking
 * Implements bidirectional animations with 60fps optimization
 */

interface ScrollAnimationConfig {
    threshold: number;
    rootMargin: string;
    triggerOnce: boolean;
    reverse: boolean;
}

interface AnimationElement {
    element: HTMLElement;
    animation: string;
    config: ScrollAnimationConfig;
    isVisible: boolean;
    hasAnimated: boolean;
}

class ScrollManager {
    private static instance: ScrollManager;
    private observer: IntersectionObserver | null = null;
    private elements: Map<string, AnimationElement> = new Map();
    private scrollPosition = 0;
    private isScrolling = false;
    private scrollTimeout: number | null = null;
    private callbacks: Set<(position: number, direction: 'up' | 'down') => void> = new Set();

    private readonly defaultConfig: ScrollAnimationConfig = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        triggerOnce: false,
        reverse: true
    };

    private constructor() {
        this.init();
    }

    static getInstance(): ScrollManager {
        if (!ScrollManager.instance) {
            ScrollManager.instance = new ScrollManager();
        }
        return ScrollManager.instance;
    }

    private init(): void {
        this.setupIntersectionObserver();
        this.setupScrollListener();
        this.bindMethods();
    }

    private bindMethods(): void {
        this.handleIntersection = this.handleIntersection.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    private setupIntersectionObserver(): void {
        const config = {
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
            rootMargin: this.defaultConfig.rootMargin
        };

        this.observer = new IntersectionObserver(this.handleIntersection, config);
    }

    private setupScrollListener(): void {
        let ticking = false;

        const scrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    private handleIntersection(entries: IntersectionObserverEntry[]): void {
        entries.forEach(entry => {
            const elementId = entry.target.getAttribute('data-scroll-id');
            if (!elementId) return;

            const animElement = this.elements.get(elementId);
            if (!animElement) return;

            const isVisible = entry.isIntersecting;
            const wasVisible = animElement.isVisible;

            // Update visibility state
            animElement.isVisible = isVisible;

            // Handle animation triggers
            if (isVisible && !wasVisible) {
                this.triggerAnimation(elementId, 'enter');
            } else if (!isVisible && wasVisible && animElement.config.reverse) {
                this.triggerAnimation(elementId, 'exit');
            }
        });
    }

    private handleScroll(): void {
        const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
        const direction = currentPosition > this.scrollPosition ? 'down' : 'up';

        // Update scroll state
        this.scrollPosition = currentPosition;
        this.isScrolling = true;

        // Clear existing timeout
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }

        // Set scroll end timeout
        this.scrollTimeout = window.setTimeout(() => {
            this.isScrolling = false;
        }, 150);

        // Notify subscribers
        this.callbacks.forEach(callback => {
            callback(currentPosition, direction);
        });
    }

    public register(
        element: HTMLElement,
        animation: string,
        config: Partial<ScrollAnimationConfig> = {}
    ): string {
        const id = `scroll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const finalConfig = { ...this.defaultConfig, ...config };

        // Set data attribute for identification
        element.setAttribute('data-scroll-id', id);

        // Store element data
        this.elements.set(id, {
            element,
            animation,
            config: finalConfig,
            isVisible: false,
            hasAnimated: false
        });

        // Start observing
        if (this.observer) {
            this.observer.observe(element);
        }

        return id;
    }

    public unregister(id: string): void {
        const animElement = this.elements.get(id);
        if (animElement && this.observer) {
            this.observer.unobserve(animElement.element);
            animElement.element.removeAttribute('data-scroll-id');
        }
        this.elements.delete(id);
    }

    private triggerAnimation(id: string, type: 'enter' | 'exit'): void {
        const animElement = this.elements.get(id);
        if (!animElement) return;

        const { element, animation, config } = animElement;

        // Check if should animate
        if (config.triggerOnce && animElement.hasAnimated && type === 'enter') {
            return;
        }

        // Apply animation classes
        const animationClass = type === 'enter' ? `${animation}-enter` : `${animation}-exit`;

        // Remove existing animation classes
        element.classList.remove(`${animation}-enter`, `${animation}-exit`);

        // Force reflow to ensure class removal takes effect
        void element.offsetHeight;

        // Add new animation class
        element.classList.add(animationClass);

        // Mark as animated
        if (type === 'enter') {
            animElement.hasAnimated = true;
        }

        // Emit custom event for component-level handling
        const event = new CustomEvent('scrollAnimation', {
            detail: { id, type, animation, element }
        });
        element.dispatchEvent(event);
    }

    public onScroll(callback: (position: number, direction: 'up' | 'down') => void): () => void {
        this.callbacks.add(callback);

        // Return unsubscribe function
        return () => {
            this.callbacks.delete(callback);
        };
    }

    public getScrollPosition(): number {
        return this.scrollPosition;
    }

    public isCurrentlyScrolling(): boolean {
        return this.isScrolling;
    }

    public scrollTo(target: number | HTMLElement, smooth = true): void {
        const options: ScrollToOptions = {
            behavior: smooth ? 'smooth' : 'auto'
        };

        if (typeof target === 'number') {
            options.top = target;
        } else {
            const rect = target.getBoundingClientRect();
            options.top = window.pageYOffset + rect.top;
        }

        window.scrollTo(options);
    }

    public destroy(): void {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }

        this.elements.clear();
        this.callbacks.clear();
    }
}

export default ScrollManager;