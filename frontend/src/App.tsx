import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';
import Header from './components/Header';
import Footer from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { routes, ROUTES } from './routes/config';
import FullPageLayout from './components/FullPageLayout';

// Project configuration
const PROJECT_NAME = 'TeleBot';

// Main app container
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

// Layout with header and footer
const DefaultLayout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

function App() {
  return (
    <Router>
      <AppContainer>
        <GlobalStyles />
        <Routes>
          {routes.map((route) => {
            const isFullPage = route.path === ROUTES.SCENARIO || route.path === ROUTES.SCENARIO_DRAFT;
            const element = route.path === ROUTES.DASHBOARD ? (
              <ProtectedRoute>{route.element}</ProtectedRoute>
            ) : route.path === ROUTES.LOGIN || route.path === ROUTES.REGISTER ? (
              <ProtectedRoute requireAuth={false}>{route.element}</ProtectedRoute>
            ) : (
              route.element
            );

            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  isFullPage ? (
                    <FullPageLayout>{element}</FullPageLayout>
                  ) : (
                    <DefaultLayout>
                      <Header logoText={PROJECT_NAME} />
                      {element}
                      <Footer projectName={PROJECT_NAME} />
                    </DefaultLayout>
                  )
                }
              />
            );
          })}
        </Routes>
      </AppContainer>
    </Router>
  );
}

export default App;