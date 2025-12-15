-- Migration: Create Resource Availability Management System
-- This migration creates tables and views for managing time-based resource availability

-- Try to enable btree_gist extension (may fail in some managed databases)
-- If this fails, the trigger-based approach below will handle overlap prevention
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS btree_gist;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'btree_gist extension not available, using trigger-based overlap prevention';
END $$;

-- Table: resource_availability_periods
-- Stores time-based availability periods for resources
CREATE TABLE IF NOT EXISTS resource_availability_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  availability_percent INTEGER NOT NULL CHECK (availability_percent >= 0 AND availability_percent <= 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Ensure end_date is after start_date
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Try to create EXCLUDE constraint (only works if btree_gist is available)
DO $$
BEGIN
  ALTER TABLE resource_availability_periods
    ADD CONSTRAINT no_overlapping_periods EXCLUDE USING gist (
      resource_id WITH =,
      daterange(start_date, end_date, '[]') WITH &&
    );
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'EXCLUDE constraint not created, using trigger-based overlap prevention';
END $$;

-- Indexes for performance
CREATE INDEX idx_resource_availability_resource_id ON resource_availability_periods(resource_id);
CREATE INDEX idx_resource_availability_dates ON resource_availability_periods USING gist (daterange(start_date, end_date, '[]'));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_resource_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_resource_availability_timestamp
  BEFORE UPDATE ON resource_availability_periods
  FOR EACH ROW
  EXECUTE FUNCTION update_resource_availability_updated_at();

-- Function to check for overlapping periods (fallback if EXCLUDE constraint not available)
CREATE OR REPLACE FUNCTION check_resource_availability_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there's an overlapping period for the same resource
  IF EXISTS (
    SELECT 1
    FROM resource_availability_periods
    WHERE resource_id = NEW.resource_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND daterange(start_date, end_date, '[]') && daterange(NEW.start_date, NEW.end_date, '[]')
  ) THEN
    RAISE EXCEPTION 'Overlapping availability period exists for this resource. Periods cannot overlap.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent overlapping periods (only if EXCLUDE constraint wasn't created)
DO $$
BEGIN
  -- Check if the EXCLUDE constraint exists
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'no_overlapping_periods'
      AND conrelid = 'resource_availability_periods'::regclass
  ) THEN
    CREATE TRIGGER check_availability_overlap
      BEFORE INSERT OR UPDATE ON resource_availability_periods
      FOR EACH ROW
      EXECUTE FUNCTION check_resource_availability_overlap();
  END IF;
END $$;

-- View: vw_resource_availability_summary
-- Provides a summary of current availability for each resource
CREATE OR REPLACE VIEW vw_resource_availability_summary AS
SELECT 
  r.id AS resource_id,
  r.name AS resource_name,
  r.availability AS default_availability,
  COALESCE(
    (SELECT availability_percent 
     FROM resource_availability_periods 
     WHERE resource_id = r.id 
       AND CURRENT_DATE BETWEEN start_date AND end_date
     ORDER BY start_date DESC
     LIMIT 1),
    r.availability
  ) AS current_availability,
  (SELECT COUNT(*) 
   FROM resource_availability_periods 
   WHERE resource_id = r.id) AS availability_periods_count
FROM resources r
WHERE r.status = 'Active';

-- View: vw_resource_capacity
-- Calculates allocated vs available capacity for resources
CREATE OR REPLACE VIEW vw_resource_capacity AS
WITH resource_availability AS (
  SELECT 
    r.id AS resource_id,
    r.name AS resource_name,
    COALESCE(
      (SELECT availability_percent 
       FROM resource_availability_periods 
       WHERE resource_id = r.id 
         AND CURRENT_DATE BETWEEN start_date AND end_date
       ORDER BY start_date DESC
       LIMIT 1),
      r.availability,
      100
    ) AS available_capacity
  FROM resources r
  WHERE r.status = 'Active'
),
project_allocations AS (
  SELECT 
    pr.resource_id,
    -- Calculate total allocated hours per week
    -- Assuming a standard work week, we'll sum allocated_hours
    -- If allocated_hours is null, assume full-time (40 hours/week = 100%)
    SUM(
      CASE 
        WHEN pr.allocated_hours IS NOT NULL THEN pr.allocated_hours
        ELSE 40  -- Default to 40 hours/week if not specified
      END
    ) AS total_allocated_hours
  FROM project_resources pr
  INNER JOIN projects p ON pr.project_id = p.id
  WHERE p.status NOT IN ('Cancelled', 'Completed')
    AND (pr.left_date IS NULL OR pr.left_date >= CURRENT_DATE)
    AND (pr.joined_date IS NULL OR pr.joined_date <= CURRENT_DATE)
  GROUP BY pr.resource_id
)
SELECT 
  ra.resource_id,
  ra.resource_name,
  ra.available_capacity,
  -- Convert allocated hours to percentage (assuming 40 hours/week = 100%)
  -- If allocated hours exceed available capacity percentage, show over-allocation
  CASE 
    WHEN pa.total_allocated_hours IS NOT NULL THEN
      LEAST(100, ROUND((pa.total_allocated_hours / 40.0 * 100)::numeric, 2))
    ELSE 0
  END AS allocated_capacity,
  -- Calculate remaining capacity in percentage
  GREATEST(0, 
    ra.available_capacity - 
    CASE 
      WHEN pa.total_allocated_hours IS NOT NULL THEN
        LEAST(100, ROUND((pa.total_allocated_hours / 40.0 * 100)::numeric, 2))
      ELSE 0
    END
  ) AS remaining_capacity,
  -- Check if over-allocated (allocated hours converted to % exceeds available %)
  CASE 
    WHEN pa.total_allocated_hours IS NOT NULL AND 
         (pa.total_allocated_hours / 40.0 * 100) > ra.available_capacity THEN true
    ELSE false
  END AS is_over_allocated,
  -- Utilization percentage
  CASE 
    WHEN ra.available_capacity > 0 AND pa.total_allocated_hours IS NOT NULL THEN 
      LEAST(100, ROUND((pa.total_allocated_hours / 40.0 * 100 / ra.available_capacity * 100)::numeric, 2))
    WHEN ra.available_capacity > 0 THEN 0
    ELSE 0
  END AS utilization_percent
FROM resource_availability ra
LEFT JOIN project_allocations pa ON ra.resource_id = pa.resource_id;

-- Add comments
COMMENT ON TABLE resource_availability_periods IS 'Stores time-based availability periods for resources';
COMMENT ON COLUMN resource_availability_periods.availability_percent IS 'Percentage of time available (0-100)';
COMMENT ON COLUMN resource_availability_periods.start_date IS 'Start date of availability period (inclusive)';
COMMENT ON COLUMN resource_availability_periods.end_date IS 'End date of availability period (inclusive)';
COMMENT ON VIEW vw_resource_availability_summary IS 'Summary of current availability for each active resource';
COMMENT ON VIEW vw_resource_capacity IS 'Calculates allocated vs available capacity with over-allocation detection';

