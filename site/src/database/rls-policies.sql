-- Row Level Security (RLS) Policies for Gaming Dronzz
-- Execute these in Supabase SQL Editor after running schema.sql

-- ===== PROFILES TABLE RLS =====
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all published profiles
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- ===== PROJECTS TABLE RLS =====
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Anyone can view published projects
CREATE POLICY "Published projects are viewable by everyone" 
    ON public.projects FOR SELECT 
    USING (published = true);

-- Authenticated users can view all projects
CREATE POLICY "Authenticated users can view all projects" 
    ON public.projects FOR SELECT 
    TO authenticated 
    USING (true);

-- Only admins can insert projects
CREATE POLICY "Admins can insert projects" 
    ON public.projects FOR INSERT 
    TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Only admins can update projects
CREATE POLICY "Admins can update projects" 
    ON public.projects FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Only admins can delete projects
CREATE POLICY "Admins can delete projects" 
    ON public.projects FOR DELETE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- ===== SERVICES TABLE RLS =====
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Anyone can view published services
CREATE POLICY "Published services are viewable by everyone" 
    ON public.services FOR SELECT 
    USING (published = true);

-- Authenticated users can view all services
CREATE POLICY "Authenticated users can view all services" 
    ON public.services FOR SELECT 
    TO authenticated 
    USING (true);

-- Only admins can insert services
CREATE POLICY "Admins can insert services" 
    ON public.services FOR INSERT 
    TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Only admins can update services
CREATE POLICY "Admins can update services" 
    ON public.services FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Only admins can delete services
CREATE POLICY "Admins can delete services" 
    ON public.services FOR DELETE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- ===== ARTICLES TABLE RLS =====
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Anyone can view published articles
CREATE POLICY "Published articles are viewable by everyone" 
    ON public.articles FOR SELECT 
    USING (published = true);

-- Authenticated users can view all articles
CREATE POLICY "Authenticated users can view all articles" 
    ON public.articles FOR SELECT 
    TO authenticated 
    USING (true);

-- Authors can insert their own articles
CREATE POLICY "Authors can insert their own articles" 
    ON public.articles FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = author_id);

-- Authors can update their own articles, admins can update any
CREATE POLICY "Authors can update their own articles" 
    ON public.articles FOR UPDATE 
    TO authenticated 
    USING (
        auth.uid() = author_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Authors can delete their own articles, admins can delete any
CREATE POLICY "Authors can delete their own articles" 
    ON public.articles FOR DELETE 
    TO authenticated 
    USING (
        auth.uid() = author_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- ===== INQUIRIES TABLE RLS =====
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can insert inquiries (contact form)
CREATE POLICY "Anyone can submit inquiries" 
    ON public.inquiries FOR INSERT 
    WITH CHECK (true);

-- Only admins can view inquiries
CREATE POLICY "Admins can view inquiries" 
    ON public.inquiries FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Only admins can update inquiries
CREATE POLICY "Admins can update inquiries" 
    ON public.inquiries FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- ===== TESTIMONIALS TABLE RLS =====
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can view published testimonials
CREATE POLICY "Published testimonials are viewable by everyone" 
    ON public.testimonials FOR SELECT 
    USING (published = true);

-- Authenticated users can view all testimonials
CREATE POLICY "Authenticated users can view all testimonials" 
    ON public.testimonials FOR SELECT 
    TO authenticated 
    USING (true);

-- Only admins can manage testimonials
CREATE POLICY "Admins can manage testimonials" 
    ON public.testimonials FOR ALL 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- ===== PAGE VIEWS TABLE RLS =====
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert page views
CREATE POLICY "Anyone can insert page views" 
    ON public.page_views FOR INSERT 
    WITH CHECK (true);

-- Only admins can view page views
CREATE POLICY "Admins can view page views" 
    ON public.page_views FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- ===== MEDIA FILES TABLE RLS =====
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Anyone can view media files (for public images)
CREATE POLICY "Media files are viewable by everyone" 
    ON public.media_files FOR SELECT 
    USING (true);

-- Authenticated users can upload files
CREATE POLICY "Authenticated users can upload files" 
    ON public.media_files FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = uploaded_by);

-- Users can update their own uploads, admins can update any
CREATE POLICY "Users can manage their uploads" 
    ON public.media_files FOR UPDATE 
    TO authenticated 
    USING (
        auth.uid() = uploaded_by OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Users can delete their own uploads, admins can delete any
CREATE POLICY "Users can delete their uploads" 
    ON public.media_files FOR DELETE 
    TO authenticated 
    USING (
        auth.uid() = uploaded_by OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );