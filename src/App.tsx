
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from './components/ui/sonner';

// Page imports
import Index from './pages/Index';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Requests from './pages/Requests';
import Responses from './pages/Responses';
import Support from './pages/Support';
import UserManagement from './pages/UserManagement';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import AddStudentTeacher from './pages/AddStudentTeacher';
import StudentDetails from './pages/StudentDetails';
import Teachers from './pages/Teachers';
import AddTeacher from './pages/AddTeacher';
import TeacherDetails from './pages/TeacherDetails';
import Classes from './pages/Classes';
import ClassDetails from './pages/ClassDetails';
import Schools from './pages/Schools';
import SchoolDetails from './pages/SchoolDetails';
import CreateSchool from './pages/CreateSchool';
import AdminSchool from './pages/AdminSchool';
import AdminAddTeacher from './pages/AdminAddTeacher';
import AdminRequests from './pages/AdminRequests';
import ManageStudents from './pages/ManageStudents';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    //testing git.
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ProtectedRoute><ResetPassword /></ProtectedRoute>} />
              
              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
              <Route path="/responses" element={<ProtectedRoute><Responses /></ProtectedRoute>} />
              <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
              
              {/* User Management Routes */}
              <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
              <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
              <Route path="/add-student" element={<ProtectedRoute><AddStudent /></ProtectedRoute>} />
              <Route path="/add-student-teacher" element={<ProtectedRoute><AddStudentTeacher /></ProtectedRoute>} />
              <Route path="/student-details/:id" element={<ProtectedRoute><StudentDetails /></ProtectedRoute>} />
              <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
              <Route path="/add-teacher" element={<ProtectedRoute><AddTeacher /></ProtectedRoute>} />
              <Route path="/teacher-details/:id" element={<ProtectedRoute><TeacherDetails /></ProtectedRoute>} />
              
              {/* Class Management Routes */}
              <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
              <Route path="/class-details/:id" element={<ProtectedRoute><ClassDetails /></ProtectedRoute>} />
              
              {/* School Management Routes */}
              <Route path="/schools" element={<ProtectedRoute><Schools /></ProtectedRoute>} />
              <Route path="/school-details/:id" element={<ProtectedRoute><SchoolDetails /></ProtectedRoute>} />
              <Route path="/create-school" element={<ProtectedRoute><CreateSchool /></ProtectedRoute>} />
              <Route path="/admin-school" element={<ProtectedRoute><AdminSchool /></ProtectedRoute>} />
              <Route path="/admin-add-teacher" element={<ProtectedRoute><AdminAddTeacher /></ProtectedRoute>} />
              <Route path="/admin-requests" element={<ProtectedRoute><AdminRequests /></ProtectedRoute>} />
              <Route path="/manage-students" element={<ProtectedRoute><ManageStudents /></ProtectedRoute>} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
