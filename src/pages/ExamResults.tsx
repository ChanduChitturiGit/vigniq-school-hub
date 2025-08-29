
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Users, TrendingUp, Award, BarChart3, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StudentResult {
  id: string;
  name: string;
  studentId: string;
  marks: number;
  percentage: number;
  result: 'PASS' | 'FAIL';
}

interface ExamDetails {
  id: string;
  name: string;
  date: string;
  totalMarks: number;
  passMarks: number;
}

const ExamResults: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [isEditing, setIsEditing] = useState(false);

  // Sample exam details
  const [examDetails] = useState<ExamDetails>({
    id: examId || '1',
    name: 'Mid-term Mathematics',
    date: 'January 15, 2024',
    totalMarks: 100,
    passMarks: 40
  });

  // Sample student results
  const [studentResults, setStudentResults] = useState<StudentResult[]>([
    {
      id: '1',
      name: 'John Smith',
      studentId: '1',
      marks: 85,
      percentage: 85,
      result: 'PASS'
    },
    {
      id: '2',
      name: 'Emma Johnson',
      studentId: '2',
      marks: 92,
      percentage: 92,
      result: 'PASS'
    },
    {
      id: '3',
      name: 'Michael Brown',
      studentId: '3',
      marks: 76,
      percentage: 76,
      result: 'PASS'
    }
  ]);

  const totalStudents = studentResults.length;
  const studentsPasssed = studentResults.filter(s => s.result === 'PASS').length;
  const averageScore = Math.round(studentResults.reduce((sum, s) => sum + s.marks, 0) / totalStudents);
  const passRate = Math.round((studentsPasssed / totalStudents) * 100);
  const highestScore = Math.max(...studentResults.map(s => s.marks));
  const lowestScore = Math.min(...studentResults.map(s => s.marks));

  const handleMarksChange = (studentId: string, newMarks: string) => {
    const marks = parseInt(newMarks) || 0;
    const percentage = Math.round((marks / examDetails.totalMarks) * 100);
    const result = marks >= examDetails.passMarks ? 'PASS' : 'FAIL';

    setStudentResults(prev =>
      prev.map(student =>
        student.id === studentId
          ? { ...student, marks, percentage, result }
          : student
      )
    );
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/exams')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Exams
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{examDetails.name}</h1>
          <p className="text-gray-600 mt-1">
            {examDetails.date} • {examDetails.totalMarks} Total Marks • {examDetails.passMarks} Pass Marks
          </p>
        </div>
        <Button
          onClick={handleEditToggle}
          variant={isEditing ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          {isEditing ? 'Save Changes' : 'Edit Marks'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalStudents}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{averageScore}</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{studentsPasssed}</div>
              <div className="text-sm text-gray-600">Students Passed</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{passRate}%</div>
              <div className="text-sm text-gray-600">Pass Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Student Results Table */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Student Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentResults.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-500">ID: {student.studentId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={student.marks}
                              onChange={(e) => handleMarksChange(student.id, e.target.value)}
                              className="w-20"
                              min="0"
                              max={examDetails.totalMarks}
                            />
                            <span className="text-sm text-gray-500">/ {examDetails.totalMarks}</span>
                          </div>
                        ) : (
                          <span>{student.marks} / {examDetails.totalMarks}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={student.percentage >= 80 ? 'text-green-600 font-medium' : 
                                       student.percentage >= 60 ? 'text-blue-600 font-medium' : 
                                       student.percentage >= 40 ? 'text-yellow-600 font-medium' : 
                                       'text-red-600 font-medium'}>
                          {student.percentage}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          student.result === 'PASS' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {student.result}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Pass Rate</span>
                  <span className="font-medium">{passRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${passRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Passed</span>
                  <span className="font-medium">{studentsPasssed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Failed</span>
                  <span className="font-medium">{totalStudents - studentsPasssed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Highest</span>
                  <span className="font-medium">{highestScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lowest</span>
                  <span className="font-medium">{lowestScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average</span>
                  <span className="font-medium">{averageScore}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={handleEditToggle}
              >
                <Edit className="w-4 h-4" />
                Edit Student Marks
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
              >
                <Download className="w-4 h-4" />
                Export Results
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExamResults;
