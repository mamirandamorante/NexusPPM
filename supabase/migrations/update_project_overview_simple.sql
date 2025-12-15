-- ============================================
-- MIGRATION: Update vw_project_overview for Simple Completion
-- ============================================
-- Updates the project overview view to use simple milestone-based
-- completion calculation instead of EVM-based calculations.
-- 
-- Run this AFTER remove_evm_metrics.sql
-- ============================================

-- Drop and recreate the view without EVM dependencies
DROP VIEW IF EXISTS vw_project_overview CASCADE;

CREATE OR REPLACE VIEW vw_project_overview AS
SELECT 
    p.id,
    p.name,
    p.state,
    p.priority,
    p.size,
    p.business_unit,
    p.program,
    p.portfolio,
    p.start_date,
    p.end_date,
    p.budget,
    p.actual_cost,
    p.progress, -- Keep manual progress field for backward compatibility
    p.created_at,
    p.updated_at,
    -- Manager name (joined from resources)
    m.name AS manager_name,
    -- Sponsor name (joined from resources)
    s.name AS sponsor_name,
    -- Calculated fields
    CASE 
        WHEN p.budget > 0 THEN ROUND((COALESCE(p.actual_cost, 0) / p.budget * 100)::numeric, 2)
        ELSE 0
    END AS percent_spent,
    COALESCE(p.budget, 0) - COALESCE(p.actual_cost, 0) AS budget_variance,
    -- Simple milestone-based completion
    CASE 
        WHEN (SELECT COUNT(*) FROM milestones WHERE milestones.project_id = p.id) > 0
        THEN ROUND(
            ((SELECT COUNT(*) FROM milestones WHERE milestones.project_id = p.id AND milestones.status = 'Completed')::numeric /
             (SELECT COUNT(*) FROM milestones WHERE milestones.project_id = p.id)::numeric) * 100,
            2
        )
        ELSE COALESCE(p.progress, 0)
    END AS completion_percent,
    -- Task counts (subquery)
    (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS total_tasks,
    (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'Completed') AS completed_tasks,
    -- Milestone counts
    (SELECT COUNT(*) FROM milestones m WHERE m.project_id = p.id) AS total_milestones,
    (SELECT COUNT(*) FROM milestones m WHERE m.project_id = p.id AND m.status = 'Completed') AS completed_milestones,
    (SELECT COUNT(*) FROM milestones m WHERE m.project_id = p.id AND m.status = 'In Progress') AS in_progress_milestones,
    (SELECT COUNT(*) FROM milestones m WHERE m.project_id = p.id AND m.status = 'Not Started') AS not_started_milestones,
    -- Risk count (subquery)
    (SELECT COUNT(*) FROM risks r WHERE r.project_id = p.id AND r.status != 'Closed') AS open_risks,
    -- Issue count (subquery)
    (SELECT COUNT(*) FROM issues i WHERE i.project_id = p.id AND i.status != 'Closed') AS open_issues
FROM 
    projects p
LEFT JOIN 
    resources m ON p.manager_id = m.id
LEFT JOIN 
    resources s ON p.sponsor_id = s.id;

-- ============================================
-- STEP 2: Grant Permissions (if using RLS)
-- ============================================
-- Uncomment if needed
-- GRANT SELECT ON vw_project_overview TO authenticated;
-- GRANT SELECT ON vw_project_overview TO anon;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'vw_project_overview updated with simple completion calculation!' AS status;
SELECT '- Uses simple milestone count (completed/total)' AS calculation_method;

-- Test query (uncomment to verify):
-- SELECT 
--   id, 
--   name, 
--   completion_percent, 
--   total_milestones, 
--   completed_milestones 
-- FROM vw_project_overview 
-- LIMIT 5;

