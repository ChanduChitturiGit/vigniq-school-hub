import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Schools from './pages/Schools';
import CreateSchool from './pages/CreateSchool';
import SchoolDetails from './pages/SchoolDetails';
import Teachers from './pages/Teachers';
import TeacherDetails from './pages/TeacherDetails';
import Classes from './pages/Classes';
import ClassDetails from './pages/ClassDetails';
import AddClass from './pages/AddClass';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import AddStudent from './pages/AddStudent';
import ManageStudents from './pages/ManageStudents';
import AddStudentTeacher from './pages/AddStudentTeacher';
import UserManagement from './pages/UserManagement';
import AdminSchool from './pages/AdminSchool';
import AdminAddTeacher from './pages/AdminAddTeacher';
import Support from './pages/Support';
import Requests from './pages/Requests';
import AdminRequests from './pages/AdminRequests';
import Responses from './pages/Responses';
import UploadEbooks from './pages/UploadEbooks';
import ViewEbooks from './pages/ViewEbooks';
import NotFound from './pages/NotFound';
import AIChatLessonPlan from './pages/AIChatLessonPlan';
import CreateLessonPlan from './pages/CreateLessonPlan';
import DayLessonPlan from './pages/DayLessonPlan';
import WhiteboardTeaching from './pages/WhiteboardTeaching';
import Grades from './pages/Grades';
import GradesProgress from './pages/GradesProgress';
import Syllabus from './pages/Syllabus';
import ViewLessonPlan from './pages/ViewLessonPlan';
import CustomizeLessonPlan from './pages/CustomizeLessonPlan';
import Attendance from './pages/Attendance';
import AttendanceReports from './pages/AttendanceReports';
import CreateExam from './pages/CreateExam';
import ExamResults from './pages/ExamResults';
import Exams from './pages/Exams';
import ChapterDetails from './pages/ChapterDetails';
import ComingSoon from './pages/ComingSoon';
import SupportDetails from './pages/SupportRequest';
import ExcalidrawApp from './pages/ExcalidrawApp';
import TeacherDiaries from './pages/TeacherDiaries';
import AdminTeacherDiaries from './pages/AdminTeacherDiaries';
import SyllabusProgress from './pages/SyllabusProgress';
import ClassSubjectsProgress from './pages/ClassSubjectsProgress';
import SubjectChaptersProgress from './pages/SubjectChaptersProgress';
import TeacherSubjectsProgress from './pages/TeacherSubjectsProgress';
import GradesStudent from './pages/GradesStudent';
import { AttendanceView } from './pages/AttendanceView';
import { TeacherDiariesView } from './pages/TeacherDiariesView';
import { ExamsView } from './pages/ExamsView';
import { ExamsPage } from './pages/ExamsPage';

function App() {
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user") || '{}');
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
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
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Schools />
            </ProtectedRoute>
          } />

          <Route path="/create-school" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <CreateSchool />
            </ProtectedRoute>
          } />

          <Route path="/schools/school-details/:id" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <AdminSchool />
            </ProtectedRoute>
          } />


          <Route path="/teachers" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <Teachers />
            </ProtectedRoute>
          } />

          <Route path="/teachers/teacher-details/:id" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <TeacherDetails />
            </ProtectedRoute>
          } />

          <Route path="/classes" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin', 'teacher']}>
              <Classes />
            </ProtectedRoute>
          } />

          <Route path="/classes/class-details/:id" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin', 'teacher']}>
              <ClassDetails />
            </ProtectedRoute>
          } />

          <Route path="/classes/add-class" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <AddClass />
            </ProtectedRoute>
          } />

          <Route path="/students" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin', 'teacher']}>
              <Students />
            </ProtectedRoute>
          } />

          <Route path="/students/student-details/:id" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin', 'teacher']}>
              <StudentDetails />
            </ProtectedRoute>
          } />

          <Route path="/students/add-student" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin', 'teacher']}>
              <AddStudent />
            </ProtectedRoute>
          } />

          <Route path="/manage-students" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <ManageStudents />
            </ProtectedRoute>
          } />

          <Route path="/add-student-teacher" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <AddStudentTeacher />
            </ProtectedRoute>
          } />

          <Route path="/user-management" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <UserManagement />
            </ProtectedRoute>
          } />

          <Route path="/admin-school" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <AdminSchool />
            </ProtectedRoute>
          } />

          <Route path="/teachers/admin-add-teacher" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <AdminAddTeacher />
            </ProtectedRoute>
          } />

          <Route path="/support" element={
            <ProtectedRoute>
              <Support />
              {/* <ComingSoon /> */}
            </ProtectedRoute>
          } />

          <Route path="/requests" element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'admin', 'superadmin']}>
              <Requests />
              {/* <ComingSoon /> */}
            </ProtectedRoute>
          } />

          <Route path="/admin-requests" element={
            <ProtectedRoute allowedRoles={['admin', 'student', 'teacher', 'superadmin']}>
              {/* <AdminRequests /> */}
              <Requests />
              {/* <ComingSoon /> */}
            </ProtectedRoute>
          } />

          <Route path="/support-details/:requestId" element={
            <ProtectedRoute allowedRoles={['admin', 'student', 'teacher', 'superadmin']}>
              <SupportDetails />
              {/* <ComingSoon /> */}
            </ProtectedRoute>
          } />

          <Route path="/responses" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin', 'teacher', 'student']}>
              {/* <Responses /> */}
              <ComingSoon />
            </ProtectedRoute>
          } />

          <Route path="/upload-ebooks" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <UploadEbooks />
            </ProtectedRoute>
          } />

          <Route path="/view-ebooks" element={
            <ProtectedRoute>
              <ViewEbooks />
            </ProtectedRoute>
          } />

          {/* <Route path="/grades" element={<ProtectedRoute allowedRoles={['teacher']}><Grades /></ProtectedRoute>} />
          <Route path="/grades/syllabus/:subjectId" element={<ProtectedRoute allowedRoles={['teacher']}><Syllabus /></ProtectedRoute>} />
          <Route path="/grades/progress/:subjectId" element={<ProtectedRoute allowedRoles={['teacher']}><GradesProgress /></ProtectedRoute>} /> */}
          <Route path="/grades/syllabus/lesson-plan/create/:chapterId" element={<ProtectedRoute allowedRoles={['teacher', 'student']}><CreateLessonPlan /></ProtectedRoute>} />
          {/* <Route path="/grades/lesson-plan/view/:chapterId/:lessonPlanId" element={<ProtectedRoute allowedRoles={['teacher']}><ViewLessonPlan /></ProtectedRoute>} /> */}
          <Route path="/grades/syllabus/lesson-plan/customize/:chapterId" element={<ProtectedRoute allowedRoles={['teacher', 'student']}><CustomizeLessonPlan /></ProtectedRoute>} />
          <Route path="/grades/syllabus/lesson-plan/day/:chapterId/:day" element={<ProtectedRoute allowedRoles={['teacher', 'student']}><DayLessonPlan /></ProtectedRoute>} />
          <Route path="/grades/syllabus/lesson-plan/whiteboard/:chapterId/:day" element={<ProtectedRoute allowedRoles={['teacher', 'student']}>
            {/* <WhiteboardTeaching /> */}
            <ExcalidrawApp />
          </ProtectedRoute>} />
          <Route path="/grades/syllabus/lesson-plan/ai-chat/:chapterId/:day" element={<ProtectedRoute allowedRoles={['teacher', 'student']}><AIChatLessonPlan /></ProtectedRoute>} />
          {
            userData.role === 'teacher' ? (
              <Route path="/grades/exams/:subjectId" element={<ProtectedRoute allowedRoles={['teacher']}><Exams /></ProtectedRoute>} />
            ) : (
              <Route path="/grades/exams/:subjectId" element={<ProtectedRoute allowedRoles={['student']}><ExamsPage /></ProtectedRoute>} />
            )
          }
          <Route path="/grades/exams/create-exam/:subjectId" element={<ProtectedRoute allowedRoles={['teacher', 'student']}><CreateExam /></ProtectedRoute>} />
          <Route path="/grades/exams/exam-results/:examId" element={<ProtectedRoute allowedRoles={['teacher', 'student']}><ExamResults /></ProtectedRoute>} />


          {userData.role === 'teacher' ? (
            <Route
              path="/grades"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <Grades />
                </ProtectedRoute>
              }
            />
          ) : (
            <Route
              path="/grades"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <GradesStudent />
                </ProtectedRoute>
              }
            />
          )}



          <Route path="/grades/syllabus/:subjectId" element={<ProtectedRoute allowedRoles={['teacher', 'student']}><Syllabus /></ProtectedRoute>} />
          <Route path="/grades/progress/:subjectId" element={<ProtectedRoute allowedRoles={['teacher', 'student']}><GradesProgress /></ProtectedRoute>} />
          <Route path="/grades/syllabus/chapter/:chapterId" element={<ProtectedRoute allowedRoles={['teacher', 'student']}><ChapterDetails /></ProtectedRoute>} />



          
          <Route path="/attendance/reports" element={<ProtectedRoute allowedRoles={['teacher']}><AttendanceReports /></ProtectedRoute>} />

          {userData.role === 'teacher' ? (
            <Route path="/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><Attendance /></ProtectedRoute>} />
          ) : (
            <Route path="/attendance" element={<ProtectedRoute allowedRoles={['student']}><AttendanceView /></ProtectedRoute>} />
          )}

          <Route path="/teacher-diaries" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDiaries /></ProtectedRoute>} />
          <Route path="/admin-teacher-diaries" element={<ProtectedRoute allowedRoles={['admin']}><AdminTeacherDiaries /></ProtectedRoute>} />
          <Route path="/student-teacher-diaries" element={<ProtectedRoute allowedRoles={['student']}><TeacherDiariesView /></ProtectedRoute>} />
          <Route path="/syllabus-progress" element={<ProtectedRoute allowedRoles={['admin']}><SyllabusProgress /></ProtectedRoute>} />
          <Route path="/syllabus-progress/class/:classId" element={<ProtectedRoute allowedRoles={['admin']}><ClassSubjectsProgress /></ProtectedRoute>} />
          <Route path="/syllabus-progress/class/:classId/subject/:subjectId" element={<ProtectedRoute allowedRoles={['admin']}><SubjectChaptersProgress /></ProtectedRoute>} />
          <Route path="/syllabus-progress/teacher/:teacherId" element={<ProtectedRoute allowedRoles={['admin']}><TeacherSubjectsProgress /></ProtectedRoute>} />
          <Route path="/syllabus-progress/teacher/:teacherId/class/:classId/subject/:subjectId" element={<ProtectedRoute allowedRoles={['admin']}><SubjectChaptersProgress /></ProtectedRoute>} />


          <Route path="/support" element={<Support />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/requests/support-details/:requestId" element={<SupportDetails />} />

          <Route path="/admin-requests" element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin', 'teacher', 'superadmin']}>
              {/* <AdminRequests /> */}
              <Requests />
            </ProtectedRoute>
          } />

          <Route path="/responses" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin', 'teacher', 'student']}>
              <Responses />
            </ProtectedRoute>
          } />



          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;