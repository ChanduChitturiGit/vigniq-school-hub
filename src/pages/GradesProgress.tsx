import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Progress } from '../components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getProgressBySubject } from '../services/grades';
import {
  ArrowLeft,
  BookOpen,
  TrendingUp,
  Users,
  Calculator,
  Globe,
  Beaker,
  BookIcon,
  Languages,
  Palette
} from 'lucide-react';
import { useSnackbar } from "../components/snackbar/SnackbarContext";

interface ChapterProgress {
  chapter_id: Number;
  chapter_number: Number;
  chapter_name: string;
  progress: number;
}

interface StudentPerformance {
  range: string;
  count: number;
  percentage: string;
  color: string;
}

const GradesProgress: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  //const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const subject = searchParams.get('subject') || '';
  const classId = searchParams.get('class_id') || '';
  const subjectId = searchParams.get('subject_id') || '';
  const schoolId = searchParams.get('school_id') || '';
  const boardId = searchParams.get('school_board_id') || '';
  const pathData = `${subjectId}?class=${className}&class_id=${classId}&section=${section}&subject=${subject}&subject_id=${subjectId}&school_board_id=${boardId}&school_id=${schoolId}`

  const payload = JSON.parse(localStorage.getItem('gradesData') || '{}');

  const [chaptersProgress, setChaptersProgress] = useState<ChapterProgress[]>([]);
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([]);

  const breadcrumbItems = [
    { label: 'Grades', path: '/grades' },
    { label: `${subject} - ${className} ${section}`, path: `/grades/syllabus/${pathData}` },
    { label: 'Progress' }
  ];

  const sampleChaptersProgress: ChapterProgress[] = [
    { chapter_id: 1, chapter_number : 1,chapter_name: 'Knowing Our Numbers', progress: 75 },
    { chapter_id: 2, chapter_number : 2,chapter_name: 'Whole Numbers', progress: 45 },
    { chapter_id: 3, chapter_number : 3,chapter_name: 'Playing with Numbers', progress: 90 },
    { chapter_id: 4, chapter_number : 4,chapter_name: 'Basic Geometrical chapter_ideas', progress: 30 },
    { chapter_id: 5, chapter_number : 5,chapter_name: 'Understanding Elementary Shapes', progress: 60 },
    { chapter_id: 6, chapter_number : 6,chapter_name: 'Integers', progress: 25 }
  ];

  const sampleStudentPerformance: StudentPerformance[] = [
    { range: '<60%', count: 5, percentage: '17%', color: 'bg-blue-100 text-blue-800' },
    { range: '60-80%', count: 15, percentage: '50%', color: 'bg-blue-100 text-blue-800' },
    { range: '>80%', count: 10, percentage: '33%', color: 'bg-blue-100 text-blue-800' }
  ];

  const progressData = async () => {
    try {
      payload.class_number_id = payload?.class_id;
      const response = await getProgressBySubject(payload);
      if (response && response.data) {
        console.log("topics", response);
        setChaptersProgress(response.data);
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
    // setChaptersProgress(sampleChaptersProgress);
    // setStudentPerformance(sampleStudentPerformance);
    progressData();
  }, []);

  const getSubjectIcon = (subjectName: string) => {
    const subjectLower = subjectName.toLowerCase();
    if (subjectLower.includes('math')) return Calculator;
    if (subjectLower.includes('english')) return Languages;
    if (subjectLower.includes('science')) return Beaker;
    if (subjectLower.includes('social')) return Globe;
    if (subjectLower.includes('art')) return Palette;
    return BookIcon;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-blue-600';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-blue-400';
  };

  const overallProgress = chaptersProgress.reduce((sum, chapter) => sum + chapter.progress, 0) / chaptersProgress.length;
  const SubjectIcon = getSubjectIcon(subject);

  return (
    <MainLayout pageTitle={`Progress - ${subject} - ${className} ${section}`}>
      <div className="space-y-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={`/grades/syllabus/${pathData}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Syllabus</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center border border-gray-200">
            <SubjectIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{subject}</h1>
            <p className="text-xl text-gray-600">{className} {section}</p>
            <p className="text-lg text-gray-500">Chapter-wise progress tracking</p>
          </div>
        </div>

        {/* Overall Progress Card */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="w-full bg-white/60 rounded-full h-4 overflow-hidden mb-2">
                  <div
                    className={`h-full ${getProgressColor(overallProgress)} transition-all duration-700 ease-out`}
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <p className="text-lg text-gray-600">
                  Average completion across all chapters
                </p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-gray-900">{Math.round(overallProgress)}%</span>
                <p className="text-sm text-gray-500">Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapter Progress */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            Chapter-wise Progress
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chaptersProgress.map((chapter) => (
              <Card key={''+chapter.chapter_id} className="shadow-md hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        Chapter {''+chapter.chapter_number}
                      </h3>
                      <p className="text-lg text-gray-600">
                        {chapter.chapter_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">
                        {chapter.progress}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-4">
                    <div
                      className={`h-full ${getProgressColor(chapter.progress)} transition-all duration-500`}
                      style={{ width: `${chapter.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Progress Status</span>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${chapter.progress >= 70 ? 'bg-blue-100 text-blue-800' :
                        chapter.progress >= 40 ? 'bg-blue-100 text-blue-700' :
                          'bg-blue-100 text-blue-600'
                      }`}>
                      {chapter.progress >= 70 ? 'Excellent' :
                        chapter.progress >= 40 ? 'Good' : 'Needs Attention'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Class Performance Overview */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              Class Students Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              {studentPerformance.map((performance, index) => (
                <div key={index} className="text-center bg-white rounded-xl p-6 shadow-md">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 ${performance.range === '<60%' ? 'bg-blue-100' :
                      performance.range === '60-80%' ? 'bg-blue-100' : 'bg-blue-100'
                    }`}>
                    <span className={`text-3xl font-bold ${performance.range === '<60%' ? 'text-blue-500' :
                        performance.range === '60-80%' ? 'text-blue-600' : 'text-blue-700'
                      }`}>
                      {performance.count}
                    </span>
                  </div>
                  <p className={`text-lg font-bold mb-2 ${performance.range === '<60%' ? 'text-blue-500' :
                      performance.range === '60-80%' ? 'text-blue-600' : 'text-blue-700'
                    }`}>
                    {performance.range}
                  </p>
                  <p className="text-sm text-gray-500">
                    {performance.percentage} of class
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-lg text-gray-600">
                Performance distribution based on overall chapter completion
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default GradesProgress;
