
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Progress } from '../components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, BookOpen, TrendingUp, Users } from 'lucide-react';

interface ChapterProgress {
  id: string;
  name: string;
  progress: number;
}

interface StudentPerformance {
  range: string;
  count: number;
  percentage: string;
  color: string;
}

const GradesProgress: React.FC = () => {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const subject = searchParams.get('subject') || '';

  const [chaptersProgress, setChaptersProgress] = useState<ChapterProgress[]>([]);
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([]);

  const breadcrumbItems = [
    { label: 'Grades', path: '/grades' },
    { label: `${subject} - ${className} ${section}`, path: `/grades/syllabus/${subjectId}?class=${className}&section=${section}&subject=${subject}` },
    { label: 'Progress' }
  ];

  // Sample data for chapter progress
  const sampleChaptersProgress: ChapterProgress[] = [
    { id: '1', name: 'Knowing Our Numbers', progress: 75 },
    { id: '2', name: 'Whole Numbers', progress: 45 },
    { id: '3', name: 'Playing with Numbers', progress: 90 },
    { id: '4', name: 'Basic Geometrical Ideas', progress: 30 },
    { id: '5', name: 'Understanding Elementary Shapes', progress: 60 },
    { id: '6', name: 'Integers', progress: 25 }
  ];

  // Sample data for student performance
  const sampleStudentPerformance: StudentPerformance[] = [
    { range: '<60%', count: 5, percentage: '60%', color: 'bg-red-100 text-red-800' },
    { range: '60-80%', count: 15, percentage: '60-80%', color: 'bg-yellow-100 text-yellow-800' },
    { range: '>80%', count: 10, percentage: '>80%', color: 'bg-green-100 text-green-800' }
  ];

  useEffect(() => {
    setChaptersProgress(sampleChaptersProgress);
    setStudentPerformance(sampleStudentPerformance);
  }, []);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const overallProgress = chaptersProgress.reduce((sum, chapter) => sum + chapter.progress, 0) / chaptersProgress.length;

  return (
    <MainLayout pageTitle={`Progress - ${subject} - ${className} ${section}`}>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={`/grades/syllabus/${subjectId}?class=${className}&section=${section}&subject=${subject}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Syllabus
            </Link>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">{subject} - {className} {section}</h1>
          <p className="text-gray-600">Chapter-wise progress tracking</p>
        </div>

        {/* Overall Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={overallProgress} className="flex-1 h-3" />
              <span className="text-xl font-bold text-gray-800">{Math.round(overallProgress)}%</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Average completion across all chapters
            </p>
          </CardContent>
        </Card>

        {/* Chapter Progress */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Chapter-wise Progress
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chaptersProgress.map((chapter) => (
              <Card key={chapter.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800">
                      Chapter {chapter.id}: {chapter.name}
                    </h3>
                    <span className="text-sm font-semibold text-gray-600">
                      {chapter.progress}%
                    </span>
                  </div>
                  <Progress 
                    value={chapter.progress} 
                    className="h-2"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      chapter.progress >= 80 ? 'bg-green-100 text-green-800' :
                      chapter.progress >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      chapter.progress >= 40 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {chapter.progress >= 80 ? 'Excellent' :
                       chapter.progress >= 60 ? 'Good' :
                       chapter.progress >= 40 ? 'Average' : 'Needs Attention'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Class Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Class Students Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {studentPerformance.map((performance, index) => (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg mb-2 ${
                    performance.range === '<60%' ? 'bg-red-100' :
                    performance.range === '60-80%' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    <span className={`text-2xl font-bold ${
                      performance.range === '<60%' ? 'text-red-600' :
                      performance.range === '60-80%' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {performance.count}
                    </span>
                  </div>
                  <p className={`text-sm font-medium ${
                    performance.range === '<60%' ? 'text-red-600' :
                    performance.range === '60-80%' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {performance.range}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-600 text-center">
              Performance distribution based on overall chapter completion
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default GradesProgress;
