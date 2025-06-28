
import React from 'react';
import { School, Users, TrendingUp, Activity } from 'lucide-react';
import { getSchools } from '../../data/schools';

const SuperAdminDashboard: React.FC = () => {
  const schools = getSchools();

  const stats = [
    {
      title: 'Total Schools',
      value: schools.length,
      icon: School,
      color: 'bg-blue-500',
      change: '+2 this month'
    },
    {
      title: 'Total Students',
      value: '1,250',
      icon: Users,
      color: 'bg-green-500',
      change: '+15% from last month'
    },
    {
      title: 'Active Teachers',
      value: '89',
      icon: Activity,
      color: 'bg-purple-500',
      change: '+5 this month'
    },
    {
      title: 'System Usage',
      value: '94.5%',
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+2.1% from last week'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Super Admin Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back, manage all schools and users from here
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
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schools Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Schools Overview</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="pb-3 text-sm font-medium text-gray-600">School Name</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Location</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Students</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Teachers</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schools.map((school) => (
                  <tr key={school.id}>
                    <td className="py-4 text-sm font-medium text-gray-900">{school.name}</td>
                    <td className="py-4 text-sm text-gray-600">{school.address}</td>
                    <td className="py-4 text-sm text-gray-600">450</td>
                    <td className="py-4 text-sm text-gray-600">32</td>
                    <td className="py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
