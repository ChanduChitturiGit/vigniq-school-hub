
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { WhiteboardCanvas } from '../components/whiteboard/WhiteboardCanvas';
import { 
  ArrowLeft, 
  Maximize2, 
  Minimize2,
  Save
} from 'lucide-react';

interface LessonActivity {
  serialNumber: number;
  title: string;
  description: string;
}

const WhiteboardTeaching: React.FC = () => {
  const { chapterId, day } = useParams();
  const [searchParams] = useSearchParams();
  
  const subject = searchParams.get('subject') || '';
  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const classId = searchParams.get('classId') || '';
  const subjectId = searchParams.get('subjectId') || '';
  const schoolId = searchParams.get('schoolId') || '';
  const boardId = searchParams.get('boardId') || '';
  const chapterName = searchParams.get('chapterName') || '';
  const pathData = `class=${className}&class_id=${classId}&section=${section}&subject=${subject}&subject_id=${subjectId}&school_board_id=${boardId}&school_id=${schoolId}`

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(1);
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);

  const [activities] = useState<LessonActivity[]>([
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
  ]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSave = () => {
    if (fabricCanvas) {
      const canvasData = JSON.stringify(fabricCanvas.toJSON());
      localStorage.setItem(`whiteboard-${chapterId}-${day}`, canvasData);
      // Here you would typically send this data to your backend
      console.log('Saving whiteboard data:', canvasData);
    }
  };

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-white"
    : "h-screen bg-gray-50";

  return (
    <div className={containerClass}>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className={`${isFullscreen ? 'w-80' : 'w-96'} bg-white border-r border-gray-200 flex flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Link
                to={`/grades/lesson-plan/day/${chapterId}/${day}?${pathData}&chapterName=${encodeURIComponent(chapterName)}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </Link>
              <Button 
                onClick={toggleFullscreen}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Chapter {chapterId}: {chapterName}</h1>
              <p className="text-sm text-blue-600 font-medium">Day {day} - Teaching Mode</p>
            </div>
          </div>

          {/* Lesson Activities */}
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lesson Activities</h2>
            <div className="space-y-3">
              {activities.map((activity) => (
                <Card 
                  key={activity.serialNumber} 
                  className={`cursor-pointer transition-colors ${
                    currentActivity === activity.serialNumber 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentActivity(activity.serialNumber)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        currentActivity === activity.serialNumber
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {activity.serialNumber}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          {activity.title}
                        </h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="p-4 border-t border-gray-200">
            <Button onClick={handleSave} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Progress
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Area */}
          <div className="flex-1 bg-gray-100 p-4">
            <div className="h-full">
              <WhiteboardCanvas onCanvasChange={setFabricCanvas} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhiteboardTeaching;
