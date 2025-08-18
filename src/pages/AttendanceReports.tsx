import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Users, UserCheck, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const AttendanceReports = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2025-08-12'));
  const [selectedClass, setSelectedClass] = useState<string>('Class 06');

  // Sample data for reports
  const morningSessionStats = {
    present: 6,
    absent: 2
  };

  const afternoonSessionStats = {
    present: 6,
    absent: 2
  };

  const attendanceReport = [
    {
      rollNo: '001',
      studentName: 'Aarav Sharma',
      morningSession: 'Present',
      afterLunchSession: 'Present',
      overallStatus: 'Full Day Present'
    },
    {
      rollNo: '002',
      studentName: 'Priya Patel',
      morningSession: 'Present',
      afterLunchSession: 'Absent',
      overallStatus: 'Partial Attendance'
    },
    {
      rollNo: '003',
      studentName: 'Rohit Kumar',
      morningSession: 'Absent',
      afterLunchSession: 'Absent',
      overallStatus: 'Full Day Absent'
    },
    {
      rollNo: '004',
      studentName: 'Sneha Reddy',
      morningSession: 'Present',
      afterLunchSession: 'Present',
      overallStatus: 'Full Day Present'
    },
    {
      rollNo: '005',
      studentName: 'Arjun Singh',
      morningSession: 'Present',
      afterLunchSession: 'Present',
      overallStatus: 'Full Day Present'
    },
    {
      rollNo: '006',
      studentName: 'Kavya Iyer',
      morningSession: 'Present',
      afterLunchSession: 'Present',
      overallStatus: 'Full Day Present'
    },
    {
      rollNo: '007',
      studentName: 'Vikram Joshi',
      morningSession: 'Absent',
      afterLunchSession: 'Present',
      overallStatus: 'Partial Attendance'
    },
    {
      rollNo: '008',
      studentName: 'Ananya Gupta',
      morningSession: 'Present',
      afterLunchSession: 'Present',
      overallStatus: 'Full Day Present'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Present</Badge>;
      case 'Absent':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Absent</Badge>;
      case 'Full Day Present':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Full Day Present</Badge>;
      case 'Full Day Absent':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Full Day Absent</Badge>;
      case 'Partial Attendance':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Partial Attendance</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleExportReport = () => {
    // Handle export functionality
    console.log('Exporting report...');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/attendance-center')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Attendance</span>
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Attendance Reports</h1>
          </div>
          <Button onClick={handleExportReport} className="bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" />
            Export Report
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

          {/* Right Panel - Reports */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-center">Morning Session Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center space-x-8">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{morningSessionStats.present}</p>
                      <p className="text-sm text-muted-foreground">Present</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">{morningSessionStats.absent}</p>
                      <p className="text-sm text-muted-foreground">Absent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-center">After Lunch Session Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center space-x-8">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{afternoonSessionStats.present}</p>
                      <p className="text-sm text-muted-foreground">Present</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">{afternoonSessionStats.absent}</p>
                      <p className="text-sm text-muted-foreground">Absent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Report Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Attendance Report for {selectedClass} - {format(selectedDate, 'EEE MMM dd yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-muted-foreground">Roll No.</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Student Name</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">Morning Session</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">After Lunch Session</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">Overall Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceReport.map((record) => (
                        <tr key={record.rollNo} className="border-b hover:bg-accent/5">
                          <td className="p-3 font-medium">{record.rollNo}</td>
                          <td className="p-3">{record.studentName}</td>
                          <td className="p-3 text-center">
                            {getStatusBadge(record.morningSession)}
                          </td>
                          <td className="p-3 text-center">
                            {getStatusBadge(record.afterLunchSession)}
                          </td>
                          <td className="p-3 text-center">
                            {getStatusBadge(record.overallStatus)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReports;