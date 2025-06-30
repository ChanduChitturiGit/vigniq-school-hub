
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { MessageSquare, CheckCircle, Clock, AlertCircle, Search, Calendar, CalendarIcon, MoreHorizontal } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { format, subMonths, isWithinInterval, parseISO } from 'date-fns';

const Requests: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<Date | undefined>(subMonths(new Date(), 3));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Mock requests data based on user role
  const getRequestsData = () => {
    if (user?.role === 'Super Admin') {
      return [
        {
          id: '1',
          requestId: 'REQ-001',
          subject: 'New Teacher Addition Request',
          description: 'Need approval to add 3 new math teachers for the upcoming semester',
          requestedBy: 'Admin John Smith - Greenwood High School',
          requestDate: '2024-01-15',
          status: 'Pending',
          priority: 'High'
        },
        {
          id: '2',
          requestId: 'REQ-002',
          subject: 'Budget Approval Request',
          description: 'Requesting budget approval for new laboratory equipment',
          requestedBy: 'Admin Sarah Johnson - Oak Valley School',
          requestDate: '2024-01-14',
          status: 'In Review',
          priority: 'Medium'
        }
      ];
    } else if (user?.role === 'Admin') {
      return [
        {
          id: '1',
          requestId: 'REQ-001',
          subject: 'Class Schedule Change',
          description: 'Request to change math class timing from 10 AM to 2 PM',
          requestedBy: 'Teacher Alice Brown',
          requestDate: '2024-01-15',
          status: 'Pending',
          priority: 'Medium'
        },
        {
          id: '2',
          requestId: 'REQ-002',
          subject: 'Additional Resources',
          description: 'Need additional teaching materials for advanced mathematics',
          requestedBy: 'Teacher Robert Green',
          requestDate: '2024-01-14',
          status: 'Approved',
          priority: 'Low'
        }
      ];
    } else if (user?.role === 'Teacher') {
      return [
        {
          id: '1',
          requestId: 'REQ-001',
          subject: 'Grade Review Request',
          description: 'Student requesting review of final exam grade',
          requestedBy: 'Student Alice Johnson',
          requestDate: '2024-01-15',
          status: 'Pending',
          priority: 'Medium'
        },
        {
          id: '2',
          requestId: 'REQ-002',
          subject: 'Assignment Extension',
          description: 'Request for 2-day extension on math assignment due to illness',
          requestedBy: 'Student Bob Wilson',
          requestDate: '2024-01-14',
          status: 'Approved',
          priority: 'Low'
        }
      ];
    } else {
      return [
        {
          id: '1',
          requestId: 'REQ-001',
          subject: 'Grade Correction Request',
          description: 'My grade for the final exam seems incorrect. Please review.',
          requestedBy: 'You',
          requestDate: '2024-01-15',
          status: 'Pending',
          priority: 'High'
        },
        {
          id: '2',
          requestId: 'REQ-002',
          subject: 'Class Transfer Request',
          description: 'Request to transfer from Section A to Section B',
          requestedBy: 'You',
          requestDate: '2024-01-14',
          status: 'In Review',
          priority: 'Medium'
        }
      ];
    }
  };

  const requests = getRequestsData();

  const filteredAndSortedRequests = requests
    .filter(request => {
      const requestDate = parseISO(request.requestDate);
      
      const matchesSearch = request.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || request.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesDateRange = (!fromDate || !toDate) || isWithinInterval(requestDate, { start: fromDate, end: toDate });
      
      return matchesSearch && matchesStatus && matchesDateRange;
    })
    .sort((a, b) => {
      // Sort by date, latest first
      return parseISO(b.requestDate).getTime() - parseISO(a.requestDate).getTime();
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Pending':
      case 'In Review':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
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
    { label: 'Requests' }
  ];

  return (
    <MainLayout pageTitle="Requests">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Requests</h1>
          <div className="ml-auto text-sm text-gray-500">
            {filteredAndSortedRequests.length} total requests
          </div>
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Time Period Display - Always Visible */}
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              {formatDateRange()}
            </span>
          </div>

          {/* Desktop Filters */}
          <div className="hidden sm:flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  From Date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  className="rounded-md border pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  To Date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  className="rounded-md border pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="in review">In Review</option>
              <option value="rejected">Rejected</option>
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
                    <label className="text-sm font-medium mb-2 block">From Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fromDate ? format(fromDate, 'PPP') : 'Select From Date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={fromDate}
                          onSelect={setFromDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">To Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {toDate ? format(toDate, 'PPP') : 'Select To Date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={toDate}
                          onSelect={setToDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="in review">In Review</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAndSortedRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{request.subject}</h3>
                    {getStatusIcon(request.status)}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">Request ID: {request.requestId}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    {request.status}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700">{request.description}</p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                  <span className="font-medium">Requested by:</span> {request.requestedBy}
                </div>
                <div>
                  <span className="font-medium">Date:</span> {format(parseISO(request.requestDate), 'MMM dd, yyyy')}
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
    </MainLayout>
  );
};

export default Requests;
