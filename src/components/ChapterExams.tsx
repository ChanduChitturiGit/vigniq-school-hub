import React, { useState, useEffect } from 'react';
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
import { Plus, Eye, Calendar, Clock, Users } from 'lucide-react';
import { getChapterExams, createChapterExam } from '@/services/exams';
import { useSnackbar } from '@/components/snackbar/SnackbarContext';

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
  exam_id: number;
  exam_name: string;
  exam_category: string;
  exam_date: string;
  session: string;
  total_marks: number;
  pass_marks: number;
  average_marks: number;
  pass_rate: number;
  total_students: number;
  appeared_students: number;
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
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    exam_category: '',
    exam_name: '',
    exam_date: '',
    session: '',
    total_marks: '',
    pass_marks: '',
  });

  const examCategories = [
    { value: 'slip_test', label: 'Slip Test' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'unit_test', label: 'Unit Test' },
  ];

  const sessions = [
    { value: 'morning', label: 'Morning Session' },
    { value: 'afternoon', label: 'Afternoon Session' },
    { value: 'evening', label: 'Evening Session' },
  ];

  // Sample data - replace with actual API call
  const sampleExams: ExamData[] = [
    {
      exam_id: 1,
      exam_name: 'Slip Test - Real Numbers',
      exam_category: 'Slip Test',
      exam_date: '1/15/2024',
      session: 'Morning Session',
      total_marks: 20,
      pass_marks: 12,
      average_marks: 16.2,
      pass_rate: 85,
      total_students: 35,
      appeared_students: 34,
    },
    {
      exam_id: 2,
      exam_name: 'Assignment - Problem Solving',
      exam_category: 'Assignment',
      exam_date: '1/22/2024',
      session: 'Afternoon Session',
      total_marks: 25,
      pass_marks: 15,
      average_marks: 21.5,
      pass_rate: 91,
      total_students: 35,
      appeared_students: 35,
    },
  ];

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      // Uncomment when API is ready
      // const response = await getChapterExams({
      //   chapter_id: chapterId,
      //   class_section_id: classId,
      //   subject_id: subjectId,
      //   school_id: schoolId,
      //   school_board_id: boardId,
      // });
      // setExams(response.data);
      
      // Using sample data for now
      setExams(sampleExams);
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

  const handleViewResults = (examId: number) => {
    const pathData = `class=${className}&class_id=${classId}&section=${section}&subject=${subject}&subject_id=${subjectId}&school_board_id=${boardId}&school_id=${schoolId}`;
    navigate(`/exam-results/${examId}?${pathData}`);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateExam = async () => {
    try {
      if (!formData.exam_category || !formData.exam_name || !formData.exam_date || 
          !formData.session || !formData.total_marks || !formData.pass_marks) {
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
        exam_category: formData.exam_category,
        exam_name: formData.exam_name,
        exam_date: formData.exam_date,
        session: formData.session,
        max_marks: Number(formData.total_marks),
        pass_marks: Number(formData.pass_marks),
      };

      // Uncomment when API is ready
      // const response = await createChapterExam(payload);
      // if (response && response.message) {
      //   showSnackbar({
      //     title: '✅ Success',
      //     description: response.message,
      //     status: 'success',
      //   });
      //   loadExams();
      //   setShowAddDialog(false);
      //   resetForm();
      // }

      // Temporary success message
      showSnackbar({
        title: '✅ Success',
        description: 'Exam created successfully',
        status: 'success',
      });
      setShowAddDialog(false);
      resetForm();
    } catch (error) {
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
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Slip Test': 'bg-blue-100 text-blue-700 border-blue-200',
      'Assignment': 'bg-green-100 text-green-700 border-green-200',
      'Quiz': 'bg-purple-100 text-purple-700 border-purple-200',
      'Unit Test': 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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

      {exams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No exams found for this chapter</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
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
                            {exam.exam_date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {exam.session}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {exam.total_marks} marks
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleViewResults(exam.exam_id)}
                      variant="outline"
                      className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                      View Results
                    </Button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-sm text-gray-500">Total Marks</div>
                      <div className="text-xl font-bold text-gray-900">{exam.total_marks}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Pass Marks</div>
                      <div className="text-xl font-bold text-gray-900">{exam.pass_marks}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Average Marks</div>
                      <div className="text-xl font-bold text-gray-900">{exam.average_marks}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Pass Rate</div>
                      <div className="text-xl font-bold text-green-600">{exam.pass_rate}%</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        <Users className="w-4 h-4 inline mr-1" />
                        {exam.appeared_students}/{exam.total_students} students appeared
                      </span>
                    </div>
                    <Progress value={exam.pass_rate} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Exam Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Exam</DialogTitle>
            <p className="text-sm text-gray-500">
              Fill in the exam details below. You'll be able to enter student marks after creating the exam.
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exam_name">Exam Name</Label>
              <Input
                id="exam_name"
                placeholder="Enter exam name"
                value={formData.exam_name}
                onChange={(e) => handleInputChange('exam_name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exam_date">Date Conducted</Label>
              <Input
                id="exam_date"
                type="date"
                value={formData.exam_date}
                onChange={(e) => handleInputChange('exam_date', e.target.value)}
              />
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChapterExams;
