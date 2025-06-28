
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Edit, Search, Plus } from 'lucide-react';

const ClassDetails: React.FC = () => {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock class data
  const classData = {
    id: id,
    name: 'Class 10',
    section: 'A',
    academicYear: '2024-25',
    teacher: 'John Smith',
    totalStudents: 25
  };

  // Mock students data for this class
  const allStudents = [
    {
      id: '1',
      name: 'Alice Johnson',
      rollNumber: '001',
      email: 'alice.johnson@school.edu',
      parentName: 'Robert Johnson',
      phone: '+91 98765 43210',
      status: 'Active',
      dateOfBirth: '15/05/2008',
      address: '123 Main St, City'
    },
    {
      id: '2',
      name: 'Bob Wilson',
      rollNumber: '002',
      email: 'bob.wilson@school.edu',
      parentName: 'Sarah Wilson',
      phone: '+91 98765 43211',
      status: 'Active',
      dateOfBirth: '22/03/2008',
      address: '456 Oak Ave, City'
    },
    {
      id: '3',
      name: 'Charlie Brown',
      rollNumber: '003',
      email: 'charlie.brown@school.edu',
      parentName: 'David Brown',
      phone: '+91 98765 43212',
      status: 'Active',
      dateOfBirth: '10/07/2008',
      address: '789 Pine St, City'
    }
  ];

  const filteredStudents = allStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.includes(searchTerm)
  );

  const breadcrumbItems = [
    { label: 'User Management', path: '/user-management' },
    { label: 'Schools', path: '/schools' },
    { label: 'School Details', path: '/school-details/1' },
    { label: `${classData.name}-${classData.section}` }
  ];

  return (
    <MainLayout pageTitle={`${classData.name}-${classData.section} Students`}>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Class Info Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {classData.name} - {classData.section}
              </h1>
              <p className="text-gray-600">{classData.academicYear}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Class Teacher</p>
              <p className="font-semibold text-gray-800">{classData.teacher}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-800">{classData.totalStudents}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">Active Students</p>
              <p className="text-2xl font-bold text-green-800">{filteredStudents.filter(s => s.status === 'Active').length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600">Academic Year</p>
              <p className="text-lg font-bold text-purple-800">{classData.academicYear}</p>
            </div>
          </div>
        </div>

        {/* Search and Add Student */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Link
              key={student.id}
              to={`/student-details/${student.id}`}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {student.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{student.name}</h3>
                    <p className="text-sm text-gray-500">Roll: {student.rollNumber}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // Handle edit action
                  }}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Parent:</span>
                  <span className="font-medium text-gray-800">{student.parentName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium text-gray-800">{student.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium text-gray-800 truncate">{student.email}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {student.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default ClassDetails;
