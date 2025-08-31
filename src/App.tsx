import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './components/snackbar/SnackbarContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Index from './pages/Index';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Schools from './pages/Schools';
import SchoolDetails from './pages/SchoolDetails';
import CreateSchool from './pages/CreateSchool';
import AdminSchool from './pages/AdminSchool';
import Teachers from './pages/Teachers';
import TeacherDetails from './pages/TeacherDetails';
import AdminAddTeacher from './pages/AdminAddTeacher';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import AddStudent from './pages/AddStudent';
import ManageStudents from './pages/ManageStudents';
import AddStudentTeacher from './pages/AddStudentTeacher';
import Classes from './pages/Classes';
import ClassDetails from './pages/ClassDetails';
import AddClass from './pages/AddClass';
import Syllabus from './pages/Syllabus';
import GradesProgress from './pages/GradesProgress';
import ViewLessonPlan from './pages/ViewLessonPlan';
import CreateLessonPlan from './pages/CreateLessonPlan';
import AIChatLessonPlan from './pages/AIChatLessonPlan';
import DayLessonPlan from './pages/DayLessonPlan';
import WhiteboardTeaching from './pages/WhiteboardTeaching';
import Attendance from './pages/Attendance';
import AttendanceReports from './pages/AttendanceReports';
import Grades from './pages/Grades';
import ViewEbooks from './pages/ViewEbooks';
import UploadEbooks from './pages/UploadEbooks';
import UserManagement from './pages/UserManagement';
import Responses from './pages/Responses';
import Support from './pages/Support';
import Requests from './pages/Requests';
import SupportDetails from './pages/SupportDetails';
import AdminRequests from './pages/AdminRequests';
import Exams from './pages/Exams';
import CreateExam from './pages/CreateExam';
import ExamResults from './pages/ExamResults';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <SnackbarProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Index />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Dashboard">
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Profile">
                    <Profile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/schools"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Schools">
                    <Schools />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/schools/:schoolId"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="School Details">
                    <SchoolDetails />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-school"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Create School">
                    <CreateSchool />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-school"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Admin School">
                    <AdminSchool />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Teachers">
                    <Teachers />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers/:teacherId"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Teacher Details">
                    <TeacherDetails />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-add-teacher"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Admin Add Teacher">
                    <AdminAddTeacher />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Students">
                    <Students />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/:studentId"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Student Details">
                    <StudentDetails />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-student"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Add Student">
                    <AddStudent />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-students"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Manage Students">
                    <ManageStudents />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-student-teacher"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Add Student Teacher">
                    <AddStudentTeacher />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Classes">
                    <Classes />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes/:classId"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Class Details">
                    <ClassDetails />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-class"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Add Class">
                    <AddClass />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/syllabus"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Syllabus">
                    <Syllabus />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/grades-progress"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Grades Progress">
                    <GradesProgress />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-lesson-plan"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="View Lesson Plan">
                    <ViewLessonPlan />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-lesson-plan"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Create Lesson Plan">
                    <CreateLessonPlan />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-chat-lesson-plan"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="AI Chat Lesson Plan">
                    <AIChatLessonPlan />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/day-lesson-plan"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Day Lesson Plan">
                    <DayLessonPlan />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/whiteboard-teaching"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Whiteboard Teaching">
                    <WhiteboardTeaching />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Attendance">
                    <Attendance />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance-reports"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Attendance Reports">
                    <AttendanceReports />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/grades"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Grades">
                    <Grades />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-ebooks"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="View Ebooks">
                    <ViewEbooks />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload-ebooks"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Upload Ebooks">
                    <UploadEbooks />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-management"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="User Management">
                    <UserManagement />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/responses"
              element={
                <ProtectedRoute>
                  <MainLayout pageTitle="Responses">
                    <Responses />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/support" element={<MainLayout pageTitle="Support"><Support /></MainLayout>} />
            <Route path="/requests" element={<MainLayout pageTitle="Requests"><Requests /></MainLayout>} />
            <Route path="/support-details/:requestId" element={<SupportDetails />} />
            <Route path="/admin-requests" element={<MainLayout pageTitle="Admin Requests"><AdminRequests /></MainLayout>} />
            <Route path="/exams" element={<MainLayout pageTitle="Exams"><Exams /></MainLayout>} />
            <Route path="/create-exam" element={<MainLayout pageTitle="Create Exam"><CreateExam /></MainLayout>} />
             <Route path="/exam-results" element={<MainLayout pageTitle="Exam Results"><ExamResults /></MainLayout>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </SnackbarProvider>
  );
}

export default App;
