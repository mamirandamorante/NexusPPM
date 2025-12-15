import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import ProjectList from './pages/Projects/ProjectList';
import ProjectDashboard from './pages/ProjectDashboard/ProjectDashboard';
import PortfolioList from './pages/Portfolios/PortfolioList';
import ProgramList from './pages/Programs/ProgramList';
import ResourceList from './pages/Resources/ResourceList';
import ResourceDetail from './pages/Resources/ResourceDetail';
import ResourceRates from './pages/Resources/ResourceRates';
import ResourceAvailability from './pages/Resources/ResourceAvailability';
import TimesheetList from './pages/Timesheets/TimesheetList';
import Reports from './pages/Reports/Reports';
import RisksIssues from './pages/RisksIssues/RisksIssues';
import Milestones from './pages/Milestones/Milestones';

/**
 * ROUTER CONFIGURATION
 * 
 * Defines all routes for the PPM application.
 * All routes are wrapped in Layout component which provides AppShell.
 */

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/projects',
        element: <ProjectList />,
      },
      {
        path: '/projects/:id',
        element: <ProjectDashboard />,
      },
      {
        path: '/portfolios',
        element: <PortfolioList />,
      },
      {
        path: '/programs',
        element: <ProgramList />,
      },
      {
        path: '/resources',
        element: <ResourceList />,
      },
      {
        path: '/resources/:id',
        element: <ResourceDetail />,
      },
      {
        path: '/resources/rates',
        element: <ResourceRates />,
      },
      {
        path: '/resources/:id/availability',
        element: <ResourceAvailability />,
      },
      {
        path: '/timesheets',
        element: <TimesheetList />,
      },
      {
        path: '/reports',
        element: <Reports />,
      },
      {
        path: '/risks',
        element: <RisksIssues />,
      },
      {
        path: '/milestones',
        element: <Milestones />,
      },
    ],
  },
]);

export default router;

