import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Clock, CheckCircle, Eye, X, ArrowLeft } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import { useSnackbar } from "@/components/snackbar/SnackbarContext";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dayjs, { Dayjs } from "dayjs";
import '../pages/styles/datepicker.scss';

interface DiaryEntry {
  id: string;
  classId: string;
  className: string;
  section: string;
  subject: string;
  teacherName: string;
  status: 'submitted' | 'pending';
  classNotes: string;
  homework: string;
  reviewed: boolean;
}

const AdminTeacherDiaries: React.FC = () => {
  const { showSnackbar } = useSnackbar();

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedClass, setSelectedClass] = useState<string>('8A');
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);

  // Sample data for classes
  const classes = [
    { id: '8A', label: 'Class 8 A' },
    { id: '8B', label: 'Class 8 B' },
    { id: '9A', label: 'Class 9 A' },
    { id: '9B', label: 'Class 9 B' },
    { id: '10A', label: 'Class 10 A' },
    { id: '10B', label: 'Class 10 B' },
  ];

  // Sample data for diary entries
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([
    {
      id: '1',
      classId: '8A',
      className: 'Class 8',
      section: 'A',
      subject: 'Mathematics',
      teacherName: 'Sarah Johnson',
      status: 'submitted',
      classNotes: 'Covered quadratic equations. Students understood the concept well. Practiced solving problems using the quadratic formula.',
      homework: 'Complete exercises 3.1 to 3.5 from textbook',
      reviewed: false
    },
    {
      id: '2',
      classId: '8A',
      className: 'Class 8',
      section: 'A',
      subject: 'English',
      teacherName: 'Michael Smith',
      status: 'pending',
      classNotes: '',
      homework: '',
      reviewed: false
    },
    {
      id: '3',
      classId: '8A',
      className: 'Class 8',
      section: 'A',
      subject: 'Science',
      teacherName: 'Emily Davis',
      status: 'submitted',
      classNotes: 'Discussed photosynthesis process. Conducted a lab experiment to observe chlorophyll.',
      homework: 'Read chapter 3 and answer questions',
      reviewed: false
    },
    {
      id: '4',
      classId: '8B',
      className: 'Class 8',
      section: 'B',
      subject: 'Mathematics',
      teacherName: 'Sarah Johnson',
      status: 'pending',
      classNotes: '',
      homework: '',
      reviewed: false
    },
    {
      id: '5',
      classId: '9A',
      className: 'Class 9',
      section: 'A',
      subject: 'Physics',
      teacherName: 'David Wilson',
      status: 'submitted',
      classNotes: 'Introduction to Newton\'s laws of motion. Demonstrated with practical examples.',
      homework: 'Solve numerical problems from page 45',
      reviewed: false
    },
  ]);

  // Filter entries by selected class
  const filteredEntries = diaryEntries.filter(entry => entry.classId === selectedClass);

  // Calculate stats for selected class
  const totalTeachers = filteredEntries.length;
  const submittedCount = filteredEntries.filter(e => e.status === 'submitted').length;
  const pendingCount = filteredEntries.filter(e => e.status === 'pending').length;

  const handleViewEntry = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setIsMobileDetailView(true);
  };

  const handleMarkAsReviewed = () => {
    if (selectedEntry) {
      const updatedEntries = diaryEntries.map(entry =>
        entry.classId === selectedClass
          ? { ...entry, reviewed: true }
          : entry
      );
      setDiaryEntries(updatedEntries);
      
      showSnackbar({
        title: "✅ Success",
        description: `All diaries for ${selectedClass} marked as reviewed`,
        status: "success"
      });
    }
  };

  const handleBack = () => {
    setIsMobileDetailView(false);
    setSelectedEntry(null);
  };

  const allReviewed = filteredEntries.length > 0 && filteredEntries.every(e => e.reviewed);

  return (
    <MainLayout pageTitle="Teacher Diaries">
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Teacher Diaries</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Teachers Submitted Card */}
          <Card className="border-border bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{submittedCount} / {totalTeachers}</div>
                    <div className="text-sm text-muted-foreground">Teachers Submitted</div>
                    <div className="text-xs text-muted-foreground mt-1">Diaries submitted today</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Submissions Card */}
          <Card className="border-border bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{pendingCount} teachers</div>
                    <div className="text-sm text-muted-foreground">Pending Submissions</div>
                    <div className="text-xs text-muted-foreground mt-1">Awaiting diary submissions</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-orange-600 border-orange-300">
                  View List
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Date Picker and Class Selector */}
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Date Picker */}
              <div className="w-full md:w-auto">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    maxDate={dayjs()}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>

              {/* Class Selector */}
              <div className="w-full md:w-64">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Class:</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Desktop */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6">
          {/* Left Side - Subject List */}
          <Card className={selectedEntry ? "lg:col-span-5 border-border" : "lg:col-span-12 border-border"}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground mb-4">Subject</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow
                        key={entry.id}
                        className={selectedEntry?.id === entry.id ? 'bg-blue-50' : ''}
                      >
                        <TableCell className="font-medium text-foreground">{entry.subject}</TableCell>
                        <TableCell>
                          <Badge
                            variant={entry.status === 'submitted' ? 'default' : 'secondary'}
                            className={entry.status === 'submitted' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-100'}
                          >
                            {entry.status === 'submitted' ? 'Submitted' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{entry.teacherName}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewEntry(entry)}
                            className="hover:bg-accent"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Right Side - Entry Details */}
          <div
            className={`transition-all duration-500 ease-in-out 
              ${selectedEntry ? "lg:col-span-7 opacity-100 translate-x-0" : "lg:col-span-0 opacity-0 translate-x-full pointer-events-none"}`}
          >
            {selectedEntry && (
              <Card className="h-full border-border">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Header with Close Button */}
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <h2 className="text-lg font-semibold text-foreground">
                        {selectedEntry.className} {selectedEntry.section} - {selectedEntry.subject}
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEntry(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Class Notes */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <h3 className="font-medium text-foreground">Class Notes</h3>
                      </div>
                      <div className="p-4 bg-muted rounded-md min-h-[100px]">
                        {selectedEntry.classNotes || <span className="text-muted-foreground">No notes added yet</span>}
                      </div>
                    </div>

                    {/* Homework Assignment */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <h3 className="font-medium text-foreground">Homework Assignment</h3>
                      </div>
                      <div className="p-4 bg-muted rounded-md min-h-[100px]">
                        {selectedEntry.homework || <span className="text-muted-foreground">No homework assigned yet</span>}
                      </div>
                    </div>

                    {/* Administrative Review Section */}
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-md">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="font-medium text-foreground">Administrative Review - {selectedEntry.className} {selectedEntry.section}</p>
                            <p className="text-sm text-muted-foreground">Review all diary entries for this class</p>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleMarkAsReviewed}
                        disabled={allReviewed}
                        className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {allReviewed ? 'Reviewed' : 'Mark as Reviewed'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Mobile/Tablet View */}
        <div className="lg:hidden">
          {!isMobileDetailView ? (
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Subject</h2>
                  <div className="space-y-3">
                    {filteredEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-4 border border-border rounded-lg space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-foreground">{entry.subject}</div>
                            <div className="text-sm text-muted-foreground">{entry.teacherName}</div>
                          </div>
                          <Badge
                            variant={entry.status === 'submitted' ? 'default' : 'secondary'}
                            className={entry.status === 'submitted' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-100'}
                          >
                            {entry.status === 'submitted' ? 'Submitted' : 'Pending'}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEntry(entry)}
                          className="w-full"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border">
              <CardContent className="p-4">
                {selectedEntry && (
                  <div className="space-y-6">
                    {/* Header with Back Button */}
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <h2 className="text-lg font-semibold text-foreground">
                        {selectedEntry.className} {selectedEntry.section} - {selectedEntry.subject}
                      </h2>
                    </div>

                    {/* Class Notes */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <h3 className="font-medium text-foreground">Class Notes</h3>
                      </div>
                      <div className="p-4 bg-muted rounded-md min-h-[100px]">
                        {selectedEntry.classNotes || <span className="text-muted-foreground">No notes added yet</span>}
                      </div>
                    </div>

                    {/* Homework Assignment */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <h3 className="font-medium text-foreground">Homework Assignment</h3>
                      </div>
                      <div className="p-4 bg-muted rounded-md min-h-[100px]">
                        {selectedEntry.homework || <span className="text-muted-foreground">No homework assigned yet</span>}
                      </div>
                    </div>

                    {/* Administrative Review Section */}
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-md">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="font-medium text-foreground">Administrative Review - {selectedEntry.className} {selectedEntry.section}</p>
                            <p className="text-sm text-muted-foreground">Review all diary entries for this class</p>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleMarkAsReviewed}
                        disabled={allReviewed}
                        className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {allReviewed ? 'Reviewed' : 'Mark as Reviewed'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminTeacherDiaries;
