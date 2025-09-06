import React, { useState, useEffect } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import {
    Award,
    BookOpen,
    Users,
    ChevronRight,
    Search,
    Calculator,
    Globe,
    Beaker,
    BookIcon,
    Languages,
    Palette,
    ClockIcon,
    Clock
} from 'lucide-react';
import { getGradeByTeacherId } from '../services/grades'
import { useSnackbar } from "../components/snackbar/SnackbarContext";


interface TeacherClass {
    class_id: string;
    class_name: string;
    class_number: Number,
    board_id: Number,
    section: string;
    subject_name: string;
    subject_id: string;
    progress: number;
    student_count: number;
}

const ComingSoon: React.FC = () => {
    const navigate = useNavigate();

    const handleBackToHome = () => {
        // In a real app, this would redirect to the main site
       navigate('/');
    };

    return (
        <MainLayout pageTitle="Coming Soon">
            <div className="flex items-center justify-center md:mt-[10rem] bg-gray-50">
                <div className="bg-white shadow-xl rounded-2xl p-10 text-center max-w-lg w-full">
                    {/* Clock Icon */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="p-6 rounded-full bg-blue-100">
                            <Clock className="w-10 h-10 text-blue-500" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        Coming Soon!
                    </h1>

                    {/* Subtitle */}
                    <p className="text-gray-600 mb-6">
                        We're working hard to bring you something amazing. Our new feature is
                        under development and will be ready for you shortly. Stay tuned!
                    </p>

                    {/* Buttons */}
                    <div className="flex justify-center gap-4">
                        {/* <button
                            onClick={handleNotifyClick}
                            className="px-6 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
                        >
                            Notify Me
                        </button> */}
                        <button
                            onClick={handleBackToHome}
                            className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ComingSoon;
