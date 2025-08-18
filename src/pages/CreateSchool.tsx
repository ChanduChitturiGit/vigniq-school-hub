import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import PasswordInput from '../components/ui/password-input';
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { addSchool } from '../data/schools';
import { X } from 'lucide-react';
import { createSchool as createSchoolApi, getBoardsList } from '../services/school'
import { SpinnerOverlay } from '../pages/SpinnerOverlay';
import Select, { ActionMeta, MultiValue } from 'react-select';
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import path from 'path';

type OptionType = {
  label: string;
  value: number;
};

const CreateSchool: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const [boards, setBoards] = useState([]);
  const [formData, setFormData] = useState({
    schoolName: '',
    address: '',
    phone: '',
    email: '',
    adminFirstName: '',
    adminLastName: '',
    adminUserName: '',
    adminEmail: '',
    adminPassword: '',
    adminPhone: '',
    board_id: null,
    selectedBoards: [] as OptionType[],
    board_ids: [] as number[],
    academic_start_year: new Date().getFullYear().toString(),
    academic_end_year: (new Date().getFullYear() + 1).toString()
  });
  const [boardInput, setBoardInput] = useState('');
  const [showBoardSuggestions, setShowBoardSuggestions] = useState(false);
  const [errors, setErrors] = useState({
    schoolName: '',
    address: '',
    phone: '',
    email: '',
    adminFirstName: '',
    adminLastName: '',
    adminUserName: '',
    adminEmail: '',
    adminPassword: '',
    adminPhone: '',
    selectedBoards: '',
    academic_start_year: '',
    academic_end_year: ''
  });
  const boardSuggestions = [
    { boardId: 1, boardName: 'SSC' },
    { boardId: 2, boardName: 'CBSE' },
    { boardId: 3, boardName: 'ICSE' },
    { boardId: 4, boardName: 'IGCSE' },
    { boardId: 5, boardName: 'IB' }
  ];
  const breadcrumbItems = [
    { label: 'Home', path: '/dashboard' },
    { label: 'Create School' }
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - 3 + i).toString());
  const [endYears, setEndYears] = useState(Array.from({ length: 6 }, (_, i) => (Number(formData.academic_start_year) + i).toString()));


  const boardsList = async () => {
    const response = await getBoardsList();
    if (response && response.boards) {
      setBoards(
        response.boards.map((board) => ({
          label: board.name,
          value: board.id,
        }))
      );
    }
  }

  useEffect(() => {
    boardsList();
  }, []);

  // Validation function for all fields
  const validateField = (name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'schoolName':
        if (!value) error = 'School Name is required';
        break;
      case 'address':
        if (!value) error = 'Address is required';
        break;
      case 'phone':
        if (!value) error = 'Phone is required';
        else if (!/^\d{10,15}$/.test(value)) error = 'Phone must be 10-15 digits';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email is invalid';
        break;
      case 'adminFirstName':
        if (!value) error = 'Admin First Name is required';
        break;
      case 'adminLastName':
        if (!value) error = 'Admin Last Name is required';
        break;
      case 'adminUserName':
        if (!value) error = 'Admin User Name is required';
        break;
      case 'adminEmail':
        if (!value) error = 'Admin Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Admin Email is invalid';
        break;
      case 'adminPassword':
        if (!value) error = 'Admin Password is required';
        else if (value.length < 6) error = 'Password must be at least 6 characters';
        break;
      case 'adminPhone':
        if (!value) error = 'Admin Phone is required';
        else if (!/^\d{10,15}$/.test(value)) error = 'Admin Phone must be 10-15 digits';
        break;
      case 'selectedBoards':
        if (!formData.selectedBoards || formData.selectedBoards.length === 0) error = 'At least one board is required';
        break;
      case 'academic_start_year':
        if (!value) error = 'Academic Start Year is required';
        break;
      case 'academic_end_year':
        if (!value) error = 'Academic End Year is required';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Handle blur (unfocus)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // For PasswordInput
  const handlePasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, adminPassword: value }));
    setErrors(prev => ({ ...prev, adminPassword: '' }));
  };

  // For Board Select
  const handleBoardChange = (
    selectedOptions: MultiValue<OptionType>,
    _actionMeta: ActionMeta<OptionType>
  ) => {
    setFormData((prev) => ({
      ...prev,
      selectedBoards: selectedOptions as OptionType[],
      board_ids: selectedOptions.map((option) => option.value),
    }));
    validateField('selectedBoards', selectedOptions);
    setErrors(prev => ({ ...prev, selectedBoards: '' }));
  };

  // For Start/End Year
  const handleStartYearChange = (value: any) => {
    setFormData((prev) => ({
      ...prev,
      academic_start_year: value,
    }));
    setErrors(prev => ({ ...prev, academic_start_year: '' }));
    const selectedYear = parseInt(value);
    setEndYears(Array.from({ length: 6 }, (_, i) => (selectedYear + i).toString()));
  };
  const handleEndYearChange = (value: any) => {
    setFormData((prev) => ({
      ...prev,
      academic_end_year: value,
    }));
    setErrors(prev => ({ ...prev, academic_end_year: '' }));
  };

  const filteredSuggestions = boardSuggestions.filter(
    suggestion =>
      suggestion.boardName.toLowerCase().includes(boardInput.toLowerCase()) &&
      !boards.includes(suggestion.boardName)
  );

  // On submit, validate all fields
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoader(true);

    // Validate all fields
    const fieldsToValidate = [
      'schoolName', 'address', 'phone', 'email',
      'adminFirstName', 'adminLastName', 'adminUserName', 'adminEmail', 'adminPassword', 'adminPhone',
      'selectedBoards', 'academic_start_year', 'academic_end_year'
    ];
    let valid = true;
    fieldsToValidate.forEach(field => {
      const value = field === 'selectedBoards' ? formData.selectedBoards : (formData as any)[field];
      validateField(field, value);
      if (
        (field === 'selectedBoards' && (!formData.selectedBoards || formData.selectedBoards.length === 0)) ||
        errors[field]
      ) {
        valid = false;
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong",
          status: "error"
        });
        return;
      }
    });

    // Wait for errors state to update
    setTimeout(async () => {
      if (Object.values(errors).some(error => error)) {
        setLoader(false);
        return;
      }

      const schoolPayload = {
        school_name: formData.schoolName,
        address: formData.address,
        contact_number: formData.phone,
        email: formData.email,
        boards: formData.board_ids,
        admin_first_name: formData.adminFirstName,
        admin_last_name: formData.adminLastName,
        admin_email: formData.adminEmail,
        admin_phone_number: formData.adminPhone,
        admin_username: formData.adminUserName,
        password: formData.adminPassword,
        academic_start_year: Number(formData.academic_start_year),
        academic_end_year: Number(formData.academic_end_year)
      };

      try {
        const school = await createSchoolApi(schoolPayload);
        if (school && school.message) {
          navigate('/schools');
          showSnackbar({
            title: "Success",
            description: "School Created successfully ✅",
            status: "success"
          });
        } else {
          showSnackbar({
            title: "⛔ Error",
            description: "Something went wrong",
            status: "error"
          });
        }
      } catch (error) {
        setLoader(false);
        showSnackbar({
          title: "⛔ Error",
          description: error?.response?.data?.error || "Something went wrong",
          status: "error"
        });
      }
      setLoader(false);
    }, 0);
  };

  return (
    <MainLayout pageTitle="Create School">
      <div className="max-w-2xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New School</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* School Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">School Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.schoolName && <p className="text-red-500 text-sm mt-1">{errors.schoolName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Board</label>
                <div className="space-y-2">
                  <Select<OptionType, true>
                    isMulti
                    options={boards}
                    onChange={handleBoardChange}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Select Boards"
                    value={formData.selectedBoards}
                  />
                </div>
                {errors.selectedBoards && <p className="text-red-500 text-sm mt-1">{errors.selectedBoards}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Start Year
                </label>
                <UISelect value={formData.academic_start_year} onValueChange={handleStartYearChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((val, index) => (
                      <SelectItem key={index} value={val}>
                        {val}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </UISelect>
                {errors.academic_start_year && <p className="text-red-500 text-sm mt-1">{errors.academic_start_year}</p>}
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic End Year
                </label>
                <UISelect value={formData.academic_end_year} onValueChange={handleEndYearChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {endYears.map((val, index) => (
                      <SelectItem key={index} value={val}>
                        {val}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </UISelect>
                {errors.academic_end_year && <p className="text-red-500 text-sm mt-1">{errors.academic_end_year}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Admin Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Admin Information</h2>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin First Name</label>
                  <input
                    type="text"
                    name="adminFirstName"
                    value={formData.adminFirstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.adminFirstName && <p className="text-red-500 text-sm mt-1">{errors.adminFirstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Last Name</label>
                  <input
                    type="text"
                    name="adminLastName"
                    value={formData.adminLastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.adminLastName && <p className="text-red-500 text-sm mt-1">{errors.adminLastName}</p>}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                  <input
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.adminEmail && <p className="text-red-500 text-sm mt-1">{errors.adminEmail}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Phone</label>
                  <input
                    type="tel"
                    name="adminPhone"
                    value={formData.adminPhone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.adminPhone && <p className="text-red-500 text-sm mt-1">{errors.adminPhone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin User Name</label>
                  <input
                    type="text"
                    name="adminUserName"
                    value={formData.adminUserName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.adminUserName && <p className="text-red-500 text-sm mt-1">{errors.adminUserName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
                  <PasswordInput
                    value={formData.adminPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter admin password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.adminPassword && <p className="text-red-500 text-sm mt-1">{errors.adminPassword}</p>}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create School
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {
        loader && (
          <SpinnerOverlay />
        )
      }
    </MainLayout>
  );
};

export default CreateSchool;
