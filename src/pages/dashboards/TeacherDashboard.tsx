
import React from 'react';
import { BookOpen, Users, Clock, CheckCircle } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const stats = [
    {
      title: 'My Classes',
      value: '3',
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Students',
      value: '85',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Pending Requests',
      value: '7',
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Completed Today',
      value: '12',
      icon: CheckCircle,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
        <div className="text-sm text-gray-500">
          Manage your classes and students
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Recent Edit Requests</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-600">Class 10A - Profile Update</p>
                </div>
                <button className="text-blue-600 text-sm hover:text-blue-700">Review</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Jane Smith</p>
                  <p className="text-xs text-gray-600">Class 9B - Contact Info</p>
                </div>
                <button className="text-blue-600 text-sm hover:text-blue-700">Review</button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">My Classes</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Class 10A</p>
                  <p className="text-xs text-gray-600">30 students</p>
                </div>
                <button className="text-blue-600 text-sm hover:text-blue-700">Manage</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Class 9B</p>
                  <p className="text-xs text-gray-600">28 students</p>
                </div>
                <button className="text-blue-600 text-sm hover:text-blue-700">Manage</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
