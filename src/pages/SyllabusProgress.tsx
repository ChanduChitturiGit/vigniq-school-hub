import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '../components/ui/progress';
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { SpinnerOverlay } from '../pages/SpinnerOverlay';
import { getSyllabusProgressByClass,getSyllabusProgressByTeacher } from '../services/syllabusProgress';

interface ClassProgress {
  completion_percentage: any;
  class_section_id: string;
  name: string;
  progress: number;
  total_subjects: number;
  completed_subjects: number;
  board_name?: string;
  class_number?: number;
  class_section?: string;
  board_id?: number;
}

interface TeacherProgress {
  teacher_id: string;
  teacher_name: string;
  subject_name: string;
  completion_percentage?: number;
  classes_assigned: string[];
}



const SyllabusProgress: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState('class');
  const [searchQuery, setSearchQuery] = useState('');
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user") || '{}');
  const [loader, setLoader] = useState(true);


  // Sample data
  const [classesData, setClassesData] = useState<ClassProgress[]>([]);

  const [teachersData,setTeachersData] =  useState<TeacherProgress[]>([]);

  const filteredClasses = classesData.filter(cls =>
    ('Class ' + cls?.class_number + ' - ' + cls?.class_section).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeachers = teachersData.filter(teacher =>
    teacher.teacher_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClassClick = (classId: string, className: string) => {
    navigate(`/syllabus-progress/class/${classId}?className=${className}`);
  };

  const handleTeacherClick = (teacherId: string, teacherName: string, subject: string, progress: number) => {
    navigate(`/syllabus-progress/teacher/${teacherId}?teacherName=${teacherName}&subject=${subject}&progress=${progress}`);
  };


  const getSyllabusProgressData = async () => {
    try {
      const schoolId = userData.school_id;
      const response = await getSyllabusProgressByClass({ school_id: schoolId });
      if (response && response.data) {
        setLoader(false);
        setClassesData(response.data);
      }
      else {
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong",
          status: "error"
        });
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

  const getSyllabusProgressTeachersData = async () => {
    try {
      const schoolId = userData.school_id;
      const response = await getSyllabusProgressByTeacher({ school_id: schoolId });
      if (response && response.data) {
        setLoader(false);
        setTeachersData(response.data);
      }
      else {
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong",
          status: "error"
        });
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

  useEffect(() => {
    getSyllabusProgressData();
    getSyllabusProgressTeachersData();
  }, []);

  return (
    <>
      <MainLayout pageTitle="Syllabus Progress">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <TabsList className="bg-muted">
                <TabsTrigger value="class" className="px-6">By Class</TabsTrigger>
                <TabsTrigger value="teacher" className="px-6">By Teacher</TabsTrigger>
              </TabsList>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={activeTab === 'class' ? 'Search classes...' : 'Search teachers...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* By Class Tab */}
            <TabsContent value="class" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.map((cls) => (
                  <Card
                    key={cls.class_section_id}
                    className="cursor-pointer hover:shadow-lg transition-shadow border"
                    onClick={() => handleClassClick(cls.class_section_id, (cls.class_number + ' - ' + cls.class_section))}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{cls.class_number + ' - ' + cls.class_section}</span>
                        </div>

                        <div className="w-full space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Board:</span>
                            <span className="font-semibold text-blue-600">{cls.board_name}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold text-blue-600">{cls.completion_percentage}%</span>
                          </div>
                          <Progress value={cls.completion_percentage} className="h-2 bg-blue-100 [&>div]:bg-blue-600" />
                          <p className="text-sm text-center text-muted-foreground">
                            {cls.completed_subjects} of {cls.total_subjects} subjects completed
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* By Teacher Tab */}
            <TabsContent value="teacher" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeachers.map((teacher) => (
                  <Card
                    key={teacher.teacher_id}
                    className="border hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleTeacherClick(teacher.teacher_id, teacher.teacher_name, teacher.subject_name, teacher.completion_percentage)}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-foreground truncate">{teacher.teacher_name}</h3>
                            <p className="text-sm text-muted-foreground">{teacher.subject_name}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Overall Progress</span>
                            <span className="font-semibold text-blue-600">{teacher.completion_percentage}%</span>
                          </div>
                          <Progress value={teacher.completion_percentage} className="h-2 bg-blue-100 [&>div]:bg-blue-600" />
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Classes:</p>
                          <div className="flex flex-wrap gap-2">
                            {teacher.classes_assigned && teacher.classes_assigned.map((cls, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                              >
                                {cls}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
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

export default SyllabusProgress;
