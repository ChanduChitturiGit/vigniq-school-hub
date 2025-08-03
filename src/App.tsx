import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './components/snackbar/SnackbarContext';
import ProtectedRoute from './components/ProtectedRoute';

// importing all the pages here
import Index from './pages/Index';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Schools from './pages/Schools';
import SchoolDetails from './pages/SchoolDetails';
import CreateSchool from './pages/CreateSchool';
import Teachers from './pages/Teachers';
import TeacherDetails from './pages/TeacherDetails';
import AdminAddTeacher from './pages/AdminAddTeacher';
import AddStudentTeacher from './pages/AddStudentTeacher';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import ManageStudents from './pages/ManageStudents';
import AddStudent from './pages/AddStudent';
import Classes from './pages/Classes';
import ClassDetails from './pages/ClassDetails';
import AddClass from './pages/AddClass';
import Grades from './pages/Grades';
import Syllabus from './pages/Syllabus';
import CreateLessonPlan from './pages/CreateLessonPlan';
import ViewLessonPlan from './pages/ViewLessonPlan';
import DayLessonPlan from './pages/DayLessonPlan';
import AIChatLessonPlan from './pages/AIChatLessonPlan';
import WhiteboardTeaching from './pages/WhiteboardTeaching';
import GradesProgress from './pages/GradesProgress';
import Requests from './pages/Requests';
import AdminRequests from './pages/AdminRequests';
import Responses from './pages/Responses';
import Support from './pages/Support';
import UserManagement from './pages/UserManagement';
import AdminSchool from './pages/AdminSchool';
import UploadEbooks from './pages/UploadEbooks';
import ViewEbooks from './pages/ViewEbooks';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SnackbarProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
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
                <ProtectedRoute>
                  <Schools />
                </ProtectedRoute>
              } />
              
              <Route path="/schools/:id" element={
                <ProtectedRoute>
                  <SchoolDetails />
                </ProtectedRoute>
              } />
              
              <Route path="/create-school" element={
                <ProtectedRoute>
                  <CreateSchool />
                </ProtectedRoute>
              } />
              
              <Route path="/teachers" element={
                <ProtectedRoute>
                  <Teachers />
                </ProtectedRoute>
              } />
              
              <Route path="/teachers/:id" element={
                <ProtectedRoute>
                  <TeacherDetails />
                </ProtectedRoute>
              } />
              
              <Route path="/add-teacher" element={
                <ProtectedRoute>
                  <AdminAddTeacher />
                </ProtectedRoute>
              } />
              
              <Route path="/add-student-teacher" element={
                <ProtectedRoute>
                  <AddStudentTeacher />
                </ProtectedRoute>
              } />
              
              <Route path="/students" element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              } />
              
              <Route path="/students/:id" element={
                <ProtectedRoute>
                  <StudentDetails />
                </ProtectedRoute>
              } />
              
              <Route path="/manage-students" element={
                <ProtectedRoute>
                  <ManageStudents />
                </ProtectedRoute>
              } />
              
              <Route path="/add-student" element={
                <ProtectedRoute>
                  <AddStudent />
                </ProtectedRoute>
              } />
              
              <Route path="/classes" element={
                <ProtectedRoute>
                  <Classes />
                </ProtectedRoute>
              } />
              
              <Route path="/classes/:id" element={
                <ProtectedRoute>
                  <ClassDetails />
                </ProtectedRoute>
              } />
              
              <Route path="/add-class" element={
                <ProtectedRoute>
                  <AddClass />
                </ProtectedRoute>
              } />
              
              <Route path="/grades" element={
                <ProtectedRoute>
                  <Grades />
                </ProtectedRoute>
              } />
              
              <Route path="/grades/syllabus/:syllabusId" element={
                <ProtectedRoute>
                  <Syllabus />
                </ProtectedRoute>
              } />
              
              <Route path="/grades/lesson-plan/create/:chapterId" element={
                <ProtectedRoute>
                  <CreateLessonPlan />
                </ProtectedRoute>
              } />
              
              <Route path="/grades/lesson-plan/view/:chapterId/:lessonPlanId" element={
                <ProtectedRoute>
                  <ViewLessonPlan />
                </ProtectedRoute>
              } />
              
              <Route path="/grades/lesson-plan/day/:chapterId/:day" element={
                <ProtectedRoute>
                  <DayLessonPlan />
                </ProtectedRoute>
              } />
              
              <Route path="/grades/lesson-plan/ai-chat/:chapterId/:day" element={
                <ProtectedRoute>
                  <AIChatLessonPlan />
                </ProtectedRoute>
              } />
              
              <Route path="/grades/lesson-plan/whiteboard/:chapterId/:day" element={
                <ProtectedRoute>
                  <WhiteboardTeaching />
                </ProtectedRoute>
              } />
              
              <Route path="/grades/progress/:syllabusId" element={
                <ProtectedRoute>
                  <GradesProgress />
                </ProtectedRoute>
              } />
              
              <Route path="/requests" element={
                <ProtectedRoute>
                  <Requests />
                </ProtectedRoute>
              } />
              
              <Route path="/admin-requests" element={
                <ProtectedRoute>
                  <AdminRequests />
                </ProtectedRoute>
              } />
              
              <Route path="/responses" element={
                <ProtectedRoute>
                  <Responses />
                </ProtectedRoute>
              } />
              
              <Route path="/support" element={
                <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
              } />
              
              <Route path="/user-management" element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              } />
              
              <Route path="/admin-school" element={
                <ProtectedRoute>
                  <AdminSchool />
                </ProtectedRoute>
              } />
              
              <Route path="/upload-ebooks" element={
                <ProtectedRoute>
                  <UploadEbooks />
                </ProtectedRoute>
              } />
              
              <Route path="/view-ebooks" element={
                <ProtectedRoute>
                  <ViewEbooks />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </SnackbarProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
