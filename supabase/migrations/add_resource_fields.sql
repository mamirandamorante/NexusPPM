-- ============================================
-- MIGRATION: Add Additional Fields to Resources Table
-- ============================================
-- This migration adds the following fields to the resources table:
-- 1. company - Company the vendor/employee works for
-- 2. type - Whether the resource is Internal or External
-- 3. business_unit_id - Reference to business_units table
-- 4. resource_manager_id - Reference to resources table (self-referential)
--
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add company field
ALTER TABLE resources
ADD COLUMN IF NOT EXISTS company TEXT;

-- Add type field (Internal or External)
ALTER TABLE resources
ADD COLUMN IF NOT EXISTS type TEXT;

-- Add business_unit_id field (references business_units table)
ALTER TABLE resources
ADD COLUMN IF NOT EXISTS business_unit_id INTEGER REFERENCES business_units(id);

-- Add resource_manager_id field (self-referential to resources table)
ALTER TABLE resources
ADD COLUMN IF NOT EXISTS resource_manager_id UUID REFERENCES resources(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resources_business_unit_id ON resources(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_resources_resource_manager_id ON resources(resource_manager_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);

-- Add comments for documentation
COMMENT ON COLUMN resources.company IS 'Company the vendor/employee works for';
COMMENT ON COLUMN resources.type IS 'Type of resource: Internal or External';
COMMENT ON COLUMN resources.business_unit_id IS 'Business unit the resource belongs to';
COMMENT ON COLUMN resources.resource_manager_id IS 'Resource manager responsible for this resource';

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Resource fields migration completed!' AS status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'resources' 
  AND column_name IN ('company', 'type', 'business_unit_id', 'resource_manager_id')
ORDER BY column_name;

