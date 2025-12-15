import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

/**
 * PROJECT SUMMARY COMPONENT - Two-Panel Layout
 * 
 * PURPOSE:
 * Displays the executive summary card for a selected project with
 * integrated Quick Stats for at-a-glance KPIs.
 * 
 * LAYOUT:
 * ┌──────────────────────────────────────────────────────────────────────────────┐
 * │ PROJECT INFORMATION                                          (dark header)  │
 * ├────────────────────────────────────────────┬─────────────────────────────────┤
 * │ Project Name                               │  Start Date:     xxx            │
 * │ Project Sponsor: xxx  |  Project Manager: x│  Target End:     xxx            │
 * │ Program: xxx  |  Business Unit: xxx        │  Duration:       xxx days       │
 * │                                            │  ─────────────────────          │
 * │ Phase: ▪  Priority: ▪  Size: ▪  Status: ▪  │  Total Cost:     $xxx           │
 * │                                            │  Total Effort:   xxx man-days   │
 * └────────────────────────────────────────────┴─────────────────────────────────┘
 * 
 * ┌──────────────────────────────────────────────────────────────────────────────┐
 * │ PROJECT HEALTH SUMMARY                                       (dark header)  │
 * ├──────────────────────────────────────────────────────────────────────────────┤
 * │ ┌─────┬─────┬─────┬─────┬─────┬─────┐                                       │
 * │ │Spent│Rem. │Team │Risks│Issue│Miles│                                       │
 * │ └─────┴─────┴─────┴─────┴─────┴─────┘                                       │
 * └──────────────────────────────────────────────────────────────────────────────┘
 * 
 * DATA SOURCES:
 * - vw_project_overview - Project details with milestone counts
 * 
 * COMPLETION % CALCULATION:
 * Simple milestone count: (completed_milestones / total_milestones) * 100
 * 
 * HEALTH STATUS CALCULATION:
 * Based on risks, issues, and milestone progress (not EVM metrics)
 */

const ProjectSummary = ({ projectId }) => {
  // ============================================
  // STATE
  // ============================================
  
  const [projectData, setProjectData] = useState(null);
  const [teamCount, setTeamCount] = useState(0);
  const [highPriorityRisks, setHighPriorityRisks] = useState(0);
  const [criticalIssues, setCriticalIssues] = useState(0);
  const [totalEffortHours, setTotalEffortHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [overviewResult, teamResult, highRiskResult, criticalIssueResult, effortResult] = await Promise.all([
        // Query 1: Project overview (includes milestone counts)
        supabase
          .from('vw_project_overview')
          .select('*')
          .eq('id', projectId)
          .single(),
        
        // Query 2: Team member count
        supabase
          .from('project_resources')
          .select('resource_id', { count: 'exact', head: true })
          .eq('project_id', projectId),
        
        // Query 3: High priority risks count
        supabase
          .from('risks')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', projectId)
          .in('priority', ['High', 'Critical'])
          .neq('status', 'Closed'),
        
        // Query 4: Critical issues count
        supabase
          .from('issues')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', projectId)
          .in('priority', ['High', 'Critical'])
          .neq('status', 'Closed'),
        
        // Query 5: Total effort from tasks (estimated_hours)
        supabase
          .from('tasks')
          .select('estimated_hours')
          .eq('project_id', projectId)
      ]);

      if (overviewResult.error) {
        console.error('Error fetching project overview:', overviewResult.error);
      }

      // Calculate total effort from tasks
      let totalHours = 0;
      if (effortResult.data && Array.isArray(effortResult.data)) {
        totalHours = effortResult.data.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
      }

      setProjectData(overviewResult.data);
      setTeamCount(teamResult.count || 0);
      setHighPriorityRisks(highRiskResult.count || 0);
      setCriticalIssues(criticalIssueResult.count || 0);
      setTotalEffortHours(totalHours);
      setLoading(false);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to load project data');
      setLoading(false);
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Get milestone counts from project data
   */
  const getMilestoneCount = () => projectData?.total_milestones || 0;
  const getCompletedMilestones = () => projectData?.completed_milestones || 0;
  const hasMilestones = () => getMilestoneCount() > 0;

  /**
   * Calculate completion percentage using simple milestone count
   * Formula: (completed_milestones / total_milestones) * 100
   */
  const getCompletionPercent = () => {
    const total = getMilestoneCount();
    const completed = getCompletedMilestones();
    
    if (total === 0) return 0;
    
    return Math.round((completed / total) * 100);
  };

  /**
   * Calculate days remaining until target end date
   */
  const getDaysRemaining = () => {
    if (!projectData?.end_date) return null;
    const endDate = new Date(projectData.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   * Calculate health status based on risks, issues, and milestone progress
   */
  const getHealthStatus = () => {
    const openRisks = projectData?.open_risks || 0;
    const openIssues = projectData?.open_issues || 0;
    const totalMilestones = getMilestoneCount();
    const completedMilestones = getCompletedMilestones();
    const inProgressMilestones = projectData?.in_progress_milestones || 0;
    
    // Check for critical issues
    if (openRisks > 5 || openIssues > 10 || criticalIssues > 3) {
      return { status: 'red', label: 'Critical' };
    }
    
    // Check for at-risk conditions
    if (openRisks > 3 || openIssues > 5 || highPriorityRisks > 2) {
      return { status: 'yellow', label: 'At Risk' };
    }
    
    // Check milestone progress if milestones exist
    if (totalMilestones > 0) {
      const completionPercent = getCompletionPercent();
      const overdueMilestones = totalMilestones - completedMilestones - inProgressMilestones;
      
      // If less than 50% complete and past halfway point, flag as at risk
      const daysRemaining = getDaysRemaining();
      if (completionPercent < 50 && daysRemaining !== null && daysRemaining < (daysRemaining + 30)) {
        return { status: 'yellow', label: 'At Risk' };
      }
    }
    
    return { status: 'green', label: 'On Track' };
  };

  /**
   * Calculate working days between two dates (excludes weekends)
   */
  const calculateWorkingDays = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) return 0;
    
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    if (amount == null) return '$0';
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const formatEffort = (hours) => {
    if (!hours || hours === 0) return '—';
    // Convert hours to man-days (8 hours = 1 man-day)
    const manDays = Math.round(hours / 8);
    return `${manDays} man-days`;
  };

  const getBudgetInfo = () => {
    const budget = projectData?.budget || 0;
    const spent = projectData?.actual_cost || 0;
    const remaining = Math.max(0, budget - spent);
    const percentSpent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
    const isOverBudget = spent > budget;
    const isLowBuffer = percentSpent > 85 && percentSpent <= 100;
    
    return { spent, remaining, percentSpent, isOverBudget, isLowBuffer };
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'green': return 'bg-green-100 text-green-800';
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      case 'red': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityClasses = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseClasses = (phase) => {
    switch (phase?.toLowerCase()) {
      case 'active':
      case 'executing':
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'planning':
      case 'initiation': return 'bg-purple-100 text-purple-800';
      case 'on hold':
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed':
      case 'closed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSizeClasses = (size) => {
    switch (size?.toLowerCase()) {
      case 'extra large':
      case 'xl': return 'bg-purple-100 text-purple-800';
      case 'large':
      case 'l': return 'bg-blue-100 text-blue-800';
      case 'medium':
      case 'm': return 'bg-cyan-100 text-cyan-800';
      case 'small':
      case 's': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // ============================================
  // RENDER STATES
  // ============================================

  if (!projectId) return null;

  if (loading) {
    return (
      <div className="space-y-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
          <div className="h-10 bg-gray-700"></div>
          <div className="p-6">
            <div className="flex gap-8">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="w-52">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="w-36 flex flex-col items-center">
                <div className="h-12 w-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-16 w-full bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
          <div className="h-10 bg-gray-700"></div>
          <div className="p-6">
            <div className="grid grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-6 mb-6">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6 mb-6">
        <p className="text-yellow-700 text-sm">Project data not found</p>
      </div>
    );
  }

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const healthStatus = getHealthStatus();
  const budgetInfo = getBudgetInfo();
  const workingDays = calculateWorkingDays(projectData.start_date, projectData.end_date);
  const completionPercent = getCompletionPercent();
  const daysRemaining = getDaysRemaining();

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="space-y-6 mb-6">
      {/* ============================================
          PANEL 1: PROJECT INFORMATION
          ============================================ */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Dark Header */}
        <div className="bg-gray-700 px-4 py-2.5">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
            Project Information
          </h3>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <div className="flex gap-8">
            {/* LEFT SIDE: Project Details */}
            <div className="flex-1 min-w-0">
              {/* Project Name */}
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {projectData.name}
              </h2>
              
              {/* Row 1: Sponsor & Manager */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span>
                  Project Sponsor: <span className="font-medium text-gray-900">
                    {projectData.sponsor_name || '—'}
                  </span>
                </span>
                <span className="text-gray-300">|</span>
                <span>
                  Project Manager: <span className="font-medium text-gray-900">
                    {projectData.manager_name || '—'}
                  </span>
                </span>
              </div>
              
              {/* Row 2: Program & Business Unit */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span>
                  Program: <span className="font-medium text-gray-900">
                    {projectData.program || '—'}
                  </span>
                </span>
                <span className="text-gray-300">|</span>
                <span>
                  Business Unit: <span className="font-medium text-gray-900">
                    {projectData.business_unit || '—'}
                  </span>
                </span>
              </div>
              
              {/* Row 3: Badges */}
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <span className="text-gray-600">
                  Phase: <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPhaseClasses(projectData.state)}`}>
                    {projectData.state || '—'}
                  </span>
                </span>
                
                <span className="text-gray-600">
                  Priority: <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityClasses(projectData.priority)}`}>
                    {projectData.priority || '—'}
                  </span>
                </span>
                
                <span className="text-gray-600">
                  Size: <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSizeClasses(projectData.size)}`}>
                    {projectData.size || '—'}
                  </span>
                </span>
                
                <span className="text-gray-600">
                  Status: <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusClasses(healthStatus.status)}`}>
                    {healthStatus.label}
                  </span>
                </span>
              </div>
            </div>
            
            {/* CENTER-RIGHT: Dates & Financials */}
            <div className="w-52 flex-shrink-0 border-l border-gray-100 pl-6">
              {/* Dates Section */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Start Date:</span>
                  <span className="font-medium text-gray-900">{formatDate(projectData.start_date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Target End:</span>
                  <span className="font-medium text-gray-900">{formatDate(projectData.end_date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium text-gray-900">
                    {workingDays !== null ? `${workingDays} days` : '—'}
                  </span>
                </div>
              </div>
              
              {/* Divider */}
              <div className="border-t border-gray-100 my-3"></div>
              
              {/* Financials Section */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Cost:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(projectData.budget)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Effort:</span>
                  <span className="font-medium text-gray-900">{formatEffort(totalEffortHours)}</span>
                </div>
              </div>
            </div>
            
            {/* FAR RIGHT: Completion % & Days Remaining */}
            <div className="w-36 flex-shrink-0 border-l border-gray-100 pl-6 flex flex-col items-center justify-center">
              {/* Completion Percentage */}
              <div className="text-center mb-4">
                <div className={`text-4xl font-bold ${
                  completionPercent >= 100 ? 'text-green-600' :
                  completionPercent >= 75 ? 'text-blue-600' :
                  completionPercent >= 50 ? 'text-cyan-600' :
                  completionPercent >= 25 ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {completionPercent}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Complete</div>
                {!hasMilestones() && (
                  <div className="text-xs text-amber-600 mt-1">⚠️ No milestones</div>
                )}
              </div>
              
              {/* Days Remaining */}
              {daysRemaining !== null && (
                <div className="text-center px-3 py-2 rounded-lg w-full bg-gray-50">
                  <div className="text-lg font-bold text-gray-900">
                    {daysRemaining < 0 ? Math.abs(daysRemaining) : daysRemaining}
                  </div>
                  <div className="text-xs text-gray-500">
                    {daysRemaining < 0 ? 'days overdue' :
                     daysRemaining === 0 ? 'Due today' :
                     daysRemaining === 1 ? 'day left' :
                     'days left'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          PANEL 2: PROJECT HEALTH SUMMARY
          ============================================ */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Dark Header */}
        <div className="bg-gray-700 px-4 py-2.5">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
            Project Health Summary
          </h3>
        </div>
        
        {/* Content - 6 Column Grid */}
        <div className="p-5">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {/* Spent */}
            <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(budgetInfo.spent)}
              </div>
              <div className="text-sm text-gray-500 mt-1">Spent</div>
              <div className={`text-xs mt-1 ${
                budgetInfo.isOverBudget ? 'text-red-600' :
                budgetInfo.isLowBuffer ? 'text-orange-600' :
                'text-green-600'
              }`}>
                {budgetInfo.percentSpent}% of budget
              </div>
            </div>
            
            {/* Remaining */}
            <div className={`rounded-lg p-4 text-center border ${
              budgetInfo.isOverBudget ? 'bg-red-50 border-red-200' :
              budgetInfo.isLowBuffer ? 'bg-orange-50 border-orange-200' :
              'bg-gray-50 border-gray-100'
            }`}>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(budgetInfo.remaining)}
              </div>
              <div className="text-sm text-gray-500 mt-1">Remaining</div>
              {budgetInfo.isOverBudget && (
                <div className="text-xs text-red-600 mt-1">⚠️ Over budget</div>
              )}
              {budgetInfo.isLowBuffer && !budgetInfo.isOverBudget && (
                <div className="text-xs text-orange-600 mt-1">⚠️ Low buffer</div>
              )}
              {!budgetInfo.isOverBudget && !budgetInfo.isLowBuffer && (
                <div className="text-xs text-green-600 mt-1">On track</div>
              )}
            </div>
            
            {/* Team Members */}
            <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">{teamCount}</div>
              <div className="text-sm text-gray-500 mt-1">Team Members</div>
              <div className="text-xs text-gray-400 mt-1">assigned</div>
            </div>
            
            {/* Open Risks */}
            <div className={`rounded-lg p-4 text-center border ${
              (projectData.open_risks || 0) > 3 ? 'bg-red-50 border-red-200' :
              (projectData.open_risks || 0) > 0 ? 'bg-yellow-50 border-yellow-200' :
              'bg-gray-50 border-gray-100'
            }`}>
              <div className="text-2xl font-bold text-gray-900">
                {projectData.open_risks ?? 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Open Risks</div>
              <div className={`text-xs mt-1 ${
                highPriorityRisks > 0 ? 'text-red-600' : 'text-gray-400'
              }`}>
                {highPriorityRisks > 0 ? `${highPriorityRisks} high priority` : 'none critical'}
              </div>
            </div>
            
            {/* Open Issues */}
            <div className={`rounded-lg p-4 text-center border ${
              (projectData.open_issues || 0) > 5 ? 'bg-red-50 border-red-200' :
              (projectData.open_issues || 0) > 0 ? 'bg-orange-50 border-orange-200' :
              'bg-gray-50 border-gray-100'
            }`}>
              <div className="text-2xl font-bold text-gray-900">
                {projectData.open_issues ?? 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Open Issues</div>
              <div className={`text-xs mt-1 ${
                criticalIssues > 0 ? 'text-red-600' : 'text-gray-400'
              }`}>
                {criticalIssues > 0 ? `${criticalIssues} critical` : 'none critical'}
              </div>
            </div>
            
            {/* Milestones */}
            <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">
                {getMilestoneCount()}
              </div>
              <div className="text-sm text-gray-500 mt-1">Milestones</div>
              <div className="text-xs text-gray-400 mt-1">
                {getCompletedMilestones()} completed
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSummary;
