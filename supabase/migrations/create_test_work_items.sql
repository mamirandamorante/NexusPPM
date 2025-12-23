-- Migration: Create Test Data for Work Items (Epics, Features, User Stories, Tasks)
-- This creates sample data for testing the Agile/PRINCE2 project management features

-- First, get a project ID (use the first active project)
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
BEGIN
  -- Get the first project ID
  SELECT id INTO v_project_id
  FROM projects
  WHERE status NOT IN ('Cancelled', 'Completed')
  LIMIT 1;

  IF v_project_id IS NULL THEN
    RAISE NOTICE 'No active projects found. Please create a project first.';
    RETURN;
  END IF;

  RAISE NOTICE 'Using project ID: %', v_project_id;

  -- ============================================================================
  -- EPIC 1: Customer Self-Service Portal
  -- ============================================================================
  INSERT INTO work_items (project_id, type, title, description, status, priority, effort_estimate, effort_unit)
  VALUES (
    v_project_id,
    'Epic',
    'Customer Self-Service Portal',
    'Build a comprehensive self-service portal for customers to manage their accounts, view orders, and access support resources.',
    'InProgress',
    'High',
    100,
    'StoryPoints'
  )
  RETURNING id INTO v_epic_1_id;

  -- Feature 1.1: User Registration & Authentication
  INSERT INTO work_items (project_id, parent_id, type, title, description, acceptance_criteria, status, priority, effort_estimate, effort_unit)
  VALUES (
    v_project_id,
    v_epic_1_id,
    'Feature',
    'User Registration & Authentication',
    'Allow users to register and authenticate securely with email/password and social login options.',
    '1. Users can create accounts with email and password
2. Users can log in securely
3. Password reset functionality works
4. Social login (Google, Facebook) is available
5. Two-factor authentication is optional',
    'InProgress',
    'High',
    21,
    'StoryPoints'
  )
  RETURNING id INTO v_feature_1_id;

  -- User Story 1.1.1: Email Registration
  INSERT INTO work_items (project_id, parent_id, type, title, description, acceptance_criteria, status, priority, effort_estimate, effort_unit)
  VALUES (
    v_project_id,
    v_feature_1_id,
    'UserStory',
    'As a new user, I want to register with my email address',
    'Users should be able to create an account using their email and a secure password.',
    '1. Registration form validates email format
2. Password must be at least 8 characters
3. User receives confirmation email
4. Account is created successfully',
    'Done',
    'High',
    5,
    'StoryPoints'
  )
  RETURNING id INTO v_story_1_id;

  -- User Story 1.1.2: Login Functionality
  INSERT INTO work_items (project_id, parent_id, type, title, description, acceptance_criteria, status, priority, effort_estimate, effort_unit)
  VALUES (
    v_project_id,
    v_feature_1_id,
    'UserStory',
    'As a registered user, I want to log in to my account',
    'Users should be able to securely log in with their credentials.',
    '1. Login form accepts email and password
2. Invalid credentials show error message
3. Successful login redirects to dashboard
4. Session is maintained securely',
    'InProgress',
    'High',
    3,
    'StoryPoints'
  )
  RETURNING id INTO v_story_2_id;

  -- Feature 1.2: Order Management
  INSERT INTO work_items (project_id, parent_id, type, title, description, acceptance_criteria, status, priority, effort_estimate, effort_unit)
  VALUES (
    v_project_id,
    v_epic_1_id,
    'Feature',
    'Order Management & Tracking',
    'Customers can view their order history, track current orders, and manage order details.',
    '1. Users can view all past orders
2. Users can track current order status
3. Users can view order details and invoices
4. Users can cancel orders (if allowed)
5. Order notifications are sent via email',
    'ToDo',
    'Medium',
    34,
    'StoryPoints'
  )
  RETURNING id INTO v_feature_2_id;

  -- User Story 1.2.1: View Order History
  INSERT INTO work_items (project_id, parent_id, type, title, description, acceptance_criteria, status, priority, effort_estimate, effort_unit)
  VALUES (
    v_project_id,
    v_feature_2_id,
    'UserStory',
    'As a customer, I want to view my order history',
    'Users should see a list of all their past orders with key information.',
    '1. Order list shows order number, date, total
2. Orders are sorted by date (newest first)
3. Users can filter by date range
4. Users can search by order number',
    'Backlog',
    'Medium',
    8,
    'StoryPoints'
  );

  -- ============================================================================
  -- EPIC 2: Mobile App Development
  -- ============================================================================
  INSERT INTO work_items (project_id, type, title, description, status, priority, effort_estimate, effort_unit)
  VALUES (
    v_project_id,
    'Epic',
    'Mobile App Development',
    'Develop native mobile applications for iOS and Android platforms with core features and offline capabilities.',
    'ToDo',
    'High',
    150,
    'StoryPoints'
  )
  RETURNING id INTO v_epic_2_id;

  -- Feature 2.1: Core App Features
  INSERT INTO work_items (project_id, parent_id, type, title, description, acceptance_criteria, status, priority, effort_estimate, effort_unit)
  VALUES (
    v_project_id,
    v_epic_2_id,
    'Feature',
    'Core App Features',
    'Implement essential app functionality including navigation, user profiles, and basic interactions.',
    '1. App navigation works smoothly
2. User profile can be viewed and edited
3. Basic app settings are accessible
4. App works offline for core features',
    'Backlog',
    'High',
    45,
    'StoryPoints'
  )
  RETURNING id INTO v_feature_3_id;

  -- User Story 2.1.1: App Navigation
  INSERT INTO work_items (project_id, parent_id, type, title, description, acceptance_criteria, status, priority, effort_estimate, effort_unit)
  VALUES (
    v_project_id,
    v_feature_3_id,
    'UserStory',
    'As a user, I want to navigate between app screens',
    'The app should have intuitive navigation between different sections.',
    '1. Bottom navigation bar is visible
2. All main sections are accessible
3. Navigation is smooth and responsive
4. Back button works correctly',
    'Backlog',
    'High',
    13,
    'StoryPoints'
  )
  RETURNING id INTO v_story_3_id;

  -- Task 2.1.1.1: Design Navigation Component
  INSERT INTO work_items (project_id, parent_id, type, title, description, status, priority, effort_estimate, effort_unit)
  VALUES (
    v_project_id,
    v_story_3_id,
    'Task',
    'Design navigation component UI',
    'Create the visual design for the bottom navigation bar component.',
    'ToDo',
    'Medium',
    4,
    'Hours'
  );

  -- Task 2.1.1.2: Implement Navigation Logic
  INSERT INTO work_items (project_id, parent_id, type, title, description, status, priority, effort_estimate, effort_unit)
  VALUES (
    v_project_id,
    v_story_3_id,
    'Task',
    'Implement navigation routing logic',
    'Set up React Navigation with all required routes and transitions.',
    'Backlog',
    'Medium',
    6,
    'Hours'
  );

  RAISE NOTICE 'Test data created successfully!';
  RAISE NOTICE 'Epic 1 ID: %', v_epic_1_id;
  RAISE NOTICE 'Epic 2 ID: %', v_epic_2_id;
END $$;

