import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

/**
 * PROJECT SELECTOR COMPONENT
 * 
 * PURPOSE:
 * - Displays a dropdown list of all active projects
 * - Shows only the project name (no status or completion %)
 * - Allows user to select a project
 * - Notifies parent component when selection changes
 * 
 * HOW IT WORKS:
 * 1. On component mount, fetch all projects from database
 * 2. Display projects in a clean dropdown
 * 3. When user selects a project, trigger onChange callback
 * 4. Parent component can then load data for selected project
 */

const ProjectSelector = ({ selectedProjectId, onProjectChange }) => {
  // STATE MANAGEMENT
  // - projects: Array of all projects from database
  // - loading: Boolean to show loading state while fetching
  // - error: String to display if fetch fails
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * FETCH PROJECTS FROM DATABASE
   * 
   * This function runs when component first loads
   * It queries Supabase to get all active projects
   */
  useEffect(() => {
    fetchProjects();
  }, []); // Empty dependency array = run once on mount

  const fetchProjects = async () => {
    try {
      // SUPABASE QUERY EXPLANATION:
      // - Select from 'projects' table
      // - Only get id and name columns (we don't need other data)
      // - Filter where status is NOT 'Closed' (only show active projects)
      // - Order alphabetically by name for easy finding
      //
      // NOTE: Your database uses 'id' and 'name' columns (not 'project_id' and 'project_name')
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .neq('status', 'Closed')  // neq = "not equal to"
        .order('name', { ascending: true });

      // ERROR HANDLING
      // Log the full error object to help with debugging
      if (error) {
        console.error('Error fetching projects:', error);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        
        // Show a more helpful error message to the user
        const errorMessage = error.message || 'Failed to load projects';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // SUCCESS - store projects in state
      setProjects(data || []);
      setLoading(false);

      // AUTO-SELECT FIRST PROJECT
      // If no project is selected yet and we have projects, select the first one
      if (!selectedProjectId && data && data.length > 0) {
        onProjectChange(data[0].id);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  /**
   * HANDLE DROPDOWN CHANGE
   * 
   * When user selects a different project from dropdown:
   * 1. Get the new project_id from the event
   * 2. Call the parent's onProjectChange function
   * 3. Parent will then fetch data for the new project
   */
  const handleChange = (event) => {
    const newProjectId = event.target.value;
    onProjectChange(newProjectId);
  };

  /**
   * LOADING STATE
   * Show a simple loading message while fetching projects
   * Note: No wrapper margin - parent component controls layout
   */
  if (loading) {
    return (
      <div className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-500">
        Loading projects...
      </div>
    );
  }

  /**
   * ERROR STATE
   * Show error message if fetch failed
   */
  if (error) {
    return (
      <div className="px-4 py-2.5 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700">
        {error}
      </div>
    );
  }

  /**
   * EMPTY STATE
   * Show message if no projects exist
   */
  if (projects.length === 0) {
    return (
      <div className="px-4 py-2.5 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-700">
        No active projects found. Create a project to get started.
      </div>
    );
  }

  /**
   * MAIN RENDER
   * Clean dropdown following Portavia design principles:
   * - White background
   * - Simple border
   * - No fancy styling
   * - Just the project name, nothing else
   * 
   * Note: No wrapper div - this component returns just the select element
   * so parent can control layout (flex container with refresh button)
   */
  return (
    <select
      value={selectedProjectId || ''}
      onChange={handleChange}
      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
    >
      {/* DEFAULT OPTION - shown when no selection */}
      {!selectedProjectId && (
        <option value="">Select a project...</option>
      )}
      
      {/* MAP THROUGH PROJECTS - create an option for each project */}
      {projects.map((project) => (
        <option key={project.id} value={project.id}>
          {project.name}
        </option>
      ))}
    </select>
  );
};

export default ProjectSelector;
