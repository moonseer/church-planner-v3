import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';

// Store
import { store } from './store';

// Theme
import theme from './theme';

// Layout Components
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Churches from './pages/churches/Churches';
import ChurchDetails from './pages/churches/ChurchDetails';
import Events from './pages/events/Events';
import EventDetails from './pages/events/EventDetails';
import Teams from './pages/teams/Teams';
import TeamDetails from './pages/teams/TeamDetails';
import Schedule from './pages/schedule/Schedule';
import Profile from './pages/profile/Profile';
import Settings from './pages/settings/Settings';
import NotFound from './pages/NotFound';

// Auth Guards
import PrivateRoute from './components/auth/PrivateRoute';
import PublicRoute from './components/auth/PublicRoute';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            </Route>

            {/* Main App Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              
              {/* Churches */}
              <Route path="/churches" element={<PrivateRoute><Churches /></PrivateRoute>} />
              <Route path="/churches/:id" element={<PrivateRoute><ChurchDetails /></PrivateRoute>} />
              
              {/* Events */}
              <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
              <Route path="/events/:id" element={<PrivateRoute><EventDetails /></PrivateRoute>} />
              
              {/* Teams */}
              <Route path="/teams" element={<PrivateRoute><Teams /></PrivateRoute>} />
              <Route path="/teams/:id" element={<PrivateRoute><TeamDetails /></PrivateRoute>} />
              
              {/* Schedule */}
              <Route path="/schedule" element={<PrivateRoute><Schedule /></PrivateRoute>} />
              
              {/* User */}
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            </Route>

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App; 