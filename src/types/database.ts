export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      business_units: {
        Row: {
          budget_code: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          budget_code?: string | null
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          budget_code?: string | null
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          description: string | null
          id: number
          name: string
          type: string
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
          type: string
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
          type?: string
        }
        Relationships: []
      }
      impact_levels: {
        Row: {
          description: string | null
          id: number
          name: string
          numeric_value: number
          order_index: number
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
          numeric_value: number
          order_index: number
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
          numeric_value?: number
          order_index?: number
        }
        Relationships: []
      }
      issue_statuses: {
        Row: {
          description: string | null
          id: number
          name: string
          order_index: number
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
          order_index: number
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      issues: {
        Row: {
          additional_cost: number | null
          affects_budget: boolean | null
          affects_timeline: boolean | null
          assigned_to: string | null
          category: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          estimated_delay_days: number | null
          id: string
          portfolio_id: string | null
          priority: string | null
          program_id: string | null
          project_id: string | null
          reported_by: string | null
          reported_date: string | null
          resolution: string | null
          resolved_date: string | null
          severity: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          additional_cost?: number | null
          affects_budget?: boolean | null
          affects_timeline?: boolean | null
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_delay_days?: number | null
          id?: string
          portfolio_id?: string | null
          priority?: string | null
          program_id?: string | null
          project_id?: string | null
          reported_by?: string | null
          reported_date?: string | null
          resolution?: string | null
          resolved_date?: string | null
          severity?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          additional_cost?: number | null
          affects_budget?: boolean | null
          affects_timeline?: boolean | null
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_delay_days?: number | null
          id?: string
          portfolio_id?: string | null
          priority?: string | null
          program_id?: string | null
          project_id?: string | null
          reported_by?: string | null
          reported_date?: string | null
          resolution?: string | null
          resolved_date?: string | null
          severity?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issues_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "vw_hierarchy_complete"
            referencedColumns: ["portfolio_id"]
          },
          {
            foreignKeyName: "issues_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "vw_issues_all_levels"
            referencedColumns: ["portfolio_id"]
          },
          {
            foreignKeyName: "issues_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "vw_portfolio_financials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "vw_risks_all_levels"
            referencedColumns: ["portfolio_id"]
          },
          {
            foreignKeyName: "issues_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "vw_hierarchy_complete"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "issues_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "vw_issues_all_levels"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "issues_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "vw_program_financials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "vw_risks_all_levels"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_hierarchy_complete"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_issues_all_levels"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_project_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_risks_all_levels"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "issues_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_statuses: {
        Row: {
          description: string | null
          id: number
          name: string
          order_index: number
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
          order_index: number
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      milestones: {
        Row: {
          acceptance_criteria: string | null
          actual_date: string | null
          approved_at: string | null
          approved_by: string | null
          baseline_date: string
          created_at: string | null
          created_by: string | null
          deliverables: string[] | null
          description: string | null
          id: string
          is_payment_trigger: boolean | null
          name: string
          notes: string | null
          owner_id: string | null
          payment_amount: number | null
          planned_date: string
          predecessor_milestone_id: string | null
          project_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          acceptance_criteria?: string | null
          actual_date?: string | null
          approved_at?: string | null
          approved_by?: string | null
          baseline_date: string
          created_at?: string | null
          created_by?: string | null
          deliverables?: string[] | null
          description?: string | null
          id?: string
          is_payment_trigger?: boolean | null
          name: string
          notes?: string | null
          owner_id?: string | null
          payment_amount?: number | null
          planned_date: string
          predecessor_milestone_id?: string | null
          project_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          acceptance_criteria?: string | null
          actual_date?: string | null
          approved_at?: string | null
          approved_by?: string | null
          baseline_date?: string
          created_at?: string | null
          created_by?: string | null
          deliverables?: string[] | null
          description?: string | null
          id?: string
          is_payment_trigger?: boolean | null
          name?: string
          notes?: string | null
          owner_id?: string | null
          payment_amount?: number | null
          planned_date?: string
          predecessor_milestone_id?: string | null
          project_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_predecessor_milestone_id_fkey"
            columns: ["predecessor_milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_hierarchy_complete"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_issues_all_levels"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_project_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_risks_all_levels"
            referencedColumns: ["project_id"]
          },
        ]
      }
      portfolios: {
        Row: {
          business_unit: string | null
          code: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          health: string | null
          id: string
          manager_id: string | null
          name: string
          planned_budget: number | null
          sponsor_id: string | null
          start_date: string | null
          status: string | null
          strategic_objective: string | null
          strategic_priority: number | null
          total_actual_cost: number | null
          total_budget: number | null
          updated_at: string | null
        }
        Insert: {
          business_unit?: string | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          health?: string | null
          id?: string
          manager_id?: string | null
          name: string
          planned_budget?: number | null
          sponsor_id?: string | null
          start_date?: string | null
          status?: string | null
          strategic_objective?: string | null
          strategic_priority?: number | null
          total_actual_cost?: number | null
          total_budget?: number | null
          updated_at?: string | null
        }
        Update: {
          business_unit?: string | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          health?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          planned_budget?: number | null
          sponsor_id?: string | null
          start_date?: string | null
          status?: string | null
          strategic_objective?: string | null
          strategic_priority?: number | null
          total_actual_cost?: number | null
          total_budget?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolios_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolios_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      priority_levels: {
        Row: {
          id: number
          name: string
          order_index: number
        }
        Insert: {
          id?: number
          name: string
          order_index: number
        }
        Update: {
          id?: number
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      probability_levels: {
        Row: {
          id: number
          name: string
          numeric_value: number
          order_index: number
          percentage_range: string | null
        }
        Insert: {
          id?: number
          name: string
          numeric_value: number
          order_index: number
          percentage_range?: string | null
        }
        Update: {
          id?: number
          name?: string
          numeric_value?: number
          order_index?: number
          percentage_range?: string | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          business_unit: string | null
          code: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          expected_benefits: string | null
          health: string | null
          id: string
          manager_id: string | null
          name: string
          planned_budget: number | null
          portfolio_id: string
          realized_benefits: string | null
          sponsor_id: string | null
          start_date: string | null
          status: string | null
          strategic_objective: string | null
          strategic_priority: number | null
          total_actual_cost: number | null
          total_budget: number | null
          updated_at: string | null
        }
        Insert: {
          business_unit?: string | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          expected_benefits?: string | null
          health?: string | null
          id?: string
          manager_id?: string | null
          name: string
          planned_budget?: number | null
          portfolio_id: string
          realized_benefits?: string | null
          sponsor_id?: string | null
          start_date?: string | null
          status?: string | null
          strategic_objective?: string | null
          strategic_priority?: number | null
          total_actual_cost?: number | null
          total_budget?: number | null
          updated_at?: string | null
        }
        Update: {
          business_unit?: string | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          expected_benefits?: string | null
          health?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          planned_budget?: number | null
          portfolio_id?: string
          realized_benefits?: string | null
          sponsor_id?: string | null
          start_date?: string | null
          status?: string | null
          strategic_objective?: string | null
          strategic_priority?: number | null
          total_actual_cost?: number | null
          total_budget?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "vw_hierarchy_complete"
            referencedColumns: ["portfolio_id"]
          },
          {
            foreignKeyName: "programs_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "vw_issues_all_levels"
            referencedColumns: ["portfolio_id"]
          },
          {
            foreignKeyName: "programs_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "vw_portfolio_financials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "vw_risks_all_levels"
            referencedColumns: ["portfolio_id"]
          },
          {
            foreignKeyName: "programs_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      project_costs: {
        Row: {
          amount: number
          cost_category: string | null
          cost_date: string
          cost_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          milestone_id: string | null
          project_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          cost_category?: string | null
          cost_date?: string
          cost_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          milestone_id?: string | null
          project_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          cost_category?: string | null
          cost_date?: string
          cost_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          milestone_id?: string | null
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_costs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_costs_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_hierarchy_complete"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_issues_all_levels"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_project_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_risks_all_levels"
            referencedColumns: ["project_id"]
          },
        ]
      }
      project_resources: {
        Row: {
          allocated_hours: number | null
          created_at: string | null
          joined_date: string | null
          left_date: string | null
          project_id: string
          project_role: string
          resource_id: string
        }
        Insert: {
          allocated_hours?: number | null
          created_at?: string | null
          joined_date?: string | null
          left_date?: string | null
          project_id: string
          project_role: string
          resource_id: string
        }
        Update: {
          allocated_hours?: number | null
          created_at?: string | null
          joined_date?: string | null
          left_date?: string | null
          project_id?: string
          project_role?: string
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_resources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_resources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_hierarchy_complete"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_resources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_issues_all_levels"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_resources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_resources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_project_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_resources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_risks_all_levels"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      project_sizes: {
        Row: {
          id: number
          name: string
          order_index: number
        }
        Insert: {
          id?: number
          name: string
          order_index: number
        }
        Update: {
          id?: number
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      project_states: {
        Row: {
          description: string | null
          id: number
          name: string
          order_index: number
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
          order_index: number
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      projects: {
        Row: {
          actual_cost: number | null
          actual_cost_infrastructure: number | null
          actual_cost_labor: number | null
          actual_cost_materials: number | null
          actual_cost_other: number | null
          budget: number | null
          business_unit: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          manager_id: string | null
          name: string
          portfolio: string | null
          priority: string
          program: string | null
          program_id: string | null
          progress: number | null
          size: string | null
          spent: number | null
          sponsor_id: string | null
          start_date: string | null
          state: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          actual_cost_infrastructure?: number | null
          actual_cost_labor?: number | null
          actual_cost_materials?: number | null
          actual_cost_other?: number | null
          budget?: number | null
          business_unit?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name: string
          portfolio?: string | null
          priority?: string
          program?: string | null
          program_id?: string | null
          progress?: number | null
          size?: string | null
          spent?: number | null
          sponsor_id?: string | null
          start_date?: string | null
          state?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          actual_cost_infrastructure?: number | null
          actual_cost_labor?: number | null
          actual_cost_materials?: number | null
          actual_cost_other?: number | null
          budget?: number | null
          business_unit?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          portfolio?: string | null
          priority?: string
          program?: string | null
          program_id?: string | null
          progress?: number | null
          size?: string | null
          spent?: number | null
          sponsor_id?: string | null
          start_date?: string | null
          state?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "vw_hierarchy_complete"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "projects_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "vw_issues_all_levels"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "projects_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "vw_program_financials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "vw_risks_all_levels"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "projects_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          availability: number | null
          created_at: string | null
          email: string
          hourly_rate: number | null
          id: string
          name: string
          role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          availability?: number | null
          created_at?: string | null
          email: string
          hourly_rate?: number | null
          id?: string
          name: string
          role: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          availability?: number | null
          created_at?: string | null
          email?: string
          hourly_rate?: number | null
          id?: string
          name?: string
          role?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      risk_statuses: {
        Row: {
          description: string | null
          id: number
          name: string
          order_index: number
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
          order_index: number
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      risks: {
        Row: {
          actual_closure_date: string | null
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          identified_date: string | null
          impact: string | null
          mitigation_plan: string | null
          owner_id: string | null
          portfolio_id: string | null
          probability: string | null
          program_id: string | null
          project_id: string | null
          risk_score: number | null
          status: string | null
          target_closure_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_closure_date?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          identified_date?: string | null
          impact?: string | null
          mitigation_plan?: string | null
          owner_id?: string | null
          portfolio_id?: string | null
          probability?: string | null
          program_id?: string | null
          project_id?: string | null
          risk_score?: number | null
          status?: string | null
          target_closure_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_closure_date?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          identified_date?: string | null
          impact?: string | null
          mitigation_plan?: string | null
          owner_id?: string | null
          portfolio_id?: string | null
          probability?: string | null
          program_id?: string | null
          project_id?: string | null
          risk_score?: number | null
          status?: string | null
          target_closure_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risks_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risks_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "vw_hierarchy_complete"
            referencedColumns: ["portfolio_id"]
          },
          {
            foreignKeyName: "risks_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "vw_issues_all_levels"
            referencedColumns: ["portfolio_id"]
          },
          {
            foreignKeyName: "risks_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "vw_portfolio_financials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risks_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "vw_risks_all_levels"
            referencedColumns: ["portfolio_id"]
          },
          {
            foreignKeyName: "risks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "vw_hierarchy_complete"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "risks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "vw_issues_all_levels"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "risks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "vw_program_financials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "vw_risks_all_levels"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "risks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_hierarchy_complete"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "risks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_issues_all_levels"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "risks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "risks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_project_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_risks_all_levels"
            referencedColumns: ["project_id"]
          },
        ]
      }
      severity_levels: {
        Row: {
          description: string | null
          id: number
          name: string
          order_index: number
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
          order_index: number
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          completed_date: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          priority: string
          project_id: string
          start_date: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string
          project_id: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string
          project_id?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_hierarchy_complete"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_issues_all_levels"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_project_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "vw_risks_all_levels"
            referencedColumns: ["project_id"]
          },
        ]
      }
    }
    Views: {
      vw_critical_issues: {
        Row: {
          additional_cost: number | null
          affects_budget: boolean | null
          affects_timeline: boolean | null
          assigned_to_name: string | null
          business_unit: string | null
          category: string | null
          days_to_due: number | null
          due_date: string | null
          estimated_delay_days: number | null
          id: string | null
          priority: string | null
          project_name: string | null
          reported_by_name: string | null
          reported_date: string | null
          severity: string | null
          status: string | null
          title: string | null
        }
        Relationships: []
      }
      vw_hierarchy_complete: {
        Row: {
          portfolio_health: string | null
          portfolio_id: string | null
          portfolio_manager: string | null
          portfolio_name: string | null
          portfolio_status: string | null
          program_health: string | null
          program_id: string | null
          program_manager: string | null
          program_name: string | null
          program_status: string | null
          project_actual_cost: number | null
          project_budget: number | null
          project_id: string | null
          project_manager: string | null
          project_name: string | null
          project_progress: number | null
          project_state: string | null
          project_status: string | null
        }
        Relationships: []
      }
      vw_high_priority_risks: {
        Row: {
          category: string | null
          days_to_closure: number | null
          id: string | null
          identified_date: string | null
          impact: string | null
          mitigation_plan: string | null
          owner_name: string | null
          probability: string | null
          project_name: string | null
          risk_score: number | null
          status: string | null
          target_closure_date: string | null
          title: string | null
        }
        Relationships: []
      }
      vw_issues_all_levels: {
        Row: {
          additional_cost: number | null
          affects_budget: boolean | null
          affects_timeline: boolean | null
          assigned_to_name: string | null
          category: string | null
          due_date: string | null
          entity_name: string | null
          estimated_delay_days: number | null
          id: string | null
          issue_level: string | null
          portfolio_id: string | null
          portfolio_name: string | null
          priority: string | null
          program_id: string | null
          program_name: string | null
          project_id: string | null
          project_name: string | null
          reported_by_name: string | null
          reported_date: string | null
          severity: string | null
          status: string | null
          title: string | null
        }
        Relationships: []
      }
      vw_portfolio_financials: {
        Row: {
          active_programs: number | null
          active_projects: number | null
          budget_allocation_variance: number | null
          cost_variance: number | null
          id: string | null
          name: string | null
          percent_budget_allocated: number | null
          percent_spent: number | null
          planned_budget: number | null
          total_actual_cost: number | null
          total_budget: number | null
          total_programs: number | null
          total_projects: number | null
        }
        Relationships: []
      }
      vw_program_financials: {
        Row: {
          active_projects: number | null
          budget_allocation_variance: number | null
          completed_projects: number | null
          cost_variance: number | null
          id: string | null
          name: string | null
          percent_budget_allocated: number | null
          percent_spent: number | null
          planned_budget: number | null
          portfolio_id: string | null
          total_actual_cost: number | null
          total_project_budget: number | null
          total_projects: number | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "vw_hierarchy_complete"
            referencedColumns: ["portfolio_id"]
          },
          {
            foreignKeyName: "programs_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "vw_issues_all_levels"
            referencedColumns: ["portfolio_id"]
          },
          {
            foreignKeyName: "programs_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "vw_portfolio_financials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "vw_risks_all_levels"
            referencedColumns: ["portfolio_id"]
          },
        ]
      }
      vw_project_cost_summary: {
        Row: {
          actual_cost_infrastructure: number | null
          actual_cost_labor: number | null
          actual_cost_materials: number | null
          actual_cost_other: number | null
          actual_cost_total: number | null
          cost_infrastructure_from_transactions: number | null
          cost_labor_from_transactions: number | null
          cost_materials_from_transactions: number | null
          cost_other_from_transactions: number | null
          infrastructure_percent: number | null
          labor_percent: number | null
          materials_percent: number | null
          other_percent: number | null
          project_id: string | null
          project_name: string | null
        }
        Relationships: []
      }
      vw_project_overview: {
        Row: {
          actual_cost: number | null
          budget: number | null
          budget_variance: number | null
          business_unit: string | null
          completed_milestones: number | null
          completed_tasks: number | null
          completion_percent: number | null
          created_at: string | null
          end_date: string | null
          id: string | null
          in_progress_milestones: number | null
          manager_name: string | null
          name: string | null
          not_started_milestones: number | null
          open_issues: number | null
          open_risks: number | null
          percent_spent: number | null
          portfolio: string | null
          priority: string | null
          program: string | null
          progress: number | null
          size: string | null
          sponsor_name: string | null
          start_date: string | null
          state: string | null
          total_milestones: number | null
          total_tasks: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      vw_risks_all_levels: {
        Row: {
          category: string | null
          entity_name: string | null
          id: string | null
          identified_date: string | null
          impact: string | null
          owner_name: string | null
          portfolio_id: string | null
          portfolio_name: string | null
          probability: string | null
          program_id: string | null
          program_name: string | null
          project_id: string | null
          project_name: string | null
          risk_level: string | null
          risk_score: number | null
          status: string | null
          target_closure_date: string | null
          title: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      update_portfolio_financials: {
        Args: { p_portfolio_id: string }
        Returns: undefined
      }
      update_program_financials: {
        Args: { p_program_id: string }
        Returns: undefined
      }
      validate_milestone_weights: {
        Args: { p_project_id: string }
        Returns: {
          is_valid: boolean
          message: string
          project_id: string
          project_name: string
          total_weight: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
