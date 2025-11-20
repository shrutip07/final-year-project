
// Force logout: clear token on every app load/page refresh
localStorage.removeItem("token");

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';

import Assistant from "./components/Assistant";

import AdminDashboard from './pages/admin/Dashboard';
import PrincipalDashboard from './pages/principal/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherOnboarding from './pages/teacher/Onboarding';
import PrincipalOnboarding from './pages/principal/Onboarding';
import TeacherProfile from './pages/teacher/Profile';
import PrincipalProfile from './pages/principal/Profile';
import PrincipalTeachers from './pages/principal/Teachers';
import PrincipalStudents from './pages/principal/Students';
import TeacherStudents from './pages/teacher/Students';
import Charts from './pages/teacher/Charts';
import Tables from './pages/admin/Tables';
import PrincipalNotificationsPage from "./pages/principal/PrincipalNotificationsPage";
import TeacherNotificationsPage from "./pages/teacher/TeacherNotificationsPage";
import AdminNotificationsPage from "./pages/AdminNotificationsPage";
import FormResponsePage from './pages/FormResponsePage';
import { jwtDecode } from "jwt-decode";
import Report from './pages/admin/Report';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


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
        {/* Admin */}
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
        <Route path="/admin/tables/:unitId" element={
          <ProtectedRoute role="admin">
            <Tables />
          </ProtectedRoute>
        } />
        <Route path="/admin/notifications" element={
          <ProtectedRoute role="admin">
            <AdminNotificationsPage />
          </ProtectedRoute>
        } />

        {/* Principal */}
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
        <Route path="/principal/students" element={
          <ProtectedRoute role="principal">
            <PrincipalStudents />
          </ProtectedRoute>
        } />
        <Route path="/principal/notifications" element={
          <ProtectedRoute role="principal">
            <PrincipalNotificationsPage />
          </ProtectedRoute>
        } />
        {/* NEW Admin Report Route */}
        <Route path="/admin/report" element={
        <ProtectedRoute role="admin">
        <Report />
        </ProtectedRoute>
        } />

        {/* Teacher */}
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
        <Route path="/teacher/profile" element={
          <ProtectedRoute role="teacher">
            <TeacherProfile />
          </ProtectedRoute>
        } />
        <Route path="/teacher/students" element={
          <ProtectedRoute role="teacher">
            <TeacherStudents />
          </ProtectedRoute>
        } />
        <Route path="/teacher/charts" element={
          <ProtectedRoute role="teacher">
            <Charts />
          </ProtectedRoute>
        } />
        <Route path="/teacher/notifications" element={
          <ProtectedRoute role="teacher">
            <TeacherNotificationsPage />
          </ProtectedRoute>
        } />

        {/* Standalone Form */}
        <Route path="/forms/:formId" element={
          <ProtectedRoute>
            <FormResponsePage />
          </ProtectedRoute>
        } />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Chat Assistant mounted globally so it's available on every page */}
      
      <Assistant />
    </Router>
  );
}

export default App;
