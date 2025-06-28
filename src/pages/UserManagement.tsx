
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { School, Users, GraduationCap, BookOpen } from 'lucide-react';

const UserManagement: React.FC = () => {
  const { user } = useAuth();

  const getSuperAdminOptions = () => [
    {
      title: 'Schools',
      description: 'Manage all schools in the system',
      icon: School,
      link: '/schools',
      color: 'bg-blue-500'
    },
    {
      title: 'Create School',
      description: 'Add new schools to the system',
      icon: School,
      link: '/create-school',
      color: 'bg-green-500'
    }
  ];

  const getAdminOptions = () => [
    {
      title: 'Classes',
      description: 'Manage classes and sections',
      icon: BookOpen,
      link: '/classes',
      color: 'bg-blue-500'
    },
    {
      title: 'Teachers',
      description: 'Manage teacher accounts and assignments',
      icon: Users,
      link: '/teachers',
      color: 'bg-green-500'
    },
    {
      title: 'Students',
      description: 'Manage student accounts and profiles',
      icon: GraduationCap,
      link: '/students',
      color: 'bg-purple-500'
    }
  ];

  const getTeacherOptions = () => [
    {
      title: 'Classes',
      description: 'View assigned classes',
      icon: BookOpen,
      link: '/classes',
      color: 'bg-blue-500'
    },
    {
      title: 'Students',
      description: 'Manage students in your classes',
      icon: GraduationCap,
      link: '/students',
      color: 'bg-purple-500'
    }
  ];

  const getOptions = () => {
    switch (user?.role) {
      case 'Super Admin':
        return getSuperAdminOptions();
      case 'Admin':
        return getAdminOptions();
      case 'Teacher':
        return getTeacherOptions();
      default:
        return [];
    }
  };

  const options = getOptions();

  const breadcrumbItems = [
    { label: 'User Management' }
  ];

  return (
    <MainLayout pageTitle="User Management">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <div className="text-sm text-gray-500">
            Manage users and system components
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((option, index) => {
            const Icon = option.icon;
            return (
              <Link
                key={index}
                to={option.link}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${option.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default UserManagement;
