import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Edit, Users, TrendingUp, Award, BarChart3, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/Layout/MainLayout';
import { getExamDetailsById, submitMarks } from '../services/exams'
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { getClassesById, editClass } from '../services/class'

interface StudentResult {
  id: string;
  name: string;
  studentId: string;
  marks: number;
  percentage: number;
  result: 'PASS' | 'FAIL';
}

interface ExamDetails {
  exam_id: string;
  name: string;
  exam_date: string;
  max_marks: number;
  pass_marks: number;
  subject_name: string;
}

const ExamResults: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const navigate = useNavigate();
  const { examId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [searchParams] = useSearchParams();
  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const subject = searchParams.get('subject') || '';
  const classId = searchParams.get('class_id') || '';
  const subjectId = searchParams.get('subject_id') || '';
  const schoolId = searchParams.get('school_id') || '';
  const boardId = searchParams.get('school_board_id') || '';
  const pathData = `${subjectId}?class=${className}&class_id=${classId}&section=${section}&subject=${subject}&subject_id=${subjectId}&school_board_id=${boardId}&school_id=${schoolId}`


  // Sample exam details
  const [examDetails, setExamDetails] = useState<any>({
    exam_id: examId || '1',
    name: 'Mid-term Mathematics',
    exam_date: 'January 15, 2024',
    max_marks: 100,
    pass_marks: 40,
    subject_name: 'Maths'
  });

  // Sample student results
  const [studentResults, setStudentResults] = useState<any>([
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
    const percentage = Math.round((marks / examDetails.max_marks) * 100);
    const result = marks >= examDetails.pass_marks ? 'PASS' : 'FAIL';

    setStudentResults(prev =>
      prev.map(student =>
        student.student_id === studentId
          ? { ...student, marks, percentage, result }
          : student
      )
    );
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    submitMarksData();
  };

  // Check if edit=true in query params to enable editing by default
  useEffect(() => {
    getExamData();
    if (searchParams.get('edit') === 'true') {
      setIsEditing(true);
    }
  }, [searchParams]);

  const getExamData = async () => {
    try {
      const payload = {
        "school_id": userData.school_id,
        "subject_id": Number(subjectId),
        "class_section_id": Number(classId),
        "exam_id": Number(examId)
      };
      const response = await getExamDetailsById(payload);
      console.log('Fetched Attendance Data:', response);
      if (response && response.data) {
        //getExamDetailsById(response.data);
        setExamDetails(response.data);

        if (response.data?.marks.length == 0) {
          getStudents();
        }
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }



  const getStudents = async () => {
    if (userData && userData.role && userData.role == 'superadmin') {
      userData.school_id = localStorage.getItem('current_school_id');
    }
    const response = await getClassesById(Number(classId), userData.school_id);
    if (response && response.class) {
      console.log('class', response.class);
      setStudentResults(response.class.studends_list);

    }
  }

  const submitMarksData = async () => {
    try {
      const payload = {
        "school_id": userData.school_id,
        "exam_id": Number(examId),
        "student_marks": studentResults.map((val) => {
          return {
            student_id: val.student_id,
            student_name: val.student_name,
            marks: val.marks
          }
        })
      };
      const response = await submitMarks(payload);
      console.log('Fetched Attendance Data:', response);
      if (response && response.meessage) {
        //getExamDetailsById(response.data);
        //setExamDetails(response.data);
        showSnackbar({
          title: "Success",
          description: `${response.meessage}`,
          status: "success"
        });
      } else {
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong",
          status: "error"
        });
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }

  return (
    <MainLayout pageTitle='Exam Results'>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/grades/exams/${pathData}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Exams
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{examDetails.name} - {examDetails.subject_name}</h1>
            <p className="text-gray-600 mt-1">
              {examDetails.exam_date} • {examDetails.max_marks} Total Marks • {examDetails.pass_marks} Pass Marks
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
                <div className="text-2xl font-bold text-gray-900">{averageScore > 0 ? averageScore : 0}</div>
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
                      <TableRow key={student.student_id}>
                        <TableCell>
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {student.roll_number}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.student_name}</div>
                            {/* <div className="text-sm text-gray-500">ID: {student.student_name}</div> */}
                          </div>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={student.marks}
                                onChange={(e) => handleMarksChange(student.student_id, e.target.value)}
                                className={`w-20`}
                                min="0"
                                max={examDetails.max_marks}
                                autoFocus={index === 0}
                              />
                              <span className="text-sm text-gray-500">/ {examDetails.max_marks}</span>
                            </div>
                          ) : (
                            <span>{student.marks} / {examDetails.max_marks}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {
                            student.percentage && (
                              <>
                                <span className={student.percentage >= 80 ? 'text-green-600 font-medium' :
                                  student.percentage >= 60 ? 'text-blue-600 font-medium' :
                                    student.percentage >= 40 ? 'text-yellow-600 font-medium' :
                                      'text-red-600 font-medium'}>
                                  {student.percentage}%
                                </span>
                              </>
                            )
                          }

                        </TableCell>
                        <TableCell>
                          {
                            student.result && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${student.result === 'PASS'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {student.result}
                              </span>
                            )
                          }
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
                    <span className="font-medium">{highestScore > 0 ? highestScore : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lowest</span>
                    <span className="font-medium">{lowestScore > 0 ? lowestScore : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average</span>
                    <span className="font-medium">{averageScore > 0 ? averageScore : 0}</span>
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
    </MainLayout>
  );
};

export default ExamResults;
