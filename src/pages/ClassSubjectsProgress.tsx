import React, { useEffect, useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Eye, BookOpen } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { SpinnerOverlay } from '../pages/SpinnerOverlay';
import { getSyllabusProgressByClass, getSyllabusProgressByClassSection } from '../services/syllabusProgress';

interface SubjectProgress {
  subject_id: string;
  subject_name: string;
  teacher_name: string;
  total_chapters: number;
  completed_chapters: number;
  completion_percentage: number;
}



const ClassSubjectsProgress: React.FC = () => {
  const { classId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const className = searchParams.get('className') || '';
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user") || '{}');
  const [loader, setLoader] = useState(true);

  // Sample data
  const [subjectsData, setSubjectsData] = useState<SubjectProgress[]>([]);


  const handleViewDetails = (subjectId: string, subjectName: string, teacherName: string, progress: number) => {
    navigate(`/syllabus-progress/class/${classId}/subject/${subjectId}?className=${className}&subjectName=${subjectName}&teacherName=${teacherName}&progress=${progress}`);
  };

  const getSyllabusProgressDataByClass = async () => {
    try {
      const schoolId = userData.school_id;
      const response = await getSyllabusProgressByClassSection({ school_id: schoolId, class_section_id: classId });
      if (response && response.data) {
        setLoader(false);
        setSubjectsData(response.data);
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
    getSyllabusProgressDataByClass();
  }, []);


  return (
    <>
      <MainLayout pageTitle={`Class ${className} Subject wise Progress`}>
        <div className="space-y-6">
          <Link
            to="/syllabus-progress"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Classes</span>
          </Link>

          {/* <div className="bg-card border rounded-lg p-6">
            <h1 className="text-2xl font-bold text-foreground">Class {className} - Subject wise Progress</h1>
          </div> */}

          <Card className="border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Subject
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Teacher Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Progress</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {subjectsData.map((subject) => (
                      <tr key={subject.subject_id} className="hover:bg-muted/50 transition-colors"
                       onClick={() => handleViewDetails(subject.subject_id, subject.subject_name, subject.teacher_name, subject.completion_percentage)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="font-medium text-foreground">{subject.subject_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-foreground">{subject.teacher_name}</td>
                        <td className="px-6 py-4">
                          <div className="space-y-2 max-w-xs">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {subject.completed_chapters} of {subject.total_chapters} chapters
                              </span>
                              <span className="font-semibold text-blue-600">{subject.completion_percentage}%</span>
                            </div>
                            <Progress value={subject.completion_percentage} className="h-2 bg-blue-100 [&>div]:bg-blue-600" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => handleViewDetails(subject.subject_id, subject.subject_name, subject.teacher_name, subject.completion_percentage)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
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
      </MainLayout>
      {
        loader && (
          <SpinnerOverlay />
        )
      }
    </>
  );
};

export default ClassSubjectsProgress;
