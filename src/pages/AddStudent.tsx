import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import PasswordInput from '../components/ui/password-input';
import { getClassesBySchoolId } from '../services/class';
import { addStudent } from '../services/student';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const AddStudent: React.FC = () => {
  const [value, setValue] = React.useState<Dayjs | null>(null);
  const [joinDate, setJoinDate] = React.useState<Dayjs | null>(null);
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const schoolId = localStorage.getItem('current_school_id');
  const [password, setPassword] = useState('');
  const [classes, setClasses] = useState([]);
  const [loader, setLoader] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    user_name: '',
    email: '',
    phone_number: '',
    class: '',
    class_id: 1,
    school_id: userData.school_id,
    roll_number: '',
    date_of_birth: '',
    gender: '',
    current_address: '',
    permanent_address: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    admission_date: ''
  });
  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    user_name: '',
    class: '',
    roll_number: '',
    date_of_birth: '',
    gender: '',
    parent_name: '',
    parent_phone: '',
    admission_date: '',
    password: '',
    email : ''
  });
  const genderList = ["Male", "Female", "Others"];

  const [breadcrumbItems, setBreadCrumbItems] = useState([
    { label: 'My School', path: '/admin-school' },
    { label: 'Add Student' }
  ]);

  const setBreadCrumb = () => {
    if (userData.role == 'teacher') {
      setBreadCrumbItems([
        { label: 'Students', path: '/students' },
        { label: 'Add Student' }
      ])
    } else if (userData.role == 'superadmin') {
      setBreadCrumbItems([
        { label: 'My School', path: `/school-details/${schoolId}` },
        { label: 'Add Student' }
      ])
    }
  }

  const getClassId = (className: string) => {
    const classdata = classes.find((val: any) => ('Class ' + val.class_number + ' - ' + val.section+' ('+val.school_board_name+')') == className);
    const classId = classdata.class_id ? classdata.class_id : 0;
    return classId;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleClassChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      class: value,
      class_id: getClassId(value)
    }));
    setErrors(prev => ({ ...prev, class: '' }));
  };

  const handleGenderChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      gender: value
    }));
    setErrors(prev => ({ ...prev, gender: '' }));
  };

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
      case 'class':
        if (!value) error = 'Class is required';
        break;
      case 'roll_number':
        if (!value) error = 'Roll Number is required';
        break;
      case 'date_of_birth':
        if (!value) error = 'Date of Birth is required';
        break;
      case 'gender':
        if (!value) error = 'Gender is required';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        break;
      case 'parent_name':
        if (!value) error = 'Parent/Guardian Name is required';
        break;
      case 'parent_phone':
        if (!value) error = 'Parent Phone is required';
        else if (!/^\d{10,15}$/.test(value)) error = 'Parent Phone must be 10-15 digits';
        break;
      case 'admission_date':
        if (!value) error = 'Admission Date is required';
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

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  useEffect(() => {
    getClasses();
    setBreadCrumb();
  }, []);

  const getClasses = async () => {
    const classesData = await getClassesBySchoolId(userData.role == 'superadmin' ? schoolId : userData.school_id);
    if (classesData && classesData.classes) {
      setClasses(classesData.classes);
      setBreadCrumb();
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldsToValidate = [
      'first_name', 'last_name', 'user_name', 'class', 'roll_number',
      'date_of_birth', 'gender', 'parent_name', 'parent_phone', 'admission_date', 'password','email'
    ];

    // Validate all fields using validateField
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
        description: "Please fill all the details in the form.",
        status: "error"
      });
      setLoader(false);
      return;
    }

    const studentData = {
      ...formData,
      password: password,
      school_id: userData.role == 'superadmin' ? schoolId : userData.school_id
    };

    try {
      setLoader(true);
      const response = await addStudent(studentData);

      if (response && response.message) {
        showSnackbar({
          title: "success",
          description: `Student added successfully ✅`,
          status: "success"
        });
        if (userData.role == 'superadmin') {
          navigate(`/school-details/${schoolId}`);
        } else if (userData.role == 'admin') {
          navigate(`/admin-school`);
        } else {
          navigate('/students');
        }
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
    setLoader(false);
  };

  React.useEffect(() => {
    if (formData.permanent_address === formData.current_address && formData.current_address !== "") {
      setFormData(prev => ({
        ...prev,
        permanent_address: prev.current_address
      }));
    }
  }, [formData.current_address]);

  return (
    <MainLayout pageTitle="Add Student">
      <div className="space-y-6">
        {/* <Breadcrumb items={breadcrumbItems} /> */}
        <div
            onClick={() => window.history.back()}
            className="max-w-fit flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Student</h1>

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
                  onChange={setPassword}
                  placeholder="Enter password"
                  showGenerator
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class *
                </label>
                <Select value={formData.class} onValueChange={handleClassChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classItem, index) => (
                      <SelectItem key={index} value={'Class ' + classItem.class_number + ' - ' + classItem.section + ' ('+classItem.school_board_name+')'}>
                        {'Class ' + classItem.class_number + ' - ' + classItem.section + ' ('+classItem.school_board_name+')'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.class && <p className="text-red-500 text-xs mt-1">{errors.class}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number *</label>
                <input
                  type="text"
                  name="roll_number"
                  value={formData.roll_number}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.roll_number && <p className="text-red-500 text-xs mt-1">{errors.roll_number}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                {/* <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                /> */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    className="date-div w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    label=""
                    value={value}
                    onChange={(newValue) => {
                      setValue(newValue);
                      formData.date_of_birth = newValue ? newValue.format("YYYY-MM-DD") : null;
                    }}
                    format="DD/MM/YYYY"   // 👈 force display format
                  />
                </LocalizationProvider>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date *</label>
                {/* <input
                  type="date"
                  name="admission_date"
                  value={formData.admission_date}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                /> */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    className="date-div w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    label=""
                    value={joinDate}
                    onChange={(newValue) => {
                      setJoinDate(newValue);
                      formData.admission_date = newValue ? newValue.format("YYYY-MM-DD") : null;
                    }}
                    format="DD/MM/YYYY"   // 👈 force display format
                  />
                </LocalizationProvider>
                {errors.admission_date && <p className="text-red-500 text-xs mt-1">{errors.admission_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian Name *</label>
                <input
                  type="text"
                  name="parent_name"
                  value={formData.parent_name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.parent_name && <p className="text-red-500 text-xs mt-1">{errors.parent_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone *</label>
                <input
                  type="tel"
                  name="parent_phone"
                  value={formData.parent_phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.parent_phone && <p className="text-red-500 text-xs mt-1">{errors.parent_phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Email</label>
                <input
                  type="email"
                  name="parent_email"
                  value={formData.parent_email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Address</label>
              <textarea
                name="current_address"
                value={formData.current_address}
                onChange={handleInputChange}
                onBlur={handleBlur}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Checkbox for address sync */}
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="sameAddress"
                checked={formData.permanent_address === formData.current_address && formData.current_address !== ""}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({
                      ...prev,
                      permanent_address: prev.current_address
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      permanent_address: ""
                    }));
                  }
                }}
                className="mr-2"
              />
              <label htmlFor="sameAddress" className="text-sm text-gray-700">
                Permanent address is same as current address
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Address</label>
              <textarea
                name="permanent_address"
                value={formData.permanent_address}
                onChange={handleInputChange}
                onBlur={handleBlur}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={formData.permanent_address === formData.current_address && formData.current_address !== ""}
              />
            </div>

            <div>
              <input type="text" name="fake_username" autoComplete="username" className="hidden" />
              <input type="password" name="fake_password" autoComplete="new-password" className="hidden" />
            </div>

            {!loader && (
              <div className="flex justify-center gap-4 pt-2">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-6 lg:px-20 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add Student
                </button>
                {/* <button
                  type="button"
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button> */}
              </div>
            )}
            {loader && (
              <Loader2 className="w-10 h-10 mx-auto text-blue animate-spin" />
            )}
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddStudent;
