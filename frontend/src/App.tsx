import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EmailAnalysis from './pages/EmailAnalysis';
import LifeBalance from './pages/LifeBalance';
import Memory from './pages/Memory';
import PasswordReset from './pages/PasswordReset';
import RequestPasswordReset from './pages/RequestPasswordReset';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/request-password-reset" element={<RequestPasswordReset />} />
          <Route path="/reset-password" element={<PasswordReset />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/email-analysis"
            element={
              <ProtectedRoute>
                <EmailAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/life-balance"
            element={
              <ProtectedRoute>
                <LifeBalance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/memory"
            element={
              <ProtectedRoute>
                <Memory />
              </ProtectedRoute>
            }
          />
          
          {/* Redirect root to dashboard or login */}
          <Route
            path="/"
            element={
              localStorage.getItem('access_token') ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App; 