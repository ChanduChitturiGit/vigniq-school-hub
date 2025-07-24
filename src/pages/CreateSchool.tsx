
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import PasswordInput from '../components/ui/password-input';
import { addSchool } from '../data/schools';
import { X } from 'lucide-react';
import { createSchool as createSchoolApi } from '../services/school'
import { SpinnerOverlay } from '../pages/SpinnerOverlay';

const CreateSchool: React.FC = () => {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
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
    adminPhone: ''
  });

  const [boards, setBoards] = useState<string[]>([]);
  const [boardInput, setBoardInput] = useState('');
  const [showBoardSuggestions, setShowBoardSuggestions] = useState(false);

  //const boardSuggestions2 = ['SSC', 'CBSE', 'ICSE', 'IGCSE', 'IB'];

  const boardSuggestions = [
    { boardId: 1, boardName: 'SSC' },
    { boardId: 2, boardName: 'CBSE' },
    { boardId: 3, boardName: 'ICSE' },
    { boardId: 4, boardName: 'IGCSE' },
    { boardId: 5, boardName: 'IB' }
  ];

  const breadcrumbItems = [
    { label: 'User Management', path: '/user-management' },
    { label: 'Create School' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, adminPassword: value }));
  };

  const handleBoardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBoardInput(value);
    setShowBoardSuggestions(value.length > 0);
  };

  const addBoard = (board: any) => {
    if (board.boardName.trim() && !boards.includes(board.boardName.trim())) {
      setBoards([...boards, board.boardName]);
    }
    setBoardInput('');
    setShowBoardSuggestions(false);
  };

  const removeBoard = (boardToRemove: string) => {
    setBoards(boards.filter(board => board !== boardToRemove));
  };

  const handleBoardKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // if (e.key === 'Enter') {
    //   e.preventDefault();
    //   addBoard(boardInput);
    // }
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
      boards: Object.keys(boards),
      admin_firstname: formData.adminFirstName,
      admin_lastname: formData.adminLastName,
      admin_email: formData.adminEmail,
      admin_phone: formData.adminPhone,
      admin_username: formData.adminUserName,
      password: formData.adminPassword
    }

    const school = await createSchoolApi(schoolPayload);

    // console.log("schoolPayload",schoolPayload,school);

    // Create school
    // const newSchool = addSchool({
    //   name: formData.schoolName,
    //   address: formData.address,
    //   phone: formData.phone,
    //   email: formData.email,
    //   adminId: Date.now().toString(),
    //   boards: boards
    // });

    // // Create admin user
    // const users = JSON.parse(localStorage.getItem('vigniq_users') || '[]');
    // const newAdmin = {
    //   id: Date.now().toString(),
    //   email: formData.adminEmail,
    //   password: formData.adminPassword,
    //   name: formData.adminFirstName,
    //   role: 'Admin',
    //   schoolId: newSchool.id
    // };
    // users.push(newAdmin);
    // localStorage.setItem('vigniq_users', JSON.stringify(users));
    setLoader(false);
    if(school && school.message){
      navigate('/schools');
    }
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
                  <div className="relative">
                    <input
                      type="text"
                      value={boardInput}
                      onChange={handleBoardInputChange}
                      onKeyPress={handleBoardKeyPress}
                      placeholder="Type board name (e.g., CBSE, State Board)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {showBoardSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                        {filteredSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => addBoard(suggestion)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            {suggestion.boardName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {boards.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {boards.map((board, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {board}
                          <button
                            type="button"
                            onClick={() => removeBoard(board)}
                            className="ml-1 hover:text-blue-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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
