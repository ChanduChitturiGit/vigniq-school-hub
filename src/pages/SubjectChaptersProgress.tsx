import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import LessonPlanDialog from '../components/LessonPlanDialog';

interface ChapterProgress {
  id: string;
  name: string;
  completedDate: string | null;
  offlineExams: number;
  isCompleted: boolean;
  lessonPlanId?: string;
}

// Sample data
const chaptersData: ChapterProgress[] = [
  { id: '1', name: 'Introduction to Real Numbers', completedDate: '1/15/2024', offlineExams: 2, isCompleted: true, lessonPlanId: '1' },
  { id: '2', name: 'The Fundamental Theorem of Arithmetic', completedDate: '1/28/2024', offlineExams: 1, isCompleted: true, lessonPlanId: '2' },
  { id: '3', name: 'Prime Factorization Method', completedDate: '2/10/2024', offlineExams: 3, isCompleted: true, lessonPlanId: '3' },
  { id: '4', name: 'Application of FTA (Ending with Zero)', completedDate: null, offlineExams: 0, isCompleted: false },
  { id: '5', name: 'Rational and Irrational Numbers', completedDate: null, offlineExams: 0, isCompleted: false },
  { id: '6', name: 'Decimal Expansion of Rational Numbers', completedDate: null, offlineExams: 0, isCompleted: false },
  { id: '7', name: 'Operations on Real Numbers', completedDate: null, offlineExams: 0, isCompleted: false },
  { id: '8', name: 'Real Numbers and Their Properties', completedDate: null, offlineExams: 0, isCompleted: false },
];

const SubjectChaptersProgress: React.FC = () => {
  const { classId, subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const className = searchParams.get('className') || '';
  const subjectName = searchParams.get('subjectName') || '';
  const teacherName = searchParams.get('teacherName') || '';
  const progress = searchParams.get('progress') || '0';

  const [selectedChapter, setSelectedChapter] = useState<ChapterProgress | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewLessonPlan = (chapter: ChapterProgress) => {
    if (chapter.isCompleted && chapter.lessonPlanId) {
      setSelectedChapter(chapter);
      setIsDialogOpen(true);
    }
  };

  return (
    <MainLayout pageTitle="Chapter Progress">
      <div className="space-y-6">
        <Link
          to={`/syllabus-progress/class/${classId}?className=${className}`}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Subjects</span>
        </Link>

        <Card className="bg-primary/5 border">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{subjectName}</h1>
                <p className="text-muted-foreground mt-1">
                  Class: {className} • Teacher: {teacherName}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{progress}%</div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-lg font-semibold text-foreground">Chapter Progress</h2>
        </div>

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
                    <tr key={chapter.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${chapter.isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="font-medium text-foreground">{chapter.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {chapter.completedDate ? (
                          <div className="flex items-center gap-2 text-foreground">
                            <Calendar className="w-4 h-4 text-green-500" />
                            {chapter.completedDate}
                          </div>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">Not Completed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-foreground">{chapter.offlineExams}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                            disabled={!chapter.isCompleted || !chapter.lessonPlanId}
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
          chapterName={selectedChapter.name}
        />
      )}
    </MainLayout>
  );
};

export default SubjectChaptersProgress;
