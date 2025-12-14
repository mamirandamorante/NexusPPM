import ProjectDashboard from './pages/ProjectDashboard/ProjectDashboard';

/**
 * APP ROOT COMPONENT
 * 
 * Currently renders the ProjectDashboard as the main view.
 * 
 * TODO: In the future, add React Router for navigation between:
 * - Dashboard (executive overview)
 * - ProjectDashboard (single project view)
 * - Portfolios, Programs, etc.
 */
function App() {
  return <ProjectDashboard />;
}

export default App;
