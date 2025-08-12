import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import {
  Award,
  BookOpen,
  Users,
  ChevronRight,
  Search,
  Calculator,
  Globe,
  Beaker,
  BookIcon,
  Languages,
  Palette
} from 'lucide-react';
import { getGradeByTeacherId } from '../services/grades'
import { useSnackbar } from "../components/snackbar/SnackbarContext";

interface TeacherClass {
  class_id: string;
  class_name: string;
  class_number: Number,
  board_id: Number,
  section: string;
  subject_name: string;
  subject_id: string;
  progress: number;
  student_count: number;
}

const Grades: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClasses, setFilteredClasses] = useState<TeacherClass[]>([]);
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));

  const breadcrumbItems = [
    { label: 'Grades' }
  ];

  const sampleTeacherClasses: TeacherClass[] = [
    {
      class_id: '1',
      class_name: 'Class 06',
      class_number: 6,
      board_id: 1,
      section: 'A',
      subject_name: 'Mathematics',
      subject_id: 'math_6a',
      progress: 75,
      student_count: 30
    },
    {
      class_id: '2',
      class_name: 'Class 07',
      class_number: 6,
      board_id: 1,
      section: 'B',
      subject_name: 'Mathematics',
      subject_id: 'math_7b',
      progress: 60,
      student_count: 28
    },
    {
      class_id: '3',
      class_name: 'Class 06',
      class_number: 6,
      board_id: 1,
      section: 'A',
      subject_name: 'English',
      subject_id: 'eng_6a',
      progress: 85,
      student_count: 30
    },
    {
      class_id: '4',
      class_name: 'Class 07',
      class_number: 6,
      board_id: 1,
      section: 'B',
      subject_name: 'Science',
      subject_id: 'sci_7b',
      progress: 55,
      student_count: 28
    },
    {
      class_id: '5',
      class_name: 'Class 08',
      class_number: 6,
      board_id: 1,
      section: 'A',
      subject_name: 'Social Studies',
      subject_id: 'social_8a',
      progress: 70,
      student_count: 32
    },
    {
      class_id: '6',
      class_name: 'Class 09',
      class_number: 6,
      board_id: 1,
      section: 'C',
      subject_name: 'Art',
      subject_id: 'art_9c',
      progress: 90,
      student_count: 25
    }
  ];

  const getGradesData = async () => {
    try {
      const schoolId = userData.school_id ?? 1; // Replace with actual school ID
      const teacherId = userData.user_id ?? 3; // Replace with actual teacher ID
      const data = await getGradeByTeacherId(schoolId, teacherId);
      console.log('Fetched Grades Data:', data);
      if (data && data.data) {
        setTeacherClasses(data.data);
        setFilteredClasses(data.data);
      } else {
        setTeacherClasses(sampleTeacherClasses);
        setFilteredClasses(sampleTeacherClasses);
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }

  useEffect(() => {
    getGradesData();
  }, []);

  useEffect(() => {
    const filtered = teacherClasses.filter(classItem =>
      classItem.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.section.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClasses(filtered);
  }, [searchTerm, teacherClasses]);

  const getSubjectIcon = (subjectName: string) => {
    const subject = subjectName.toLowerCase();
    if (subject.includes('math')) return Calculator;
    if (subject.includes('english')) return Languages;
    if (subject.includes('science')) return Beaker;
    if (subject.includes('social')) return Globe;
    if (subject.includes('art')) return Palette;
    return BookIcon;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-blue-600';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-blue-400';
  };

  const getSubjectIconColor = (subjectName: string) => {
    const subject = subjectName.toLowerCase();
    if (subject.includes('math')) return 'text-blue-600 bg-blue-100';
    if (subject.includes('english')) return 'text-purple-600 bg-purple-100';
    if (subject.includes('science')) return 'text-green-600 bg-green-100';
    if (subject.includes('social')) return 'text-orange-600 bg-orange-100';
    if (subject.includes('art')) return 'text-pink-600 bg-pink-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <MainLayout pageTitle="Grades">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grades</h1>
            <p className="text-lg text-gray-600 mt-1">Manage your assigned classes and track progress</p>
          </div>
          <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
            <Award className="w-6 h-6 text-blue-600" />
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Subjects</div>
              <div className="text-xl font-bold text-blue-600">{teacherClasses.length}</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by subject, class, or section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg"
          />
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => {
            const SubjectIcon = getSubjectIcon(classItem.subject_name);
            const progressColor = getProgressColor(classItem.progress);
            const iconColor = getSubjectIconColor(classItem.subject_name);

            return (
              <Link
                key={`${classItem.class_number}_${classItem.subject_id}`}
                to={`/grades/syllabus/${classItem.subject_id}?class=${'Class '+classItem.class_number}&class_id=${classItem.class_id}&section=${classItem.section}&subject=${classItem.subject_name}&subject_id=${classItem.subject_id}&school_board_id=${classItem.board_id}&school_id=${userData.school_id}`}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${iconColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <SubjectIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {classItem.subject_name}
                      </h3>
                      <p className="text-md text-gray-600 font-medium">
                        {'Class' + classItem.class_number} - {classItem.section}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-lg font-bold text-gray-900">{classItem.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${progressColor} rounded-full transition-all duration-500 ease-out`}
                      style={{ width: `${classItem.progress}%` }}
                    />
                  </div>
                </div>

                {/* <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">{classItem.student_count} Students</span>
                  </div>
                  <div className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                    {classItem.progress >= 70 ? 'Excellent' : 
                     classItem.progress >= 50 ? 'Good' : 'Needs Attention'}
                  </div>
                </div> */}
              </Link>
            );
          })}
        </div>

        {filteredClasses.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
            <p className="text-gray-500">
              Try searching with different keywords or check your assigned classes.
            </p>
          </div>
        )}

        {teacherClasses.length === 0 && (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Assigned</h3>
            <p className="text-gray-500">
              You don't have any classes assigned yet. Contact your administrator for class assignments.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Grades;
