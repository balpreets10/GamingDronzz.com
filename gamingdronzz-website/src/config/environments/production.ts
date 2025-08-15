export const productionConfig = {
    api: {
        baseURL: 'https://api.gamingdronzz.com',
        timeout: 10000,
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
        debug: false,
        trackingId: import.meta.env.VITE_GA_TRACKING_ID || ''
    },
    features: {
        adminPanel: false,
        debugMode: false,
        mockData: false,
        performanceLogging: false
    },
    performance: {
        enableLogging: false,
        enableDevtools: false,
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
        reducedMotion: typeof window !== 'undefined' ?
            window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
    },
    environment: 'production',
    buildInfo: {
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
        gitBranch: import.meta.env.VITE_GIT_BRANCH || 'main'
    }
} as const;