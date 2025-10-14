import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Eye, X, Edit2, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import { useSnackbar } from "@/components/snackbar/SnackbarContext";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import '../pages/styles/datepicker.scss';
import { getTeacherDiaries, saveTeacherDiary } from '../services/diaries'
import { format, isSunday, isToday } from 'date-fns';
import { selectClasses } from '@mui/material/Select';


interface DiaryEntry {
  diary_id: string;
  classId: string;
  className: string;
  class_section: string;
  subject_name: string;
  status: 'pending' | 'complete' | 'submitted';
  notes: string;
  homework_assigned: string;
  is_admin_reviewed: boolean;
  class_number: Number
}

const TeacherDiaries: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [editedHomework, setEditedHomework] = useState('');
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);


  const [diaryEntries, setDiaryEntries] = useState([]);

  const diaryData = async () => {
    try {
      const payload = {
        school_id: userData.school_id,
        teacher_id: userData.user_id,
        date: format(selectedDate.toDate(), 'yyyy-MM-dd')
      }
      const response = await getTeacherDiaries(payload);
      if (response && response.data) {
        setDiaryEntries(response.data);
      } else {
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong with classes list",
          status: "error"
        });
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong with classes list",
        status: "error"
      });
    }
  }

  const saveDiaryData = async () => {
    try {
      const payload = {
        school_id: userData.school_id,
        teacher_id: userData.user_id,
        date: format(selectedDate.toDate(), 'yyyy-MM-dd'),
        diary_id: selectedEntry.diary_id,
        notes: editedNotes,
        homework_assigned: editedHomework
      }
      const response = await saveTeacherDiary(payload);
      if (response && response.message) {
        setIsMobileDetailView(!isMobileDetailView);
        setIsEditing(false);
        setSelectedEntry(null);
        showSnackbar({
          title: "Success",
          description: response.message,
          status: "success"
        });
        diaryData();
      } else {
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong with classes list",
          status: "error"
        });
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong with classes list",
        status: "error"
      });
    }
  }

  useEffect(() => {
    setIsMobileDetailView(false);
    setSelectedEntry(null);
    setIsEditing(false);
    diaryData();
  }, [selectedDate])

  // Calculate stats
  const totalEntries = diaryEntries && diaryEntries?.length;
  const completeEntries = totalEntries > 0 ? diaryEntries?.filter(e => e.status == 'submitted').length : 0;
  const pendingEntries = totalEntries - completeEntries;

  const handleViewEntry = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setEditedNotes(entry.notes);
    setEditedHomework(entry.homework_assigned);
    setIsMobileDetailView(true);
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
        {/* <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Teacher Diaries</h1>
        </div> */}

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
                    format="DD/MM/YYYY"
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
                  <div className="text-sm text-muted-foreground">Submitted</div>
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
          {
            diaryEntries && diaryEntries.length > 0 ?
              (
                <Card className={selectedEntry ? "lg:col-span-5 border-border" : "lg:col-span-12 border-border"}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* <h2 className="text-lg font-semibold text-foreground mb-4">Class & subject_name</h2> */}
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
                              key={entry.diary_id}
                              className={selectedEntry?.diary_id === entry.diary_id ? 'bg-blue-50' : ''}
                              onClick={() => handleViewEntry(entry)}
                            >
                              <TableCell>
                                <div>
                                  <div className="font-medium text-foreground">{'Class ' + entry.class_number + ' - ' + entry.class_section + '(' + entry.board_name + ')'}</div>
                                  <div className="text-sm text-muted-foreground">{entry.subject_name}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={entry.status === 'submitted' ? 'default' : 'secondary'}
                                  className={entry.status === 'submitted' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-100'}
                                >
                                  {entry.status === 'submitted' ? '✓ submitted' : '○ Pending'}
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
              ) :
              (
                <Card className='lg:col-span-12 border-border'>
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    {
                      <>
                        <h2 className="text-2xl font-bold mb-2">No Data Found</h2>
                        {!isSunday(selectedDate.toDate()) && <span className="text-gray-600">No records for <span className='font-bold'>{`${format(selectedDate.toDate(), "EEE, dd MMM yyyy")}. `}</span> Try choosing another date.</span>}
                        {isSunday(selectedDate.toDate()) && <span className="text-gray-600"><span className='font-bold'>{`${format(selectedDate.toDate(), "EEE, dd MMM yyyy")}`}</span> is Holiday. Try choosing another date.</span>}
                      </>
                    }
                  </CardContent>
                </Card>
              )
          }


          {/* Right Side - Entry Details (only show if selectedEntry exists) */}
          <div
            className={`transition-all duration-500 ease-in-out 
    ${selectedEntry && diaryEntries && diaryEntries.length > 0 ? "lg:col-span-7 opacity-100 translate-x-0" : "lg:col-span-0 opacity-0 translate-x-full pointer-events-none"}`}
          >
            {selectedEntry && diaryEntries && diaryEntries.length > 0 && (
              <Card className="h-full border-border">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Header with Close Button */}
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <h2 className="text-lg font-semibold text-foreground">
                        {'Class ' + selectedEntry.class_number + ' - ' + selectedEntry.class_section} - {selectedEntry.subject_name} {'(' + selectedEntry.board_name + ')'}
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEntry(null);
                          setIsEditing(false);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* --- Class Notes --- */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <h3 className="font-medium text-foreground">Class Notes*</h3>
                        </div>
                        {!isEditing && isToday(selectedDate.toDate()) && !selectedEntry.is_admin_reviewed && (
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
                          autoFocus
                        />
                      ) : (
                        <div className="p-4 bg-muted rounded-md min-h-[100px]">
                          {selectedEntry.notes || <span className="text-muted-foreground">No notes added yet</span>}
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
                          {selectedEntry.homework_assigned || <span className="text-muted-foreground">No homework assigned yet</span>}
                        </div>
                      )}
                    </div>

                    {/* --- Administrative Review --- */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <h3 className="font-medium text-foreground">Principal Review</h3>
                      </div>
                      {/* is_admin_reviewed */}
                      {
                        !selectedEntry.is_admin_reviewed ? (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-yellow-800 text-sm">⚠️ Pending Principal Review</p>
                          </div>
                        ) : (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-yellow-800 text-sm">✅ Principal Reviewed</p>
                          </div>
                        )
                      }
                    </div>

                    {/* --- Save Button --- */}
                    {isEditing && (
                      <div className="flex justify-end pt-4">
                        <Button
                          onClick={saveDiaryData}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={!editedNotes}
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
          {!isMobileDetailView && diaryEntries && diaryEntries.length > 0 && (
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Class & Subject</h2>
                  <div className="space-y-3">
                    {diaryEntries && diaryEntries.map((entry) => (
                      <div
                        key={entry.diary_id}
                        className="p-4 border border-border rounded-lg space-y-3"
                      >
                        <div className="flex flex-wrap items-start justify-between">
                          <div>
                            <div className="font-medium text-foreground">{'Class ' + entry.class_number + ' - ' + entry.class_section + '(' + entry.board_name + ')'}</div>
                            <div className="text-sm text-muted-foreground">{entry.subject_name}</div>
                          </div>
                          <Badge
                            variant={entry.status === 'submitted' ? 'default' : 'secondary'}
                            className={entry.status === 'submitted' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-100'}
                          >
                            {entry.status === 'submitted' ? '✓ submitted' : '○ Pending'}
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
          )}
          {isMobileDetailView && diaryEntries && diaryEntries.length > 0 && (
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
                        {'Class ' + selectedEntry.class_number + ' - ' + selectedEntry.class_section} - {selectedEntry.subject_name} {'(' + selectedEntry.board_name + ')'}
                      </h2>
                    </div>

                    {/* Class Notes */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <h3 className="font-medium text-foreground">Class Notes</h3>
                        </div>
                        {!isEditing && !selectedEntry.is_admin_reviewed && (
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
                          {selectedEntry.notes || <span className="text-muted-foreground">No notes added yet</span>}
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
                          {selectedEntry.homework_assigned || <span className="text-muted-foreground">No homework assigned yet</span>}
                        </div>
                      )}
                    </div>

                    {/* Administrative Review */}
                    {
                        !selectedEntry.is_admin_reviewed ? (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-yellow-800 text-sm">⚠️ Pending Principal Review</p>
                          </div>
                        ) : (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-yellow-800 text-sm">✅ Principal Reviewed</p>
                          </div>
                        )
                      }

                    {/* Save Button */}
                    {isEditing && (
                      <div className="flex flex-col gap-2 pt-4">
                        <Button
                          onClick={saveDiaryData}
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
          {
            diaryEntries && diaryEntries.length == 0 && (
              <Card className='lg:col-span-12 border-border'>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  {
                    <>
                      <h2 className="text-2xl font-bold mb-2">No Data Found</h2>
                      {!isSunday(selectedDate.toDate()) && <span className="text-gray-600">No records for <span className='font-bold'>{`${format(selectedDate.toDate(), "EEE, dd MMM yyyy")}. `}</span> Try choosing another date.</span>}
                      {isSunday(selectedDate.toDate()) && <span className="text-gray-600"><span className='font-bold'>{`${format(selectedDate.toDate(), "EEE, dd MMM yyyy")}`}</span> is Holiday. Try choosing another date.</span>}
                    </>
                  }
                </CardContent>
              </Card>
            )
          }
        </div>
      </div>
    </MainLayout>
  );
};

export default TeacherDiaries;
