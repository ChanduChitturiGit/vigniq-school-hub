
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Clock, CheckCircle, XCircle, User, Calendar, Search, Filter } from 'lucide-react';

interface Request {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  requestedByRole: string;
  schoolName?: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

const Requests: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock requests data - in real app this would come from API
  const allRequests: Request[] = [
    {
      id: '1',
      title: 'New Teacher Addition Request',
      description: 'Request to add a new Mathematics teacher for Class 10',
      status: 'pending',
      requestedBy: 'John Smith',
      requestedByRole: 'Admin',
      schoolName: 'Greenwood High School',
      createdAt: '2024-01-15T10:30:00Z',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Infrastructure Upgrade',
      description: 'Request for laboratory equipment upgrade',
      status: 'approved',
      requestedBy: 'Sarah Wilson',
      requestedByRole: 'Admin',
      schoolName: 'Riverside Academy',
      createdAt: '2024-01-14T14:20:00Z',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Student Transfer Request',
      description: 'Request to transfer student to different section',
      status: 'pending',
      requestedBy: 'Mike Johnson',
      requestedByRole: 'Teacher',
      schoolName: 'Greenwood High School',
      createdAt: '2024-01-13T09:15:00Z',
      priority: 'low'
    }
  ];

  const filteredRequests = allRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    // Super Admin sees all requests, others see requests from their subordinates
    if (user?.role === 'Super Admin') {
      return matchesSearch && matchesStatus;
    }
    // Add logic for other roles as needed
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded";
    switch (priority) {
      case 'high':
        return `${baseClasses} bg-red-50 text-red-700 border border-red-200`;
      case 'medium':
        return `${baseClasses} bg-yellow-50 text-yellow-700 border border-yellow-200`;
      case 'low':
        return `${baseClasses} bg-blue-50 text-blue-700 border border-blue-200`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-700 border border-gray-200`;
    }
  };

  const breadcrumbItems = [
    { label: 'Help', path: '/support' },
    { label: 'Requests' }
  ];

  return (
    <MainLayout pageTitle="Requests">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            {user?.role === 'Super Admin' ? 'All Requests' : 'Requests'}
          </h1>
          <div className="text-sm text-gray-500">
            {filteredRequests.length} total requests
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(request.status)}
                    <h3 className="text-lg font-semibold text-gray-800">{request.title}</h3>
                    <span className={getPriorityBadge(request.priority)}>
                      {request.priority} priority
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{request.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{request.requestedBy} ({request.requestedByRole})</span>
                    </div>
                    {request.schoolName && (
                      <div className="flex items-center gap-1">
                        <span>•</span>
                        <span>{request.schoolName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className={getStatusBadge(request.status)}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                        Approve
                      </button>
                      <button className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-2">No requests found</div>
              <div className="text-sm text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No requests have been submitted yet'}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Requests;
