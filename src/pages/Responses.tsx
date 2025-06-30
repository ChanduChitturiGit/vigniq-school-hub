
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { MessageSquare, CheckCircle, Clock, AlertCircle, Search, Calendar, CalendarIcon, MoreHorizontal } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { format, subMonths, isWithinInterval } from 'date-fns';

const Responses: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<Date | undefined>(subMonths(new Date(), 3));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [showMoreFilters, setShowMoreFilters] = useState(false);

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

  const filteredResponses = responses.filter(response => {
    const responseDate = new Date(response.responseDate);
    
    const matchesSearch = response.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.respondedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || response.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDateRange = (!fromDate || !toDate) || isWithinInterval(responseDate, { start: fromDate, end: toDate });
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

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

  const formatDateRange = () => {
    if (!fromDate || !toDate) return 'All time';
    return `${format(fromDate, 'MMM dd, yyyy')} - ${format(toDate, 'MMM dd, yyyy')}`;
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
          <div className="ml-auto text-sm text-gray-500">
            {filteredResponses.length} total responses
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search responses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Time Period Display - Always Visible */}
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {formatDateRange()}
            </span>
          </div>

          {/* Desktop Filters */}
          <div className="hidden sm:flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Date Range
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium">From Date</label>
                    <CalendarComponent
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      className="rounded-md border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">To Date</label>
                    <CalendarComponent
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      className="rounded-md border"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="resolved">Resolved</option>
              <option value="completed">Completed</option>
              <option value="in progress">In Progress</option>
            </select>
          </div>

          {/* Mobile More Options */}
          <div className="sm:hidden">
            <Popover open={showMoreFilters} onOpenChange={setShowMoreFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                  More
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <div className="space-y-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {fromDate ? format(fromDate, 'PPP') : 'From Date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={fromDate}
                            onSelect={setFromDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {toDate ? format(toDate, 'PPP') : 'To Date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={toDate}
                            onSelect={setToDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="resolved">Resolved</option>
                      <option value="completed">Completed</option>
                      <option value="in progress">In Progress</option>
                    </select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-4">
          {filteredResponses.map((response) => (
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

        {filteredResponses.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No responses found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'You don\'t have any responses to your requests yet.'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Responses;
