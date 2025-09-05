[vite] connecting... client:229:9
[vite] connected. client:325:21
Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools chunk-G52XTN3B.js:21580:25
🔍 Environment Detection Debug: 
Object { detected: "development", available: (3) […], exists: true, viteMode: "development", viteEnv: "development", nodeEnv: "undefined" }
index.ts:30:13
🎮 GamingDronzz Configuration index.ts:78:11
🏷️ Environment: development index.ts:79:11
⚙️ Config: 
Object { api: {…}, supabase: {…}, google: {…}, app: {…}, analytics: {…}, features: {…}, performance: {…}, animations: {…}, environment: "development", buildInfo: {…} }
index.ts:80:11
🏗️ Build Info: 
Object { version: "1.0.0", buildTime: "2025-09-05T06:16:38.849Z", environment: "development", gitBranch: "development" }
index.ts:81:11
🎯 API Endpoint: http://localhost:3001/api index.ts:82:11
🔧 Features: 
Object { adminPanel: true, debugMode: true, mockData: true, performanceLogging: true }
index.ts:83:11
📊 Performance Targets: 
Object { fcp: 1500, lcp: 2500, fid: 100, cls: 0.1 }
index.ts:85:13
✅ Configuration validation passed index.ts:107:15
Shared Supabase client initialized supabaseClient.ts:20:15
URL: https://kjntsckfsktefmfydlfm.supabase.co supabaseClient.ts:21:15
Redirect URL base: http://localhost:3000 supabaseClient.ts:22:15
AuthService initialized using shared client AuthService.ts:7:13
SupabaseService initialized using shared client SupabaseService.ts:10:13
🔄 AUTH STATE CHANGED: 
Object { loading: true, isAuthenticated: false, hasUser: false, hasSession: false, userId: "none" }
useAuth.ts:16:13
useAuth: Initializing... useAuth.ts:25:13
Processing OAuth callback... OAuthCallback.tsx:39:17
OAuth error: server_error Database error saving new user OAuthCallback.tsx:43:19
    processCallback OAuthCallback.tsx:34
    OAuthCallback OAuthCallback.tsx:61
    React 8
    workLoop scheduler.development.js:266
    flushWork scheduler.development.js:239
    performWorkUntilDeadline scheduler.development.js:533
useAuth: Cleaning up listener useAuth.ts:70:15
🔄 AUTH STATE CHANGED: 
Object { loading: true, isAuthenticated: false, hasUser: false, hasSession: false, userId: "none" }
useAuth.ts:16:13
useAuth: Initializing... useAuth.ts:25:13
OAuth callback already processed, skipping... OAuthCallback.tsx:34:17
useAuth: Initial session: none 2 useAuth.ts:38:17
🔄 updateAuthState called useAuth.ts:78:13
📋 Session details: 
Object { exists: false, userId: "none", userEmail: "none", expiresAt: "none", accessToken: "none", refreshToken: "none" }
useAuth.ts:79:13
🔍 CHECKPOINT 1: About to process session... useAuth.ts:87:13
❌ No session or user - setting unauthenticated state useAuth.ts:90:17
🔒 Auth state set to: 
Object { user: null, session: null, loading: false, isAuthenticated: false, isAdmin: false, profile: null, profileLoading: false, profileCompleted: false, profileCompletionPercentage: 0 }
useAuth.ts:102:17
🔄 AUTH STATE CHANGED: 
Object { loading: false, isAuthenticated: false, hasUser: false, hasSession: false, userId: "none" }
useAuth.ts:16:13
Auth state changed: INITIAL_SESSION No user AuthService.ts:302:15
🎯 Ignoring INITIAL_SESSION event to prevent duplicates useAuth.ts:45:23
