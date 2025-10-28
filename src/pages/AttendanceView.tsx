import { useEffect, useState } from "react";
import { ChevronDown, Download, Loader2 } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import React from "react";
import { getAttendanceByStudent } from "@/services/attendence";
import { useSnackbar } from "../components/snackbar/SnackbarContext";

interface AttendanceRecord {
    date: string;
    day: string;
    morningSession: "Present" | "Absent" | "Late";
    afternoonSession: "Present" | "Absent" | "Late";
    overallStatus: "Full Day" | "Half Day" | "Absent";
    morningRemarks?: string;
    afternoonRemarks?: string;
}

export function AttendanceView() {
    // Download Excel report for current month
    const downloadExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Attendance");

        // Header row
        const headerRow = [
            "Date",
            "Day",
            "Morning",
            "Afternoon",
            "Overall",
            "Morning Remarks",
            "Afternoon Remarks"
        ];
        const header = worksheet.addRow(headerRow);
        // Style header
        header.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "4472C4" }, // Blue shade
            };
            cell.font = {
                color: { argb: "FFFFFF" }, // White text
                bold: true,
            };
            cell.alignment = { horizontal: "center", vertical: "middle" };
        });

        // Attendance Rows
        parsedAttendanceData.forEach((record) => {
            let morningStatus = record.morningSession;
            let afternoonStatus = record.afternoonSession;
            let overall = record.overallStatus === "Full Day" ? "Present" : record.overallStatus === "Half Day" ? "Partial" : "Absent";
            const row = worksheet.addRow([
                `${selectedMonth} ${record.date}`,
                record.day,
                morningStatus,
                afternoonStatus,
                overall,
                record.morningRemarks,
                record.afternoonRemarks
            ]);
            // Apply colors to Morning, Afternoon, and Overall columns
            [3, 4, 5].forEach((colIndex) => {
                const cell = row.getCell(colIndex);
                if (cell.value === "Present") {
                    cell.font = { color: { argb: "008000" }, bold: true }; // Green
                } else if (cell.value === "Absent") {
                    cell.font = { color: { argb: "FF0000" }, bold: true }; // Red
                } else if (cell.value === "Partial") {
                    cell.font = { color: { argb: "FFA500" }, bold: true }; // Orange/Yellow
                }
            });
        });

        // Adjust column widths
        worksheet.columns = [
            { width: 15 },
            { width: 10 },
            { width: 12 },
            { width: 12 },
            { width: 15 },
            { width: 20 },
            { width: 20 },
        ];

        // Generate and download file
        const buffer = await workbook.xlsx.writeBuffer();
        const fileName = `Attendance_${selectedMonth}_${selectedYear}.xlsx`;
        saveAs(new Blob([buffer]), fileName);
    };
    const [loading, setLoading] = useState(false);
    const { showSnackbar } = useSnackbar();
    // Generate years and months
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const years = Array.from({ length: 3 }, (_, i) => String(currentYear - i));
    const monthsList = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(2000, i, 1);
        return date.toLocaleString('default', { month: 'long' });
    });
    const [selectedYear, setSelectedYear] = useState(String(currentYear));
    const [selectedMonth, setSelectedMonth] = useState(monthsList[currentMonth]);

    const userData = JSON.parse(localStorage.getItem("vigniq_current_user") || '{}');
    const [attendanceRecords, setAttendanceRecords] = useState<any>(null);

    // Helper to parse attendanceRecords.attendance_data into array for table
    const parsedAttendanceData = attendanceRecords?.attendance_data
        ? Object.entries(attendanceRecords.attendance_data).map(([date, data]: [string, any]) => {
            const d = new Date(date);
            const day = d.toLocaleString('default', { weekday: 'short' });
            let overallStatus: "Full Day" | "Half Day" | "Absent" = "Absent";
            if (data.morning_session && data.afternoon_session) overallStatus = "Full Day";
            else if (data.morning_session || data.afternoon_session) overallStatus = "Half Day";
            return {
                date: d.getDate().toString().padStart(2, '0'),
                day,
                morningSession: data.morning_session ? "Present" : "Absent",
                afternoonSession: data.afternoon_session ? "Present" : "Absent",
                overallStatus,
                morningRemarks: data.morning_remarks,
                afternoonRemarks: data.afternoon_remarks,
            };
        })
        : [];

    // Calculate attendance percentages from API data
    const totalDays = attendanceRecords?.total_days ?? 0;
    const currentMonthPercentage = attendanceRecords?.attendance_percentage ?? 0;
    const fullDays = parsedAttendanceData.filter((d) => d.overallStatus === "Full Day").length;
    const halfDays = parsedAttendanceData.filter((d) => d.overallStatus === "Half Day").length;
    const overallPercentage = attendanceRecords?.attendance_percentage ?? 0;

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "Present":
                return "bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm";
            case "Absent":
                return "bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm";
            case "Late":
                return "bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm";
            case "Full Day":
                return "bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm";
            case "Half Day":
                return "bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm";
            default:
                return "bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm";
        }
    };

    // ...existing code...


    const AttendenceList = async () => {
        setLoading(true);
        // Convert month name to number (1-12)
        const monthNumber = monthsList.findIndex(m => m === selectedMonth) + 1;
        const payload = {
            student_id: userData.user_id,
            class_id: userData.class_id,
            section: userData.section,
            month: monthNumber,
            year: selectedYear,
        }
        try {
            const response = await getAttendanceByStudent(payload);
            setAttendanceRecords(response.data);
        } catch (error) {
            showSnackbar({
                title: "⛔ Error",
                description: error?.response?.data?.error || "Something went wrong with classes list",
                status: "error"
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        AttendenceList();
    }, [selectedMonth, selectedYear]);

    return (
        <MainLayout pageTitle={"Attendance"} >
            <div className="space-y-4 md:space-y-6">
                {/* Controls Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        {/* Year Selector */}
                        <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                            <span className="text-sm text-gray-600 whitespace-nowrap">Select Year:</span>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-full sm:w-[120px] bg-white border-gray-300">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Month Selector */}
                        <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                            <span className="text-sm text-gray-600 whitespace-nowrap">Select Month:</span>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-full sm:w-[120px] bg-white border-gray-300">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {monthsList.map((month) => (
                                        <SelectItem key={month} value={month}>{month}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Download Button */}
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 w-full sm:w-auto"
                        onClick={downloadExcel}
                        disabled={parsedAttendanceData.length === 0}
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download Monthly Report</span>
                        <span className="sm:hidden">Download Report</span>
                    </Button>
                </div>

                {/* Attendance Percentage Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {/* Overall Attendance */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-600 mb-1">
                                    Overall Attendance
                                </p>
                                <p className="text-2xl md:text-3xl text-gray-900">
                                    {overallPercentage}%
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Academic Year 2024-25
                                </p>
                            </div>
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-green-500 flex items-center justify-center">
                                <span className="text-green-600 text-lg md:text-xl">
                                    ✓
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Current Month Attendance */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-600 mb-1">
                                    Current Month Attendance
                                </p>
                                <p className="text-2xl md:text-3xl text-gray-900">
                                    {currentMonthPercentage}%
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {selectedMonth} {selectedYear}
                                </p>
                            </div>
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-blue-500 flex items-center justify-center">
                                <span className="text-blue-600 text-lg md:text-xl">
                                    {totalDays}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendance Report Table or Loader/Empty State */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[200px] flex flex-col justify-between">
                    <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-gray-900 text-sm md:text-base">
                            Attendance Report for - {selectedMonth} {selectedYear}
                        </h3>
                    </div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="animate-spin w-10 h-10 text-blue-500 mb-2" />
                            <span className="text-gray-500">Loading attendance data...</span>
                        </div>
                    ) : parsedAttendanceData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <span className="text-gray-500 text-base">No records found for this month.</span>
                        </div>
                    ) : (
                        <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm text-gray-600">Date</th>
                                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm text-gray-600">Day</th>
                                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm text-gray-600">Morning Session</th>
                                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm text-gray-600">Afternoon Session</th>
                                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm text-gray-600">Overall Status</th>
                                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm text-gray-600 hidden lg:table-cell">Morning Remarks</th>
                                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm text-gray-600 hidden lg:table-cell">Afternoon Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {parsedAttendanceData.map((record, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900 whitespace-nowrap">{selectedMonth} {record.date}</td>
                                            <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">{record.day}</td>
                                            <td className="px-3 md:px-6 py-3 md:py-4"><span className={getStatusBadgeClass(record.morningSession)}>{record.morningSession}</span></td>
                                            <td className="px-3 md:px-6 py-3 md:py-4"><span className={getStatusBadgeClass(record.afternoonSession)}>{record.afternoonSession}</span></td>
                                            <td className="px-3 md:px-6 py-3 md:py-4"><span className={getStatusBadgeClass(record.overallStatus)}>{record.overallStatus}</span></td>
                                            <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 hidden lg:table-cell">{record.morningRemarks || "-"}</td>
                                            <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 hidden lg:table-cell">{record.afternoonRemarks || "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Summary Footer */}
                        <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-0 text-xs md:text-sm">
                                <div className="flex flex-wrap items-center gap-3 md:gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-gray-600">Full Days: <span className="text-gray-900">{fullDays}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <span className="text-gray-600">Half Days: <span className="text-gray-900">{halfDays}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="text-gray-600">Absent: <span className="text-gray-900">{parsedAttendanceData.filter((d) => d.overallStatus === "Absent").length}</span></span>
                                    </div>
                                </div>
                                <div className="text-gray-600">Total Days: <span className="text-gray-900">{totalDays}</span></div>
                            </div>
                        </div>
                        </>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}