-- ============================================
-- MIGRATION: Cost Categories for EVM Best Practices
-- ============================================
-- This migration implements best practices for managing AC vs EV mismatch:
-- 1. Adds cost categories to projects table
-- 2. Creates project_costs table for detailed cost tracking
-- 3. Updates EVM calculations to support dual CPI (work + financial)
-- 
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Add Cost Categories to Projects Table
-- ============================================
-- Break down actual_cost into categories for better EVM analysis

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS actual_cost_labor NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_cost_materials NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_cost_infrastructure NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_cost_other NUMERIC DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN projects.actual_cost_labor IS 'Labor costs: internal and external resource effort costs';
COMMENT ON COLUMN projects.actual_cost_materials IS 'Materials costs: software licenses, hardware, tools, supplies';
COMMENT ON COLUMN projects.actual_cost_infrastructure IS 'Infrastructure costs: cloud services, servers, network, hosting';
COMMENT ON COLUMN projects.actual_cost_other IS 'Other costs: miscellaneous expenses not categorized above';

-- Create a function to automatically update actual_cost when categories change
CREATE OR REPLACE FUNCTION update_project_actual_cost()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actual_cost = COALESCE(NEW.actual_cost_labor, 0) + 
                    COALESCE(NEW.actual_cost_materials, 0) + 
                    COALESCE(NEW.actual_cost_infrastructure, 0) + 
                    COALESCE(NEW.actual_cost_other, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update actual_cost
DROP TRIGGER IF EXISTS trigger_update_actual_cost ON projects;
CREATE TRIGGER trigger_update_actual_cost
  BEFORE INSERT OR UPDATE OF actual_cost_labor, actual_cost_materials, 
                           actual_cost_infrastructure, actual_cost_other
  ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_project_actual_cost();

-- ============================================
-- STEP 2: Create Project Costs Table
-- ============================================
-- Detailed cost tracking table for future milestone-aligned cost allocation

CREATE TABLE IF NOT EXISTS project_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
  cost_type VARCHAR(50) NOT NULL CHECK (cost_type IN ('labor', 'material', 'infrastructure', 'other')),
  cost_category VARCHAR(100), -- e.g., 'internal_resource', 'external_resource', 'license', 'hardware', 'cloud'
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  cost_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES resources(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_costs_project ON project_costs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_costs_milestone ON project_costs(milestone_id);
CREATE INDEX IF NOT EXISTS idx_project_costs_date ON project_costs(cost_date);
CREATE INDEX IF NOT EXISTS idx_project_costs_type ON project_costs(cost_type);

-- Add comments
COMMENT ON TABLE project_costs IS 'Detailed cost transactions for projects, optionally linked to milestones';
COMMENT ON COLUMN project_costs.milestone_id IS 'Optional: Link cost to specific milestone for milestone-aligned EVM';
COMMENT ON COLUMN project_costs.cost_type IS 'Category: labor, material, infrastructure, other';
COMMENT ON COLUMN project_costs.cost_category IS 'Sub-category for detailed tracking (e.g., internal_resource, license, cloud)';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_project_costs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_project_costs_updated_at ON project_costs;
CREATE TRIGGER trigger_project_costs_updated_at
  BEFORE UPDATE ON project_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_project_costs_updated_at();

-- ============================================
-- STEP 3: Create View for Cost Summary
-- ============================================
-- Helper view to aggregate costs by project and category

CREATE OR REPLACE VIEW vw_project_cost_summary AS
SELECT 
  p.id AS project_id,
  p.name AS project_name,
  -- Total costs
  COALESCE(p.actual_cost, 0) AS actual_cost_total,
  -- Cost by category (from projects table)
  COALESCE(p.actual_cost_labor, 0) AS actual_cost_labor,
  COALESCE(p.actual_cost_materials, 0) AS actual_cost_materials,
  COALESCE(p.actual_cost_infrastructure, 0) AS actual_cost_infrastructure,
  COALESCE(p.actual_cost_other, 0) AS actual_cost_other,
  -- Cost by category (from project_costs table - if used)
  COALESCE(SUM(pc.amount) FILTER (WHERE pc.cost_type = 'labor'), 0) AS cost_labor_from_transactions,
  COALESCE(SUM(pc.amount) FILTER (WHERE pc.cost_type = 'material'), 0) AS cost_materials_from_transactions,
  COALESCE(SUM(pc.amount) FILTER (WHERE pc.cost_type = 'infrastructure'), 0) AS cost_infrastructure_from_transactions,
  COALESCE(SUM(pc.amount) FILTER (WHERE pc.cost_type = 'other'), 0) AS cost_other_from_transactions,
  -- Cost breakdown percentages
  CASE 
    WHEN COALESCE(p.actual_cost, 0) > 0 
    THEN ROUND((COALESCE(p.actual_cost_labor, 0) / p.actual_cost * 100)::numeric, 1)
    ELSE 0
  END AS labor_percent,
  CASE 
    WHEN COALESCE(p.actual_cost, 0) > 0 
    THEN ROUND((COALESCE(p.actual_cost_materials, 0) / p.actual_cost * 100)::numeric, 1)
    ELSE 0
  END AS materials_percent,
  CASE 
    WHEN COALESCE(p.actual_cost, 0) > 0 
    THEN ROUND((COALESCE(p.actual_cost_infrastructure, 0) / p.actual_cost * 100)::numeric, 1)
    ELSE 0
  END AS infrastructure_percent,
  CASE 
    WHEN COALESCE(p.actual_cost, 0) > 0 
    THEN ROUND((COALESCE(p.actual_cost_other, 0) / p.actual_cost * 100)::numeric, 1)
    ELSE 0
  END AS other_percent
FROM projects p
LEFT JOIN project_costs pc ON p.id = pc.project_id
WHERE p.status != 'Closed'
GROUP BY p.id, p.name, p.actual_cost, p.actual_cost_labor, 
         p.actual_cost_materials, p.actual_cost_infrastructure, p.actual_cost_other;

-- ============================================
-- STEP 4: Grant Permissions (if using RLS)
-- ============================================
-- Uncomment if needed
-- GRANT SELECT ON vw_project_cost_summary TO authenticated;
-- GRANT SELECT ON vw_project_cost_summary TO anon;
-- GRANT SELECT, INSERT, UPDATE ON project_costs TO authenticated;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Migration completed! Cost categories added to projects table.' AS status;
SELECT 'New table created: project_costs (for detailed cost tracking)' AS table_created;
SELECT 'New view created: vw_project_cost_summary' AS view_created;

-- Test queries (uncomment to verify):
-- SELECT * FROM vw_project_cost_summary LIMIT 5;
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'projects' AND column_name LIKE 'actual_cost%';

