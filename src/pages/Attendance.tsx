
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { format, isSameDay } from 'date-fns';
import MainLayout from '@/components/Layout/MainLayout';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  morningPresent: boolean;
  afternoonPresent: boolean;
}

interface AttendanceData {
  [date: string]: {
    [classId: string]: {
      morning: Student[];
      afternoon: Student[];
    };
  };
}

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('class-06');
  const [activeSession, setActiveSession] = useState<'morning' | 'afternoon'>('morning');
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});

  // Sample data - in real app this would come from API
  const sampleStudents: Student[] = [
    { id: '1', name: 'Aarav Sharma', rollNumber: '001', morningPresent: false, afternoonPresent: false },
    { id: '2', name: 'Priya Patel', rollNumber: '002', morningPresent: false, afternoonPresent: false },
    { id: '3', name: 'Rohit Kumar', rollNumber: '003', morningPresent: false, afternoonPresent: false },
    { id: '4', name: 'Sneha Reddy', rollNumber: '004', morningPresent: false, afternoonPresent: false },
    { id: '5', name: 'Arjun Singh', rollNumber: '005', morningPresent: false, afternoonPresent: false },
    { id: '6', name: 'Kavya Iyer', rollNumber: '006', morningPresent: false, afternoonPresent: false },
    { id: '7', name: 'Vikram Joshi', rollNumber: '007', morningPresent: false, afternoonPresent: false },
    { id: '8', name: 'Ananya Gupta', rollNumber: '008', morningPresent: false, afternoonPresent: false },
  ];

  const classes = [
    { id: 'class-06', name: 'Class 06' },
    { id: 'class-07', name: 'Class 07' },
    { id: 'class-08', name: 'Class 08' },
  ];

  const [students, setStudents] = useState<Student[]>(sampleStudents);

  useEffect(() => {
    // Load existing attendance data for selected date and class
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const savedData = attendanceData[dateKey]?.[selectedClass];

    if (savedData) {
      setStudents(activeSession === 'morning' ? savedData.morning : savedData.afternoon);
    } else {
      setStudents(sampleStudents.map(student => ({
        ...student,
        morningPresent: false,
        afternoonPresent: false
      })));
    }
  }, [selectedDate, selectedClass, activeSession, attendanceData]);

  const getAttendanceStats = () => {
    const totalStudents = students.length;
    const presentStudents = students.filter(s =>
      activeSession === 'morning' ? s.morningPresent : s.afternoonPresent
    ).length;
    const absentStudents = totalStudents - presentStudents;
    const remainingStudents = totalStudents - (presentStudents + absentStudents);

    return { totalStudents, presentStudents, absentStudents, remainingStudents };
  };

  const toggleAttendance = (studentId: string, isPresent: boolean) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          [activeSession === 'morning' ? 'morningPresent' : 'afternoonPresent']: isPresent
        };
      }
      return student;
    }));
  };

  const submitAttendance = () => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');

    setAttendanceData(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [selectedClass]: {
          ...prev[dateKey]?.[selectedClass],
          [activeSession]: students
        }
      }
    }));

    toast.success(`${activeSession === 'morning' ? 'Morning' : 'After Lunch'} attendance submitted successfully!`);
  };

  const isToday = isSameDay(selectedDate, new Date());
  const isPastDate = selectedDate < new Date() && !isToday;
  const stats = getAttendanceStats();

  return (
    <MainLayout pageTitle={`Attendance Center`}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Center</h1>
            <p className="text-gray-600">Mark and manage student attendance</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/attendance/reports')}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            View Reports
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Calendar and Class Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select Class</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Attendance Marking */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
                      <p className="text-sm text-gray-600">Total Students</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">{stats.presentStudents}</p>
                      <p className="text-sm text-gray-600">Marked Present</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold text-red-600">{stats.absentStudents}</p>
                      <p className="text-sm text-gray-600">Marked Absent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{stats.remainingStudents}</p>
                      <p className="text-sm text-gray-600">Remaining</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Session Tabs and Student List */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Student Attendance - {activeSession === 'morning' ? 'Morning Session' : 'After Lunch Session'}</CardTitle>
                  <Button onClick={submitAttendance} className="bg-blue-600 hover:bg-blue-700">
                    Submit Attendance
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeSession} onValueChange={(value) => setActiveSession(value as 'morning' | 'afternoon')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="morning">Morning Session</TabsTrigger>
                    <TabsTrigger value="afternoon">After Lunch Session</TabsTrigger>
                  </TabsList>

                  <TabsContent value="morning" className="mt-6">
                    <div className="space-y-4">
                      {students.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-gray-600">Roll No. {student.rollNumber}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={student.morningPresent ? "default" : "outline"}
                              onClick={() => toggleAttendance(student.id, true)}
                              className={student.morningPresent ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={!student.morningPresent ? "destructive" : "outline"}
                              onClick={() => toggleAttendance(student.id, false)}
                            >
                              Absent
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="afternoon" className="mt-6">
                    <div className="space-y-4">
                      {students.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-gray-600">Roll No. {student.rollNumber}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={student.afternoonPresent ? "default" : "outline"}
                              onClick={() => toggleAttendance(student.id, true)}
                              className={student.afternoonPresent ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={!student.afternoonPresent ? "destructive" : "outline"}
                              onClick={() => toggleAttendance(student.id, false)}
                            >
                              Absent
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Attendance;
