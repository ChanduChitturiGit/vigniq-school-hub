import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import PasswordInput from '../components/ui/password-input';
import ClassSectionSubjectInput, { ClassSectionSubjectData } from '../components/ui/class-section-subject-input';
import { Loader2, Plus } from 'lucide-react';
import { addTeacher } from '../services/teacher';
import { getSubjectsBySchoolId } from '../services/subject';
import { getClassesBySchoolId } from '@/services/class';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from '../components/ui/sonner';
import { useSnackbar } from "../components/snackbar/SnackbarContext";

const AdminAddTeacher: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loader, setLoader] = useState(false);
  const [teachingAssignments, setTeachingAssignments] = useState<ClassSectionSubjectData[]>([{
    class: '', subject: '',
    assignment: undefined
  }]);
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const schoolId = JSON.parse(localStorage.getItem("current_school_id"));
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    user_name: '',
    email: '',
    phone_number: '',
    qualification: '',
    experience: '',
    current_address: '',
    permanent_address : '',
    joining_date: '',
    date_of_birth: '',
    gender: '',
    emergency_contact: '',
    class: '',
    class_id: null
  });
  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    user_name: '',
    email: '',
    phone_number: '',
    qualification: '',
    experience: '',
    current_address: '',
    permanent_address : '',
    joining_date: '',
    date_of_birth: '',
    gender: '',
    emergency_contact: '',
    password: ''
  });
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [breadcrumbItems, setBreadCrumbItems] = useState([
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My School', path: '/admin-school' },
    { label: 'Add Teacher' }
  ]);
  const genderList = ["Male", "Female", "Others"];

  const setBreadCrumb = () => {
    if (userData.role == 'superadmin') {
      setBreadCrumbItems([
        { label: 'Schools', path: '/schools' },
        { label: 'My School', path: `/school-details/${schoolId}` },
        { label: 'Add Teacher' }
      ])
    } else {
      setBreadCrumbItems([
        { label: 'My School', path: '/admin-school' },
        { label: 'Add Teacher' }
      ]);
    }
  }

  const subjectsList = async () => {
    const response = await getSubjectsBySchoolId(userData.role == 'superadmin' ? schoolId : userData.school_id);
    if (response && response) {
      setSubjects(response);
    }
  }

  const getClasses = async () => {
    const classesData = await getClassesBySchoolId(userData.role == 'superadmin' ? schoolId : userData.school_id);
    if (classesData && classesData.classes) {
      setClasses(classesData.classes);
    }
  }

  const handleClassChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      class: value,
      class_id: getClassId(value)
    }));
    setErrors(prev => ({ ...prev, class: '' }));
  };

  useEffect(() => {
    getClasses();
    subjectsList();
    setBreadCrumb();
  }, [])

  // --- Validation logic ---
  const validateField = (name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'first_name':
        if (!value) error = 'First Name is required';
        break;
      case 'last_name':
        if (!value) error = 'Last Name is required';
        break;
      case 'user_name':
        if (!value) error = 'User Name is required';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email is invalid';
        break;
      case 'phone_number':
        if (!value) error = 'Phone is required';
        else if (!/^\d{10,15}$/.test(value)) error = 'Phone must be 10-15 digits';
        break;
      case 'qualification':
        if (!value) error = 'Qualification is required';
        break;
      case 'joining_date':
        if (!value) error = 'Joining Date is required';
        break;
      case 'date_of_birth':
        if (!value) error = 'Date of Birth is required';
        break;
      case 'gender':
        if (!value) error = 'Gender is required';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 6) error = 'Password must be at least 6 characters';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleGenderChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      gender: value
    }));
    setErrors(prev => ({ ...prev, gender: '' }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrors(prev => ({ ...prev, password: '' }));
  };

  const getClassId = (className: string) => {
    const classdata = classes.find((val: any) => ('Class ' + val.class_number + ' - ' + val.section) == className);
    const classId = classdata?.class_id ? classdata.class_id : 0;
    return classId;
  }

  const getSubjectId = (subjectName: string) => {
    const subjectdata = subjects.find((val: any) => (val.name) == subjectName);
    const subjectId = subjectdata?.id ? subjectdata.id : 0;
    return subjectId;
  }

  const handleAssignmentChange = (index: number, data: ClassSectionSubjectData) => {
    const updatedAssignments = [...teachingAssignments];
    data[`class_id`] = (data.class != '' ) ? getClassId(data.class) : data['class_id'] ? data['class_id'] : null;
    data[`subject_id`] = (data.subject != '') ? getSubjectId(data.subject) : null;
    updatedAssignments[index] = data;
    setTeachingAssignments(updatedAssignments);
  };

  const addNewAssignment = () => {
    setTeachingAssignments([...teachingAssignments, {
      class: '', subject: '',
      assignment: undefined
    }]);
  };

  const removeAssignment = (index: number) => {
    if (teachingAssignments.length > 1) {
      const updatedAssignments = teachingAssignments.filter((_, i) => i !== index);
      setTeachingAssignments(updatedAssignments);
    }
  };

  // --- Validate all fields on submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldsToValidate = [
      'first_name', 'last_name', 'user_name', 'email', 'phone_number',
      'qualification', 'joining_date', 'date_of_birth', 'gender', 'password'
    ];

    // Validate all fields using your validateField function
    fieldsToValidate.forEach(field => {
      const value = field === 'password' ? password : (formData as any)[field];
      validateField(field, value);
    });

    // Check if any errors exist or any required field is missing
    const hasError =
      fieldsToValidate.some(field => {
        const value = field === 'password' ? password : (formData as any)[field];
        return !value;
      }) ||
      fieldsToValidate.some(field => errors[field as keyof typeof errors]);

    if (hasError) {
      showSnackbar({
        title: "⛔ Error",
        description: "Please fill all  the details in the form.",
        status: "error"
      });
      setLoader(false);
      return;
    }

    // Filter valid assignments (all three fields must be filled) - now optional
    const validAssignments = teachingAssignments.filter(assignment =>
      assignment.class && assignment.subject
    );

    const teacherData = {
      ...formData,
      subject_assignments: validAssignments,
      password: password,
      school_id: userData.role == 'superadmin' ? schoolId : userData.school_id
    };

    try {
      setLoader(true);
      const response = await addTeacher(teacherData);

      if (response) {
        showSnackbar({
          title: "Success",
          description: "Teacher added successfully ✅",
          status: "success"
        });
        navigate(userData.role == 'superadmin' ? `/school-details/${schoolId}` : '/admin-school');
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
    <MainLayout pageTitle="Add Teacher">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Teacher</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Name *</label>
                <input
                  type="text"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.user_name && <p className="text-red-500 text-xs mt-1">{errors.user_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <PasswordInput
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter password"
                  showGenerator
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualification *</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="e.g., M.Sc Mathematics"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 5 years"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {/* Experience is optional, so no error display */}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date *</label>
                <input
                  type="date"
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.joining_date && <p className="text-red-500 text-xs mt-1">{errors.joining_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <Select value={formData.gender} onValueChange={handleGenderChange}>
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
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                <input
                  type="tel"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {/* Emergency contact is optional, so no error display */}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Teacher Assignments
              </label>
              <Select value={formData.class} onValueChange={handleClassChange}>
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
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Teaching Assignments (Optional)</label>
                <button
                  type="button"
                  onClick={addNewAssignment}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Assignment
                </button>
              </div>

              <div className="space-y-4">
                {teachingAssignments.map((assignment, index) => (
                  <ClassSectionSubjectInput
                    key={index}
                    data={{ "assignment": assignment, "subjects": subjects, "classes": classes }}
                    onChange={(data) => handleAssignmentChange(index, data)}
                    onRemove={() => removeAssignment(index)}
                    canRemove={teachingAssignments.length > 1}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current address</label>
              <textarea
                name="current_address"
                value={formData.current_address}
                onChange={handleInputChange}
                onBlur={handleBlur}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* current_address is optional, so no error display */}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permanent address</label>
              <textarea
                name="permanent_address"
                value={formData.permanent_address}
                onChange={handleInputChange}
                onBlur={handleBlur}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* current_address is optional, so no error display */}
            </div>

            <div className="flex gap-4 pt-4">
              {!loader && (
                <>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add Teacher
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(userData.role == 'admin' ? '/admin-school' : '/school-details/' + schoolId)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
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

export default AdminAddTeacher;