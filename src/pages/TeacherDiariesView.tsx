import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Eye, X } from "lucide-react";
import MainLayout from "@/components/Layout/MainLayout";
import { getDiariesForStudent } from '@/services/diaries';
import { useSnackbar } from "@/components/snackbar/SnackbarContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";


interface DiaryEntry {
    id: string;
    subject: string;
    teacherName: string;
    teacherNotes: string;
    assignedWork: string;
}

export function TeacherDiariesView() {
    const [calendarOpen, setCalendarOpen] = useState(false);
    // Local date formatting function for display
    const { showSnackbar } = useSnackbar();
    const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
    const navigate = useNavigate();
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    const [date, setDate] = useState<Date>(new Date());
        const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
    const [isMobileDetailView, setIsMobileDetailView] = useState(false);
    // TODO: Replace with API data
    const [diaryData, setDiaryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);


    const getDiaryData = async () => {
        setLoading(true);
        try {
            const payload = {
                school_id: userData.school_id,
                teacher_id: userData.user_id,
                date: format(date, 'yyyy-MM-dd')
            }
            const response = await getDiariesForStudent(payload);
            if (response && response.data) {
                setDiaryData(response.data);
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
        setLoading(false);
    }

    useEffect(() => {
        getDiaryData();
    }, [date]);


    return (
        <MainLayout pageTitle={"Teacher Diaries"}>
            {loading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <Loader2 className="w-10 h-10 mx-auto text-blue-600 animate-spin" />
                </div>
            ) : (
            <div className="space-y-6">
                {/* Date Selector */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-gray-900 mb-1">Select Date</h3>
                            <p className="text-sm text-gray-500">View teacher diaries for a specific date</p>
                        </div>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-[280px] justify-start text-left border-gray-300 hover:border-[#2E5DD1] hover:bg-blue-50/50 transition-colors"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-[#2E5DD1]" />
                                    {date ? formatDate(date) : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(newDate) => {
                                        if (newDate) {
                                            setDate(newDate);
                                            setCalendarOpen(false);
                                        }
                                    }}
                                    initialFocus
                                    disabled={(day) => day > new Date()}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                {/* Desktop View: Table and Side Panel */}
                <div className="hidden lg:grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Diaries Table */}
                    <div className={`${selectedEntry ? 'lg:col-span-5' : 'lg:col-span-12'} transition-all duration-300`}>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#2E5DD1]/5 to-transparent">
                                <h3 className="text-gray-900">
                                    Diary Entries for {formatDate(date)}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                 {diaryData.length} {diaryData.length === 1 ? 'entry' : 'entries'} recorded
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                            <TableHead className="text-gray-700">Subject</TableHead>
                                            <TableHead className="text-gray-700">Teacher Name</TableHead>
                                            <TableHead className="text-gray-700 text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {diaryData.length > 0 ? (
                                            diaryData.map((entry) => (
                                                <TableRow
                                                    key={entry.diary_id}
                                                    className={`transition-colors ${selectedEntry?.id === entry.id
                                                        ? 'bg-blue-50/50'
                                                        : 'hover:bg-blue-50/30'
                                                        }`}
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-[#2E5DD1]"></div>
                                                            <span className="text-gray-900">{entry.subject_name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-700">{entry.teacher_name}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSelectedEntry(entry)}
                                                            className="text-[#2E5DD1] hover:text-[#2E5DD1] hover:bg-blue-50"
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                                                    No diary entries found for this date
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                    {/* Side Panel - Details View */}
                    {selectedEntry && (
                        <div className="lg:col-span-7">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-6">
                                {/* Header */}
                                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#2E5DD1]/5 to-transparent">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-gray-900 mb-1">{selectedEntry.subject_name}</h3>
                                            <p className="text-sm text-gray-500">{selectedEntry.teacher_name}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedEntry(null)}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                {/* Content */}
                                <div className="p-6 space-y-6">
                                    {/* Class Notes Section */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1 h-5 bg-[#2E5DD1] rounded-full"></div>
                                            <h4 className="text-gray-900">Class Notes</h4>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-gray-700 text-sm leading-relaxed">
                                                {selectedEntry.notes || '—'}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Homework Assignment Section */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1 h-5 bg-[#2E5DD1] rounded-full"></div>
                                            <h4 className="text-gray-900">Homework Assignment</h4>
                                        </div>
                                        <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                                            <p className="text-gray-700 text-sm leading-relaxed">
                                                {selectedEntry.homework_assigned || '—'}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Date Info */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-500">
                                            Date: {formatDate(date)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Mobile/Tablet View: Only Table or Only Detail Panel */}
                <div className="lg:hidden">
                    {/* Table View */}
                    {!selectedEntry && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#2E5DD1]/5 to-transparent">
                                <h3 className="text-gray-900">
                                    Diary Entries for {formatDate(date)}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                {diaryData.length} {diaryData.length === 1 ? 'entry' : 'entries'} recorded
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                            <TableHead className="text-gray-700">Subject</TableHead>
                                            <TableHead className="text-gray-700">Teacher Name</TableHead>
                                            <TableHead className="text-gray-700 text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {diaryData.length > 0 ? (
                                            diaryData.map((entry) => (
                                                <TableRow
                                                    key={entry.diary_id}
                                                    className="transition-colors hover:bg-blue-50/30"
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-[#2E5DD1]"></div>
                                                            <span className="text-gray-900">{entry.subject_name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-700">{entry.teacher_name}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => { setSelectedEntry(entry); setIsMobileDetailView(true); }}
                                                            className="text-[#2E5DD1] hover:text-[#2E5DD1] hover:bg-blue-50"
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                                                    No diary entries found for this date
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                    {/* Detail Panel View */}
                    {selectedEntry && isMobileDetailView && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                            {/* Header with Back Button */}
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#2E5DD1]/5 to-transparent flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setSelectedEntry(null); setIsMobileDetailView(false); }}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                                <div>
                                    <h3 className="text-gray-900 mb-1">{selectedEntry.subject}</h3>
                                    <p className="text-sm text-gray-500">{selectedEntry.teacherName}</p>
                                        <h3 className="text-gray-900 mb-1">{selectedEntry.subject_name}</h3>
                                        <p className="text-sm text-gray-500">{selectedEntry.teacher_name}</p>
                                </div>
                            </div>
                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Class Notes Section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1 h-5 bg-[#2E5DD1] rounded-full"></div>
                                        <h4 className="text-gray-900">Class Notes</h4>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {selectedEntry.notes || '—'}
                                        </p>
                                    </div>
                                </div>
                                {/* Homework Assignment Section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1 h-5 bg-[#2E5DD1] rounded-full"></div>
                                        <h4 className="text-gray-900">Homework Assignment</h4>
                                    </div>
                                    <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {selectedEntry.homework_assigned || '—'}
                                        </p>
                                    </div>
                                </div>
                                {/* Date Info */}
                                <div className="pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">
                                        Date: {formatDate(date)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Info Card */}
                <div className="bg-blue-50/50 rounded-lg border border-blue-100 p-4">
                    <div className="flex gap-3">
                        <div className="w-1 bg-[#2E5DD1] rounded-full flex-shrink-0"></div>
                        <div>
                            <p className="text-sm text-gray-600">
                                Teacher diaries help you stay updated with classroom activities, important notes, and homework assignments.
                                Make sure to check regularly and complete all assigned work on time.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </MainLayout>
    );
}

