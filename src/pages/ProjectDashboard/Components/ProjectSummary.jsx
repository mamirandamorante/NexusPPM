import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

/**
 * PROJECT SUMMARY COMPONENT
 * 
 * PURPOSE:
 * Displays the executive summary card for a selected project.
 * Shows key project information at a glance.
 * 
 * DATA SOURCES:
 * 1. vw_project_overview - Project details with manager name, task counts, etc.
 * 2. vw_project_evm_metrics - EVM calculations for completion % and health status
 * 
 * PROPS:
 * - projectId: UUID of the selected project
 * 
 * COMPLETION % CALCULATION:
 * Uses milestone-weighted Earned Value (EV) from vw_project_evm_metrics.
 * This is the industry-standard EVM approach where each milestone has a weight
 * representing its proportion of total project effort.
 * 
 * OVERALL STATUS (HEALTH) CALCULATION:
 * Based on EVM performance indices:
 * - 🟢 Green (On Track): CPI >= 0.95 AND SPI >= 0.95
 * - 🟡 Yellow (At Risk): CPI >= 0.85 AND SPI >= 0.85 (but not green)
 * - 🔴 Red (Critical): CPI < 0.85 OR SPI < 0.85
 */

const ProjectSummary = ({ projectId }) => {
  // ============================================
  // STATE
  // ============================================
  
  // Project overview data (name, manager, dates, etc.)
  const [projectData, setProjectData] = useState(null);
  
  // EVM metrics for completion % and health calculation
  const [evmData, setEvmData] = useState(null);
  
  // Loading and error states
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
      // PARALLEL QUERIES for better performance
      // Fetch project overview and EVM metrics at the same time
      const [overviewResult, evmResult] = await Promise.all([
        // Query 1: Project overview (includes manager name via the view)
        supabase
          .from('vw_project_overview')
          .select('*')
          .eq('id', projectId)
          .single(),
        
        // Query 2: EVM metrics for completion % and health
        supabase
          .from('vw_project_evm_metrics')
          .select('*')
          .eq('project_id', projectId)
          .single()
      ]);

      // Handle errors from either query
      if (overviewResult.error) {
        console.error('Error fetching project overview:', overviewResult.error);
        // Don't fail completely - we might still have partial data
      }

      if (evmResult.error) {
        console.error('Error fetching EVM metrics:', evmResult.error);
        // EVM data might not exist if no milestones are set up
      }

      setProjectData(overviewResult.data);
      setEvmData(evmResult.data);
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
   * Get milestone count for display
   */
  const getMilestoneCount = () => {
    return evmData?.total_milestones || 0;
  };

  /**
   * Check if project has milestones set up
   */
  const hasMilestones = () => {
    return getMilestoneCount() > 0;
  };

  /**
   * Calculate the completion percentage using EVM ONLY
   * 
   * This enforces proper project management discipline:
   * - Every project MUST have milestones with weights
   * - Completion is calculated from milestone achievements
   * - No manual override / subjective estimates
   * 
   * If a project has no milestones, it shows 0% with a warning
   * to encourage the PM to set up proper milestone tracking.
   * 
   * Note: percent_complete comes from the view as a string (e.g., "25.00")
   * so we need to parse it as a float
   */
  const getCompletionPercent = () => {
    // Only use EVM calculation - no fallback to manual progress
    if (evmData?.percent_complete != null) {
      const evmPercent = parseFloat(evmData.percent_complete);
      if (!isNaN(evmPercent)) {
        return Math.round(evmPercent);
      }
    }
    
    // No milestones or no EVM data = 0%
    return 0;
  };

  /**
   * Calculate overall health status based on EVM indices
   * Returns: { status: 'green'|'yellow'|'red', label: string }
   */
  const getHealthStatus = () => {
    // If no EVM data, try to infer from other factors
    if (!evmData) {
      // Check if project has open high-priority risks/issues
      const hasProblems = (projectData?.open_risks || 0) > 3 || 
                          (projectData?.open_issues || 0) > 5;
      
      if (hasProblems) {
        return { status: 'yellow', label: 'At Risk' };
      }
      return { status: 'green', label: 'On Track' };
    }

    // Get CPI and SPI from EVM data
    const cpi = evmData.cost_performance_index_cpi || 1;
    const spi = evmData.schedule_performance_index_spi || 1;

    // Apply health rules
    if (cpi >= 0.95 && spi >= 0.95) {
      return { status: 'green', label: 'On Track' };
    } else if (cpi >= 0.85 && spi >= 0.85) {
      return { status: 'yellow', label: 'At Risk' };
    } else {
      return { status: 'red', label: 'Critical' };
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  /**
   * Get status color classes
   */
  const getStatusClasses = (status) => {
    switch (status) {
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get priority badge classes
   */
  const getPriorityClasses = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get phase (lifecycle state) badge classes
   */
  const getPhaseClasses = (phase) => {
    switch (phase?.toLowerCase()) {
      case 'active':
      case 'executing':
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
      case 'initiation':
        return 'bg-purple-100 text-purple-800';
      case 'on hold':
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ============================================
  // RENDER STATES
  // ============================================

  // No project selected
  if (!projectId) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="grid grid-cols-4 gap-6">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-6 mb-6">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  // No data found
  if (!projectData) {
    return (
      <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6 mb-6">
        <p className="text-yellow-700 text-sm">Project data not found</p>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  const completionPercent = getCompletionPercent();
  const healthStatus = getHealthStatus();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      {/* 
        HEADER SECTION
        Project name, key metadata, and completion percentage
      */}
      <div className="flex items-start justify-between">
        {/* Left side: Project name and metadata */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {projectData.name}
          </h2>
          
          {/* Metadata row with labels */}
          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
            {/* Project Manager */}
            <span>
              PM: <span className="font-medium text-gray-900">
                {projectData.manager_name || '—'}
              </span>
            </span>
            
            <span className="text-gray-300">|</span>
            
            {/* Sponsor - Placeholder until field is added */}
            <span>
              Sponsor: <span className="font-medium text-gray-900">
                {projectData.sponsor_name || '—'}
              </span>
            </span>
            
            <span className="text-gray-300">|</span>
            
            {/* Phase (Lifecycle State) */}
            <span>
              Phase: <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPhaseClasses(projectData.state)}`}>
                {projectData.state || '—'}
              </span>
            </span>
            
            <span className="text-gray-300">|</span>
            
            {/* Priority */}
            <span>
              Priority: <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityClasses(projectData.priority)}`}>
                {projectData.priority || '—'}
              </span>
            </span>
            
            <span className="text-gray-300">|</span>
            
            {/* Overall Project Status (Health) */}
            <span>
              Overall Status: <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusClasses(healthStatus.status)}`}>
                {healthStatus.label}
              </span>
            </span>
          </div>
        </div>
        
        {/* Right side: Completion percentage */}
        <div className="text-right">
          <div className="text-4xl font-bold text-gray-900">
            {completionPercent}%
          </div>
          <div className="text-sm text-gray-500">Complete</div>
          {/* Warning if no milestones */}
          {!hasMilestones() && (
            <div className="text-xs text-amber-600 mt-1 flex items-center justify-end gap-1">
              <span>⚠️</span>
              <span>No milestones defined</span>
            </div>
          )}
        </div>
      </div>
      
      {/* 
        DETAILS GRID
        Key project information in a clean grid layout
      */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-6 pt-6 border-t border-gray-100">
        {/* Business Unit */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Business Unit</div>
          <div className="text-sm font-medium text-gray-900">
            {projectData.business_unit || '—'}
          </div>
        </div>
        
        {/* Size */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Size</div>
          <div className="text-sm font-medium text-gray-900">
            {projectData.size || '—'}
          </div>
        </div>
        
        {/* Start Date */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Start Date</div>
          <div className="text-sm font-medium text-gray-900">
            {formatDate(projectData.start_date)}
          </div>
        </div>
        
        {/* Target End Date */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Target End</div>
          <div className="text-sm font-medium text-gray-900">
            {formatDate(projectData.end_date)}
          </div>
        </div>
        
        {/* Open Risks */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Open Risks</div>
          <div className="text-sm font-medium text-gray-900">
            {projectData.open_risks ?? '—'}
          </div>
        </div>
        
        {/* Open Issues */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Open Issues</div>
          <div className="text-sm font-medium text-gray-900">
            {projectData.open_issues ?? '—'}
          </div>
        </div>
      </div>
      
      {/* 
        EVM INDICATORS (if available)
        Shows CPI and SPI when EVM data exists
        
        Note: We use explicit boolean check (!= null) to avoid React rendering "0"
        when both values are 0. The expression `condition && <Component/>` will
        render the condition's value if it's falsy but not null/undefined.
      */}
      {evmData && (evmData.cost_performance_index_cpi != null || evmData.schedule_performance_index_spi != null) && (
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
          {/* CPI Indicator */}
          {evmData.cost_performance_index_cpi != null && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">CPI:</span>
              <span className={`text-sm font-semibold ${
                evmData.cost_performance_index_cpi >= 0.95 ? 'text-green-600' :
                evmData.cost_performance_index_cpi >= 0.85 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {evmData.cost_performance_index_cpi.toFixed(2)}
              </span>
            </div>
          )}
          
          {/* SPI Indicator */}
          {evmData.schedule_performance_index_spi != null && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">SPI:</span>
              <span className={`text-sm font-semibold ${
                evmData.schedule_performance_index_spi >= 0.95 ? 'text-green-600' :
                evmData.schedule_performance_index_spi >= 0.85 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {evmData.schedule_performance_index_spi.toFixed(2)}
              </span>
            </div>
          )}
          
          {/* Last Updated */}
          <div className="ml-auto text-xs text-gray-400">
            Updated: {formatDate(projectData.updated_at)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSummary;

