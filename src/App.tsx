
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './components/snackbar/SnackbarContext';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Schools from './pages/Schools';
import SchoolDetails from './pages/SchoolDetails';
import CreateSchool from './pages/CreateSchool';
import Classes from './pages/Classes';
import ClassDetails from './pages/ClassDetails';
import AddClass from './pages/AddClass';
import Teachers from './pages/Teachers';
import TeacherDetails from './pages/TeacherDetails';
import AddTeacher from './pages/AddTeacher';
import AdminAddTeacher from './pages/AdminAddTeacher';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import AddStudent from './pages/AddStudent';
import ManageStudents from './pages/ManageStudents';
import Requests from './pages/Requests';
import AdminRequests from './pages/AdminRequests';
import Responses from './pages/Responses';
import Support from './pages/Support';
import UserManagement from './pages/UserManagement';
import AdminSchool from './pages/AdminSchool';
import AddStudentTeacher from './pages/AddStudentTeacher';
import NotFound from './pages/NotFound';
import UploadEbooks from './pages/UploadEbooks';
import ViewEbooks from './pages/ViewEbooks';

// Grades related pages
import Grades from './pages/Grades';
import Syllabus from './pages/Syllabus';
import GradesProgress from './pages/GradesProgress';
import CreateLessonPlan from './pages/CreateLessonPlan';
import ViewLessonPlan from './pages/ViewLessonPlan';
import DayLessonPlan from './pages/DayLessonPlan';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* School Management */}
            <Route path="/schools" element={<ProtectedRoute><Schools /></ProtectedRoute>} />
            <Route path="/schools/:id" element={<ProtectedRoute><SchoolDetails /></ProtectedRoute>} />
            <Route path="/schools/create" element={<ProtectedRoute><CreateSchool /></ProtectedRoute>} />
            <Route path="/admin/school" element={<ProtectedRoute><AdminSchool /></ProtectedRoute>} />
            
            {/* Class Management */}
            <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
            <Route path="/classes/:id" element={<ProtectedRoute><ClassDetails /></ProtectedRoute>} />
            <Route path="/classes/add" element={<ProtectedRoute><AddClass /></ProtectedRoute>} />
            
            {/* Teacher Management */}
            <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
            <Route path="/teachers/:id" element={<ProtectedRoute><TeacherDetails /></ProtectedRoute>} />
            <Route path="/teachers/add" element={<ProtectedRoute><AddTeacher /></ProtectedRoute>} />
            <Route path="/admin/teachers/add" element={<ProtectedRoute><AdminAddTeacher /></ProtectedRoute>} />
            
            {/* Student Management */}
            <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
            <Route path="/students/:id" element={<ProtectedRoute><StudentDetails /></ProtectedRoute>} />
            <Route path="/students/add" element={<ProtectedRoute><AddStudent /></ProtectedRoute>} />
            <Route path="/students/manage" element={<ProtectedRoute><ManageStudents /></ProtectedRoute>} />
            <Route path="/students-teachers/add" element={<ProtectedRoute><AddStudentTeacher /></ProtectedRoute>} />
            
            {/* Grades Management */}
            <Route path="/grades" element={<ProtectedRoute><Grades /></ProtectedRoute>} />
            <Route path="/grades/syllabus/:subjectId" element={<ProtectedRoute><Syllabus /></ProtectedRoute>} />
            <Route path="/grades/progress/:subjectId" element={<ProtectedRoute><GradesProgress /></ProtectedRoute>} />
            <Route path="/grades/lesson-plan/create/:chapterId" element={<ProtectedRoute><CreateLessonPlan /></ProtectedRoute>} />
            <Route path="/grades/lesson-plan/view/:chapterId/:lessonPlanId" element={<ProtectedRoute><ViewLessonPlan /></ProtectedRoute>} />
            <Route path="/grades/lesson-plan/day/:chapterId/:day" element={<ProtectedRoute><DayLessonPlan /></ProtectedRoute>} />
            
            {/* Request Management */}
            <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
            <Route path="/admin/requests" element={<ProtectedRoute><AdminRequests /></ProtectedRoute>} />
            <Route path="/responses" element={<ProtectedRoute><Responses /></ProtectedRoute>} />
            
            {/* Support and Admin */}
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
            
            {/* E-books */}
            <Route path="/ebooks/upload" element={<ProtectedRoute><UploadEbooks /></ProtectedRoute>} />
            <Route path="/ebooks/view" element={<ProtectedRoute><ViewEbooks /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
