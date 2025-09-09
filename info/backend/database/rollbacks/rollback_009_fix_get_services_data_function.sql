-- ROLLBACK for 009_fix_get_services_data_function
-- Date: 2025-09-09
-- Reverts: 009_fix_get_services_data_function.sql

BEGIN;

-- Drop the corrected functions
DROP FUNCTION IF EXISTS get_services_data(TEXT, BOOLEAN, INTEGER);
DROP FUNCTION IF EXISTS get_services();

-- Restore the original function with incorrect column names (from 008_create_get_services_rpc.sql)
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
    -- Get filtered services (original with incorrect column names)
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

    -- Get categories with counts (fallback if service_categories doesn't exist)
    BEGIN
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
    EXCEPTION
        WHEN undefined_table THEN
            -- Fallback if service_categories table doesn't exist
            SELECT json_agg(
                json_build_object(
                    'id', category,
                    'label', INITCAP(category),
                    'count', count(*)
                )
            )
            INTO categories_result
            FROM services 
            WHERE published = true
            GROUP BY category;
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

-- Rollback completed

COMMIT;