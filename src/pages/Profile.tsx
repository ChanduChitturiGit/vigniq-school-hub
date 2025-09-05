import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Edit, Save, X, User, Mail, Phone, MapPin, Calendar, GraduationCap, KeyRound } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { getUserByUserName, editProfile } from '../services/user';
import { useSnackbar } from "../components/snackbar/SnackbarContext";

const Profile: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.name?.split(' ')[0] || '',
    last_name: user?.name?.split(' ').slice(1).join(' ') || '',
    user_name: '',
    email: user?.email || '',
    phone_number: '',
    current_address: '',
    permanent_address: '',
    date_of_birth: '',
    qualification: '',
    joining_date: ''
  });
  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    current_address: '',
    permanent_address: '',
    qualification: ''
  });
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));

  const breadcrumbItems = [
    { label: 'Profile' }
  ];

  //classes list api
  const getUserDetails = async () => {
    const userInfo = await getUserByUserName(userData.user_name);
    if (userInfo && userInfo.user) {
      setFormData(userInfo.user);
    }
  }

  useEffect(() => {
    getUserDetails();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
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
      case 'phone_number':
        if (!value) error = 'Phone is required';
        else if (!/^\d{10,15}$/.test(value)) error = 'Phone must be 10-15 digits';
        break;
      case 'qualification':
        if (!value && user?.role == 'teacher') error = 'Qualification is required';
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

  const editData = async (data: any) => {
    // Validate all fields before API call
    const fieldsToValidate = ['first_name', 'last_name', 'phone_number'];
    if (user?.role == 'teacher') fieldsToValidate.push('qualification');
    fieldsToValidate.forEach(field => {
      validateField(field, (formData as any)[field]);
    });

    const hasError =
      fieldsToValidate.some(field => !(formData as any)[field]) ||
      fieldsToValidate.some(field => errors[field as keyof typeof errors]);

    if (hasError) {
      showSnackbar({
        title: "⛔ Error",
        description: "Please fill all the details in the form.",
        status: "error"
      });
      return;
    }

    try {
      const response = await editProfile(data);
      if (response && response.message) {
        setIsEditing(false);
        showSnackbar({
          title: "Success",
          description: "Profile updated successfully ✅",
          status: "success"
        });
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    } finally {
      getUserDetails();
    }
  }

  const handleSave = () => {
    editData(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    getUserDetails();
  };

  const handleResetPassword = () => {
    localStorage.setItem('reset_password_email', user?.email || '');
    logout();
    navigate('/reset-password?fromProfile=true');
  };

  return (
    <MainLayout pageTitle="Profile">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div className="flex mb-4 md:mb-0 items-center gap-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
                <p className="text-gray-600">{user?.role}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                        <KeyRound className="w-4 h-4" />
                        Reset Password
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset Password</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reset your password? You will be logged out and must log in again.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetPassword}>
                          Yes, Reset Password
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  First Name
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                  </>
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{formData.first_name}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Last Name
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                  </>
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{formData.last_name}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Username
                </label>
                <p className="text-gray-900 bg-gray-100 p-3 rounded-lg border">{formData.user_name}</p>
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-gray-900 bg-gray-100 p-3 rounded-lg border">{formData.email}</p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                  </>
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{formData.phone_number}</p>
                )}
              </div>

              {false && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{formData.date_of_birth}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  Current Address
                </label>
                {isEditing ? (
                  <>
                    <textarea
                      name="current_address"
                      value={formData.current_address}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.current_address && <p className="text-red-500 text-xs mt-1">{errors.current_address}</p>}
                  </>
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{formData.current_address}</p>
                )}
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  Permanent Address
                </label>
                {isEditing ? (
                  <>
                    <textarea
                      name="permanent_address"
                      value={formData.permanent_address}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.permanent_address && <p className="text-red-500 text-xs mt-1">{errors.permanent_address}</p>}
                  </>
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{formData.permanent_address}</p>
                )}
              </div>


              {userData.role != 'superadmin' && userData.role != 'admin' && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <GraduationCap className="w-4 h-4" />
                    {user?.role != 'student' ? 'Qualification' : 'Education'}
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{formData.qualification}</p>
                  )}
                </div>
              )}

              {false && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Joining Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="joining_date"
                      value={formData.joining_date}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{formData.joining_date}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
