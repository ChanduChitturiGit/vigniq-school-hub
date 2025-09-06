
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Users, TrendingUp, Plus, Eye, Edit, Award, BookCheckIcon, Notebook, BookOpenCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/components/Layout/MainLayout';
import { getExamsList } from '../services/exams'
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { SpinnerOverlay } from '../pages/SpinnerOverlay';
import { FILE } from 'dns';

interface Exam {
  exam_id: string;
  exam_name: string;
  exam_category: string;
  exam_date: string;
  total_marks: number;
  pass_marks: number;
  student_count: number;
  average_marks: number;
  pass_percentage: number;
  exam_type?: 'offline' | 'online';
  is_submitted?: boolean; // New field to track if marks are submitted
}

const Exams: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const [searchParams] = useSearchParams();
  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const subject = searchParams.get('subject') || '';
  const classId = searchParams.get('class_id') || '';
  const subjectId = searchParams.get('subject_id') || '';
  const schoolId = searchParams.get('school_id') || '';
  const boardId = searchParams.get('school_board_id') || '';
  const pathParams = `class=${className}&class_id=${classId}&section=${section}&subject=${subject}&subject_id=${subjectId}&school_board_id=${boardId}&school_id=${schoolId}`;
  const pathData = `${subjectId}?${pathParams}`
  const [loader, setLoader] = useState(true);


  // Sample exam data with is_submitted  field
  const [exams, setExams] = useState<Exam[]>([]);

  const offlineExams = exams.filter(exam => exam.exam_type === 'offline');
  const onlineExams = exams.filter(exam => exam.exam_type === 'online');

  const handleExamAction = (exam: Exam) => {
    if (exam.is_submitted) {
      // Navigate to view results
      navigate(`/grades/exams/exam-results/${exam.exam_id}?${pathParams}`);
    } else {
      // Navigate to submit marks (which is the exam results page with editing enabled by default)
      navigate(`/grades/exams/exam-results/${exam.exam_id}?edit=true&${pathParams}`);
    }
  };

  const getExamsListData = async () => {
    try {
      const payload = {
        "school_id": userData.school_id,
        "subject_id": Number(subjectId),
        "class_section_id": Number(classId)
      };
      const response = await getExamsList(payload);
      if (response && response.data) {
        setExams(response.data);
        setLoader(false);
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
    getExamsListData();
  }, [])

  const toCapitalCase = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }


  const renderExamCard = (exam: Exam) => (
    <div key={exam.exam_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-400">
      <div className="flex flex-col md:flex-row md:flex-wrap lg:flex-nowrap items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 md:mb-0">{toCapitalCase(exam.exam_name)}</h3>
        <Button
          onClick={() => handleExamAction(exam)}
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

      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
        <BookOpenCheck className="w-4 h-4" />
        <span>{exam.exam_category ?? 'NA'}</span>
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
        <Calendar className="w-4 h-4" />
        <span>{exam.exam_date}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{exam.total_marks}</div>
          <div className="text-sm text-gray-600">Total Marks</div>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500">
            <Users className="w-3 h-3" />
            <span>{exam.student_count} Students</span>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{exam.pass_marks}</div>
          <div className="text-sm text-gray-600">Pass Marks</div>
          {exam.is_submitted && (
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500">
              <TrendingUp className="w-3 h-3" />
              <span>Avg Marks. {Number(exam.average_marks).toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {exam.is_submitted && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Pass Rate</span>
            <span>{exam.pass_percentage.toFixed(2)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${exam.pass_percentage}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <MainLayout pageTitle={`Exams : ${subject} - ${className} - ${section}`} >
        <div className="space-y-6">
          {/* <div className="flex flex-col md:flex-row  items-center justify-between">
             <div className='mb-4 md:mb-0'>
              <h1 className="text-2xl font-bold text-gray-800">`${subject} - ${className}`</h1>
              <p className="text-gray-600 mt-1">Manage your exams and view results</p>
            </div> 
            <Button
              onClick={() => navigate(`/grades/exams/create-exam/${pathData}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Exam
            </Button>
          </div> */}

          <Tabs defaultValue="offline" className="w-full">
            <div className="flex flex-col md:flex-row  items-center justify-between">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="offline" className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Offline Exams
                </TabsTrigger>
                <TabsTrigger value="online" className="flex items-center gap-2 text-gray-500" disabled>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  Online Exams
                  <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs">Soon</span>
                </TabsTrigger>
              </TabsList>
              <Button
                onClick={() => navigate(`/grades/exams/create-exam/${pathData}`)}
                className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Exam
              </Button>
            </div>

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
            {
              offlineExams.length == 0 && (
                <div className="text-center py-12">
                  <BookCheckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Exams Created</h3>
                  <Button
                    onClick={() => navigate(`/grades/exams/create-exam/${pathData}`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white  gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Exam
                  </Button>
                </div>
              )
            }
          </Tabs>
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

export default Exams;
