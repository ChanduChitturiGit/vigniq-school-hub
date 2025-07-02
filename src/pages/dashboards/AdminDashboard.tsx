
import React from 'react';
import { Users, BookOpen, School, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSchools } from '../../data/schools';

const AdminDashboard: React.FC = () => {
  const schools = getSchools();
  const school = schools[0]; // Assuming admin manages first school

  const stats = [
    {
      title: 'Teachers',
      value: '9',
      icon: Users,
      color: 'bg-blue-500',
      change: '12% from last month',
      link: '/teachers'
    },
    {
      title: 'Classes',
      value: '5',
      icon: BookOpen,
      color: 'bg-green-500',
      change: '5% from last month',
      link: '/classes'
    },
    {
      title: 'My School',
      value: '1',
      icon: School,
      color: 'bg-purple-500',
      change: 'Manage school details',
      link: '/admin-school'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>

      {/* School Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-blue-600 mb-4">{school.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{school.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{school.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>{school.email}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-2">
                    {stat.change}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${stat.color}`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
