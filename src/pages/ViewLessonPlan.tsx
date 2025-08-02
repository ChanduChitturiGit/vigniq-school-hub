
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  ArrowLeft, 
  TrendingUp, 
  Eye, 
  MessageSquare,
  Calculator
} from 'lucide-react';

interface DayPlan {
  day: number;
  date: string;
}

const ViewLessonPlan: React.FC = () => {
  const { chapterId, lessonPlanId } = useParams();
  const [searchParams] = useSearchParams();
  
  const subject = searchParams.get('subject') || '';
  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const chapterName = decodeURIComponent(searchParams.get('chapterName') || '');

  const [days, setDays] = useState<DayPlan[]>([]);
  const [overallProgress] = useState(75);

  const breadcrumbItems = [
    { label: 'Grades', path: '/grades' },
    { label: `${subject} - ${className} ${section}`, path: `/grades/syllabus/math_6a?class=${className}&section=${section}&subject=${subject}` },
    { label: 'View Lesson Plan' }
  ];

  useEffect(() => {
    // Sample data for lesson plan days
    const sampleDays: DayPlan[] = [
      { day: 1, date: 'October 26, 2023' },
      { day: 2, date: 'October 27, 2023' },
      { day: 3, date: 'October 28, 2023' },
      { day: 4, date: 'October 29, 2023' },
      { day: 5, date: 'October 30, 2023' }
    ];
    setDays(sampleDays);
  }, []);

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-blue-600';
    if (progress >= 40) return 'bg-blue-500';
    return 'bg-blue-400';
  };

  return (
    <MainLayout pageTitle={`Chapter ${chapterId}: ${chapterName}`}>
      <div className="space-y-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={`/grades/syllabus/math_6a?class=${className}&section=${section}&subject=${subject}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Syllabus</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
            <Calculator className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chapter {chapterId}: {chapterName}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-lg text-gray-600">Overall Progress</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getProgressColor(overallProgress)} transition-all duration-500`}
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-gray-900">{overallProgress}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {days.map((dayPlan) => (
            <Card key={dayPlan.day} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Day {dayPlan.day}
                    </h3>
                    <p className="text-sm text-gray-600">{dayPlan.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <Link
                    to={`/grades/lesson-plan/day/${chapterId}/${dayPlan.day}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapterName)}`}
                    className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 rounded-lg transition-colors text-sm font-medium flex-1 justify-center"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                  <Link
                    to={`/grades/lesson-plan/ai-chat/${chapterId}/${dayPlan.day}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapterName)}`}
                    className="flex items-center gap-2 bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200 hover:border-purple-300 px-3 py-2 rounded-lg transition-colors text-sm font-medium flex-1 justify-center"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat with AI Assistant
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default ViewLessonPlan;
