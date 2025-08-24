
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './components/snackbar/SnackbarContext';
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Schools from './pages/Schools';
import CreateSchool from './pages/CreateSchool';
import SchoolDetails from './pages/SchoolDetails';
import AdminSchool from './pages/AdminSchool';
import Classes from './pages/Classes';
import ClassDetails from './pages/ClassDetails';
import AddClass from './pages/AddClass';
import Teachers from './pages/Teachers';
import TeacherDetails from './pages/TeacherDetails';
import AdminAddTeacher from './pages/AdminAddTeacher';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import ManageStudents from './pages/ManageStudents';
import AddStudent from './pages/AddStudent';
import AddStudentTeacher from './pages/AddStudentTeacher';
import Profile from './pages/Profile';
import ViewEbooks from './pages/ViewEbooks';
import UploadEbooks from './pages/UploadEbooks';
import Syllabus from './pages/Syllabus';
import Grades from './pages/Grades';
import GradesProgress from './pages/GradesProgress';
import CreateLessonPlan from './pages/CreateLessonPlan';
import AIChatLessonPlan from './pages/AIChatLessonPlan';
import DayLessonPlan from './pages/DayLessonPlan';
import ViewLessonPlan from './pages/ViewLessonPlan';
import WhiteboardTeaching from './pages/WhiteboardTeaching';
import Support from './pages/Support';
import Requests from './pages/Requests';
import AdminRequests from './pages/AdminRequests';
import Responses from './pages/Responses';
import UserManagement from './pages/UserManagement';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import Attendance from './pages/Attendance';
import AttendanceReports from './pages/AttendanceReports';

function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Super Admin Routes */}
                <Route path="/schools" element={<Schools />} />
                <Route path="/create-school" element={<CreateSchool />} />
                <Route path="/school/:id" element={<SchoolDetails />} />
                <Route path="/upload-ebooks" element={<UploadEbooks />} />
                
                {/* Admin Routes */}
                <Route path="/admin-school" element={<AdminSchool />} />
                
                {/* Common Routes for Admin & Teacher */}
                <Route path="/classes" element={<Classes />} />
                <Route path="/class/:id" element={<ClassDetails />} />
                <Route path="/add-class" element={<AddClass />} />
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/teacher/:id" element={<TeacherDetails />} />
                <Route path="/add-teacher" element={<AdminAddTeacher />} />
                <Route path="/students" element={<Students />} />
                <Route path="/student/:id" element={<StudentDetails />} />
                <Route path="/manage-students" element={<ManageStudents />} />
                <Route path="/add-student" element={<AddStudent />} />
                <Route path="/add-student-teacher" element={<AddStudentTeacher />} />
                <Route path="/view-ebooks" element={<ViewEbooks />} />
                
                {/* Teacher Routes */}
                <Route path="/grades" element={<Grades />} />
                <Route path="/grades/syllabus/:subjectId" element={<Syllabus />} />
                <Route path="/grades/progress/:subjectId" element={<GradesProgress />} />
                <Route path="/create-lesson-plan" element={<CreateLessonPlan />} />
                <Route path="/ai-chat-lesson-plan" element={<AIChatLessonPlan />} />
                <Route path="/day-lesson-plan" element={<DayLessonPlan />} />
                <Route path="/view-lesson-plan" element={<ViewLessonPlan />} />
                <Route path="/whiteboard-teaching" element={<WhiteboardTeaching />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/attendance/reports" element={<AttendanceReports />} />
                
                {/* Profile */}
                <Route path="/profile" element={<Profile />} />
                
                {/* Support Routes */}
                <Route path="/support" element={<Support />} />
                <Route path="/requests" element={<Requests />} />
                <Route path="/admin-requests" element={<AdminRequests />} />
                <Route path="/responses" element={<Responses />} />
                
                {/* User Management */}
                <Route path="/user-management" element={<UserManagement />} />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <Toaster />
          </div>
        </Router>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
