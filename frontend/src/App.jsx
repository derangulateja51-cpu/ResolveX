import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import ReportComplaint from './pages/ReportComplaint';
import ComplaintDetail from './pages/ComplaintDetail';
import ComplaintHistory from './pages/ComplaintHistory';
import KnownIssues from './pages/KnownIssues';
import AdminDashboard from './pages/AdminDashboard';
import AdminComplaintManagement from './pages/AdminComplaintManagement';
import AdminResolutionInterface from './pages/AdminResolutionInterface';
import GrievancePortal from './pages/GrievancePortal';

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirect based on authentication & role */}
          <Route
            path="/"
            element={
              !isAuthenticated ? (
                <Navigate to="/login" replace />
              ) : role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : role === 'grievance_officer' ? (
                <Navigate to="/grievance" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* Protected Student Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin', 'grievance_officer']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin', 'grievance_officer']}>
                <ReportComplaint />
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaints/:id"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin', 'grievance_officer']}>
                <ComplaintDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin', 'grievance_officer']}>
                <ComplaintHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/known-issues"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin', 'grievance_officer']}>
                <KnownIssues />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminComplaintManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/complaints/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminResolutionInterface />
              </ProtectedRoute>
            }
          />

          {/* Protected Grievance Officer Route */}
          <Route
            path="/grievance"
            element={
              <ProtectedRoute allowedRoles={['grievance_officer']}>
                <GrievancePortal />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
