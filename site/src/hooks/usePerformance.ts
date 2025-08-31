import { useEffect, useState } from 'react';

export const usePerformance = () => {
    const [metrics, setMetrics] = useState({
        fcp: null,
        lcp: null,
        fid: null,
        cls: null
    });

    useEffect(() => {
        if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
            return;
        }

        const observers: PerformanceObserver[] = [];

        // First Contentful Paint
        const paintObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
                }
            }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        observers.push(paintObserver);

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        observers.push(lcpObserver);

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                const fid = entry.processingStart - entry.startTime;
                setMetrics(prev => ({ ...prev, fid }));
            }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        observers.push(fidObserver);

        // Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!(entry as any).hadRecentInput) {
                    clsValue += (entry as any).value;
                }
            }
            setMetrics(prev => ({ ...prev, cls: clsValue }));
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        observers.push(clsObserver);

        return () => {
            observers.forEach(observer => observer.disconnect());
        };
    }, []);

    return metrics;
};