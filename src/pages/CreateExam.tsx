
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Eye, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import MainLayout from '@/components/Layout/MainLayout';
import { createExam, getExamCategories } from '../services/exams'
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { format } from 'date-fns';

const CreateExam: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const subject = searchParams.get('subject') || '';
  const classId = searchParams.get('class_id') || '';
  const subjectId = searchParams.get('subject_id') || '';
  const schoolId = searchParams.get('school_id') || '';
  const boardId = searchParams.get('school_board_id') || '';
  const [examCategories, setExamCategories] = useState([]);
  const [creationDate, setCreationDate] = React.useState<Dayjs | null>(null);
  const pathData = `${subjectId}?class=${className}&class_id=${classId}&section=${section}&subject=${subject}&subject_id=${subjectId}&school_board_id=${boardId}&school_id=${schoolId}`

  const [examData, setExamData] = useState({
    name: '',
    category: '',
    category_id: null,
    date: '',
    totalMarks: '',
    passMarks: ''
  });


  const getExamCategoriesList = async () => {
    try {
      const payload = { "school_id": userData.school_id };
      const response = await getExamCategories(payload);
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

  const createExamData = async () => {
    try {
      const payload = {
        "school_id": userData.school_id,
        "exam_name": examData.name,
        "exam_category_id": examData.category_id,
        "exam_type": "offline",
        "exam_date": (creationDate.format("YYYY-MM-DD")),
        "total_marks": Number(examData.totalMarks),
        "pass_marks": Number(examData.passMarks),
        "subject_id": Number(subjectId),
        "class_section_id": Number(classId)
      };
      const response = await createExam(payload);
      //console.log('Fetched Attendance Data:', response);
      if (response && response.message) {
        showSnackbar({
          title: "Success",
          description: response.message,
          status: "success"
        });
        navigate(`/grades/exams/${pathData}`);
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

  const handleInputChange = (field: string, value: string) => {
    setExamData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // const handleCreateExam = () => {
  //   // Handle exam creation logic here
  //   console.log('Creating exam:', examData);
  //   createExamData();
  //   //navigate('/exams');
  // };

  const handleCancel = () => {
    navigate(`/grades/exams/${pathData}`);
  };

  useEffect(() => {
    getExamCategoriesList();
  }, [])

  const getCategoryId = (value: string) => {
    const categoryData = examCategories.find((val: any) => (val.name == value));
    const id = categoryData?.id ? categoryData.id : 0;
    return id;
  }

  const handleCategoryChange = (value: string) => {
    setExamData(prev => ({
      ...prev,
      category: value,
      category_id: getCategoryId(value)
    }));
    //setErrors(prev => ({ ...prev, gender: '' }));
  };


  return (
    <MainLayout pageTitle='Create Exam'>
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

        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create New Exam</h1>
          <p className="text-gray-600 mt-1">Set up your assessment details and marking scheme</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="information" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="information" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Exam Information
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="information" className="mt-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="examName">Exam Name *</Label>
                      <Input
                        id="examName"
                        placeholder="e.g., Mid-term Mathematics, Chapter 5 Quiz, Final Assessment"
                        value={examData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full h-[3rem]"
                      />
                      <p className="text-sm text-gray-500">Choose a clear, descriptive name for your exam</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exam Category
                      </label>
                      <Select value={examData.category} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-full h-[3rem]">
                          <SelectValue placeholder="Select a Exam Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {examCategories.map((val, index) => (
                            <SelectItem key={index} value={val.name}>
                              {val.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500 mt-1">What type of exam.</p>
                      {/* {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>} */}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateConducuted">Date Conducted *</Label>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          className="date-div w-full px-3  border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          label=""
                          value={creationDate}
                          onChange={(newValue) => {
                            setCreationDate(newValue);
                            examData.date = newValue ? newValue.format("DD-MM-YYYY") : null;
                          }}
                          format="DD/MM/YYYY"   // 👈 force display format
                        />
                      </LocalizationProvider>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">When was this exam conducted?</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="totalMarks">Total Marks *</Label>
                        <Input
                          id="totalMarks"
                          type="number"
                          placeholder="100"
                          value={examData.totalMarks}
                          onChange={(e) => handleInputChange('totalMarks', e.target.value)}
                          className="w-full"
                        />
                        <p className="text-sm text-gray-500">Maximum possible score</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="passMarks">Pass Marks *</Label>
                        <Input
                          id="passMarks"
                          type="number"
                          placeholder="40"
                          value={examData.passMarks}
                          onChange={(e) => handleInputChange('passMarks', e.target.value)}
                          className="w-full"
                        />
                        <p className="text-sm text-gray-500">Minimum marks to pass</p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={createExamData}
                        className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
                        disabled={!examData.name || !examData.date || !examData.totalMarks || !examData.passMarks}
                      >
                        Create Exam & Add Student Marks
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="px-8"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-700">Exam Name</h3>
                        <p className="text-gray-900">{examData.name || 'Enter exam name...'}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-700">Exam Category</h3>
                        <p className="text-gray-900">{examData.category || 'select exam category...'}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-700">Date</h3>
                        <p className="text-gray-900">{examData.date || 'Select date...'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {examData.totalMarks || '0'}
                          </div>
                          <div className="text-sm text-gray-600">Total Marks</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {examData.passMarks || '0'}
                          </div>
                          <div className="text-sm text-gray-600">Pass Marks</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p className="flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
                    Use descriptive names like "Mid-term Math" instead of just "Test 1"
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
                    Typical pass percentage is 40-50% of total marks
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
                    You'll be taken directly to the marks entry page after creation
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateExam;
