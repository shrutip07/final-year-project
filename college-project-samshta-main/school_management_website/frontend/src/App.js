import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/Dashboard';
import PrincipalDashboard from './pages/principal/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherOnboarding from './pages/teacher/Onboarding';
import PrincipalOnboarding from './pages/principal/Onboarding';
import PrincipalProfile from './pages/principal/Profile';
import PrincipalTeachers from './pages/principal/Teachers';
import Students from './pages/principal/Students';
import Tables from './pages/admin/Tables';
import { jwtDecode } from "jwt-decode";
import TeacherProfile from './pages/teacher/Profile';
import PrincipalStudents from './pages/principal/Students';
import TeacherStudents from './pages/teacher/Students';

// Add these imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Enhanced ProtectedRoute: checks token and optionally role
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;
  if (role) {
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== role) return <Navigate to="/" replace />;
    } catch {
      return <Navigate to="/" replace />;
    }
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Login/Signup page */}
        <Route path="/" element={<LoginPage />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/tables" element={
          <ProtectedRoute role="admin">
            <Tables />
          </ProtectedRoute>
        } />
        <Route 
          path="/admin/tables/:unitId" 
          element={
            <ProtectedRoute role="admin">
              <Tables />
            </ProtectedRoute>
          } 
        />

        {/* Teacher Dashboard */}
        <Route path="/teacher" element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/teacher/onboarding" element={
          <ProtectedRoute role="teacher">
            <TeacherOnboarding />
          </ProtectedRoute>
        } />
        <Route 
          path="/teacher/profile" 
          element={
            <ProtectedRoute role="teacher">
              <TeacherProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/students" 
          element={
            <ProtectedRoute role="teacher">
              <TeacherStudents />
            </ProtectedRoute>
          } 
        />

        {/* Principal Dashboard */}
        <Route path="/principal" element={
          <ProtectedRoute role="principal">
            <PrincipalDashboard />
          </ProtectedRoute>
        } />
        <Route path="/principal/onboarding" element={
          <ProtectedRoute role="principal">
            <PrincipalOnboarding />
          </ProtectedRoute>
        } />
        <Route path="/principal/profile" element={
          <ProtectedRoute role="principal">
            <PrincipalProfile />
          </ProtectedRoute>
        } />
        <Route path="/principal/teachers" element={
          <ProtectedRoute role="principal">
            <PrincipalTeachers />
          </ProtectedRoute>
        } />
        <Route 
          path="/principal/students" 
          element={
            <ProtectedRoute role="principal">
              <PrincipalStudents />
            </ProtectedRoute>
          } 
        />

        {/* Fallback to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
