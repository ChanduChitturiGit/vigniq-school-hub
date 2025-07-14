
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Schools from './pages/Schools';
import CreateSchool from './pages/CreateSchool';
import SchoolDetails from './pages/SchoolDetails';
import AddTeacher from './pages/AddTeacher';
import Teachers from './pages/Teachers';
import TeacherDetails from './pages/TeacherDetails';
import Classes from './pages/Classes';
import ClassDetails from './pages/ClassDetails';
import AddClass from './pages/AddClass';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import AddStudent from './pages/AddStudent';
import ManageStudents from './pages/ManageStudents';
import AddStudentTeacher from './pages/AddStudentTeacher';
import UserManagement from './pages/UserManagement';
import AdminSchool from './pages/AdminSchool';
import AdminAddTeacher from './pages/AdminAddTeacher';
import Support from './pages/Support';
import Requests from './pages/Requests';
import AdminRequests from './pages/AdminRequests';
import Responses from './pages/Responses';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/schools" element={
            <ProtectedRoute allowedRoles={['Super Admin']}>
              <Schools />
            </ProtectedRoute>
          } />
          
          <Route path="/create-school" element={
            <ProtectedRoute allowedRoles={['Super Admin']}>
              <CreateSchool />
            </ProtectedRoute>
          } />
          
          <Route path="/school-details/:id" element={
            <ProtectedRoute allowedRoles={['Super Admin']}>
              <SchoolDetails />
            </ProtectedRoute>
          } />
          
          <Route path="/add-teacher" element={
            <ProtectedRoute allowedRoles={['Super Admin']}>
              <AddTeacher />
            </ProtectedRoute>
          } />
          
          <Route path="/teachers" element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
              <Teachers />
            </ProtectedRoute>
          } />
          
          <Route path="/teacher-details/:id" element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
              <TeacherDetails />
            </ProtectedRoute>
          } />
          
          <Route path="/classes" element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Teacher']}>
              <Classes />
            </ProtectedRoute>
          } />
          
          <Route path="/class-details/:id" element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Teacher']}>
              <ClassDetails />
            </ProtectedRoute>
          } />
          
          <Route path="/add-class" element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
              <AddClass />
            </ProtectedRoute>
          } />
          
          <Route path="/students" element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Teacher']}>
              <Students />
            </ProtectedRoute>
          } />
          
          <Route path="/student-details/:id" element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Teacher']}>
              <StudentDetails />
            </ProtectedRoute>
          } />
          
          <Route path="/add-student" element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Teacher']}>
              <AddStudent />
            </ProtectedRoute>
          } />
          
          <Route path="/manage-students" element={
            <ProtectedRoute allowedRoles={['Teacher']}>
              <ManageStudents />
            </ProtectedRoute>
          } />
          
          <Route path="/add-student-teacher" element={
            <ProtectedRoute allowedRoles={['Teacher']}>
              <AddStudentTeacher />
            </ProtectedRoute>
          } />
          
          <Route path="/user-management" element={
            <ProtectedRoute allowedRoles={['Super Admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/admin-school" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminSchool />
            </ProtectedRoute>
          } />
          
          <Route path="/admin-add-teacher" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminAddTeacher />
            </ProtectedRoute>
          } />
          
          <Route path="/support" element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          } />
          
          <Route path="/requests" element={
            <ProtectedRoute allowedRoles={['Student', 'Teacher']}>
              <Requests />
            </ProtectedRoute>
          } />
          
          <Route path="/admin-requests" element={
            <ProtectedRoute allowedRoles={['Admin', 'Super Admin']}>
              <AdminRequests />
            </ProtectedRoute>
          } />
          
          <Route path="/responses" element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Teacher', 'Student']}>
              <Responses />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
