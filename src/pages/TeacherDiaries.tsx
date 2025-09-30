import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Eye, X, Edit2, Save, ArrowLeft } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import { useSnackbar } from "@/components/snackbar/SnackbarContext";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import '../pages/styles/datepicker.scss';

interface DiaryEntry {
  id: string;
  classId: string;
  className: string;
  section: string;
  subject: string;
  status: 'pending' | 'complete';
  classNotes: string;
  homework: string;
  administrativeReview: string;
}

const TeacherDiaries: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [editedHomework, setEditedHomework] = useState('');
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);

  // Sample data - replace with actual API call
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([
    {
      id: '1',
      classId: '8A',
      className: 'Class 8',
      section: 'A',
      subject: 'Mathematics',
      status: 'pending',
      classNotes: '',
      homework: '',
      administrativeReview: 'pending'
    },
    {
      id: '2',
      classId: '8B',
      className: 'Class 8',
      section: 'B',
      subject: 'Mathematics',
      status: 'pending',
      classNotes: '',
      homework: '',
      administrativeReview: 'pending'
    },
    {
      id: '3',
      classId: '9A',
      className: 'Class 9',
      section: 'A',
      subject: 'Physics',
      status: 'pending',
      classNotes: '',
      homework: '',
      administrativeReview: 'pending'
    },
    {
      id: '4',
      classId: '9B',
      className: 'Class 9',
      section: 'B',
      subject: 'Physics',
      status: 'pending',
      classNotes: '',
      homework: '',
      administrativeReview: 'pending'
    },
    {
      id: '5',
      classId: '10A',
      className: 'Class 10',
      section: 'A',
      subject: 'Chemistry',
      status: 'pending',
      classNotes: '',
      homework: '',
      administrativeReview: 'pending'
    },
    {
      id: '6',
      classId: '10B',
      className: 'Class 10',
      section: 'B',
      subject: 'Chemistry',
      status: 'pending',
      classNotes: '',
      homework: '',
      administrativeReview: 'pending'
    }
  ]);

  // Calculate stats
  const totalEntries = diaryEntries.length;
  const completeEntries = diaryEntries.filter(e => e.status === 'complete').length;
  const pendingEntries = totalEntries - completeEntries;

  const handleViewEntry = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setEditedNotes(entry.classNotes);
    setEditedHomework(entry.homework);
    setIsMobileDetailView(true);
  };

  const handleSave = () => {
    if (selectedEntry) {
      const updatedEntries = diaryEntries.map(entry =>
        entry.id === selectedEntry.id
          ? {
            ...entry,
            classNotes: editedNotes,
            homework: editedHomework,
            status: (editedNotes || editedHomework) ? 'complete' as const : 'pending' as const
          }
          : entry
      );
      setDiaryEntries(updatedEntries);
      setSelectedEntry({
        ...selectedEntry,
        classNotes: editedNotes,
        homework: editedHomework,
        status: (editedNotes || editedHomework) ? 'complete' : 'pending'
      });
      setIsEditing(false);

      showSnackbar({
        title: "✅ Success",
        description: "Diary entry saved successfully",
        status: "success"
      });
    }
  };

  const handleBack = () => {
    setIsMobileDetailView(false);
    setSelectedEntry(null);
    setIsEditing(false);
  };

  const isFutureDate = selectedDate ? selectedDate.isAfter(dayjs(), 'day') : false;

  return (
    <MainLayout pageTitle="Teacher Diaries">
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Teacher Diaries</h1>
        </div>

        {/* Date Picker and Stats */}
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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

              {/* Stats */}
              <div className="flex gap-4 md:gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalEntries}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completeEntries}</div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{pendingEntries}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Main Content - Desktop */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6">
          {/* Left Side - Class List */}
          <Card className={selectedEntry ? "lg:col-span-5 border-border" : "lg:col-span-12 border-border"}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground mb-4">Class & Subject</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class & Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {diaryEntries.map((entry) => (
                      <TableRow
                        key={entry.id}
                        className={selectedEntry?.id === entry.id ? 'bg-blue-50' : ''}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">{entry.className} {entry.section}</div>
                            <div className="text-sm text-muted-foreground">{entry.subject}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={entry.status === 'complete' ? 'default' : 'secondary'}
                            className={entry.status === 'complete' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-100'}
                          >
                            {entry.status === 'complete' ? '✓ Complete' : '○ Pending'}
                          </Badge>
                        </TableCell>
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

          {/* Right Side - Entry Details (only show if selectedEntry exists) */}
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
                        onClick={() => setSelectedEntry(null)} // 👈 closes panel
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* --- Class Notes --- */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <h3 className="font-medium text-foreground">Class Notes</h3>
                        </div>
                        {!isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {isEditing ? (
                        <Textarea
                          value={editedNotes}
                          onChange={(e) => setEditedNotes(e.target.value)}
                          placeholder="Add class notes..."
                          rows={5}
                          className="w-full"
                        />
                      ) : (
                        <div className="p-4 bg-muted rounded-md min-h-[100px]">
                          {selectedEntry.classNotes || <span className="text-muted-foreground">No notes added yet</span>}
                        </div>
                      )}
                    </div>

                    {/* --- Homework Assignment --- */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <h3 className="font-medium text-foreground">Homework Assignment</h3>
                      </div>
                      {isEditing ? (
                        <Textarea
                          value={editedHomework}
                          onChange={(e) => setEditedHomework(e.target.value)}
                          placeholder="Add homework assignment..."
                          rows={5}
                          className="w-full"
                        />
                      ) : (
                        <div className="p-4 bg-muted rounded-md min-h-[100px]">
                          {selectedEntry.homework || <span className="text-muted-foreground">No homework assigned yet</span>}
                        </div>
                      )}
                    </div>

                    {/* --- Administrative Review --- */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <h3 className="font-medium text-foreground">Administrative Review</h3>
                      </div>
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-yellow-800 text-sm">⚠️ Pending Administrative Review</p>
                      </div>
                    </div>

                    {/* --- Save Button --- */}
                    {isEditing && (
                      <div className="flex justify-end pt-4">
                        <Button
                          onClick={handleSave}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    )}
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
                  <h2 className="text-lg font-semibold text-foreground">Class & Subject</h2>
                  <div className="space-y-3">
                    {diaryEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-4 border border-border rounded-lg space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-foreground">{entry.className} {entry.section}</div>
                            <div className="text-sm text-muted-foreground">{entry.subject}</div>
                          </div>
                          <Badge
                            variant={entry.status === 'complete' ? 'default' : 'secondary'}
                            className={entry.status === 'complete' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-100'}
                          >
                            {entry.status === 'complete' ? '✓ Complete' : '○ Pending'}
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <h3 className="font-medium text-foreground">Class Notes</h3>
                        </div>
                        {!isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {isEditing ? (
                        <Textarea
                          value={editedNotes}
                          onChange={(e) => setEditedNotes(e.target.value)}
                          placeholder="Add class notes..."
                          rows={5}
                          className="w-full"
                        />
                      ) : (
                        <div className="p-4 bg-muted rounded-md min-h-[100px]">
                          {selectedEntry.classNotes || <span className="text-muted-foreground">No notes added yet</span>}
                        </div>
                      )}
                    </div>

                    {/* Homework Assignment */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <h3 className="font-medium text-foreground">Homework Assignment</h3>
                      </div>
                      {isEditing ? (
                        <Textarea
                          value={editedHomework}
                          onChange={(e) => setEditedHomework(e.target.value)}
                          placeholder="Add homework assignment..."
                          rows={5}
                          className="w-full"
                        />
                      ) : (
                        <div className="p-4 bg-muted rounded-md min-h-[100px]">
                          {selectedEntry.homework || <span className="text-muted-foreground">No homework assigned yet</span>}
                        </div>
                      )}
                    </div>

                    {/* Administrative Review */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <h3 className="font-medium text-foreground">Administrative Review</h3>
                      </div>
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-yellow-800 text-sm">
                          ⚠️ Pending Administrative Review
                        </p>
                      </div>
                    </div>

                    {/* Save Button */}
                    {isEditing && (
                      <div className="flex flex-col gap-2 pt-4">
                        <Button
                          onClick={handleSave}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleBack}
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
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

export default TeacherDiaries;
