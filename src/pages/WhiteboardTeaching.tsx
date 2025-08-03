
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  ArrowLeft, 
  Maximize2, 
  Minimize2,
  Pen,
  Eraser,
  Square,
  Circle,
  Type,
  Palette,
  RotateCcw,
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
  const chapterName = decodeURIComponent(searchParams.get('chapterName') || '');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'text'>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [currentActivity, setCurrentActivity] = useState(1);

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

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [isFullscreen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
                to={`/grades/lesson-plan/day/${chapterId}/${day}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapterName)}`}
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
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Drawing Tools */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentTool('pen')}
                  variant={currentTool === 'pen' ? 'default' : 'outline'}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Pen className="w-4 h-4" />
                  Pen
                </Button>
                <Button
                  onClick={() => setCurrentTool('eraser')}
                  variant={currentTool === 'eraser' ? 'default' : 'outline'}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Eraser className="w-4 h-4" />
                  Eraser
                </Button>
              </div>

              {/* Colors */}
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-gray-600" />
                <div className="flex gap-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCurrentColor(color)}
                      className={`w-6 h-6 rounded border-2 ${
                        currentColor === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Brush Size */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Size:</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-gray-600 w-6">{brushSize}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-auto">
                <Button onClick={clearCanvas} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-gray-100 p-4">
            <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full h-full cursor-crosshair"
                style={{ touchAction: 'none' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhiteboardTeaching;
