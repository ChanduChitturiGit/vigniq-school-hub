
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { Edit, Search, Plus } from 'lucide-react';

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock student data
  const allStudents = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice.johnson@greenwood.edu',
      class: 'Class 10-A',
      rollNumber: '001',
      parentName: 'Robert Johnson',
      phone: '+91 98765 43210',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Bob Wilson',
      email: 'bob.wilson@greenwood.edu',
      class: 'Class 10-A',
      rollNumber: '002',
      parentName: 'Sarah Wilson',
      phone: '+91 98765 43211',
      status: 'Active'
    },
    {
      id: '3',
      name: 'Charlie Brown',
      email: 'charlie.brown@greenwood.edu',
      class: 'Class 9-B',
      rollNumber: '001',
      parentName: 'David Brown',
      phone: '+91 98765 43212',
      status: 'Active'
    }
  ];

  const filteredStudents = allStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.includes(searchTerm)
  );

  return (
    <MainLayout pageTitle="Students">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Students</h1>
          <Link
            to="/create-student"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search students by name, class, or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
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
                    <p className="text-sm text-gray-500">{student.class}</p>
                  </div>
                </div>
                <Link
                  to={`/edit-student/${student.id}`}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Roll Number:</span>
                  <span className="font-medium text-gray-800">{student.rollNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Parent:</span>
                  <span className="font-medium text-gray-800">{student.parentName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium text-gray-800">{student.phone}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {student.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Students;
