
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CreateExam: React.FC = () => {
  const navigate = useNavigate();
  const [examData, setExamData] = useState({
    name: '',
    date: '',
    totalMarks: '',
    passMarks: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setExamData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateExam = () => {
    // Handle exam creation logic here
    console.log('Creating exam:', examData);
    navigate('/exams');
  };

  const handleCancel = () => {
    navigate('/exams');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/exams')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Exams
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-800">Create New Exam</h1>
        <p className="text-gray-600 mt-1">Set up your assessment details and marking scheme</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <FileText className="w-5 h-5" />
                Exam Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="examName" className="text-gray-700 font-medium">
                  Exam Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="examName"
                  placeholder="e.g., Mid-term Mathematics, Chapter 5 Quiz, Final Assessment"
                  value={examData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full"
                />
                <p className="text-sm text-gray-500">Choose a clear, descriptive name for your exam</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateConducuted" className="text-gray-700 font-medium">
                  Date Conducted <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="dateConducuted"
                    type="text"
                    placeholder="mm/dd/yyyy"
                    value={examData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full pl-10"
                  />
                </div>
                <p className="text-sm text-gray-500">When was this exam conducted?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalMarks" className="text-gray-700 font-medium">
                    Total Marks <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    placeholder="100"
                    value={examData.totalMarks}
                    onChange={(e) => handleInputChange('totalMarks', e.target.value)}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500">Maximum possible score</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passMarks" className="text-gray-700 font-medium">
                    Pass Marks <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="passMarks"
                    type="number"
                    placeholder="40"
                    value={examData.passMarks}
                    onChange={(e) => handleInputChange('passMarks', e.target.value)}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500">Minimum marks to pass</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleCreateExam}
                  className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
                  disabled={!examData.name || !examData.date || !examData.totalMarks || !examData.passMarks}
                >
                  Create Exam & Add Student Marks
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="px-8"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center">
                  <div className="w-3 h-3 bg-purple-600 rounded"></div>
                </div>
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 text-sm">Exam Name</h3>
                <p className="text-gray-900 font-medium">{examData.name || 'Enter exam name...'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 text-sm">Date</h3>
                <p className="text-gray-900">{examData.date || 'Select date...'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {examData.totalMarks || '0'}
                  </div>
                  <div className="text-xs text-blue-600 font-medium">Total Marks</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-600">
                    {examData.passMarks || '0'}
                  </div>
                  <div className="text-xs text-green-600 font-medium">Pass Marks</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  Use descriptive names like "Mid-term Math" instead of just "Test 1"
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  Typical pass percentage is 40-50% of total marks
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  You'll be taken directly to the marks entry page after creation
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateExam;
