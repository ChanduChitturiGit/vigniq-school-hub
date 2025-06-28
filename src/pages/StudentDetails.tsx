
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Edit, Save, X } from 'lucide-react';

const StudentDetails: React.FC = () => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);

  // Mock student data
  const [studentData, setStudentData] = useState({
    id: id,
    name: 'Alice Johnson',
    rollNumber: '001',
    email: 'alice.johnson@school.edu',
    phone: '+91 98765 43210',
    parentName: 'Robert Johnson',
    parentPhone: '+91 98765 43210',
    dateOfBirth: '15/05/2008',
    address: '123 Main St, City',
    class: 'Class 10-A',
    status: 'Active',
    admissionDate: '01/04/2024',
    bloodGroup: 'A+',
    emergencyContact: 'Jane Johnson (+91 98765 43213)'
  });

  const breadcrumbItems = [
    { label: 'User Management', path: '/user-management' },
    { label: 'Schools', path: '/schools' },
    { label: 'School Details', path: '/school-details/1' },
    { label: 'Class Details', path: '/class-details/1' },
    { label: studentData.name }
  ];

  const handleSave = () => {
    // Here you would typically save to backend
    setIsEditing(false);
    console.log('Saving student data:', studentData);
  };

  const handleInputChange = (field: string, value: string) => {
    setStudentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <MainLayout pageTitle={`Student Details - ${studentData.name}`}>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Student Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-semibold">
                  {studentData.name.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{studentData.name}</h1>
                <p className="text-gray-600">{studentData.class} • Roll: {studentData.rollNumber}</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={studentData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{studentData.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={studentData.rollNumber}
                  onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{studentData.rollNumber}</p>
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
                <p className="text-gray-900">{studentData.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              {isEditing ? (
                <input
                  type="text"
                  value={studentData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{studentData.dateOfBirth}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              {isEditing ? (
                <input
                  type="text"
                  value={studentData.class}
                  onChange={(e) => handleInputChange('class', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{studentData.class}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
              {isEditing ? (
                <input
                  type="text"
                  value={studentData.bloodGroup}
                  onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{studentData.bloodGroup}</p>
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
                <p className="text-gray-900">{studentData.address}</p>
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
                  value={studentData.parentName}
                  onChange={(e) => handleInputChange('parentName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{studentData.parentName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={studentData.parentPhone}
                  onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{studentData.parentPhone}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
              {isEditing ? (
                <input
                  type="text"
                  value={studentData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{studentData.emergencyContact}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date</label>
              {isEditing ? (
                <input
                  type="text"
                  value={studentData.admissionDate}
                  onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{studentData.admissionDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Status</h2>
          <div className="flex items-center gap-4">
            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
              {studentData.status}
            </span>
            {isEditing && (
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
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StudentDetails;
