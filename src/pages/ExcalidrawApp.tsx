import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Excalidraw, exportToCanvas, MainMenu } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { ArrowLeft, ArrowRight, List, Download, ChevronLeft, ChevronRight, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from '../components/ui/button';
import { environment } from '@/environment';
import { useSnackbar } from '../components/snackbar/SnackbarContext';
import { getLessonPlanDataByDay, getWhiteboardData } from '../services/grades';
import styles from "./ExcalidrawApp.module.css";
import { jsPDF } from "jspdf";
// import { exportToPdf } from "@excalidraw/excalidraw";



export default function ExcalidrawApp() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSlideActionRef = useRef<{ type: 'add' | 'remove'; ts: number } | null>(null);
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
  const [expanded, setExpanded] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<number | null>(null);
  const [sceneData, setSceneData] = useState(null);
  const wsRef = useRef<WebSocket | null>(null);

  // const [pages, setPages] = useState([[]]); // pages store elements
  const [currentPage, setCurrentPage] = useState(0);

  const [slides, setSlides] = useState<any>({});

  // Simple slide-level history (optional, used to restore slides when undoing)
  const [slideHistory, setSlideHistory] = useState<any[]>([]);
  const [historyPos, setHistoryPos] = useState<number>(-1);

  const pushHistory = () => {
    try {
      const snap = { slides: JSON.parse(JSON.stringify(slides)), currentPage };
      const next = slideHistory.slice(0, historyPos + 1);
      next.push(snap);
      setSlideHistory(next);
      setHistoryPos(next.length - 1);
    } catch (e) {
      console.error('pushHistory failed', e);
    }
  };

  const restoreSnapshot = (snap: any) => {
    if (!snap) return;
    setSlides(snap.slides || {});
    setCurrentPage(typeof snap.currentPage === 'number' ? snap.currentPage : 0);
    const scene = snap.slides && snap.slides[snap.currentPage] ? snap.slides[snap.currentPage] : { elements: [], appState: {}, files: {} };
    if (excalidrawApiRef.current) {
      const safeAppState = { ...(scene.appState || {}), collaborators: new Map() };
      excalidrawApiRef.current.updateScene({ elements: scene.elements || [], appState: safeAppState, files: scene.files || {} });
    }
  };

  const undo = () => {
    if (historyPos <= 0) return;
    const prev = historyPos - 1;
    const snap = slideHistory[prev];
    if (snap) {
      setHistoryPos(prev);
      restoreSnapshot(snap);
    }
  };

  const redo = () => {
    if (historyPos >= slideHistory.length - 1) return;
    const nextPos = historyPos + 1;
    const snap = slideHistory[nextPos];
    if (snap) {
      setHistoryPos(nextPos);
      restoreSnapshot(snap);
    }
  };

  // // check center-bottom stack
  // const x = Math.round(window.innerWidth * 0.5);
  // const y = window.innerHeight - 6; // 6px above bottom, adjust if needed
  // console.log('point', x, y);
  // document.elementsFromPoint(x, y).forEach((el, i) => {
  //   console.log(i, el.tagName, el.className, getComputedStyle(el).position, getComputedStyle(el).backgroundColor);
  // });

//   useEffect(() => {
//     const handleResize = () => {
//       excalidrawRef.current?.refresh?.(); // some builds support refresh()
//       excalidrawRef.current?.scrollToContent?.(); // force redraw
//     };

//     window.addEventListener("resize", handleResize);
//     handleResize(); // trigger once on mount

//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//   setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
// }, []);



  //getWhiteboardData
  const getWhiteboardSavedData = async (session_token: any = '') => {
    try {
      const data = {
        school_id: schoolId,
        session_id: session_token != '' ? session_token : sessionToken

      };
      const response = await getWhiteboardData(data);
      if (response && response.data) {
        const scene = response.data;
        setSlides(scene);
        const size = Object.keys(response.data).length;
        setCurrentPage(response.data && size > 0 ? size - 1 : 0);
        const currentScene = scene && scene[size - 1] ? scene[size - 1] : null;
        if (currentScene && excalidrawApiRef.current) {
          const safeAppState = {
            ...currentScene.appState,
            collaborators: new Map(),
          };

          excalidrawApiRef.current.updateScene({
            elements: currentScene.elements || [],
            appState: safeAppState,
            files: currentScene.files || {},
          });

          // Force a layout refresh after loading the scene while fullscreen.
          // In some browsers Excalidraw UI may be mis-sized when the document
          // enters fullscreen; nudging a resize and calling refresh/scroll helps.
          // requestAnimationFrame(() => {
          //   try {
          //     excalidrawApiRef.current?.refresh?.();
          //     excalidrawApiRef.current?.scrollToContent?.();
          //   } catch (e) {
          //     // methods are optional on some builds; ignore failures
          //   }
          //   // dispatch a window resize to force any layout recalculations
          //   window.dispatchEvent(new Event('resize'));
          // });
        }

        // setPages([...(scene && Object.values(scene))]);

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
      sendScene();
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
      document.removeEventListener("msfullscreenchange", handleChange);
    };
  }, []);

  useEffect(() => {
    goFullScreen();
  }, []);

  // Intercept toolbar Undo clicks when there was a recent slide remove action.
  // Excalidraw may apply its internal undo which restores elements into the current canvas;
  // we prevent that by stopping propagation when appropriate so only slide-level undo runs.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onCaptureClick = (e: MouseEvent) => {
      try {
        const target = e.target as HTMLElement | null;
        if (!target) return;

        const btn = target.closest ? (target.closest('button') as HTMLElement | null) : null;
        if (!btn) return;

        const label = ((btn.getAttribute('title') || btn.getAttribute('aria-label') || btn.textContent) || '').toLowerCase();
        // only intercept undo click shortly after a slide remove
        const last = lastSlideActionRef.current;
        if (last && last.type === 'remove' && Date.now() - last.ts < 2000 && label.includes('undo')) {
          // stop Excalidraw's internal undo from running and instead run slide-level undo
          e.stopPropagation();
          e.preventDefault();
          // run slide-level undo
          undo();
          // clear the flag
          lastSlideActionRef.current = null;
        }
      } catch (err) {
        // ignore
      }
    };

    container.addEventListener('click', onCaptureClick, true); // useCapture=true
    return () => container.removeEventListener('click', onCaptureClick, true);
  }, [containerRef.current]);


  useEffect(() => {
    if (!isFullscreen) {
      // 🔹 flush buffered scene data before leaving
      if (bufferRef.current) {
        sendScene(bufferRef.current);
        bufferRef.current = null;
      }
      // optional: wait a moment to ensure WebSocket send completes
      setTimeout(() => {
        navigate(`/grades/syllabus/lesson-plan/day/${chapterId}/${day}?subject=${subject}&class=${className}&section=${section}&chapter_name=${encodeURIComponent(chapterName)}&day=${day}&${pathData}`); // go back
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


  // WebSocket setup similar to your previous code
  useEffect(() => {
    wsRef.current = new WebSocket(`${baseurl}/ws/whiteboard/${sessionStorage.getItem('sessionId')}/?token=${sessionStorage.getItem('access_token')}&school_id=${userData.school_id}`);
    wsRef.current.onopen = () => console.log('WebSocket connected');
    wsRef.current.onclose = () => console.log('WebSocket disconnected');
  }, []);

  const sendScene = (scene: any = []) => {
    // console.log(currentPage, slides, scene);
    // setSlides((prev: any) => ({
    //   ...prev,
    //   [currentPage]: sceneData
    // }));
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && (Object.keys(slides).length > 0 || (scene && scene?.elements && scene?.elements.length > 0 && currentPage == 0))) {
      wsRef.current.send(
        // JSON.stringify({
        //   type: "scene",
        //   data: scene,
        // })
        JSON.stringify({ ...slides, [currentPage]: scene })
      );
      // setSlides((prev: any) => ({
      //   ...prev,
      //   [currentPage]: sceneData
      // }));
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
    const bigChange = elements.length >= 1;

    // Condition 2: send at most once every 5s
    if (bigChange || elapsed > 5000) {
      // console.log("Sending scene data...", sceneData);
      sendScene(sceneData);
      lastSentRef.current = now;
      bufferRef.current = null; // reset after sending
    }

    if (slides && currentPage !== null && slides[currentPage]) {
      slides[currentPage] = sceneData;
    } else {
      setSlides((prev: any) => ({
        ...prev,
        [currentPage]: sceneData
      }));
    }
  };

  // useEffect(() => {
  //   console.log(currentPage, slides);
  // }, [slides])

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

  // Download as PDF
  const handleDownloadPDF = async () => {
  if (!excalidrawApiRef.current) return;

  const pdf = new jsPDF("l", "pt"); // landscape, points

  const slideEntries = Object.entries(slides);

  for (let i = 0; i < slideEntries.length; i++) {
    const [pageIndex, scene] = slideEntries[i] as [string, any];
    if (!scene) continue;

    const safeAppState = {
      ...(scene.appState || {}),
      collaborators: new Map(),
    };

    // ✅ Remove deleted/undone elements
    const filteredElements = ((scene.elements || []) as any[]).filter(
      (el: any) => !el.isDeleted
    );

    // Render canvas for this slide
    const canvas = await exportToCanvas({
      elements: filteredElements,
      appState: safeAppState,
      files: (scene.files || {}) as any,
    });

    const imageData = canvas.toDataURL("image/png");

    const pageWidth = canvas.width;
    const pageHeight = canvas.height;

    if (i === 0) {
      pdf.deletePage(1); // remove the auto-added blank page
      pdf.addPage([pageWidth, pageHeight], "l");
    } else {
      pdf.addPage([pageWidth, pageHeight], "l");
    }

    pdf.setPage(i + 1);
    pdf.addImage(imageData, "PNG", 0, 0, pageWidth, pageHeight);
  }

  pdf.save("slides.pdf");
  exitFullScreen();
  setIsFullscreen(false);
};




  // Save current scene before switching
  // const saveCurrentPage = () => {
  //   if (excalidrawRef.current) {
  //     const scene = excalidrawRef.current.getSceneElements();
  //     const appState = excalidrawRef.current.getAppState();
  //     setPages(prev =>
  //       prev.map((p, i) =>
  //         i === currentPage ? { ...p, elements: scene, appState } : p
  //       )
  //     );
  //   }
  // };

  //setData
  const setSlideData = (pageIndex: number) => {
    const scene = slides[pageIndex];
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
  }


  const goToPage = (index: number) => {
    if (index >= 0 && index < Object.keys(slides).length) {
      setCurrentPage(index);
      //excalidrawApiRef.current.updateScene({ elements: pages[index] || [] });
      setSlideData(index);
    }
  };

  const addPage = () => {
    // compute next index from slides length to avoid stale currentPage
    const nextIndex = Object.keys(slides).length;
    setSlides((prev: any) => ({
      ...prev,
      [nextIndex]: []
    }));
    setCurrentPage(nextIndex);
    excalidrawApiRef.current?.updateScene({ elements: [] });
  };

  const removePage = (index: number | null = null) => {
    const total = Object.keys(slides).length;
    // do not allow removing the last remaining slide
    if (total <= 1) return;
    // mark last slide action (used to intercept Excalidraw toolbar undo)
    lastSlideActionRef.current = { type: 'remove', ts: Date.now() };

    const removeIndex = index !== null ? index : currentPage;

    // if out of bounds, do nothing
    if (removeIndex < 0 || removeIndex >= total) return;

    // Build a new slides object without the removed index and reindex to 0..n-2
    const entries = Object.entries(slides)
      .map(([k, v]) => v)
      .filter((_, i) => i !== removeIndex);

    const newSlides: any = {};
    entries.forEach((val, idx) => {
      newSlides[idx] = val;
    });

    setSlides(newSlides);

    // determine new current page
    let newPage = removeIndex === 0 ? 0 : removeIndex - 1;
    if (newPage >= Object.keys(newSlides).length) {
      newPage = Math.max(0, Object.keys(newSlides).length - 1);
    }

    setCurrentPage(newPage);

    // update Excalidraw scene to the new page (or empty if none)
    const scene = newSlides[newPage] || { elements: [], appState: {}, files: {} };
    if (excalidrawApiRef.current) {
      const safeAppState = {
        ...(scene.appState || {}),
        collaborators: new Map(),
      };

      excalidrawApiRef.current.updateScene({
        elements: scene.elements || [],
        appState: safeAppState,
        files: scene.files || {},
      });
    }

    // send updated slides via websocket so server/peers know about the deletion
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(newSlides));
    }
  };

  const reorderObject = (obj: any) => {
    // Get values in insertion order
    const values = Object.values(obj);

    // Rebuild with new consecutive keys
    const newObj = {};
    values.forEach((val, idx) => {
      newObj[idx + 1] = val; // keys start from 1
    });

    return newObj;
  }

  // const removePage = (index: number) => {
  //   if (Object.keys(slides).length === 1) return;
  //   const newPages = [...pages];
  //   newPages.splice(index, 1);
  //   setPages(newPages);

  //   slides && delete slides[index];

  //   setSlides(reorderObject(slides));


  //   let newPageIndex = index == 0 ? 0 : index - 1;
  //   if (newPageIndex >= Object.keys(slides).length) newPageIndex = Object.keys(slides).length - 1;

  //   setCurrentPage(newPageIndex);
  //   excalidrawApiRef.current.updateScene({ elements: slides[newPageIndex].elements || [] });
  // };

  // --- Pagination window logic ---
  const getVisiblePages = () => {
    const maxVisible = 5;
    const total = Math.max(Object.keys(slides).length, 1);

    if (total <= maxVisible) {
      return [...Array(total).keys()]; // all pages
    }

    let start = Math.max(0, currentPage - 2);
    let end = Math.min(total - 1, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - (maxVisible - 1));
    }

    return [...Array(end - start + 1).keys()].map((i) => start + i);
  };




  return (
    <>
      <div style={{ width: "100vw", height: "100vh" }}
        className={`relative  excalidraw ${styles.excalidrawFix} ${styles.myExcalidrawWrapper}`}>
        <Excalidraw
          excalidrawAPI={(api) => (excalidrawApiRef.current = api)}
          theme="light"
          UIOptions={{
            canvasActions: {
              loadScene: false,
              saveAsImage: true,
              saveToActiveFile: false,
              toggleTheme: false,
              export: false,
              clearCanvas: false,
            },
            tools: {
              image: false,
            },
          }}
          onChange={handleSceneChange}
          initialData={{
            appState: {
              activeTool: { 
                type: "freedraw" as const,
                customType: null,
                lastActiveTool: null,
                locked: true 
              },
            },
          }}
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


        {/* Page numbers (max 5 visible) */}
        <div className="absolute bottom-4 right-1/4 z-50  flex items-center gap-2 bg-gray-200 rounded-lg shadow px-3 py-1">

          {/* Remove page */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => removePage()}
            disabled={Object.keys(slides).length <= 1}
            title={Object.keys(slides).length <= 1 ? 'Cannot remove the last page' : 'Remove current page'}
          >
            <Minus className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 0 || Object.keys(slides).length === 0}
            onClick={() => goToPage(currentPage - 1)}
          >
            {"<"}
          </Button>
          <div className="flex gap-2">
            {getVisiblePages().map((idx) => (
              <Button
                key={idx}
                size="sm"
                variant={currentPage === idx ? "default" : "outline"}
                onClick={() => goToPage(idx)}
              >
                {idx + 1}
              </Button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            disabled={currentPage == Object.keys(slides).length - 1 || Object.keys(slides).length === 0}
            onClick={() => goToPage(currentPage + 1)}
          >
            {">"}
          </Button>

          {/* Add page */}
          <Button size="sm" variant="outline" onClick={addPage}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>





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
      </div >
    </>
  );


}