import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { addClass } from '../services/class';
import { getTeachersBySchoolId } from '../services/teacher';
import { getBoardsListBySchoolId } from '../services/school'
import { useSnackbar } from "../components/snackbar/SnackbarContext";

const AddClass: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loader, setLoader] = useState(false);
  const [boards, setBoards] = useState([]);
  const [formData, setFormData] = useState({
    class_name: '',
    section: '',
    teacher: '',
    teacher_id: 0,
    school_id: 0,
    class_number: 0,
    class: '',
    board: '',
    board_id: null
  });
  const [errors, setErrors] = useState({
    board: '',
    class: '',
    section: ''
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

  const classOptions = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const sectionOptions = ['A', 'B', 'C', 'D'];
  const classNum = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const [breadcrumbItems, setBreadCrumbItems] = useState([
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My School', path: '/admin-school' },
    { label: 'Add Class' }
  ]);

  const setBreadCrumb = () => {
    if (userData.role == 'superadmin') {
      setBreadCrumbItems([
        { label: 'Schools', path: '/schools' },
        { label: 'My School', path: `/schools/school-details/${schoolId}` },
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

  const boardsList = async () => {
    const response = await getBoardsListBySchoolId(userData.role == 'superadmin' ? schoolId : userData.school_id);
    if (response && response.data) {
      setBoards(response.data);
    }
  }

  useEffect(() => {
    setBreadCrumb();
    boardsList();
    getTeachersList();
  }, []);

  useEffect(() => {
    if (boards.length > 0) {
      setFormData((prev) => ({
        ...prev,
        board: boards[0].name,
        board_id: boards[0].id,
      }));
    }
  }, [boards]);

  // --- Validation logic ---
  const validateField = (name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'board':
        if (!value) error = 'Board is required';
        break;
      case 'class':
        if (!value) error = 'Class is required';
        break;
      case 'section':
        if (!value) error = 'Section is required';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => ({ ...prev, [field]: '' }));

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
    const data = teachers.find((val: any) => (val.teacher_first_name + ' ' + val.teacher_last_name) == value);
    setFormData(prev => ({
      ...prev,
      teacher: value,
      teacher_id: data.teacher_id
    }));
  };

  const handleClassChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      class: value,
      class_number: Number(value.split(' ')[1])
    }));
    setErrors(prev => ({ ...prev, class: '' }));
  };

  const getBoardId = (data: string) => {
    const boardData = boards.find((val: any) => (val.name) == data);
    const boardId = boardData && boardData.id ? boardData.id : null;
    return boardId;
  }

  const handleBoardChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      board: value,
      board_id: Number(getBoardId(value))
    }));
    setErrors(prev => ({ ...prev, board: '' }));
  };

  const handleFocus = (field: string) => {
    setShowSuggestions(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleBlur = (field: string) => {
    setTimeout(() => {
      setShowSuggestions(prev => ({
        ...prev,
        [field]: false
      }));
    }, 200);
    // Validate on blur
    validateField(field, (formData as any)[field]);
  };

  // --- Validate all fields on submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    setLoader(true);
    e.preventDefault();

    const fieldsToValidate = ['board', 'class', 'section'];
    fieldsToValidate.forEach(field => {
      validateField(field, (formData as any)[field]);
    });

    // Synchronously check if any field is missing
    const hasError = fieldsToValidate.some(field => {
      const value = (formData as any)[field];
      return !value;
    });

    if (hasError) {
      showSnackbar({
        title: "⛔ Error",
        description: "Please fill all  the details in the form.",
        status: "error"
      });
      setLoader(false);
      return;
    }

    if (formData.teacher_id == 0) {
      delete formData.teacher_id;
    }
    //add class
    try {
      const response = await addClass({
        ...formData,
        school_id: userData.role === 'superadmin' ? schoolId : userData.school_id
      });

      if (response?.class) {
        showSnackbar({
          title: "Success",
          description: "Class added successfully ✅",
          status: "success"
        });

        navigate(userData.role === 'superadmin' ? `/schools/school-details/${schoolId}` : '/admin-school');
      } else if (response?.error) {
        showSnackbar({
          title: "⛔ Error",
          description: response?.error || "Something went wrong",
          status: "error"
        });
      } else {
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong",
          status: "error"
        });
      }
    } catch (error: any) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
    setLoader(false);
  };

  return (
    <MainLayout pageTitle="Add Class">
      <div className="space-y-6">
        {/* <Breadcrumb items={breadcrumbItems} /> */}
        <div
          onClick={() => window.history.back()}
          className="max-w-fit flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </div>

        {/* <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(userData.role == 'superadmin' ? `/schools/school-details/${schoolId}` : '/admin-school')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to School
          </button>
        </div> */}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Add New Class</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Board Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Board *
              </label>
              <Select value={formData.board} onValueChange={handleBoardChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a board" />
                </SelectTrigger>
                <SelectContent>
                  {boards.map((val, index) => (
                    <SelectItem key={index} value={val.name}>
                      {val.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.board && <p className="text-red-500 text-xs mt-1">{errors.board}</p>}
            </div>

            {/* Class Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class *
              </label>
              <Select value={formData.class} onValueChange={handleClassChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent className='max-h-60 overflow-y-auto'>
                  {classNum.map((num, index) => (
                    <SelectItem key={index} value={'Class ' + num}>
                      {'Class ' + num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.class && <p className="text-red-500 text-xs mt-1">{errors.class}</p>}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section}</p>}
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
            <div className='hidden'>
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
              {!loader &&
                (
                  <>
                    <button
                      type="submit"
                      disabled={loader}
                      className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg transition-colors font-medium">
                      {loader ? 'Adding...' : 'Add Class'}
                    </button>
                  </>
                )
              }
              {loader && (
                <Loader2 className="w-10 h-10 mx-auto text-blue animate-spin" />
              )}
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddClass;
