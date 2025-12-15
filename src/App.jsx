import { RouterProvider } from 'react-router-dom';
import router from './router';

/**
 * APP ROOT COMPONENT
 * 
 * Sets up React Router for navigation throughout the application.
 * All routes are defined in router.jsx and wrapped with Layout (AppShell).
 */
function App() {
  return <RouterProvider router={router} />;
}

export default App;
