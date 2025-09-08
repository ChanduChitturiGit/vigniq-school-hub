
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Progress } from '../components/ui/progress';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Circle,
  ChevronRight,
  Calculator,
  Globe,
  Beaker,
  BookIcon,
  Languages,
  Palette,
  FileText,
  Eye
} from 'lucide-react';
import { getGradeByChapter } from '../services/grades';
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { SpinnerOverlay } from '../pages/SpinnerOverlay';

interface Chapter {
  chapter_id: number;
  chapter_number: number;
  chapter_name: string;
  topics_count: number;
  progress: number;
  status: 'ready' | 'pending' | 'completed';
}

const Syllabus: React.FC = () => {
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
  const pathData = `class=${className}&class_id=${classId}&section=${section}&subject=${subject}&subject_id=${subjectId}&school_board_id=${boardId}&school_id=${schoolId}`

  const [chapters, setChapters] = useState<Chapter[]>([]);

  const [loader, setLoader] = useState(true);

  const breadcrumbItems = [
    { label: 'Grades', path: '/grades' },
    { label: `${subject} - ${className}` }
  ];

  const sampleChapters: Chapter[] = [
    { chapter_id: 1, chapter_number: 1, chapter_name: 'Real Numbers', topics_count: 5, progress: 85, status: 'ready' },
    { chapter_id: 2, chapter_number: 2, chapter_name: 'Polynomials', topics_count: 4, progress: 60, status: 'pending' },
    { chapter_id: 3, chapter_number: 3, chapter_name: 'Pair of Linear Equations in Two Variables', topics_count: 4, progress: 30, status: 'pending' },
    { chapter_id: 4, chapter_number: 4, chapter_name: 'Quadratic Equations', topics_count: 4, progress: 45, status: 'ready' },
    { chapter_id: 5, chapter_number: 5, chapter_name: 'Arithmetic Progressions', topics_count: 4, progress: 0, status: 'pending' },
    { chapter_id: 6, chapter_number: 6, chapter_name: 'Triangles', topics_count: 4, progress: 100, status: 'ready' }
  ];

  const getChaptersData = async () => {
    try {
      const payload = {
        class_id: classId,
        subject_id: subjectId,
        school_id: schoolId,
        board_id: boardId
      };

      const response = await getGradeByChapter(payload);
      if (response && response.data) {
        const processedChapters = response.data.map((chapter: any, index: number) => ({
          chapter_id: chapter.chapter_id || index + 1,
          chapter_number: chapter.chapter_number || index + 1,
          chapter_name: chapter.chapter_name || `Chapter ${index + 1}`,
          topics_count: chapter.sub_topics_count || 4,
          progress: (chapter.progress) || 0, // Sample progress
          status: !chapter.has_lesson_plan ? 'pending' : 'ready'
        }));
        setChapters(processedChapters);
        setLoader(false);
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
    }
  };

  useEffect(() => {
    getChaptersData();
  }, []);

  const getSubjectIcon = (subjectName: string) => {
    const subjectLower = subjectName.toLowerCase();
    if (subjectLower.includes('math')) return Calculator;
    if (subjectLower.includes('english')) return Languages;
    if (subjectLower.includes('science') || subjectLower.includes('physics')) return Beaker;
    if (subjectLower.includes('social')) return Globe;
    if (subjectLower.includes('art')) return Palette;
    return BookIcon;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return CheckCircle;
      case 'pending':
        return AlertCircle;
      default:
        return Circle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-600';
      case 'pending':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const overallProgress = chapters.reduce((sum, chapter) => sum + chapter.progress, 0) / (chapters.length || 1);
  const SubjectIcon = getSubjectIcon(subject);

  return (
    <>
      <MainLayout pageTitle={`${subject} - ${className} - ${section}`}>
        <div className="space-y-8">
          {/* <Breadcrumb items={breadcrumbItems} /> */}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/grades"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Home</span>
              </Link>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Overall Progress</div>
              <div className="text-xl font-bold text-gray-900">{Math.round(overallProgress)}% Complete</div>
            </div>
          </div>

          {/* Subject Header */}
          {/* <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center">
              <SubjectIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{subject} - {className}</h1>
              <p className="text-lg text-gray-600">{className} - Section {section}</p>
            </div>
          </div>
        </div> */}

          {/* Chapters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chapter) => {
              const StatusIcon = getStatusIcon(chapter.status);
              const statusColor = getStatusColor(chapter.status);

              return (
                <Link
                  key={chapter.chapter_id}
                  to={`/grades/chapter/${chapter.chapter_id}?${pathData}&chapter_name=${encodeURIComponent(chapter.chapter_name)}&chapter_number=${chapter.chapter_number}&progress=${chapter.progress}`}
                  className="group"
                >
                  <Card className="hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 overflow-hidden">
                    {/* Gradient Header */}
                    <div className="h-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>

                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg font-bold text-blue-600">{chapter.chapter_number}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 h-[3rem] leading-snug"  title={chapter.chapter_name}>
                              {chapter.chapter_name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <BookOpen className="w-4 h-4" />
                              <span>{chapter.topics_count} topics</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-lg font-bold text-gray-900">{chapter.progress}%</span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${chapter.progress}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Lesson Plan</span>
                            <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                            <span className={`text-xs font-medium ${statusColor}`}>
                              {chapter.status === 'ready' ? 'Ready' : 'Pending'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-blue-600 font-medium">Quick Access</span>
                          </div>
                        </div>

                        <div className="text-center pt-2">
                          <span className="text-xs text-gray-500">Click to explore chapter</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {chapters.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Chapters Available</h3>
              <p className="text-gray-500">
                No chapters found for this subject. Contact your administrator.
              </p>
            </div>
          )}
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

export default Syllabus;
