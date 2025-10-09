import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Eye, BookOpen } from 'lucide-react';
import { Progress } from '../components/ui/progress';

interface SubjectProgress {
  id: string;
  name: string;
  teacherName: string;
  totalChapters: number;
  completedChapters: number;
  progress: number;
}

// Sample data
const subjectsData: SubjectProgress[] = [
  { id: '1', name: 'Telugu', teacherName: 'Sunitha', totalChapters: 12, completedChapters: 6, progress: 20 },
  { id: '2', name: 'Hindi', teacherName: 'Mamatha', totalChapters: 12, completedChapters: 4, progress: 33 },
  { id: '3', name: 'English', teacherName: 'Archana', totalChapters: 12, completedChapters: 5, progress: 42 },
  { id: '4', name: 'Mathematics', teacherName: 'Chandrika', totalChapters: 12, completedChapters: 7, progress: 58 },
  { id: '5', name: 'Physics', teacherName: 'Satish', totalChapters: 12, completedChapters: 3, progress: 25 },
  { id: '6', name: 'Chemistry', teacherName: 'Rajesh', totalChapters: 12, completedChapters: 8, progress: 67 },
];

const ClassSubjectsProgress: React.FC = () => {
  const { classId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const className = searchParams.get('className') || '';

  const handleViewDetails = (subjectId: string, subjectName: string, teacherName: string, progress: number) => {
    navigate(`/syllabus-progress/class/${classId}/subject/${subjectId}?className=${className}&subjectName=${subjectName}&teacherName=${teacherName}&progress=${progress}`);
  };

  return (
    <MainLayout pageTitle="Subject wise Progress">
      <div className="space-y-6">
        <Link
          to="/syllabus-progress"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Classes</span>
        </Link>

        <div className="bg-card border rounded-lg p-6">
          <h1 className="text-2xl font-bold text-foreground">Class {className} - Subject wise Progress</h1>
        </div>

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
                    <tr key={subject.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{subject.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground">{subject.teacherName}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-2 max-w-xs">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {subject.completedChapters} of {subject.totalChapters} chapters
                            </span>
                            <span className="font-semibold text-primary">{subject.progress}%</span>
                          </div>
                          <Progress value={subject.progress} className="h-2" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => handleViewDetails(subject.id, subject.name, subject.teacherName, subject.progress)}
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
  );
};

export default ClassSubjectsProgress;
