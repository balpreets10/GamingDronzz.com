export const stagingConfig = {
    api: {
        baseURL: 'https://staging-api.gamingdronzz.com', // You can change this to your staging API
        timeout: 15000,
        retries: 2
    },
    analytics: {
        enabled: false, // Disabled for staging
        debug: true,
        trackingId: 'STAGING-DISABLED'
    },
    supabase: {
        url: import.meta.env.VITE_SUPABASE_URL!,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    },
    features: {
        adminPanel: true, // Keep admin panel for testing
        debugMode: true, // Keep debug mode for staging
        mockData: false, // Use real data in staging
        performanceLogging: true // Monitor performance
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
    },
    environment: 'staging',
    buildInfo: {
        version: process.env.REACT_APP_VERSION || '1.0.0',
        buildTime: new Date().toISOString(),
        gitBranch: 'staging'
    }
};