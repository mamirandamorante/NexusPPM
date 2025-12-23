-- Migration: Create Comprehensive Test Data for Phase 3 Features
-- This creates complete test data including work items, sprints, retrospectives, and PRINCE2 stages
-- NOTE: This migration is idempotent - it checks for existing data and skips if already present

DO $$
DECLARE
  v_project_id UUID;
  v_epic_1_id UUID;
  v_epic_2_id UUID;
  v_feature_1_id UUID;
  v_feature_2_id UUID;
  v_feature_3_id UUID;
  v_story_1_id UUID;
  v_story_2_id UUID;
  v_story_3_id UUID;
  v_story_4_id UUID;
  v_task_1_id UUID;
  v_task_2_id UUID;
  v_task_3_id UUID;
  v_sprint_1_id UUID;
  v_sprint_2_id UUID;
  v_sprint_3_id UUID;
  v_stage_1_id UUID;
  v_resource_1_id UUID;
  v_resource_2_id UUID;
  v_project_name TEXT;
BEGIN
  -- Get the first active project ID and name
  SELECT id, name INTO v_project_id, v_project_name
  FROM projects
  WHERE status NOT IN ('Cancelled', 'Completed')
  LIMIT 1;

  IF v_project_id IS NULL THEN
    RAISE NOTICE 'No active projects found. Please create a project first.';
    RETURN;
  END IF;

  -- Check if test data already exists (look for test Epics)
  IF EXISTS (
    SELECT 1 FROM work_items 
    WHERE project_id = v_project_id 
    AND type = 'Epic' 
    AND title IN ('Customer Self-Service Portal', 'Order Management System')
  ) THEN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Test data already exists!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ PROJECT TO USE FOR TESTING:';
    RAISE NOTICE '   Project Name: %', v_project_name;
    RAISE NOTICE '   Project ID: %', v_project_id;
    RAISE NOTICE '';
    RAISE NOTICE '📋 INSTRUCTIONS:';
    RAISE NOTICE '   1. Go to Projects in your application';
    RAISE NOTICE '   2. Select project: "%"', v_project_name;
    RAISE NOTICE '   3. Follow the testing guide: TESTING_GUIDE_PHASE3.md';
    RAISE NOTICE '';
    RAISE NOTICE 'To recreate test data, first run cleanup_test_data.sql';
    RAISE NOTICE 'then re-run this migration.';
    RAISE NOTICE '========================================';
    RETURN;
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Creating test data...';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Project Name: %', v_project_name;
  RAISE NOTICE 'Project ID: %', v_project_id;
  RAISE NOTICE '';

  -- Get some active resources for assignments
  SELECT id INTO v_resource_1_id
  FROM resources
  WHERE status = 'Active'
  LIMIT 1;

  SELECT id INTO v_resource_2_id
  FROM resources
  WHERE status = 'Active' AND id != COALESCE(v_resource_1_id, '00000000-0000-0000-0000-000000000000'::UUID)
  LIMIT 1;

  -- ============================================================================
  -- PRINCE2 STAGES
  -- ============================================================================
  -- Insert Initiation stage (only if stage_number 1 doesn't exist)
  INSERT INTO prince2_stages (project_id, stage_name, stage_number, start_date, end_date, status, tolerances)
  SELECT 
    v_project_id,
    'Initiation',
    1,
    CURRENT_DATE - INTERVAL '60 days',
    CURRENT_DATE - INTERVAL '30 days',
    'Complete',
    '{"time": {"value": 5, "unit": "days", "threshold": 2}, "cost": {"value": 10000, "unit": "currency", "threshold": 5000}}'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM prince2_stages 
    WHERE project_id = v_project_id AND stage_number = 1
  )
  RETURNING id INTO v_stage_1_id;

  -- Get stage_1_id if it already exists
  IF v_stage_1_id IS NULL THEN
    SELECT id INTO v_stage_1_id
    FROM prince2_stages
    WHERE project_id = v_project_id AND stage_number = 1;
  END IF;

  -- Insert Delivery stage (only if stage_number 2 doesn't exist)
  INSERT INTO prince2_stages (project_id, stage_name, stage_number, start_date, end_date, status, tolerances)
  SELECT 
    v_project_id,
    'Delivery',
    2,
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '30 days',
    'InProgress',
    '{"time": {"value": 10, "unit": "days", "threshold": 5}, "cost": {"value": 50000, "unit": "currency", "threshold": 25000}}'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM prince2_stages 
    WHERE project_id = v_project_id AND stage_number = 2
  );

  -- ============================================================================
  -- SPRINTS
  -- ============================================================================
  -- Sprint 1: Completed Sprint (only if doesn't exist)
  INSERT INTO sprints (project_id, prince2_stage_id, name, goal, start_date, end_date, velocity, status)
  SELECT 
    v_project_id,
    v_stage_1_id,
    'Sprint 1 - Foundation',
    'Establish project foundation and core infrastructure',
    CURRENT_DATE - INTERVAL '28 days',
    CURRENT_DATE - INTERVAL '14 days',
    40,
    'Completed'
  WHERE NOT EXISTS (
    SELECT 1 FROM sprints 
    WHERE project_id = v_project_id AND name = 'Sprint 1 - Foundation'
  )
  RETURNING id INTO v_sprint_1_id;

  -- Get sprint_1_id if it already exists
  IF v_sprint_1_id IS NULL THEN
    SELECT id INTO v_sprint_1_id
    FROM sprints
    WHERE project_id = v_project_id AND name = 'Sprint 1 - Foundation';
  END IF;

  -- Sprint 2: Active Sprint (only if doesn't exist)
  INSERT INTO sprints (project_id, name, goal, start_date, end_date, velocity, status)
  SELECT 
    v_project_id,
    'Sprint 2 - Core Features',
    'Build core user-facing features and authentication',
    CURRENT_DATE - INTERVAL '14 days',
    CURRENT_DATE,
    50,
    'Active'
  WHERE NOT EXISTS (
    SELECT 1 FROM sprints 
    WHERE project_id = v_project_id AND name = 'Sprint 2 - Core Features'
  )
  RETURNING id INTO v_sprint_2_id;

  -- Get sprint_2_id if it already exists
  IF v_sprint_2_id IS NULL THEN
    SELECT id INTO v_sprint_2_id
    FROM sprints
    WHERE project_id = v_project_id AND name = 'Sprint 2 - Core Features';
  END IF;

  -- Sprint 3: Planning Sprint (only if doesn't exist)
  INSERT INTO sprints (project_id, name, goal, start_date, end_date, velocity, status)
  SELECT 
    v_project_id,
    'Sprint 3 - Advanced Features',
    'Implement advanced features and integrations',
    CURRENT_DATE + INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '15 days',
    60,
    'Planning'
  WHERE NOT EXISTS (
    SELECT 1 FROM sprints 
    WHERE project_id = v_project_id AND name = 'Sprint 3 - Advanced Features'
  )
  RETURNING id INTO v_sprint_3_id;

  -- Get sprint_3_id if it already exists
  IF v_sprint_3_id IS NULL THEN
    SELECT id INTO v_sprint_3_id
    FROM sprints
    WHERE project_id = v_project_id AND name = 'Sprint 3 - Advanced Features';
  END IF;

  -- ============================================================================
  -- EPIC 1: Customer Self-Service Portal
  -- ============================================================================
  -- Insert Epic 1 (only if doesn't exist)
  INSERT INTO work_items (project_id, type, title, description, status, priority, effort_estimate, effort_unit)
  SELECT 
    v_project_id,
    'Epic',
    'Customer Self-Service Portal',
    'Build a comprehensive self-service portal for customers to manage their accounts, view orders, and access support resources.',
    'InProgress',
    'High',
    100,
    'StoryPoints'
  WHERE NOT EXISTS (
    SELECT 1 FROM work_items 
    WHERE project_id = v_project_id 
    AND type = 'Epic' 
    AND title = 'Customer Self-Service Portal'
  )
  RETURNING id INTO v_epic_1_id;

  -- Get epic_1_id if it already exists
  IF v_epic_1_id IS NULL THEN
    SELECT id INTO v_epic_1_id
    FROM work_items
    WHERE project_id = v_project_id 
    AND type = 'Epic' 
    AND title = 'Customer Self-Service Portal';
  END IF;

  -- Feature 1.1: User Registration & Authentication
  INSERT INTO work_items (project_id, parent_id, type, title, description, acceptance_criteria, status, priority, effort_estimate, effort_unit, sprint_id)
  VALUES (
    v_project_id,
    v_epic_1_id,
    'Feature',
    'User Registration & Authentication',
    'Implement secure user registration and authentication system with email verification and password reset.',
    '1. Users can register with email and password
2. Email verification is sent upon registration
3. Password reset functionality works
4. Multi-factor authentication is optional
5. Session management is secure',
    'Done',
    'High',
    25,
    'StoryPoints',
    v_sprint_1_id
  )
  RETURNING id INTO v_feature_1_id;

  -- User Story 1.1.1: Registration Form
  INSERT INTO work_items (project_id, parent_id, type, title, description, acceptance_criteria, status, priority, effort_estimate, effort_unit, assignee_id, sprint_id)
  VALUES (
    v_project_id,
    v_feature_1_id,
    'UserStory',
    'As a new user, I want to register with my email and password',
    'Create a registration form that collects user information and validates input.',
    '1. Form validates email format
2. Password meets security requirements (min 8 chars, special chars)
3. Terms and conditions checkbox is required
4. Success message is shown after registration
5. Verification email is sent',
    'Done',
    'High',
    8,
    'StoryPoints',
    v_resource_1_id,
    v_sprint_1_id
  )
  RETURNING id INTO v_story_1_id;

  -- Task 1.1.1.1: Design Registration Form
  INSERT INTO work_items (project_id, parent_id, type, title, description, status, priority, effort_estimate, effort_unit, assignee_id, sprint_id)
  VALUES (
    v_project_id,
    v_story_1_id,
    'Task',
    'Design registration form UI',
    'Create the UI mockup and design for the registration form.',
    'Done',
    'Medium',
    4,
    'Hours',
    v_resource_1_id,
    v_sprint_1_id
  )
  RETURNING id INTO v_task_1_id;

  -- Task 1.1.1.2: Implement Form Validation
  INSERT INTO work_items (project_id, parent_id, type, title, description, status, priority, effort_estimate, effort_unit, assignee_id, sprint_id)
  VALUES (
    v_project_id,
    v_story_1_id,
    'Task',
    'Implement form validation logic',
    'Add client-side and server-side validation for registration form.',
    'Done',
    'High',
    6,
    'Hours',
    v_resource_1_id,
    v_sprint_1_id
  )
  RETURNING id INTO v_task_2_id;

  -- User Story 1.1.2: Email Verification
  INSERT INTO work_items (project_id, parent_id, type, title, description, acceptance_criteria, status, priority, effort_estimate, effort_unit, assignee_id, sprint_id)
  VALUES (
    v_project_id,
    v_feature_1_id,
    'UserStory',
    'As a new user, I want to verify my email address',
    'Implement email verification flow after registration.',
    '1. Verification email is sent immediately after registration
2. Email contains secure verification link
3. Link expires after 24 hours
4. User can resend verification email
5. Verified status is updated in database',
    'InProgress',
    'High',
    5,
    'StoryPoints',
    v_resource_2_id,
    v_sprint_1_id
  )
  RETURNING id INTO v_story_2_id;

  -- Feature 1.2: User Dashboard
  INSERT INTO work_items (project_id, parent_id, type, title, description, acceptance_criteria, status, priority, effort_estimate, effort_unit, sprint_id)
  VALUES (
    v_project_id,
    v_epic_1_id,
    'Feature',
    'User Dashboard',
    'Create a personalized dashboard for logged-in users showing their account summary and quick actions.',
    '1. Dashboard displays user profile summary
2. Recent activity is shown
3. Quick action buttons are available
4. Dashboard is responsive on mobile devices
5. Data loads within 2 seconds',
    'InProgress',
    'Medium',
    20,
    'StoryPoints',
    v_sprint_2_id
  )
  RETURNING id INTO v_feature_2_id;

  -- User Story 1.2.1: Dashboard Overview
  INSERT INTO work_items (project_id, parent_id, type, title, description, acceptance_criteria, status, priority, effort_estimate, effort_unit, assignee_id, sprint_id)
  VALUES (
    v_project_id,
    v_feature_2_id,
    'UserStory',
    'As a user, I want to see my account overview on the dashboard',
    'Display key account information and statistics on the dashboard.',
    '1. Account balance is displayed
2. Recent transactions are shown
3. Account status is visible
4. Quick stats are presented
5. Information is up-to-date',
    'InProgress',
    'Medium',
    8,
    'StoryPoints',
    v_resource_1_id,
    v_sprint_2_id
  )
  RETURNING id INTO v_story_3_id;

  -- Task 1.2.1.1: Create Dashboard API
  INSERT INTO work_items (project_id, parent_id, type, title, description, status, priority, effort_estimate, effort_unit, assignee_id, sprint_id)
  VALUES (
    v_project_id,
    v_story_3_id,
    'Task',
    'Create dashboard data API endpoint',
    'Build API endpoint that aggregates user data for dashboard display.',
    'InProgress',
    'High',
    8,
    'Hours',
    v_resource_1_id,
    v_sprint_2_id
  )
  RETURNING id INTO v_task_3_id;

  -- ============================================================================
  -- EPIC 2: Order Management System
  -- ============================================================================
  INSERT INTO work_items (project_id, type, title, description, status, priority, effort_estimate, effort_unit)
  VALUES (
    v_project_id,
    'Epic',
    'Order Management System',
    'Develop a complete order management system allowing customers to place, track, and manage orders.',
    'InProgress',
    'High',
    80,
    'StoryPoints'
  )
  RETURNING id INTO v_epic_2_id;

  -- Feature 2.1: Order Placement
  INSERT INTO work_items (project_id, parent_id, type, title, description, acceptance_criteria, status, priority, effort_estimate, effort_unit, sprint_id)
  VALUES (
    v_project_id,
    v_epic_2_id,
    'Feature',
    'Order Placement',
    'Enable customers to place orders through the portal with multiple payment options.',
    '1. Shopping cart functionality works
2. Multiple payment methods are supported
3. Order confirmation is sent via email
4. Order is saved in database
5. Inventory is checked before order placement',
    'ToDo',
    'High',
    30,
    'StoryPoints',
    v_sprint_3_id
  )
  RETURNING id INTO v_feature_3_id;

  -- User Story 2.1.1: Add to Cart
  INSERT INTO work_items (project_id, parent_id, type, title, description, acceptance_criteria, status, priority, effort_estimate, effort_unit, sprint_id)
  VALUES (
    v_project_id,
    v_feature_3_id,
    'UserStory',
    'As a customer, I want to add items to my shopping cart',
    'Implement shopping cart functionality for adding and managing items.',
    '1. Items can be added to cart
2. Cart persists across sessions
3. Quantity can be updated
4. Items can be removed
5. Cart total is calculated correctly',
    'Backlog',
    'High',
    13,
    'StoryPoints',
    v_sprint_3_id
  )
  RETURNING id INTO v_story_4_id;

  -- ============================================================================
  -- SPRINT RETROSPECTIVES
  -- ============================================================================
  -- Retrospective for Sprint 1 (Completed) - only if doesn't exist
  INSERT INTO sprint_retrospectives (
    sprint_id,
    retrospective_date,
    what_went_well,
    what_could_be_improved,
    action_items,
    team_sentiment,
    sprint_rating,
    notes
  )
  SELECT 
    v_sprint_1_id,
    CURRENT_DATE - INTERVAL '13 days',
    'Team worked well together and completed all planned stories. Code quality was high and testing was thorough. Daily standups were effective.',
    'Initial sprint planning could have been more accurate. Some stories were larger than estimated. Need better breakdown of complex features.',
    '[
      {
        "item": "Improve story point estimation accuracy",
        "owner_id": null,
        "due_date": null,
        "status": "In Progress"
      },
      {
        "item": "Break down large features into smaller stories",
        "owner_id": null,
        "due_date": null,
        "status": "Pending"
      }
    ]'::jsonb,
    'Positive',
    4,
    'Great start to the project. Team is motivated and working well together.'
  WHERE NOT EXISTS (
    SELECT 1 FROM sprint_retrospectives 
    WHERE sprint_id = v_sprint_1_id
  );

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Test data created successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 PROJECT TO USE FOR TESTING:';
  RAISE NOTICE '   ════════════════════════════════════';
  RAISE NOTICE '   Project Name: %', v_project_name;
  RAISE NOTICE '   Project ID: %', v_project_id;
  RAISE NOTICE '   ════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Test Data Created:';
  RAISE NOTICE '   ✅ Epic 1: Customer Self-Service Portal';
  RAISE NOTICE '   ✅ Epic 2: Order Management System';
  RAISE NOTICE '   ✅ Sprint 1: Foundation (Completed)';
  RAISE NOTICE '   ✅ Sprint 2: Core Features (Active)';
  RAISE NOTICE '   ✅ Sprint 3: Advanced Features (Planning)';
  RAISE NOTICE '   ✅ Features, User Stories, Tasks, and Retrospectives';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 NEXT STEPS:';
  RAISE NOTICE '   1. Go to Projects in your application';
  RAISE NOTICE '   2. Select project: "%"', v_project_name;
  RAISE NOTICE '   3. Follow the testing guide: TESTING_GUIDE_PHASE3.md';
  RAISE NOTICE '';
  RAISE NOTICE 'Note: This migration is idempotent. If test data already exists, it will be skipped.';
  RAISE NOTICE 'To recreate test data, first run cleanup_test_data.sql, then re-run this migration.';
  RAISE NOTICE '========================================';

END $$;

