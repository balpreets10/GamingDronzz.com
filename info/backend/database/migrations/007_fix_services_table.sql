-- Migration: Insert services data using existing table schema
-- Date: 2025-09-08
-- Description: Insert services data matching existing services table structure

BEGIN;

-- Clear any existing data to avoid duplicates
TRUNCATE TABLE services CASCADE;

-- Insert services data using the existing table schema
-- Note: Using short_description instead of description, order_priority instead of priority
INSERT INTO services (
    title, 
    slug, 
    short_description, 
    detailed_description,
    icon, 
    category, 
    features, 
    pricing_model, 
    featured, 
    order_priority, 
    published
) VALUES
('Full Game Development', 'game-development', 'Complete game development services from concept to launch', 'End-to-end game development from concept to launch. We handle everything including gameplay mechanics, art direction, and technical implementation.', '🎮', 'development', 
 ARRAY['Complete game architecture', 'Custom gameplay systems', 'Art & audio integration', 'Platform optimization', 'Launch support'], 
 'Starting at $25k', TRUE, 1, TRUE),

('Unity Development', 'unity-development', 'Expert Unity development for games and apps', 'Expert Unity development for 2D/3D games, mobile apps, and interactive experiences with performance optimization.', '⚙️', 'development',
 ARRAY['Unity 2022+ expertise', 'Cross-platform deployment', 'Performance optimization', 'Custom tools & systems', 'Multiplayer integration'],
 '$80-150/hour', FALSE, 2, TRUE),

('Mobile Game Development', 'mobile-games', 'Native and cross-platform mobile games', 'Native and cross-platform mobile games optimized for iOS and Android with monetization strategies.', '📱', 'development',
 ARRAY['iOS & Android native', 'Cross-platform frameworks', 'Monetization integration', 'App store optimization', 'Analytics implementation'],
 '$15k - $50k', TRUE, 3, TRUE),

('Game Design Consulting', 'game-consulting', 'Strategic game design consultation', 'Strategic game design consultation to optimize gameplay, monetization, and user engagement.', '💡', 'consulting',
 ARRAY['Gameplay analysis', 'Monetization strategy', 'User experience audit', 'Market research', 'Competitive analysis'],
 '$120-200/hour', FALSE, 4, TRUE),

('Performance Optimization', 'performance-optimization', 'Performance auditing and optimization', 'Comprehensive performance auditing and optimization for existing games and applications.', '⚡', 'consulting',
 ARRAY['Performance profiling', 'Memory optimization', 'Rendering optimization', 'Asset optimization', 'Code refactoring'],
 '$100-180/hour', FALSE, 5, TRUE),

('Game UI/UX Design', 'ui-ux-design', 'User interface design for games', 'User interface and experience design specifically crafted for games and interactive applications.', '🎨', 'design',
 ARRAY['UI/UX wireframes', 'Interactive prototypes', 'Design systems', 'Accessibility compliance', 'Usability testing'],
 '$3k - $15k', TRUE, 6, TRUE),

('VR/AR Development', 'vr-ar-development', 'Virtual and augmented reality experiences', 'Immersive virtual and augmented reality experiences for gaming, training, and enterprise applications.', '🥽', 'development',
 ARRAY['VR/AR platforms', 'Spatial interaction design', 'Performance optimization', 'Hardware integration', 'Cross-platform support'],
 '$20k - $80k', FALSE, 7, TRUE),

('Multiplayer Systems', 'multiplayer-systems', 'Multiplayer networking solutions', 'Robust multiplayer networking solutions for real-time and turn-based multiplayer games.', '🌐', 'development',
 ARRAY['Real-time networking', 'Authoritative servers', 'Anti-cheat systems', 'Matchmaking systems', 'Cross-platform play'],
 '$10k - $40k', FALSE, 8, TRUE),

('Game Porting', 'game-porting', 'Cross-platform game porting services', 'Professional game porting services to expand your reach across multiple platforms and devices.', '🔄', 'development',
 ARRAY['Platform adaptation', 'Input system mapping', 'Performance optimization', 'Platform compliance', 'Store submission'],
 '$5k - $25k', FALSE, 9, TRUE),

('Technical Audit', 'technical-audit', 'Comprehensive technical code review', 'Comprehensive technical review of your game codebase, architecture, and development processes.', '🔍', 'consulting',
 ARRAY['Code quality analysis', 'Architecture review', 'Security assessment', 'Performance analysis', 'Best practices guide'],
 '$2k - $8k', FALSE, 10, TRUE);

-- Log this fix
INSERT INTO migration_log (migration_name, notes) 
VALUES ('007_fix_services_table', 'Fixed services table schema by adding missing description and other columns, then inserted services data');

COMMIT;