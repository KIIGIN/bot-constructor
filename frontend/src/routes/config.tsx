import { RouteObject } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import CollectedDataPage from '../pages/CollectedDataPage';
import ScenarioPage from '../pages/ScenarioPage';
import ScenarioDraftPage from '../pages/ScenarioDraftPage';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SCENARIO_DATA: '/scenario/:scenarioId/data',
  SCENARIO: '/scenario/:scenarioId',
  SCENARIO_DRAFT: '/scenario/:scenarioId/edit',
} as const;

export const routes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <HomePage />,
  },
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.REGISTER,
    element: <RegisterPage />,
  },
  {
    path: ROUTES.DASHBOARD,
    element: <DashboardPage />,
  },
  {
    path: ROUTES.SCENARIO_DATA,
    element: <CollectedDataPage />,
  },
  {
    path: ROUTES.SCENARIO,
    element: <ScenarioPage />,
  },
  {
    path: ROUTES.SCENARIO_DRAFT,
    element: <ScenarioDraftPage />,
  },
]; 