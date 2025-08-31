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
import AddTeacher from './pages/AddTeacher';
import EditTeacher from './pages/EditTeacher';
import School from './pages/School';
import AddSchool from './pages/AddSchool';
import EditSchool from './pages/EditSchool';
import Classes from './pages/Classes';
import AddClass from './pages/AddClass';
import EditClass from './pages/EditClass';
import Subjects from './pages/Subjects';
import AddSubject from './pages/AddSubject';
import EditSubject from './pages/EditSubject';
import LessonPlan from './pages/LessonPlan';
import Prerequisites from './pages/Prerequisites';
import AddLessonPlan from './pages/AddLessonPlan';
import EditLessonPlan from './pages/EditLessonPlan';
import AddPrerequisites from './pages/AddPrerequisites';
import EditPrerequisites from './pages/EditPrerequisites';
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

          {/* School Module */}
          <Route path="/schools" element={<ProtectedRoute><School /></ProtectedRoute>} />
          <Route path="/schools/add" element={<ProtectedRoute><AddSchool /></ProtectedRoute>} />
          <Route path="/schools/edit/:schoolId" element={<ProtectedRoute><EditSchool /></ProtectedRoute>} />

          {/* Teachers Module */}
          <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
          <Route path="/teachers/add" element={<ProtectedRoute><AddTeacher /></ProtectedRoute>} />
          <Route path="/teachers/edit/:teacherId" element={<ProtectedRoute><EditTeacher /></ProtectedRoute>} />

           {/* Classes Module */}
           <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
          <Route path="/classes/add" element={<ProtectedRoute><AddClass /></ProtectedRoute>} />
          <Route path="/classes/edit/:classId" element={<ProtectedRoute><EditClass /></ProtectedRoute>} />

           {/* Subjects Module */}
           <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
          <Route path="/subjects/add" element={<ProtectedRoute><AddSubject /></ProtectedRoute>} />
          <Route path="/subjects/edit/:subjectId" element={<ProtectedRoute><EditSubject /></ProtectedRoute>} />

           {/* Lesson Plan Module */}
           <Route path="/lessonPlan" element={<ProtectedRoute><LessonPlan /></ProtectedRoute>} />
          <Route path="/lessonPlan/add" element={<ProtectedRoute><AddLessonPlan /></ProtectedRoute>} />
          <Route path="/lessonPlan/edit/:lessonPlanId" element={<ProtectedRoute><EditLessonPlan /></ProtectedRoute>} />

           {/* Prerequisites Module */}
           <Route path="/prerequisites" element={<ProtectedRoute><Prerequisites /></ProtectedRoute>} />
          <Route path="/prerequisites/add" element={<ProtectedRoute><AddPrerequisites /></ProtectedRoute>} />
          <Route path="/prerequisites/edit/:prerequisitesId" element={<ProtectedRoute><EditPrerequisites /></ProtectedRoute>} />

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
