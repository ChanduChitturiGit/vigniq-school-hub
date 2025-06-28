import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import Schools from './pages/Schools';
import SchoolDetails from './pages/SchoolDetails';
import CreateSchool from './pages/CreateSchool';
import Classes from './pages/Classes';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import ManageStudents from './pages/ManageStudents';
import Support from './pages/Support';
import Requests from './pages/Requests';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schools"
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <Schools />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school-details/:id"
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <SchoolDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-school"
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <CreateSchool />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Teacher']}>
                <Classes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Teachers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Teacher']}>
                <Students />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-students"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ManageStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <Requests />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
