
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './components/snackbar/SnackbarContext';
import Login from './pages/Login';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
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
import Syllabus from './pages/Syllabus';
import GradesProgress from './pages/GradesProgress';
import ViewLessonPlan from './pages/ViewLessonPlan';
import CreateLessonPlan from './pages/CreateLessonPlan';
import AIChatLessonPlan from './pages/AIChatLessonPlan';
import DayLessonPlan from './pages/DayLessonPlan';
import WhiteboardTeaching from './pages/WhiteboardTeaching';
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
            <Route path="/" element={<ProtectedRoute><MainLayout pageTitle="Dashboard"><Index /></MainLayout></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><MainLayout pageTitle="Dashboard"><Dashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><MainLayout pageTitle="Profile"><Profile /></MainLayout></ProtectedRoute>} />
            <Route path="/schools" element={<ProtectedRoute><MainLayout pageTitle="Schools"><Schools /></MainLayout></ProtectedRoute>} />
            <Route path="/create-school" element={<ProtectedRoute><MainLayout pageTitle="Create School"><CreateSchool /></MainLayout></ProtectedRoute>} />
            <Route path="/school-details/:id" element={<ProtectedRoute><MainLayout pageTitle="School Details"><SchoolDetails /></MainLayout></ProtectedRoute>} />
            <Route path="/admin-school" element={<ProtectedRoute><MainLayout pageTitle="Admin School"><AdminSchool /></MainLayout></ProtectedRoute>} />
            <Route path="/classes" element={<ProtectedRoute><MainLayout pageTitle="Classes"><Classes /></MainLayout></ProtectedRoute>} />
            <Route path="/add-class" element={<ProtectedRoute><MainLayout pageTitle="Add Class"><AddClass /></MainLayout></ProtectedRoute>} />
            <Route path="/class-details/:id" element={<ProtectedRoute><MainLayout pageTitle="Class Details"><ClassDetails /></MainLayout></ProtectedRoute>} />
            <Route path="/teachers" element={<ProtectedRoute><MainLayout pageTitle="Teachers"><Teachers /></MainLayout></ProtectedRoute>} />
            <Route path="/admin-add-teacher" element={<ProtectedRoute><MainLayout pageTitle="Add Teacher"><AdminAddTeacher /></MainLayout></ProtectedRoute>} />
            <Route path="/teacher-details/:id" element={<ProtectedRoute><MainLayout pageTitle="Teacher Details"><TeacherDetails /></MainLayout></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><MainLayout pageTitle="Students"><Students /></MainLayout></ProtectedRoute>} />
            <Route path="/add-student" element={<ProtectedRoute><MainLayout pageTitle="Add Student"><AddStudent /></MainLayout></ProtectedRoute>} />
            <Route path="/student-details/:id" element={<ProtectedRoute><MainLayout pageTitle="Student Details"><StudentDetails /></MainLayout></ProtectedRoute>} />
            <Route path="/manage-students" element={<ProtectedRoute><MainLayout pageTitle="Manage Students"><ManageStudents /></MainLayout></ProtectedRoute>} />
            <Route path="/add-student-teacher" element={<ProtectedRoute><MainLayout pageTitle="Add Student Teacher"><AddStudentTeacher /></MainLayout></ProtectedRoute>} />
            <Route path="/grades" element={<ProtectedRoute><MainLayout pageTitle="Grades"><Grades /></MainLayout></ProtectedRoute>} />
            <Route path="/grades/syllabus/:subjectId" element={<ProtectedRoute><MainLayout pageTitle="Syllabus"><Syllabus /></MainLayout></ProtectedRoute>} />
            <Route path="/grades/progress/:subjectId" element={<ProtectedRoute><MainLayout pageTitle="Progress"><GradesProgress /></MainLayout></ProtectedRoute>} />
            <Route path="/grades/lesson-plan/:subjectId" element={<ProtectedRoute><MainLayout pageTitle="Lesson Plan"><ViewLessonPlan /></MainLayout></ProtectedRoute>} />
            <Route path="/create-lesson-plan/:subjectId" element={<ProtectedRoute><MainLayout pageTitle="Create Lesson Plan"><CreateLessonPlan /></MainLayout></ProtectedRoute>} />
            <Route path="/ai-chat-lesson-plan/:subjectId" element={<ProtectedRoute><MainLayout pageTitle="AI Chat Lesson Plan"><AIChatLessonPlan /></MainLayout></ProtectedRoute>} />
            <Route path="/day-lesson-plan/:subjectId" element={<ProtectedRoute><MainLayout pageTitle="Day Lesson Plan"><DayLessonPlan /></MainLayout></ProtectedRoute>} />
            <Route path="/whiteboard-teaching/:subjectId" element={<ProtectedRoute><MainLayout pageTitle="Whiteboard Teaching"><WhiteboardTeaching /></MainLayout></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><MainLayout pageTitle="Attendance"><Attendance /></MainLayout></ProtectedRoute>} />
            <Route path="/attendance-reports" element={<ProtectedRoute><MainLayout pageTitle="Attendance Reports"><AttendanceReports /></MainLayout></ProtectedRoute>} />
            <Route path="/exams" element={<ProtectedRoute><MainLayout pageTitle="Exams"><Exams /></MainLayout></ProtectedRoute>} />
            <Route path="/create-exam" element={<ProtectedRoute><MainLayout pageTitle="Create Exam"><CreateExam /></MainLayout></ProtectedRoute>} />
            <Route path="/exam-results/:examId" element={<ProtectedRoute><MainLayout pageTitle="Exam Results"><ExamResults /></MainLayout></ProtectedRoute>} />
            <Route path="/upload-ebooks" element={<ProtectedRoute><MainLayout pageTitle="Upload Ebooks"><UploadEbooks /></MainLayout></ProtectedRoute>} />
            <Route path="/view-ebooks" element={<ProtectedRoute><MainLayout pageTitle="View Ebooks"><ViewEbooks /></MainLayout></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><MainLayout pageTitle="Support"><Support /></MainLayout></ProtectedRoute>} />
            <Route path="/admin-requests" element={<ProtectedRoute><MainLayout pageTitle="Admin Requests"><AdminRequests /></MainLayout></ProtectedRoute>} />
            <Route path="/responses" element={<ProtectedRoute><MainLayout pageTitle="Responses"><Responses /></MainLayout></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute><MainLayout pageTitle="Requests"><Requests /></MainLayout></ProtectedRoute>} />
            <Route path="/user-management" element={<ProtectedRoute><MainLayout pageTitle="User Management"><UserManagement /></MainLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
