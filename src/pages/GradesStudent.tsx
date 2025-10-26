import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Progress } from '../components/ui/progress';
import {
    BookOpen,
    ChevronRight,
    Calculator,
    Globe,
    Beaker,
    BookIcon,
    Languages,
    Palette,
    Users,
    Clock,
    Library,
    Notebook,
    Boxes,
    GraduationCap
} from 'lucide-react';
import { getGradeByTeacherId, getSubjectsByStudentId } from '../services/grades'
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { SpinnerOverlay } from '../pages/SpinnerOverlay';


interface Subject {
    subject_id: string;
    subject_name: string;
    total_chapters: number;
    progress: number;
}



interface studentResponse {
    class_id: number;
    section: string;
    class_number: number;
    subjects_count: number;
    subjects: Subject[];
}

//  "data": {
//         "class_id": 1,
//         "section": "A",
//         "class_number": 1,
//         "subjects": [
//             {
//                 "subject_id": 1,
//                 "subject_name": "Mathematics",
//                 "total_chapters": 14,
//                 "progress": 7.14
//             }
//         ],
//         "subjects_count": 1
//     }

const Grades: React.FC = () => {
    const { showSnackbar } = useSnackbar();
    const [studentSubjects, setStudentSubjects] = useState<Subject[]>([]);
    const [studentData, setStudentData] = useState<studentResponse>();
    const userData = JSON.parse(localStorage.getItem("vigniq_current_user") || '{}');
    const [loader, setLoader] = useState(true);
    const navigate = useNavigate();


    const getGradesData = async () => {
        try {
            const schoolId = userData.school_id ?? 1;
            const studentId = userData.user_id ?? 3;
            const response = await getSubjectsByStudentId(schoolId, studentId);
            if (response && response.data) {
                setStudentData(response.data);
                // Flatten subjects from all classes
                // const subjects: Subject[] = [];
                // // response.data.subjects.forEach((classItem: any) => {
                //   if (Array.isArray( response.data.subjects)) {
                //      response.data.subjects.forEach((subject: any) => {
                //       subjects.push({
                //         subject_id: subject.subject_id,
                //         subject_name: subject.subject_name,
                //         total_chapters: subject.total_chapters,
                //         progress: subject.progress
                //       });
                //     });
                //   }
                // // });
                // setStudentSubjects(subjects);
                setLoader(false);
            } else {
                showSnackbar({
                    title: "⛔ Error",
                    description: "Something went wrong",
                    status: "error"
                });
                setLoader(false);
            }
        } catch (error) {
            showSnackbar({
                title: "⛔ Error",
                description: error?.response?.data?.error || "Something went wrong",
                status: "error"
            });
            setLoader(false);
        }
    }



    useEffect(() => {
        getGradesData();
    }, []);

    const getSubjectIcon = (subjectName: string) => {
        const subject = subjectName.toLowerCase();
        if (subject.includes('math')) return Calculator;
        if (subject.includes('english')) return Languages;
        if (subject.includes('science') || subject.includes('physics')) return Beaker;
        if (subject.includes('social')) return Globe;
        if (subject.includes('art')) return Palette;
        return BookIcon;
    };

    const getSubjectColor = (subjectName: string) => {
        const subject = subjectName.toLowerCase();
        if (subject.includes('math')) return 'from-blue-500 to-blue-600';
        if (subject.includes('english')) return 'from-purple-500 to-purple-600';
        if (subject.includes('science') || subject.includes('physics')) return 'from-green-500 to-green-600';
        if (subject.includes('social')) return 'from-orange-500 to-orange-600';
        if (subject.includes('art')) return 'from-pink-500 to-pink-600';
        return 'from-gray-500 to-gray-600';
    };

    return (
        <>
            <MainLayout pageTitle="Subjects">
                <div className="bg-gray-50 p-6 py-0">
                    <div className="">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-[rgb(145,185,238)] rounded-xl flex items-center justify-center">
                                <span className="text-xl md:text-2xl">
                                    🎓
                                </span>
                            </div>
                            <div>
                                <h2 className="text-gray-900">
                                    Class - {studentData?.class_number} - {studentData?.section}
                                </h2>
                                <p className="text-gray-500 text-sm md:text-base">
                                    {studentData?.subjects_count}{studentData?.subjects_count == 1 ? ' subject' : ' subjects'} 
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {studentData?.subjects && studentData?.subjects.map((subject) => {
                                const SubjectIcon = getSubjectIcon(subject.subject_name);
                                const colorGradient = getSubjectColor(subject.subject_name);
                                return (
                                    <div key={subject.subject_id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300"
                                    onClick={() => navigate(`/grades/syllabus/${subject.subject_id}?class=${'Class ' + studentData.class_number}&class_id=${studentData.class_id}&section=${studentData.section}&subject=${subject.subject_name}&subject_id=${subject.subject_id}&school_board_id=${''}&school_id=${userData.school_id}`)}>
                                        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                                            <div className={`w-12 h-12 bg-gradient-to-r ${colorGradient} rounded-lg flex items-center justify-center`}>
                                                <SubjectIcon className="w-6 h-6 text-white" />
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900">{subject.subject_name}</h2>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 flex items-center space-x-1">
                                                    <BookOpen className="w-4 h-4" />
                                                    <span>Total Chapters:</span>
                                                </span>
                                                <span className="font-medium text-gray-900">{subject.total_chapters}</span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Course Progress:</span>
                                                    <span className="font-medium text-gray-900">{Number(subject.progress).toFixed(2)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`bg-gradient-to-r ${colorGradient} h-2 rounded-full transition-all duration-500`}
                                                        style={{ width: `${Number(subject.progress)}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-center pt-2 border-t border-gray-100">
                                                <span className="text-xs text-gray-500 flex items-center space-x-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>Click to view syllabus</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {studentData?.subjects.length === 0 && !loader && (
                            <div className="text-center py-12">
                                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Assigned</h3>
                                <p className="text-gray-500">
                                    You don't have any subjects assigned yet. Contact your administrator for subject assignments.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                {loader && <SpinnerOverlay />}
            </MainLayout>
        </>
    );
};

export default Grades;
