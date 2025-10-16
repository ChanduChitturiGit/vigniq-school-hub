import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Eye, Calendar, Clock, Users, Loader2, Edit } from 'lucide-react';
import { getExamsList, createExam, getExamCategoriesForChapterwise } from '@/services/exams';
import { useSnackbar } from '@/components/snackbar/SnackbarContext';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { set } from 'date-fns';


interface ChapterExamsProps {
  chapterId: string;
  classId: string;
  subjectId: string;
  schoolId: string;
  boardId: string;
  className: string;
  section: string;
  subject: string;
}

interface ExamData {
  exam_session: string;
  pass_percentage: number;
  student_count: any;
  exam_id: number;
  exam_name: string;
  exam_category: string;
  exam_date: string;
  session: string;
  total_marks: number;
  pass_marks: number;
  average_marks: number;
  total_students: number;
  appeared_students: number;
  is_submitted: boolean;
}

const ChapterExams: React.FC<ChapterExamsProps> = ({
  chapterId,
  classId,
  subjectId,
  schoolId,
  boardId,
  className,
  section,
  subject,
}) => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [exams, setExams] = useState<ExamData[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const [examCategories, setExamCategories] = useState([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  const [formData, setFormData] = useState({
    exam_category: '',
    exam_name: '',
    exam_date: '',
    session: '',
    total_marks: '',
    pass_marks: '',
    exam_category_id: null
  });

  const [examDate, setExamDate] = useState<Dayjs | null>(null);

  const SampleExamCategories = [
    { value: 'slip_test', label: 'Slip Test' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'unit_test', label: 'Unit Test' },
  ];

  const sessions = [
    { value: 'm', label: 'Morning Session' },
    { value: 'a', label: 'Afternoon Session' }
  ];


  const getExamCategoriesList = async () => {
    try {
      const payload = { "school_id": userData.school_id };
      const response = await getExamCategoriesForChapterwise(payload);
      // console.log('Fetched Attendance Data:', response);
      if (response && response.data) {
        setExamCategories(response.data);
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }

  useEffect(() => {
    getExamCategoriesList();
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      // Uncomment when API is ready
      const response = await getExamsList({
        chapter_id: chapterId,
        class_section_id: classId,
        subject_id: subjectId,
        school_id: schoolId,
        school_board_id: boardId,
      });
      setExams(response.data);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      showSnackbar({
        title: '⛔ Error',
        description: 'Failed to load chapter exams',
        status: 'error',
      });
    }
  };

  const handleViewResults = (exam : any) => {
    const pathData = `class=${className}&class_id=${classId}&section=${section}&subject=${subject}&subject_id=${subjectId}&school_board_id=${boardId}&school_id=${schoolId}&tab=exams`;
    // navigate(`/grades/exams/exam-results/${exam.exam_id}?${pathData}`);

     if (exam.is_submitted) {
      // Navigate to view results
      navigate(`/grades/exams/exam-results/${exam.exam_id}?${pathData}`);
    } else {
      // Navigate to submit marks (which is the exam results page with editing enabled by default)
      navigate(`/grades/exams/exam-results/${exam.exam_id}?edit=true&${pathData}`);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field == 'exam_category') {
      setFormData((prev) => ({ ...prev, ['exam_name']: value, exam_category_id: getCategoryId(value) }));
    }

  };

  const getCategoryId = (value: string) => {
    const categoryData = examCategories.find((val: any) => (val.name == value));
    const id = categoryData?.id ? categoryData.id : 0;
    return id;
  }

  const handleCreateExam = async () => {
    try {
      setIsDisabled(true);
      if (!formData.exam_category || !formData.exam_name || !formData.exam_date ||
        !formData.session || !formData.total_marks || !formData.pass_marks) {
        setIsDisabled(false);
        showSnackbar({
          title: '⚠️ Warning',
          description: 'Please fill all fields',
          status: 'error',
        });
        return;
      }

      const payload = {
        chapter_id: chapterId,
        class_section_id: classId,
        subject_id: subjectId,
        school_id: schoolId,
        school_board_id: boardId,
        exam_category_id: formData.exam_category_id ? formData.exam_category_id : getCategoryId(formData.exam_category),
        exam_category: formData.exam_category,
        exam_name: formData.exam_name,
        exam_date: formData.exam_date,
        session: formData.session,
        total_marks: Number(formData.total_marks),
        pass_marks: Number(formData.pass_marks),
        exam_session: formData.session,
        created_by: userData.user_id
      };

      // Uncomment when API is ready
      const response = await createExam(payload);
      if (response && response.message) {
        setIsDisabled(false);
        showSnackbar({
          title: '✅ Success',
          description: response.message,
          status: 'success',
        });
        loadExams();
        setShowAddDialog(false);
        resetForm();
      }

      // Temporary success message
      showSnackbar({
        title: '✅ Success',
        description: 'Exam created successfully',
        status: 'success',
      });
      setShowAddDialog(false);
      resetForm();
      setIsDisabled(false);
    } catch (error) {
      setIsDisabled(false);
      showSnackbar({
        title: '⛔ Error',
        description: 'Failed to create exam',
        status: 'error',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      exam_category: '',
      exam_name: '',
      exam_date: '',
      session: '',
      total_marks: '',
      pass_marks: '',
      exam_category_id: null
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Slip Test': 'bg-blue-100 text-blue-700 border-blue-200',
      'Assignment': 'bg-green-100 text-green-700 border-green-200',
      'Quiz': 'bg-purple-100 text-purple-700 border-purple-200',
      'Unit Test': 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chapter Exams</h2>
          <p className="text-gray-600">Manage assessments and track student performance</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add New Exam
        </Button>
      </div>

      {!loading && exams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No exams found for this chapter</p>
          </CardContent>
        </Card>
      ) : (
        // Grid: 1 column on small screens, 2 columns on md and up
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!loading && exams.map((exam) => (
            <Card key={exam.exam_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {exam.exam_name}
                          </h3>
                          <Badge className={`${getCategoryColor(exam.exam_category)} border`}>
                            {exam.exam_category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {exam.exam_date + ' - ' + (exam.exam_session == 'm' ? 'Morning' : 'Afternoon')}
                          </div>
                          {/* <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {exam.session}
                          </div> */}
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {exam.total_marks} marks
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* <Button
                      onClick={() => handleViewResults(exam.exam_id)}
                      variant="outline"
                      className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                      View Results
                    </Button> */}

                    <Button
                      onClick={() => handleViewResults(exam)}
                      className={`${exam.is_submitted
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                        } text-white`}
                      size="sm"
                    >
                      {exam.is_submitted ? (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          View Results
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-1" />
                          Submit Marks
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-sm text-gray-500">Total Marks</div>
                      <div className="text-xl font-bold text-gray-600">{exam.total_marks}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Pass Marks</div>
                      <div className="text-xl font-bold text-gray-600">{exam.pass_marks}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Average Marks</div>
                      <div className="text-xl font-bold text-gray-600">{exam.average_marks}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Pass Rate</div>
                      <div className="text-xl font-bold text-green-600">{exam.pass_percentage && exam.pass_percentage>=0 ? exam.pass_percentage : 0}%</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        <Users className="w-4 h-4 inline mr-1" />
                        {exam.student_count}/{exam.student_count} students appeared
                      </span>
                    </div>

                    {/* <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500`}
                        style={{
                          width: `${Number(exam.pass_percentage) >= 0 ? Number(exam.pass_percentage) : 0}%`
                        }}
                      />
                    </div> */}

                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {
            loading && (
              // Make loader span full width of the grid
              <div className="col-span-1 md:col-span-2 py-6">
                <Loader2 className="w-10 h-10 mx-auto text-blue animate-spin" />
              </div>
            )
          }
        </div>
      )
      }

      {/* Add Exam Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          {/* sticky top-0 bg-white z-10 pb-2 */}
          <DialogHeader >
            <DialogTitle>Create New Exam</DialogTitle>
            <p className="text-sm text-gray-500">
              Fill in the exam details below. You'll be able to enter student marks after creating the exam.
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exam_category">Exam Category</Label>
              <Select
                value={formData.exam_category}
                onValueChange={(value) => handleInputChange('exam_category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {examCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exam_name">Exam Name</Label>
              <Input
                ref={inputRef}
                id="exam_name"
                placeholder="Enter exam name"
                value={formData.exam_name}
                onChange={(e) => handleInputChange('exam_name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exam_date">Date Conducted</Label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  className="date-div w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  label={''}
                  value={examDate}
                  onChange={(newValue) => {
                    setExamDate(newValue);
                    setFormData((prev) => ({ ...prev, exam_date: newValue ? newValue.format('YYYY-MM-DD') : '' }));
                  }}
                  maxDate={dayjs()}
                  slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                      },
                      popper: {
                        // Render the popper into document.body so it is outside the Radix dialog DOM
                        // and ensure it's clickable (pointer events) and above overlays.
                        container: typeof document !== 'undefined' ? document.body : undefined,
                        style: { zIndex: 9999, pointerEvents: 'auto' },
                      },
                    }}
                  format="DD/MM/YYYY"
                />
              </LocalizationProvider>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session">Session</Label>
              <Select
                value={formData.session}
                onValueChange={(value) => handleInputChange('session', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.value} value={session.value}>
                      {session.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_marks">Total Marks</Label>
                <Input
                  id="total_marks"
                  type="number"
                  placeholder="20"
                  value={formData.total_marks}
                  onChange={(e) => handleInputChange('total_marks', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pass_marks">Pass Marks</Label>
                <Input
                  id="pass_marks"
                  type="number"
                  placeholder="12"
                  value={formData.pass_marks}
                  onChange={(e) => handleInputChange('pass_marks', e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateExam}
              disabled={isDisabled}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default ChapterExams;
