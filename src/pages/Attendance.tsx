
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Clock, CheckCircle, XCircle, AlertCircle, FileText, Edit, ArrowLeft, MoveLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { format, isSameDay, isAfter, startOfDay, set } from 'date-fns';
import MainLayout from '@/components/Layout/MainLayout';
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { getAttendenceData, submitAttendence, getPastAttendenceData, markAsHoiday, unmarkAsHoiday } from '../services/attendence';
import { getClassesBySchoolId } from '@/services/class';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

interface Student {
  student_id: string;
  student_name: string;
  roll_number: string;
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
  roll_number: string;
  student_name: string;
  morningSession: 'Present' | 'Absent';
  afternoonSession: 'Present' | 'Absent';
  overallStatus: 'Full Day Present' | 'Partial Attendance' | 'Full Day Absent';
}

const Attendance: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>();
  const [classId, setClassId] = useState(null);
  const [activeSession, setActiveSession] = useState<'morning' | 'afternoon'>('morning');
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [viewMode, setViewMode] = useState<'attendance' | 'reports'>('attendance');
  const [editingSession, setEditingSession] = useState<'morning' | 'afternoon' | null>(null);
  const [isMorningSessionSubmitted, setIsMorningSessionSubmitted] = useState(false);
  const [isAfternoonSessionSubmitted, setIsAfternoonSessionSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(''); // 'morning' | 'afternoon' | ''
  const [dateStat, setDateStat] = useState(false);
  const [allowTakeAttendence, setAllowTakeAttendence] = useState(false);
  const [loader, setLoader] = useState(false);
  const [newAttendenceCheck, setNewAttendenceCheck] = useState({
    isActive: false,
    morning: false,
    afternoon: false,
    back: true
  });
  const [isHoliday, setIsHoliday] = useState(false);
  const [formData, setFormData] = useState({
    class: '',
    class_section_id: '',
    school_id: null,
    date: null,
    session: 'F',
    sessionData: 'Full Day'
  });
  const [isMorningHoliday, setIsMorningHoliday] = useState(false);
  const [isAfternoonHoliday, setIsAfternoonHoliday] = useState(false);


  // Sample data - in real app this would come from API
  const sampleStudents: Student[] = [
    { student_id: '1', student_name: 'Aarav Sharma', roll_number: '001', morningPresent: false, afternoonPresent: false },
    { student_id: '2', student_name: 'Priya Patel', roll_number: '002', morningPresent: false, afternoonPresent: false },
    { student_id: '3', student_name: 'Rohit Kumar', roll_number: '003', morningPresent: false, afternoonPresent: false },
    { student_id: '4', student_name: 'Sneha Reddy', roll_number: '004', morningPresent: false, afternoonPresent: false },
    { student_id: '5', student_name: 'Arjun Singh', roll_number: '005', morningPresent: false, afternoonPresent: false },
    { student_id: '6', student_name: 'Kavya Iyer', roll_number: '006', morningPresent: false, afternoonPresent: false },
    { student_id: '7', student_name: 'Vikram Joshi', roll_number: '007', morningPresent: false, afternoonPresent: false },
    { student_id: '8', student_name: 'Ananya Gupta', roll_number: '008', morningPresent: false, afternoonPresent: false },
  ];

  // Sample attendance records for past dates
  const [sampleAttendanceRecords, setSampleAttendanceRecords]: any = useState([]);

  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState(null);
  const [morningStats, setMorningStats] = useState(null);
  const [afternoonStats, setAfternoonStats] = useState(null);


  //classes list api
  const getClasses = async () => {
    try {
      const classesData = await getClassesBySchoolId(userData.school_id);
      if (classesData && classesData.classes) {
        setClasses(classesData.classes);
        // if (!classId) {
        //   setSelectedClass(classes[0] ? ('Class ' + classes[0].class_number + ' - ' + classes[0].section) : '');
        // }
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong with classes list",
        status: "error"
      });
    }
  }

  const [students, setStudents] = useState<any>([]);

  const isToday = isSameDay(startOfDay(selectedDate), startOfDay(new Date()));
  const isPastDate = !isToday && !isAfter(startOfDay(selectedDate), startOfDay(new Date()));
  const isFutureDate = isAfter(startOfDay(selectedDate), startOfDay(new Date()));

  const getClassId = (className: string) => {
    const classdata = classes.find((val: any) => ('Class ' + val.class_number + ' - ' + val.section) == className);
    const classId = classdata.class_id ? classdata.class_id : 0;
    return classId;
  }

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    setClassId(getClassId(value));
  };


  const getAttendenceList = async (sessionData = '') => {
    try {
      const currentClassId = classId || (classes[0] ? getClassId('Class ' + classes[0].class_id + ' - ' + classes[0].section) : '');
      const session = sessionData.length > 0 ? sessionData : activeSession === 'morning' ? 'M' : 'A';
      const date = format(selectedDate, 'yyyy-MM-dd');

      const requestData = {
        class_section_id: currentClassId,
        session: session,
        date: date,
        school_id: userData?.school_id
      };
      if (currentClassId) {
        const response = await getAttendenceData(requestData);
        //console.log('Fetched Attendance Data:', response);
        if (response && response.data && response.data.attendance_data) {
          if (session == 'M') {
            setIsMorningHoliday(response.data.is_holiday);
          } else {
            setIsAfternoonHoliday(response.data.is_holiday);
          }
          // Transform API data to match Student interface if necessary
          const fetchedStudents = response.data.attendance_data.map((student: any) => ({
            ...student,
            morningPresent: response.data?.session == 'M' || session == 'M' ? student.is_present : student?.morning_present || false,
            afternoonPresent: response.data?.session == 'A' || session == 'A' ? student.is_present : student?.afternoon_present || false
          }));
          // setStudents(fetchedStudents);
          setStudents(fetchedStudents);
          if (sessionData == '') {
            if (response.data?.session == 'M' || session == 'M') {
              setIsMorningSessionSubmitted(response.data?.attendance_taken || false);
            } else {
              setIsAfternoonSessionSubmitted(response.data?.attendance_taken || false);
            }
          }
        } else {
          //setStudents(sampleStudents);
          showSnackbar({
            title: "⛔ Error",
            description: "Something went wrong",
            status: "error"
          });
        }
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }

  const getPastAttendenceDataList = async () => {
    try {
      const currentClassId = classId || (classes[0] ? getClassId('Class ' + classes[0].class_id + ' - ' + classes[0].section) : '');
      const date = format(selectedDate, 'yyyy-MM-dd');

      const requestData = {
        class_section_id: currentClassId,
        date: date,
        school_id: userData?.school_id
      };
      if (currentClassId) {
        const response = await getPastAttendenceData(requestData);
        // console.log('Fetched Past Attendance Data:', response);
        if (response && response.data && response.data.attendance_data) {
          setSampleAttendanceRecords(response.data.attendance_data);
          setIsMorningHoliday(response.data.morning_holiday);
          setIsAfternoonHoliday(response.data.afternoon_holiday);
        } else {
          showSnackbar({
            title: "⛔ Error",
            description: "Something went wrong",
            status: "error"
          });
        }
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }

  const submitAttendanceData = async () => {
    try {
      const currentClassId = classId || (classes[0] ? getClassId('Class ' + classes[0].class_id + ' - ' + classes[0].section) : '');
      const session = activeSession === 'morning' ? 'M' : 'A';
      const date = format(selectedDate, 'yyyy-MM-dd');

      const attendancePayload = students.map(student => ({
        student_id: student.student_id,
        student_name: student.student_name,
        is_present: activeSession === 'morning' ? (student.morningPresent ?? false) : (student.afternoonPresent) ?? false
      }));

      const requestData = {
        class_section_id: currentClassId,
        session: session,
        date: date,
        school_id: userData?.school_id,
        attendance_data: attendancePayload
      };

      const response = await submitAttendence(requestData);
      // console.log('Submit Attendance Response:', response);
      if (response && response.message) {
        showSnackbar({
          title: "Success",
          description: `${response.message}`,
          status: "success"
        });
        setEditingSession(null);
        getAttendenceList();
        if (isPastDate) {
          getPastAttendenceDataList();
        }
      } else {
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong while submitting attendance",
          status: "error"
        });
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }

  const markAttendenceAsHoiday = async (check = '') => {
    try {
      const currentClassId = classId || (classes[0] ? getClassId('Class ' + classes[0].class_id + ' - ' + classes[0].section) : '');
      const date = format(selectedDate, 'yyyy-MM-dd');

      const requestData = {
        class_section_id: currentClassId,
        date: date,
        school_id: userData?.school_id,
        session: formData.session
      };
      let response: any;
      if (check == 'remove') {
        response = await unmarkAsHoiday(requestData);
      } else {
        response = await markAsHoiday(requestData);
      }
      console.log('Holday is marked Attendance Response:', response);
      if (response && response.message) {
        showSnackbar({
          title: "Success",
          description: `${response.message}`,
          status: "success"
        });
        setEditingSession(null);
        getAttendenceList();
        if (isPastDate) {
          getPastAttendenceDataList();
        }
      } else {
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong while submitting attendance",
          status: "error"
        });
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }

  useEffect(() => {
    getClasses();
    setDateStat(isSameDay(selectedDate, startOfDay(new Date())));
    setAllowTakeAttendence(true);
  }, []);


  useEffect(() => {
    if (!isPastDate || editingSession) {
      getAttendenceList();
      setAllowTakeAttendence(true);
    } else {
      getPastAttendenceDataList();
      setIsMorningSessionSubmitted(false);
      setIsAfternoonSessionSubmitted(false);
    }

    if (isPastDate && !editingSession) {
      setViewMode('reports');
    } else {
      setViewMode('attendance');
    }
  }, [selectedDate, selectedClass, activeSession, attendanceData, editingSession]);

  useEffect(() => {
    setIsMorningHoliday(false);
    setIsAfternoonHoliday(false);
    const date = new Date(selectedDate);
    if (date.getDay() === 0) {
      setIsHoliday(true);
      return;
    } else {
      setIsHoliday(false);
    }

    if (isPastDate) {
      setAllowTakeAttendence(false);
    }
  }, [selectedDate])

  useEffect(() => {
    setMorningStats(getReportStats('morning'));
    setAfternoonStats(getReportStats('afternoon'));
  }, [sampleAttendanceRecords])

  useEffect(() => {
    setStats(getAttendanceStats());
  }, [students])

  const getAttendanceStats = () => {
    const totalStudents = students?.length;
    const presentStudents = students?.filter(s =>
      activeSession === 'morning' ? s.morningPresent : s.afternoonPresent
    ).length;
    const absentStudents = totalStudents - presentStudents;
    const remainingStudents = totalStudents - (presentStudents + absentStudents);

    return { totalStudents, presentStudents, absentStudents, remainingStudents };
  };

  const getReportStats = (session: 'morning' | 'afternoon') => {
    const sessionKey = session === 'morning' ? 'morningSession' : 'afternoonSession';
    const data = [...sampleAttendanceRecords];
    const present = data?.filter(record => record[session] == true).length;
    const absent = data?.filter(record => record[session] == false).length;
    return { present, absent };
  };

  const toggleAttendance = (studentId: string, isPresent: boolean) => {
    setStudents(prev => prev.map(student => {
      if (student.student_id === studentId) {
        return {
          ...student,
          [activeSession == 'morning' ? 'morningPresent' : 'afternoonPresent']: isPresent
        };
      }
      return student;
    }));
  };

  const submitAttendance = () => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    submitAttendanceData();
    setEditingSession(null);
  };

  const handleEditAttendance = (session: 'morning' | 'afternoon') => {
    setNewAttendenceCheck((prev) => ({
      ...prev,
      back: true
    }))
    setIsMorningSessionSubmitted(false);
    setIsAfternoonSessionSubmitted(false);
    setEditingSession(session);
    setActiveSession(session);
    getAttendenceList(session == 'morning' ? 'M' : 'A');
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
    // const dateKey = format(selectedDate, 'yyyy-MM-dd');
    // return attendanceData[dateKey]?.[selectedClass]?.[`${session}Submitted`] || false;
    if (session === 'morning') {
      return isMorningSessionSubmitted;
    } else {
      return isAfternoonSessionSubmitted;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Present</Badge>;
      case 'Absent':
        return <Badge variant="destructive">Absent</Badge>;
      // case 'Holiday':
      //   return <Badge variant="destructive">Holiday</Badge>;
      case 'Full Day Present':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Full Day Present</Badge>;
      case 'Partial Attendance':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Partial Attendance</Badge>;
      case 'Full Day Absent':
        return <Badge variant="destructive">Full Day Absent</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{status}</Badge>;
    }
  };

  const getOverallStatus = (morning, afternoon) => {
    // getStatusBadge((record.morning && record.afternoon) ? 'Full Day Present' : ((record.morning || record.afternoon)) ? 'Partial Attendance' : 'Full Day Absent')
    const morningCheck = (morning || isMorningHoliday);
    const afternoonCheck = (afternoon || isAfternoonHoliday);
    if (morningCheck && afternoonCheck) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Full Day Present</Badge>;
    } else if (morningCheck || afternoonCheck) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Partial Attendance</Badge>;
    } else {
      return <Badge variant="destructive">Full Day Absent</Badge>;
    }
  }

  const backToData = async () => {
    setEditingSession(null);
    setViewMode('attendance');
  }

  const setNewAttendence = () => {
    setAllowTakeAttendence(true);
    getAttendenceList();
    setNewAttendenceCheck(
      (prev) => ({
        ...prev,
        back: false,
        isActive: true
      })
    )
  }

  const handleSessionChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      sessionData: value,
      session: value == 'Full Day' ? 'F' : value == 'Morning Session' ? 'M' : 'A'
    }))
  }


  return (
    <MainLayout pageTitle={`Attendance Center`}>
      <div className="container mx-auto p-6 space-y-6">
        {/* <div className="flex justify-between items-center">
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
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Calendar and Class Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-6 mt-2" />
                  <p className="text-lg mt-2">
                    Date : <span className='text-gray-600'>{selectedDate ? format(selectedDate, "EEEE, dd MMM yyyy") : "No date selected"}</span>
                  </p>
                </CardTitle>
              </CardHeader>
              <CardContent className='w-full '>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="w-full h-full rounded-md border overflow-auto flex items-center justify-center"
                  disabled={(date) => isAfter(date, startOfDay(new Date()))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select Class</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedClass} onValueChange={handleClassChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.class_id} value={'Class ' + cls.class_number + ' - ' + cls.section}>
                        {'Class ' + cls.class_number + ' - ' + cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Dynamic Content */}
          <div className="lg:col-span-2 space-y-6">
            {viewMode === 'reports' && selectedClass &&
              !editingSession && (sampleAttendanceRecords.length > 0) && !isHoliday ? (
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
                          <div className="text-3xl font-bold text-green-600">{morningStats?.present || 0}</div>
                          <div className="text-sm text-gray-600">Present</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600">{morningStats?.absent || 0}</div>
                          <div className="text-sm text-gray-600">Absent</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <CardTitle className="text-lg">Afternoon Session</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleEditAttendance('afternoon');
                        }}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">{afternoonStats?.present || 0}</div>
                          <div className="text-sm text-gray-600">Present</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600">{afternoonStats?.absent || 0}</div>
                          <div className="text-sm text-gray-600">Absent</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Attendance Report */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-md md:text-lg'>
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
                          {sampleAttendanceRecords && sampleAttendanceRecords?.map((record) => (
                            <TableRow key={record.roll_number}>
                              <TableCell className="font-medium">{record.roll_number}</TableCell>
                              <TableCell>{record.student_name}</TableCell>
                              <TableCell>{getStatusBadge(record.morning ? 'Present' : isMorningHoliday ? 'Holiday' : 'Absent')}</TableCell>
                              <TableCell>{getStatusBadge(record.afternoon ? 'Present' : isAfternoonHoliday ? 'Holiday' : 'Absent')}</TableCell>
                              <TableCell>{getOverallStatus(record.morning, record.afternoon)}</TableCell>
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
                {!isFutureDate && selectedClass && (!isPastDate || allowTakeAttendence || editingSession || !(isMorningHoliday && isAfternoonHoliday) && !(sampleAttendanceRecords.length == 0 && selectedClass && isPastDate)) && !isHoliday && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{stats?.totalStudents}</p>
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
                            <p className="text-2xl font-bold text-green-600">{stats?.presentStudents}</p>
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
                            <p className="text-2xl font-bold text-red-600">{stats?.absentStudents}</p>
                            <p className="text-sm text-gray-600">Marked Absent</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                          <div>
                            <p className="text-2xl font-bold text-orange-600">{stats.remainingStudents}</p>
                            <p className="text-sm text-gray-600">Remaining</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card> */}
                  </div>
                )}

                {/* Student Attendance List */}
                {!isFutureDate && selectedClass && (!isPastDate || allowTakeAttendence || editingSession || isMorningHoliday || isAfternoonHoliday) && !isHoliday && (
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row  justify-between items-center gap-3">
                        {
                          isPastDate && newAttendenceCheck.back && !(isMorningHoliday && isAfternoonHoliday) && (
                            <>
                              <Button
                                onClick={backToData}
                                className="bg-blue-600 hover:bg-blue-700 px-2"
                              >
                                <MoveLeft />
                                {'back'}
                              </Button>
                            </>
                          )
                        }
                        {/* - {activeSession === 'morning' ? 'Morning Session' : 'Afternoon Session'} */}
                        <CardTitle className='text-md my-4 md:my-0 md:text-lg'>
                          Student Attendance - {activeSession === 'morning' ? 'Morning Session' : 'Afternoon Session'}
                        </CardTitle>

                        <div className='flex flex-col lg:flex-row gap-3'>
                          {/* <Button
                            onClick={() => {
                              setIsEditing('');
                              markAttendenceAsHoiday();
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {'Mark as Holiday'}
                          </Button> */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="flex items-center gap-2 bg-orange-400 text-white px-2 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                                {/* <KeyRound className="w-4 h-4" /> */}
                                {
                                  (activeSession == 'morning' ? !isMorningHoliday : !isAfternoonHoliday) && (
                                    'Mark As Holiday'
                                  )
                                }
                                {
                                  (activeSession == 'morning' ? isMorningHoliday : isAfternoonHoliday) && (
                                    'Mark as Working Day'
                                  )
                                }
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                {
                                  (activeSession == 'morning' ? !isMorningHoliday : !isAfternoonHoliday) && (
                                    <AlertDialogTitle>Mark As Holiday</AlertDialogTitle>
                                  )
                                }
                                {
                                  (activeSession == 'morning' ? isMorningHoliday : isAfternoonHoliday) && (
                                    <AlertDialogTitle>Mark as Working Day</AlertDialogTitle>
                                  )
                                }
                                <AlertDialogDescription>

                                  <form className="space-y-6">

                                    {/* Date Field */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date
                                      </label>
                                      <input className='w-full py-2 px-2' type="text" value={format(selectedDate, 'dd-MM-yyyy')} disabled />
                                      {/* {errors.class && <p className="text-red-500 text-xs mt-1">{errors.class}</p>} */}
                                    </div>

                                    {/* Class Name Field */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Class
                                      </label>
                                      <input className='w-full py-2 px-2' type="text" value={selectedClass} disabled />
                                      {/* {errors.class && <p className="text-red-500 text-xs mt-1">{errors.class}</p>} */}
                                    </div>

                                    {/* Session Field */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Session
                                      </label>
                                      <Select value={formData.sessionData} onValueChange={handleSessionChange}>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select a Session" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {['Full Day', 'Morning Session', 'Afternoon Session'].map((val, index) => (
                                            <SelectItem key={index} value={val}>
                                              {val}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      {/* {errors.board && <p className="text-red-500 text-xs mt-1">{errors.board}</p>} */}
                                    </div>
                                  </form>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className='flex content-center'>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {
                                  setIsEditing('');
                                  const check = (activeSession == 'morning' ? !isMorningHoliday : !isAfternoonHoliday) ? 'Mark' : 'remove';
                                  markAttendenceAsHoiday(check);
                                }}>
                                  {
                                    (activeSession == 'morning' ? !isMorningHoliday : !isAfternoonHoliday) && (
                                      'Mark As Holiday'
                                    )
                                  }
                                  {
                                    (activeSession == 'morning' ? isMorningHoliday : isAfternoonHoliday) && (
                                      'Mark as Working Day'
                                    )
                                  }
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          {
                            !isSessionSubmitted(activeSession) && !isPastDate && !(activeSession == 'morning' ? isMorningHoliday : isAfternoonHoliday) && (
                              <Button
                                onClick={submitAttendance}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {'Submit Attendance'}
                              </Button>
                            )
                          }
                          {
                            isSessionSubmitted(activeSession) && isEditing != activeSession && !isPastDate && !(activeSession == 'morning' ? isMorningHoliday : isAfternoonHoliday) && (

                              <Button
                                onClick={() => setIsEditing(activeSession)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {'Edit Attendance'}
                              </Button>

                            )
                          }
                          {
                            ((isSessionSubmitted(activeSession) && isEditing == activeSession) || isPastDate) && !(activeSession == 'morning' ? isMorningHoliday : isAfternoonHoliday) && (
                              <Button
                                onClick={() => {
                                  setIsEditing('');
                                  submitAttendance();
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {'Save Attendance'}
                              </Button>
                            )
                          }
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={activeSession} onValueChange={(value) => setActiveSession(value as 'morning' | 'afternoon')}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="morning" className="relative">
                            {window.innerWidth >= 768 ? 'Morning Session' : 'Morning'}
                            {isSessionSubmitted('morning') && (
                              <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
                            )}
                          </TabsTrigger>
                          <TabsTrigger value="afternoon" className="relative">
                            {window.innerWidth >= 768 ? 'Afternoon Session' : 'Afternoon'}

                            {isSessionSubmitted('afternoon') && (
                              <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
                            )}
                          </TabsTrigger>
                        </TabsList>


                        <TabsContent value="morning" className="mt-6 max-h-[27rem] overflow-auto md:px-2">
                          <div className="space-y-4">
                            {!isMorningHoliday && students && students?.map((student) => (
                              <div key={student.student_id} className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-lg bg-gray-50">
                                <div className="flex items-center gap-4 mb-4 md:mb-0">
                                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold">
                                    {student.student_name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                    <p className="font-medium">{student.student_name}</p>
                                    <p className="text-sm text-gray-600">Roll No. {student.roll_number}</p>
                                  </div>
                                </div>
                                {
                                  (!isSessionSubmitted(activeSession) || isEditing == activeSession || isPastDate) ? (
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant={student.morningPresent ? "default" : "outline"}
                                        onClick={() => toggleAttendance(student.student_id, true)}
                                        className={student.morningPresent ? "bg-green-600 hover:bg-green-700" : ""}
                                      >
                                        Present
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={!student.morningPresent ? "destructive" : "outline"}
                                        onClick={() => toggleAttendance(student.student_id, false)}
                                      >
                                        Absent
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      {
                                        getStatusBadge(student.morningPresent ? 'Present' : 'Absent')
                                      }
                                    </>
                                  )
                                }
                              </div>
                            ))}

                            {
                              isMorningHoliday && (
                                <div className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-lg bg-gray-50">
                                  <div className="flex items-center justify-center w-full gap-4 mb-4 md:mb-0">
                                    Marked as Holiday.
                                    {/* <div>
                                    <p className="font-medium">{student.student_name}</p>
                                    <p className="text-sm text-gray-600">Roll No. {student.roll_number}</p>
                                  </div> */}
                                  </div>
                                </div>
                              )
                            }
                          </div>
                        </TabsContent>

                        <TabsContent value="afternoon" className="mt-6 max-h-[27rem] overflow-auto md:px-2">
                          <div className="space-y-4">
                            {!isAfternoonHoliday && students && students?.map((student) => (
                              <div key={student.student_id} className="flex flex-col md:flex-row  items-center justify-between p-4 border rounded-lg bg-gray-50">
                                <div className="flex items-center gap-4 mb-4 md:mb-0">
                                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold">
                                    {student.student_name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                    <p className="font-medium">{student.student_name}</p>
                                    <p className="text-sm text-gray-600">Roll No. {student.roll_number}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {
                                    (!isSessionSubmitted(activeSession) || isEditing == activeSession || isPastDate) ? (
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant={student.afternoonPresent ? "default" : "outline"}
                                          onClick={() => toggleAttendance(student.student_id, true)}
                                          className={student.afternoonPresent ? "bg-green-600 hover:bg-green-700" : ""}
                                        >
                                          Present
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant={!student.afternoonPresent ? "destructive" : "outline"}
                                          onClick={() => toggleAttendance(student.student_id, false)}
                                        >
                                          Absent
                                        </Button>
                                      </div>
                                    ) : (
                                      <>
                                        {
                                          getStatusBadge(student.afternoonPresent ? 'Present' : 'Absent')
                                        }
                                      </>
                                    )
                                  }
                                </div>
                              </div>
                            ))}

                            {
                              isAfternoonHoliday && (
                                <div className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-lg bg-gray-50">
                                  <div className="flex items-center justify-center w-full gap-4 mb-4 md:mb-0">
                                    Marked as Holiday.
                                    {/* <div>
                                    <p className="font-medium">{student.student_name}</p>
                                    <p className="text-sm text-gray-600">Roll No. {student.roll_number}</p>
                                  </div> */}
                                  </div>
                                </div>
                              )
                            }
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}

                {(isFutureDate || !selectedClass || (sampleAttendanceRecords.length == 0 && isPastDate && !allowTakeAttendence && (!isMorningHoliday && !isAfternoonHoliday)) || isHoliday) && (
                  <Card className='py-[13rem]'>
                    <CardContent className="p-8 text-center">
                      <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                      {
                        isFutureDate && (
                          <>
                            <h2 className="text-2xl font-bold mb-2">Future Date Selected</h2>
                            <p className="text-gray-600">Attendance can only be marked for today or past dates.</p>
                          </>
                        )
                      }
                      {
                        !selectedClass && (
                          <>
                            <h2 className="text-2xl font-bold mb-2">No Class Selected</h2>
                            <p className="text-gray-600">Select the class to view the attendance data.</p>
                          </>
                        )
                      }
                      {
                        sampleAttendanceRecords.length == 0 && selectedClass && isPastDate && !allowTakeAttendence && !isHoliday && (
                          <>
                            <h2 className="text-2xl font-bold mb-2">No Attendence Found</h2>
                            {/* <p className="text-gray-600">Try changing date to view the attendance data.</p> */}
                            <Button
                              onClick={setNewAttendence}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {'Update Attendance'}
                            </Button>
                          </>
                        )
                      }
                      {
                        isHoliday && (
                          <>
                            <h3 className="text-2xl font-bold mb-2">No Attendence Found</h3>
                            <p className="text-gray-500 mb-2">{format(selectedDate, 'dd-MM-yyyy')}(Sunday) is marked as Holiday.</p>
                            {/* <Button
                              onClick={setNewAttendence}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {'Update Attendance'}
                            </Button> */}
                          </>
                        )
                      }
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
