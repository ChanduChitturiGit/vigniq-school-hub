
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
  BookMarked
} from 'lucide-react';
import { useSnackbar } from '../components/snackbar/SnackbarContext';
import { getLessonPlanDataByDay } from '../services/grades';

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

  const subject = searchParams.get('subject') || '';
  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const classId = searchParams.get('classId') || '';
  const subjectId = searchParams.get('subjectId') || '';
  const schoolId = searchParams.get('schoolId') || '';
  const boardId = searchParams.get('boardId') || '';
  const chapterName = searchParams.get('chapterName') || '';
  const pathData = `${subjectId}?class=${className}&class_id=${classId}&section=${section}&subject=${subject}&subject_id=${subjectId}&school_board_id=${boardId}&school_id=${schoolId}`


  const [lessonData, setLessonData] = useState<LessonPlanDay | null>(null);
  const [overallProgress] = useState(0);

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

  useEffect(() => {
    // Sample data for lesson plan day
    getLessonData();
    const sampleActivities: LessonPlanDay = {
      "lesson_plan_day_id": 31,
      "day": 1,
      "learning_outcomes": "Students will be able to define the division algorithm, apply Euclid's algorithm to find the HCF of two positive integers, and use the division algorithm to prove basic properties of integers related to their form (even/odd, squares, cubes).",
      "real_world_applications": "The division algorithm is fundamental to cryptography and computer science. Euclid's algorithm is used in various computational tasks, such as simplifying fractions and in computer graphics. The bee puzzle demonstrates its use in solving real-world problems involving remainders.",
      "taxonomy_alignment": "Understanding (Division Algorithm, Euclid's Algorithm), Applying (finding HCF, proving integer properties), Analyzing (interpreting results of the algorithm).",
      "status": "not_started",
      "topics": [
        {
          "topic_id": 94,
          "title": "Introduction to Real Numbers & Division Algorithm",
          "summary": "Begin with a real-world puzzle (bees and flowers) to introduce the concept of remainders in division. Generalize this to the Division Algorithm: for positive integers 'a' and 'b', there exist unique whole numbers 'q' and 'r' such that a = bq + r, where 0 ≤ r < b.",
          "time_minutes": 20
        },
        {
          "topic_id": 95,
          "title": "Euclid's Division Algorithm",
          "summary": "Introduce Theorem 1.1 (Euclid's Division Algorithm) as a technique to compute the Highest Common Factor (HCF) of two positive integers. Demonstrate the algorithm using an activity (paper strips) and an example (HCF of 60 and 100). Emphasize that HCF(c, d) = HCF(d, r).",
          "time_minutes": 30
        },
        {
          "topic_id": 96,
          "title": "Applications of Division Algorithm",
          "summary": "Apply the division algorithm to prove properties of integers. Examples include showing that every positive even integer is of the form 2q and every positive odd integer is of the form 2q + 1. Further examples involve proving that positive odd integers are of the form 4q + 1 or 4q + 3, and exploring squares/cubes of integers (3p, 3p+1, 9m, 9m+1, 9m+8).",
          "time_minutes": 40
        }
      ]
    };
    // setLessonData(sampleActivities);
  }, []);

  const handleStartTeaching = () => {
    navigate(`/grades/lesson-plan/whiteboard/${chapterId}/${day}?subject=${subject}&subjectId=${pathData}&chapterName=${encodeURIComponent(chapterName)}`);
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
        <Breadcrumb items={breadcrumbItems} />

        {/* <div className="flex items-center justify-between">subject
          <div className="flex items-center gap-4">
            <Link
              //to={`/grades/lesson-plan/view/${chapterId}/1?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapterName)}`}
              to={`/grades/syllabus/${pathData}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
          </div>
        </div> */}

        {/* <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
            <Calculator className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Chapter {chapterId}: {chapterName}</h1>
            <p className="text-lg text-blue-600 font-medium">Day {lessonData.day}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <span className="text-m font-bold text-gray-900">{overallProgress}%</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Total: {getTotalTime()} minutes</span>
              </div>
            </div>
          </div>
        </div> */}

        {/* Topics Section */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className={`${window.innerWidth >= 768 ? 'flex ' : 'flex-col '} items-center justify-between`}>
              <div>
                <span className="text-lg md:text-2xl font-bold text-gray-900">Lesson Plan Activities</span>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900">{overallProgress}%</span>
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
                  Start
                </Button>
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
              <p className="text-green-700 text-sm leading-relaxed">{lessonData.learning_outcomes}</p>
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
              <p className="text-purple-700 text-sm leading-relaxed">{lessonData.real_world_applications}</p>
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
              <p className="text-orange-700 text-sm leading-relaxed">{lessonData.taxonomy_alignment}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default DayLessonPlan;
