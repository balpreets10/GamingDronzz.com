export const developmentConfig = {
    api: {
        baseURL: 'http://localhost:3001/api',
        timeout: 30000,
        retries: 3
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
    },
    environment: 'development',
    buildInfo: {
        version: import.meta.env.VITE_APP_VERSION || '1.0.0-dev',
        buildTime: new Date().toISOString(),
        gitBranch: 'development'
    }
} as const;