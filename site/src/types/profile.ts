// types/profile.ts - User Profile Type Definitions

export type UserRole = 'admin' | 'client' | 'user';
export type AuthProvider = 'google' | 'email' | 'github' | 'facebook';

/**
 * Core user profile interface representing the profiles table
 */
export interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    role: UserRole;
    company?: string;
    website?: string;
    bio?: string;
    phone?: string;
    location?: string;
    timezone?: string;

    // OAuth provider information
    provider: AuthProvider;
    provider_id?: string;

    // Profile completion tracking
    profile_completed: boolean;
    profile_completion_date?: string;

    // Metadata from OAuth providers
    oauth_metadata: Record<string, any>;

    // User preferences
    preferences: UserPreferences;

    // Profile visibility
    public_profile: boolean;

    // Notification preferences
    email_notifications: boolean;
    marketing_emails: boolean;

    // Profile status
    is_active: boolean;
    is_verified: boolean;

    // Tracking
    last_login_at?: string;
    login_count: number;
    created_at: string;
    updated_at: string;
}

/**
 * User preferences structure
 */
export interface UserPreferences {
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    timezone?: string;
    date_format?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    time_format?: '12h' | '24h';
    notifications?: {
        email_new_messages?: boolean;
        email_project_updates?: boolean;
        email_marketing?: boolean;
        browser_notifications?: boolean;
    };
    privacy?: {
        profile_visibility?: 'public' | 'private' | 'contacts_only';
        show_online_status?: boolean;
        allow_contact_form?: boolean;
    };
}

/**
 * Profile completion status
 */
export interface ProfileCompletionStatus {
    exists: boolean;
    completed: boolean;
    needs_creation: boolean;
    completion_percentage?: number;
    missing_fields?: string[];
    has_full_name?: boolean;
    has_avatar?: boolean;
    is_verified?: boolean;
    provider?: string;
    last_login?: string;
    login_count?: number;
}

/**
 * Profile creation/update result
 */
export interface ProfileCreationResult {
    success: boolean;
    action: 'created' | 'updated';
    profile_completed: boolean;
    error?: string;
    profile?: UserProfile;
}

/**
 * Profile update data (for partial updates)
 */
export interface ProfileUpdateData {
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    company?: string;
    website?: string;
    phone?: string;
    location?: string;
    timezone?: string;
    public_profile?: boolean;
    email_notifications?: boolean;
    email?: string;
    marketing_emails?: boolean;
    preferences?: Partial<UserPreferences>;
}

/**
 * Profile analytics data
 */
export interface ProfileAnalytics {
    total_users: number;
    verified_users: number;
    completed_profiles: number;
    google_users: number;
    email_users: number;
    recent_signups: number;
    active_users_30d: number;
    completion_rate: number;
    provider_breakdown: Record<AuthProvider, number>;
    role_breakdown: Record<UserRole, number>;
    error?: string;
}

/**
 * Profile query filters
 */
export interface ProfileQueryFilters {
    role?: UserRole;
    provider?: AuthProvider;
    is_verified?: boolean;
    profile_completed?: boolean;
    is_active?: boolean;
    public_profile?: boolean;
    created_after?: string;
    created_before?: string;
    last_login_after?: string;
    search?: string; // Search in name, email, company
    limit?: number;
    offset?: number;
    sort_by?: 'created_at' | 'updated_at' | 'last_login_at' | 'full_name';
    sort_order?: 'asc' | 'desc';
}

/**
 * Profile query result
 */
export interface ProfileQueryResult {
    profiles: UserProfile[];
    total_count: number;
    page_count: number;
    current_page: number;
    has_next_page: boolean;
    has_previous_page: boolean;
    error?: string;
}

/**
 * Bulk profile operation result
 */
export interface BulkProfileOperationResult {
    total_processed: number;
    successful: number;
    failed: number;
    errors: string[];
    details: string[];
    execution_time_ms?: number;
}

/**
 * Profile validation result
 */
export interface ProfileValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
}

/**
 * Profile activity log entry
 */
export interface ProfileActivityLog {
    id: string;
    user_id: string;
    activity_type: 'login' | 'profile_update' | 'password_change' | 'email_change' | 'role_change';
    activity_data: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}

/**
 * Extended auth state including profile information
 */
export interface ExtendedAuthState {
    user: any | null; // Supabase User type
    session: any | null; // Supabase Session type
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    profile: UserProfile | null;
    profileLoading: boolean;
    profileCompleted: boolean;
    profileCompletionPercentage?: number;
}

/**
 * Auth result with profile information
 */
export interface AuthResult {
    success: boolean;
    error?: { message: string } | null;
    data?: any;
    profile?: UserProfile;
    profileCreated?: boolean;
    profileCompleted?: boolean;
}

/**
 * Profile service response wrapper
 */
export interface ProfileServiceResponse<T = any> {
    data?: T;
    error?: string;
    success: boolean;
    message?: string;
}

/**
 * Profile migration result
 */
export interface ProfileMigrationResult {
    total_users: number;
    profiles_created: number;
    profiles_updated: number;
    errors: number;
    execution_time_ms: number;
    details: string[];
}

/**
 * Profile completion requirements
 */
export interface ProfileCompletionRequirements {
    required_fields: (keyof UserProfile)[];
    optional_fields: (keyof UserProfile)[];
    min_completion_percentage: number;
    verification_required: boolean;
}

/**
 * Profile notification settings
 */
export interface ProfileNotificationSettings {
    email_notifications: boolean;
    marketing_emails: boolean;
    security_alerts: boolean;
    project_updates: boolean;
    system_announcements: boolean;
    digest_frequency: 'never' | 'daily' | 'weekly' | 'monthly';
}

/**
 * OAuth metadata structure (varies by provider)
 */
export interface OAuthMetadata {
    provider: AuthProvider;
    provider_id?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    full_name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    avatar_url?: string;
    locale?: string;
    sub?: string;
    aud?: string;
    exp?: number;
    iat?: number;
    iss?: string;
    // Provider-specific fields can be added as needed
    [key: string]: any;
}

/**
 * Profile export data structure
 */
export interface ProfileExportData {
    profile: UserProfile;
    activity_logs?: ProfileActivityLog[];
    created_projects?: any[];
    preferences_history?: any[];
    export_timestamp: string;
    export_version: string;
}

/**
 * Type guards for user profiles
 */
export function isValidUserProfile(obj: any): obj is UserProfile {
    return (
        obj &&
        typeof obj === 'object' &&
        typeof obj.id === 'string' &&
        typeof obj.email === 'string' &&
        typeof obj.role === 'string' &&
        ['admin', 'client', 'user'].includes(obj.role) &&
        typeof obj.is_active === 'boolean' &&
        typeof obj.profile_completed === 'boolean'
    );
}

export function isValidAuthProvider(provider: string): provider is AuthProvider {
    return ['google', 'email', 'github', 'facebook'].includes(provider);
}

export function isValidUserRole(role: string): role is UserRole {
    return ['admin', 'client', 'user'].includes(role);
}

/**
 * Default user preferences
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
    theme: 'auto',
    language: 'en',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    notifications: {
        email_new_messages: true,
        email_project_updates: true,
        email_marketing: false,
        browser_notifications: true,
    },
    privacy: {
        profile_visibility: 'public',
        show_online_status: true,
        allow_contact_form: true,
    },
};

/**
 * Profile completion requirements
 */
export const PROFILE_COMPLETION_REQUIREMENTS: ProfileCompletionRequirements = {
    required_fields: ['email', 'full_name'],
    optional_fields: ['bio', 'company', 'website', 'phone', 'location'],
    min_completion_percentage: 60,
    verification_required: false,
};

/**
 * Profile field validation rules
 */
export const PROFILE_VALIDATION_RULES = {
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        max_length: 255,
    },
    full_name: {
        required: false,
        min_length: 2,
        max_length: 100,
        pattern: /^[a-zA-Z\s\-'.]+$/
    },
    phone: {
        required: false,
        pattern: /^\+?[\d\s\-()]+$/,
        min_length: 10,
        max_length: 20,
    },
    website: {
        required: false,
        pattern: /^https?:\/\/.+/,
        max_length: 255,
    },
    bio: {
        required: false,
        max_length: 500,
    },
    company: {
        required: false,
        max_length: 100,
    },
    location: {
        required: false,
        max_length: 100,
    },
} as const;