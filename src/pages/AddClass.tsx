
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { ArrowLeft, BookOpen } from 'lucide-react';

const AddClass: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    teacher: ''
  });
  const [suggestions, setSuggestions] = useState({
    name: [] as string[],
    section: [] as string[],
    teacher: [] as string[]
  });
  const [showSuggestions, setShowSuggestions] = useState({
    name: false,
    section: false,
    teacher: false
  });

  // Mock data for suggestions
  const classOptions = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const sectionOptions = ['A', 'B', 'C', 'D'];
  const teacherOptions = [
    'John Smith - Mathematics',
    'Sarah Johnson - English',
    'Mike Wilson - Science',
    'Emily Davis - History',
    'Robert Brown - Geography',
    'Lisa White - Physics',
    'David Green - Chemistry'
  ];

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My School', path: '/admin-school' },
    { label: 'Add Class' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Filter suggestions based on input
    let filteredSuggestions: string[] = [];
    if (field === 'name') {
      filteredSuggestions = classOptions.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      );
    } else if (field === 'section') {
      filteredSuggestions = sectionOptions.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      );
    } else if (field === 'teacher') {
      filteredSuggestions = teacherOptions.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      );
    }

    setSuggestions(prev => ({
      ...prev,
      [field]: filteredSuggestions
    }));
  };

  const handleSuggestionClick = (field: string, suggestion: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: suggestion
    }));
    setShowSuggestions(prev => ({
      ...prev,
      [field]: false
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.section || !formData.teacher) {
      alert('Please fill in all required fields');
      return;
    }
    
    console.log('Adding new class:', formData);
    alert('Class added successfully!');
    navigate('/admin-school');
  };

  const handleFocus = (field: string) => {
    setShowSuggestions(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleBlur = (field: string) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(prev => ({
        ...prev,
        [field]: false
      }));
    }, 200);
  };

  return (
    <MainLayout pageTitle="Add Class">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin-school')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to School
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Add New Class</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Class Name Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onFocus={() => handleFocus('name')}
                onBlur={() => handleBlur('name')}
                placeholder="Type or select class name..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showSuggestions.name && suggestions.name.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {suggestions.name.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick('name', suggestion)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section *
              </label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => handleInputChange('section', e.target.value)}
                onFocus={() => handleFocus('section')}
                onBlur={() => handleBlur('section')}
                placeholder="Type or select section..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showSuggestions.section && suggestions.section.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {suggestions.section.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick('section', suggestion)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Teacher Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Teacher *
              </label>
              <input
                type="text"
                value={formData.teacher}
                onChange={(e) => handleInputChange('teacher', e.target.value)}
                onFocus={() => handleFocus('teacher')}
                onBlur={() => handleBlur('teacher')}
                placeholder="Type or select teacher..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showSuggestions.teacher && suggestions.teacher.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {suggestions.teacher.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick('teacher', suggestion)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Add Class
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin-school')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddClass;
