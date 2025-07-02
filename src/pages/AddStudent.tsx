import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import PasswordInput from '../components/ui/password-input';

const AddStudent: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    class: '',
    section: '',
    rollNo: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    admissionDate: ''
  });

  const breadcrumbItems = [
    { label: 'User Management', path: '/user-management' },
    { label: 'Schools', path: '/schools' },
    { label: 'Greenwood High School', path: '/school-details/1' },
    { label: 'Add Student' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.class || !formData.section || !formData.rollNo || 
        !formData.dateOfBirth || !formData.gender || !formData.parentName || 
        !formData.parentPhone || !formData.admissionDate || !password) {
      alert('Please fill in all required fields including password');
      return;
    }

    const studentData = {
      ...formData,
      password: password
    };

    console.log('Adding student:', studentData);
    
    // Simulate API call with success
    setTimeout(() => {
      alert('Student added successfully!');
      navigate('/school-details/1');
    }, 500);
  };

  return (
    <MainLayout pageTitle="Add Student">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Student</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter password"
                  required
                  showGenerator
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Class</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Section</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number *</label>
                <input
                  type="text"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date *</label>
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian Name *</label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone *</label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Email</label>
                <input
                  type="email"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Add Student
              </button>
              <button
                type="button"
                onClick={() => navigate('/school-details/1')}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
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

export default AddStudent;
