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
import EpicList from './pages/Projects/WorkItems/EpicList';
import EpicDetail from './pages/Projects/WorkItems/EpicDetail';
import FeatureList from './pages/Projects/WorkItems/FeatureList';
import FeatureDetail from './pages/Projects/WorkItems/FeatureDetail';
import UserStoryList from './pages/Projects/WorkItems/UserStoryList';
import UserStoryDetail from './pages/Projects/WorkItems/UserStoryDetail';
import TaskList from './pages/Projects/WorkItems/TaskList';
import TaskDetail from './pages/Projects/WorkItems/TaskDetail';
import SprintList from './pages/Projects/Sprints/SprintList';
import SprintDetail from './pages/Projects/Sprints/SprintDetail';
import SprintBoard from './pages/Projects/Sprints/SprintBoard';
import SprintRetrospective from './pages/Projects/Sprints/SprintRetrospective';
import SprintVelocity from './pages/Projects/Sprints/SprintVelocity';

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
        path: '/projects/:id/epics',
        element: <EpicList />,
      },
      {
        path: '/projects/:id/epics/:epicId',
        element: <EpicDetail />,
      },
      {
        path: '/projects/:id/features',
        element: <FeatureList />,
      },
      {
        path: '/projects/:id/epics/:epicId/features',
        element: <FeatureList />,
      },
      {
        path: '/projects/:id/features/:featureId',
        element: <FeatureDetail />,
      },
      {
        path: '/projects/:id/user-stories',
        element: <UserStoryList />,
      },
      {
        path: '/projects/:id/features/:featureId/user-stories',
        element: <UserStoryList />,
      },
      {
        path: '/projects/:id/user-stories/:userStoryId',
        element: <UserStoryDetail />,
      },
      {
        path: '/projects/:id/tasks',
        element: <TaskList />,
      },
      {
        path: '/projects/:id/user-stories/:userStoryId/tasks',
        element: <TaskList />,
      },
      {
        path: '/projects/:id/tasks/:taskId',
        element: <TaskDetail />,
      },
      {
        path: '/projects/:id/sprints',
        element: <SprintList />,
      },
      {
        path: '/projects/:id/sprints/:sprintId',
        element: <SprintDetail />,
      },
      {
        path: '/projects/:id/sprints/:sprintId/board',
        element: <SprintBoard />,
      },
      {
        path: '/projects/:id/sprints/:sprintId/retrospective',
        element: <SprintRetrospective />,
      },
      {
        path: '/projects/:id/sprints/:sprintId/velocity',
        element: <SprintVelocity />,
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

