import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { MessageSquare, CheckCircle, Clock, AlertCircle, Search, Calendar, CalendarIcon, MoreHorizontal, Paperclip, Eye, Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { format, subMonths, isWithinInterval, parseISO, set, isToday, isYesterday } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { getSchoolsList } from '@/services/school';
import { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { getTickets, getTicketAttachments } from '../services/support'

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
  const { showSnackbar } = useSnackbar();
  const { user } = useAuth();
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<Date | undefined>(subMonths(new Date(), 3));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    school_id: null,
    school_name: '',
    from_date: '',
    to_date: '',
    status: '',
    status_name: '',
    page: 1
  });
  const [payload, setPayload] = useState({
    school_id: null,
    school_name: '',
    from_date: null,
    to_date: null,
    status: null,
    status_name: '',
    page: 1
  })
  const [schools, setSchools] = useState([]);
  const [statusList, setStatusList] = useState([
    { id: "open", value: "Open" },
    { id: "in_progress", value: "In Progress" },
    { id: "resolved", value: "Resolved" },
    { id: "closed", value: "Closed" }
  ])
  const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
  const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
  const [requestsData, setRequestsData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [ticketAtrtachments, setTicketAttachments] = useState([]);
  const [attachmentLoader, setAttachmentLoader] = useState(false);


  const breadcrumbItems = [
    { label: 'Support Responses' }
  ];

  const [page, setPage] = useState(1);


  const fetchSchools = async () => {
    //setLoader(true);
    try {
      const schoolsList = await getSchoolsList();
      if (schoolsList && schoolsList.schools) {
        // setLoader(false);
        setSchools(schoolsList.schools);
      }
    } catch (error) {
      // setLoader(false);
      showSnackbar({
        title: "⛔ Something went wrong ",
        description: "Please refresh and try again",
        status: "error"
      });
    }
  };

  //getTicketAttachments
  const getTicketAttachmentsData = async (ticket_id: string) => {
    try {
      setAttachmentLoader(true);
      const response = await getTicketAttachments({ ticket_id: Number(ticket_id) });
      if (response && response.data) {
        setTicketAttachments(response.data)
        setAttachmentLoader(false);
      }
    } catch (error) {
      setAttachmentLoader(false);
      showSnackbar({
        title: "⛔ Something went wrong ",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }

  const getTicketsData = async () => {
    try {
      if (!hasMore) return;
      setLoader(true);
      let params = {};
      if (payload.school_id || payload.status_name || (payload.from_date && payload.to_date) || payload.page || page) {
        params = Object.fromEntries(
          Object.entries({ ...payload, page }).filter(
            ([, value]) => value !== null && value !== ""
          )
        );
      }
      params = { ...params, page }
      const response = await getTickets(params);
      if (response && response.data) {
        if (page == 1) {
          setRequestsData(response.data);
        } else {
          setRequestsData((prev) => ([
            ...prev,
            ...response.data
          ]))
        }
        setLoader(false);
      }
      if (response && (response.data.length == 0)) {
        setLoader(false);
        setHasMore(false);
      }
    } catch (error) {
      setLoader(false);
      showSnackbar({
        title: "⛔ Something went wrong ",
        description: "Please refresh and try again",
        status: "error"
      });
    }
  };

  useEffect(() => {
    if (userData.role == 'superadmin') {
      fetchSchools();
    }
    // getTicketsData();
  }, []);

  useEffect(() => {
    setPage(1);
    getTicketsData();
  }, [payload])

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
      return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Resolved':
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

  const getStatusName = (statusId) => {
    const data = statusList.find((val: any) => (val.id) == statusId);
    const name = data.value ? data.value : '';
    return name;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'Resolved' || status === 'resolved') {
      return 'bg-green-100 text-green-800 py-2';
    } else if (status === 'In Progress' || status === 'in_progress') {
      return 'bg-yellow-100 text-yellow-800 py-2';
    } else if (status === 'Open' || status === 'open') {
      return 'bg-blue-100 text-blue-800 py-2';
    } else {
      return 'bg-gray-100 text-gray-800 py-2';
    }
  };

  const formatDateRange = () => {
    if (!fromDate || !toDate) return 'All time';
    return `${format(fromDate, 'MMM dd, yyyy')} - ${format(toDate, 'MMM dd, yyyy')}`;
  };

  const handleViewAttachments = (request: any) => {
    getTicketAttachmentsData(request.ticket_id);
    // setSelectedRequest(request);
    setShowAttachmentsModal(true);
  };

  useEffect(() => {
    if(showAttachmentsModal == false){
      setTicketAttachments([]);
    }
  }, [showAttachmentsModal]);

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

  const getSchoolId = (schoolName: string) => {
    const data = schools.find((val: any) => (val.school_name) == schoolName);
    const id = data.school_id ? data.school_id : null;
    return id;
  }

  const getStatusId = (status: string) => {
    const data = statusList.find((val: any) => (val.value) == status);
    const id = data.id ? data.id : null;
    return id;
  }

  const handleFilterChange = (field: string, value: string) => {
    setHasMore(true);
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    if (field == 'school_name') {
      setPayload(prev => ({
        ...prev,
        [field]: value,
        'school_id': getSchoolId(value)
      }));
    } else if (field == 'status_name') {
      setPayload(prev => ({
        ...prev,
        [field]: value,
        'status': getStatusId(value)
      }));
    } else {
      setPayload(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };



  const clearFilters = () => {
    setHasMore(true);
    setFilters({
      school_id: null,
      school_name: '',
      from_date: '',
      to_date: '',
      status: '',
      status_name: '',
      page: 1
    });
    setStartDate(null);
    setEndDate(null);
    setPayload({
      school_id: null,
      school_name: '',
      from_date: '',
      to_date: '',
      status: '',
      status_name: '',
      page: 1
    });
    setPage(1);
    //getEbookList(payload);
  };


  const handleScroll = () => {
    const container = scrollContainerRef.current;
    const isBottom =
      (container.scrollHeight - container.scrollTop) <= (container.clientHeight + (loader ? (-200) : 30)); //loader ? (-200) :
    //console.log('scrollScheck',(!container || loader || !hasMore || !isBottom));
    if (!container || loader || !hasMore || !isBottom) {
      return; // avoid multiple calls while loading
    } else {
      //console.log('scrolled');
      if (isBottom && hasMore && !loader) {
        setPage(prev => prev + 1);
      }
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (page > 1) {
      getTicketsData();
    }
  }, [page]);

  const formatChatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;

    if (isToday(d)) {
      return `Today, ${format(d, "hh:mm a")}`;
    }
    if (isYesterday(d)) {
      return `Yesterday, ${format(d, "hh:mm a")}`;
    }
    return format(d, "dd-MM-yyyy, hh:mm a");
  }

  const handleView = async (data: any, index: any) => {
    // setSelecteddata(data);
    const fileUrl = data;
    // window.open(fileUrl, "_blank");
    const res = await fetch(fileUrl);
    const blob = await res.blob();
    const file = URL.createObjectURL(blob);
    window.open(file, "_blank");

  };

  const handleDownload = async (data: any, index: any) => {
    // Simulate download
    try {
      const fileUrl = data;
      const res = await fetch(fileUrl);
      const blob = await res.blob();

      // Create a temporary download link
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;

      // Extract filename from the S3 path or use a default one
      const filename = `attachment${index + 1}` || "downloaded-file";
      a.download = filename;

      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      showSnackbar({
        title: "Success",
        description: `PDF downloaded succesfully ✅`,
        status: "success"
      });
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: `Something went wrong please try again!`,
        status: "error"
      });
    }
  };

  return (
    <MainLayout ref={scrollContainerRef} pageTitle="Support Responses">
      <div className="space-y-6">
        {/* <Breadcrumb items={breadcrumbItems} /> */}

        {/* <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Support Responses</h1>
        </div> */}

        {/* Search Bar */}
        {/* <div className="relative">
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
        </div> */}

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    className="date-div w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    label=""
                    value={startDate}
                    onChange={(newValue) => {
                      setStartDate(newValue);
                      filters.from_date = newValue ? newValue.format("YYYY-MM-DD") : null;
                      handleFilterChange('from_date', (newValue ? newValue.format("YYYY-MM-DD") : null));
                    }}
                    format="DD/MM/YYYY"
                  />
                </LocalizationProvider>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-3 md:mt-0">To Date</label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    className="date-div w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    label=""
                    value={endDate}
                    onChange={(newValue) => {
                      setEndDate(newValue);
                      filters.to_date = newValue ? newValue.format("YYYY-MM-DD") : null;
                      handleFilterChange('to_date', (newValue ? newValue.format("YYYY-MM-DD") : null));
                    }}
                    format="DD/MM/YYYY"
                    disabled={
                      !filters.from_date
                    }
                  />
                </LocalizationProvider>
              </div>

              {
                userData.role == 'superadmin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 mt-3 md:mt-0">School Name</label>
                    <Select value={filters.school_name} onValueChange={(value) => handleFilterChange('school_name', value)}>
                      <SelectTrigger className='h-[3.5rem]'>
                        <SelectValue placeholder="Select School" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.map((school, index) => (
                          <SelectItem key={index} value={school.school_name}>{school.school_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              }

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-3 md:mt-0">Status</label>
                <Select value={filters.status_name} onValueChange={(value) => handleFilterChange('status_name', value)}>
                  <SelectTrigger className='h-[3.5rem]'>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {statusList.map((val) => (
                      <SelectItem key={val.id} value={val.value}>{val.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>



            <div className="flex justify-end">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className=" grid grid-cols-1 2xl:grid-cols-2 gap-4">
          {requestsData && requestsData.length > 0 && requestsData?.map((request) => (
            <div
              key={request.ticket_id}
              className=" bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex gap-2 items-center p-2  rounded-lg">
                      <MessageSquare className="w-6 h-6  text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-800 max-w-[60vw] truncate" title={request.title}>{request.title}</h3>
                    </div>
                    <div className='flex flex-col md:flex-row items-center gap-3'>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)} flex gap-2`}>
                        {getStatusIcon(request.status)}
                        <span>{getStatusName(request.status)}</span>
                      </span>
                      {/* <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(request.priority)}`}>
                      {request.priority} Priority
                    </span> */}
                      <span className="text-blue-500 text-sm">{request?.attachments_count} attachments</span>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-500 mb-3">
                    {/* <span>ID: {request.id}</span> */}
                    {/* <span>Category: {request.category}</span> */}
                    <span>Created: {formatChatDate(request.created_at)}</span>
                    {request.updated_at && <span>Updated: {formatChatDate(request.updated_at)}</span>}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700">{request?.description}</p>
              </div>

              <div className="flex flex-col md:flex-row  items-center justify-between">
                <div className="flex  items-center gap-2 text-sm text-gray-500 ">
                  <div className='bg-gray-100 text-gray-800 border border-gray-200 px-3 py-1 rounded-lg flex items-center gap-1'>
                    <MessageSquare className="w-4 h-4" />
                    <span>{request?.total_responses} messages</span>
                  </div>
                  {request.new_messages_count > 0 && (
                    <div className='bg-red-100 text-red-800 border border-red-200 px-3 py-1 rounded-lg flex items-center gap-1'>
                      <span className="text-red-500 font-medium">{request.new_messages_count} new</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col md:flex-row mt-3 md:mt-0 items-center gap-2">
                  <button
                    onClick={() => handleViewAttachments(request)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                  >
                    <Paperclip className="w-4 h-4" />
                    View Attachments
                  </button>
                  <button
                    onClick={() => handleViewDetails(request.ticket_id)}
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

        {!loader && requestsData.length === 0 && (
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

        {loader && (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 mx-auto text-blue animate-spin" />
          </div>
        )}
      </div>

      {/* Attachments Modal */}
      <Dialog open={showAttachmentsModal} onOpenChange={setShowAttachmentsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attachments</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Initial Submission Attachments */}
            {ticketAtrtachments.filter(att => att.is_initial_submission).length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Initial Submission Attachments</h4>
                <div className="space-y-2">
                  {ticketAtrtachments
                    .filter(att => att.is_initial_submission)
                    .map((att, idx) =>
                      att.file_attachment.map((url, i) => (
                        <div key={`init-${att.response_id}-${i}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <div>
                              <div className="text-sm font-medium truncate max-w-[300px]">{decodeURIComponent(url.split('/').pop().split('?')[0])}</div>
                              <div className="text-xs text-gray-500">{formatChatDate(new Date(att.created_at))}</div>
                            </div>
                          </div>
                          <div className='ms-2 flex gap-1'>
                            <button className="text-xs hover:underline mr-2 flex items-center gap-1 px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                              onClick={() => {
                                handleView(url, att.attIndex);
                              }}>
                              <Eye className="w-3 h-3" />
                            </button>
                            <button className="text-xs hover:underline flex items-center gap-1 px-3 py-1 text-sm text-green-600 border border-green-200 rounded hover:bg-green-50"
                              onClick={() => {
                                handleDownload(url, att.attIndex);
                              }}>
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                </div>
              </div>
            )}

            {/* Message Attachments */}
            {ticketAtrtachments.filter(att => !att.is_initial_submission).length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Message Attachments</h4>
                {ticketAtrtachments
                  .filter(att => !att.is_initial_submission)
                  .map((att, idx) =>
                    att.file_attachment.map((url, i) => (
                      <div key={`msg-${att.response_id}-${i}`} className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${att.is_responder_superuser ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {att.is_responder_superuser ? 'VIGYS AI' : 'You'}
                          </span>
                          <span className="text-xs text-gray-500">{formatChatDate(new Date(att.created_at))}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <div>
                              <div className="text-sm font-medium truncate max-w-[300px]">{decodeURIComponent(url.split('/').pop().split('?')[0])}</div>
                              <div className="text-xs text-gray-500">{formatChatDate(new Date(att.created_at))}</div>
                            </div>
                          </div>
                          <div className='ms-2 flex gap-1'>
                            <button className="text-xs hover:underline mr-2 flex items-center gap-1 px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                              onClick={() => {
                                handleView(url, att.attIndex);
                              }}>
                              <Eye className="w-3 h-3" />
                            </button>
                            <button className="text-xs hover:underline flex items-center gap-1 px-3 py-1 text-sm text-green-600 border border-green-200 rounded hover:bg-green-50"
                              onClick={() => {
                                handleDownload(url, att.attIndex);
                              }}>
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
              </div>
            )}
            {/* If no attachments */}
            {ticketAtrtachments.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No attachments found for this ticket.
              </div>
            )}
          </div>
          {/* {attachmentLoader && (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 mx-auto text-blue animate-spin" />
            </div>
          )} */}
        </DialogContent>
      </Dialog>


     
    </MainLayout>
  );
};

export default Requests;