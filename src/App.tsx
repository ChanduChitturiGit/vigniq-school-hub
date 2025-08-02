import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './components/snackbar/SnackbarContext';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Schools from './pages/Schools';
import SchoolDetails from './pages/SchoolDetails';
import CreateSchool from './pages/CreateSchool';
import AdminSchool from './pages/AdminSchool';
import Classes from './pages/Classes';
import AddClass from './pages/AddClass';
import ClassDetails from './pages/ClassDetails';
import Teachers from './pages/Teachers';
import AddTeacher from './pages/AddTeacher';
import AdminAddTeacher from './pages/AdminAddTeacher';
import TeacherDetails from './pages/TeacherDetails';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import StudentDetails from './pages/StudentDetails';
import ManageStudents from './pages/ManageStudents';
import AddStudentTeacher from './pages/AddStudentTeacher';
import UserManagement from './pages/UserManagement';
import Requests from './pages/Requests';
import AdminRequests from './pages/AdminRequests';
import Responses from './pages/Responses';
import Support from './pages/Support';
import NotFound from './pages/NotFound';
import Grades from './pages/Grades';
import Syllabus from './pages/Syllabus';
import ViewEbooks from './pages/ViewEbooks';
import UploadEbooks from './pages/UploadEbooks';
import CreateLessonPlan from './pages/CreateLessonPlan';
import ViewLessonPlan from './pages/ViewLessonPlan';
import DayLessonPlan from './pages/DayLessonPlan';
import GradesProgress from './pages/GradesProgress';
import AIChatLessonPlan from './pages/AIChatLessonPlan';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            <Route path="/schools" element={<ProtectedRoute><Schools /></ProtectedRoute>} />
            <Route path="/schools/:schoolId" element={<ProtectedRoute><SchoolDetails /></ProtectedRoute>} />
            <Route path="/schools/create" element={<ProtectedRoute><CreateSchool /></ProtectedRoute>} />
            <Route path="/admin/school" element={<ProtectedRoute><AdminSchool /></ProtectedRoute>} />
            
            <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
            <Route path="/classes/add" element={<ProtectedRoute><AddClass /></ProtectedRoute>} />
            <Route path="/classes/:classId" element={<ProtectedRoute><ClassDetails /></ProtectedRoute>} />
            
            <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
            <Route path="/teachers/add" element={<ProtectedRoute><AddTeacher /></ProtectedRoute>} />
            <Route path="/admin/teachers/add" element={<ProtectedRoute><AdminAddTeacher /></ProtectedRoute>} />
            <Route path="/teachers/:teacherId" element={<ProtectedRoute><TeacherDetails /></ProtectedRoute>} />
            
            <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
            <Route path="/students/add" element={<ProtectedRoute><AddStudent /></ProtectedRoute>} />
            <Route path="/students/:studentId" element={<ProtectedRoute><StudentDetails /></ProtectedRoute>} />
            <Route path="/students/manage" element={<ProtectedRoute><ManageStudents /></ProtectedRoute>} />
            <Route path="/student-teacher/add" element={<ProtectedRoute><AddStudentTeacher /></ProtectedRoute>} />
            
            <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
            <Route path="/admin/requests" element={<ProtectedRoute><AdminRequests /></ProtectedRoute>} />
            <Route path="/responses" element={<ProtectedRoute><Responses /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            
            <Route path="/grades" element={<ProtectedRoute><Grades /></ProtectedRoute>} />
            <Route path="/grades/syllabus/:subjectId" element={<ProtectedRoute><Syllabus /></ProtectedRoute>} />
            <Route path="/grades/progress/:subjectId" element={<ProtectedRoute><GradesProgress /></ProtectedRoute>} />
            <Route path="/view-ebooks" element={<ProtectedRoute><ViewEbooks /></ProtectedRoute>} />
            <Route path="/upload-ebooks" element={<ProtectedRoute><UploadEbooks /></ProtectedRoute>} />
            <Route path="/grades/lesson-plan/create/:chapterId" element={<ProtectedRoute><CreateLessonPlan /></ProtectedRoute>} />
            <Route path="/grades/lesson-plan/view/:chapterId/:lessonPlanId" element={<ProtectedRoute><ViewLessonPlan /></ProtectedRoute>} />
            <Route path="/grades/lesson-plan/day/:chapterId/:day" element={<ProtectedRoute><DayLessonPlan /></ProtectedRoute>} />
            <Route path="/grades/lesson-plan/ai-chat/:chapterId/:day" element={<ProtectedRoute><AIChatLessonPlan /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
