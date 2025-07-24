
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { ArrowLeft, BookOpen, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { addClass } from '../services/class';
import { getTeachersBySchoolId } from '../services/teacher';

const AddClass: React.FC = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    class_name: '',
    section: '',
    teacher: '',
    school_id : 0,
    class_number : 0
  });
  const [suggestions, setSuggestions] = useState({
    class_name: [] as string[],
    section: [] as string[]
  });
  const [showSuggestions, setShowSuggestions] = useState({
    class_name: false,
    section: false
  });
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const schoolId = JSON.parse(localStorage.getItem("current_school_id"));

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
  const classNum = [1,2,3,4,5,6,7,8,9,10,11,12];

  const [breadcrumbItems, setBreadCrumbItems] = useState([
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My School', path: '/admin-school' },
    { label: 'Add Class' }
  ]);


  const setBreadCrumb = () => {
    if (userData.role == 'superadmin') {
      setBreadCrumbItems([
        { label: 'Schools', path: '/schools' },
        { label: 'My School', path: `/school-details/${schoolId}` },
        { label: 'Add Class' }
      ])
    } else {
      setBreadCrumbItems([
        { label: 'My School', path: '/admin-school' },
        { label: 'Add Class' }
      ]);
    }
  }

  const getTeachersList = async () => {
    const response = await getTeachersBySchoolId(userData.role == 'superadmin' ? schoolId : userData.school_id);
    if (response && response.teachers) {
      setTeachers(response.teachers);
    }
  }

  useEffect(() => {
    setBreadCrumb();
    getTeachersList();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Filter suggestions based on input (only for name and section)
    let filteredSuggestions: string[] = [];
    if (field === 'class_name') {
      filteredSuggestions = classOptions.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      );
    } else if (field === 'section') {
      filteredSuggestions = sectionOptions.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      );
    }

    if (field === 'class_name' || field === 'section') {
      setSuggestions(prev => ({
        ...prev,
        [field]: filteredSuggestions
      }));
    }
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

  const handleTeacherChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      teacher: value
    }));
  };

  const handleClassChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      class: value,
      class_number : Number(value.split(' ')[1])
    }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.class_number || !formData.section) {
      alert('Please fill in all required fields');
      return;
    }

    //add class
    const response = await addClass({ ...formData, school_id:  userData.role == 'superadmin' ? schoolId : userData.school_id });

    if (response && response.classes) {
      console.log('Adding new class:', response, formData);
      alert('Class added successfully!');
      navigate('/admin-school');
    }


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
            onClick={() => navigate(userData.role == 'superadmin' ? `/school-details/${schoolId}` : '/admin-school')}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class *
              </label>
              <Select value={formData.class} onValueChange={handleClassChange} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classNum.map((num, index) => (
                    <SelectItem key={index} value={'Class '+num}>
                      {'Class '+num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            {/* Section Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section *
              </label>
              <input
                name="section"
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
                      onMouseDown={() => handleSuggestionClick('section', suggestion)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Class Teacher Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Teacher
              </label>
              <Select value={formData.teacher} onValueChange={handleTeacherChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a teacher (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher, index) => (
                    <SelectItem key={index} value={teacher.teacher_first_name + ' ' + teacher.teacher_last_name}>
                      {teacher.teacher_first_name + ' ' + teacher.teacher_last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Add Class
              </button>
              {/* <button
                type="button"
                //   onClick={() => navigate('/admin-school')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button> */}
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddClass;
