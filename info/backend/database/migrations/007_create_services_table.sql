-- Migration: Create services table and upload initial data
-- Date: 2025-09-08
-- Description: Creates services table and uploads initial services data from static files

BEGIN;

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id TEXT UNIQUE NOT NULL, -- Unique identifier for the service (from static data)
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('development', 'consulting', 'optimization', 'design')),
    description TEXT NOT NULL,
    features TEXT[] NOT NULL DEFAULT '{}',
    pricing TEXT NOT NULL,
    icon TEXT NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    priority INTEGER NOT NULL DEFAULT 0,
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure unique priority values
    CONSTRAINT unique_priority UNIQUE (priority)
);

-- Create indexes for better performance
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_featured ON services(featured);
CREATE INDEX idx_services_priority ON services(priority);
CREATE INDEX idx_services_published ON services(published);
CREATE INDEX idx_services_service_id ON services(service_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert services data based on the JSON file structure
INSERT INTO services (service_id, title, category, description, features, pricing, icon, featured, priority, published) VALUES
('game-development', 'Full Game Development', 'development', 'End-to-end game development from concept to launch. We handle everything including gameplay mechanics, art direction, and technical implementation.', 
 ARRAY['Complete game architecture', 'Custom gameplay systems', 'Art & audio integration', 'Platform optimization', 'Launch support'], 
 'Starting at $25k', '🎮', TRUE, 1, TRUE),

('unity-development', 'Unity Development', 'development', 'Expert Unity development for 2D/3D games, mobile apps, and interactive experiences with performance optimization.',
 ARRAY['Unity 2022+ expertise', 'Cross-platform deployment', 'Performance optimization', 'Custom tools & systems', 'Multiplayer integration'],
 '$80-150/hour', '⚙️', FALSE, 2, TRUE),

('mobile-games', 'Mobile Game Development', 'development', 'Native and cross-platform mobile games optimized for iOS and Android with monetization strategies.',
 ARRAY['iOS & Android native', 'Cross-platform frameworks', 'Monetization integration', 'App store optimization', 'Analytics implementation'],
 '$15k - $50k', '📱', TRUE, 3, TRUE),

('game-consulting', 'Game Design Consulting', 'consulting', 'Strategic game design consultation to optimize gameplay, monetization, and user engagement.',
 ARRAY['Gameplay analysis', 'Monetization strategy', 'User experience audit', 'Market research', 'Competitive analysis'],
 '$120-200/hour', '💡', FALSE, 4, TRUE),

('performance-optimization', 'Performance Optimization', 'optimization', 'Comprehensive performance auditing and optimization for existing games and applications.',
 ARRAY['Performance profiling', 'Memory optimization', 'Rendering optimization', 'Asset optimization', 'Code refactoring'],
 '$100-180/hour', '⚡', FALSE, 5, TRUE),

('ui-ux-design', 'Game UI/UX Design', 'design', 'User interface and experience design specifically crafted for games and interactive applications.',
 ARRAY['UI/UX wireframes', 'Interactive prototypes', 'Design systems', 'Accessibility compliance', 'Usability testing'],
 '$3k - $15k', '🎨', TRUE, 6, TRUE),

('vr-ar-development', 'VR/AR Development', 'development', 'Immersive virtual and augmented reality experiences for gaming, training, and enterprise applications.',
 ARRAY['VR/AR platforms', 'Spatial interaction design', 'Performance optimization', 'Hardware integration', 'Cross-platform support'],
 '$20k - $80k', '🥽', FALSE, 7, TRUE),

('multiplayer-systems', 'Multiplayer Systems', 'development', 'Robust multiplayer networking solutions for real-time and turn-based multiplayer games.',
 ARRAY['Real-time networking', 'Authoritative servers', 'Anti-cheat systems', 'Matchmaking systems', 'Cross-platform play'],
 '$10k - $40k', '🌐', FALSE, 8, TRUE),

('game-porting', 'Game Porting', 'development', 'Professional game porting services to expand your reach across multiple platforms and devices.',
 ARRAY['Platform adaptation', 'Input system mapping', 'Performance optimization', 'Platform compliance', 'Store submission'],
 '$5k - $25k', '🔄', FALSE, 9, TRUE),

('technical-audit', 'Technical Audit', 'consulting', 'Comprehensive technical review of your game codebase, architecture, and development processes.',
 ARRAY['Code quality analysis', 'Architecture review', 'Security assessment', 'Performance analysis', 'Best practices guide'],
 '$2k - $8k', '🔍', FALSE, 10, TRUE);

-- Create service categories table for better data organization
CREATE TABLE IF NOT EXISTS service_categories (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert service categories
INSERT INTO service_categories (id, label, description, sort_order) VALUES
('all', 'All Services', 'All available services', 0),
('development', 'Development', 'Game development services', 1),
('consulting', 'Consulting', 'Strategic consultation and analysis', 2),
('optimization', 'Optimization', 'Performance and code optimization', 3),
('design', 'Design', 'UI/UX and visual design', 4);

-- Create service process steps table
CREATE TABLE IF NOT EXISTS service_process_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    duration TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure unique step numbers
    CONSTRAINT unique_step_number UNIQUE (step_number)
);

-- Insert process steps
INSERT INTO service_process_steps (step_number, title, description, duration, sort_order, active) VALUES
(1, 'Discovery & Planning', 'We analyze your requirements and create a comprehensive development roadmap', '1-2 weeks', 1, TRUE),
(2, 'Design & Prototyping', 'Create wireframes, mockups, and interactive prototypes for validation', '2-3 weeks', 2, TRUE),
(3, 'Development & Testing', 'Agile development process with continuous testing and quality assurance', '4-12 weeks', 3, TRUE),
(4, 'Launch & Support', 'Deployment assistance and ongoing support to ensure your success', 'Ongoing', 4, TRUE);

-- Create RLS policies for services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_process_steps ENABLE ROW LEVEL SECURITY;

-- Public can view published services
CREATE POLICY "public_view_published_services" ON services
    FOR SELECT USING (published = true);

-- Admins have full access to services
CREATE POLICY "admin_full_access_services" ON services
    FOR ALL TO authenticated USING (is_current_user_admin());

-- Public can view service categories
CREATE POLICY "public_view_service_categories" ON service_categories
    FOR SELECT USING (true);

-- Admins have full access to service categories
CREATE POLICY "admin_full_access_service_categories" ON service_categories
    FOR ALL TO authenticated USING (is_current_user_admin());

-- Public can view active process steps
CREATE POLICY "public_view_active_process_steps" ON service_process_steps
    FOR SELECT USING (active = true);

-- Admins have full access to process steps
CREATE POLICY "admin_full_access_process_steps" ON service_process_steps
    FOR ALL TO authenticated USING (is_current_user_admin());

-- Create RPC function to get services with categories
CREATE OR REPLACE FUNCTION get_services_data(
    category_filter TEXT DEFAULT 'all',
    featured_only BOOLEAN DEFAULT FALSE,
    limit_count INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    services_result JSON;
    categories_result JSON;
    process_result JSON;
    final_result JSON;
BEGIN
    -- Get filtered services
    SELECT json_agg(
        json_build_object(
            'id', service_id,
            'title', title,
            'category', category,
            'description', description,
            'features', features,
            'pricing', pricing,
            'icon', icon,
            'featured', featured,
            'priority', priority
        ) ORDER BY priority ASC
    )
    INTO services_result
    FROM services 
    WHERE published = true
        AND (NOT featured_only OR featured = true)
        AND (category_filter = 'all' OR category = category_filter)
    LIMIT COALESCE(limit_count, (SELECT COUNT(*) FROM services));

    -- Get categories with counts
    SELECT json_agg(
        json_build_object(
            'id', sc.id,
            'label', sc.label,
            'count', CASE 
                WHEN sc.id = 'all' THEN (SELECT COUNT(*) FROM services WHERE published = true)
                ELSE (SELECT COUNT(*) FROM services WHERE published = true AND category = sc.id)
            END
        ) ORDER BY sc.sort_order ASC
    )
    INTO categories_result
    FROM service_categories sc;

    -- Get process steps
    SELECT json_agg(
        json_build_object(
            'number', step_number,
            'title', title,
            'description', description,
            'duration', duration
        ) ORDER BY sort_order ASC
    )
    INTO process_result
    FROM service_process_steps
    WHERE active = true;

    -- Build final response
    SELECT json_build_object(
        'services', COALESCE(services_result, '[]'::json),
        'categories', COALESCE(categories_result, '[]'::json),
        'process', COALESCE(process_result, '[]'::json)
    )
    INTO final_result;

    RETURN final_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log migration
INSERT INTO migration_log (migration_name, notes) 
VALUES ('007_create_services_table', 'Created services table and uploaded initial services data from static files. Includes RLS policies and helper functions.');

COMMIT;