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
import { getLessonPlanDataByDay, getWhiteboardData } from '../services/grades';
import { useSnackbar } from '../components/snackbar/SnackbarContext';
import { environment } from '@/environment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';




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
  const baseurl = environment.baseurl;

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
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const pathData = `class=${className}&class_id=${classId}&section=${section}&subject=${subject}&subject_id=${subjectId}&school_board_id=${boardId}&school_id=${schoolId}&chapter_number=${chapterNumber}&chapter_name=${chapterName}&progress=${progress}&tab=${tab}`;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'triangle' | 'text'>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [currentActivity, setCurrentActivity] = useState(1);
  const [lessonData, setLessonData] = useState<any>([]);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(true);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(1);
  const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [slideImages, setSlideImages] = useState<(ImageData | null)[]>([null]);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [savedData, setSavedData] = useState<any>(null);

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

  //getWhiteboardData
  const getWhiteboardSavedData = async () => {
    try {
      const data = {
        // chapter_id: chapterId,
        // lesson_plan_day_id: day,
        // subject: subject,
        // class: className,
        // section: section,
        school_id: schoolId,
        // board_id: boardId,
        // subject_id: subjectId,
        // class_id: classId,
        session_id: sessionToken

      };
      const response = await getWhiteboardData(data);
      if (response && response.data) {
        setSavedData(response.data);
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
    const sessionId = sessionStorage.getItem('sessionId');
    setSessionToken(sessionId);
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save current canvas image before resizing
    let savedImageData: ImageData | null = null;
    if (canvas.width > 0 && canvas.height > 0) {
      try {
        savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (err) {
        savedImageData = null;
      }
    }

    // Set canvas size with improved smoothing
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        const devicePixelRatio = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();

        canvas.width = rect.width * devicePixelRatio;
        canvas.height = rect.height * devicePixelRatio;

        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';

        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform before scaling
        ctx.scale(devicePixelRatio, devicePixelRatio);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Enable smoothing for better drawing quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Restore saved image data after resizing
        if (savedImageData) {
          try {
            ctx.putImageData(savedImageData, 0, 0);
          } catch (err) {
            // Ignore if putImageData fails
          }
        }
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      setTimeout(updateCanvasSize, 100);
      // If fullscreen has exited, call handleSaveData
      if (!document.fullscreenElement) {
        handleSaveData();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  useEffect(() => {
    getLessonData();
    setIsFullscreen(true);
    toggleFullscreen();
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let x = (e.clientX - rect.left) * scaleX;
    let y = (e.clientY - rect.top) * scaleY;

    // Pixel alignment for smooth writing
    x = Math.round(x * 2) / 2;
    y = Math.round(y * 2) / 2;

    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const { x, y } = getCoordinates(e);

    // Save current state to history
    saveToHistory();

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const wsRef = useRef<WebSocket | null>(null);
  const drawBufferRef = useRef<any[]>([]);
  const pointsRef = useRef<{ x: number, y: number }[]>([]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX = 0, clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // WebSocket setup
  useEffect(() => {
    if (sessionToken && sessionToken != '') {
      getWhiteboardSavedData();

      wsRef.current = new WebSocket(`${baseurl}/ws/whiteboard/${sessionStorage.getItem('sessionId')}/?token=${sessionStorage.getItem('access_token')}&school_id=${userData.school_id}`);
      wsRef.current.onopen = () => console.log('WebSocket connected');
      wsRef.current.onclose = () => console.log('WebSocket disconnected');
    }
    return () => {
      sendDrawChunk();
      wsRef.current?.close();
    };
  }, [sessionToken]);

  const lastPointRef = useRef<{ x: number, y: number } | null>(null);

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const { x, y } = getCanvasCoordinates(e)//getCoordinates(e);
    pointsRef.current.push({ x, y });

    if (currentTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Add current point to buffer
      pointsRef.current.push({ x, y });

      // Only draw if we have enough points for a curve
      if (pointsRef.current.length >= 4) {
        const [p0, p1, p2, p3] = pointsRef.current.slice(-4);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.stroke();
      } else if (pointsRef.current.length >= 2) {
        // For first few points, just draw a line
        const [p0, p1] = pointsRef.current.slice(-2);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      pointsRef.current.push({ x, y });

      if (pointsRef.current.length >= 4) {
        const [p0, p1, p2, p3] = pointsRef.current.slice(-4);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.stroke();
      } else if (pointsRef.current.length >= 2) {
        const [p0, p1] = pointsRef.current.slice(-2);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    }

    // Buffer the event
    drawBufferRef.current.push({
      x, y,
      tool: currentTool,
      color: currentColor,
      size: brushSize,
      slide: currentSlide,
      timestamp: Date.now()
    });

    if (drawBufferRef.current.length >= 20) {
      sendDrawChunk();
    }
  };

  // Send chunk via WebSocket
  const sendDrawChunk = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && drawBufferRef.current && drawBufferRef.current.length > 0) {
      wsRef.current.send(JSON.stringify({
        type: 'draw',
        data: drawBufferRef.current
      }));
      drawBufferRef.current = []; // Clear buffer after send
    }
  };

  // Optionally, send remaining buffer every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (drawBufferRef.current.length > 0) {
        sendDrawChunk();
      }
    }, 5000);
    return () => {
      clearInterval(interval);
    }
  }, []);

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
    pointsRef.current = [];
    saveCurrentSlideImage(); // <-- Add this line
  };

  // Helper to save current canvas to slideImages
  const saveCurrentSlideImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setSlideImages((prev) => {
      const updated = [...prev];
      updated[currentSlide - 1] = imageData;
      return updated;
    });
  };

  // Helper to load image data for a slide
  const loadSlideImage = (slideNum: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const imageData = slideImages[slideNum - 1];
    if (imageData) {
      ctx.putImageData(imageData, 0, 0);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSlideImages((prev) => {
      const updated = [...prev];
      updated[currentSlide - 1] = null;
      return updated;
    });
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Enter fullscreen
      setIsFullscreen(true);
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      // First exit fullscreen mode, then handle navigation
      setIsFullscreen(false);
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleBackNavigation = () => {
    if (isFullscreen) {
      // If in fullscreen, first exit fullscreen
      toggleFullscreen();
      window.history.back();
    } else {
      // Navigate back normally
      window.history.back();
    }
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

    // Limit history to 50 steps for performance
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }

    setDrawingHistory(newHistory);
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

  // Update addSlide to add a new blank slide
  const addSlide = () => {
    saveCurrentSlideImage(); // Save current slide's drawing
    setTotalSlides((prev) => prev + 1);
    setSlideImages((prev) => [...prev, null]);
    setCurrentSlide(totalSlides + 1); // Move to new slide
  };

  const removeSlide = () => {
    if (totalSlides > 1) {
      saveCurrentSlideImage();
      setTotalSlides(totalSlides - 1);
      setSlideImages((prev) => prev.slice(0, -1));
      if (currentSlide > totalSlides - 1) {
        setCurrentSlide(totalSlides - 1);
        setTimeout(() => loadSlideImage(totalSlides - 1), 0);
      }
    }
  };

  const goToSlide = (slideNumber: number) => {
    saveCurrentSlideImage(); // Save current slide's drawing
    setCurrentSlide(slideNumber); // Switch slide
  };

  // Load slide image whenever currentSlide changes
  useEffect(() => {
    loadSlideImage(currentSlide);
    // Optionally reset drawing history for each slide if needed
    setDrawingHistory([]);
    setHistoryIndex(-1);
    // eslint-disable-next-line
  }, [currentSlide]);


  const handleSaveData = async () => {
    sendDrawChunk();
    wsRef.current?.close();
    handleBackNavigation();
  }

  const containerClass = isFullscreen
    ? "fixed inset-0 z-50 bg-background"
    : "h-screen bg-muted/30";

  const replaySavedData = (slideNum: number) => {
    if (!savedData || !Array.isArray(savedData)) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear canvas before replaying
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Filter data for the current slide
    const slideData = savedData.filter((d) => d.slide === slideNum);

    if (slideData.length === 0) return;

    ctx.save();
    for (let i = 1; i < slideData.length; i++) {
      const prev = slideData[i - 1];
      const curr = slideData[i];

      ctx.beginPath();
      ctx.lineWidth = curr.size;
      ctx.strokeStyle = curr.color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (curr.tool === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
      } else if (curr.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      }

      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();
    }
    ctx.restore();
  };

  useEffect(() => {
    if (savedData) {
      replaySavedData(currentSlide);
    }
    // eslint-disable-next-line
  }, [savedData, currentSlide]);

  useEffect(() => {
    if (savedData && Array.isArray(savedData)) {
      // Find the max slide number in savedData
      const maxSlide = Math.max(...savedData.map((d) => d.slide));
      if (maxSlide > 1) {
        setTotalSlides(maxSlide);
        setCurrentSlide(maxSlide);
        // Preload all slide images from savedData
        setSlideImages((prev) => {
          const updated = [...prev];
          for (let i = 0; i < maxSlide; i++) {
            // Create a temporary canvas to replay and get image data
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvasRef.current?.width || 800;
            tempCanvas.height = canvasRef.current?.height || 600;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              tempCtx.fillStyle = 'white';
              tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
              const slideData = savedData.filter((d) => d.slide === i + 1);
              for (let j = 1; j < slideData.length; j++) {
                const prev = slideData[j - 1];
                const curr = slideData[j];
                tempCtx.beginPath();
                tempCtx.lineWidth = curr.size;
                tempCtx.strokeStyle = curr.color;
                tempCtx.lineCap = 'round';
                tempCtx.lineJoin = 'round';
                tempCtx.globalCompositeOperation = curr.tool === 'pen' ? 'source-over' : 'destination-out';
                tempCtx.moveTo(prev.x, prev.y);
                tempCtx.lineTo(curr.x, curr.y);
                tempCtx.stroke();
              }
              updated[i] = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            }
          }
          return updated;
        });

        // Immediately load the highest slide image onto the canvas
        setTimeout(() => {
          loadSlideImage(maxSlide);
        }, 0);
      }
    }
  }, [savedData]);

  const handleSaveAsPDF = async () => {
    // Save the current slide's image before PDF generation
    saveCurrentSlideImage();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    for (let i = 0; i < totalSlides; i++) {
      // Load the image for this slide into the canvas
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (slideImages[i]) {
        ctx.putImageData(slideImages[i], 0, 0);
      } else {
        replaySavedData(i + 1);
      }

      const imgData = canvas.toDataURL('image/png');
      if (i > 0) pdf.addPage([canvas.width, canvas.height], 'landscape');
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    }

    pdf.save('whiteboard.pdf');

    handleSaveData();
  };

  return (
    <div className={containerClass}>
      <div className="flex h-full relative">
        {/* Overlay Left Sidebar */}
        <div className={`${isLeftSidebarCollapsed ? 'translate-x-[-100%] w-0' : 'translate-x-0'} ${isFullscreen ? 'w-80' : 'w-96'} bg-background/95 backdrop-blur-sm border-r border-border flex flex-col transition-all duration-300 ease-in-out absolute left-0 top-0 h-full z-30 shadow-lg`}>
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="w-full flex items-center justify-end my-3">
              <button
                onClick={handleBackNavigation}
                className="flex items-center gap-2 text-primary hover:text-primary/80"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Chapter {chapterId}: {chapterName}</h1>
              <p className="text-sm text-primary font-medium">Day {lessonData.day} - Teaching Mode</p>
            </div>
          </div>

          {/* Lesson Activities */}
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">Lesson Activities</h2>
            <div className="space-y-3">
              {lessonData && lessonData.topics && lessonData.topics.map((activity, index) => (
                <Card
                  key={activity.topic_id}
                  className={`cursor-pointer transition-colors ${currentActivity === activity.topic_id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                    }`}
                  onClick={() => setCurrentActivity(activity.topic_id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentActivity === activity.topic_id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                        }`}>
                        {index + 1}
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
              className="absolute top-4 left-4 z-40 bg-blue-200 backdrop-blur-sm"
            >
              <Menu className="w-4 h-4" />
            </Button>

            {/* Fullscreen Toggle */}
            {/* <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 z-40 bg-blue-100 backdrop-blur-sm"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button> */}

            {/* Right-to-Left Sliding Toolbar */}
            <div className={`absolute top-4 right-5 z-30  bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg transition-transform duration-300 ${isToolbarVisible ? 'translate-x-0' : 'translate-x-[calc(100%+1rem)]'
              }`}>
              <div className="p-3">
                <div className="flex flex-col gap-3">
                  {/* Drawing Tools */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => { setCurrentTool('pen'); setIsToolbarVisible(false); }}
                      variant={currentTool === 'pen' ? 'default' : 'outline'}
                      size="sm"
                      className="justify-start"
                    >
                      <Pen className="w-4 h-4 mr-2" />
                      Pen
                    </Button>
                    <Button
                      onClick={() => { setCurrentTool('eraser'); setIsToolbarVisible(false); }}
                      variant={currentTool === 'eraser' ? 'default' : 'outline'}
                      size="sm"
                      className="justify-start"
                    >
                      <Eraser className="w-4 h-4 mr-2" />
                      Eraser
                    </Button>
                    {/* <Button
                      onClick={() => { setCurrentTool('rectangle'); setIsToolbarVisible(false); }}
                      variant={currentTool === 'rectangle' ? 'default' : 'outline'}
                      size="sm"
                      className="justify-start"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Rectangle
                    </Button>
                    <Button
                      onClick={() => { setCurrentTool('circle'); setIsToolbarVisible(false); }}
                      variant={currentTool === 'circle' ? 'default' : 'outline'}
                      size="sm"
                      className="justify-start"
                    >
                      <Circle className="w-4 h-4 mr-2" />
                      Circle
                    </Button>
                    <Button
                      onClick={() => { setCurrentTool('triangle'); setIsToolbarVisible(false); }}
                      variant={currentTool === 'triangle' ? 'default' : 'outline'}
                      size="sm"
                      className="justify-start"
                    >
                      <Triangle className="w-4 h-4 mr-2" />
                      Triangle
                    </Button> */}

                    {/* Colors */}
                    <div className="border-t pt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Palette className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Colors</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setCurrentColor(color)}
                            className={`w-6 h-6 rounded border-2 ${currentColor === color ? 'border-foreground' : 'border-border'
                              }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Brush Size */}
                    <div className="border-t pt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">Size: {brushSize}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Actions */}
                    <div className="border-t pt-2 space-y-2">
                      {/* <Button onClick={clearCanvas} variant="outline" size="sm" className="w-full justify-start">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Clear
                      </Button> */}
                      <Button variant="outline" size="sm" className="w-full justify-start"
                        onClick={handleSaveData}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start mt-2"
                        onClick={handleSaveAsPDF}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Download as PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Toolbar Toggle Button */}
              <Button
                onClick={toggleToolbar}
                variant="outline"
                size="sm"
                className="absolute -left-10 top-2 bg-blue-100 backdrop-blur-sm"
              >
                {isToolbarVisible ? '→' : '←'}
              </Button>
            </div>

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full h-full cursor-crosshair bg-white"
              style={{ touchAction: 'none' }}
            />

            {/* Undo/Redo Controls (Bottom Left) */}
            <div className="absolute bottom-4 left-4 flex gap-2 z-20">
              <Button
                onClick={undo}
                variant="outline"
                size="sm"
                className="bg-blue-100 backdrop-blur-sm"
                disabled={historyIndex <= 0}
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                onClick={redo}
                variant="outline"
                size="sm"
                className="bg-blue-100 backdrop-blur-sm"
                disabled={historyIndex >= drawingHistory.length - 1}
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>

            {/* Slide Controls (Bottom Right) */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
              {/* Minus Button */}
              {/* <Button
                onClick={removeSlide}
                variant="outline"
                size="sm"
                className="bg-blue-100 backdrop-blur-sm"
                disabled={currentSlide === 1}
              >
                <Minus className="w-4 h-4" />
              </Button> */}

              {/* Slide Navigation */}
              <div className="flex items-center gap-1 bg-blue-100 backdrop-blur-sm px-3 py-1 rounded border">
                {/* Previous Arrow */}
                {currentSlide > 1 && (
                  <button
                    onClick={() => goToSlide(currentSlide - 1)}
                    className="text-muted-foreground hover:text-foreground px-1"
                  >
                    &lt;
                  </button>
                )}

                {/* Slide Numbers */}
                {Array.from({ length: totalSlides }, (_, i) => i + 1).map((slideNum) => (
                  <button
                    key={slideNum}
                    onClick={() => goToSlide(slideNum)}
                    className={`px-2 py-1 text-sm font-medium rounded transition-colors ${currentSlide === slideNum
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                  >
                    {slideNum}
                  </button>
                ))}

                {/* Next Arrow */}
                {currentSlide < totalSlides && (
                  <button
                    onClick={() => goToSlide(currentSlide + 1)}
                    className="text-muted-foreground hover:text-foreground px-1"
                  >
                    &gt;
                  </button>
                )}
              </div>

              {/* Plus Button */}
              <Button
                onClick={addSlide}
                variant="outline"
                size="sm"
                className="bg-blue-100 backdrop-blur-sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Overlay backdrop when sidebar is open */}
        {!isLeftSidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black/20 z-20"
            onClick={toggleLeftSidebar}
          />
        )}
      </div>
    </div>
  );
};

export default WhiteboardTeaching;