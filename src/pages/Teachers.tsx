
import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { Edit, Plus, Mail, Phone } from 'lucide-react';

const Teachers: React.FC = () => {
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
    }
  ];

  return (
    <MainLayout pageTitle="Teachers">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
          <Link
            to="/create-teacher"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Teacher
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
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
                <Link
                  to={`/edit-teacher/${teacher.id}`}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </Link>
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
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Teachers;
