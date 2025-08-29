
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, TrendingUp, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Exam {
  id: string;
  name: string;
  date: string;
  totalMarks: number;
  passMarks: number;
  studentsCount: number;
  averageScore: number;
  passRate: number;
  type: 'offline' | 'online';
}

const Exams: React.FC = () => {
  const navigate = useNavigate();
  
  // Sample exam data
  const [exams] = useState<Exam[]>([
    {
      id: '1',
      name: 'Mid-term Mathematics',
      date: '1/15/2024',
      totalMarks: 100,
      passMarks: 40,
      studentsCount: 3,
      averageScore: 84,
      passRate: 100,
      type: 'offline'
    },
    {
      id: '2',
      name: 'Chapter 3 Quiz',
      date: '1/10/2024',
      totalMarks: 50,
      passMarks: 20,
      studentsCount: 3,
      averageScore: 44,
      passRate: 100,
      type: 'offline'
    },
    {
      id: '3',
      name: 'Unit Test 1',
      date: '12/20/2023',
      totalMarks: 75,
      passMarks: 30,
      studentsCount: 3,
      averageScore: 65,
      passRate: 100,
      type: 'online'
    }
  ]);

  const offlineExams = exams.filter(exam => exam.type === 'offline');
  const onlineExams = exams.filter(exam => exam.type === 'online');

  const renderExamCard = (exam: Exam) => (
    <div key={exam.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{exam.name}</h3>
        <Button
          onClick={() => navigate(`/exam-results/${exam.id}`)}
          className="bg-blue-500 hover:bg-blue-600 text-white"
          size="sm"
        >
          View Results
        </Button>
      </div>
      
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
        <Calendar className="w-4 h-4" />
        <span>{exam.date}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{exam.totalMarks}</div>
          <div className="text-sm text-gray-600">Total Marks</div>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500">
            <Users className="w-3 h-3" />
            <span>{exam.studentsCount} Students</span>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{exam.passMarks}</div>
          <div className="text-sm text-gray-600">Pass Marks</div>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500">
            <TrendingUp className="w-3 h-3" />
            <span>Avg. {exam.averageScore}</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span>Pass Rate</span>
          <span>{exam.passRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full" 
            style={{ width: `${exam.passRate}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mathematics - Class 06</h1>
          <p className="text-gray-600 mt-1">Manage your exams and view results</p>
        </div>
        <Button
          onClick={() => navigate('/create-exam')}
          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Exam
        </Button>
      </div>

      <Tabs defaultValue="offline" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="offline" className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Offline Exams
          </TabsTrigger>
          <TabsTrigger value="online" className="flex items-center gap-2 text-gray-500">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            Online Exams
            <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs">Soon</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="offline" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offlineExams.map(renderExamCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="online" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {onlineExams.map(renderExamCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Exams;
