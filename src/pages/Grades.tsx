
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Progress } from '../components/ui/progress';
import { Award, BookOpen, Users, ChevronRight } from 'lucide-react';

interface TeacherClass {
  class_id: string;
  class_name: string;
  section: string;
  subject_name: string;
  subject_id: string;
  progress: number;
  student_count: number;
}

const Grades: React.FC = () => {
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([]);

  const breadcrumbItems = [
    { label: 'Grades' }
  ];

  // Sample data for teacher's assigned classes and subjects
  const sampleTeacherClasses: TeacherClass[] = [
    {
      class_id: '1',
      class_name: 'Class 06',
      section: 'A',
      subject_name: 'Mathematics',
      subject_id: 'math_6a',
      progress: 75,
      student_count: 30
    },
    {
      class_id: '2',
      class_name: 'Class 07',
      section: 'B',
      subject_name: 'Mathematics',
      subject_id: 'math_7b',
      progress: 60,
      student_count: 28
    },
    {
      class_id: '3',
      class_name: 'Class 06',
      section: 'A',
      subject_name: 'English',
      subject_id: 'eng_6a',
      progress: 80,
      student_count: 30
    },
    {
      class_id: '4',
      class_name: 'Class 07',
      section: 'B',
      subject_name: 'Science',
      subject_id: 'sci_7b',
      progress: 55,
      student_count: 28
    }
  ];

  useEffect(() => {
    setTeacherClasses(sampleTeacherClasses);
  }, []);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressBgColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-50';
    if (progress >= 60) return 'bg-yellow-50';
    if (progress >= 40) return 'bg-orange-50';
    return 'bg-red-50';
  };

  return (
    <MainLayout pageTitle="Grades">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Grades</h1>
            <p className="text-gray-600">Manage your assigned classes and track progress</p>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-gray-500">{teacherClasses.length} Subjects Assigned</span>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherClasses.map((classItem) => (
            <Link
              key={`${classItem.class_id}_${classItem.subject_id}`}
              to={`/grades/syllabus/${classItem.subject_id}?class=${classItem.class_name}&section=${classItem.section}&subject=${classItem.subject_name}`}
              className={`${getProgressBgColor(classItem.progress)} p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {classItem.subject_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {classItem.class_name} - {classItem.section}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{classItem.student_count}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-semibold text-gray-800">{classItem.progress}%</span>
                </div>
                <Progress 
                  value={classItem.progress} 
                  className="h-2"
                />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">
                  {classItem.progress >= 80 ? 'Excellent Progress' : 
                   classItem.progress >= 60 ? 'Good Progress' : 
                   classItem.progress >= 40 ? 'Average Progress' : 'Needs Attention'}
                </span>
              </div>
            </Link>
          ))}
        </div>

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
