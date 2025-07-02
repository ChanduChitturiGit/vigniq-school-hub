import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AdminSchool from './pages/AdminSchool';
import AddSchool from './pages/AddSchool';
import SchoolDetails from './pages/SchoolDetails';
import EditSchool from './pages/EditSchool';
import UserManagement from './pages/UserManagement';
import AddStudent from './pages/AddStudent';
import AddTeacher from './pages/AddTeacher';
import EditStudent from './pages/EditStudent';
import EditTeacher from './pages/EditTeacher';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import AddStudentTeacher from './pages/AddStudentTeacher';
import AdminAddTeacher from './pages/AdminAddTeacher';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin-school" element={<ProtectedRoute><AdminSchool /></ProtectedRoute>} />
            <Route path="/add-school" element={<ProtectedRoute><AddSchool /></ProtectedRoute>} />
            <Route path="/school-details/:id" element={<ProtectedRoute><SchoolDetails /></ProtectedRoute>} />
            <Route path="/edit-school/:id" element={<ProtectedRoute><EditSchool /></ProtectedRoute>} />
            <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
            <Route path="/add-student" element={<ProtectedRoute><AddStudent /></ProtectedRoute>} />
            <Route path="/add-teacher" element={<ProtectedRoute><AddTeacher /></ProtectedRoute>} />
            <Route path="/edit-student/:id" element={<ProtectedRoute><EditStudent /></ProtectedRoute>} />
            <Route path="/edit-teacher/:id" element={<ProtectedRoute><EditTeacher /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
            <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
            <Route path="/add-student-teacher" element={<ProtectedRoute><AddStudentTeacher /></ProtectedRoute>} />
            <Route path="/admin-add-teacher" element={<ProtectedRoute><AdminAddTeacher /></ProtectedRoute>} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
