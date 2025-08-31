-- Migration 001: Initial Setup
-- Run date: 2024-08-28
-- Description: Creates initial database schema for Gaming Dronzz website

-- This migration includes:
-- 1. Custom types and enums
-- 2. Core tables (profiles, projects, services, articles, etc.)
-- 3. Indexes for performance
-- 4. Triggers and functions
-- 5. Row Level Security policies

-- Execute the main schema file
\i 'schema.sql'

-- Execute RLS policies
\i 'rls-policies.sql'

-- Insert sample data for development
INSERT INTO public.profiles (id, email, full_name, role) VALUES 
('00000000-0000-0000-0000-000000000001', 'admin@gamingdronzz.com', 'Gaming Dronzz Admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Sample services data
INSERT INTO public.services (
    title, slug, short_description, detailed_description, category, features, technologies, 
    pricing_model, base_price, currency, published, featured, order_priority, created_by
) VALUES 
(
    'Mobile Game Development',
    'mobile-game-development',
    'End-to-end mobile game development for iOS and Android platforms',
    'We create engaging mobile games using cutting-edge technologies and proven game design principles. Our team handles everything from concept to app store deployment.',
    'development',
    ARRAY['Cross-platform development', 'Native optimization', 'App store optimization', 'Analytics integration'],
    ARRAY['Unity', 'React Native', 'Swift', 'Kotlin', 'Firebase'],
    'project',
    15000.00,
    'USD',
    true,
    true,
    1,
    '00000000-0000-0000-0000-000000000001'
),
(
    'PC Game Development',
    'pc-game-development',
    'High-performance PC games with advanced graphics and gameplay',
    'Develop immersive PC games using industry-standard engines and technologies. We specialize in both indie and AAA-quality games.',
    'development',
    ARRAY['Advanced graphics', 'Multiplayer support', 'Mod support', 'Steam integration'],
    ARRAY['Unity', 'Unreal Engine', 'C++', 'C#', 'DirectX'],
    'project',
    25000.00,
    'USD',
    true,
    true,
    2,
    '00000000-0000-0000-0000-000000000001'
),
(
    'Game Design Consulting',
    'game-design-consulting',
    'Expert consultation on game mechanics, monetization, and user experience',
    'Get expert advice on game design, monetization strategies, and user engagement. Perfect for studios looking to optimize their existing games.',
    'consulting',
    ARRAY['Game mechanics analysis', 'Monetization strategy', 'User experience audit', 'Market research'],
    ARRAY['Analytics tools', 'User research methods', 'Design documentation'],
    'hourly',
    150.00,
    'USD',
    true,
    false,
    3,
    '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (slug) DO NOTHING;

-- Sample projects data
INSERT INTO public.projects (
    title, slug, description, detailed_description, category, status, year, featured, 
    published, technologies, achievements, created_by
) VALUES 
(
    'Cyber Quest RPG',
    'cyber-quest-rpg',
    'Futuristic RPG with immersive combat system and branching storylines',
    'A comprehensive role-playing game set in a cyberpunk world. Features include real-time combat, character customization, and multiple story paths that adapt to player choices.',
    'pc',
    'completed',
    2024,
    true,
    true,
    ARRAY['Unity', 'C#', 'Photon Networking', 'Firebase'],
    ARRAY['50,000+ downloads in first month', 'Featured on Steam', '4.8/5 user rating'],
    '00000000-0000-0000-0000-000000000001'
),
(
    'Mobile Runner Championship',
    'mobile-runner-championship',
    'High-speed endless runner with dynamic obstacle generation',
    'An endless runner game featuring procedurally generated levels, power-ups, and competitive multiplayer modes. Optimized for mobile devices with smooth 60fps gameplay.',
    'mobile',
    'completed',
    2024,
    true,
    true,
    ARRAY['React Native', 'TypeScript', 'Matter.js', 'Firebase'],
    ARRAY['100,000+ downloads', 'Top 10 in app store category', 'Featured by Apple'],
    '00000000-0000-0000-0000-000000000001'
),
(
    'VR Training Simulator',
    'vr-training-simulator',
    'Immersive VR experience for professional training and education',
    'A virtual reality application designed for corporate training programs. Features realistic simulations, progress tracking, and multi-user environments.',
    'vr',
    'ongoing',
    2024,
    false,
    true,
    ARRAY['Unreal Engine', 'C++', 'Oculus SDK', 'SteamVR'],
    ARRAY['Partnership with major corporation', 'Reduced training time by 40%'],
    '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (slug) DO NOTHING;

-- Sample testimonials
INSERT INTO public.testimonials (
    name, company, position, content, rating, published, featured
) VALUES 
(
    'Sarah Johnson',
    'TechStart Inc.',
    'CTO',
    'Gaming Dronzz delivered an exceptional mobile game that exceeded our expectations. The team was professional, creative, and delivered on time.',
    5,
    true,
    true
),
(
    'Mike Chen',
    'Indie Game Studios',
    'Founder',
    'Their consulting services helped us optimize our game monetization strategy, resulting in a 300% increase in revenue.',
    5,
    true,
    true
),
(
    'Alex Rodriguez',
    'EduCorp',
    'Training Director',
    'The VR training simulator they developed has revolutionized our employee training programs. Highly recommended!',
    5,
    true,
    false
)
ON CONFLICT DO NOTHING;

-- Create initial admin user role mapping (if using separate user_roles table)
-- This is handled by the profiles table with role column, so this is optional
-- INSERT INTO public.user_roles (user_id, role) VALUES 
-- ('00000000-0000-0000-0000-000000000001', 'admin')
-- ON CONFLICT DO NOTHING;