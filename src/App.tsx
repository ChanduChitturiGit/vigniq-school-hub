import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './components/snackbar/SnackbarContext';
import Login from './pages/Login';
import Index from './pages/Index';
import Dashboard from './pages/dashboards/Dashboard';
import Profile from './pages/Profile';
import Schools from './pages/Schools';
import CreateSchool from './pages/CreateSchool';
import SchoolDetails from './pages/SchoolDetails';
import AdminSchool from './pages/AdminSchool';
import Classes from './pages/Classes';
import AddClass from './pages/AddClass';
import ClassDetails from './pages/ClassDetails';
import Teachers from './pages/Teachers';
import AdminAddTeacher from './pages/AdminAddTeacher';
import TeacherDetails from './pages/TeacherDetails';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import StudentDetails from './pages/StudentDetails';
import ManageStudents from './pages/ManageStudents';
import AddStudentTeacher from './pages/AddStudentTeacher';
import Grades from './pages/Grades';
import Syllabus from './pages/grades/Syllabus';
import GradesProgress from './pages/grades/GradesProgress';
import ViewLessonPlan from './pages/grades/ViewLessonPlan';
import CreateLessonPlan from './pages/grades/CreateLessonPlan';
import AIChatLessonPlan from './pages/grades/AIChatLessonPlan';
import DayLessonPlan from './pages/grades/DayLessonPlan';
import WhiteboardTeaching from './pages/grades/WhiteboardTeaching';
import Attendance from './pages/Attendance';
import AttendanceReports from './pages/AttendanceReports';
import UploadEbooks from './pages/UploadEbooks';
import ViewEbooks from './pages/ViewEbooks';
import Support from './pages/Support';
import AdminRequests from './pages/AdminRequests';
import Responses from './pages/Responses';
import Requests from './pages/Requests';
import UserManagement from './pages/UserManagement';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import ResetPassword from './pages/ResetPassword';

import Exams from './pages/Exams';
import CreateExam from './pages/CreateExam';
import ExamResults from './pages/ExamResults';

function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<ProtectedRoute><MainLayout><Index /></MainLayout></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
            <Route path="/schools" element={<ProtectedRoute><MainLayout><Schools /></MainLayout></ProtectedRoute>} />
            <Route path="/create-school" element={<ProtectedRoute><MainLayout><CreateSchool /></MainLayout></ProtectedRoute>} />
            <Route path="/school-details/:id" element={<ProtectedRoute><MainLayout><SchoolDetails /></MainLayout></ProtectedRoute>} />
            <Route path="/admin-school" element={<ProtectedRoute><MainLayout><AdminSchool /></MainLayout></ProtectedRoute>} />
            <Route path="/classes" element={<ProtectedRoute><MainLayout><Classes /></MainLayout></ProtectedRoute>} />
            <Route path="/add-class" element={<ProtectedRoute><MainLayout><AddClass /></MainLayout></ProtectedRoute>} />
            <Route path="/class-details/:id" element={<ProtectedRoute><MainLayout><ClassDetails /></MainLayout></ProtectedRoute>} />
            <Route path="/teachers" element={<ProtectedRoute><MainLayout><Teachers /></MainLayout></ProtectedRoute>} />
            <Route path="/admin-add-teacher" element={<ProtectedRoute><MainLayout><AdminAddTeacher /></MainLayout></ProtectedRoute>} />
            <Route path="/teacher-details/:id" element={<ProtectedRoute><MainLayout><TeacherDetails /></MainLayout></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><MainLayout><Students /></MainLayout></ProtectedRoute>} />
            <Route path="/add-student" element={<ProtectedRoute><MainLayout><AddStudent /></MainLayout></ProtectedRoute>} />
            <Route path="/student-details/:id" element={<ProtectedRoute><MainLayout><StudentDetails /></MainLayout></ProtectedRoute>} />
            <Route path="/manage-students" element={<ProtectedRoute><MainLayout><ManageStudents /></MainLayout></ProtectedRoute>} />
            <Route path="/add-student-teacher" element={<ProtectedRoute><MainLayout><AddStudentTeacher /></MainLayout></ProtectedRoute>} />
            <Route path="/grades" element={<ProtectedRoute><MainLayout><Grades /></MainLayout></ProtectedRoute>} />
            <Route path="/grades/syllabus/:subjectId" element={<ProtectedRoute><MainLayout><Syllabus /></MainLayout></ProtectedRoute>} />
            <Route path="/grades/progress/:subjectId" element={<ProtectedRoute><MainLayout><GradesProgress /></MainLayout></ProtectedRoute>} />
            <Route path="/grades/lesson-plan/:subjectId" element={<ProtectedRoute><MainLayout><ViewLessonPlan /></MainLayout></ProtectedRoute>} />
            <Route path="/create-lesson-plan/:subjectId" element={<ProtectedRoute><MainLayout><CreateLessonPlan /></MainLayout></ProtectedRoute>} />
            <Route path="/ai-chat-lesson-plan/:subjectId" element={<ProtectedRoute><MainLayout><AIChatLessonPlan /></MainLayout></ProtectedRoute>} />
            <Route path="/day-lesson-plan/:subjectId" element={<ProtectedRoute><MainLayout><DayLessonPlan /></MainLayout></ProtectedRoute>} />
            <Route path="/whiteboard-teaching/:subjectId" element={<ProtectedRoute><MainLayout><WhiteboardTeaching /></MainLayout></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><MainLayout><Attendance /></MainLayout></ProtectedRoute>} />
            <Route path="/attendance-reports" element={<ProtectedRoute><MainLayout><AttendanceReports /></MainLayout></ProtectedRoute>} />
            <Route path="/exams" element={<ProtectedRoute><MainLayout><Exams /></MainLayout></ProtectedRoute>} />
            <Route path="/create-exam" element={<ProtectedRoute><MainLayout><CreateExam /></MainLayout></ProtectedRoute>} />
            <Route path="/exam-results/:examId" element={<ProtectedRoute><MainLayout><ExamResults /></MainLayout></ProtectedRoute>} />
            <Route path="/upload-ebooks" element={<ProtectedRoute><MainLayout><UploadEbooks /></MainLayout></ProtectedRoute>} />
            <Route path="/view-ebooks" element={<ProtectedRoute><MainLayout><ViewEbooks /></MainLayout></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><MainLayout><Support /></MainLayout></ProtectedRoute>} />
            <Route path="/admin-requests" element={<ProtectedRoute><MainLayout><AdminRequests /></MainLayout></ProtectedRoute>} />
            <Route path="/responses" element={<ProtectedRoute><MainLayout><Responses /></MainLayout></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute><MainLayout><Requests /></MainLayout></ProtectedRoute>} />
            <Route path="/user-management" element={<ProtectedRoute><MainLayout><UserManagement /></MainLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
