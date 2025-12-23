-- Migration: Cleanup Test Data for Phase 3 Features
-- Use this to remove test data before re-running create_comprehensive_test_data.sql
-- WARNING: This will delete all test work items, sprints, retrospectives, and PRINCE2 stages

DO $$
DECLARE
  v_project_id UUID;
  v_project_name TEXT;
BEGIN
  -- Get the first active project ID and name
  SELECT id, name INTO v_project_id, v_project_name
  FROM projects
  WHERE status NOT IN ('Cancelled', 'Completed')
  LIMIT 1;

  IF v_project_id IS NULL THEN
    RAISE NOTICE 'No active projects found.';
    RETURN;
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Cleaning up test data...';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Project Name: %', v_project_name;
  RAISE NOTICE 'Project ID: %', v_project_id;
  RAISE NOTICE '';

  -- Delete sprint retrospectives for test sprints
  DELETE FROM sprint_retrospectives
  WHERE sprint_id IN (
    SELECT id FROM sprints 
    WHERE project_id = v_project_id 
    AND name IN ('Sprint 1 - Foundation', 'Sprint 2 - Core Features', 'Sprint 3 - Advanced Features')
  );

  -- Delete work items (cascade will handle children)
  DELETE FROM work_items
  WHERE project_id = v_project_id
  AND (
    title IN ('Customer Self-Service Portal', 'Order Management System')
    OR parent_id IN (
      SELECT id FROM work_items 
      WHERE project_id = v_project_id 
      AND title IN ('Customer Self-Service Portal', 'Order Management System')
    )
  );

  -- Delete test sprints
  DELETE FROM sprints
  WHERE project_id = v_project_id
  AND name IN ('Sprint 1 - Foundation', 'Sprint 2 - Core Features', 'Sprint 3 - Advanced Features');

  -- Delete PRINCE2 stages (only if they were created by test data)
  -- Note: Be careful - this deletes stages 1 and 2. Only run if you're sure these are test stages.
  -- DELETE FROM prince2_stages
  -- WHERE project_id = v_project_id
  -- AND stage_number IN (1, 2);

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Test data cleanup completed!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Project: % (ID: %)', v_project_name, v_project_id;
  RAISE NOTICE '';
  RAISE NOTICE 'You can now re-run create_comprehensive_test_data.sql';
  RAISE NOTICE '========================================';

END $$;

