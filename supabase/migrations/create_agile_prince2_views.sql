-- Migration: Create Views for Agile/PRINCE2 Project Management
-- This migration creates recursive views and analytical views for work items, sprints, and PRINCE2 stages

-- ============================================================================
-- 1. WORK ITEM HIERARCHY VIEW (Recursive)
-- ============================================================================

CREATE OR REPLACE VIEW vw_work_item_hierarchy AS
WITH RECURSIVE work_item_tree AS (
  -- Base case: Epics (top level)
  SELECT 
    id,
    project_id,
    parent_id,
    type,
    title,
    status,
    priority,
    effort_estimate,
    assignee_id,
    sprint_id,
    1 AS level,
    ARRAY[id] AS path,
    title AS full_path
  FROM work_items
  WHERE parent_id IS NULL AND type = 'Epic'
  
  UNION ALL
  
  -- Recursive case: Children
  SELECT 
    wi.id,
    wi.project_id,
    wi.parent_id,
    wi.type,
    wi.title,
    wi.status,
    wi.priority,
    wi.effort_estimate,
    wi.assignee_id,
    wi.sprint_id,
    wit.level + 1 AS level,
    wit.path || wi.id AS path,
    wit.full_path || ' > ' || wi.title AS full_path
  FROM work_items wi
  INNER JOIN work_item_tree wit ON wi.parent_id = wit.id
)
SELECT 
  wit.*,
  p.name AS project_name,
  r.name AS assignee_name,
  s.name AS sprint_name,
  s.status AS sprint_status,
  ps.stage_name AS prince2_stage_name,
  ps.status AS prince2_stage_status
FROM work_item_tree wit
LEFT JOIN projects p ON wit.project_id = p.id
LEFT JOIN resources r ON wit.assignee_id = r.id
LEFT JOIN sprints s ON wit.sprint_id = s.id
LEFT JOIN prince2_stages ps ON s.prince2_stage_id = ps.id;

-- ============================================================================
-- 2. SPRINT BURNDOWN VIEW
-- ============================================================================

CREATE OR REPLACE VIEW vw_sprint_burndown AS
WITH sprint_days AS (
  SELECT 
    s.id AS sprint_id,
    s.project_id,
    s.name AS sprint_name,
    s.start_date,
    s.end_date,
    s.goal,
    generate_series(s.start_date, s.end_date, '1 day'::interval)::date AS day
  FROM sprints s
  WHERE s.status IN ('Active', 'Completed')
),
work_item_progress AS (
  SELECT 
    wi.sprint_id,
    DATE(wi.updated_at) AS progress_date,
    COUNT(*) FILTER (WHERE wi.status = 'Done') AS completed_count,
    SUM(wi.effort_estimate) FILTER (WHERE wi.status = 'Done') AS completed_effort,
    COUNT(*) AS total_count,
    SUM(wi.effort_estimate) AS total_effort
  FROM work_items wi
  WHERE wi.sprint_id IS NOT NULL
    AND wi.type IN ('UserStory', 'Task')
  GROUP BY wi.sprint_id, DATE(wi.updated_at)
)
SELECT 
  sd.sprint_id,
  sd.project_id,
  sd.sprint_name,
  sd.day,
  sd.start_date,
  sd.end_date,
  COALESCE(wip.total_effort, 0) AS total_effort,
  COALESCE(wip.completed_effort, 0) AS completed_effort,
  COALESCE(wip.total_effort, 0) - COALESCE(wip.completed_effort, 0) AS remaining_effort,
  COALESCE(wip.total_count, 0) AS total_items,
  COALESCE(wip.completed_count, 0) AS completed_items,
  COALESCE(wip.total_count, 0) - COALESCE(wip.completed_count, 0) AS remaining_items,
  -- Ideal burndown line (linear)
  CASE 
    WHEN sd.day <= sd.end_date AND sd.day >= sd.start_date THEN
      COALESCE(wip.total_effort, 0) * (1.0 - (sd.day - sd.start_date)::numeric / 
        NULLIF((sd.end_date - sd.start_date)::numeric, 0))
    ELSE 0
  END AS ideal_remaining_effort
FROM sprint_days sd
LEFT JOIN work_item_progress wip ON sd.sprint_id = wip.sprint_id 
  AND sd.day >= wip.progress_date
WHERE sd.day <= CURRENT_DATE + INTERVAL '30 days' -- Only show current and near-future sprints
ORDER BY sd.sprint_id, sd.day;

-- ============================================================================
-- 3. PROJECT VELOCITY VIEW
-- ============================================================================

CREATE OR REPLACE VIEW vw_project_velocity AS
SELECT 
  s.project_id,
  s.id AS sprint_id,
  s.name AS sprint_name,
  s.start_date,
  s.end_date,
  s.velocity AS planned_velocity,
  COUNT(wi.id) FILTER (WHERE wi.status = 'Done') AS completed_items,
  SUM(wi.effort_estimate) FILTER (WHERE wi.status = 'Done' AND wi.effort_unit = 'StoryPoints') AS actual_velocity,
  AVG(SUM(wi.effort_estimate) FILTER (WHERE wi.status = 'Done' AND wi.effort_unit = 'StoryPoints')) 
    OVER (PARTITION BY s.project_id ORDER BY s.start_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS rolling_avg_velocity
FROM sprints s
LEFT JOIN work_items wi ON s.id = wi.sprint_id
WHERE s.status = 'Completed'
GROUP BY s.project_id, s.id, s.name, s.start_date, s.end_date, s.velocity
ORDER BY s.project_id, s.start_date;

-- ============================================================================
-- 4. PRINCE2 STAGE PROGRESS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW vw_prince2_stage_progress AS
WITH stage_sprints AS (
  SELECT 
    ps.id AS stage_id,
    ps.project_id,
    ps.stage_name,
    ps.stage_number,
    ps.start_date AS stage_start_date,
    ps.end_date AS stage_end_date,
    ps.status AS stage_status,
    ps.tolerances,
    COUNT(s.id) AS total_sprints,
    COUNT(s.id) FILTER (WHERE s.status = 'Completed') AS completed_sprints,
    COUNT(s.id) FILTER (WHERE s.status = 'Active') AS active_sprints
  FROM prince2_stages ps
  LEFT JOIN sprints s ON ps.id = s.prince2_stage_id
  GROUP BY ps.id, ps.project_id, ps.stage_name, ps.stage_number, 
           ps.start_date, ps.end_date, ps.status, ps.tolerances
),
stage_work_items AS (
  SELECT 
    ps.id AS stage_id,
    COUNT(wi.id) AS total_work_items,
    COUNT(wi.id) FILTER (WHERE wi.status = 'Done') AS completed_work_items,
    SUM(wi.effort_estimate) FILTER (WHERE wi.effort_unit = 'StoryPoints') AS total_story_points,
    SUM(wi.effort_estimate) FILTER (WHERE wi.status = 'Done' AND wi.effort_unit = 'StoryPoints') AS completed_story_points
  FROM prince2_stages ps
  INNER JOIN sprints s ON ps.id = s.prince2_stage_id
  LEFT JOIN work_items wi ON s.id = wi.sprint_id
  GROUP BY ps.id
),
stage_financials AS (
  SELECT 
    ps.id AS stage_id,
    p.budget AS project_budget,
    p.actual_cost AS project_actual_cost,
    -- Calculate stage budget allocation (proportional to stage duration)
    CASE 
      WHEN p.end_date IS NOT NULL AND p.start_date IS NOT NULL 
        AND ps.end_date IS NOT NULL AND ps.start_date IS NOT NULL THEN
        (p.budget * (ps.end_date - ps.start_date)::numeric / 
         NULLIF((p.end_date - p.start_date)::numeric, 0))
      ELSE NULL
    END AS stage_budget
  FROM prince2_stages ps
  INNER JOIN projects p ON ps.project_id = p.id
)
SELECT 
  ss.stage_id,
  ss.project_id,
  p.name AS project_name,
  ss.stage_name,
  ss.stage_number,
  ss.stage_start_date,
  ss.stage_end_date,
  ss.stage_status,
  ss.total_sprints,
  ss.completed_sprints,
  ss.active_sprints,
  COALESCE(swi.total_work_items, 0) AS total_work_items,
  COALESCE(swi.completed_work_items, 0) AS completed_work_items,
  CASE 
    WHEN COALESCE(swi.total_work_items, 0) > 0 THEN
      ROUND((swi.completed_work_items::numeric / swi.total_work_items * 100)::numeric, 2)
    ELSE 0
  END AS progress_percent,
  COALESCE(swi.total_story_points, 0) AS total_story_points,
  COALESCE(swi.completed_story_points, 0) AS completed_story_points,
  sf.stage_budget,
  sf.project_actual_cost,
  ss.tolerances,
  -- Tolerance status calculation (simplified - would need actual tolerance values)
  jsonb_build_object(
    'time', CASE 
      WHEN ss.stage_end_date IS NOT NULL AND ss.stage_start_date IS NOT NULL THEN
        CASE 
          WHEN CURRENT_DATE > ss.stage_end_date THEN 'Breached'
          WHEN CURRENT_DATE > ss.stage_end_date - INTERVAL '7 days' THEN 'AtRisk'
          ELSE 'OnTrack'
        END
      ELSE 'Unknown'
    END,
    'cost', CASE 
      WHEN sf.stage_budget IS NOT NULL AND sf.project_actual_cost IS NOT NULL THEN
        CASE 
          WHEN sf.project_actual_cost > sf.stage_budget * 1.1 THEN 'Breached'
          WHEN sf.project_actual_cost > sf.stage_budget * 0.9 THEN 'AtRisk'
          ELSE 'OnTrack'
        END
      ELSE 'Unknown'
    END
  ) AS tolerance_status
FROM stage_sprints ss
LEFT JOIN projects p ON ss.project_id = p.id
LEFT JOIN stage_work_items swi ON ss.stage_id = swi.stage_id
LEFT JOIN stage_financials sf ON ss.stage_id = sf.stage_id;

-- ============================================================================
-- 5. STAGE GATE READINESS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW vw_stage_gate_readiness AS
WITH stage_metrics AS (
  SELECT 
    ps.id AS stage_id,
    ps.project_id,
    ps.stage_name,
    ps.stage_number,
    ps.status AS stage_status,
    COUNT(s.id) AS total_sprints,
    COUNT(s.id) FILTER (WHERE s.status = 'Completed') AS completed_sprints,
    COUNT(wi.id) AS total_work_items,
    COUNT(wi.id) FILTER (WHERE wi.status = 'Done') AS completed_work_items,
    COUNT(er.id) FILTER (WHERE er.status = 'Open') AS open_exceptions
  FROM prince2_stages ps
  LEFT JOIN sprints s ON ps.id = s.prince2_stage_id
  LEFT JOIN work_items wi ON s.id = wi.sprint_id
  LEFT JOIN exception_reports er ON ps.id = er.prince2_stage_id
  GROUP BY ps.id, ps.project_id, ps.stage_name, ps.stage_number, ps.status
),
latest_highlight_report AS (
  SELECT DISTINCT ON (prince2_stage_id)
    prince2_stage_id,
    report_date,
    stage_progress_percent,
    tolerance_status
  FROM highlight_reports
  ORDER BY prince2_stage_id, report_date DESC
)
SELECT 
  sm.stage_id,
  sm.project_id,
  p.name AS project_name,
  sm.stage_name,
  sm.stage_number,
  sm.stage_status,
  sm.total_sprints,
  sm.completed_sprints,
  sm.total_work_items,
  sm.completed_work_items,
  sm.open_exceptions,
  lhr.report_date AS last_highlight_report_date,
  lhr.stage_progress_percent,
  lhr.tolerance_status,
  -- Readiness checklist
  CASE 
    WHEN sm.completed_sprints = sm.total_sprints THEN true
    ELSE false
  END AS all_sprints_completed,
  CASE 
    WHEN sm.completed_work_items >= sm.total_work_items * 0.95 THEN true
    ELSE false
  END AS work_items_mostly_complete,
  CASE 
    WHEN sm.open_exceptions = 0 THEN true
    ELSE false
  END AS no_open_exceptions,
  CASE 
    WHEN lhr.report_date IS NOT NULL AND lhr.report_date >= CURRENT_DATE - INTERVAL '14 days' THEN true
    ELSE false
  END AS recent_highlight_report,
  -- Overall readiness
  CASE 
    WHEN sm.completed_sprints = sm.total_sprints 
      AND sm.completed_work_items >= sm.total_work_items * 0.95
      AND sm.open_exceptions = 0
      AND lhr.report_date IS NOT NULL 
      AND lhr.report_date >= CURRENT_DATE - INTERVAL '14 days' THEN 'Ready'
    WHEN sm.completed_sprints = sm.total_sprints 
      AND sm.open_exceptions = 0 THEN 'AlmostReady'
    ELSE 'NotReady'
  END AS gate_readiness_status
FROM stage_metrics sm
LEFT JOIN projects p ON sm.project_id = p.id
LEFT JOIN latest_highlight_report lhr ON sm.stage_id = lhr.prince2_stage_id;

-- ============================================================================
-- 6. WORK ITEM PROGRESS ROLLUP VIEW
-- ============================================================================

-- Drop the view first if it exists with different structure
DROP VIEW IF EXISTS vw_work_item_progress_rollup CASCADE;

CREATE VIEW vw_work_item_progress_rollup AS
WITH RECURSIVE work_item_tree AS (
  -- Base case: All work items with their own metrics
  SELECT 
    wi.id,
    wi.project_id,
    wi.parent_id,
    wi.type,
    wi.status,
    wi.title,
    wi.description,
    wi.acceptance_criteria,
    wi.priority,
    wi.effort_estimate,
    wi.effort_unit,
    wi.assignee_id,
    wi.sprint_id,
    wi.created_at,
    wi.updated_at,
    CASE WHEN wi.status = 'Done' THEN 1 ELSE 0 END AS completed_count,
    CASE WHEN wi.status = 'Done' THEN COALESCE(wi.effort_estimate, 0) ELSE 0 END AS completed_effort,
    1 AS total_count,
    COALESCE(wi.effort_estimate, 0) AS total_effort
  FROM work_items wi
  
  UNION ALL
  
  -- Recursive: Build parent-child relationships (no aggregation here)
  SELECT 
    wi.id,
    wi.project_id,
    wi.parent_id,
    wi.type,
    wi.status,
    wi.title,
    wi.description,
    wi.acceptance_criteria,
    wi.priority,
    wi.effort_estimate,
    wi.effort_unit,
    wi.assignee_id,
    wi.sprint_id,
    wi.created_at,
    wi.updated_at,
    wit.completed_count,
    wit.completed_effort,
    wit.total_count,
    wit.total_effort
  FROM work_items wi
  INNER JOIN work_item_tree wit ON wit.parent_id = wi.id
),
aggregated_metrics AS (
  -- Aggregate metrics for each work item from all its descendants
  SELECT 
    id,
    project_id,
    parent_id,
    type,
    status,
    title,
    description,
    acceptance_criteria,
    priority,
    effort_estimate,
    effort_unit,
    assignee_id,
    sprint_id,
    created_at,
    updated_at,
    SUM(completed_count) AS completed_count,
    SUM(completed_effort) AS completed_effort,
    SUM(total_count) AS total_count,
    SUM(total_effort) AS total_effort
  FROM work_item_tree
  GROUP BY id, project_id, parent_id, type, status, title, description, 
           acceptance_criteria, priority, effort_estimate, effort_unit, 
           assignee_id, sprint_id, created_at, updated_at
)
SELECT 
  am.*,
  CASE 
    WHEN am.total_count > 0 THEN
      ROUND((am.completed_count::numeric / am.total_count * 100)::numeric, 2)
    ELSE 0
  END AS completion_percent,
  CASE 
    WHEN am.total_effort > 0 THEN
      ROUND((am.completed_effort::numeric / am.total_effort * 100)::numeric, 2)
    ELSE 0
  END AS effort_completion_percent
FROM aggregated_metrics am;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON VIEW vw_work_item_hierarchy IS 'Recursive view showing full work item hierarchy with project, assignee, and sprint information';
COMMENT ON VIEW vw_sprint_burndown IS 'Daily burndown data for active and completed sprints';
COMMENT ON VIEW vw_project_velocity IS 'Velocity trends per project with rolling averages';
COMMENT ON VIEW vw_prince2_stage_progress IS 'PRINCE2 stage progress with tolerance status';
COMMENT ON VIEW vw_stage_gate_readiness IS 'Checklist and readiness status for stage gate approval';
COMMENT ON VIEW vw_work_item_progress_rollup IS 'Progress rollup from Tasks up to Epics';

