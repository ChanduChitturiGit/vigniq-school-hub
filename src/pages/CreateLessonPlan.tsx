
import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BookOpen, Calculator, Sparkles } from 'lucide-react';

const CreateLessonPlan: React.FC = () => {
  const { chapterId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const subject = searchParams.get('subject') || '';
  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const chapterName = decodeURIComponent(searchParams.get('chapterName') || '');

  const [formData, setFormData] = useState({
    numberOfDays: '',
    classesPerDay: '',
    minutesPerClass: ''
  });

  const breadcrumbItems = [
    { label: 'Grades', path: '/grades' },
    { label: `${subject} - ${className} ${section}`, path: `/grades/syllabus/math_6a?class=${className}&section=${section}&subject=${subject}` },
    { label: 'Create Lesson Plan' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateWithAI = () => {
    if (!formData.numberOfDays || !formData.classesPerDay || !formData.minutesPerClass) {
      alert('Please fill in all fields');
      return;
    }

    // Navigate back to syllabus page - in a real app, you'd save the lesson plan data
    navigate(`/grades/syllabus/math_6a?class=${className}&section=${section}&subject=${subject}`);
  };

  return (
    <MainLayout pageTitle="Create Lesson Plan">
      <div className="space-y-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Lesson Plan</h1>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <p className="text-lg font-medium text-gray-700">Class: {subject} - {className}</p>
              <p className="text-base text-gray-600">Subject: {subject}</p>
              <p className="text-base text-gray-600">Chapter: Chapter {chapterId}: {chapterName}</p>
            </div>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                Lesson Plan Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Number of Days for this Chapter:
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter number of days (e.g., 5)"
                    value={formData.numberOfDays}
                    onChange={(e) => handleInputChange('numberOfDays', e.target.value)}
                    className="text-base py-3 border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Classes per Day:
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 1"
                    value={formData.classesPerDay}
                    onChange={(e) => handleInputChange('classesPerDay', e.target.value)}
                    className="text-base py-3 border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Minutes per Class:
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 45"
                    value={formData.minutesPerClass}
                    onChange={(e) => handleInputChange('minutesPerClass', e.target.value)}
                    className="text-base py-3 border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <Button
                  onClick={handleGenerateWithAI}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 text-lg font-medium flex items-center justify-center gap-3 rounded-xl shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate with AI
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateLessonPlan;
