// services/supabaseClient.ts - Singleton Supabase Client
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';

interface Database {
    public: {
        Tables: {
            profiles: {
                Row: any;
                Insert: any;
                Update: any;
            };
            articles: {
                Row: any;
                Insert: any;
                Update: any;
            };
        };
        Functions: {
            is_admin_user: {
                Args: { user_id_input?: string };
                Returns: boolean;
            };
            update_user_login: {
                Args: { user_id_input?: string };
                Returns: {
                    success: boolean;
                    error?: string;
                };
            };
            get_user_role: {
                Args: { user_id_input?: string };
                Returns: {
                    is_admin: boolean;
                    role: string;
                };
            };
        };
    };
}

let supabaseClient: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> => {
    if (!supabaseClient) {
        try {
            supabaseClient = createClient<Database>(
                config.supabase.url,
                config.supabase.anonKey,
                {
                    auth: {
                        ...config.supabase.auth,
                        flowType: 'pkce',
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: true
                    }
                }
            );

            console.log('Shared Supabase client initialized');
            console.log('URL:', config.supabase.url);
            console.log('Redirect URL base:', window.location.origin);
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            throw new Error(`Supabase initialization failed: ${error}`);
        }
    }

    return supabaseClient;
};

// Export the client instance for backward compatibility
export const supabase = getSupabaseClient();