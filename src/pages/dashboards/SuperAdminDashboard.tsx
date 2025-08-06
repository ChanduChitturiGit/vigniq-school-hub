
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  School, 
  Users, 
  Shield, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  UserCheck,
  Settings,
  BarChart3
} from 'lucide-react';

const SuperAdminDashboard: React.FC = () => {
  // Mock data for demonstration
  const stats = {
    totalSchools: 25,
    totalUsers: 2450,
    totalAdmins: 35,
    activeSchools: 23,
    pendingRequests: 8,
    completedRequests: 156,
    inProgressRequests: 12
  };

  const recentActivities = [
    {
      id: 1,
      type: 'school_created',
      message: 'New school "Sunrise Academy" has been created',
      timestamp: '2 hours ago',
      icon: School,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'admin_assigned',
      message: 'Admin Sarah Johnson assigned to Greenwood High',
      timestamp: '4 hours ago',
      icon: UserCheck,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'request_completed',
      message: 'System upgrade request completed for Tech Valley School',
      timestamp: '6 hours ago',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 4,
      type: 'alert',
      message: 'High server load detected - Auto-scaling triggered',
      timestamp: '8 hours ago',
      icon: AlertCircle,
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage the entire system and monitor all activities</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/create-school"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
          >
            <School className="w-4 h-4" />
            Create School
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/schools" className="group">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Schools</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSchools}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                <School className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-600 font-medium">{stats.activeSchools} active</span>
              <span className="text-gray-500 ml-2">schools running</span>
            </div>
          </div>
        </Link>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+12%</span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>

        {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Admins</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAdmins}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-purple-600 font-medium">Active monitoring</span>
          </div>
        </div> */}

        <Link to="/admin-requests" className="group">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingRequests}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors duration-200">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-yellow-600 font-medium">Needs attention</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Request Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link to="/admin-requests" className="group">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors duration-200">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pending Requests</h3>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.pendingRequests}</p>
              </div>
            </div>
          </div>
        </Link>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">In Progress</h3>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgressRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.completedRequests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent System Activities</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                  <div className={`p-2 rounded-lg bg-gray-100`}>
                    <IconComponent className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity.message}</p>
                    <p className="text-gray-500 text-sm mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/create-school"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
            >
              <School className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
              <span className="font-medium text-gray-700 group-hover:text-blue-700">Create School</span>
            </Link>
            
            <Link
              to="/schools"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
            >
              <BarChart3 className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
              <span className="font-medium text-gray-700 group-hover:text-green-700">Manage Schools</span>
            </Link>
            
            <Link
              to="/admin-requests"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-200 group"
            >
              <AlertCircle className="w-5 h-5 text-gray-600 group-hover:text-yellow-600" />
              <span className="font-medium text-gray-700 group-hover:text-yellow-700">View Requests</span>
            </Link>
            
            <Link
              to="/profile"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
            >
              <Settings className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
              <span className="font-medium text-gray-700 group-hover:text-purple-700">System Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
