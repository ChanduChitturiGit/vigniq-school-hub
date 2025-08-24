
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceRecord {
  rollNumber: string;
  studentName: string;
  morningSession: 'Present' | 'Absent';
  afternoonSession: 'Present' | 'Absent';
  overallStatus: 'Full Day Present' | 'Partial Attendance' | 'Full Day Absent';
}

const AttendanceReports: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2025-08-12'));
  const [selectedClass, setSelectedClass] = useState<string>('class-06');

  // Sample attendance report data
  const attendanceRecords: AttendanceRecord[] = [
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

  const getSessionSummary = (session: 'morning' | 'afternoon') => {
    const sessionKey = session === 'morning' ? 'morningSession' : 'afternoonSession';
    const present = attendanceRecords.filter(record => record[sessionKey] === 'Present').length;
    const absent = attendanceRecords.filter(record => record[sessionKey] === 'Absent').length;
    return { present, absent };
  };

  const morningStats = getSessionSummary('morning');
  const afternoonStats = getSessionSummary('afternoon');

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/attendance')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Attendance
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
            <p className="text-gray-600">View and export attendance reports</p>
          </div>
        </div>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Calendar and Class Selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
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

        {/* Right Panel - Reports */}
        <div className="lg:col-span-3 space-y-6">
          {/* Session Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Morning Session Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
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
              <CardHeader>
                <CardTitle className="text-lg">After Lunch Session Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
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
                Attendance Report for CLASS 06 - {format(selectedDate, 'E MMM dd yyyy')}
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
                    {attendanceRecords.map((record) => (
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
        </div>
      </div>
    </div>
  );
};

export default AttendanceReports;
