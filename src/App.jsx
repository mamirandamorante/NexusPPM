// Main App Component
// This is the root component that ties everything together

import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/Dashboard'

/**
 * App Component
 * 
 * This is the entry point of your application.
 * It wraps your pages in the DashboardLayout which provides:
 * - Header (top navigation)
 * - Sidebar (left navigation menu)
 * - Main content area (where pages are displayed)
 * 
 * As you add more pages (Projects, Resources, Tasks, etc.),
 * you would typically use a router here like React Router:
 * 
 * <DashboardLayout>
 *   <Routes>
 *     <Route path="/" element={<Dashboard />} />
 *     <Route path="/projects" element={<Projects />} />
 *     <Route path="/resources" element={<Resources />} />
 *   </Routes>
 * </DashboardLayout>
 * 
 * For now, we're just showing the Dashboard page.
 */
function App() {
  return (
    <DashboardLayout>
      {/* Dashboard is passed as "children" to DashboardLayout */}
      {/* DashboardLayout will render it in the main content area */}
      <Dashboard />
    </DashboardLayout>
  )
}

export default App
