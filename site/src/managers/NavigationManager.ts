/**
 * NavigationManager - Enhanced with scroll-based active section detection
 */

import type {
    NavigationItem,
    NavigationState,
    NavigationConfig,
    Position,
    INavigationManager
} from '../types/navigation';

class NavigationManager implements INavigationManager {
    private static instance: NavigationManager;
    private state: NavigationState = {
        isOpen: false,
        activeItem: 'hero', // Default to hero
        hoveredItem: null,
        focusedItem: null,
        keyboardMode: false,
        isAnimating: false
    };

    private config: NavigationConfig = {
        items: [
            { id: 'hero', label: 'Home', href: '#hero', position: 0 },
            { id: 'about', label: 'About', href: '#about', position: 1 },
            { id: 'projects', label: 'Projects', href: '#projects', position: 2 },
            { id: 'services', label: 'Services', href: '#services', position: 3 },
            { id: 'articles', label: 'Articles', href: '#articles', position: 4 },
            { id: 'contact', label: 'Contact', href: '#contact', position: 5 }
        ],
        animationDuration: 400,
        radius: 140,
        centerSize: 60,
        itemSize: 48,
        autoClose: true,
        closeDelay: 2000,
        enableKeyboard: true,
        enableTouch: true,
        centerIcon: '☰',
        centerLabel: 'Menu'
    };

    private subscribers: Set<(state: NavigationState) => void> = new Set();
    private element: HTMLElement | null = null;
    private centerButton: HTMLElement | null = null;
    private closeTimeout: number | null = null;
    private isDestroyed = false;

    // Scroll tracking properties
    private intersectionObserver: IntersectionObserver | null = null;
    private currentSections: Map<string, boolean> = new Map();
    private scrollTimeout: number | null = null;
    private isProgrammaticScroll = false;

    // Optimized update batching
    private updateBatch: Partial<NavigationState> | null = null;
    private batchTimeoutId: number | null = null;
    private isNotifying = false;

    // Store bound methods for proper cleanup
    private boundMethods = {
        handleKeyDown: this.handleKeyDown.bind(this),
        handleKeyUp: this.handleKeyUp.bind(this),
        handleFocusIn: this.handleFocusIn.bind(this),
        handleFocusOut: this.handleFocusOut.bind(this),
        resetKeyboardMode: this.resetKeyboardMode.bind(this),
        handleIntersection: this.handleIntersection.bind(this),
        handleScroll: this.handleScroll.bind(this)
    };

    private constructor() {
        this.init();
    }

    static getInstance(): NavigationManager {
        if (!NavigationManager.instance) {
            NavigationManager.instance = new NavigationManager();
        }
        return NavigationManager.instance;
    }

    private init(): void {
        this.setupKeyboardNavigation();
        this.setupFocusTracking();
        this.setupScrollTracking();
    }

    private setupScrollTracking(): void {
        // Setup intersection observer for scroll-based active detection
        this.intersectionObserver = new IntersectionObserver(
            this.boundMethods.handleIntersection,
            {
                threshold: [0, 0.1, 0.3, 0.5, 0.7, 1],
                rootMargin: '-20% 0px -20% 0px' // More balanced detection zone
            }
        );

        // Setup scroll listener for additional scroll handling
        let ticking = false;
        const scrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.boundMethods.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', scrollHandler, { passive: true });

        // Observe sections after DOM is ready
        setTimeout(() => this.observeSections(), 100);
    }

    private observeSections(): void {
        if (!this.intersectionObserver) {
            // Re-create observer if it was destroyed
            this.intersectionObserver = new IntersectionObserver(
                this.boundMethods.handleIntersection,
                {
                    threshold: [0, 0.1, 0.3, 0.5, 0.7, 1],
                    rootMargin: '-20% 0px -20% 0px'
                }
            );
        }

        // Clear existing observations
        this.currentSections.clear();
        
        this.config.items.forEach(item => {
            if (item.href.startsWith('#')) {
                const sectionId = item.href.substring(1);
                const section = document.getElementById(sectionId);
                if (section) {
                    this.intersectionObserver!.observe(section);
                    this.currentSections.set(item.id, false);
                }
            }
        });
    }

    private handleIntersection(entries: IntersectionObserverEntry[]): void {
        let activeSection: string | null = null;
        let maxRatio = 0;
        let visibleSections: Array<{id: string, ratio: number, bounds: DOMRectReadOnly}> = [];

        entries.forEach(entry => {
            const sectionId = entry.target.id;
            const navItem = this.config.items.find(item => item.href === `#${sectionId}`);

            if (navItem) {
                this.currentSections.set(navItem.id, entry.isIntersecting);

                // Collect all visible sections with their intersection data
                if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
                    visibleSections.push({
                        id: navItem.id,
                        ratio: entry.intersectionRatio,
                        bounds: entry.boundingClientRect
                    });
                    
                    // Track the section with highest intersection ratio
                    if (entry.intersectionRatio > maxRatio) {
                        maxRatio = entry.intersectionRatio;
                        activeSection = navItem.id;
                    }
                }
            }
        });

        // If multiple sections are visible, pick the one closest to viewport center
        if (visibleSections.length > 1) {
            const viewportCenter = window.innerHeight / 2;
            let closestToCenter: string | null = null;
            let minDistanceFromCenter = Infinity;

            visibleSections.forEach(section => {
                const sectionCenter = section.bounds.top + (section.bounds.height / 2);
                const distanceFromCenter = Math.abs(sectionCenter - viewportCenter);
                
                if (distanceFromCenter < minDistanceFromCenter) {
                    minDistanceFromCenter = distanceFromCenter;
                    closestToCenter = section.id;
                }
            });

            activeSection = closestToCenter;
        }

        // If no section is intersecting significantly, find the closest one
        if (!activeSection) {
            activeSection = this.findClosestSection();
        }

        // Update active item if it changed, but not during programmatic scroll
        if (activeSection && activeSection !== this.state.activeItem && !this.isProgrammaticScroll) {
            this.setActiveItem(activeSection);
        }
    }

    private findClosestSection(): string | null {
        const scrollPosition = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const viewportTop = scrollPosition;
        const viewportBottom = scrollPosition + windowHeight;
        
        let closestSection: string | null = null;
        let minDistance = Infinity;

        this.config.items.forEach(item => {
            if (item.href.startsWith('#')) {
                const sectionId = item.href.substring(1);
                const section = document.getElementById(sectionId);
                if (section) {
                    const rect = section.getBoundingClientRect();
                    const sectionTop = rect.top + scrollPosition;
                    const sectionBottom = sectionTop + rect.height;
                    
                    // Calculate distance based on which section is closest to the viewport center
                    let distance;
                    if (sectionTop > viewportBottom) {
                        // Section is below viewport
                        distance = sectionTop - viewportBottom;
                    } else if (sectionBottom < viewportTop) {
                        // Section is above viewport
                        distance = viewportTop - sectionBottom;
                    } else {
                        // Section is intersecting viewport - prioritize these
                        const sectionCenter = sectionTop + rect.height / 2;
                        const viewportCenter = viewportTop + windowHeight / 2;
                        distance = Math.abs(sectionCenter - viewportCenter) * 0.1; // Lower weight for intersecting sections
                    }

                    if (distance < minDistance) {
                        minDistance = distance;
                        closestSection = item.id;
                    }
                }
            }
        });

        return closestSection;
    }

    private handleScroll(): void {
        // Clear existing timeout
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }

        // If not programmatic scroll, ensure observer is active
        if (!this.isProgrammaticScroll && this.intersectionObserver) {
            // Scroll ended - re-evaluate active section if needed
            this.scrollTimeout = window.setTimeout(() => {
                if (!this.isProgrammaticScroll) {
                    const closestSection = this.findClosestSection();
                    if (closestSection && closestSection !== this.state.activeItem) {
                        this.setActiveItem(closestSection);
                    }
                }
            }, 150);
        }
    }

    private setActiveItem(itemId: string): void {
        if (this.state.activeItem !== itemId) {
            this.batchStateUpdate({ activeItem: itemId });
            this.emit('navigation:activate', {
                item: this.config.items.find(i => i.id === itemId)
            });
        }
    }

    private setupKeyboardNavigation(): void {
        document.addEventListener('keydown', this.boundMethods.handleKeyDown);
        document.addEventListener('keyup', this.boundMethods.handleKeyUp);
    }

    private setupFocusTracking(): void {
        document.addEventListener('focusin', this.boundMethods.handleFocusIn);
        document.addEventListener('focusout', this.boundMethods.handleFocusOut);
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (this.isDestroyed) return;

        if (e.key === 'Tab') {
            this.batchStateUpdate({ keyboardMode: true });
        }

        if (!this.state.isOpen) return;

        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                e.preventDefault();
                this.handleArrowNavigation(e.key);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.activateCurrentItem();
                break;
            case 'Home':
                e.preventDefault();
                this.focusFirstItem();
                break;
            case 'End':
                e.preventDefault();
                this.focusLastItem();
                break;
        }
    }

    private handleKeyUp(e: KeyboardEvent): void {
        if (e.key === 'Alt' || e.key === 'Control') {
            document.addEventListener('mousemove', this.boundMethods.resetKeyboardMode, { once: true });
        }
    }

    private resetKeyboardMode(): void {
        this.batchStateUpdate({ keyboardMode: false });
    }

    private handleFocusIn(e: FocusEvent): void {
        const target = e.target as HTMLElement;
        if (this.element?.contains(target)) {
            const itemId = target.getAttribute('data-nav-item');
            if (itemId) {
                this.batchStateUpdate({ focusedItem: itemId });
            }
        }
    }

    private handleFocusOut(): void {
        setTimeout(() => {
            if (!this.element?.contains(document.activeElement as HTMLElement)) {
                this.batchStateUpdate({ focusedItem: null });
            }
        }, 0);
    }

    private handleArrowNavigation(key: string): void {
        const currentIndex = this.config.items.findIndex(item => item.id === this.state.focusedItem);
        let nextIndex;

        switch (key) {
            case 'ArrowUp':
            case 'ArrowLeft':
                nextIndex = currentIndex > 0 ? currentIndex - 1 : this.config.items.length - 1;
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                nextIndex = currentIndex < this.config.items.length - 1 ? currentIndex + 1 : 0;
                break;
            default:
                return;
        }

        const nextItem = this.config.items[nextIndex];
        this.focusItem(nextItem.id);
    }

    private focusItem(itemId: string): void {
        const itemElement = this.element?.querySelector(`[data-nav-item="${itemId}"]`) as HTMLElement;
        if (itemElement) {
            itemElement.focus();
            this.batchStateUpdate({ focusedItem: itemId });
        }
    }

    private focusFirstItem(): void {
        if (this.config.items.length > 0) {
            this.focusItem(this.config.items[0].id);
        }
    }

    private focusLastItem(): void {
        if (this.config.items.length > 0) {
            this.focusItem(this.config.items[this.config.items.length - 1].id);
        }
    }

    private activateCurrentItem(): void {
        if (this.state.focusedItem) {
            this.navigate(this.state.focusedItem);
        }
    }

    public setElement(element: HTMLElement): void {
        this.element = element;
        this.centerButton = element.querySelector('[data-nav-center]') as HTMLElement;
    }

    public open(): void {
        if (this.state.isOpen) return;

        this.batchStateUpdate({ isOpen: true, isAnimating: true });
        this.clearCloseTimeout();

        if (this.state.keyboardMode && this.centerButton) {
            this.centerButton.focus();
        }

        this.emit('navigation:open');

        setTimeout(() => {
            this.batchStateUpdate({ isAnimating: false });
        }, this.config.animationDuration);
    }

    public close(): void {
        if (!this.state.isOpen) return;

        this.batchStateUpdate({
            isOpen: false,
            hoveredItem: null,
            focusedItem: null,
            isAnimating: true
        });

        this.emit('navigation:close');

        setTimeout(() => {
            this.batchStateUpdate({ isAnimating: false });
        }, this.config.animationDuration);
    }

    public toggle(): void {
        this.state.isOpen ? this.close() : this.open();
    }

    public setHoveredItem(itemId: string | null): void {
        this.batchStateUpdate({ hoveredItem: itemId });

        if (itemId && this.config.autoClose) {
            this.clearCloseTimeout();
        } else if (!itemId && this.config.autoClose) {
            this.scheduleAutoClose();
        }

        this.emit('navigation:hover', {
            item: itemId ? this.config.items.find(i => i.id === itemId) : null
        });
    }

    public navigate(itemId: string): void {
        const item = this.config.items.find(i => i.id === itemId);
        if (!item) return;

        // Immediately update activeItem for responsive UI feedback
        this.setActiveItem(itemId);
        
        this.emit('navigation:navigate', { item });
        this.close();

        if (item.href.startsWith('#')) {
            const target = document.querySelector(item.href);
            if (target) {
                // Keep observer running but add a flag to ignore updates during programmatic scroll
                this.isProgrammaticScroll = true;
                
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Clear programmatic scroll flag after animation
                setTimeout(() => {
                    this.isProgrammaticScroll = false;
                }, 1000); // Wait for scroll animation to complete
            }
        } else {
            if (item.external) {
                window.open(item.href, '_blank', 'noopener,noreferrer');
            } else {
                window.location.href = item.href;
            }
        }
    }

    public getItemPosition(position: number): Position {
        const totalItems = this.config.items.length;
        const angleSpread = 90;
        const startAngle = 180;
        const angleStep = angleSpread / Math.max(totalItems - 1, 1);
        const angle = startAngle + (position * angleStep);
        const radian = angle * (Math.PI / 180);
        const radius = window.innerWidth <= 768 ?
            (this.config.radius * 0.7) : this.config.radius;

        return {
            x: Math.cos(radian) * radius,
            y: Math.sin(radian) * radius
        };
    }

    private scheduleAutoClose(): void {
        this.clearCloseTimeout();
        this.closeTimeout = window.setTimeout(() => {
            this.close();
        }, this.config.closeDelay);
    }

    private clearCloseTimeout(): void {
        if (this.closeTimeout) {
            clearTimeout(this.closeTimeout);
            this.closeTimeout = null;
        }
    }

    // Optimized batching system
    private batchStateUpdate(newState: Partial<NavigationState>): void {
        if (this.isDestroyed || this.isNotifying) return;

        // Merge with existing batch
        this.updateBatch = this.updateBatch ?
            { ...this.updateBatch, ...newState } :
            { ...newState };

        // Clear existing timeout
        if (this.batchTimeoutId) {
            clearTimeout(this.batchTimeoutId);
        }

        // Schedule batch processing
        this.batchTimeoutId = window.setTimeout(() => {
            this.processBatch();
        }, 0);
    }

    private processBatch(): void {
        if (!this.updateBatch || this.isDestroyed || this.isNotifying) return;

        const batch = this.updateBatch;
        this.updateBatch = null;
        this.batchTimeoutId = null;

        // Check if state actually changed
        const hasChanges = Object.keys(batch).some(
            key => this.state[key as keyof NavigationState] !== batch[key as keyof NavigationState]
        );

        if (!hasChanges) return;

        // Apply changes
        this.state = { ...this.state, ...batch };
        this.notifySubscribers();
    }

    private notifySubscribers(): void {
        if (this.isNotifying || this.isDestroyed) return;

        this.isNotifying = true;
        const currentState = { ...this.state };

        Promise.resolve().then(() => {
            if (this.isDestroyed) {
                this.isNotifying = false;
                return;
            }

            this.subscribers.forEach(callback => {
                try {
                    callback(currentState);
                } catch (error) {
                    console.error('Navigation subscriber error:', error);
                }
            });

            this.isNotifying = false;
        });
    }

    public subscribe(callback: (state: NavigationState) => void): () => void {
        this.subscribers.add(callback);

        // Immediate call with current state
        try {
            callback({ ...this.state });
        } catch (error) {
            console.error('Navigation subscriber initial call error:', error);
        }

        return () => this.subscribers.delete(callback);
    }

    private emit(event: string, data?: any): void {
        const customEvent = new CustomEvent(event, {
            detail: { ...data, state: { ...this.state } }
        });
        document.dispatchEvent(customEvent);
    }

    public getState(): NavigationState {
        return { ...this.state };
    }

    public getConfig(): NavigationConfig {
        return { ...this.config };
    }

    public updateConfig(newConfig: Partial<NavigationConfig>): void {
        this.config = { ...this.config, ...newConfig };

        // Re-observe sections if items changed
        if (newConfig.items) {
            this.currentSections.clear();
            setTimeout(() => this.observeSections(), 100);
        }
    }

    public destroy(): void {
        this.isDestroyed = true;
        this.isNotifying = false;

        if (this.batchTimeoutId) {
            clearTimeout(this.batchTimeoutId);
            this.batchTimeoutId = null;
        }

        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = null;
        }

        this.updateBatch = null;
        this.clearCloseTimeout();
        this.subscribers.clear();

        // Disconnect intersection observer
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = null;
        }

        // Remove event listeners
        document.removeEventListener('keydown', this.boundMethods.handleKeyDown);
        document.removeEventListener('keyup', this.boundMethods.handleKeyUp);
        document.removeEventListener('focusin', this.boundMethods.handleFocusIn);
        document.removeEventListener('focusout', this.boundMethods.handleFocusOut);

        this.element = null;
        this.centerButton = null;
        this.currentSections.clear();
    }
}

export default NavigationManager;