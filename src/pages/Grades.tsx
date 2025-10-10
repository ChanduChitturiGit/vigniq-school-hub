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
  Palette,
  Users,
  Clock,
  Library,
  Notebook,
  Boxes,
  GraduationCap
} from 'lucide-react';
import { getGradeByTeacherId } from '../services/grades'
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { SpinnerOverlay } from '../pages/SpinnerOverlay';


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
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>([]);
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user") || '{}');
  const [loader, setLoader] = useState(true);


  const getGradesData = async () => {
    try {
      const schoolId = userData.school_id ?? 1;
      const teacherId = userData.user_id ?? 3;
      const data = await getGradeByTeacherId(schoolId, teacherId);
      if (data && data.data) {
        setTeacherClasses(data.data);
        setLoader(false);
        //groupSubjects(data.data);
      } else {
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong",
          status: "error"
        });
        setLoader(false);
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
      setLoader(false);
      // setTeacherClasses(sampleTeacherClasses);
      // groupSubjects(sampleTeacherClasses);
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

  const getSubjectColor = (subjectName: string) => {
    const subject = subjectName.toLowerCase();
    if (subject.includes('math')) return 'from-blue-500 to-blue-600';
    if (subject.includes('english')) return 'from-purple-500 to-purple-600';
    if (subject.includes('science') || subject.includes('physics')) return 'from-green-500 to-green-600';
    if (subject.includes('social')) return 'from-orange-500 to-orange-600';
    if (subject.includes('art')) return 'from-pink-500 to-pink-600';
    return 'from-gray-500 to-gray-600';
  };

  return (
    <>
      <MainLayout pageTitle="Subjects">
        <div className=" bg-gray-50 p-6 py-0">
          {/* <Breadcrumb items={breadcrumbItems} /> */}

          <div className="">
            {/* <h1 className="text-3xl font-bold text-gray-900 mb-8">My Subjects</h1> */}

            {/* Subjects with Classes */}
            <div className="space-y-8">
              {Object.entries(teacherClasses).map(([subjectName, classes]) => {
                const SubjectIcon = getSubjectIcon(subjectName);
                const colorGradient = getSubjectColor(subjectName);
                //const classKeys = Object.keys(classes);

                return (
                  <div key={subjectName} className="space-y-4">
                    {/* Subject Header */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${colorGradient} rounded-lg flex items-center justify-center`}>
                        <SubjectIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{subjectName}</h2>
                        <p className="text-gray-500">{classes.length} {classes.length === 1 ? 'class' : 'classes'}</p>
                      </div>
                    </div>

                    {/* Classes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {classes.map((classItem: any) => (
                        <Link
                          key={classItem.class_id}
                          to={`/grades/syllabus/${classItem.subject_id}?class=${'Class ' + classItem.class_number}&class_id=${classItem.class_id}&section=${classItem.section}&subject=${classItem.subject_name}&subject_id=${classItem.subject_id}&school_board_id=${classItem.board_id}&school_id=${userData.school_id}`}
                          className="group"
                        >
                          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300">
                            {/* Class Header */}
                            <div className="p-4 border-b border-gray-100">
                              <div className="flex items-center justify-between">
                                <div className='flex flex-col items-center justyify-center gap-1'>
                                  <div className='flex items-center gap-2'>
                                    <GraduationCap className="w-5 h-5 text-blue-800" />
                                    <h3 className="text-xl font-semibold text-gray-900 ">Class {classItem.class_number} - {classItem.section}</h3>
                                  </div>
                                  <p className="text-gray-600 flex items-center text-sm">{classItem.board_name}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                              </div>
                            </div>

                            {/* Class Body */}
                            <div className="p-6">
                              <div className="space-y-4">
                                {/* Chapters Count */}
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600 flex items-center space-x-1">
                                    <BookOpen className="w-4 h-4" />
                                    <span>Total Chapters:</span>
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {classItem.chapters_count}
                                  </span>
                                </div>

                                {/* Progress */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Course Progress:</span>
                                    <span className="font-medium text-gray-900">
                                      {Number(classItem.progress).toFixed(2)}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`bg-gradient-to-r ${colorGradient} h-2 rounded-full transition-all duration-500`}
                                      style={{
                                        width: `${Number(classItem.progress)}%`
                                      }}
                                    />
                                  </div>
                                </div>

                                {/* Action hint */}
                                <div className="flex items-center justify-center pt-2 border-t border-gray-100">
                                  <span className="text-xs text-gray-500 flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>Click to view syllabus</span>
                                  </span>
                                </div>
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

            {Object.keys(teacherClasses).length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Assigned</h3>
                <p className="text-gray-500">
                  You don't have any subjects assigned yet. Contact your administrator for subject assignments.
                </p>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
      {
        loader && (
          <SpinnerOverlay />
        )
      }
    </>
  );
};

export default Grades;
