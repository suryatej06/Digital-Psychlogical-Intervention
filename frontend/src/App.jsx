import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import AssessmentHome from './pages/AssessmentHome';
import ResultsHistory from './pages/ResultsHistory';
import Resources from './pages/Resources';
import Community from './pages/Community';
import Chatbot from './pages/Chatbot';
import Bookings from './pages/Bookings';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <ErrorBoundary>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student + Counselor shared routes */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute allowedRoles={['student', 'counselor']}>
                <Bookings />
              </ProtectedRoute>
            }
          />

          {/* Student-only routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AssessmentHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment/:type"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Assessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ResultsHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Resources />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Community />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Chatbot />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}