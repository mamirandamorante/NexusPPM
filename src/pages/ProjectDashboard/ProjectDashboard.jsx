import { useState, useCallback, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import AppShell from '../../components/AppShell';
import ProjectSelector from './ProjectSelector';
import ProjectSummary from './Components/ProjectSummary';

/**
 * PROJECT DASHBOARD PAGE
 * 
 * PURPOSE:
 * This is the main Project Dashboard page that displays detailed information
 * about a single selected project. It follows the Portavia clean design style.
 * 
 * STRUCTURE:
 * 1. Project Selector dropdown - allows user to switch between projects
 * 2. Refresh button - manually refresh data
 * 3. Project details sections (to be added in future steps)
 * 
 * STATE MANAGEMENT:
 * - selectedProjectId: The ID of the currently selected project
 * - isRefreshing: Boolean to show refresh animation
 * 
 * DESIGN PHILOSOPHY (from mockup):
 * - White is the default - minimal color usage
 * - Simple cards with subtle shadows
 * - Clean typography hierarchy
 * - Lots of breathing room (white space)
 */

const ProjectDashboard = () => {
  // ============================================
  // STATE
  // ============================================
  
  // Currently selected project ID - passed to child components
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  
  // Refresh state - controls the spinning animation on refresh button
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Refresh key - incrementing this forces child components to re-fetch data
  const [refreshKey, setRefreshKey] = useState(0);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Handle project selection change
   * 
   * Called when user selects a different project from the dropdown.
   * This will eventually trigger loading of all project data.
   * 
   * @param {string} projectId - The UUID of the selected project
   */
  const handleProjectChange = useCallback((projectId) => {
    console.log('Project selected:', projectId);
    setSelectedProjectId(projectId);
    
    // TODO: In future steps, this will trigger fetching:
    // - Project details (executive summary)
    // - Health status
    // - EVM metrics
    // - Financial data
    // - Risks & Issues
    // - Milestones
    // - Timeline data
  }, []);

  /**
   * Handle refresh button click
   * 
   * Refreshes all project data by incrementing the refreshKey.
   * Child components that use refreshKey as a dependency will re-fetch.
   */
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return; // Prevent double-clicks
    
    console.log('Refreshing project data...');
    setIsRefreshing(true);
    
    // Increment refresh key to trigger re-fetch in child components
    setRefreshKey(prev => prev + 1);
    
    // Brief delay to show the animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setIsRefreshing(false);
    console.log('Refresh complete');
  }, [isRefreshing]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <AppShell breadcrumbs={['Projects', 'Project Dashboard']}>
      {/* 
        PAGE HEADER
        Clean, minimal header matching the Portavia design
      */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Project Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Real-time project performance monitoring
        </p>
      </div>

      {/* 
        PROJECT SELECTOR SECTION
        
        Layout explanation:
        - Flex container with gap-3 for spacing
        - ProjectSelector takes most width (flex-1)
        - Refresh button is fixed width on the right
        
        This matches the mockup design exactly.
      */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          {/* 
            PROJECT DROPDOWN
            
            The ProjectSelector component handles:
            - Fetching projects from Supabase
            - Displaying loading/error states
            - Rendering the dropdown with all project names
            
            Props:
            - selectedProjectId: Current selection (for controlled component)
            - onProjectChange: Callback when user selects a project
          */}
          <div className="flex-1">
            <ProjectSelector
              selectedProjectId={selectedProjectId}
              onProjectChange={handleProjectChange}
            />
          </div>

          {/* 
            REFRESH BUTTON
            
            Styling notes (from mockup):
            - White background with gray border
            - Same height as dropdown (py-2.5)
            - Icon + text with gap
            - Hover state changes background to light gray
            - When refreshing, icon spins (animate-spin)
          */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw 
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
            />
            Refresh
          </button>
        </div>
      </div>

      {/* 
        DASHBOARD CONTENT
        
        Shows when a project is selected:
        - Project Summary card (executive overview)
        - More sections will be added in future steps:
          - Health Status, EVM Metrics, Financial Overview (3-column grid)
          - Risks & Issues, Milestones (2-column grid)
          - Project Timeline (Gantt chart)
      */}
      {selectedProjectId ? (
        <>
          {/* 
            PROJECT SUMMARY CARD
            Shows key project info: name, PM, sponsor, dates, completion %, status
            The key prop with refreshKey forces a re-render when refresh is clicked
          */}
          <ProjectSummary 
            key={refreshKey} 
            projectId={selectedProjectId} 
          />
          
          {/* 
            PLACEHOLDER FOR ADDITIONAL SECTIONS
            Will be replaced with actual components in future steps
          */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 border-dashed p-8 text-center">
            <p className="text-gray-400 text-sm">
              Additional dashboard sections coming soon...
            </p>
            <p className="text-gray-300 text-xs mt-1">
              Health Status • EVM Metrics • Financials • Risks • Milestones • Timeline
            </p>
          </div>
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-sm">
            Select a project to view its dashboard
          </p>
        </div>
      )}
    </AppShell>
  );
};

export default ProjectDashboard;

