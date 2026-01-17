import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import AdminParticipations from './pages/AdminParticipations';
import AdminVisites from './pages/AdminVisites';
import AdminSensibilisations from './pages/AdminSensibilisations';
import MedecinChefDashboard from './pages/MedecinChefDashboard';
import AdherantDashboard from './pages/AdherantDashboard';
import './styles/UnifiedStyle.css';

// Protected Route Component with Role Verification
function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token || !user.id) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== requiredRole && !(requiredRole === 'adherent' && (user.role === 'adherent' || user.role === 'adherant'))) {
    console.warn(`⚠️ Unauthorized access attempt - Required: ${requiredRole}, Got: ${user.role}`);
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Participations */}
        <Route
          path="/admin/participations"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminParticipations />
            </ProtectedRoute>
          }
        />

        {/* Admin Visites */}
        <Route
          path="/admin/visites"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminVisites />
            </ProtectedRoute>
          }
        />

        {/* Admin Sensibilisations */}
        <Route
          path="/admin/sensibilisations"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminSensibilisations />
            </ProtectedRoute>
          }
        />

        {/* Médecin Chef Dashboard */}
        <Route
          path="/medecin-chef"
          element={
            <ProtectedRoute requiredRole="medecin_chef">
              <MedecinChefDashboard />
            </ProtectedRoute>
          }
        />

        {/* Adhérant Dashboard */}
        <Route
          path="/adherent"
          element={
            <ProtectedRoute requiredRole="adherent">
              <AdherantDashboard />
            </ProtectedRoute>
          }
        />

        {/* Also support old route for backward compatibility */}
        <Route
          path="/adherant"
          element={
            <ProtectedRoute requiredRole="adherent">
              <AdherantDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
