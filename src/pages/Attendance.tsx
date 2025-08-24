
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Clock, CheckCircle, XCircle, AlertCircle, FileText, Edit, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { format, isSameDay, isAfter, startOfDay } from 'date-fns';
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
      morningSubmitted: boolean;
      afternoonSubmitted: boolean;
    };
  };
}

interface AttendanceRecord {
  rollNumber: string;
  studentName: string;
  morningSession: 'Present' | 'Absent';
  afternoonSession: 'Present' | 'Absent';
  overallStatus: 'Full Day Present' | 'Partial Attendance' | 'Full Day Absent';
}

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('class-06');
  const [activeSession, setActiveSession] = useState<'morning' | 'afternoon'>('morning');
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [viewMode, setViewMode] = useState<'attendance' | 'reports'>('attendance');
  const [editingSession, setEditingSession] = useState<'morning' | 'afternoon' | null>(null);

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

  // Sample attendance records for past dates
  const sampleAttendanceRecords: AttendanceRecord[] = [
    { rollNumber: '001', studentName: 'Aarav Sharma', morningSession: 'Present', afternoonSession: 'Present', overallStatus: 'Full Day Present' },
    { rollNumber: '002', studentName: 'Priya Patel', morningSession: 'Present', afternoonSession: 'Absent', overallStatus: 'Partial Attendance' },
    { rollNumber: '003', studentName: 'Rohit Kumar', morningSession: 'Absent', afternoonSession: 'Absent', overallStatus: 'Full Day Absent' },
    { rollNumber: '004', studentName: 'Sneha Reddy', morningSession: 'Present', afternoonSession: 'Present', overallStatus: 'Full Day Present' },
    { rollNumber: '005', studentName: 'Arjun Singh', morningSession: 'Present', afternoonSession: 'Present', overallStatus: 'Full Day Present' },
    { rollNumber: '006', studentName: 'Kavya Iyer', morningSession: 'Present', afternoonSession: 'Present', overallStatus: 'Full Day Present' },
    { rollNumber: '007', studentName: 'Vikram Joshi', morningSession: 'Absent', afternoonSession: 'Present', overallStatus: 'Partial Attendance' },
    { rollNumber: '008', studentName: 'Ananya Gupta', morningSession: 'Present', afternoonSession: 'Present', overallStatus: 'Full Day Present' },
  ];

  const classes = [
    { id: 'class-06', name: 'Class 06' },
    { id: 'class-07', name: 'Class 07' },
    { id: 'class-08', name: 'Class 08' },
  ];

  const [students, setStudents] = useState<Student[]>(sampleStudents);

  const isToday = isSameDay(selectedDate, new Date());
  const isPastDate = !isToday && !isAfter(selectedDate, startOfDay(new Date()));
  const isFutureDate = isAfter(selectedDate, startOfDay(new Date()));

  useEffect(() => {
    // Determine view mode based on selected date
    if (isPastDate && !editingSession) {
      setViewMode('reports');
    } else {
      setViewMode('attendance');
    }

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
  }, [selectedDate, selectedClass, activeSession, attendanceData, editingSession]);

  const getAttendanceStats = () => {
    const totalStudents = students.length;
    const presentStudents = students.filter(s =>
      activeSession === 'morning' ? s.morningPresent : s.afternoonPresent
    ).length;
    const absentStudents = totalStudents - presentStudents;
    const remainingStudents = totalStudents - (presentStudents + absentStudents);

    return { totalStudents, presentStudents, absentStudents, remainingStudents };
  };

  const getReportStats = (session: 'morning' | 'afternoon') => {
    const sessionKey = session === 'morning' ? 'morningSession' : 'afternoonSession';
    const present = sampleAttendanceRecords.filter(record => record[sessionKey] === 'Present').length;
    const absent = sampleAttendanceRecords.filter(record => record[sessionKey] === 'Absent').length;
    return { present, absent };
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
          [activeSession]: students,
          [`${activeSession}Submitted`]: true
        }
      }
    }));

    setEditingSession(null);
    toast.success(`${activeSession === 'morning' ? 'Morning' : 'After Lunch'} attendance submitted successfully!`);
  };

  const handleEditAttendance = (session: 'morning' | 'afternoon') => {
    setEditingSession(session);
    setActiveSession(session);
    setViewMode('attendance');
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Prevent selection of future dates
    if (isAfter(date, startOfDay(new Date()))) {
      toast.error("Cannot select future dates");
      return;
    }
    
    setSelectedDate(date);
    setEditingSession(null);
  };

  const isSessionSubmitted = (session: 'morning' | 'afternoon') => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return attendanceData[dateKey]?.[selectedClass]?.[`${session}Submitted`] || false;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Present</Badge>;
      case 'Absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'Full Day Present':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Full Day Present</Badge>;
      case 'Partial Attendance':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Partial Attendance</Badge>;
      case 'Full Day Absent':
        return <Badge variant="destructive">Full Day Absent</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = getAttendanceStats();
  const morningStats = getReportStats('morning');
  const afternoonStats = getReportStats('afternoon');

  return (
    <MainLayout pageTitle={`Attendance Center`}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Center</h1>
            <p className="text-gray-600">Mark and manage student attendance</p>
          </div>
          {editingSession && (
            <Button
              variant="outline"
              onClick={() => {
                setEditingSession(null);
                if (isPastDate) setViewMode('reports');
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {isPastDate ? 'Reports' : 'Attendance'}
            </Button>
          )}
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
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                  disabled={(date) => isAfter(date, startOfDay(new Date()))}
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

          {/* Right Panel - Dynamic Content */}
          <div className="lg:col-span-2 space-y-6">
            {viewMode === 'reports' && !editingSession ? (
              // Reports View for Past Dates
              <>
                {/* Session Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <CardTitle className="text-lg">Morning Session</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAttendance('morning')}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">{morningStats.present}</div>
                          <div className="text-sm text-gray-600">Present</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600">{morningStats.absent}</div>
                          <div className="text-sm text-gray-600">Absent</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <CardTitle className="text-lg">After Lunch Session</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAttendance('afternoon')}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">{afternoonStats.present}</div>
                          <div className="text-sm text-gray-600">Present</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600">{afternoonStats.absent}</div>
                          <div className="text-sm text-gray-600">Absent</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Attendance Report */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Attendance Report for {classes.find(c => c.id === selectedClass)?.name} - {format(selectedDate, 'E MMM dd yyyy')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Roll No.</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Morning Session</TableHead>
                            <TableHead>After Lunch Session</TableHead>
                            <TableHead>Overall Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sampleAttendanceRecords.map((record) => (
                            <TableRow key={record.rollNumber}>
                              <TableCell className="font-medium">{record.rollNumber}</TableCell>
                              <TableCell>{record.studentName}</TableCell>
                              <TableCell>{getStatusBadge(record.morningSession)}</TableCell>
                              <TableCell>{getStatusBadge(record.afternoonSession)}</TableCell>
                              <TableCell>{getStatusBadge(record.overallStatus)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              // Attendance Taking View
              <>
                {/* Stats Cards */}
                {!isFutureDate && (
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
                )}

                {/* Student Attendance List */}
                {!isFutureDate && (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>
                          Student Attendance - {activeSession === 'morning' ? 'Morning Session' : 'After Lunch Session'}
                        </CardTitle>
                        <Button 
                          onClick={submitAttendance} 
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isSessionSubmitted(activeSession) ? 'Update Attendance' : 'Submit Attendance'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={activeSession} onValueChange={(value) => setActiveSession(value as 'morning' | 'afternoon')}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="morning" className="relative">
                            Morning Session
                            {isSessionSubmitted('morning') && (
                              <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
                            )}
                          </TabsTrigger>
                          <TabsTrigger value="afternoon" className="relative">
                            After Lunch Session
                            {isSessionSubmitted('afternoon') && (
                              <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
                            )}
                          </TabsTrigger>
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
                )}

                {isFutureDate && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Future Date Selected</h3>
                      <p className="text-gray-600">
                        Attendance cannot be marked for future dates. Please select today or a past date.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Attendance;
