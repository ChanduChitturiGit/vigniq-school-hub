
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
  Save,
  Menu,
  X,
  Plus,
  Minus,
  Undo,
  Redo,
  Triangle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { getLessonPlanDataByDay } from '../services/grades';
import { useSnackbar } from '../components/snackbar/SnackbarContext';



interface LessonActivity {
  serialNumber: number;
  title: string;
  description: string;
}

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


const WhiteboardTeaching: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const { chapterId, day } = useParams();
  const [searchParams] = useSearchParams();
  
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
  const pathData = `class=${className}&class_id=${classId}&section=${section}&subject=${subject}&subject_id=${subjectId}&school_board_id=${boardId}&school_id=${schoolId}&chapter_number=${chapterNumber}&chapter_name=${chapterName}&progress=${progress}&tab=${tab}`;



  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'triangle' | 'text'>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [currentActivity, setCurrentActivity] = useState(1);
  const [lessonData, setLessonData] = useState<any>([]);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(1);
  const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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

  useEffect(() => {
    getLessonData();
  } , []);

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
    if (!isFullscreen) {
      // Enter fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const toggleLeftSidebar = () => {
    setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
  };

  const toggleToolbar = () => {
    setIsToolbarVisible(!isToolbarVisible);
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = drawingHistory.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setDrawingHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      const prevImageData = drawingHistory[historyIndex - 1];
      ctx.putImageData(prevImageData, 0, 0);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < drawingHistory.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      const nextImageData = drawingHistory[historyIndex + 1];
      ctx.putImageData(nextImageData, 0, 0);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const addSlide = () => {
    setTotalSlides(totalSlides + 1);
    setCurrentSlide(totalSlides + 1);
    clearCanvas();
  };

  const removeSlide = () => {
    if (totalSlides > 1) {
      setTotalSlides(totalSlides - 1);
      if (currentSlide > totalSlides - 1) {
        setCurrentSlide(totalSlides - 1);
      }
    }
  };

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-background"
    : "h-screen bg-muted/30";

  return (
    <div className={containerClass}>
      <div className="flex h-full">
        {/* Collapsible Left Sidebar */}
        <div className={`${isLeftSidebarCollapsed ? 'w-0' : (isFullscreen ? 'w-80' : 'w-96')} bg-background border-r border-border flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}>
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <Link
                to={`/grades/lesson-plan/day/${chapterId}/${day}?${pathData}`}
                className="flex items-center gap-2 text-primary hover:text-primary/80"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </Link>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Chapter {chapterId}: {chapterName}</h1>
              <p className="text-sm text-primary font-medium">Day {day} - Teaching Mode</p>
            </div>
          </div>

          {/* Lesson Activities */}
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">Lesson Activities</h2>
            <div className="space-y-3">
              {lessonData && lessonData.topics && lessonData.topics.map((activity) => (
                <Card 
                  key={activity.topic_id} 
                  className={`cursor-pointer transition-colors ${
                    currentActivity === activity.topic_id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setCurrentActivity(activity.topic_id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        currentActivity === activity.topic_id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {activity.topic_id}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-sm mb-1">
                          {activity.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {activity.summary}
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
        <div className="flex-1 flex flex-col relative">
          {/* Canvas Area */}
          <div className="flex-1 bg-muted/30 relative">
            {/* Hamburger Menu for Sidebar Toggle */}
            <Button
              onClick={toggleLeftSidebar}
              variant="outline"
              size="sm"
              className="absolute top-4 left-4 z-20 bg-background/90 backdrop-blur-sm"
            >
              {isLeftSidebarCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 z-20 bg-background/90 backdrop-blur-sm"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>

            {/* Toolbar Toggle */}
            <Button
              onClick={toggleToolbar}
              variant="outline"
              size="sm"
              className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-background/90 backdrop-blur-sm"
            >
              {isToolbarVisible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {/* Sliding Toolbar */}
            <div className={`absolute top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border transition-transform duration-300 ${
              isToolbarVisible ? 'translate-y-16' : '-translate-y-full'
            }`}>
              <div className="p-4">
                <div className="flex items-center gap-4 flex-wrap justify-center">
                  {/* Drawing Tools */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setCurrentTool('pen')}
                      variant={currentTool === 'pen' ? 'default' : 'outline'}
                      size="sm"
                    >
                      <Pen className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setCurrentTool('eraser')}
                      variant={currentTool === 'eraser' ? 'default' : 'outline'}
                      size="sm"
                    >
                      <Eraser className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setCurrentTool('rectangle')}
                      variant={currentTool === 'rectangle' ? 'default' : 'outline'}
                      size="sm"
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setCurrentTool('circle')}
                      variant={currentTool === 'circle' ? 'default' : 'outline'}
                      size="sm"
                    >
                      <Circle className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setCurrentTool('triangle')}
                      variant={currentTool === 'triangle' ? 'default' : 'outline'}
                      size="sm"
                    >
                      <Triangle className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setCurrentTool('text')}
                      variant={currentTool === 'text' ? 'default' : 'outline'}
                      size="sm"
                    >
                      <Type className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Colors */}
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <div className="flex gap-1">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setCurrentColor(color)}
                          className={`w-6 h-6 rounded border-2 ${
                            currentColor === color ? 'border-foreground' : 'border-border'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Brush Size */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Size:</span>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground w-6">{brushSize}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button onClick={clearCanvas} variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Canvas */}
            <div className="h-full p-4">
              <div className="h-full bg-background rounded-lg shadow-sm border border-border overflow-hidden relative">
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

            {/* Undo/Redo Controls (Bottom Left) */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <Button
                onClick={undo}
                variant="outline"
                size="sm"
                disabled={historyIndex <= 0}
                className="bg-background/90 backdrop-blur-sm"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                onClick={redo}
                variant="outline"
                size="sm"
                disabled={historyIndex >= drawingHistory.length - 1}
                className="bg-background/90 backdrop-blur-sm"
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>

            {/* Slide Controls (Bottom Right) */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <div className="bg-background/90 backdrop-blur-sm rounded-lg border border-border p-2 flex items-center gap-2">
                <Button
                  onClick={removeSlide}
                  variant="outline"
                  size="sm"
                  disabled={totalSlides <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  {currentSlide} / {totalSlides}
                </span>
                <Button
                  onClick={addSlide}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhiteboardTeaching;