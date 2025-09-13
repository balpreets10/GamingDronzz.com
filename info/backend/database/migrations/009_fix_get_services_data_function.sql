-- Migration: Fix get_services_data RPC function column mismatches
-- Date: 2025-09-09
-- Description: Updates the get_services_data RPC function to use correct column names from services table

BEGIN;

-- Drop existing function to ensure clean update
DROP FUNCTION IF EXISTS get_services_data(TEXT, BOOLEAN, INTEGER);
DROP FUNCTION IF EXISTS get_services();

-- Create the corrected get_services_data RPC function
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
    -- Get filtered services with correct column names
    SELECT json_agg(
        json_build_object(
            'id', id,
            'title', title,
            'slug', slug,
            'category', category,
            'short_description', short_description,
            'detailed_description', detailed_description,
            'features', features,
            'technologies', technologies,
            'pricing_model', pricing_model,
            'base_price', base_price,
            'currency', currency,
            'duration_estimate', duration_estimate,
            'deliverables', deliverables,
            'requirements', requirements,
            'icon', icon,
            'featured', featured,
            'order_priority', order_priority,
            'seo_title', seo_title,
            'seo_description', seo_description,
            'created_at', created_at,
            'updated_at', updated_at
        ) ORDER BY order_priority ASC, created_at DESC
    )
    INTO services_result
    FROM services 
    WHERE published = true
        AND (NOT featured_only OR featured = true)
        AND (category_filter = 'all' OR category::text = category_filter)
    LIMIT COALESCE(limit_count, (SELECT COUNT(*) FROM services));

    -- Get categories with counts (fallback if service_categories doesn't exist)
    BEGIN
        SELECT json_agg(
            json_build_object(
                'id', sc.id,
                'label', sc.label,
                'count', CASE 
                    WHEN sc.id = 'all' THEN (SELECT COUNT(*) FROM services WHERE published = true)
                    ELSE (SELECT COUNT(*) FROM services WHERE published = true AND category::text = sc.id)
                END
            ) ORDER BY sc.sort_order ASC
        )
        INTO categories_result
        FROM service_categories sc;
    EXCEPTION
        WHEN undefined_table THEN
            -- Fallback: get categories from services table with 'all' option
            WITH service_cats AS (
                SELECT 
                    category::text as id,
                    INITCAP(category::text) as label,
                    COUNT(*) as count
                FROM services 
                WHERE published = true
                GROUP BY category
            ),
            all_category AS (
                SELECT 
                    'all'::text as id,
                    'All Services'::text as label,
                    (SELECT COUNT(*) FROM services WHERE published = true) as count
            )
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'label', label,
                    'count', count
                )
                ORDER BY CASE WHEN id = 'all' THEN 0 ELSE 1 END, label
            )
            INTO categories_result
            FROM (
                SELECT * FROM all_category
                UNION ALL
                SELECT * FROM service_cats
            ) combined_cats;
    END;

    -- Get process steps (fallback if service_process_steps doesn't exist)
    BEGIN
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
    EXCEPTION
        WHEN undefined_table THEN
            -- Fallback default process steps
            SELECT json_agg(
                json_build_object(
                    'number', step_num,
                    'title', step_title,
                    'description', step_desc,
                    'duration', step_duration
                )
            )
            INTO process_result
            FROM (VALUES 
                (1, 'Discovery & Planning', 'We analyze your requirements and create a comprehensive development roadmap', '1-2 weeks'),
                (2, 'Design & Prototyping', 'Create wireframes, mockups, and interactive prototypes for validation', '2-3 weeks'),
                (3, 'Development & Testing', 'Agile development process with continuous testing and quality assurance', '4-12 weeks'),
                (4, 'Launch & Support', 'Deployment assistance and ongoing support to ensure your success', 'Ongoing')
            ) AS default_steps(step_num, step_title, step_desc, step_duration);
    END;

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

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION get_services_data(TEXT, BOOLEAN, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_services_data(TEXT, BOOLEAN, INTEGER) TO authenticated;

-- Create a simpler get_services function as well (for compatibility)
CREATE OR REPLACE FUNCTION get_services()
RETURNS JSON AS $$
BEGIN
    RETURN get_services_data();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION get_services() TO anon;
GRANT EXECUTE ON FUNCTION get_services() TO authenticated;

COMMIT;