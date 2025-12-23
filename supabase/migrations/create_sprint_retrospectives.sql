-- Migration: Create Sprint Retrospectives Table
-- This migration creates the database foundation for sprint retrospectives

-- ============================================================================
-- SPRINT RETROSPECTIVES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS sprint_retrospectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  retrospective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  what_went_well TEXT,
  what_could_be_improved TEXT,
  action_items JSONB DEFAULT '[]'::jsonb, -- Array of {item: string, owner_id: UUID, due_date: DATE, status: string}
  team_sentiment TEXT CHECK (team_sentiment IN ('Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative')),
  sprint_rating INTEGER CHECK (sprint_rating >= 1 AND sprint_rating <= 5), -- 1-5 scale
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Ensure only one retrospective per sprint
  CONSTRAINT unique_retrospective_per_sprint UNIQUE (sprint_id)
);

-- Indexes for sprint_retrospectives
CREATE INDEX idx_sprint_retrospectives_sprint_id ON sprint_retrospectives(sprint_id);
CREATE INDEX idx_sprint_retrospectives_date ON sprint_retrospectives(retrospective_date);

-- Function to update updated_at timestamp
CREATE TRIGGER update_sprint_retrospectives_updated_at
  BEFORE UPDATE ON sprint_retrospectives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE sprint_retrospectives IS 'Stores sprint retrospective data including lessons learned and action items';
COMMENT ON COLUMN sprint_retrospectives.action_items IS 'JSONB array of action items with item, owner_id, due_date, and status';
COMMENT ON COLUMN sprint_retrospectives.team_sentiment IS 'Overall team sentiment about the sprint';
COMMENT ON COLUMN sprint_retrospectives.sprint_rating IS 'Sprint rating on a scale of 1-5';

