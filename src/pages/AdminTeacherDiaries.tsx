import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Clock, CheckCircle, Eye, X, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import { useSnackbar } from "@/components/snackbar/SnackbarContext";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dayjs, { Dayjs } from "dayjs";
import '../pages/styles/datepicker.scss';
import { getTeacherDiariesByAdmin, markDiaryAsReviewed } from '../services/diaries'
import { format, isSunday } from 'date-fns';
import { getClassesBySchoolId } from '@/services/class';

interface DiaryEntry {
  diary_id: string;
  classId: string;
  className: string;
  section: string;
  subject_name: string;
  teacher_name: string;
  status: 'submitted' | 'pending';
  notes: string;
  homework_assigned: string;
  reviewed: boolean;
}

const AdminTeacherDiaries: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedClass, setSelectedClass] = useState<any>({});
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sample data for diary entries
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);

  // Filter entries by selected class
  const filteredEntries = [...diaryEntries];

  // Calculate stats for selected class
  const totalTeachers = diaryEntries.length;
  const submittedCount = diaryEntries.filter(e => e.status === 'submitted').length;
  const pendingCount = diaryEntries.filter(e => e.status === 'pending').length;

  //classes list api
  const getClasses = async () => {
    const classesData = await getClassesBySchoolId(userData.school_id);
    if (classesData && classesData.classes) {
      setClasses(classesData.classes);
    }
  }

  const getClassId = (className: string) => {
    const classdata = classes.find((val: any) => ('Class ' + val.class_number + ' - ' + val.section + ' (' + val.school_board_name + ')') == className);
    const classId = classdata.class_id ? classdata.class_id : 0;
    return classId;
  }

  const handleClassChange = (value: any) => {
    setSelectedClass(prev => ({
      ...prev,
      className: value,
      class_section_id: value ? getClassId(value) : value
    }));
  };

  const diaryData = async (data: any) => {
    try {
      setIsLoading(true);
      const payload = {
        school_id: userData.school_id,
        teacher_id: userData.user_id,
        date: format(selectedDate.toDate(), 'yyyy-MM-dd'),
        class_section_id: data.class_section_id
      }
      const response = await getTeacherDiariesByAdmin(payload);
      if (response && response.data) {
        setDiaryEntries(response.data);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong with classes list",
          status: "error"
        });
      }
    } catch (error) {
      setIsLoading(false);
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong with classes list",
        status: "error"
      });
    }
  }

  useEffect(() => {
    getClasses();
  }, [])

  useEffect(() => {
    setSelectedEntry(null);
    if (selectedDate && selectedClass && selectedClass.class_section_id) {
      diaryData({ class_section_id: selectedClass.class_section_id });
    }
  }, [selectedDate, selectedClass])


  const saveDiaryData = async () => {
    try {
      const payload = {
        school_id: userData.school_id,
        diary_id: selectedEntry.diary_id
      }
      const response = await markDiaryAsReviewed(payload);
      if (response && response.message) {
        setIsMobileDetailView(!isMobileDetailView);
        setSelectedEntry(null);
        diaryData({ class_section_id: selectedClass.class_section_id });
        showSnackbar({
          title: "Success",
          description: response.message,
          status: "success"
        });
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
                {/* <Button variant="outline" size="sm" className="text-orange-600 border-orange-300">
                  View List
                </Button> */}
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
                    format="DD/MM/YYYY"
                  />
                </LocalizationProvider>
              </div>

              {/* Class Selector */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 w-full md:w-64">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Class:</label>
                <Select value={selectedClass?.className} onValueChange={handleClassChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.class_id} value={'Class ' + cls.class_number + ' - ' + cls.section + ' (' + cls.school_board_name + ')'}>
                        {'Class ' + cls.class_number + ' - ' + cls.section + ' (' + cls.school_board_name + ')'}
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
          {
            filteredEntries && filteredEntries.length > 0 && selectedClass && !isLoading ? (
              <>
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
                              key={entry.diary_id}
                              className={`${selectedEntry?.diary_id === entry.diary_id ? 'bg-blue-50' : ''} cursor-pointer`}
                              onClick={() => handleViewEntry(entry)}
                            >
                              <TableCell className="font-medium text-foreground">{entry.subject_name}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={entry.status === 'submitted' ? 'default' : 'secondary'}
                                  className={entry.status === 'submitted' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-100'}
                                >
                                  {entry.status === 'submitted' ? 'Submitted' : 'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">{entry.teacher_name}</TableCell>
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
                      {/* Administrative Review Section */}
                      <div className="w-full flex items-center justify-center space-y-4 pt-4 border-t border-border ">

                        <Button
                          onClick={handleMarkAsReviewed}
                          disabled={allReviewed}
                          className="w-[50%] bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {allReviewed ? 'Reviewed' : 'Mark as Reviewed'}
                        </Button>
                      </div>
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
                              {selectedClass.className} {selectedEntry.section} - {selectedEntry.subject_name}
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
                              {selectedEntry.notes || <span className="text-muted-foreground">No notes added yet</span>}
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
                              {selectedEntry.homework_assigned || <span className="text-muted-foreground">No homework assigned yet</span>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            ) : (
              <Card className='lg:col-span-12 border-border'>
                <CardContent className="p-8 text-center">
                  {selectedClass && selectedClass.class_section_id && !isLoading &&
                    <>
                      <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold mb-2">No Data Found</h2>
                      {!isSunday(selectedDate.toDate()) && <span className="text-gray-600">No records for <span className='font-bold'>{`${format(selectedDate.toDate(), "EEE, dd MMM yyyy")}. `}</span> Try choosing another date.</span>}
                      {isSunday(selectedDate.toDate()) && <span className="text-gray-600"><span className='font-bold'>{`${format(selectedDate.toDate(), "EEE, dd MMM yyyy")}`}</span> is Holiday. Try choosing another date.</span>}
                    </>
                  }
                  {!selectedClass?.class_section_id &&
                    <>
                      <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold mb-2">Class not Selected.</h2>
                    </>
                  }
                  {isLoading &&
                    <>
                      <Loader2 className="w-10 h-10 mx-auto text-blue animate-spin" />
                    </>
                  }
                </CardContent>
              </Card>
            )
          }
        </div>

        {/* Mobile/Tablet View */}
        <div className="lg:hidden">
          {!isMobileDetailView && filteredEntries && filteredEntries.length > 0 && (
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Subject</h2>
                  <div className="space-y-3">
                    {filteredEntries.map((entry) => (
                      <div
                        key={entry.diary_id}
                        className="p-4 border border-border rounded-lg space-y-3"
                      >
                        <div className="flex flex-wrap items-start justify-between">
                          <div>
                            <div className="font-medium text-foreground">{entry.subject_name}</div>
                            <div className="text-sm text-muted-foreground">{entry.teacher_name}</div>
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
          {isMobileDetailView && filteredEntries && filteredEntries.length > 0 && (
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
                        {selectedClass.className} {selectedEntry.section} - {selectedEntry.subject_name}
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
                        {selectedEntry.notes || <span className="text-muted-foreground">No notes added yet</span>}
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
                        {selectedEntry.homework_assigned || <span className="text-muted-foreground">No homework assigned yet</span>}
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


                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!(filteredEntries && filteredEntries.length > 0 && selectedClass && !isLoading) &&
            <Card className='lg:col-span-12 border-border'>
              <CardContent className="p-8 text-center">
                {selectedClass && selectedClass.class_section_id && !isLoading &&
                  <>
                    <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No Data Found</h2>
                    {!isSunday(selectedDate.toDate()) && <span className="text-gray-600">No records for <span className='font-bold'>{`${format(selectedDate.toDate(), "EEE, dd MMM yyyy")}. `}</span> Try choosing another date.</span>}
                    {isSunday(selectedDate.toDate()) && <span className="text-gray-600"><span className='font-bold'>{`${format(selectedDate.toDate(), "EEE, dd MMM yyyy")}`}</span> is Holiday. Try choosing another date.</span>}
                  </>
                }
                {!selectedClass?.class_section_id &&
                  <>
                    <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Class not Selected.</h2>
                  </>
                }
                {isLoading &&
                  <>
                    <Loader2 className="w-10 h-10 mx-auto text-blue animate-spin" />
                  </>
                }
              </CardContent>
            </Card>
          }
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminTeacherDiaries;
