/**
 * NavigationManager - Handles navigation state, radial menu logic, and accessibility
 * Follows established manager pattern from Phase 1
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
        activeItem: null,
        hoveredItem: null,
        focusedItem: null,
        keyboardMode: false,
        isAnimating: false
    };

    private config: NavigationConfig = {
        items: [
            { id: 'home', label: 'Home', href: '#home', position: 0 },
            { id: 'about', label: 'About', href: '#about', position: 1 },
            { id: 'projects', label: 'Projects', href: '#projects', position: 2 },
            { id: 'services', label: 'Services', href: '#services', position: 3 },
            { id: 'articles', label: 'Articles', href: '#articles', position: 4 },
            { id: 'contact', label: 'Contact', href: '#contact', position: 5 }
        ],
        animationDuration: 300,
        radius: 120,
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
    }

    private setupKeyboardNavigation(): void {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    private setupFocusTracking(): void {
        document.addEventListener('focusin', this.handleFocusIn.bind(this));
        document.addEventListener('focusout', this.handleFocusOut.bind(this));
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (this.isDestroyed) return;

        // Tab navigation detection
        if (e.key === 'Tab') {
            this.setState({ keyboardMode: true });
        }

        // If navigation is not open, don't handle other keys
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
        // Reset keyboard mode on mouse use
        if (e.key === 'Alt' || e.key === 'Control') {
            document.addEventListener('mousemove', this.resetKeyboardMode.bind(this), { once: true });
        }
    }

    private resetKeyboardMode(): void {
        this.setState({ keyboardMode: false });
    }

    private handleFocusIn(e: FocusEvent): void {
        const target = e.target as HTMLElement;
        if (this.element?.contains(target)) {
            const itemId = target.getAttribute('data-nav-item');
            if (itemId) {
                this.setState({ focusedItem: itemId });
            }
        }
    }

    private handleFocusOut(): void {
        // Small delay to check if focus moved to another nav item
        setTimeout(() => {
            if (!this.element?.contains(document.activeElement as HTMLElement)) {
                this.setState({ focusedItem: null });
            }
        }, 0);
    }

    private handleArrowNavigation(key: string): void {
        const currentIndex = this.config.items.findIndex(item => item.id === this.state.focusedItem);
        let nextIndex;

        switch (key) {
            case 'ArrowUp':
                nextIndex = currentIndex > 0 ? currentIndex - 1 : this.config.items.length - 1;
                break;
            case 'ArrowDown':
                nextIndex = currentIndex < this.config.items.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'ArrowLeft':
                nextIndex = currentIndex > 0 ? currentIndex - 1 : this.config.items.length - 1;
                break;
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
            this.setState({ focusedItem: itemId });
        }
    }

    private focusFirstItem(): void {
        const firstItem = this.config.items[0];
        this.focusItem(firstItem.id);
    }

    private focusLastItem(): void {
        const lastItem = this.config.items[this.config.items.length - 1];
        this.focusItem(lastItem.id);
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

        this.setState({ isOpen: true, isAnimating: true });
        this.clearCloseTimeout();

        // Focus center button for accessibility
        if (this.state.keyboardMode && this.centerButton) {
            this.centerButton.focus();
        }

        this.emit('navigation:open');

        // Animation complete
        setTimeout(() => {
            this.setState({ isAnimating: false });
        }, this.config.animationDuration);
    }

    public close(): void {
        if (!this.state.isOpen) return;

        this.setState({
            isOpen: false,
            hoveredItem: null,
            focusedItem: null,
            isAnimating: true
        });

        this.emit('navigation:close');

        // Animation complete
        setTimeout(() => {
            this.setState({ isAnimating: false });
        }, this.config.animationDuration);
    }

    public toggle(): void {
        if (this.state.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    public setHoveredItem(itemId: string | null): void {
        this.setState({ hoveredItem: itemId });

        if (itemId && this.config.autoClose) {
            this.clearCloseTimeout();
        } else if (!itemId && this.config.autoClose) {
            this.scheduleAutoClose();
        }

        this.emit('navigation:hover', { item: itemId ? this.config.items.find(i => i.id === itemId) : null });
    }

    public navigate(itemId: string): void {
        const item = this.config.items.find(i => i.id === itemId);
        if (!item) return;

        this.setState({ activeItem: itemId });
        this.emit('navigation:navigate', { item });
        this.close();

        // Handle navigation
        if (item.href.startsWith('#')) {
            // Smooth scroll to section
            const target = document.querySelector(item.href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // External link
            if (item.external) {
                window.open(item.href, '_blank', 'noopener,noreferrer');
            } else {
                window.location.href = item.href;
            }
        }
    }

    public getItemPosition(position: number): Position {
        const angle = (position * 360) / this.config.items.length;
        const radian = (angle - 90) * (Math.PI / 180); // Start from top

        return {
            x: Math.cos(radian) * this.config.radius,
            y: Math.sin(radian) * this.config.radius
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

    private setState(newState: Partial<NavigationState>): void {
        this.state = { ...this.state, ...newState };
        this.notifySubscribers();
    }

    private notifySubscribers(): void {
        this.subscribers.forEach(callback => callback(this.state));
    }

    public subscribe(callback: (state: NavigationState) => void): () => void {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    private emit(event: string, data?: any): void {
        const customEvent = new CustomEvent(event, {
            detail: {
                ...data,
                state: this.state
            }
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
        this.notifySubscribers();
    }

    public destroy(): void {
        this.isDestroyed = true;
        this.clearCloseTimeout();
        this.subscribers.clear();

        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        document.removeEventListener('focusin', this.handleFocusIn);
        document.removeEventListener('focusout', this.handleFocusOut);

        this.element = null;
        this.centerButton = null;
    }
}

export default NavigationManager;