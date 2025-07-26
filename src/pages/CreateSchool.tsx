
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
  const boardSuggestions = [
    { boardId: 1, boardName: 'SSC' },
    { boardId: 2, boardName: 'CBSE' },
    { boardId: 3, boardName: 'ICSE' },
    { boardId: 4, boardName: 'IGCSE' },
    { boardId: 5, boardName: 'IB' }
  ];
  const breadcrumbItems = [
    { label: 'School Management' },
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, adminPassword: value }));
  };

  const getBoardId = (data: string) => {
    const boardData = boards.find((val: any) => (val.name) == data);
    const boardId = boardData.id ? boardData.id : null;
    return boardId;
  }

  const handleStartYearChange = (value: any) => {
    setFormData((prev) => ({
      ...prev,
      academic_start_year: value,
    }));
    const selectedYear = parseInt(value);
    setEndYears(Array.from({ length: 6 }, (_, i) => (selectedYear + i).toString()));
  };

  const handleEndYearChange = (value: any) => {
    setFormData((prev) => ({
      ...prev,
      academic_end_year: value,
    }));
  };

  const handleBoardChange = (
    selectedOptions: MultiValue<OptionType>,
    _actionMeta: ActionMeta<OptionType>
  ) => {
    setFormData((prev) => ({
      ...prev,
      selectedBoards: selectedOptions as OptionType[],
      board_ids: selectedOptions.map((option) => option.value),
    }));
  };

  const filteredSuggestions = boardSuggestions.filter(
    suggestion =>
      suggestion.boardName.toLowerCase().includes(boardInput.toLowerCase()) &&
      !boards.includes(suggestion.boardName)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    setLoader(true);
    e.preventDefault();

    //console.log("schoolForm",formData,boards);

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
    }

    try {
      const school = await createSchoolApi(schoolPayload);
      if (school && school.message) {
        navigate('/schools');
        showSnackbar({
          title: "Success",
          description: "🏫 School Created successfully ✅",
          status: "success"
        });
      } else {
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong",
          status: "error"
        });
      }
    }catch(error){
      setLoader(false);
       showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
    setLoader(false);
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
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Last Name</label>
                  <input
                    type="text"
                    name="adminLastName"
                    value={formData.adminLastName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Phone</label>
                  <input
                    type="tel"
                    name="adminPhone"
                    value={formData.adminPhone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
                  <PasswordInput
                    value={formData.adminPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter admin password"
                    required
                  />
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
                onClick={() => navigate('/schools')}
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
