
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Grades from './pages/Grades';
import Syllabus from './pages/Syllabus';
import GradesProgress from './pages/GradesProgress';
import ChapterDetails from './pages/ChapterDetails';
import { AuthProvider, useAuth } from './context/AuthContext';
import Profile from './pages/Profile';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Teachers Module */}
          <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />

           {/* Classes Module */}
           <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />

          <Route path="/grades" element={<ProtectedRoute><Grades /></ProtectedRoute>} />
          <Route path="/grades/syllabus/:subjectId" element={<ProtectedRoute><Syllabus /></ProtectedRoute>} />
          <Route path="/grades/progress/:subjectId" element={<ProtectedRoute><GradesProgress /></ProtectedRoute>} />
          <Route path="/grades/chapter/:chapterId" element={<ProtectedRoute><ChapterDetails /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
