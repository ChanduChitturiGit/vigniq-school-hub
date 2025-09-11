

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  ArrowLeft,
  Download,
  Printer,
  Play,
  Calculator,
  Clock,
  Target,
  Globe,
  BookMarked,
  KeyRound,
  BadgeCheck
} from 'lucide-react';
import { useSnackbar } from '../components/snackbar/SnackbarContext';
import { getLessonPlanDataByDay, updateLessonPlanDayStatus, createWhiteboardSession } from '../services/grades';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';


interface Topic {
  topic_id: number;
  title: string;
  summary: string;
  time_minutes: number;
}

interface LessonPlanDay {
  lesson_plan_day_id: number;
  day: number;
  learning_outcomes: string;
  real_world_applications: string;
  taxonomy_alignment: string;
  status: string;
  topics: Topic[];
}

const DayLessonPlan: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const { chapterId, day } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const subject = searchParams.get('subject') || '';
  const chapterName = searchParams.get('chapter_name') || '';
  const chapterNumber = searchParams.get('chapter_number') || '';
  const progress = parseInt(searchParams.get('progress') || '0');
  const classId = searchParams.get('class_id') || '';
  const subjectId = searchParams.get('subject_id') || '';
  const schoolId = searchParams.get('school_id') || '';
  const boardId = searchParams.get('school_board_id') || '';
  const tab = searchParams.get('tab') || '';
  const status = searchParams.get('status') || '';
  const pathData = `class=${className}&class_id=${classId}&section=${section}&subject=${subject}&subject_id=${subjectId}&school_board_id=${boardId}&school_id=${schoolId}&chapter_number=${chapterNumber}&chapter_name=${chapterName}&progress=${progress}&tab=${'lesson-plan'}`;


  const [lessonData, setLessonData] = useState<LessonPlanDay | null>(null);
  const [overallProgress] = useState(0);

  const [sessionToken, setSessionToken] = useState<string>('');

  const breadcrumbItems = [
    { label: 'Grades', path: '/grades' },
    { label: `${subject} - ${className} ${section}`, path: `/grades/syllabus/${pathData}` },
    { label: 'Day Lesson Plan' }
  ];

  const getLessonData = async () => {
    try {
      const data = {
        chapter_id: chapterId,
        lesson_plan_day_id: day,
        subject: subject,
        class: className,
        section: section,
        school_id: schoolId,
        board_id: boardId,
        subject_id: subjectId,
        class_id: classId
      };
      const response = await getLessonPlanDataByDay(data);
      if (response && response.data) {
        setLessonData(response.data);
        if(response.data.session_id){
          setSessionToken(response.data.session_id);
        }else{
          generateSession();
        }
      } else {
        showSnackbar({
          title: 'Error',
          description: response.message || 'Failed to fetch lesson plan data.',
          status: 'error'
        });
      }
    } catch (error) {
      showSnackbar({
        title: 'Error',
        description: 'An unexpected error occurred while fetching lesson plan data.',
        status: 'error'
      });
    }
  }

  const generateSession = async () => {
    try {
      const data = {
        // chapter_id: chapterId,
        // lesson_plan_day_id: day,
        // subject: subject,
        // class: className,
        // section: section,
        school_id: Number(schoolId),
        // board_id: boardId,
        // subject_id: subjectId,
        // class_id: classId,
        lesson_plan_day_id: Number(day)
      };
      const response = await createWhiteboardSession(data);
      console.log('white', response);
      if (response && response.data) {
        setSessionToken(response.data.session_id);
      } else {
        showSnackbar({
          title: 'Error',
          description: response.message || 'Failed to create whiteboard session.',
          status: 'error'
        });
      }
    } catch (error) {
      showSnackbar({
        title: 'Error',
        description: 'An unexpected error occurred while creating whiteboard session.',
        status: 'error'
      });
    }
  }


  useEffect(() => {
    getLessonData();
  }, []);

  useEffect(() => {
    sessionStorage.setItem('sessionId',sessionToken)
  },[sessionToken])

  const handleMarkAsCompleted = async () => {
    try {
      if (!lessonData) return;
      const data = {
        lesson_plan_day_id: lessonData.lesson_plan_day_id,
        status: 'completed',
        school_id: Number(schoolId)
      };
      const response = await updateLessonPlanDayStatus(data);
      if (response && response.message) {
        showSnackbar({
          title: 'Success',
          description: response.message || 'Day marked as completed successfully.',
          status: 'success'
        });
        // Refresh lesson data to reflect the updated status
        getLessonData();
      } else {
        showSnackbar({
          title: 'Error',
          description: response.message || 'Failed to update day status.',
          status: 'error'
        });
      }
    } catch (error) {
      showSnackbar({
        title: 'Error',
        description: 'An unexpected error occurred while updating day status.',
        status: 'error'
      });
    }
  }

  const handleStartTeaching = () => {
    navigate(`/grades/lesson-plan/whiteboard/${chapterId}/${day}?subject=${subject}&chapter_name=${encodeURIComponent(chapterName)}&${pathData}`);
  };

  const getTotalTime = () => {
    if (!lessonData) return 0;
    return lessonData.topics.reduce((total, topic) => total + topic.time_minutes, 0);
  };

  if (!lessonData) {
    return (
      <MainLayout pageTitle={`Chapter ${chapterId}: ${chapterName} - Day ${day}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Loading lesson plan...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle={`Chapter ${chapterId}: ${chapterName} - Day ${lessonData.day}`}>
      <div className="space-y-8">
        {/* <Breadcrumb items={breadcrumbItems} /> */}
        <div className='w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
          <Link
            to={`/grades/chapter/${chapterId}?${pathData}&tab=lesson-plan`}
            className="max-w-fit flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>


          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className={`flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors ${lessonData.status === 'completed' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={lessonData.status === 'completed'}
              >
                <BadgeCheck className="w-4 h-4" />
                {
                  lessonData.status === 'completed' ? 'Completed' : 'Mark as Completed'
                }
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Mark as Completed</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-700">
                  <p>Great work!</p>
                  <span>
                    Do you want to mark this day as completed? (You won’t be able to undo this later.)
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleMarkAsCompleted} className="bg-green-500 hover:bg-green-600">
                  Mark as Completed
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>

        {/* Topics Section */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className={`${window.innerWidth >= 768 ? 'flex ' : 'flex-col '} items-center justify-between`}>
              <div className='w-full flex flex-wrap items-center justify-between gap-6 mb-4 md:mb-0'>
                <div className="flex flex-col">
                  <span className="text-lg md:text-2xl font-bold text-gray-900">Lesson Plan Activities</span>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      {/* <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900">{overallProgress}%</span> */}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="teDayLessonPlanxt-sm text-sm md:text-lg">Total: {getTotalTime()} minutes</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-800 border-blue-300">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm" className="text-green-600 hover:text-green-800 border-green-300">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button> */}
                  {/* onClick={handleStartTeaching} */}
                  <Button className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleStartTeaching}>
                    <Play className="w-4 h-4 mr-2" />
                    Open White Board
                  </Button>
                </div>
              </div>

            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {lessonData.topics.map((topic, index) => (
                <div key={topic.topic_id} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="hidden md:block flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm md:text-lg">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="hidden md:block text-sm md:text-lg font-semibold text-gray-900">
                        {topic.title}
                      </h3>
                      <h3 className="md:hidden text-sm md:text-lg font-semibold text-gray-900">
                        {(index + 1) + ') ' + topic.title}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600 bg-white px-3 py-1 rounded-full border ml-4">
                        <Clock className="w-3 h-3" />
                        {topic.time_minutes} min
                      </div>
                    </div>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {topic.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Outcomes, Applications, and Taxonomy */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-lg border-0 bg-green-50 border-green-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Learning Outcomes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* <p className="text-green-700 text-sm leading-relaxed">{lessonData.learning_outcomes}</p> */}
              <p className="text-green-700 text-sm leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {lessonData.learning_outcomes}
                </ReactMarkdown>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-purple-50 border-purple-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Real World Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* <p className="text-purple-700 text-sm leading-relaxed">{lessonData.real_world_applications}</p> */}
              <p className="text-purple-700 text-sm leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {lessonData.real_world_applications}
                </ReactMarkdown>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-orange-50 border-orange-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-orange-800 flex items-center gap-2">
                <BookMarked className="w-5 h-5" />
                Taxonomy Alignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* <p className="text-orange-700 text-sm leading-relaxed">{lessonData.taxonomy_alignment}</p> */}
              <p className="text-orange-700 text-sm leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {lessonData.taxonomy_alignment}
                </ReactMarkdown>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default DayLessonPlan;
