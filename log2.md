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
Object { version: "1.0.0", buildTime: "2025-09-05T16:19:33.619Z", environment: "development", gitBranch: "development" }
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
🏠 AdminDashboard render: 
Object { user: false, profile: false, loading: true, isAdmin: false, isAuthenticated: false }
AdminDashboard.tsx:40:11
🏠 AdminDashboard render: 
Object { user: false, profile: false, loading: true, isAdmin: false, isAuthenticated: false }
AdminDashboard.tsx:40:11
🔄 AUTH STATE CHANGED: 
Object { loading: true, isAuthenticated: false, hasUser: false, hasSession: false, userId: "none" }
useAuth.ts:16:13
useAuth: Initializing... useAuth.ts:25:13
useAuth: Cleaning up listener useAuth.ts:70:15
🔄 AUTH STATE CHANGED: 
Object { loading: true, isAuthenticated: false, hasUser: false, hasSession: false, userId: "none" }
useAuth.ts:16:13
useAuth: Initializing... useAuth.ts:25:13
useAuth: Initial session: a2c96652-9cfd-4ad7-9ae6-77a7fb98bce7 2 useAuth.ts:38:17
🔄 updateAuthState called useAuth.ts:78:13
📋 Session details: 
Object { exists: true, userId: "a2c96652-9cfd-4ad7-9ae6-77a7fb98bce7", userEmail: "gamingdronzz@gmail.com", expiresAt: Date Sat Sep 06 2025 01:23:31 GMT+0530 (India Standard Time), accessToken: "***EXISTS***", refreshToken: "***EXISTS***" }
useAuth.ts:79:13
🔍 CHECKPOINT 1: About to process session... useAuth.ts:87:13
✅ Valid session found - updating authenticated state useAuth.ts:106:15
👤 User info: 
Object { id: "a2c96652-9cfd-4ad7-9ae6-77a7fb98bce7", email: "gamingdronzz@gmail.com", emailVerified: "2025-09-05T07:22:37.112014Z", lastSignIn: "2025-09-05T17:50:55.02479Z", provider: "google" }
useAuth.ts:107:15
🔍 CHECKPOINT 2: About to check admin status... useAuth.ts:114:15
🔍 Checking admin status... useAuth.ts:115:15
🛡️ Admin status: true useAuth.ts:119:17
✅ CHECKPOINT 3: Profile exists (created automatically by database trigger) useAuth.ts:120:17
👑 Admin user detected - applying admin adjustments useAuth.ts:122:19
🔍 CHECKPOINT 4: Profile operations complete, setting final state... useAuth.ts:130:15
🔓 Auth state set to: 
Object { user: {…}, session: "***SESSION_OBJECT***", loading: false, isAuthenticated: true, isAdmin: true, profile: null, profileLoading: false, profileCompleted: true, profileCompletionPercentage: 100 }
useAuth.ts:144:15
🔍 CHECKPOINT 5: About to call setAuthState... useAuth.ts:152:15
🔍 CHECKPOINT 6: setAuthState called successfully - auth flow COMPLETE useAuth.ts:154:15
🏠 AdminDashboard render: 
Object { user: true, profile: false, loading: false, isAdmin: true, isAuthenticated: true }
AdminDashboard.tsx:40:11
🏠 AdminDashboard render: 
Object { user: true, profile: false, loading: false, isAdmin: true, isAuthenticated: true }
AdminDashboard.tsx:40:11
🔄 AUTH STATE CHANGED: 
Object { loading: false, isAuthenticated: true, hasUser: true, hasSession: true, userId: "a2c96652-9cfd-4ad7-9ae6-77a7fb98bce7" }
useAuth.ts:16:13
Auth state changed: INITIAL_SESSION gamingdronzz@gmail.com AuthService.ts:302:15
🎯 Ignoring INITIAL_SESSION event to prevent duplicates useAuth.ts:45:23
