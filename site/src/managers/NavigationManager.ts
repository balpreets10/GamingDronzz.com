/**
 * NavigationManager - Enhanced with scroll-based active section detection
 */

import type {
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
    private isProgrammaticScroll = false;
    private programmaticScrollStartTime = 0;
    private lastScrollY = 0;
    private scrollDirection: 'up' | 'down' | 'none' = 'none';

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
        // Initialize scroll tracking
        this.lastScrollY = window.pageYOffset;
    }

    private setupScrollTracking(): void {
        // Simple scroll listener for 70% viewport coverage detection
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
    }

    // Removed observeSections method - no longer using intersection observer

    // Removed handleIntersection method - no longer using intersection observer

    private findSectionWith70PercentCoverage(): string | null {
        const windowHeight = window.innerHeight;
        let bestSection: string | null = null;
        let highestScore = 0;

        this.config.items.forEach(item => {
            if (item.href.startsWith('#')) {
                const sectionId = item.href.substring(1);
                const section = document.getElementById(sectionId);
                if (section) {
                    const rect = section.getBoundingClientRect();
                    
                    // Calculate how much of the section is visible in viewport
                    const visibleTop = Math.max(0, rect.top);
                    const visibleBottom = Math.min(windowHeight, rect.bottom);
                    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
                    
                    // Calculate coverage as percentage of viewport height
                    const viewportCoverage = visibleHeight / windowHeight;
                    
                    // Calculate how much of the section itself is visible
                    const sectionCoverage = rect.height > 0 ? visibleHeight / rect.height : 0;
                    
                    // Special handling for sections near the top of viewport
                    const isNearTop = rect.top <= windowHeight * 0.1 && rect.bottom > windowHeight * 0.3;
                    
                    // Calculate a composite score favoring sections with good visibility
                    let score = Math.max(viewportCoverage, sectionCoverage * 0.7);
                    
                    // Boost score for sections that are prominently displayed near top
                    if (isNearTop) {
                        score += 0.2;
                    }
                    
                    // Minimum coverage threshold
                    const minCoverage = 0.5; // Reduced from 0.7 to 0.5 for better responsiveness
                    
                    if (score >= minCoverage && score > highestScore) {
                        highestScore = score;
                        bestSection = item.id;
                    }
                }
            }
        });

        return bestSection;
    }

    private getScrollDirection(): 'up' | 'down' | 'none' {
        const currentScrollY = window.pageYOffset;
        const direction = currentScrollY > this.lastScrollY ? 'down' : 
                         currentScrollY < this.lastScrollY ? 'up' : 'none';
        
        this.lastScrollY = currentScrollY;
        this.scrollDirection = direction;
        return direction;
    }

    private handleScroll(): void {
        // Update scroll direction
        this.getScrollDirection();
        
        // Allow scroll detection during programmatic scroll after a shorter delay
        // and only if user is actively scrolling (scroll direction changed recently)
        const timeSinceProgrammaticScroll = Date.now() - this.programmaticScrollStartTime;
        const isUserScrolling = this.scrollDirection !== 'none';
        
        // Skip updates only during initial programmatic scroll (200ms) 
        // or if no user scroll detected and still within grace period (500ms)
        if (this.isProgrammaticScroll && 
            (timeSinceProgrammaticScroll < 200 || 
             (!isUserScrolling && timeSinceProgrammaticScroll < 500))) {
            return;
        }

        // Find section with 70% viewport coverage
        const activeSection = this.findSectionWith70PercentCoverage();
        
        if (activeSection && activeSection !== this.state.activeItem) {
            // If user is scrolling, immediately update active section
            if (isUserScrolling || !this.isProgrammaticScroll) {
                this.isProgrammaticScroll = false; // Clear programmatic scroll flag
                this.setActiveItem(activeSection);
            }
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
                // Track programmatic scroll with timestamp for better control
                this.isProgrammaticScroll = true;
                this.programmaticScrollStartTime = Date.now();
                
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Clear programmatic scroll flag after animation with shorter delay
                setTimeout(() => {
                    this.isProgrammaticScroll = false;
                    this.programmaticScrollStartTime = 0;
                }, 600); // Further reduced to 600ms for better responsiveness
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
    }

    public destroy(): void {
        this.isDestroyed = true;
        this.isNotifying = false;

        if (this.batchTimeoutId) {
            clearTimeout(this.batchTimeoutId);
            this.batchTimeoutId = null;
        }

        this.updateBatch = null;
        this.clearCloseTimeout();
        this.subscribers.clear();

        // Remove event listeners
        document.removeEventListener('keydown', this.boundMethods.handleKeyDown);
        document.removeEventListener('keyup', this.boundMethods.handleKeyUp);
        document.removeEventListener('focusin', this.boundMethods.handleFocusIn);
        document.removeEventListener('focusout', this.boundMethods.handleFocusOut);

        this.element = null;
        this.centerButton = null;
    }
}

export default NavigationManager;