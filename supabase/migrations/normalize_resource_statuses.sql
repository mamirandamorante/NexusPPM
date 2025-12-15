-- ============================================
-- MIGRATION: Normalize Resource Status Values
-- ============================================
-- This migration normalizes all status values in the resources table
-- to ensure consistent capitalization (Active, Inactive)
--
-- Run this in your Supabase SQL Editor
-- ============================================

-- Update all variations of "active" to "Active"
UPDATE resources
SET status = 'Active'
WHERE LOWER(status) = 'active' AND status != 'Active';

-- Update all variations of "inactive" to "Inactive"
UPDATE resources
SET status = 'Inactive'
WHERE LOWER(status) = 'inactive' AND status != 'Inactive';

-- Show summary of changes
SELECT 
  status,
  COUNT(*) as count
FROM resources
GROUP BY status
ORDER BY status;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Resource status normalization completed!' AS status;
SELECT 'All status values have been normalized to: Active, Inactive' AS note;

