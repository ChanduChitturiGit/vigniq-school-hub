
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
import AdminSchool from './pages/AdminSchool';
import AdminRequests from './pages/AdminRequests';
import Classes from './pages/Classes';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import ManageStudents from './pages/ManageStudents';
import Support from './pages/Support';
import Requests from './pages/Requests';
import ClassDetails from './pages/ClassDetails';
import StudentDetails from './pages/StudentDetails';
import TeacherDetails from './pages/TeacherDetails';
import AddTeacher from './pages/AddTeacher';
import AddStudent from './pages/AddStudent';

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
            path="/teacher-details/:id"
            element={
              <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
                <TeacherDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-teacher"
            element={
              <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
                <AddTeacher />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-student"
            element={
              <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
                <AddStudent />
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
            path="/admin-school"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminSchool />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-requests"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/class-details/:id"
            element={
              <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
                <ClassDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-details/:id"
            element={
              <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Teacher']}>
                <StudentDetails />
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
