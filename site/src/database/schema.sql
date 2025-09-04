-- Gaming Dronzz Database Schema
-- This file should be executed in your Supabase SQL Editor

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET row_security = on;

-- Create custom types
CREATE TYPE project_category AS ENUM ('mobile', 'pc', 'console', 'vr', 'ar');
CREATE TYPE project_status AS ENUM ('completed', 'ongoing', 'planning');
CREATE TYPE service_category AS ENUM ('development', 'consulting', 'design', 'testing');
CREATE TYPE user_role AS ENUM ('admin', 'client', 'user');

-- ===== USERS EXTENSION =====
-- Extend the auth.users table with profiles
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    company TEXT,
    website TEXT,
    bio TEXT,
    phone TEXT,
    location TEXT,
    timezone TEXT,
    -- OAuth provider information
    provider TEXT, -- 'google', 'email', etc.
    provider_id TEXT,
    -- Profile completion tracking
    profile_completed BOOLEAN DEFAULT FALSE,
    profile_completion_date TIMESTAMPTZ,
    -- Metadata from OAuth providers
    oauth_metadata JSONB DEFAULT '{}',
    -- User preferences
    preferences JSONB DEFAULT '{}',
    -- Profile visibility
    public_profile BOOLEAN DEFAULT TRUE,
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    -- Profile status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    -- Tracking
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== PROJECTS TABLE =====
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,
    image_url TEXT,
    image_alt TEXT,
    technologies TEXT[] DEFAULT '{}',
    category project_category NOT NULL,
    status project_status NOT NULL,
    client_name TEXT,
    client_id UUID REFERENCES public.profiles(id),
    year INTEGER NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT TRUE,
    external_link TEXT,
    case_study_url TEXT,
    github_url TEXT,
    demo_url TEXT,
    screenshots TEXT[] DEFAULT '{}',
    team_size INTEGER,
    duration_months INTEGER,
    budget_range TEXT,
    challenges TEXT[],
    achievements TEXT[],
    testimonial TEXT,
    testimonial_author TEXT,
    seo_title TEXT,
    seo_description TEXT,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- ===== SERVICES TABLE =====
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT NOT NULL,
    detailed_description TEXT,
    icon TEXT,
    category service_category NOT NULL,
    features TEXT[] DEFAULT '{}',
    technologies TEXT[] DEFAULT '{}',
    pricing_model TEXT, -- 'fixed', 'hourly', 'project', 'custom'
    base_price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    duration_estimate TEXT,
    deliverables TEXT[],
    requirements TEXT[],
    published BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    order_priority INTEGER DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- ===== BLOG/ARTICLES TABLE =====
CREATE TABLE public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    image_alt TEXT,
    tags TEXT[] DEFAULT '{}',
    category TEXT,
    published BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    reading_time_minutes INTEGER,
    seo_title TEXT,
    seo_description TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    author_id UUID REFERENCES auth.users(id) NOT NULL
);

-- ===== INQUIRIES/CONTACT FORMS =====
CREATE TABLE public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    service_interest UUID REFERENCES public.services(id),
    project_budget TEXT,
    timeline TEXT,
    status TEXT DEFAULT 'new', -- 'new', 'contacted', 'in_progress', 'completed', 'closed'
    priority INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_to UUID REFERENCES auth.users(id)
);

-- ===== TESTIMONIALS =====
CREATE TABLE public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    position TEXT,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    avatar_url TEXT,
    project_id UUID REFERENCES public.projects(id),
    service_id UUID REFERENCES public.services(id),
    published BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== ANALYTICS/METRICS =====
CREATE TABLE public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    session_id TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== FILE UPLOADS/MEDIA =====
CREATE TABLE public.media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    description TEXT,
    uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== INDEXES FOR PERFORMANCE =====
CREATE INDEX idx_projects_category ON public.projects(category);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_featured ON public.projects(featured) WHERE featured = true;
CREATE INDEX idx_projects_published ON public.projects(published) WHERE published = true;
CREATE INDEX idx_projects_year ON public.projects(year DESC);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);

CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_featured ON public.services(featured) WHERE featured = true;
CREATE INDEX idx_services_published ON public.services(published) WHERE published = true;

CREATE INDEX idx_articles_published ON public.articles(published) WHERE published = true;
CREATE INDEX idx_articles_featured ON public.articles(featured) WHERE featured = true;
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);

CREATE INDEX idx_inquiries_status ON public.inquiries(status);
CREATE INDEX idx_inquiries_created_at ON public.inquiries(created_at DESC);

CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_page_path ON public.page_views(page_path);

-- ===== FUNCTIONS =====

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON public.projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON public.services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON public.articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at 
    BEFORE UPDATE ON public.inquiries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enhanced function to create user profile with OAuth metadata extraction
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_provider TEXT;
    profile_data JSONB;
BEGIN
    -- Determine provider from app_metadata or default to 'email'
    user_provider := COALESCE(NEW.app_metadata->>'provider', 'email');
    
    -- Extract profile data from raw_user_meta_data
    profile_data := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name,
        avatar_url,
        provider,
        provider_id,
        oauth_metadata,
        is_verified,
        profile_completed,
        profile_completion_date,
        last_login_at,
        login_count
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            profile_data->>'full_name',
            profile_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        profile_data->>'avatar_url',
        user_provider,
        profile_data->>'sub',
        profile_data,
        COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
        CASE 
            WHEN user_provider = 'google' THEN TRUE  -- Google profiles are considered complete
            ELSE FALSE                               -- Email signups need completion
        END,
        CASE 
            WHEN user_provider = 'google' THEN NOW()
            ELSE NULL
        END,
        NOW(),
        1
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check email exists (for the SupabaseService)
CREATE OR REPLACE FUNCTION public.check_email_exists(email_input text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users WHERE email = email_input
    );
END;
$$ LANGUAGE plpgsql security definer;

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(table_name text, record_id uuid)
RETURNS void AS $$
BEGIN
    IF table_name = 'projects' THEN
        UPDATE public.projects SET view_count = view_count + 1 WHERE id = record_id;
    ELSIF table_name = 'articles' THEN
        UPDATE public.articles SET view_count = view_count + 1 WHERE id = record_id;
    END IF;
END;
$$ LANGUAGE plpgsql security definer;

-- Function to create/update profile for existing users
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_id uuid)
RETURNS JSONB AS $$
DECLARE
    auth_user RECORD;
    existing_profile RECORD;
    profile_data JSONB;
    user_provider TEXT;
    result JSONB;
BEGIN
    -- Get the auth user data
    SELECT * INTO auth_user FROM auth.users WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found in auth.users'
        );
    END IF;

    -- Check if profile already exists
    SELECT * INTO existing_profile FROM public.profiles WHERE id = user_id;
    
    -- Extract metadata
    profile_data := COALESCE(auth_user.raw_user_meta_data, '{}'::jsonb);
    user_provider := COALESCE(auth_user.app_metadata->>'provider', 'email');
    
    IF existing_profile IS NULL THEN
        -- Create new profile
        INSERT INTO public.profiles (
            id, 
            email, 
            full_name,
            avatar_url,
            provider,
            provider_id,
            oauth_metadata,
            is_verified,
            profile_completed,
            profile_completion_date,
            last_login_at,
            login_count
        ) VALUES (
            user_id,
            auth_user.email,
            COALESCE(
                profile_data->>'full_name',
                profile_data->>'name',
                split_part(auth_user.email, '@', 1)
            ),
            profile_data->>'avatar_url',
            user_provider,
            profile_data->>'sub',
            profile_data,
            COALESCE(auth_user.email_confirmed_at IS NOT NULL, FALSE),
            CASE 
                WHEN user_provider = 'google' THEN TRUE
                ELSE FALSE
            END,
            CASE 
                WHEN user_provider = 'google' THEN NOW()
                ELSE NULL
            END,
            NOW(),
            1
        );
        
        result := jsonb_build_object(
            'success', true,
            'action', 'created',
            'profile_completed', user_provider = 'google'
        );
    ELSE
        -- Update existing profile with missing OAuth data if available
        UPDATE public.profiles SET
            oauth_metadata = CASE 
                WHEN oauth_metadata = '{}'::jsonb OR oauth_metadata IS NULL 
                THEN profile_data 
                ELSE oauth_metadata 
            END,
            avatar_url = CASE 
                WHEN avatar_url IS NULL AND profile_data->>'avatar_url' IS NOT NULL 
                THEN profile_data->>'avatar_url' 
                ELSE avatar_url 
            END,
            full_name = CASE 
                WHEN full_name IS NULL AND (
                    profile_data->>'full_name' IS NOT NULL OR 
                    profile_data->>'name' IS NOT NULL
                ) 
                THEN COALESCE(profile_data->>'full_name', profile_data->>'name')
                ELSE full_name 
            END,
            provider = CASE 
                WHEN provider IS NULL 
                THEN user_provider 
                ELSE provider 
            END,
            provider_id = CASE 
                WHEN provider_id IS NULL AND profile_data->>'sub' IS NOT NULL 
                THEN profile_data->>'sub' 
                ELSE provider_id 
            END,
            last_login_at = NOW(),
            login_count = login_count + 1,
            updated_at = NOW()
        WHERE id = user_id;
        
        result := jsonb_build_object(
            'success', true,
            'action', 'updated',
            'profile_completed', existing_profile.profile_completed
        );
    END IF;

    RETURN result;
END;
$$ LANGUAGE plpgsql security definer;

-- Function to check if user profile needs completion
CREATE OR REPLACE FUNCTION public.check_profile_completion(user_id uuid)
RETURNS JSONB AS $$
DECLARE
    profile RECORD;
    completion_status JSONB;
BEGIN
    SELECT * INTO profile FROM public.profiles WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'exists', false,
            'completed', false,
            'needs_creation', true
        );
    END IF;
    
    -- Calculate completion based on available data
    completion_status := jsonb_build_object(
        'exists', true,
        'completed', profile.profile_completed,
        'needs_creation', false,
        'has_full_name', profile.full_name IS NOT NULL,
        'has_avatar', profile.avatar_url IS NOT NULL,
        'is_verified', profile.is_verified,
        'provider', profile.provider,
        'last_login', profile.last_login_at,
        'login_count', profile.login_count
    );
    
    RETURN completion_status;
END;
$$ LANGUAGE plpgsql security definer;

-- Function to mark profile as completed
CREATE OR REPLACE FUNCTION public.complete_user_profile(
    user_id uuid,
    additional_data JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
BEGIN
    UPDATE public.profiles SET
        profile_completed = true,
        profile_completion_date = NOW(),
        full_name = COALESCE(additional_data->>'full_name', full_name),
        bio = COALESCE(additional_data->>'bio', bio),
        company = COALESCE(additional_data->>'company', company),
        website = COALESCE(additional_data->>'website', website),
        phone = COALESCE(additional_data->>'phone', phone),
        location = COALESCE(additional_data->>'location', location),
        preferences = CASE 
            WHEN additional_data ? 'preferences' 
            THEN additional_data->'preferences'
            ELSE preferences 
        END,
        updated_at = NOW()
    WHERE id = user_id;
    
    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Profile completed successfully'
        );
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Profile not found'
        );
    END IF;
END;
$$ LANGUAGE plpgsql security definer;

-- Function to handle user login and profile management
CREATE OR REPLACE FUNCTION public.handle_user_login(user_id uuid)
RETURNS JSONB AS $$
BEGIN
    -- Ensure profile exists and is updated
    RETURN public.ensure_user_profile(user_id);
END;
$$ LANGUAGE plpgsql security definer;