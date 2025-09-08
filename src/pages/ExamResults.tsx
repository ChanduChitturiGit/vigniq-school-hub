import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Edit, Users, TrendingUp, Award, BarChart3, Download, X, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/Layout/MainLayout';
import { getExamDetailsById, submitMarks } from '../services/exams'
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { getClassesById, editClass } from '../services/class'
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { SpinnerOverlay } from '../pages/SpinnerOverlay';

interface StudentResult {
  id: string;
  name: string;
  studentId: string;
  marks_obtained: number;
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
  const [loader, setLoader] = useState(true);


  const [examDetails, setExamDetails] = useState<any>({});
  const [studentResults, setStudentResults] = useState<any>([]);
  const [isSubmited, setIsSubmited] = useState(true);

  const totalStudents = studentResults.length;
  const studentsPasssed = studentResults.filter(s => s.result === 'PASS').length;
  const averageScore = Math.round(studentResults.reduce((sum, s) => sum + Number(s.marks_obtained), 0) / totalStudents);
  const passRate = Math.round((studentsPasssed / totalStudents) * 100);
  const highestScore = Math.max(...studentResults.map(s => Number(s.marks_obtained)));
  const lowestScore = Math.min(...studentResults.map(s => Number(s.marks_obtained)));

  const handleMarksChange = (studentId: string, newMarks: string) => {
    const marks = Number(newMarks) || 0;
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
  };


  const handleCancel = () => {
    setIsEditing(!isEditing);
  }

  // Check if edit=true in query params to enable editing by default
  useEffect(() => {
    getExamData();
    if (searchParams.get('edit') === 'true') {
      setIsEditing(true);
      setIsSubmited(false);
    }
  }, [searchParams]);

  const getExamData = async () => {
    try {
      setLoader(true);
      const payload = {
        "school_id": userData.school_id,
        "subject_id": Number(subjectId),
        "class_section_id": Number(classId),
        "exam_id": Number(examId)
      };
      const response = await getExamDetailsById(payload);
      if (response && response.data) {
        setExamDetails(response.data);
        if (response.data?.marks.length == 0) {
          getStudents();
        } else {
          setStudentResults(response.data.marks);
          calculateResult(response.data.marks, response.data);
        }
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


  const calculateResult = (data, total) => {
    const updatedResults = data.map(val => {
      if (val.marks_obtained && total.max_marks && total.pass_marks) {
        return {
          ...val,
          percentage: Number((Number(val.marks_obtained) / Number(total.max_marks)) * 100.0),
          result: Number(val.marks_obtained) >= Number(total.pass_marks) ? "PASS" : "FAIL"
        };
      }
      return val;
    });
    setStudentResults(updatedResults);
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
      if (response && response.message) {
        setIsSubmited(true);
        setIsEditing(!isEditing);
        showSnackbar({
          title: "Success",
          description: `${response.message}`,
          status: "success"
        });
      } else {
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong",
          status: "error"
        });
      }
      getExamData();
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }

  const downloadExamResults = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Exam Results");

    // Header row
    const headerRow = [
      "Roll No",
      "Student Name",
      "Marks Obtained",
      "Percentage",
      "Result",
    ];
    const header = worksheet.addRow(headerRow);

    // Style header
    header.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4472C4" }, // Blue shade
      };
      cell.font = { color: { argb: "FFFFFF" }, bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    // Data rows
    studentResults.forEach((student) => {
      const marks = (Number(student.marks_obtained));
      const percentage = (marks / examDetails.max_marks) * 100;
      const result = marks >= examDetails.pass_marks ? "Pass" : "Fail";

      const row = worksheet.addRow([
        student.roll_number,
        student.student_name,
        marks,
        percentage.toFixed(2) + "%",
        result,
      ]);

      // Style result cell
      const resultCell = row.getCell(5);
      if (result === "Pass") {
        resultCell.font = { color: { argb: "008000" }, bold: true }; // Green
      } else {
        resultCell.font = { color: { argb: "FF0000" }, bold: true }; // Red
      }
    });

    // Adjust column widths
    worksheet.columns = [
      { width: 15 },
      { width: 25 },
      { width: 15 },
      { width: 15 },
      { width: 12 },
    ];

    // Save file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `ExamResults_${examDetails.name.replace(/\s+/g, "_")}_${className}_${examDetails.exam_date}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
  }

  const toCapitalCase = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  return (
    <>
      <MainLayout pageTitle={`Exam Results : ${toCapitalCase(examDetails.name) + ' - ' + examDetails.subject_name}`}>
        <div className="space-y-6">
          {/* <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/grades/exams/${pathData}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Exams
            </Button>
          </div> */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to={`/grades/exams/${pathData}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Exams</span>
              </Link>
            </div>
            <div className='flex gap-3'>
              <Button
                onClick={isEditing ? submitMarksData : handleEditToggle}
                variant={isEditing ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? 'Save Changes' : 'Edit Marks'}
              </Button>
              {
                isEditing && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={handleCancel}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                )
              }
            </div>
          </div>

          {/* <div className="flex flex-col md:flex-row items-center justify-between">
            <div className='mb-3 md:mb-0'>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">{toCapitalCase(examDetails.name)} - {examDetails.subject_name}</h1>
              <p className="text-gray-600 mt-1">
                {examDetails.exam_date} • {examDetails.max_marks} Total Marks • {examDetails.pass_marks} Pass Marks
              </p>
            </div> 
          </div> */}

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
                  <CardTitle className="flex items-center justify-between gap-2">
                    <div className='flex gap-2 items-center'>
                      <Users className="w-5 h-5" />
                      <span>Student Results</span>
                    </div>
                    <div className="flex gap-3 text-gray-600 text-sm mt-1">
                      <div className='flex gap-1 items-center'>
                        <BookOpen className="w-5 h-5" />
                        {className} - {section}
                      </div>
                      <div className='flex gap-1 items-center'>
                        <Calendar className="w-5 h-5" />
                        {examDetails.exam_date}
                      </div>
                      <div className='flex gap-1 items-center'>
                        Total marks :
                        {Number(examDetails.max_marks).toFixed(0)}
                      </div>
                      <div className='flex gap-1 items-center'>
                        Pass marks :
                        {Number(examDetails.pass_marks).toFixed(0)}
                      </div>
                      {/* • {examDetails.max_marks} Total Marks • {examDetails.pass_marks} Pass Marks */}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Roll no.</TableHead>
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
                            <div className="w-8 h-8  text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
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
                                  value={(student.marks_obtained)}
                                  onChange={(e) => handleMarksChange(student.student_id, e.target.value)}
                                  className={`w-20`}
                                  min="0"
                                  max={examDetails.max_marks}
                                  autoFocus={index === 0}
                                />
                                <span className="text-sm text-gray-500">/ {Number(examDetails.max_marks).toFixed(0)}</span>
                              </div>
                            ) : (
                              <span>{Number(student.marks_obtained)} / {Number(examDetails.max_marks).toFixed(0)}</span>
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
                                    {Number(student.percentage).toFixed(2)}%
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
                  {/* <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={handleEditToggle}
                >
                  <Edit className="w-4 h-4" />
                  Edit Student Marks
                </Button> */}
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    disabled={!isSubmited}
                    onClick={downloadExamResults}
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
      {
        loader && (
          <SpinnerOverlay />
        )
      }
    </>
  );
};

export default ExamResults;
