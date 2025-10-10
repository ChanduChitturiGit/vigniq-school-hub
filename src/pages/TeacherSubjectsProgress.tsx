import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Eye, User } from 'lucide-react';
import { Progress } from '../components/ui/progress';

interface ClassSubjectProgress {
  id: string;
  className: string;
  subject: string;
  progress: number;
}

// Sample data
const classSubjectsData: ClassSubjectProgress[] = [
  { id: '1', className: '10A', subject: 'Telugu', progress: 83 },
  { id: '2', className: '10B', subject: 'Telugu', progress: 98 },
  { id: '3', className: '9A', subject: 'Telugu', progress: 88 },
];

const TeacherSubjectsProgress: React.FC = () => {
  const { teacherId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const teacherName = searchParams.get('teacherName') || '';
  const subject = searchParams.get('subject') || '';
  const progress = parseInt(searchParams.get('progress') || '0');

  const handleViewDetails = (classId: string, className: string, subjectName: string, subjectProgress: number) => {
    navigate(`/syllabus-progress/teacher/${teacherId}/class/${classId}/subject/1?className=${className}&subjectName=${subjectName}&teacherName=${teacherName}&progress=${subjectProgress}`);
  };

  return (
    <MainLayout pageTitle="Teacher Class-wise Progress">
      <div className="space-y-6">
        <Link
          to="/syllabus-progress"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Teachers</span>
        </Link>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{teacherName}</h1>
                <p className="text-muted-foreground mt-1">Subject: {subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-blue-600">{progress}%</span>
              <span className="text-sm text-muted-foreground">Overall Progress</span>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Class-wise Subject Progress</h2>
        </div>

        <Card className="border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Class</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Subject</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Progress</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {classSubjectsData.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-foreground">{item.className}</span>
                      </td>
                      <td className="px-6 py-4 text-foreground">{item.subject}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-2 max-w-xs">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-blue-600">{item.progress}%</span>
                          </div>
                          <Progress value={item.progress} className="h-2 bg-blue-100 [&>div]:bg-blue-600" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleViewDetails(item.id, item.className, item.subject, item.progress)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
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

export default TeacherSubjectsProgress;
