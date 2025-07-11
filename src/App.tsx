
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import Schools from './pages/Schools';
import SchoolDetails from './pages/SchoolDetails';
import CreateSchool from './pages/CreateSchool';
import Teachers from './pages/Teachers';
import TeacherDetails from './pages/TeacherDetails';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import Classes from './pages/Classes';
import ClassDetails from './pages/ClassDetails';
import AddStudent from './pages/AddStudent';
import AddTeacher from './pages/AddTeacher';
import AdminAddTeacher from './pages/AdminAddTeacher';
import AddStudentTeacher from './pages/AddStudentTeacher';
import ManageStudents from './pages/ManageStudents';
import Requests from './pages/Requests';
import AdminRequests from './pages/AdminRequests';
import Responses from './pages/Responses';
import Support from './pages/Support';
import NotFound from './pages/NotFound';
import AdminSchool from './pages/AdminSchool';
import AddClass from './pages/AddClass';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
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
            
            {/* Super Admin & Admin routes */}
            <Route path="/user-management" element={
              <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/schools" element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <Schools />
              </ProtectedRoute>
            } />
            
            <Route path="/school-details/:id" element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <SchoolDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/create-school" element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <CreateSchool />
              </ProtectedRoute>
            } />
            
            <Route path="/teachers" element={
              <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
                <Teachers />
              </ProtectedRoute>
            } />
            
            <Route path="/teacher-details/:id" element={
              <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Teacher']}>
                <TeacherDetails />
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
            
            <Route path="/classes" element={
              <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
                <Classes />
              </ProtectedRoute>
            } />
            
            <Route path="/class-details/:id" element={
              <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Teacher']}>
                <ClassDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/add-student" element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <AddStudent />
              </ProtectedRoute>
            } />
            
            <Route path="/add-teacher" element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <AddTeacher />
              </ProtectedRoute>
            } />
            
            <Route path="/admin-add-teacher" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminAddTeacher />
              </ProtectedRoute>
            } />
            
            <Route path="/add-student-teacher" element={
              <ProtectedRoute allowedRoles={['Admin', 'Teacher']}>
                <AddStudentTeacher />
              </ProtectedRoute>
            } />
            
            <Route path="/manage-students" element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <ManageStudents />
              </ProtectedRoute>
            } />
            
            <Route path="/requests" element={
              <ProtectedRoute allowedRoles={['Teacher', 'Student']}>
                <Requests />
              </ProtectedRoute>
            } />
            
            <Route path="/admin-requests" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminRequests />
              </ProtectedRoute>
            } />
            
            <Route path="/responses" element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <Responses />
              </ProtectedRoute>
            } />
            
            <Route path="/support" element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            } />
            
            <Route path="/admin-school" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminSchool />
              </ProtectedRoute>
            } />
            
            <Route path="/add-class" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AddClass />
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
