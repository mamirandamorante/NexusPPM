-- Migration: Create Agile/Scrum Project Management with PRINCE2 Governance Tables
-- This migration creates the database foundation for hybrid Agile/PRINCE2 project management

-- ============================================================================
-- 1. PRINCE2 STAGES TABLE (created first - no dependencies)
-- ============================================================================

CREATE TABLE IF NOT EXISTS prince2_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL CHECK (stage_name IN ('Initiation', 'Delivery', 'Closure')),
  stage_number INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'NotStarted' CHECK (status IN ('NotStarted', 'InProgress', 'Complete', 'OnHold')),
  tolerances JSONB DEFAULT '{
    "time": {"value": 0, "unit": "days", "threshold": 0},
    "cost": {"value": 0, "unit": "currency", "threshold": 0},
    "scope": {"value": 0, "unit": "percent", "threshold": 0},
    "quality": {"value": 0, "unit": "percent", "threshold": 0},
    "risk": {"value": 0, "unit": "level", "threshold": 0},
    "benefit": {"value": 0, "unit": "percent", "threshold": 0}
  }'::jsonb,
  stage_gate_status TEXT DEFAULT 'Pending' CHECK (stage_gate_status IN ('Pending', 'Approved', 'Rejected', 'Escalated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique stage number per project
  CONSTRAINT unique_stage_number_per_project UNIQUE (project_id, stage_number)
);

-- Indexes for prince2_stages
CREATE INDEX idx_prince2_stages_project_id ON prince2_stages(project_id);
CREATE INDEX idx_prince2_stages_status ON prince2_stages(status);

-- ============================================================================
-- 2. SPRINTS TABLE (created second - depends on prince2_stages)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  prince2_stage_id UUID REFERENCES prince2_stages(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  velocity NUMERIC(10,2) DEFAULT 0, -- Story points completed
  status TEXT NOT NULL DEFAULT 'Planning' CHECK (status IN ('Planning', 'Active', 'Completed', 'Cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure end_date is after start_date
  CONSTRAINT valid_sprint_dates CHECK (end_date >= start_date)
);

-- Indexes for sprints
CREATE INDEX idx_sprints_project_id ON sprints(project_id);
CREATE INDEX idx_sprints_prince2_stage_id ON sprints(prince2_stage_id);
CREATE INDEX idx_sprints_status ON sprints(status);
CREATE INDEX idx_sprints_dates ON sprints(start_date, end_date);

-- ============================================================================
-- 3. WORK ITEMS TABLE (created third - depends on sprints)
-- ============================================================================

CREATE TABLE IF NOT EXISTS work_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES work_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Epic', 'Feature', 'UserStory', 'Task')),
  title TEXT NOT NULL,
  description TEXT,
  acceptance_criteria TEXT,
  status TEXT NOT NULL DEFAULT 'Backlog' CHECK (status IN ('Backlog', 'ToDo', 'InProgress', 'InReview', 'Done', 'Cancelled')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  effort_estimate NUMERIC(10,2), -- Story points for Epics/Features/Stories, hours for Tasks
  effort_unit TEXT CHECK (effort_unit IN ('StoryPoints', 'Hours')),
  assignee_id UUID REFERENCES resources(id) ON DELETE SET NULL,
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
  definition_of_done_checklist JSONB DEFAULT '[]'::jsonb,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Indexes for work_items
CREATE INDEX idx_work_items_project_id ON work_items(project_id);
CREATE INDEX idx_work_items_parent_id ON work_items(parent_id);
CREATE INDEX idx_work_items_type ON work_items(type);
CREATE INDEX idx_work_items_status ON work_items(status);
CREATE INDEX idx_work_items_sprint_id ON work_items(sprint_id);
CREATE INDEX idx_work_items_assignee_id ON work_items(assignee_id);
CREATE INDEX idx_work_items_project_type ON work_items(project_id, type);

-- ============================================================================
-- 4. STAGE GATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS stage_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prince2_stage_id UUID NOT NULL REFERENCES prince2_stages(id) ON DELETE CASCADE,
  gate_type TEXT NOT NULL CHECK (gate_type IN ('Entry', 'Exit')),
  scheduled_date DATE NOT NULL,
  actual_date DATE,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Escalated', 'Deferred')),
  decision TEXT,
  decision_notes TEXT,
  reviewer_id UUID REFERENCES resources(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES resources(id) ON DELETE SET NULL,
  checklist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for stage_gates
CREATE INDEX idx_stage_gates_prince2_stage_id ON stage_gates(prince2_stage_id);
CREATE INDEX idx_stage_gates_status ON stage_gates(status);
CREATE INDEX idx_stage_gates_gate_type ON stage_gates(gate_type);

-- ============================================================================
-- 5. HIGHLIGHT REPORTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS highlight_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  prince2_stage_id UUID REFERENCES prince2_stages(id) ON DELETE SET NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  stage_progress_percent NUMERIC(5,2) DEFAULT 0 CHECK (stage_progress_percent >= 0 AND stage_progress_percent <= 100),
  tolerance_status JSONB DEFAULT '{}'::jsonb,
  achievements TEXT,
  next_period_plan TEXT,
  risks_issues_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes for highlight_reports
CREATE INDEX idx_highlight_reports_project_id ON highlight_reports(project_id);
CREATE INDEX idx_highlight_reports_prince2_stage_id ON highlight_reports(prince2_stage_id);
CREATE INDEX idx_highlight_reports_report_date ON highlight_reports(report_date);

-- ============================================================================
-- 6. EXCEPTION REPORTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS exception_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  prince2_stage_id UUID REFERENCES prince2_stages(id) ON DELETE SET NULL,
  exception_type TEXT NOT NULL CHECK (exception_type IN ('Time', 'Cost', 'Scope', 'Quality', 'Risk', 'Benefit', 'Multiple')),
  description TEXT NOT NULL,
  tolerance_breached JSONB NOT NULL,
  impact_assessment TEXT,
  recommended_action TEXT,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'UnderReview', 'Approved', 'Rejected', 'Resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  resolved_by UUID REFERENCES resources(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for exception_reports
CREATE INDEX idx_exception_reports_project_id ON exception_reports(project_id);
CREATE INDEX idx_exception_reports_prince2_stage_id ON exception_reports(prince2_stage_id);
CREATE INDEX idx_exception_reports_status ON exception_reports(status);

-- ============================================================================
-- 7. DEFINITIONS OF DONE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS definitions_of_done (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  work_item_type TEXT CHECK (work_item_type IN ('Epic', 'Feature', 'UserStory', 'Task')),
  checklist_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for definitions_of_done
CREATE INDEX idx_definitions_of_done_project_id ON definitions_of_done(project_id);
CREATE INDEX idx_definitions_of_done_work_item_type ON definitions_of_done(work_item_type);

-- Unique partial index: Ensure only one default per work_item_type per project
CREATE UNIQUE INDEX idx_definitions_of_done_unique_default 
  ON definitions_of_done(project_id, work_item_type) 
  WHERE is_default = true;

-- ============================================================================
-- 8. HIERARCHY VALIDATION FUNCTION
-- ============================================================================

-- Function to validate work item hierarchy rules
CREATE OR REPLACE FUNCTION validate_work_item_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  parent_type TEXT;
BEGIN
  -- If no parent, only Epic is allowed at top level
  IF NEW.parent_id IS NULL THEN
    IF NEW.type != 'Epic' THEN
      RAISE EXCEPTION 'Only Epics can be at the top level (no parent)';
    END IF;
    RETURN NEW;
  END IF;

  -- Get parent type
  SELECT type INTO parent_type
  FROM work_items
  WHERE id = NEW.parent_id;

  -- Validate hierarchy rules
  IF NEW.type = 'Epic' THEN
    IF parent_type IS NULL OR parent_type != 'Epic' THEN
      RAISE EXCEPTION 'Epic can only have Epic as parent or no parent';
    END IF;
  ELSIF NEW.type = 'Feature' THEN
    IF parent_type NOT IN ('Epic', 'Feature') THEN
      RAISE EXCEPTION 'Feature can only have Epic or Feature as parent';
    END IF;
  ELSIF NEW.type = 'UserStory' THEN
    IF parent_type NOT IN ('Feature', 'UserStory') THEN
      RAISE EXCEPTION 'UserStory can only have Feature or UserStory as parent';
    END IF;
  ELSIF NEW.type = 'Task' THEN
    IF parent_type NOT IN ('UserStory', 'Task') THEN
      RAISE EXCEPTION 'Task can only have UserStory or Task as parent';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate hierarchy
CREATE TRIGGER validate_work_item_hierarchy_trigger
  BEFORE INSERT OR UPDATE ON work_items
  FOR EACH ROW
  EXECUTE FUNCTION validate_work_item_hierarchy();

-- ============================================================================
-- 9. UPDATE TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to all tables
CREATE TRIGGER update_work_items_updated_at
  BEFORE UPDATE ON work_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prince2_stages_updated_at
  BEFORE UPDATE ON prince2_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sprints_updated_at
  BEFORE UPDATE ON sprints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stage_gates_updated_at
  BEFORE UPDATE ON stage_gates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_highlight_reports_updated_at
  BEFORE UPDATE ON highlight_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exception_reports_updated_at
  BEFORE UPDATE ON exception_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_definitions_of_done_updated_at
  BEFORE UPDATE ON definitions_of_done
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. COMMENTS
-- ============================================================================

COMMENT ON TABLE work_items IS 'Hierarchical work items: Epic, Feature, User Story, Task';
COMMENT ON TABLE prince2_stages IS 'PRINCE2 project stages (Initiation, Delivery, Closure)';
COMMENT ON TABLE sprints IS 'Agile sprints contained within PRINCE2 stages';
COMMENT ON TABLE stage_gates IS 'PRINCE2 stage gate reviews (Entry/Exit)';
COMMENT ON TABLE highlight_reports IS 'PRINCE2 highlight reports for stage progress';
COMMENT ON TABLE exception_reports IS 'PRINCE2 exception reports for tolerance breaches';
COMMENT ON TABLE definitions_of_done IS 'Definition of Done checklists for work items';

