import { useState, useEffect, useCallback } from 'react';
import ContentManager from '../managers/ContentManager';

interface ContentState {
    isLoaded: boolean;
    currentSection: string;
    lazyImages: Map<string, boolean>;
    seoData: Record<string, any>;
}

let contentManagerInstance: ContentManager | null = null;

export const useContentManager = () => {
    const [state, setState] = useState<ContentState>({
        isLoaded: false,
        currentSection: 'hero',
        lazyImages: new Map(),
        seoData: {}
    });

    useEffect(() => {
        if (!contentManagerInstance) {
            contentManagerInstance = new ContentManager();
        }

        const unsubscribe = contentManagerInstance.subscribe(setState);

        // Set initial state
        setState(contentManagerInstance.getState());

        return () => {
            unsubscribe();
        };
    }, []);

    const setCurrentSection = useCallback((section: string) => {
        contentManagerInstance?.setCurrentSection(section);
    }, []);

    const setSeoData = useCallback((data: Record<string, any>) => {
        contentManagerInstance?.setSeoData(data);
    }, []);

    const observeImage = useCallback((img: HTMLImageElement) => {
        contentManagerInstance?.observeImage(img);
    }, []);

    return {
        ...state,
        setCurrentSection,
        setSeoData,
        observeImage
    };
};