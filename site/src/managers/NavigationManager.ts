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

    private isDashboardMode = false;

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
    private dashboardSubscribers: Set<(isDashboardMode: boolean) => void> = new Set();
    private element: HTMLElement | null = null;
    private centerButton: HTMLElement | null = null;
    private closeTimeout: number | null = null;
    private isDestroyed = false;

    // Simple scroll tracking
    private isProgrammaticScroll = false;
    private scrollTimeout: number | null = null;

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
    }

    private setupScrollTracking(): void {
        window.addEventListener('scroll', this.boundMethods.handleScroll, { passive: true });
    }

    private findActiveSection(): string | null {
        const sections = this.config.items
            .filter(item => item.href.startsWith('#'))
            .map(item => ({
                id: item.id,
                element: document.getElementById(item.href.substring(1))
            }))
            .filter(section => section.element);

        let activeSection: string | null = null;
        let closestDistance = Infinity;

        for (const section of sections) {
            const rect = section.element!.getBoundingClientRect();
            const distance = Math.abs(rect.top);
            
            if (rect.top <= 100 && rect.bottom >= 100 && distance < closestDistance) {
                closestDistance = distance;
                activeSection = section.id;
            }
        }

        return activeSection;
    }

    private handleScroll(): void {
        if (this.isProgrammaticScroll) return;
        
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        
        this.scrollTimeout = window.setTimeout(() => {
            const activeSection = this.findActiveSection();
            if (activeSection && activeSection !== this.state.activeItem) {
                this.setActiveItem(activeSection);
            }
        }, 100);
    }

    private setActiveItem(itemId: string): void {
        if (this.state.activeItem !== itemId) {
            this.state = { ...this.state, activeItem: itemId };
            this.notifySubscribers();
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
            this.updateState({ keyboardMode: true });
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
        this.updateState({ keyboardMode: false });
    }

    private handleFocusIn(e: FocusEvent): void {
        const target = e.target as HTMLElement;
        if (this.element?.contains(target)) {
            const itemId = target.getAttribute('data-nav-item');
            if (itemId) {
                this.updateState({ focusedItem: itemId });
            }
        }
    }

    private handleFocusOut(): void {
        setTimeout(() => {
            if (!this.element?.contains(document.activeElement as HTMLElement)) {
                this.updateState({ focusedItem: null });
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
            this.updateState({ focusedItem: itemId });
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

        this.updateState({ isOpen: true, isAnimating: true });
        this.clearCloseTimeout();

        if (this.state.keyboardMode && this.centerButton) {
            this.centerButton.focus();
        }

        setTimeout(() => {
            this.updateState({ isAnimating: false });
        }, this.config.animationDuration);
    }

    public close(): void {
        if (!this.state.isOpen) return;

        this.updateState({
            isOpen: false,
            hoveredItem: null,
            focusedItem: null,
            isAnimating: true
        });

        setTimeout(() => {
            this.updateState({ isAnimating: false });
        }, this.config.animationDuration);
    }

    public toggle(): void {
        this.state.isOpen ? this.close() : this.open();
    }

    public setHoveredItem(itemId: string | null): void {
        this.updateState({ hoveredItem: itemId });

        if (itemId && this.config.autoClose) {
            this.clearCloseTimeout();
        } else if (!itemId && this.config.autoClose) {
            this.scheduleAutoClose();
        }

    }

    public navigate(itemId: string): void {
        const item = this.config.items.find(i => i.id === itemId);
        if (!item) return;

        this.setActiveItem(itemId);
        this.close();

        if (item.href.startsWith('#')) {
            const target = document.querySelector(item.href);
            if (target) {
                this.isProgrammaticScroll = true;
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                setTimeout(() => {
                    this.isProgrammaticScroll = false;
                }, 1000);
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

    // Simple state update
    private updateState(newState: Partial<NavigationState>): void {
        if (this.isDestroyed) return;

        const hasChanges = Object.keys(newState).some(
            key => this.state[key as keyof NavigationState] !== newState[key as keyof NavigationState]
        );

        if (!hasChanges) return;

        this.state = { ...this.state, ...newState };
        this.notifySubscribers();
    }

    private notifySubscribers(): void {
        if (this.isDestroyed) return;

        const currentState = { ...this.state };
        this.subscribers.forEach(callback => {
            try {
                callback(currentState);
            } catch (error) {
                console.error('Navigation subscriber error:', error);
            }
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

    public subscribeToDashboard(callback: (isDashboardMode: boolean) => void): () => void {
        this.dashboardSubscribers.add(callback);

        // Immediate call with current state
        try {
            callback(this.isDashboardMode);
        } catch (error) {
            console.error('Dashboard subscriber initial call error:', error);
        }

        return () => this.dashboardSubscribers.delete(callback);
    }

    private notifyDashboardSubscribers(): void {
        if (this.isDestroyed) return;

        this.dashboardSubscribers.forEach(callback => {
            try {
                callback(this.isDashboardMode);
            } catch (error) {
                console.error('Dashboard subscriber error:', error);
            }
        });
    }

    public enterDashboard(): void {
        if (this.isDashboardMode) return;
        
        this.isDashboardMode = true;
        this.close(); // Close navigation if open
        this.notifyDashboardSubscribers();
    }

    public exitDashboard(): void {
        if (!this.isDashboardMode) return;
        
        this.isDashboardMode = false;
        this.notifyDashboardSubscribers();
    }

    public isDashboard(): boolean {
        return this.isDashboardMode;
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

        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = null;
        }

        this.clearCloseTimeout();
        this.subscribers.clear();
        this.dashboardSubscribers.clear();

        // Remove event listeners
        document.removeEventListener('keydown', this.boundMethods.handleKeyDown);
        document.removeEventListener('keyup', this.boundMethods.handleKeyUp);
        document.removeEventListener('focusin', this.boundMethods.handleFocusIn);
        document.removeEventListener('focusout', this.boundMethods.handleFocusOut);
        window.removeEventListener('scroll', this.boundMethods.handleScroll);

        this.element = null;
        this.centerButton = null;
    }
}

export default NavigationManager;