export const stagingConfig = {
    api: {
        baseURL: 'https://staging-api.gamingdronzz.com',
        timeout: 15000,
        retries: 2
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
    analytics: {
        enabled: true,
        debug: true,
        trackingId: import.meta.env.VITE_GA_STAGING_TRACKING_ID || 'STAGING-TRACKING-ID'
    },
    features: {
        adminPanel: true,
        debugMode: true,
        mockData: false,
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
    },
    environment: 'staging',
    buildInfo: {
        version: import.meta.env.VITE_APP_VERSION || '1.0.0-staging',
        buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
        gitBranch: import.meta.env.VITE_GIT_BRANCH || 'staging'
    }
} as const;