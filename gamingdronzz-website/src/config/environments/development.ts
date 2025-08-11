export const developmentConfig = {
    api: {
        baseURL: 'http://localhost:3001/api',
        timeout: 30000,
        retries: 3
    },
    analytics: {
        enabled: false,
        debug: true,
        trackingId: 'DEV-TRACKING-ID'
    },
    features: {
        adminPanel: true,
        debugMode: true,
        mockData: true,
        performanceLogging: true
    },
    performance: {
        enableLogging: true,
        enableDevtools: true,
        targets: {
            fcp: 1500,
            lcp: 2500,
            fid: 100,
            cls: 0.1
        }
    },
    animations: {
        duration: 300,
        easing: 'ease-out',
        stagger: 100,
        reducedMotion: false
    }
};