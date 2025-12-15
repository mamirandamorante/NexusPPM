-- ============================================
-- MIGRATION: Add Sponsor to Projects
-- ============================================
-- This migration adds a sponsor_id field to the projects table
-- and updates the vw_project_overview view to include sponsor_name.
--
-- Run this in your Supabase SQL Editor:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Create a new query
-- 3. Paste this entire file
-- 4. Click "Run"
-- ============================================

-- STEP 1: Add sponsor_id column to projects table
-- ============================================
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES resources(id);

-- Add a comment to document the column
COMMENT ON COLUMN projects.sponsor_id IS 'Reference to the project sponsor (executive responsible for the project)';

-- STEP 2: Create index for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_sponsor_id ON projects(sponsor_id);

-- STEP 3: Recreate the vw_project_overview view with sponsor_name
-- ============================================
-- First, drop the existing view
DROP VIEW IF EXISTS vw_project_overview;

-- Recreate the view with sponsor_name included
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
    p.progress,
    p.created_at,
    p.updated_at,
    -- Manager name (joined from resources)
    m.name AS manager_name,
    -- Sponsor name (joined from resources) - NEW!
    s.name AS sponsor_name,
    -- Calculated fields
    CASE 
        WHEN p.budget > 0 THEN ROUND((COALESCE(p.actual_cost, 0) / p.budget * 100)::numeric, 2)
        ELSE 0
    END AS percent_spent,
    COALESCE(p.budget, 0) - COALESCE(p.actual_cost, 0) AS budget_variance,
    -- Task counts (subquery)
    (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS total_tasks,
    (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'Completed') AS completed_tasks,
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

-- STEP 4: Grant access to the view (if using RLS)
-- ============================================
-- Uncomment these lines if you're using Row Level Security
-- GRANT SELECT ON vw_project_overview TO authenticated;
-- GRANT SELECT ON vw_project_overview TO anon;

-- ============================================
-- VERIFICATION: Run these queries to test
-- ============================================
-- Check the new column exists:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'projects' AND column_name = 'sponsor_id';

-- Check the view has sponsor_name:
-- SELECT id, name, manager_name, sponsor_name FROM vw_project_overview LIMIT 5;

-- ============================================
-- OPTIONAL: Update existing projects with a sponsor
-- ============================================
-- Example: Set a default sponsor for all projects (replace UUID with actual resource ID)
-- UPDATE projects SET sponsor_id = 'your-resource-uuid-here' WHERE sponsor_id IS NULL;

SELECT 'Migration completed successfully! The sponsor_id column has been added to projects and vw_project_overview now includes sponsor_name.' AS status;

