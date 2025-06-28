
import React from 'react';
import { User, Calendar, BookOpen, Award } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const stats = [
    {
      title: 'Attendance',
      value: '95%',
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      title: 'Assignments',
      value: '8/10',
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      title: 'Average Grade',
      value: 'A-',
      icon: Award,
      color: 'bg-purple-500'
    },
    {
      title: 'Profile',
      value: 'View',
      icon: User,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
        <div className="text-sm text-gray-500">
          Track your academic progress
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Assignments</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Math Homework - Chapter 5</p>
                <p className="text-xs text-red-600">Due: Tomorrow</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Science Project Report</p>
                <p className="text-xs text-yellow-600">Due: Next Friday</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Recent Grades</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Mathematics</p>
                  <p className="text-xs text-gray-600">Quiz 3</p>
                </div>
                <span className="text-green-600 font-semibold">A</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Science</p>
                  <p className="text-xs text-gray-600">Lab Report</p>
                </div>
                <span className="text-blue-600 font-semibold">B+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
