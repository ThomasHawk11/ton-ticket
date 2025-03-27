import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';
import MyTicketsPage from './pages/MyTicketsPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminEventFormPage from './pages/admin/AdminEventFormPage';
import AdminTicketsPage from './pages/admin/AdminTicketsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminStatsPage from './pages/admin/AdminStatsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRoles.length > 0 && (!user.role || !requiredRoles.includes(user.role))) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:eventId" element={<EventDetailsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        
        <Route 
          path="profile" 
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="my-tickets" 
          element={
            <ProtectedRoute>
              <MyTicketsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="tickets/:ticketId" 
          element={
            <ProtectedRoute>
              <TicketDetailsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route path="admin" element={<ProtectedRoute requiredRoles={['admin', 'organizer']}><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="admin/events" element={<ProtectedRoute requiredRoles={['admin', 'organizer']}><AdminEventsPage /></ProtectedRoute>} />
        <Route path="admin/events/new" element={<ProtectedRoute requiredRoles={['admin', 'organizer']}><AdminEventFormPage /></ProtectedRoute>} />
        <Route path="admin/events/:eventId/edit" element={<ProtectedRoute requiredRoles={['admin', 'organizer']}><AdminEventFormPage /></ProtectedRoute>} />
        <Route path="admin/tickets" element={<ProtectedRoute requiredRoles={['admin', 'organizer']}><AdminTicketsPage /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute requiredRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="admin/stats" element={<ProtectedRoute requiredRoles={['admin']}><AdminStatsPage /></ProtectedRoute>} />
        <Route path="admin/settings" element={<ProtectedRoute requiredRoles={['admin']}><AdminSettingsPage /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;

