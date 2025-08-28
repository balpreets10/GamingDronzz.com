interface ContentState {
    isLoaded: boolean;
    currentSection: string;
    lazyImages: Map<string, boolean>;
    seoData: Record<string, any>;
}

interface ContentConfig {
    enableLazyLoading: boolean;
    imageFormats: string[];
    seoEnabled: boolean;
}

interface ContentSubscriber {
    (state: ContentState): void;
}

class ContentManager {
    private state: ContentState;
    private config: ContentConfig;
    private subscribers: Set<ContentSubscriber>;
    private intersectionObserver: IntersectionObserver | null;

    constructor(config: Partial<ContentConfig> = {}) {
        this.config = {
            enableLazyLoading: true,
            imageFormats: ['webp', 'jpg', 'png'],
            seoEnabled: true,
            ...config
        };

        this.state = this.getInitialState();
        this.subscribers = new Set();
        this.intersectionObserver = null;
        this.init();
    }

    private getInitialState(): ContentState {
        return {
            isLoaded: false,
            currentSection: 'hero',
            lazyImages: new Map(),
            seoData: {}
        };
    }

    private init(): void {
        if (this.config.enableLazyLoading) {
            this.setupLazyLoading();
        }
        this.setState({ isLoaded: true });
    }

    private setupLazyLoading(): void {
        if (!('IntersectionObserver' in window)) return;

        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target as HTMLImageElement;
                        this.loadImage(img);
                        this.intersectionObserver?.unobserve(img);
                    }
                });
            },
            { rootMargin: '50px' }
        );
    }

    private loadImage(img: HTMLImageElement): void {
        const src = img.dataset.src;
        if (src) {
            img.src = src;
            img.classList.add('loaded');
            this.updateImageState(img.dataset.id || src, true);
        }
    }

    private updateImageState(id: string, loaded: boolean): void {
        const newLazyImages = new Map(this.state.lazyImages);
        newLazyImages.set(id, loaded);
        this.setState({ lazyImages: newLazyImages });
    }

    public observeImage(img: HTMLImageElement): void {
        if (this.intersectionObserver && img) {
            this.intersectionObserver.observe(img);
        }
    }

    public setCurrentSection(section: string): void {
        if (section !== this.state.currentSection) {
            this.setState({ currentSection: section });
        }
    }

    public setSeoData(data: Record<string, any>): void {
        this.setState({ seoData: { ...this.state.seoData, ...data } });
    }

    public getState(): ContentState {
        return { ...this.state };
    }

    private setState(newState: Partial<ContentState>): void {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    public subscribe(callback: ContentSubscriber): () => void {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    private notify(): void {
        this.subscribers.forEach(callback => callback(this.state));
    }

    public destroy(): void {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        this.subscribers.clear();
    }
}

export default ContentManager;