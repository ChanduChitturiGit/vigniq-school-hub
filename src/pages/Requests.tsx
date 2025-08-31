
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { MessageSquare, CheckCircle, Clock, AlertCircle, Search, Calendar, CalendarIcon, MoreHorizontal, Paperclip, Eye, Download, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { format, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useNavigate } from 'react-router-dom';

interface SupportRequest {
  id: string;
  title: string;
  category: string;
  priority: string;
  description: string;
  expectedOutcome: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  attachments: Array<{
    name: string;
    size: number;
    type: string;
  }>;
  messages: Array<{
    sender: string;
    message: string;
    timestamp: string;
    attachments?: Array<{
      name: string;
      size: number;
    }>;
  }>;
}

const Requests: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<Date | undefined>(subMonths(new Date(), 3));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);

  const breadcrumbItems = [
    { label: 'Support Responses' }
  ];

  useEffect(() => {
    // Load requests from localStorage and add sample data
    const savedRequests = JSON.parse(localStorage.getItem('support_requests') || '[]');
    const sampleRequests: SupportRequest[] = [
      {
        id: 'VIGYS-1734567890',
        title: 'Unable to mark attendance for Class 8A',
        category: 'attendance',
        priority: 'High',
        description: 'I am experiencing issues when trying to mark attendance for Class 8A. The system shows an error message "Failed to save attendance" every time I try to submit.',
        expectedOutcome: 'Be able to mark attendance successfully without errors',
        status: 'Resolved',
        createdAt: 'Aug 28, 2025, 04:44 PM',
        updatedAt: 'Aug 30, 2025, 04:44 PM',
        attachments: [
          { name: 'attendance-error-screenshot.png', size: 1024, type: 'image/png' },
          { name: 'error-log-details.txt', size: 512, type: 'text/plain' }
        ],
        messages: [
          {
            sender: 'You',
            message: 'I am experiencing issues when trying to mark attendance for Class 8A. The system shows an error message "Failed to save attendance" every time I try to submit.',
            timestamp: 'Aug 28, 2025, 04:44 PM'
          },
          {
            sender: 'Support Team',
            message: 'Hello! Thank you for reaching out. I can see there was a server issue affecting attendance submission. Our technical team has resolved this issue. Could you please try marking attendance again and let me know if you still face any problems?',
            timestamp: 'Aug 29, 2025, 04:44 PM',
            attachments: [
              { name: 'server-fix-documentation.pdf', size: 2048 },
              { name: 'troubleshooting-steps.docx', size: 1536 }
            ]
          },
          {
            sender: 'You',
            message: 'Great! It\'s working perfectly now. Thank you for the quick resolution.',
            timestamp: 'Aug 30, 2025, 04:44 PM',
            attachments: [
              { name: 'working-attendance-screenshot.png', size: 1024 }
            ]
          },
          {
            sender: 'Support Team',
            message: 'Wonderful! I\'m glad everything is working smoothly now. I\'ll mark this issue as resolved. Please don\'t hesitate to reach out if you need any further assistance.',
            timestamp: 'Aug 30, 2025, 04:44 PM'
          }
        ]
      },
      {
        id: 'VIGYS-1734567891',
        title: 'Request for grade export feature',
        category: 'feature',
        priority: 'Medium',
        description: 'It would be very helpful to have an option to export student grades to Excel format for easier sharing with parents and administration.',
        expectedOutcome: 'Add export functionality for student grades',
        status: 'In Progress',
        createdAt: 'Aug 31, 2025, 02:44 PM',
        attachments: [
          { name: 'grade-export-mockup.png', size: 2048, type: 'image/png' }
        ],
        messages: [
          {
            sender: 'You',
            message: 'It would be very helpful to have an option to export student grades to Excel format for easier sharing with parents and administration.',
            timestamp: 'Aug 31, 2025, 02:44 PM'
          }
        ]
      }
    ];

    setRequests([...sampleRequests, ...savedRequests]);
  }, []);

  const filteredAndSortedRequests = requests
    .filter(request => {
      const requestDate = parseISO(request.createdAt);
      
      const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || request.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesDateRange = (!fromDate || !toDate) || isWithinInterval(requestDate, { start: fromDate, end: toDate });
      
      return matchesSearch && matchesStatus && matchesDateRange;
    })
    .sort((a, b) => {
      return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Open':
      case 'In Progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Closed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Open':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateRange = () => {
    if (!fromDate || !toDate) return 'All time';
    return `${format(fromDate, 'MMM dd, yyyy')} - ${format(toDate, 'MMM dd, yyyy')}`;
  };

  const handleViewAttachments = (request: SupportRequest) => {
    setSelectedRequest(request);
    setShowAttachmentsModal(true);
  };

  const handleViewDetails = (requestId: string) => {
    navigate(`/support-details/${requestId}`);
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2);
  };

  const getNewMessageCount = (request: SupportRequest) => {
    // For demo purposes, showing 2 new messages for resolved requests
    return request.status === 'Resolved' ? 2 : 0;
  };

  return (
    <MainLayout pageTitle="Support Responses">
      <div className="space-y-6">
        {/* <Breadcrumb items={breadcrumbItems} /> */}
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Support Responses</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-4">
          {filteredAndSortedRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{request.title}</h3>
                    {getStatusIcon(request.status)}
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(request.priority)}`}>
                      {request.priority} Priority
                    </span>
                    <span className="text-blue-500 text-sm">{request.attachments.length} attachments</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>ID: {request.id}</span>
                    <span>Category: {request.category}</span>
                    <span>Created: {request.createdAt}</span>
                    {request.updatedAt && <span>Updated: {request.updatedAt}</span>}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700">{request.description}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MessageSquare className="w-4 h-4" />
                  <span>{request.messages.length} messages</span>
                  {getNewMessageCount(request) > 0 && (
                    <>
                      <span className="text-red-500 font-medium">{getNewMessageCount(request)} new</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewAttachments(request)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                  >
                    <Paperclip className="w-4 h-4" />
                    View Attachments
                  </button>
                  <button
                    onClick={() => handleViewDetails(request.id)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedRequests.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'You don\'t have any requests yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Attachments Modal */}
      <Dialog open={showAttachmentsModal} onOpenChange={setShowAttachmentsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attachments - {selectedRequest?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Initial Submission Attachments</h4>
              <div className="space-y-2">
                {selectedRequest?.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">{attachment.name}</div>
                        <div className="text-xs text-gray-500">{formatFileSize(attachment.size)} MB</div>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Message Attachments</h4>
              {selectedRequest?.messages.map((message, msgIndex) => 
                message.attachments?.map((attachment, attIndex) => (
                  <div key={`${msgIndex}-${attIndex}`} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        message.sender === 'You' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {message.sender}
                      </span>
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium">{attachment.name}</div>
                          <div className="text-xs text-gray-500">{formatFileSize(attachment.size)} MB</div>
                        </div>
                      </div>
                      <button className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Requests;
