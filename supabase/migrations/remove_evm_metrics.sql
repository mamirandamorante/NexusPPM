-- ============================================
-- MIGRATION: Remove EVM Metrics
-- ============================================
-- This migration removes all EVM (Earned Value Management) related objects:
-- - EVM views
-- - EVM functions
-- - EVM-specific columns from milestones table
-- 
-- Keeps: milestones table, milestone_statuses, cost categories
-- ============================================

-- ============================================
-- STEP 1: Drop EVM Views and Dependent Views
-- ============================================
-- Drop views that depend on EVM columns first

DROP VIEW IF EXISTS vw_project_evm_0_50_100 CASCADE;
DROP VIEW IF EXISTS vw_project_evm_metrics CASCADE;
DROP VIEW IF EXISTS vw_milestone_evm_details CASCADE;
DROP VIEW IF EXISTS vw_project_planned_value CASCADE;
DROP VIEW IF EXISTS vw_project_earned_value CASCADE;
DROP VIEW IF EXISTS vw_milestone_timeline CASCADE;

-- ============================================
-- STEP 2: Drop EVM Functions
-- ============================================

DROP FUNCTION IF EXISTS get_progress_credit(TEXT) CASCADE;

-- ============================================
-- STEP 3: Remove EVM-Specific Columns from Milestones
-- ============================================
-- These columns were used for EVM weight calculations
-- Removing them as EVM is no longer used

ALTER TABLE milestones 
DROP COLUMN IF EXISTS percent_complete_weight,
DROP COLUMN IF EXISTS is_evm_measurement_point;

-- ============================================
-- STEP 4: Grant Permissions (if using RLS)
-- ============================================
-- No new permissions needed - just removing objects

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'EVM objects removed successfully!' AS status;
SELECT '- EVM views and dependent views dropped' AS step1;
SELECT '- EVM functions dropped' AS step2;
SELECT '- EVM columns removed from milestones table' AS step3;

-- Verify views are gone (should return 0 rows):
-- SELECT table_name FROM information_schema.views 
-- WHERE table_schema = 'public' 
--   AND (table_name LIKE '%evm%' 
--     OR table_name = 'vw_project_planned_value'
--     OR table_name = 'vw_project_earned_value'
--     OR table_name = 'vw_milestone_timeline');

-- Verify columns are removed (should not show percent_complete_weight or is_evm_measurement_point):
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'milestones' 
--   AND (column_name LIKE '%evm%' 
--     OR column_name = 'percent_complete_weight'
--     OR column_name = 'is_evm_measurement_point');

