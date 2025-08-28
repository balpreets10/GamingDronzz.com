import { useCallback, useEffect, useRef } from 'react';

interface LazyLoadOptions {
    rootMargin?: string;
    threshold?: number;
}

export const useLazyLoad = (options: LazyLoadOptions = {}) => {
    const observer = useRef<IntersectionObserver | null>(null);
    const { rootMargin = '50px', threshold = 0.1 } = options;

    useEffect(() => {
        if (!('IntersectionObserver' in window)) return;

        observer.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target as HTMLImageElement;
                        loadImage(img);
                        observer.current?.unobserve(img);
                    }
                });
            },
            { rootMargin, threshold }
        );

        return () => {
            observer.current?.disconnect();
        };
    }, [rootMargin, threshold]);

    const loadImage = (img: HTMLImageElement): void => {
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;

        if (src) {
            img.src = src;
        }

        if (srcset) {
            img.srcset = srcset;
        }

        img.classList.add('loaded');
        img.removeAttribute('data-src');
        img.removeAttribute('data-srcset');
    };

    const observeImage = useCallback((img: HTMLImageElement) => {
        if (observer.current && img) {
            observer.current.observe(img);
        }
    }, []);

    const unobserveImage = useCallback((img: HTMLImageElement) => {
        if (observer.current && img) {
            observer.current.unobserve(img);
        }
    }, []);

    return {
        observeImage,
        unobserveImage
    };
};