
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { ArrowLeft, Send, Paperclip, Download, FileText, Upload, Eye, AlertCircle, CheckCircle, Clock, Save, Edit } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { getTicketById, respondToTicket, updateTicketStatus, markMessageAsRead } from '../services/support'
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format, subMonths, isWithinInterval, parseISO, isToday, isYesterday, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface SupportRequest {
    ticket_id: string;
    title: string;
    issue_type_name: string;
    related_section_name: string;
    priority: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
    user_name: string;
    responses: Array<{
        sender: string;
        responder_first_name?: string;
        responder_last_name?: string;
        is_responder_superuser?: boolean;
        message: string;
        created_at: string;
        file_attachment?: Array<{
            name: string;
            size: number;
        }>;
    }>;
}

const SupportDetails: React.FC = () => {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { showSnackbar } = useSnackbar();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [request, setRequest] = useState<SupportRequest | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);

    const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
    const [isEditing, setIsEditing] = useState(false);

    const [statusList, setStatusList] = useState([
        { id: "open", value: "Open" },
        { id: "in_progress", value: "In Progress" },
        { id: "resolved", value: "Resolved" },
        { id: "closed", value: "Closed" }
    ])

    const [formData, setFormData] = useState({
        ticket_id: null,
        status: '',
        status_name: ''
    });


    const getTicketData = async () => {
        //setLoader(true);
        try {
            let params = { ticket_id: requestId };
            const response = await getTicketById(params);
            console.log(response);
            if (response && response.data) {
                console.log(response.data);
                //setRequestsData(response.data);
                //setLoader(false);
                setRequest(response.data);
                setFormData((prev) => ({
                    ...prev,
                    status_name: getStatusName(response.data.status)
                }))
            }
        } catch (error) {
            //setLoader(false);
            showSnackbar({
                title: "⛔ Something went wrong ",
                description: "Please refresh and try again",
                status: "error"
            });
        }
    };

    useEffect(() => {
        // Load request data (sample data for now)
        // const sampleRequest: SupportRequest = {
        //     ticket_id: 'VIGYS-1734567890',
        //     title: 'Unable to mark attendance for Class 8A',
        //     issue_type_name: 'attendance',
        //     related_section_name: 'others',
        //     priority: 'High',
        //     status: 'Resolved',
        //     created_at: 'Aug 28, 2025, 04:44 PM',
        //     updated_at: 'Aug 28, 2025, 04:44 PM',
        //     user_name: 'bhanu g',
        //     description: 'I am experiencing issues when trying to mark attendance for Class 8A. The system shows an error message "Failed to save attendance" every time I try to submit.',
        //     responses: [
        //         {
        //             sender: 'You',
        //             message: 'I am experiencing issues when trying to mark attendance for Class 8A. The system shows an error message "Failed to save attendance" every time I try to submit.',
        //             created_at: 'Aug 28, 2025, 04:44 PM'
        //         },
        //         {
        //             sender: 'Support Team',
        //             message: 'Hello! Thank you for reaching out. I can see there was a server issue affecting attendance submission. Our technical team has resolved this issue. Could you please try marking attendance again and let me know if you still face any problems?',
        //             created_at: 'Aug 29, 2025, 04:44 PM',
        //             file_attachment: [
        //                 { name: 'server-fix-documentation.pdf', size: 2048 },
        //                 { name: 'troubleshooting-steps.docx', size: 1536 }
        //             ]
        //         },
        //         {
        //             sender: 'You',
        //             message: 'Great! It\'s working perfectly now. Thank you for the quick resolution.',
        //             created_at: 'Aug 30, 2025, 04:44 PM',
        //             file_attachment: [
        //                 { name: 'working-attendance-screenshot.png', size: 1024 }
        //             ]
        //         },
        //         {
        //             sender: 'Support Team',
        //             message: 'Wonderful! I\'m glad everything is working smoothly now. I\'ll mark this issue as resolved. Please don\'t hesitate to reach out if you need any further assistance.',
        //             created_at: 'Aug 30, 2025, 04:44 PM'
        //         }
        //     ]
        // };

        // setRequest(sampleRequest);

        getTicketData();
        markMessageAsReadData();
    }, [requestId]);

    useEffect(() => {
        scrollToBottom();
    }, [request?.responses]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
            case 'Closed':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

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

    const sendStatusUpdateMessage = (status) => {
        let message = '';
        switch (status) {
            case 'open':
                message = 'Your ticket has been re-opened and is now in our system. Our team will review it soon.';
                break;
            case 'in_progress':
                message = 'Good news! Your ticket is now in progress. Our team is actively working on it.';
                break;
            case 'resolved':
                message = 'Your ticket has been resolved. Please check and confirm if everything is working as expected.';
                break;
            case 'closed':
                message = 'Your ticket has been closed. Thank you for reaching out to us!';
                break;
            default:
                message = '';
        }
        const payload = {
            ticket_id: requestId,
            message: message,
            file_attachment: []
        }

        respondToTicketData(payload);

    }


    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() && attachments.length === 0) return;

        const newMsg = {
            sender: 'You',
            message: newMessage,
            created_at: new Date().toLocaleString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }),
            attachments: attachments.map(file => ({
                name: file.name,
                size: file.size
            }))
        };

        const payload = {
            ticket_id: requestId,
            message: newMessage,
            file_attachment: attachments
        }

        respondToTicketData(payload);

        if (request) {
            setRequest({
                ...request,
                responses: [...request.responses, newMsg]
            });
        }

        setNewMessage('');
        setAttachments([]);

        // toast({
        //     title: "Message sent",
        //     description: "Your message has been sent successfully.",
        // });
    };


    const respondToTicketData = async (payload) => {
        try {
            const response = await respondToTicket(payload);
            console.log('message', response);
            if (response && response.message) {
                // setRequest({
                //     ...request,
                //     responses: [...request.responses, response.data]
                // });
                // showSnackbar({
                //   title: "Success",
                //   description: `${response.message} ✅`,
                //   status: "success"
                // });
                // setFormData({
                //   requestTitle: '',
                //   category: '',
                //   priorityLevel: '',
                //   issue_type_id: null,
                //   related_section_id: null,
                //   issueType: '',
                //   detailedDescription: '',
                //   expectedOutcome: '',
                //   attachments: []
                // });
                getTicketData();
            }
        } catch (error) {
            showSnackbar({
                title: "⛔ Error",
                description: error?.response?.data?.error || "Something went wrong",
                status: "error"
            });
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachments([...attachments, ...files]);
    };

    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e as any);
        }
    };

    const getStatusId = (status: string) => {
        const data = statusList.find((val: any) => (val.value) == status);
        const id = data.id ? data.id : null;
        return id;
    }

    const getStatusName = (statusId) => {
        const data = statusList.find((val: any) => (val.id) == statusId);
        const name = data.value ? data.value : '';
        return name;
    }

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

    const handleStatusChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            status_name: value,
            status: getStatusId(value)
        }))
    }


    const UpdateStatusData = async () => {
        setIsEditing(false);
        formData.ticket_id = Number(requestId);
        try {
            const response = await updateTicketStatus(formData);
            if (response && response.message) {
                sendStatusUpdateMessage(formData.status);
                showSnackbar({
                    title: "Success",
                    description: `${response.message} ✅`,
                    status: "success"
                });
            } else {
                showSnackbar({
                    title: "⛔ Error",
                    description: "Something went wrong",
                    status: "error"
                });
            }
        } catch (error) {
            showSnackbar({
                title: "⛔ Error",
                description: error?.response?.data?.error || "Something went wrong",
                status: "error"
            });
        }
        getTicketData();
    }

    //markMessageAsRead
    const markMessageAsReadData = async () => {
        try {
            const response = await markMessageAsRead({ ticket_id: Number(requestId) });
            console.log("respomse", response);
            if (response && response.message) {
                // showSnackbar({
                //     title: "Success",
                //     description: `${response.message} ✅`,
                //     status: "success"
                // });
            } else {
                showSnackbar({
                    title: "⛔ Error",
                    description: "Something went wrong",
                    status: "error"
                });
            }
        } catch (error) {
            showSnackbar({
                title: "⛔ Error",
                description: error?.response?.data?.error || "Something went wrong",
                status: "error"
            });
        }
    }

    const formatChatDate = (date: Date | string) => {
        const d = typeof date === "string" ? new Date(date) : date;
        const now = new Date();

        const diffSeconds = differenceInSeconds(now, d);
        const diffMinutes = differenceInMinutes(now, d);
        const diffHours = differenceInHours(now, d);

        if (diffSeconds < 60) {
            return `${diffSeconds} seconds ago`;
        }
        if (diffMinutes < 60) {
            return `${diffMinutes} minutes ago`;
        }
        if (diffHours < 2) {
            return `${diffHours} hours ago`;
        }
        if (isToday(d)) {
            return `Today, ${format(d, "hh:mm a")}`;
        }
        if (isYesterday(d)) {
            return `Yesterday, ${format(d, "hh:mm a")}`;
        }
        return format(d, "dd-MM-yyyy, hh:mm a");
    };






    if (!request) {
        return (
            <MainLayout pageTitle="Support Details">bg-white rounded-lg shadow-sm border border-gray-200
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout pageTitle="Support Details">
            <div className="max-w-4xl mx-auto space-y-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 ">
                    <button
                        onClick={() => navigate('/requests')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Responses
                    </button>

                    {/* <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(request.priority)}`}>
                            {request.priority} Priority
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                        </span>
                    </div> */}
                </div>

                {/* Request Info */}
                <div className="mb-6 px-4 md:px-6 py-4 w-full flex flex-col md:flex-row sm:mb-4 md:mb-0 items-center justify-between  bg-white rounded-lg shadow-sm border border-gray-200">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-800 mb-2">{request.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="block text-sm font-medium text-gray-700 mb-2">ID: {request.ticket_id}</span>
                            <span className="block text-sm font-medium text-gray-700 mb-2">Category : {request.related_section_name}</span>
                            <span className="block text-sm font-medium text-gray-700 mb-2">Issue type : {request.issue_type_name}</span>
                        </div>
                    </div>

                    <div className='flex flex-wrap  mb-2 md:mb-0 mt-2 md:mt-0 gap-4'>
                        {!isEditing ? (
                            <div className='flex flex-wrap items-center gap-4'>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <span className={`px-3 py-3 text-xs font-medium rounded-full ${getStatusColor(formData.status_name)} flex gap-2`}>
                                    {getStatusIcon(request.status)}
                                    <span>{formData.status_name}</span>
                                </span>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <Select value={formData.status_name} onValueChange={handleStatusChange}>
                                    <SelectTrigger className="w-full px-4">
                                        <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusList.map((val, index) => (
                                            <SelectItem key={index} value={val.value}>
                                                {val.value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {(userData.role == 'superadmin') && (
                            <div className='flex flex-wrap'>
                                {
                                    isEditing && (
                                        <button
                                            onClick={UpdateStatusData}
                                            className="flex items-center gap-2 px-2 py-2 mx-4 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                            {'Save'}
                                        </button>
                                    )
                                }
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="flex items-center gap-2 px-2 py-2 mx-4 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    {isEditing ? 'Cancel' : 'Edit'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[38rem] flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {request.responses.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${(message.responder_first_name + message.responder_last_name) === (userData.first_name + userData.last_name) ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className='flex flex-col'>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs font-semibold 'text-gray-600'
                                            }`}>
                                            {(message.responder_first_name + message.responder_last_name) === (userData.first_name + userData.last_name) ? 'You' : `${message.responder_first_name} ${message.responder_last_name}`}
                                        </span>
                                        <span className={`text-xs 'text-gray-500'
                                            }`}>
                                            {formatChatDate(message.created_at)}
                                        </span>
                                    </div>
                                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${(message.responder_first_name + message.responder_last_name) === (userData.first_name + userData.last_name)
                                        ? 'bg-blue-100 text-gray-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        <p className="text-sm leading-relaxed">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {message.message}
                                            </ReactMarkdown>
                                        </p>

                                        {message.file_attachment && message.file_attachment.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {message.file_attachment.map((attachment, attIndex) => (
                                                    <div
                                                        key={attIndex}
                                                        className={`flex items-center justify-between p-2 rounded ${(message.responder_first_name + message.responder_last_name) === (userData.first_name + userData.last_name)
                                                            ? 'bg-blue-300 text-gray-800 bg-opacity-50'
                                                            : 'bg-white border'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="w-4 h-4" />
                                                            <span className="text-xs">{attachment?.name || `attachment ${attIndex + 1}`}</span>
                                                        </div>
                                                        <div className='ms-2'>
                                                            <button className="text-xs hover:underline mr-2"
                                                                onClick={() => {
                                                                    handleView(attachment, attIndex);
                                                                }}>
                                                                <Eye className="w-3 h-3" />
                                                            </button>
                                                            <button className="text-xs hover:underline"
                                                                onClick={() => {
                                                                    handleDownload(attachment, attIndex);
                                                                }}>
                                                                <Download className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="border-t p-4 bg-gray-50">
                        {attachments.length > 0 && (
                            <div className="mb-3 space-y-2">
                                {attachments.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm">{file.name}</span>
                                            <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                        </div>
                                        <button
                                            onClick={() => removeAttachment(index)}
                                            className="text-red-500 hover:text-red-700 text-xs"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSendMessage} className="flex flex-col md:flex-row items-start justify-between gap-2">
                            <div className="flex-1">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your message here..."
                                    className="w-full h-[3.5rem] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={2}
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    Press Shift+Enter for new line, Enter to send
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 mt-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    multiple
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <Paperclip className="w-4 h-4" />
                                </button>

                                <button
                                    type="submit"
                                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    disabled={!newMessage.trim() && attachments.length === 0}
                                >
                                    <Send className="w-4 h-4" />
                                    Send
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default SupportDetails;