import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Excalidraw, exportToCanvas, MainMenu } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { ArrowLeft, ArrowRight, List, Download } from "lucide-react";
import { Button } from '../components/ui/button';
import { environment } from '@/environment';
import { useSnackbar } from '../components/snackbar/SnackbarContext';
import { getLessonPlanDataByDay, getWhiteboardData } from '../services/grades';
import styles from "./ExcalidrawApp.module.css";
import { jsPDF } from "jspdf";


export default function ExcalidrawApp() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const baseurl = environment.baseurl;
  const { showSnackbar } = useSnackbar();
  const { chapterId, day } = useParams();
  const [searchParams] = useSearchParams();

  //params
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

  const bufferRef = useRef<any | null>(null); // holds last scene
  const lastSentRef = useRef<number>(0); // timestamp of last send
  const [savedData, setSavedData] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState<string>('');
  const excalidrawRef = useRef<any>(null);
  const excalidrawApiRef = useRef<any>(null);
  const [lessonData, setLessonData] = useState<any>([]);

  //getWhiteboardData
  const getWhiteboardSavedData = async (session_token: any = '') => {
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
        session_id: session_token != '' ? session_token : sessionToken

      };
      const response = await getWhiteboardData(data);
      if (response && response.data) {
        // setSavedData(response.data[0].data);
        const scene = response.data[response.data.length - 1]?.data;

        if (scene && excalidrawApiRef.current) {
          const safeAppState = {
            ...scene.appState,
            collaborators: new Map(),
          };

          excalidrawApiRef.current.updateScene({
            elements: scene.elements || [],
            appState: safeAppState,
            files: scene.files || {},
          });
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


  const goFullScreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if ((document.documentElement as any).webkitRequestFullscreen) {
      (document.documentElement as any).webkitRequestFullscreen(); // Safari
    } else if ((document.documentElement as any).msRequestFullscreen) {
      (document.documentElement as any).msRequestFullscreen(); // IE/Edge
    }
  };


  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen(); // Safari
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen(); // IE/Edge
    }
  };

  // 🔹 Listen for fullscreen changes
  useEffect(() => {
    const sessionId = sessionStorage.getItem('sessionId');
    setSessionToken(sessionId);
    getWhiteboardSavedData(sessionId);
    getLessonData();

    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);
    document.addEventListener("msfullscreenchange", handleChange);


    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
      document.removeEventListener("msfullscreenchange", handleChange);
    };
  }, []);

  useEffect(() => {
    goFullScreen();
  }, []);


  useEffect(() => {
    if (!isFullscreen) {
      // 🔹 flush buffered scene data before leaving
      if (bufferRef.current) {
        sendScene(bufferRef.current);
        bufferRef.current = null;
      }
      // optional: wait a moment to ensure WebSocket send completes
      setTimeout(() => {
        navigate(`/grades/lesson-plan/day/${chapterId}/${day}?subject=${subject}&class=${className}&section=${section}&chapter_name=${encodeURIComponent(chapterName)}&day=${day}&${pathData}`); // go back
      }, 300);
    }
  }, [isFullscreen]);

  useEffect(() => {
    return () => {
      if (bufferRef.current) {
        sendScene(bufferRef.current);
        bufferRef.current = null;
      }
      wsRef.current?.close();
    };
  }, []);

  const handleBack = () => {
    exitFullScreen();
    navigate(-1); // go back
  };


  const [currentActivity, setCurrentActivity] = useState<number | null>(null);

  const handleBackNavigation = () => {
    window.history.back();
  };


  const [sceneData, setSceneData] = useState(null);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket setup similar to your previous code
  useEffect(() => {
    wsRef.current = new WebSocket(`${baseurl}/ws/whiteboard/${sessionStorage.getItem('sessionId')}/?token=${sessionStorage.getItem('access_token')}&school_id=${userData.school_id}`);
    wsRef.current.onopen = () => console.log('WebSocket connected');
    wsRef.current.onclose = () => console.log('WebSocket disconnected');
  }, []);

  const sendScene = (scene: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "scene",
          data: scene,
        })
      );
    }
  };

  // 🔹 Called by Excalidraw whenever something changes
  const handleSceneChange = (elements: any[], appState: any) => {
    const sceneData = {
      type: "excalidraw",
      version: 2,
      source: window.location.origin,
      elements,
      appState,
      files: {},
    };

    bufferRef.current = sceneData;

    const now = Date.now();
    const elapsed = now - lastSentRef.current;

    // Condition 1: enough elements (≥20 for example)
    const bigChange = elements.length >= 20;

    // Condition 2: send at most once every 5s
    if (bigChange || elapsed > 5000) {
      sendScene(sceneData);
      lastSentRef.current = now;
      bufferRef.current = null; // reset after sending
    }
  };

  // 🔹 Safety interval: flush buffer every 5s if not already sent
  useEffect(() => {
    const interval = setInterval(() => {
      if (bufferRef.current) {
        sendScene(bufferRef.current);
        lastSentRef.current = Date.now();
        bufferRef.current = null;
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // useEffect(() => {
  //   if (savedData && excalidrawRef.current) {
  //     excalidrawRef.current.updateScene(savedData);
  //   }
  // }, [savedData]);


  const handleDownloadPDF = async () => {
    if (!excalidrawApiRef.current) return;

    const elements = excalidrawApiRef.current.getSceneElements();
    const appState = excalidrawApiRef.current.getAppState();

    // Convert drawing to canvas
    const canvas = await exportToCanvas({
      elements,
      appState,
      files: excalidrawApiRef.current.getFiles(),
    });

    const imageData = canvas.toDataURL("image/png");

    // Create PDF
    const pdf = new jsPDF("l", "pt", [canvas.width, canvas.height]);
    pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("drawing.pdf");
    exitFullScreen();
    setIsFullscreen(false);
  };



  // return (
  //   <div ref={containerRef} className="w-screen h-screen relative">
  //     {/* Excalidraw with custom toolbar */}
  //     <Excalidraw
  //       renderTopRightUI={() => (
  //         <div className="flex gap-2">
  //           {/* Back button */}
  //           <button
  //             onClick={handleBackNavigation}
  //             className="excalidraw-button rounded-lg px-3 py-1"
  //           >
  //             ⬅ Back
  //           </button>

  //           {/* Sidebar toggle button */}
  //           <button
  //             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
  //             className="excalidraw-button rounded-lg px-3 py-1 flex items-center gap-1"
  //           >
  //             <List className="w-4 h-4" />
  //             Lesson Plan
  //           </button>
  //         </div>
  //       )}
  //     />

  //     {/* Overlay Left Sidebar */}
  //     <div
  //       className={`absolute left-0 top-0 h-full z-30 bg-background/95 backdrop-blur-sm border-r border-border shadow-lg flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0 w-80" : "-translate-x-full w-0"
  //         }`}
  //     >
  //       {/* Header */}
  //       <div className="p-4 border-b border-border">
  //         <div className="w-full flex items-center justify-end my-3">
  //           <button
  //             onClick={() => setIsSidebarOpen(false)}
  //             className="flex items-center gap-2 text-primary hover:text-primary/80"
  //           >
  //             <ArrowLeft className="w-4 h-4" />
  //             <span className="text-sm font-medium">Close</span>
  //           </button>
  //         </div>
  //         <div>
  //           <h1 className="text-lg font-bold text-foreground">
  //             Chapter {chapterId}: {chapterName}
  //           </h1>
  //           <p className="text-sm text-primary font-medium">
  //             Day {lessonData.day} - Teaching Mode
  //           </p>
  //         </div>
  //       </div>

  //       {/* Lesson Activities */}
  //       <div className="flex-1 overflow-y-auto p-4">
  //         <h2 className="text-lg font-semibold text-foreground mb-4">
  //           Lesson Activities
  //         </h2>
  //         <div className="space-y-3">
  //           {lessonData.topics.map((activity, index) => (
  //             <div
  //               key={activity.topic_id}
  //               className={`cursor-pointer rounded-lg border p-4 transition-colors ${currentActivity === activity.topic_id
  //                   ? "border-primary bg-primary/5"
  //                   : "hover:bg-muted/50"
  //                 }`}
  //               onClick={() => setCurrentActivity(activity.topic_id)}
  //             >
  //               <div className="flex items-start gap-3">
  //                 <div
  //                   className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentActivity === activity.topic_id
  //                       ? "bg-primary text-primary-foreground"
  //                       : "bg-muted text-muted-foreground"
  //                     }`}
  //                 >
  //                   {index + 1}
  //                 </div>
  //                 <div className="flex-1">
  //                   <h3 className="font-semibold text-foreground text-sm mb-1">
  //                     {activity.title}
  //                   </h3>
  //                   <p className="text-xs text-muted-foreground leading-relaxed">
  //                     {activity.summary}
  //                   </p>
  //                 </div>
  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );




  return (
    <>
      <div style={{ width: "100vw", height: "100vh" }}
        className={`excalidraw ${styles.excalidrawFix}`}>
        {/* 🔹 Custom Back Button */}
        {/* <button
        onClick={handleBack}
        style={{
          position: "absolute",
          top: 10,
          right: 10, // replaces library button location
          zIndex: 1000,
          padding: "6px 12px",
          background: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ⬅ Back
      </button> */}

        {/* <Excalidraw
        UIOptions={{
          canvasActions: {
            loadScene: false,
            // saveScene: false,
            export: false,
            saveAsImage: false,
            changeViewBackgroundColor: false,
            toggleTheme: false,
          },
          tools: {
            library: false, // 🚫 removes top-right library button
          },
        }}
      /> */}
        <Excalidraw
          excalidrawAPI={(api) => (excalidrawApiRef.current = api)}
          theme="light"
          UIOptions={{
            canvasActions: {
              loadScene: false,   // hides "Open"
              saveAsImage: true, // hides "Save As image"
              saveToActiveFile: false, // hides "Save"
              toggleTheme: false, // hides dark mode toggle
              export: false,
              clearCanvas: false,
            },
          }}
          onChange={handleSceneChange}
          // initialData={savedData}
          renderTopRightUI={() => (
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="excalidraw-Button rounded-lg px-3 py-1 flex items-center gap-1"
              >
                <List className="w-4 h-4" />
                Lesson Plan
              </Button>
              {/* <Button
                onClick={handleDownloadPDF}
                className="px-3 py-1 bg-blue-600 text-white rounded-md "
              >
                Download as PDF
              </Button> */}
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2  z-40 rounded-lg bg-gray-100 hover:bg-blue-200 backdrop-blur-sm py-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </Button>
            </div>

          )}

        >
          <MainMenu>
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.Item onSelect={handleDownloadPDF}>
              <Download className="w-4 h-4" /> Download as PDF
            </MainMenu.Item>
            <MainMenu.DefaultItems.ChangeCanvasBackground />
          </MainMenu>
        </Excalidraw>




        {/* Overlay Left Sidebar */}
        <div
          className={`absolute right-0 top-0 h-full z-30 bg-background/95 backdrop-blur-sm border-l border-border shadow-lg flex flex-col transition-transform duration-300 ease-in-out 
${isSidebarOpen ? "translate-x-0 w-80" : "translate-x-full w-0"}

            }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="w-full flex items-center justify-start my-3">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-2 text-primary hover:text-primary/80"
              >
                <span className="text-sm font-medium">Close</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Chapter {chapterNumber}: {chapterName}
              </h1>
              <p className="text-sm text-primary font-medium">
                Day {lessonData.day} - Teaching Mode
              </p>
            </div>
          </div>

          {/* Lesson Activities */}
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Lesson Activities
            </h2>
            <div className="space-y-3">
              {lessonData && lessonData.topics && lessonData.topics.map((activity, index) => (
                <div
                  key={activity.topic_id}
                  className={`cursor-pointer rounded-lg border p-4 transition-colors ${currentActivity === activity.topic_id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                    }`}
                  onClick={() => setCurrentActivity(activity.topic_id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentActivity === activity.topic_id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                        }`}
                    >
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );


}
