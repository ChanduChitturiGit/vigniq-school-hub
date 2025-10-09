import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '../components/ui/progress';

interface ClassProgress {
  id: string;
  name: string;
  progress: number;
  totalSubjects: number;
  completedSubjects: number;
}

interface TeacherProgress {
  id: string;
  name: string;
  subject: string;
  progress: number;
  classes: string[];
}

// Sample data
const classesData: ClassProgress[] = [
  { id: '1', name: '10A', progress: 30, totalSubjects: 6, completedSubjects: 2 },
  { id: '2', name: '10B', progress: 40, totalSubjects: 6, completedSubjects: 2 },
  { id: '3', name: '10C', progress: 60, totalSubjects: 6, completedSubjects: 4 },
  { id: '4', name: '9A', progress: 75, totalSubjects: 5, completedSubjects: 4 },
  { id: '5', name: '9B', progress: 45, totalSubjects: 5, completedSubjects: 2 },
  { id: '6', name: '8A', progress: 85, totalSubjects: 5, completedSubjects: 4 },
];

const teachersData: TeacherProgress[] = [
  { id: '1', name: 'Sunitha', subject: 'Telugu', progress: 65, classes: ['10A', '10B', '9A'] },
  { id: '2', name: 'Mamatha', subject: 'Hindi', progress: 58, classes: ['10A', '10C', '9B'] },
  { id: '3', name: 'Archana', subject: 'English', progress: 72, classes: ['10B', '10C', '8A'] },
  { id: '4', name: 'Chandrika', subject: 'Mathematics', progress: 80, classes: ['10A', '9A', '8A'] },
  { id: '5', name: 'Satish', subject: 'Physics', progress: 55, classes: ['10B', '10C'] },
];

const SyllabusProgress: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('class');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClasses = classesData.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeachers = teachersData.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClassClick = (classId: string, className: string) => {
    navigate(`/syllabus-progress/class/${classId}?className=${className}`);
  };

  return (
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
                  key={cls.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border"
                  onClick={() => handleClassClick(cls.id, cls.name)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary-foreground">{cls.name}</span>
                      </div>

                      <div className="w-full space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold text-primary">{cls.progress}%</span>
                        </div>
                        <Progress value={cls.progress} className="h-2" />
                        <p className="text-sm text-center text-muted-foreground">
                          {cls.completedSubjects} of {cls.totalSubjects} subjects completed
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
                <Card key={teacher.id} className="border hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-foreground truncate">{teacher.name}</h3>
                          <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Overall Progress</span>
                          <span className="font-semibold text-primary">{teacher.progress}%</span>
                        </div>
                        <Progress value={teacher.progress} className="h-2" />
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Classes:</p>
                        <div className="flex flex-wrap gap-2">
                          {teacher.classes.map((cls, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium"
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
  );
};

export default SyllabusProgress;
