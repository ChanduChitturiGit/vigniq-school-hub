
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Edit, Plus, Mail, Phone, Search, Users as UsersIcon } from 'lucide-react';

const Teachers: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock teacher data
  const teachers = [
    {
      id: '1',
      name: 'Jane Doe',
      email: 'jane.doe@greenwood.edu',
      phone: '+91 98765 43210',
      subject: 'Mathematics',
      classes: ['Class 10-A', 'Class 9-B'],
      status: 'Active'
    },
    {
      id: '2',
      name: 'John Smith',
      email: 'john.smith@greenwood.edu',
      phone: '+91 98765 43211',
      subject: 'English',
      classes: ['Class 8-A', 'Class 7-B'],
      status: 'Active'
    },
    {
      id: '3',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@greenwood.edu',
      phone: '+91 98765 43212',
      subject: 'Science',
      classes: ['Class 9-A', 'Class 8-B'],
      status: 'Active'
    }
  ];

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const breadcrumbItems = user?.role === 'Admin' 
    ? [
        { label: 'School Management', path: '/admin-school' },
        { label: 'Teachers' }
      ]
    : [
        { label: 'User Management', path: '/user-management' },
        { label: 'Teachers' }
      ];

  return (
    <MainLayout pageTitle="Teachers">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
          </div>
          {user?.role === 'Admin' && (
            <Link
              to="/add-teacher"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Teacher
            </Link>
          )}
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search teachers by name, subject or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <Link
              key={teacher.id}
              to={`/teacher-details/${teacher.id}`}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {teacher.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{teacher.name}</h3>
                    <p className="text-sm text-gray-500">{teacher.subject}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{teacher.email}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{teacher.phone}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Classes:</p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.classes.map((className, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {className}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {teacher.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Teachers;
