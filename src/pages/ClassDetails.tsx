
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { getClasses } from '../data/classes';
import { Users, Calendar, BookOpen, GraduationCap, Mail, Phone } from 'lucide-react';

const ClassDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const location = useLocation();
  const classes = getClasses();
  const classItem = classes.find(c => c.id === id);

  if (!classItem) {
    return (
      <MainLayout pageTitle="Class Not Found">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-800">Class Not Found</h1>
          <p className="text-gray-600 mt-2">The requested class could not be found.</p>
        </div>
      </MainLayout>
    );
  }

  // Determine breadcrumb based on the referrer or user role
  const getBreadcrumbItems = () => {
    // Check if user came from My School page
    const referrer = document.referrer;
    const isFromMySchool = referrer.includes('/admin-school') || location.state?.from === 'admin-school';
    
    if (user?.role === 'Admin') {
      if (isFromMySchool) {
        return [
          { label: 'My School', path: '/admin-school' },
          { label: `${classItem.name} - ${classItem.section}` }
        ];
      } else {
        return [
          { label: 'School Management', path: '/admin-school' },
          { label: 'Classes', path: '/classes' },
          { label: `${classItem.name} - ${classItem.section}` }
        ];
      }
    } else if (user?.role === 'Teacher') {
      return [
        { label: 'User Management', path: '/user-management' },
        { label: 'Classes', path: '/classes' },
        { label: `${classItem.name} - ${classItem.section}` }
      ];
    } else {
      // Super Admin
      return [
        { label: 'User Management', path: '/user-management' },
        { label: 'Classes', path: '/classes' },
        { label: `${classItem.name} - ${classItem.section}` }
      ];
    }
  };

  const breadcrumbItems = getBreadcrumbItems();

  // Mock data for students and teacher
  const students = [
    { id: '1', name: 'Alice Johnson', rollNumber: '001', email: 'alice@school.com', phone: '+1234567890' },
    { id: '2', name: 'Bob Smith', rollNumber: '002', email: 'bob@school.com', phone: '+1234567891' },
    { id: '3', name: 'Charlie Brown', rollNumber: '003', email: 'charlie@school.com', phone: '+1234567892' },
    { id: '4', name: 'Diana Prince', rollNumber: '004', email: 'diana@school.com', phone: '+1234567893' },
    { id: '5', name: 'Edward Norton', rollNumber: '005', email: 'edward@school.com', phone: '+1234567894' }
  ];

  const teacher = {
    id: '1',
    name: 'Jane Doe',
    subject: 'Mathematics',
    email: 'jane@school.com',
    phone: '+1234567895'
  };

  return (
    <MainLayout pageTitle={`${classItem.name} - ${classItem.section}`}>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {classItem.name} - {classItem.section}
            </h1>
            <p className="text-gray-600 mt-1">Academic Year: {classItem.academicYear}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Class Overview</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Students:</span>
                  <span className="font-semibold text-gray-800">{students.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Class Teacher:</span>
                  <span className="font-semibold text-gray-800">{teacher.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subject:</span>
                  <span className="font-semibold text-gray-800">{teacher.subject}</span>
                </div>
              </div>
            </div>

            {/* Teacher Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Class Teacher</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-800">{teacher.name}</p>
                  <p className="text-sm text-gray-600">{teacher.subject}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{teacher.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Students</h2>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.rollNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {student.phone}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {students.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No students enrolled in this class yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ClassDetails;
