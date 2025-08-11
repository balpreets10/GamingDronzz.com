export interface BaseManager {
    init(): void;
    destroy(): void;
}

export interface ScrollAnimationOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
    reverse?: boolean;
}

export interface PerformanceTargets {
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
}

export interface AnimationConfig {
    duration: number;
    easing: string;
    stagger: number;
    reducedMotion: boolean;
}

export interface ApiConfig {
    baseURL: string;
    timeout: number;
    retries: number;
}

export interface AnalyticsConfig {
    enabled: boolean;
    debug: boolean;
    trackingId: string;
}

export interface FeatureFlags {
    adminPanel: boolean;
    debugMode: boolean;
    mockData: boolean;
    performanceLogging: boolean;
}

// Component prop types
export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
    'data-testid'?: string;
}

export interface SectionProps extends BaseComponentProps {
    id?: string;
    'data-scroll-animation'?: string;
}

// Manager interfaces
export interface IScrollManager {
    register(element: HTMLElement, animation: string, config?: ScrollAnimationOptions): string;
    unregister(id: string): void;
    onScroll(callback: (position: number, direction: 'up' | 'down') => void): () => void;
    getScrollPosition(): number;
    scrollTo(target: number | HTMLElement, smooth?: boolean): void;
}

export interface IPerformanceManager {
    getMetrics(): PerformanceMetrics;
    startMark(name: string): void;
    endMark(name: string): number | null;
}

export interface PerformanceMetrics {
    fcp: number | null;
    lcp: number | null;
    fid: number | null;
    cls: number | null;
    ttfb: number | null;
}