import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Schools from './pages/Schools';
import CreateSchool from './pages/CreateSchool';
import AdminSchool from './pages/AdminSchool';
import SchoolDetails from './pages/SchoolDetails';
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
import AddStudentTeacher from './pages/AddStudentTeacher';
import ManageStudents from './pages/ManageStudents';
import Support from './pages/Support';
import Responses from './pages/Responses';
import AdminRequests from './pages/AdminRequests';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Index from './pages/Index';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                <ProtectedRoute>
                  <ResetPassword />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/schools" 
              element={
                <ProtectedRoute>
                  <Schools />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-school" 
              element={
                <ProtectedRoute>
                  <CreateSchool />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-school" 
              element={
                <ProtectedRoute>
                  <AdminSchool />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/school/:id" 
              element={
                <ProtectedRoute>
                  <SchoolDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/classes" 
              element={
                <ProtectedRoute>
                  <Classes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/class/:id" 
              element={
                <ProtectedRoute>
                  <ClassDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add-class" 
              element={
                <ProtectedRoute>
                  <AddClass />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teachers" 
              element={
                <ProtectedRoute>
                  <Teachers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/:id" 
              element={
                <ProtectedRoute>
                  <TeacherDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add-teacher" 
              element={
                <ProtectedRoute>
                  <AddTeacher />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-add-teacher" 
              element={
                <ProtectedRoute>
                  <AdminAddTeacher />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/students" 
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/:id" 
              element={
                <ProtectedRoute>
                  <StudentDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add-student" 
              element={
                <ProtectedRoute>
                  <AddStudent />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add-student-teacher" 
              element={
                <ProtectedRoute>
                  <AddStudentTeacher />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage-students/:classId" 
              element={
                <ProtectedRoute>
                  <ManageStudents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/support" 
              element={
                <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/responses" 
              element={
                <ProtectedRoute>
                  <Responses />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-requests" 
              element={
                <ProtectedRoute>
                  <AdminRequests />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
