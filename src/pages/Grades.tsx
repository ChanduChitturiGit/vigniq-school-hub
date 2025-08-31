
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Progress } from '../components/ui/progress';
import {
  BookOpen,
  ChevronRight,
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

interface SubjectGroup {
  subject_name: string;
  subject_id: string;
  classes: TeacherClass[];
}

const Grades: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>([]);
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user") || '{}');

  const breadcrumbItems = [
    { label: 'Grades' }
  ];

  const sampleTeacherClasses: TeacherClass[] = [
    {
      class_id: '1',
      class_name: 'Class 10',
      class_number: 10,
      board_id: 1,
      section: 'A',
      subject_name: 'Physics',
      subject_id: 'physics_10a',
      progress: 85,
      student_count: 30
    },
    {
      class_id: '2',
      class_name: 'Class 9',
      class_number: 9,
      board_id: 1,
      section: 'A',
      subject_name: 'Physics',
      subject_id: 'physics_9a',
      progress: 70,
      student_count: 28
    },
    {
      class_id: '3',
      class_name: 'Class 8',
      class_number: 8,
      board_id: 1,
      section: 'A',
      subject_name: 'Physics',
      subject_id: 'physics_8a',
      progress: 60,
      student_count: 25
    },
    {
      class_id: '4',
      class_name: 'Class 7',
      class_number: 7,
      board_id: 1,
      section: 'A',
      subject_name: 'Science',
      subject_id: 'science_7a',
      progress: 55,
      student_count: 32
    },
    {
      class_id: '5',
      class_name: 'Class 7',
      class_number: 7,
      board_id: 1,
      section: 'B',
      subject_name: 'Science',
      subject_id: 'science_7b',
      progress: 58,
      student_count: 30
    },
    {
      class_id: '6',
      class_name: 'Class 6',
      class_number: 6,
      board_id: 1,
      section: 'A',
      subject_name: 'Science',
      subject_id: 'science_6a',
      progress: 45,
      student_count: 28
    }
  ];

  const getGradesData = async () => {
    try {
      const schoolId = userData.school_id ?? 1;
      const teacherId = userData.user_id ?? 3;
      const data = await getGradeByTeacherId(schoolId, teacherId);
      console.log('Fetched Grades Data:', data);
      if (data && data.data) {
        setTeacherClasses(data.data);
        groupSubjects(data.data);
      } else {
        setTeacherClasses(sampleTeacherClasses);
        groupSubjects(sampleTeacherClasses);
      }
    } catch (error) {
      console.log('Using sample data due to API error');
      setTeacherClasses(sampleTeacherClasses);
      groupSubjects(sampleTeacherClasses);
    }
  }

  const groupSubjects = (classes: TeacherClass[]) => {
    const grouped = classes.reduce((acc, classItem) => {
      const existingSubject = acc.find(group => group.subject_name === classItem.subject_name);
      if (existingSubject) {
        existingSubject.classes.push(classItem);
      } else {
        acc.push({
          subject_name: classItem.subject_name,
          subject_id: classItem.subject_id,
          classes: [classItem]
        });
      }
      return acc;
    }, [] as SubjectGroup[]);
    setSubjectGroups(grouped);
  };

  useEffect(() => {
    getGradesData();
  }, []);

  const getSubjectIcon = (subjectName: string) => {
    const subject = subjectName.toLowerCase();
    if (subject.includes('math')) return Calculator;
    if (subject.includes('english')) return Languages;
    if (subject.includes('science') || subject.includes('physics')) return Beaker;
    if (subject.includes('social')) return Globe;
    if (subject.includes('art')) return Palette;
    return BookIcon;
  };

  const getSubjectIconColor = (subjectName: string) => {
    const subject = subjectName.toLowerCase();
    if (subject.includes('math')) return 'text-blue-600 bg-blue-100';
    if (subject.includes('english')) return 'text-purple-600 bg-purple-100';
    if (subject.includes('science') || subject.includes('physics')) return 'text-green-600 bg-green-100';
    if (subject.includes('social')) return 'text-orange-600 bg-orange-100';
    if (subject.includes('art')) return 'text-pink-600 bg-pink-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <MainLayout pageTitle="Grades">
      <div className="space-y-8">
        <Breadcrumb items={breadcrumbItems} />

        {/* Subject Groups */}
        <div className="space-y-12">
          {subjectGroups.map((subjectGroup) => {
            const SubjectIcon = getSubjectIcon(subjectGroup.subject_name);
            const iconColor = getSubjectIconColor(subjectGroup.subject_name);
            
            return (
              <div key={subjectGroup.subject_name} className="space-y-6">
                {/* Subject Header */}
                <div className="flex items-center gap-4 pb-4 border-b-4 border-blue-500">
                  <div className={`w-12 h-12 ${iconColor} rounded-xl flex items-center justify-center`}>
                    <SubjectIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{subjectGroup.subject_name}</h2>
                    <p className="text-gray-600">{subjectGroup.classes.length} classes</p>
                  </div>
                </div>

                {/* Class Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjectGroup.classes.map((classItem) => (
                    <Link
                      key={`${classItem.class_number}_${classItem.subject_id}`}
                      to={`/grades/syllabus/${classItem.subject_id}?class=${classItem.class_name}&class_id=${classItem.class_id}&section=${classItem.section}&subject=${classItem.subject_name}&subject_id=${classItem.subject_id}&school_board_id=${classItem.board_id}&school_id=${userData.school_id}`}
                      className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group overflow-hidden"
                    >
                      {/* Gradient Header */}
                      <div className="h-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg font-bold text-blue-600">{classItem.class_number}</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {classItem.class_name}
                              </h3>
                              <p className="text-purple-600 text-sm font-medium">
                                Section {classItem.section}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Course Progress</span>
                            <span className="text-lg font-bold text-gray-900">{classItem.progress}%</span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${classItem.progress}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-1 text-gray-600">
                              <BookOpen className="w-4 h-4" />
                              <span className="text-sm">12 chapters</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              Click to explore chapter
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {subjectGroups.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
