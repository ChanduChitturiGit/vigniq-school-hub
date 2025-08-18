import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { format } from 'date-fns';

const AttendanceCenter = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('Class 06');
  const [session, setSession] = useState<string>('morning');

  // Sample data
  const attendanceData = {
    totalStudents: 8,
    markedPresent: 0,
    markedAbsent: 0,
    remaining: 8
  };

  const students = [
    { id: 1, name: 'Aarav Sharma', rollNo: '001', avatar: 'AS', status: null },
    { id: 2, name: 'Priya Patel', rollNo: '002', avatar: 'PP', status: null },
    { id: 3, name: 'Rohit Kumar', rollNo: '003', avatar: 'RK', status: null },
    { id: 4, name: 'Sneha Reddy', rollNo: '004', avatar: 'SR', status: null },
    { id: 5, name: 'Arjun Singh', rollNo: '005', avatar: 'AS', status: null },
    { id: 6, name: 'Kavya Iyer', rollNo: '006', avatar: 'KI', status: null },
    { id: 7, name: 'Vikram Joshi', rollNo: '007', avatar: 'VJ', status: null },
    { id: 8, name: 'Ananya Gupta', rollNo: '008', avatar: 'AG', status: null }
  ];

  const [studentAttendance, setStudentAttendance] = useState(students);

  const updateAttendance = (studentId: number, status: 'present' | 'absent') => {
    setStudentAttendance(prev => 
      prev.map(student => 
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const getAttendanceStats = () => {
    const present = studentAttendance.filter(s => s.status === 'present').length;
    const absent = studentAttendance.filter(s => s.status === 'absent').length;
    const remaining = studentAttendance.filter(s => s.status === null).length;
    
    return { present, absent, remaining };
  };

  const stats = getAttendanceStats();

  const handleSubmitAttendance = () => {
    // Handle submission logic here
    console.log('Submitting attendance for:', selectedDate, selectedClass, session);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Attendance Center</h1>
          <Button onClick={handleSubmitAttendance} className="bg-primary hover:bg-primary/90">
            Submit Attendance
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Calendar and Class Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Date</CardTitle>
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
                <CardTitle className="text-lg">Select Class</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Class 06">Class 06</SelectItem>
                    <SelectItem value="Class 07">Class 07</SelectItem>
                    <SelectItem value="Class 08">Class 08</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Attendance Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{attendanceData.totalStudents}</p>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.present}</p>
                      <p className="text-sm text-muted-foreground">Marked Present</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <UserX className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.absent}</p>
                      <p className="text-sm text-muted-foreground">Marked Absent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.remaining}</p>
                      <p className="text-sm text-muted-foreground">Remaining</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Session Tabs */}
            <div className="flex space-x-2">
              <Button
                variant={session === 'morning' ? 'default' : 'outline'}
                onClick={() => setSession('morning')}
              >
                Morning Session
              </Button>
              <Button
                variant={session === 'afternoon' ? 'default' : 'outline'}
                onClick={() => setSession('afternoon')}
              >
                After Lunch Session
              </Button>
            </div>

            {/* Student Attendance List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Student Attendance - {session === 'morning' ? 'Morning' : 'After Lunch'} Session</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentAttendance.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {student.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-sm text-muted-foreground">Roll No. {student.rollNo}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant={student.status === 'present' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateAttendance(student.id, 'present')}
                          className={`${
                            student.status === 'present'
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'hover:bg-green-50 hover:text-green-600 hover:border-green-600'
                          }`}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Present
                        </Button>
                        <Button
                          variant={student.status === 'absent' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateAttendance(student.id, 'absent')}
                          className={`${
                            student.status === 'absent'
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'hover:bg-red-50 hover:text-red-600 hover:border-red-600'
                          }`}
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Absent
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCenter;