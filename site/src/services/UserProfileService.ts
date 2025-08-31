// services/UserProfileService.ts - User Profile Management Service
import { SupabaseClient } from '@supabase/supabase-js';
import supabaseService from './SupabaseService';
import { 
    UserProfile, 
    ProfileCompletionStatus, 
    ProfileCreationResult, 
    ProfileUpdateData,
    UserRole,
    AuthProvider
} from '../types/profile';


class UserProfileService {
    private client: SupabaseClient;

    constructor() {
        this.client = supabaseService.getClient();
    }

    // ===== PROFILE CREATION & MANAGEMENT ===== //

    /**
     * Ensures a user profile exists and is up-to-date
     * Handles both new users and existing users without profiles
     */
    async ensureUserProfile(userId: string): Promise<ProfileCreationResult> {
        try {
            const { data, error } = await this.client
                .rpc('ensure_user_profile', { user_id: userId });

            if (error) {
                console.error('Profile creation/update error:', error);
                return { 
                    success: false, 
                    error: error.message,
                    action: 'created',
                    profile_completed: false
                };
            }

            return data as ProfileCreationResult;
        } catch (error: any) {
            console.error('Profile service error:', error);
            return { 
                success: false, 
                error: error.message || 'Failed to create/update profile',
                action: 'created',
                profile_completed: false
            };
        }
    }

    /**
     * Handles user login and profile management
     */
    async handleUserLogin(userId: string): Promise<ProfileCreationResult> {
        try {
            const { data, error } = await this.client
                .rpc('handle_user_login', { user_id: userId });

            if (error) {
                console.error('Login profile handling error:', error);
                return { 
                    success: false, 
                    error: error.message,
                    action: 'created',
                    profile_completed: false
                };
            }

            return data as ProfileCreationResult;
        } catch (error: any) {
            console.error('Login profile service error:', error);
            return { 
                success: false, 
                error: error.message || 'Failed to handle user login profile',
                action: 'created',
                profile_completed: false
            };
        }
    }

    /**
     * Checks if a user profile exists and its completion status
     */
    async checkProfileCompletion(userId: string): Promise<ProfileCompletionStatus> {
        try {
            const { data, error } = await this.client
                .rpc('check_profile_completion', { user_id: userId });

            if (error) {
                console.error('Profile completion check error:', error);
                return {
                    exists: false,
                    completed: false,
                    needs_creation: true
                };
            }

            return data as ProfileCompletionStatus;
        } catch (error: any) {
            console.error('Profile completion service error:', error);
            return {
                exists: false,
                completed: false,
                needs_creation: true
            };
        }
    }

    // ===== PROFILE DATA RETRIEVAL ===== //

    /**
     * Gets a user's complete profile
     */
    async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error?: string }> {
        try {
            const { data, error } = await this.client
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Get profile error:', error);
                return { profile: null, error: error.message };
            }

            return { profile: data as UserProfile };
        } catch (error: any) {
            console.error('Profile retrieval error:', error);
            return { profile: null, error: error.message || 'Failed to retrieve profile' };
        }
    }

    /**
     * Gets multiple user profiles (for admin use)
     */
    async getUserProfiles(
        filters?: {
            role?: string;
            is_verified?: boolean;
            profile_completed?: boolean;
            limit?: number;
            offset?: number;
        }
    ): Promise<{ profiles: UserProfile[]; error?: string; count?: number }> {
        try {
            let query = this.client
                .from('profiles')
                .select('*', { count: 'exact' });

            // Apply filters
            if (filters?.role) {
                query = query.eq('role', filters.role);
            }
            if (filters?.is_verified !== undefined) {
                query = query.eq('is_verified', filters.is_verified);
            }
            if (filters?.profile_completed !== undefined) {
                query = query.eq('profile_completed', filters.profile_completed);
            }

            // Apply pagination
            if (filters?.limit) {
                query = query.limit(filters.limit);
            }
            if (filters?.offset) {
                query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
            }

            // Order by creation date
            query = query.order('created_at', { ascending: false });

            const { data, error, count } = await query;

            if (error) {
                console.error('Get profiles error:', error);
                return { profiles: [], error: error.message };
            }

            return { profiles: data as UserProfile[], count: count || 0 };
        } catch (error: any) {
            console.error('Profiles retrieval error:', error);
            return { profiles: [], error: error.message || 'Failed to retrieve profiles' };
        }
    }

    // ===== PROFILE UPDATES ===== //

    /**
     * Updates a user's profile data
     */
    async updateUserProfile(
        userId: string, 
        updates: ProfileUpdateData
    ): Promise<{ success: boolean; error?: string; profile?: UserProfile }> {
        try {
            const { data, error } = await this.client
                .from('profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select('*')
                .single();

            if (error) {
                console.error('Profile update error:', error);
                return { success: false, error: error.message };
            }

            return { success: true, profile: data as UserProfile };
        } catch (error: any) {
            console.error('Profile update service error:', error);
            return { success: false, error: error.message || 'Failed to update profile' };
        }
    }

    /**
     * Marks a user's profile as completed with optional additional data
     */
    async completeUserProfile(
        userId: string, 
        additionalData?: Record<string, any>
    ): Promise<{ success: boolean; error?: string; message?: string }> {
        try {
            const { data, error } = await this.client
                .rpc('complete_user_profile', {
                    user_id: userId,
                    additional_data: additionalData || {}
                });

            if (error) {
                console.error('Profile completion error:', error);
                return { success: false, error: error.message };
            }

            return data as { success: boolean; error?: string; message?: string };
        } catch (error: any) {
            console.error('Profile completion service error:', error);
            return { success: false, error: error.message || 'Failed to complete profile' };
        }
    }

    // ===== PROFILE ANALYTICS ===== //

    /**
     * Gets profile analytics data using the new RPC function
     */
    async getProfileAnalytics(): Promise<{
        total_users: number;
        verified_users: number;
        completed_profiles: number;
        google_users: number;
        email_users: number;
        github_users?: number;
        facebook_users?: number;
        recent_signups: number;
        active_users_30d?: number;
        completion_rate?: number;
        error?: string;
    }> {
        try {
            const { data, error } = await this.client
                .rpc('get_profile_analytics');

            if (error) {
                console.error('Profile analytics error:', error);
                return {
                    total_users: 0,
                    verified_users: 0,
                    completed_profiles: 0,
                    google_users: 0,
                    email_users: 0,
                    recent_signups: 0,
                    error: error.message
                };
            }

            return {
                total_users: data.total_users || 0,
                verified_users: data.verified_users || 0,
                completed_profiles: data.completed_profiles || 0,
                google_users: data.google_users || 0,
                email_users: data.email_users || 0,
                github_users: data.github_users || 0,
                facebook_users: data.facebook_users || 0,
                recent_signups: data.recent_signups || 0,
                active_users_30d: data.active_users_30d || 0,
                completion_rate: data.completion_rate || 0
            };
        } catch (error: any) {
            console.error('Profile analytics service error:', error);
            return {
                total_users: 0,
                verified_users: 0,
                completed_profiles: 0,
                google_users: 0,
                email_users: 0,
                recent_signups: 0,
                error: error.message || 'Failed to retrieve analytics'
            };
        }
    }

    // ===== BULK OPERATIONS ===== //

    /**
     * Creates profiles for users who don't have them using the new RPC function
     */
    async createMissingProfiles(): Promise<{ 
        created: number; 
        errors: number; 
        details: string[]; 
        total_users?: number;
        message?: string;
    }> {
        try {
            const { data, error } = await this.client
                .rpc('create_missing_profiles');

            if (error) {
                console.error('Bulk profile creation error:', error);
                return { 
                    created: 0, 
                    errors: 1, 
                    details: [error.message],
                    message: 'Failed to create missing profiles'
                };
            }

            return {
                created: data.created_count || 0,
                errors: data.error_count || 0,
                details: data.errors || [],
                total_users: data.total_users || 0,
                message: data.message || 'Profile creation completed'
            };
        } catch (error: any) {
            console.error('Bulk profile creation service error:', error);
            return { 
                created: 0, 
                errors: 1, 
                details: [error.message || 'Failed to create missing profiles'],
                message: 'Service error occurred'
            };
        }
    }

    // ===== NEW ADVANCED METHODS ===== //

    /**
     * Search profiles with advanced filters using the new RPC function
     */
    async searchProfiles(options: {
        query?: string;
        role?: UserRole;
        provider?: AuthProvider;
        isVerified?: boolean;
        isCompleted?: boolean;
        limit?: number;
        offset?: number;
    } = {}): Promise<{
        profiles: UserProfile[];
        total_count: number;
        has_more: boolean;
        error?: string;
    }> {
        try {
            const { data, error } = await this.client.rpc('search_profiles', {
                search_query: options.query || '',
                role_filter: options.role || null,
                provider_filter: options.provider || null,
                verified_filter: options.isVerified ?? null,
                completed_filter: options.isCompleted ?? null,
                limit_count: options.limit || 50,
                offset_count: options.offset || 0
            });

            if (error) {
                console.error('Profile search error:', error);
                return {
                    profiles: [],
                    total_count: 0,
                    has_more: false,
                    error: error.message
                };
            }

            return {
                profiles: data.profiles || [],
                total_count: data.total_count || 0,
                has_more: data.has_more || false
            };
        } catch (error: any) {
            console.error('Profile search service error:', error);
            return {
                profiles: [],
                total_count: 0,
                has_more: false,
                error: error.message || 'Failed to search profiles'
            };
        }
    }

    /**
     * Update user role (admin only function)
     */
    async updateUserRole(
        targetUserId: string, 
        newRole: UserRole, 
        adminUserId?: string
    ): Promise<{ 
        success: boolean; 
        error?: string; 
        message?: string;
        oldRole?: UserRole;
        newRole?: UserRole;
    }> {
        try {
            const { data, error } = await this.client.rpc('update_user_role', {
                target_user_id: targetUserId,
                new_role: newRole,
                admin_user_id: adminUserId || undefined
            });

            if (error) {
                console.error('Role update error:', error);
                return { 
                    success: false, 
                    error: error.message 
                };
            }

            return {
                success: data.success || false,
                error: data.error,
                message: data.message,
                oldRole: data.old_role,
                newRole: data.new_role
            };
        } catch (error: any) {
            console.error('Role update service error:', error);
            return { 
                success: false, 
                error: error.message || 'Failed to update user role' 
            };
        }
    }

    /**
     * Get detailed profile with activity information
     */
    async getDetailedProfile(userId: string): Promise<{ 
        profile: UserProfile | null; 
        activitySummary?: {
            loginCount: number;
            lastLogin?: string;
            profileCompleted: boolean;
            completionDate?: string;
        };
        error?: string;
    }> {
        try {
            // Get basic profile
            const { profile, error: profileError } = await this.getUserProfile(userId);
            
            if (profileError || !profile) {
                return { profile: null, error: profileError };
            }

            // Get activity summary from profile data
            const activitySummary = {
                loginCount: profile.login_count || 0,
                lastLogin: profile.last_login_at,
                profileCompleted: profile.profile_completed || false,
                completionDate: profile.profile_completion_date
            };

            return { profile, activitySummary };
        } catch (error: any) {
            console.error('Detailed profile retrieval error:', error);
            return { 
                profile: null, 
                error: error.message || 'Failed to retrieve detailed profile' 
            };
        }
    }

    // ===== UTILITY METHODS ===== //

    /**
     * Validates profile data before updates
     */
    private validateProfileData(data: ProfileUpdateData): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email as any)) {
            errors.push('Invalid email format');
        }

        if (data.website && !/^https?:\/\/.+/.test(data.website)) {
            errors.push('Website must be a valid URL starting with http:// or https://');
        }

        if (data.phone && !/^\+?[\d\s\-()]+$/.test(data.phone)) {
            errors.push('Invalid phone number format');
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Safely updates profile with validation
     */
    async safeUpdateProfile(
        userId: string, 
        updates: ProfileUpdateData
    ): Promise<{ success: boolean; error?: string; profile?: UserProfile }> {
        // Validate data first
        const validation = this.validateProfileData(updates);
        if (!validation.valid) {
            return { success: false, error: validation.errors.join(', ') };
        }

        return this.updateUserProfile(userId, updates);
    }
}

export default new UserProfileService();