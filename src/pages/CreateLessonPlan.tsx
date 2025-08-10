
import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { BookOpen, Calculator, Sparkles, Edit, Save, ArrowLeft } from 'lucide-react';

interface LessonDay {
  day: number;
  title: string;
  learningObjectives: string[];
  assessmentCriteria: string[];
  activities?: string[];
}

interface GeneratedLessonPlan {
  totalDays: number;
  classesPerDay: number;
  minutesPerClass: number;
  days: LessonDay[];
}

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

  const [showPreview, setShowPreview] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedLessonPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);

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

  const handleGenerateWithAI = async () => {
    if (!formData.numberOfDays || !formData.classesPerDay || !formData.minutesPerClass) {
      alert('Please fill in all fields');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation with sample data
    setTimeout(() => {
      const samplePlan: GeneratedLessonPlan = {
        totalDays: parseInt(formData.numberOfDays),
        classesPerDay: parseInt(formData.classesPerDay),
        minutesPerClass: parseInt(formData.minutesPerClass),
        days: [
          {
            day: 1,
            title: "Introduction to Numbers",
            learningObjectives: [
              "Understand the concept of large numbers",
              "Compare and order numbers",
              "Identify place value and face value"
            ],
            assessmentCriteria: [
              "Students can correctly identify numbers up to 1 crore",
              "Students can accurately compare and order a given set of numbers",
              "Students can explain place value and face value for digits in a number"
            ]
          },
          {
            day: 2,
            title: "Using Brackets and Roman Numerals",
            learningObjectives: [
              "Learn to use brackets in mathematical expressions",
              "Understand Roman numeral system",
              "Convert between Hindu-Arabic and Roman numerals"
            ],
            assessmentCriteria: [
              "Students can solve expressions with brackets correctly",
              "Students can read and write Roman numerals up to 100",
              "Students can convert between number systems accurately"
            ]
          }
        ]
      };
      
      // Generate remaining days based on numberOfDays
      const remainingDays = parseInt(formData.numberOfDays) - 2;
      for (let i = 3; i <= parseInt(formData.numberOfDays); i++) {
        samplePlan.days.push({
          day: i,
          title: `Advanced Concepts - Day ${i}`,
          learningObjectives: [
            "Apply advanced number concepts",
            "Solve complex problems",
            "Practice estimation techniques"
          ],
          assessmentCriteria: [
            "Students can apply concepts independently",
            "Students can solve multi-step problems",
            "Students demonstrate understanding through examples"
          ]
        });
      }

      setGeneratedPlan(samplePlan);
      setShowPreview(true);
      setIsGenerating(false);
    }, 2000);
  };

  const handleSaveLessonPlan = () => {
    // In a real app, you would save the lesson plan data to backend
    console.log('Saving lesson plan:', generatedPlan);
    
    // Navigate back to syllabus page
    navigate(`/grades/syllabus/math_6a?class=${className}&section=${section}&subject=${subject}`);
  };

  const handleBackToForm = () => {
    setShowPreview(false);
    setGeneratedPlan(null);
  };

  const updateDayContent = (dayIndex: number, field: 'title' | 'learningObjectives' | 'assessmentCriteria', value: string | string[]) => {
    if (!generatedPlan) return;
    
    const updatedPlan = { ...generatedPlan };
    if (field === 'title') {
      updatedPlan.days[dayIndex].title = value as string;
    } else {
      updatedPlan.days[dayIndex][field] = value as string[];
    }
    setGeneratedPlan(updatedPlan);
  };

  if (showPreview && generatedPlan) {
    return (
      <MainLayout pageTitle="AI Generated Lesson Plan Breakdown">
        <div className="space-y-8">
          <Breadcrumb items={breadcrumbItems} />

          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Generated Lesson Plan Breakdown</h1>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-lg font-medium text-gray-700">Class: {subject} - {className}</p>
                  <p className="text-base text-gray-600">Subject: {subject}</p>
                  <p className="text-base text-gray-600">Chapter: Chapter {chapterId}: {chapterName}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleBackToForm}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Form
                </Button>
                <Button
                  onClick={handleSaveLessonPlan}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Lesson Plan
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {generatedPlan.days.map((day, index) => (
                <Card key={day.day} className="shadow-lg border-0">
                  <CardHeader className="bg-blue-50 border-b border-blue-200">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-blue-800">
                        Day {day.day}: {day.title}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingDay(editingDay === index ? null : index)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">Learning Objectives:</h4>
                        {editingDay === index ? (
                          <Textarea
                            value={day.learningObjectives.join('\n')}
                            onChange={(e) => updateDayContent(index, 'learningObjectives', e.target.value.split('\n'))}
                            className="min-h-[120px] border-2 border-blue-200 focus:border-blue-500"
                          />
                        ) : (
                          <ul className="space-y-2">
                            {day.learningObjectives.map((objective, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold mt-1">•</span>
                                <span className="text-gray-700">{objective}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">Assessment Criteria:</h4>
                        {editingDay === index ? (
                          <Textarea
                            value={day.assessmentCriteria.join('\n')}
                            onChange={(e) => updateDayContent(index, 'assessmentCriteria', e.target.value.split('\n'))}
                            className="min-h-[120px] border-2 border-blue-200 focus:border-blue-500"
                          />
                        ) : (
                          <ul className="space-y-2">
                            {day.assessmentCriteria.map((criteria, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-green-600 font-bold mt-1">•</span>
                                <span className="text-gray-700">{criteria}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

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
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 text-lg font-medium flex items-center justify-center gap-3 rounded-xl shadow-lg disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5" />
                  {isGenerating ? 'Generating...' : 'Generate with AI'}
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
