
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Responses: React.FC = () => {
  const { user } = useAuth();

  // Mock responses data based on user role
  const getResponsesData = () => {
    const baseResponses = [
      {
        id: '1',
        requestId: 'REQ-001',
        subject: 'Technical Issue - Login Problem',
        message: 'Your login issue has been resolved. Please try logging in again with your credentials.',
        respondedBy: user?.role === 'Student' ? 'Teacher John Smith' : 
                    user?.role === 'Teacher' ? 'Admin Sarah Johnson' :
                    user?.role === 'Admin' ? 'Super Admin Mike Wilson' : 'Developer Team',
        responseDate: '2024-01-15',
        status: 'Resolved',
        priority: 'High'
      },
      {
        id: '2',
        requestId: 'REQ-002',
        subject: 'Class Schedule Update Request',
        message: 'We have reviewed your request and the schedule has been updated as requested.',
        respondedBy: user?.role === 'Student' ? 'Teacher Alice Brown' : 
                    user?.role === 'Teacher' ? 'Admin David Lee' :
                    user?.role === 'Admin' ? 'Super Admin Lisa White' : 'Developer Team',
        responseDate: '2024-01-14',
        status: 'Completed',
        priority: 'Medium'
      },
      {
        id: '3',
        requestId: 'REQ-003',
        subject: 'Grade Correction Request',
        message: 'Your grade has been reviewed and corrected. Please check your updated grade sheet.',
        respondedBy: user?.role === 'Student' ? 'Teacher Robert Green' : 
                    user?.role === 'Teacher' ? 'Admin Maria Garcia' :
                    user?.role === 'Admin' ? 'Super Admin Tom Anderson' : 'Developer Team',
        responseDate: '2024-01-13',
        status: 'Resolved',
        priority: 'Low'
      }
    ];

    return baseResponses;
  };

  const responses = getResponsesData();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const breadcrumbItems = [
    { label: 'Responses' }
  ];

  return (
    <MainLayout pageTitle="Responses">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Responses</h1>
        </div>

        <div className="space-y-4">
          {responses.map((response) => (
            <div
              key={response.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{response.subject}</h3>
                    {getStatusIcon(response.status)}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">Request ID: {response.requestId}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(response.priority)}`}>
                    {response.priority}
                  </span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {response.status}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700">{response.message}</p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                  <span className="font-medium">Responded by:</span> {response.respondedBy}
                </div>
                <div>
                  <span className="font-medium">Date:</span> {response.responseDate}
                </div>
              </div>
            </div>
          ))}
        </div>

        {responses.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
            <p className="text-gray-500">You don't have any responses to your requests yet.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Responses;
