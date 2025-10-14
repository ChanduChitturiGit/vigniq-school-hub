import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import LessonPlanDialog from '../components/LessonPlanDialog';
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { SpinnerOverlay } from '../pages/SpinnerOverlay';
import { getSyllabusProgressBySubject } from '../services/syllabusProgress';
import { format, isToday, isYesterday, differenceInSeconds, differenceInMinutes, differenceInHours } from "date-fns";

interface ChapterProgress {
  chapter_id: string;
  chapter_name: string;
  completed_date: string | null;
  offline_exams_conducted: number;
  status: string;
  lessonPlanId?: string;
}



const SubjectChaptersProgress: React.FC = () => {
  const { classId, subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const { showSnackbar } = useSnackbar();
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user") || '{}');
  const [loader, setLoader] = useState(true);
  const className = searchParams.get('className') || '';
  const subjectName = searchParams.get('subjectName') || '';
  const teacherName = searchParams.get('teacherName') || '';
  const progress = searchParams.get('progress') || '0';

  const [selectedChapter, setSelectedChapter] = useState<ChapterProgress | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Sample data
  const [chaptersData, setChaptersData] = useState<ChapterProgress[]>([]);

  const handleViewLessonPlan = (chapter: ChapterProgress) => {
    // if (chapter.completed_date) {
      setSelectedChapter(chapter);
      setIsDialogOpen(true);
    // }
  };

  const getSyllabusProgressDataByClassSubject = async () => {
    try {
      const schoolId = userData.school_id;
      const response = await getSyllabusProgressBySubject({ school_id: schoolId, class_section_id: classId, subject_id: subjectId });
      if (response && response.data && response.data.chapters) {
        setLoader(false);
        setChaptersData(response.data.chapters);
      }
      else {
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong",
          status: "error"
        });
        setLoader(false);
      }
    } catch (error) {
      setLoader(false);
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }

  useEffect(() => {
    getSyllabusProgressDataByClassSubject();
  }, []);

  return (
    <>
      <MainLayout pageTitle="Chapter Progress">
        <div className="space-y-6">
          <div
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Subjects</span>
          </div>

          <Card className="bg-blue-50 border border-blue-200">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{subjectName}</h1>
                  <p className="text-muted-foreground mt-1">
                    Class: {className} • Teacher: {teacherName}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{progress}%</div>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <div className="bg-card border rounded-lg p-4">
          <h2 className="text-lg font-semibold text-foreground">Chapter Progress</h2>
        </div> */}

          <Card className="border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Chapter Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Completed Date</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Offline exams conducted</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {chaptersData.map((chapter) => (
                      <tr key={chapter.chapter_id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${chapter.completed_date ? 'bg-green-500 ring-2 ring-green-200' : 'bg-gray-300'}`} />
                            <span className="font-medium text-foreground">{chapter.chapter_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {chapter.completed_date ? (
                            <div className="flex items-center gap-2 text-foreground">
                              <Calendar className="w-4 h-4 text-green-500" />
                              {format(chapter.completed_date, 'MMM dd, yyyy')}
                            </div>
                          ) : (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">Not Completed</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {chapter.offline_exams_conducted}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-300 text-blue-600 hover:bg-blue-600 hover:text-white"
                              // disabled={!chapter.completed_date}
                              onClick={() => handleViewLessonPlan(chapter)}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View Lesson Plan
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedChapter && (
          <LessonPlanDialog
            isOpen={isDialogOpen}
            onClose={() => {
              setIsDialogOpen(false);
              setSelectedChapter(null);
            }}
            chapterName={selectedChapter.chapter_name}
            chapterId={selectedChapter.chapter_id}
          />
        )}
      </MainLayout>
      {
        loader && (
          <SpinnerOverlay />
        )
      }
    </>
  );
};

export default SubjectChaptersProgress;
