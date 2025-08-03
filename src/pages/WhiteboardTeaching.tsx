
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Maximize2, 
  Minimize2, 
  Undo2, 
  Redo2, 
  Edit3, 
  Settings, 
  X,
  ChevronLeft,
  ChevronRight,
  Calculator,
  BookOpen
} from 'lucide-react';

interface LessonActivity {
  serialNumber: number;
  title: string;
  description: string;
  points: string[];
}

const WhiteboardTeaching: React.FC = () => {
  const { chapterId, day } = useParams();
  const [searchParams] = useSearchParams();
  
  const subject = searchParams.get('subject') || '';
  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const chapterName = decodeURIComponent(searchParams.get('chapterName') || '');

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [activities, setActivities] = useState<LessonActivity[]>([]);

  useEffect(() => {
    // Sample data for lesson activities with points
    const sampleActivities: LessonActivity[] = [
      {
        serialNumber: 1,
        title: 'Introduction to Numbers',
        description: 'Brief overview of the chapter and importance of numbers in daily life. Icebreaker activity related to numbers.',
        points: [
          'Start with a number counting game',
          'Discuss where we see numbers in daily life',
          'Ask students about their favorite numbers',
          'Introduce the concept of large numbers'
        ]
      },
      {
        serialNumber: 2,
        title: 'Comparing Numbers',
        description: 'Understanding place value, identifying greater and smaller numbers. Examples and practice exercises.',
        points: [
          'Explain place value concept',
          'Show examples of 3-digit vs 4-digit numbers',
          'Practice comparing numbers on board',
          'Interactive exercise with student participation'
        ]
      },
      {
        serialNumber: 3,
        title: 'Break',
        description: 'Short break for students.',
        points: [
          '10-minute break',
          'Students can stretch and move around',
          'Prepare materials for next activity'
        ]
      },
      {
        serialNumber: 4,
        title: 'Large Numbers in Practice',
        description: 'Reading and writing large numbers. Use of commas. Real-world examples of large numbers.',
        points: [
          'Demonstrate comma placement in large numbers',
          'Show real-world examples (population, distances)',
          'Practice reading large numbers aloud',
          'Writing exercise on the board'
        ]
      },
      {
        serialNumber: 5,
        title: 'Recap and Q&A',
        description: 'Summarize the topics covered. Address student questions and doubts.',
        points: [
          'Quick review of key concepts',
          'Answer student questions',
          'Assign homework if applicable',
          'Preview next day\'s topics'
        ]
      }
    ];
    
    setActivities(sampleActivities);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const nextActivity = () => {
    setCurrentActivity((prev) => (prev + 1) % activities.length);
  };

  const prevActivity = () => {
    setCurrentActivity((prev) => (prev - 1 + activities.length) % activities.length);
  };

  const currentLesson = activities[currentActivity];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={`/grades/lesson-plan/day/${chapterId}/${day}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapterName)}`}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">Back</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calculator className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Chapter {chapterId}: {chapterName}</h1>
              <p className="text-sm text-gray-600">Day {day}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${75}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">75%</span>
          
          <div className="ml-4 flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-full">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              TR
            </div>
            <span className="text-sm font-medium text-orange-800 hidden sm:inline">Teja Reddy</span>
            <ChevronLeft className="w-3 h-3 text-orange-600 rotate-90" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Whiteboard Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Whiteboard</h2>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-800">
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-800">
                <Redo2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-800">
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-800">
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                Save as PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="text-gray-600 hover:text-gray-800"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-800 border-red-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Whiteboard Area */}
          <div className="flex-1 bg-white m-4 border-2 border-gray-200 rounded-lg relative overflow-hidden">
            <div className="absolute inset-4 bg-gray-50 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-lg font-medium mb-2">Whiteboard Area</div>
                <div className="text-sm">Interactive whiteboard for teaching</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Plan Sidebar */}
        <div className={`bg-white border-l border-gray-200 transition-all duration-300 ${
          isSidebarOpen ? 'w-80' : 'w-12'
        } flex flex-col`}>
          {/* Sidebar Toggle */}
          <div className="border-b border-gray-200 p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full justify-center"
            >
              {isSidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>

          {isSidebarOpen && (
            <>
              {/* Activity Navigation */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Current Activity</h3>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={prevActivity}
                      disabled={currentActivity === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      {currentActivity + 1} / {activities.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextActivity}
                      disabled={currentActivity === activities.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Current Activity Details */}
              {currentLesson && (
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {currentLesson.serialNumber}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{currentLesson.title}</h4>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {currentLesson.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <h5 className="font-medium text-gray-900">Key Points</h5>
                      </div>
                      
                      {currentLesson.points.map((point, index) => (
                        <div key={index} className="flex items-start gap-3 p-2 bg-blue-50 rounded-lg">
                          <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-sm text-gray-700 leading-relaxed">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhiteboardTeaching;
