
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  ArrowLeft, 
  Download, 
  Print,
  Play,
  Calculator
} from 'lucide-react';

interface LessonActivity {
  serialNumber: number;
  title: string;
  description: string;
}

const DayLessonPlan: React.FC = () => {
  const { chapterId, day } = useParams();
  const [searchParams] = useSearchParams();
  
  const subject = searchParams.get('subject') || '';
  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const chapterName = decodeURIComponent(searchParams.get('chapterName') || '');

  const [activities, setActivities] = useState<LessonActivity[]>([]);
  const [overallProgress] = useState(75);

  const breadcrumbItems = [
    { label: 'Grades', path: '/grades' },
    { label: `${subject} - ${className} ${section}`, path: `/grades/syllabus/math_6a?class=${className}&section=${section}&subject=${subject}` },
    { label: 'Day Lesson Plan' }
  ];

  useEffect(() => {
    // Sample data for lesson activities
    const sampleActivities: LessonActivity[] = [
      {
        serialNumber: 1,
        title: 'Introduction to Numbers',
        description: 'Brief overview of the chapter and importance of numbers in daily life. Icebreaker activity related to numbers.'
      },
      {
        serialNumber: 2,
        title: 'Comparing Numbers',
        description: 'Understanding place value, identifying greater and smaller numbers. Examples and practice exercises.'
      },
      {
        serialNumber: 3,
        title: 'Break',
        description: 'Short break for students.'
      },
      {
        serialNumber: 4,
        title: 'Large Numbers in Practice',
        description: 'Reading and writing large numbers. Use of commas. Real-world examples of large numbers.'
      },
      {
        serialNumber: 5,
        title: 'Recap and Q&A',
        description: 'Summarize the topics covered. Address student questions and doubts.'
      }
    ];
    setActivities(sampleActivities);
  }, []);

  return (
    <MainLayout pageTitle={`Chapter ${chapterId}: ${chapterName} - Day ${day}`}>
      <div className="space-y-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={`/grades/lesson-plan/view/${chapterId}/1?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapterName)}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
            <Calculator className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Chapter {chapterId}: {chapterName}</h1>
            <p className="text-xl text-blue-600 font-medium">Day {day}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="text-lg font-bold text-gray-900">{overallProgress}%</span>
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">Lesson Plan</span>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-800 border-blue-300">
                  <Print className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm" className="text-green-600 hover:text-green-800 border-green-300">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity.serialNumber} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {activity.serialNumber}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {activity.title}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DayLessonPlan;
