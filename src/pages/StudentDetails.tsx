import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Edit, Save, X } from 'lucide-react';
import { getStudentsById, editStudent } from '../services/student';
import { getClassesBySchoolId } from '@/services/class';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { Mail, Home, Phone, User, Calendar,Book,BookOpen,GraduationCap } from 'lucide-react';

const StudentDetails: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [classes, setClasses] = useState([]);
  const genderList = ["Male", "Female", "Others"];
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const schoolId = localStorage.getItem('current_school_id');

  const [studentData, setStudentData] = useState({
    student_id: id,
    student_first_name: 'Alice Johnson',
    student_last_name: 'A',
    roll_number: '001',
    email: 'alice.johnson@school.edu',
    phone: '+91 98765 43210',
    parent_name: 'Robert Johnson',
    parent_phone: '+91 98765 43210',
    date_of_birth: '15/05/2008',
    parent_email: 'parent@gmail.com',
    address: '123 Main St, City',
    class: 'Class 10-A',
    class_id: 1,
    class_name: 'Class 10',
    class_number: 0,
    section: "A",
    status: 'Active',
    gender: 'Male',
    admission_date: '01/04/2024',
    blood_group: 'A+',
    emergency_contact: 'Jane Johnson (+91 98765 43213)'
  });

  const [errors, setErrors] = useState({
    student_first_name: '',
    student_last_name: '',
    roll_number: '',
    class: '',
    date_of_birth: '',
    gender: '',
    admission_date: '',
    parent_name: '',
    parent_phone: ''
  });

  const [breadcrumbItems, setBreadCrumbItems] = useState([
    { label: userData.role == 'teacher' ? 'Home' : 'My School', path: (userData.role == 'superadmin' ? `/school-details/${schoolId}` : userData.role == 'admin' ? '/admin-school' : '/dashboard') },
    { label: 'Class Details', path: `/class-details/${studentData.class_id}` },
    { label: studentData.student_first_name }
  ]);



  const getClasses = async () => {
    const classesData = await getClassesBySchoolId(userData.school_id);
    if (classesData && classesData.classes) {
      setClasses(classesData.classes);
    }
  }

  const getStudentData = async () => {
    if (userData && userData.role && userData.role == 'superadmin') {
      userData.school_id = localStorage.getItem('current_school_id');
    }
    const response = await getStudentsById(Number(id), userData.school_id);
    if (response && response.student) {
      setStudentData(response.student);
    }
  }

  useEffect(() => {
    getStudentData();
    getClasses();
  }, [])

  // --- Validation logic ---
  const validateField = (name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'student_first_name':
        if (!value) error = 'First Name is required';
        break;
      case 'student_last_name':
        if (!value) error = 'Last Name is required';
        break;
      case 'roll_number':
        if (!value) error = 'Roll Number is required';
        break;
      case 'class':
        if (!value) error = 'Class is required';
        break;
      case 'date_of_birth':
        if (!value) error = 'Date of Birth is required';
        break;
      case 'gender':
        if (!value) error = 'Gender is required';
        break;
      case 'admission_date':
        if (!value) error = 'Admission Date is required';
        break;
      case 'parent_name':
        if (!value) error = 'Parent/Guardian Name is required';
        break;
      case 'parent_phone':
        if (!value) error = 'Parent Phone is required';
        else if (!/^\d{10,15}$/.test(value)) error = 'Parent Phone must be 10-15 digits';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (field: string, value: string) => {
    validateField(field, value);
  };

  const handleInputChange = (field: string, value: string) => {
    setStudentData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleClassChange = (value: string) => {
    setStudentData(prev => ({
      ...prev,
      class: value,
      class_id: getClassId(value)
    }));
    setErrors(prev => ({ ...prev, class: '' }));
  };

  const handleGenderChange = (value: string) => {
    setStudentData(prev => ({
      ...prev,
      gender: value
    }));
    setErrors(prev => ({ ...prev, gender: '' }));
  };

  const getClassId = (className: string) => {
    const classdata = classes.find((val: any) => ('Class ' + val.class_number + ' - ' + val.section) == className);
    return classdata?.class_id || 0;
  };

  const handleSave = async () => {
    // Validate all fields before API call
    const fieldsToValidate = [
      'student_first_name', 'student_last_name', 'roll_number', 'class',
      'date_of_birth', 'gender', 'admission_date', 'parent_name', 'parent_phone'
    ];
    fieldsToValidate.forEach(field => {
      validateField(field, (studentData as any)[field]);
    });

    const hasError =
      fieldsToValidate.some(field => !(studentData as any)[field]) ||
      fieldsToValidate.some(field => errors[field as keyof typeof errors]);

    if (hasError) {
      showSnackbar({
        title: "⛔ Error",
        description: "Please fill all the details in the form.",
        status: "error"
      });
      return;
    }

    setIsEditing(false);
    const response = await editStudent(studentData);
    if (response && response.message) {
      getStudentData();
      showSnackbar({
        title: "Success",
        description: "Student data updated successfully ✅",
        status: "success"
      });
    }
  };

  return (
    <MainLayout pageTitle={`Student Details - ${studentData.student_first_name + ' ' + studentData.student_last_name}`}>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Student Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-semibold">
                  {studentData.student_first_name.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{studentData.student_first_name}</h1>
                <p className="text-gray-600">{'Class ' + studentData.class_number} • Roll: {studentData.roll_number}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Student Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={studentData.student_first_name}
                    onChange={(e) => handleInputChange('student_first_name', e.target.value)}
                    onBlur={(e) => handleBlur('student_first_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.student_first_name && <p className="text-red-500 text-xs mt-1">{errors.student_first_name}</p>}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{studentData.student_first_name}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={studentData.student_last_name}
                  onChange={(e) => handleInputChange('student_last_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{studentData.student_last_name}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={studentData.roll_number}
                  onChange={(e) => handleInputChange('roll_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{studentData.roll_number}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={studentData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{studentData.email}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class *
              </label>
              {isEditing ? (
                <Select value={studentData.class} onValueChange={handleClassChange} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classItem, index) => (
                      <SelectItem key={index} value={'Class ' + classItem.class_number + ' - ' + classItem.section}>
                        {'Class ' + classItem.class_number + ' - ' + classItem.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{'Class ' + studentData.class_number + ' - ' + studentData.section}</p>
                </div>
              )
              }
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              {isEditing ? (
                <input
                  type="text"
                  value={studentData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{studentData.date_of_birth}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              {isEditing ? (
                <>
                  <Select value={studentData.gender} onValueChange={handleGenderChange} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderList.map((val, index) => (
                        <SelectItem key={index} value={val}>
                          {val}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) :
                (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{studentData.gender}</p>
                  </div>
                )
              }
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date</label>
              {isEditing ? (
                <input
                  type="text"
                  value={studentData.admission_date}
                  onChange={(e) => handleInputChange('admission_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{studentData.admission_date}</p>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              {isEditing ? (
                <textarea
                  value={studentData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{studentData.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Parent/Guardian Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Parent/Guardian Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={studentData.parent_name}
                  onChange={(e) => handleInputChange('parent_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{studentData.parent_name}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={studentData.parent_phone}
                  onChange={(e) => handleInputChange('parent_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{studentData.parent_phone}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
              {isEditing ? (
                <input
                  type="text"
                  value={studentData.emergency_contact}
                  onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{studentData.emergency_contact}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parent Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={studentData.parent_email}
                  onChange={(e) => handleInputChange('parent_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{studentData.parent_email}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Status</h2>
          <div className="flex items-center gap-4">
            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
              {studentData.status || 'Active'}
            </span>
            {/* {isEditing && (
              <select
                value={studentData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
                <option value="Graduated">Graduated</option>
              </select>
            )} */}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StudentDetails;
