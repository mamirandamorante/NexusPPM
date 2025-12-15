-- ============================================
-- MIGRATION: Create Role Rates Table
-- ============================================
-- This migration creates a role_rates table to store default hourly rates by role.
-- This enables centralized rate management and auto-population of rates in resource forms.
--
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create role_rates table
CREATE TABLE IF NOT EXISTS role_rates (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL UNIQUE,
  default_hourly_rate NUMERIC(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_role_rates_role ON role_rates(role);

-- Add comments for documentation
COMMENT ON TABLE role_rates IS 'Default hourly rates by role for centralized rate management';
COMMENT ON COLUMN role_rates.role IS 'Role name (must match values used in resources.role)';
COMMENT ON COLUMN role_rates.default_hourly_rate IS 'Default hourly rate for this role';
COMMENT ON COLUMN role_rates.description IS 'Optional description of the role rate';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_role_rates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_role_rates_updated_at
  BEFORE UPDATE ON role_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_role_rates_updated_at();

-- Insert some common default rates (optional - adjust as needed)
INSERT INTO role_rates (role, default_hourly_rate, description) VALUES
  ('Project Manager', 100.00, 'Default rate for Project Managers'),
  ('Developer', 75.00, 'Default rate for Developers'),
  ('Senior Developer', 90.00, 'Default rate for Senior Developers'),
  ('Business Analyst', 70.00, 'Default rate for Business Analysts'),
  ('QA Engineer', 65.00, 'Default rate for QA Engineers'),
  ('DevOps Engineer', 85.00, 'Default rate for DevOps Engineers')
ON CONFLICT (role) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Role rates table created successfully!' AS status;
SELECT role, default_hourly_rate, description FROM role_rates ORDER BY role;

