
import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { X, Calendar, User, Mail, School, GraduationCap } from 'lucide-react';

interface TeacherRequest {
  id: string;
  issueType: string;
  section: string;
  description: string;
  expectedOutcome: string;
  teacherName: string;
  email: string;
  subject: string;
  className: string;
  createdAt: string;
  status: string;
}

const AdminRequests: React.FC = () => {
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<TeacherRequest | null>(null);

  const breadcrumbItems = [
    { label: 'Requests' }
  ];

  useEffect(() => {
    // Mock teacher requests for the admin's school
    const mockRequests: TeacherRequest[] = [
      {
        id: '1',
        issueType: 'Technical Issue',
        section: 'Classroom Technology',
        description: 'The projector in classroom 201 is not working properly. Students cannot see the presentations clearly.',
        expectedOutcome: 'Repair or replace the projector to ensure smooth teaching.',
        teacherName: 'John Smith',
        email: 'john.smith@greenwoodhigh.edu',
        subject: 'Mathematics',
        className: 'Class 10-A',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Open'
      },
      {
        id: '2',
        issueType: 'Resource Request',
        section: 'Laboratory Equipment',
        description: 'Need additional science equipment for physics experiments. Current equipment is insufficient for all students.',
        expectedOutcome: 'Purchase new equipment to conduct practical sessions effectively.',
        teacherName: 'Michael Brown',
        email: 'michael.brown@greenwoodhigh.edu',
        subject: 'Physics',
        className: 'Class 9-B',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'In Progress'
      },
      {
        id: '3',
        issueType: 'Student Behavior',
        section: 'Classroom Management',
        description: 'Having difficulty managing disruptive behavior in class. Need guidance on effective strategies.',
        expectedOutcome: 'Receive training or support to improve classroom management skills.',
        teacherName: 'Emily Johnson',
        email: 'emily.johnson@greenwoodhigh.edu',
        subject: 'English Literature',
        className: 'Class 8-A',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Resolved'
      }
    ];
    setRequests(mockRequests);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const updateRequestStatus = (requestId: string, newStatus: string) => {
    const updatedRequests = requests.map(req => 
      req.id === requestId ? { ...req, status: newStatus } : req
    );
    setRequests(updatedRequests);
    
    if (selectedRequest && selectedRequest.id === requestId) {
      setSelectedRequest({ ...selectedRequest, status: newStatus });
    }
  };

  const RequestModal = ({ request, onClose }: { request: TeacherRequest, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Teacher Request Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Teacher Information */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-800 mb-3">Teacher Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Name:</span>
                <span className="text-sm font-medium">{request.teacherName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium">{request.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Subject:</span>
                <span className="text-sm font-medium">{request.subject}</span>
              </div>
              <div className="flex items-center gap-2">
                <School className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Class:</span>
                <span className="text-sm font-medium">{request.className}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Created:</span>
                <span className="text-sm font-medium">{formatDate(request.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Issue Information */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-800 mb-3">Issue Information</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Issue Type:</span>
                <p className="text-sm mt-1">{request.issueType}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Related Section:</span>
                <p className="text-sm mt-1">{request.section}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Description:</span>
                <p className="text-sm mt-1 bg-gray-50 p-3 rounded-lg">{request.description}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Expected Outcome:</span>
                <p className="text-sm mt-1 bg-gray-50 p-3 rounded-lg">{request.expectedOutcome}</p>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Status Management</h4>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">Current Status:</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                {request.status}
              </span>
            </div>
            <div className="flex gap-2 mt-4">
              {['Open', 'In Progress', 'Resolved', 'Closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateRequestStatus(request.id, status)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    request.status === status
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout pageTitle="Teacher Requests">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Teacher Requests</h1>
          <div className="text-sm text-gray-500">
            Total Requests: {requests.length}
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No teacher requests found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{request.issueType}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{request.teacherName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{request.subject} - {request.className}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{formatDate(request.createdAt)}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRequest && (
        <RequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </MainLayout>
  );
};

export default AdminRequests;
