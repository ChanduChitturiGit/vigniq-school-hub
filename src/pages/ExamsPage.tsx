import { useEffect, useState } from "react";
import {
    LayoutGrid,
    Table,
    Calendar,
    CheckCircle,
    XCircle,
    MinusCircle,
    Search,
    Clock,
    Laptop,
    Bot,
    BookOpen,
    Sparkles,
    Zap,
    Award,
    Trophy,
    Star,
    Target,
    Loader2,
} from "lucide-react";
import { getExamsList } from '../services/exams'
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { SpinnerOverlay } from '../pages/SpinnerOverlay';
import { getExamsForStudent } from '../services/exams';
import MainLayout from "@/components/Layout/MainLayout";


interface Exam {
    id: string;
    subject: string;
    testName: string;
    category: string;
    session: "Morning Session" | "Afternoon Session";
    dateConducted: string;
    marksObtained: number | null;
    totalMarks: number;
    passMarks: number;
    result: "Passed" | "Failed" | "Absent";
    type: "offline" | "ai";
}

interface ExamsViewProps {
    subjectName: string;
}

export const ExamsPage: React.FC<any> = ({
    chapterId,
    classId,
    subjectId,
    schoolId,
    boardId,
    className,
    section,
    subject,
}) => {

    const { showSnackbar } = useSnackbar();
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid",);
    const [searchQuery, setSearchQuery] = useState("");
    const [examType, setExamType] = useState<"offline" | "ai">("offline",);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null,);
    const [examsData, setExamsData] = useState([]);
    const [loading, setLoading] = useState(true);



    // Helper to map API data to Exam structure
    const mapApiExamToExam = (apiExam: any): Exam => {
        // Map session value
        let session: "Morning Session" | "Afternoon Session" = "Morning Session";
        if (apiExam.session === "m") session = "Morning Session";
        else if (apiExam.session === "a") session = "Afternoon Session";

        // Determine result
        let result: "Passed" | "Failed" | "Absent" = "Passed";
        if (apiExam.is_absent) result = "Absent";
        else if (parseFloat(apiExam.marks_obtained) < parseFloat(apiExam.pass_marks)) result = "Failed";
        else result = "Passed";

        return {
            id: String(apiExam.exam_id),
            subject: subject,
            testName: apiExam.exam_name,
            category: apiExam.exam_category,
            session: session,
            dateConducted: apiExam.exam_date,
            marksObtained: apiExam.is_absent ? null : parseFloat(apiExam.marks_obtained),
            totalMarks: parseFloat(apiExam.total_marks),
            passMarks: parseFloat(apiExam.pass_marks),
            result: result,
            type: apiExam.exam_type,
        };
    };


    const loadExams = async () => {
        try {
            setLoading(true);
            // Uncomment when API is ready
            const response = await getExamsForStudent({
                chapter_id: chapterId,
                class_section_id: classId,
                subject_id: subjectId,
                school_id: schoolId,
                school_board_id: boardId,
            });
            setExamsData(response.data);

            setLoading(false);
        } catch (error) {
            setLoading(false);
            showSnackbar({
                title: '⛔ Error',
                description: 'Failed to load chapter exams',
                status: 'error',
            });
        }
    };


    useEffect(() => {
        loadExams();
    }, []);


    const getResultIcon = (result: string) => {
        switch (result) {
            case "Passed":
                return (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                );
            case "Failed":
                return <XCircle className="w-5 h-5 text-red-600" />;
            case "Absent":
                return (
                    <MinusCircle className="w-5 h-5 text-gray-400" />
                );
            default:
                return null;
        }
    };

    const getResultColor = (result: string) => {
        switch (result) {
            case "Passed":
                return "bg-green-100 text-green-700 border-green-200";
            case "Failed":
                return "bg-red-100 text-red-700 border-red-200";
            case "Absent":
                return "bg-gray-100 text-gray-700 border-gray-200";
            default:
                return "";
        }
    };

    // Filter examsData from API and map to Exam structure
    const filteredExams: Exam[] = (examsData as any[])
        .filter((apiExam) => apiExam.exam_type === examType)
        .map(mapApiExamToExam)
        .filter((exam) => {
            const query = searchQuery.toLowerCase();
            const testName = exam.testName.toLowerCase();
            const category = exam.category.toLowerCase();
            const session = exam.session.toLowerCase();
            const date = new Date(exam.dateConducted)
                .toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                })
                .toLowerCase();
            const status = exam.result.toLowerCase();

            return (
                testName.includes(query) ||
                category.includes(query) ||
                session.includes(query) ||
                date.includes(query) ||
                status.includes(query)
            );
        });

    // Show dashboard if an exam is selected
    //   if (selectedExam) {
    //     return (
    //       <StudentExamDashboard
    //         exam={selectedExam}
    //         onClose={() => setSelectedExam(null)}
    //       />
    //     );
    //   }

    return (
        <MainLayout  pageTitle={"Exams"} >
            <div className="space-y-6">
                {/* Header with Tabs, Search Bar, and View Toggle - All in One Row */}
                <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
                    {/* Exam Type Tabs */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg shrink-0 self-start">
                        <button
                            onClick={() => setExamType("offline")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-all ${examType === "offline"
                                ? "bg-white text-[#2E5DD1] shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <BookOpen className="w-4 h-4" />
                            <span className="text-sm">Offline Exams</span>
                        </button>
                        <button
                            onClick={() => setExamType("ai")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-all cursor-not-allowed ${examType === "ai"
                                ? "bg-white text-[#2E5DD1] shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                            disabled={true}
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm">AI Exams Coming Soon</span>

                        </button>
                    </div>

                    {/* Search Bar and View Toggle */}
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center xl:flex-1 xl:justify-end">
                        {/* Search Bar */}
                        <div className="relative sm:flex-1 xl:max-w-xs">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search exams..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5DD1] focus:border-transparent transition-all text-sm"
                            />
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg shrink-0">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${viewMode === "grid"
                                    ? "bg-white text-[#2E5DD1] shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("table")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${viewMode === "table"
                                    ? "bg-white text-[#2E5DD1] shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                <Table className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid View */}
                {!loading && viewMode === "grid" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredExams.map((exam) => {
                            const percentage =
                                exam.marksObtained !== null
                                    ? (
                                        (exam.marksObtained / exam.totalMarks) *
                                        100
                                    ).toFixed(1)
                                    : null;
                            const isPassed =
                                exam.marksObtained !== null &&
                                exam.marksObtained >= exam.passMarks;
                            const isFailed =
                                exam.marksObtained !== null &&
                                exam.marksObtained < exam.passMarks;

                            // AI Exams - New Design
                            if (examType === "ai") {
                                return (
                                    <div
                                        key={exam.id}
                                        className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                                    >
                                        {/* Header Section */}
                                        <div className="p-5 space-y-3">
                                            {/* Top Row: Icon, Badge & Question Count */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                                                        <Zap className="w-5 h-5 text-white" />
                                                    </div>
                                                    <span className="px-2.5 py-1 bg-blue-500 text-white text-xs rounded-md">
                                                        Assessment
                                                    </span>
                                                </div>
                                                <span className="px-2.5 py-1 bg-white text-gray-700 text-xs rounded-md border border-gray-200">
                                                    {exam.totalMarks} Qs
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-gray-900 leading-snug">
                                                {exam.testName}
                                            </h3>

                                            {/* Bloom's Taxonomy Indicator */}
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Target className="w-3 h-3 text-white" />
                                                </div>
                                                <span className="text-sm text-purple-600">
                                                    Bloom's Taxonomy
                                                </span>
                                            </div>

                                            {/* Chapters Covered */}
                                            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <BookOpen className="w-4 h-4 text-blue-600" />
                                                    <span className="text-xs text-blue-700">
                                                        Chapters Covered
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-900 pl-6">
                                                    {exam.category}
                                                </p>
                                            </div>

                                            {/* Date Info Grid */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-white rounded-xl p-3 border border-gray-200">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-600" />
                                                        <span className="text-xs text-gray-600">
                                                            Created
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-900">
                                                        {new Date(
                                                            exam.dateConducted,
                                                        ).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                        })}
                                                    </p>
                                                </div>

                                                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                        <span className="text-xs text-amber-700">
                                                            Submitted Date
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-amber-900">
                                                        {new Date(
                                                            new Date(
                                                                exam.dateConducted,
                                                            ).getTime() +
                                                            7 * 24 * 60 * 60 * 1000,
                                                        ).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                        })}
                                                    </p>
                                                </div>
                                            </div>


                                            {/* View Results Button */}
                                            <button
                                                onClick={() =>
                                                    exam.marksObtained !== null &&
                                                    setSelectedExam(exam)
                                                }
                                                disabled={exam.marksObtained === null}
                                                className={`w-full rounded-xl py-3 px-4 transition-all duration-200 flex items-center justify-center gap-2 text-sm ${exam.marksObtained !== null
                                                    ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg"
                                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                    }`}
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                <span>View Results</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            }

                            // Offline Exams - Original Design
                            return (
                                <div
                                    key={exam.id}
                                    className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:shadow-lg hover:border-gray-300 transition-all duration-300"
                                >
                                    {/* Header with Category Badge */}
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="mb-2">
                                                <div className="inline-block bg-gradient-to-r from-[#2E5DD1]/10 to-[#2E5DD1]/5 border-l-4 border-[#2E5DD1] pl-2 pr-3 py-1.5 rounded-r-lg w-full">
                                                    <h4 className="text-gray-900">
                                                        {exam.testName}
                                                    </h4>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                <span className="inline-block px-2 py-1 bg-blue-50 text-[#2E5DD1] text-xs rounded-md border border-blue-200">
                                                    {exam.category}
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-200">
                                                    <Clock className="w-3 h-3" />
                                                    {exam.session}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 mt-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>
                                            {new Date(
                                                exam.dateConducted,
                                            ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>

                                    {/* Marks Display - Compact */}
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg p-3 mb-3 border border-gray-200">
                                        <div className="text-center mb-2">
                                            {exam.marksObtained !== null ? (
                                                <div>
                                                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                                        <span
                                                            className={`text-2xl ${isPassed ? "text-green-600" : "text-red-600"}`}
                                                        >
                                                            {exam.marksObtained}
                                                        </span>
                                                        <span className="text-lg text-gray-400">
                                                            /
                                                        </span>
                                                        <span className="text-xl text-gray-700">
                                                            {exam.totalMarks}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Marks Obtained
                                                    </p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className="text-2xl text-gray-400">
                                                        —
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Not Attended
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Percentage - Compact */}
                                        {percentage !== null && (
                                            <div className="text-center pt-2 border-t border-gray-200">
                                                <span className="text-xl text-[#2E5DD1]">
                                                    {percentage}%
                                                </span>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Percentage
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Additional Info Row */}
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 mb-0.5">
                                                Pass Marks
                                            </p>
                                            <p className="text-sm text-gray-900">
                                                {exam.passMarks}
                                            </p>
                                        </div>
                                        <div className="h-6 w-px bg-gray-200"></div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 mb-0.5">
                                                Status
                                            </p>
                                            <div className="flex items-center justify-center gap-1">
                                                {getResultIcon(exam.result)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Result Badge - Full Width */}
                                    <div
                                        className={`w-full text-center py-2 rounded-lg border-2 ${getResultColor(
                                            exam.result,
                                        )}`}
                                    >
                                        <span className="text-sm">{exam.result}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Table View */}
                {!loading && viewMode === "table" && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                                            Test Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                                            Session
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                                            Marks
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                                            Pass Marks
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                                            Percentage
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                                            Result
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredExams.map((exam) => (
                                        <tr
                                            key={exam.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-gray-900">
                                                {exam.testName}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {exam.category}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-200">
                                                    <Clock className="w-3 h-3" />
                                                    {exam.session}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(
                                                    exam.dateConducted,
                                                ).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">
                                                {exam.marksObtained !== null
                                                    ? exam.marksObtained
                                                    : "-"}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">
                                                {exam.totalMarks}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">
                                                {exam.passMarks}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">
                                                {exam.marksObtained !== null
                                                    ? `${((exam.marksObtained / exam.totalMarks) * 100).toFixed(1)}%`
                                                    : "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div
                                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${getResultColor(
                                                        exam.result,
                                                    )}`}
                                                >
                                                    {getResultIcon(exam.result)}
                                                    <span className="text-sm">
                                                        {exam.result}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* No Results State */}
                {!loading && filteredExams.length === 0 &&
                    (examsData as any[]).filter((apiExam) => apiExam.exam_type === examType).length >
                    0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h4 className="text-gray-900 mb-2">
                                No Results Found
                            </h4>
                            <p className="text-gray-500">
                                No exams match your search. Try a different search
                                term.
                            </p>
                        </div>
                    )}

                {/* Empty State */}
                {(examsData as any[]).filter((apiExam) => apiExam.exam_type === examType).length ===
                    0 && !loading && (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                {examType === "offline" ? (
                                    <BookOpen className="w-8 h-8 text-gray-400" />
                                ) : (
                                    <Sparkles className="w-8 h-8 text-gray-400" />
                                )}
                            </div>
                            <h4 className="text-gray-900 mb-2">
                                No {examType === "offline" ? "Offline" : "AI"} Exams
                                Yet
                            </h4>
                            <p className="text-gray-500">
                                {examType === "offline" ? "Offline" : "AI"} exam
                                results will appear here once they are published.
                            </p>
                        </div>
                    )}

                {
                    loading && (
                        <div className="col-span-1 md:col-span-2 py-6">
                            <Loader2 className="w-10 h-10 mx-auto text-blue animate-spin" />
                        </div>
                    )
                }
            </div>
        </MainLayout>

    );
}