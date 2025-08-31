
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { ArrowLeft, Send, Paperclip, Download, FileText, Upload } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface SupportRequest {
  id: string;
  title: string;
  category: string;
  priority: string;
  description: string;
  status: string;
  createdAt: string;
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

const SupportDetails: React.FC = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [request, setRequest] = useState<SupportRequest | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    // Load request data (sample data for now)
    const sampleRequest: SupportRequest = {
      id: 'VIGYS-1734567890',
      title: 'Unable to mark attendance for Class 8A',
      category: 'attendance',
      priority: 'High',
      status: 'Resolved',
      createdAt: 'Aug 28, 2025, 04:44 PM',
      description: 'I am experiencing issues when trying to mark attendance for Class 8A. The system shows an error message "Failed to save attendance" every time I try to submit.',
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
    };
    
    setRequest(sampleRequest);
  }, [requestId]);

  useEffect(() => {
    scrollToBottom();
  }, [request?.messages]);

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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() && attachments.length === 0) return;

    const newMsg = {
      sender: 'You',
      message: newMessage,
      timestamp: new Date().toLocaleString('en-US', {
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

    if (request) {
      setRequest({
        ...request,
        messages: [...request.messages, newMsg]
      });
    }

    setNewMessage('');
    setAttachments([]);
    
    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
    });
  };

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

  if (!request) {
    return (
      <MainLayout pageTitle="Support Details">
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/requests')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Responses
          </button>
          
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(request.priority)}`}>
              {request.priority} Priority
            </span>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>
        </div>

        {/* Request Info */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">{request.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>ID: {request.id}</span>
            <span>•</span>
            <span>{request.category}</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {request.messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.sender === 'You' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold ${
                      message.sender === 'You' ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {message.sender}
                    </span>
                    <span className={`text-xs ${
                      message.sender === 'You' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{message.message}</p>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.attachments.map((attachment, attIndex) => (
                        <div
                          key={attIndex}
                          className={`flex items-center justify-between p-2 rounded ${
                            message.sender === 'You' 
                              ? 'bg-blue-500 bg-opacity-50' 
                              : 'bg-white border'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-xs">{attachment.name}</span>
                          </div>
                          <button className="text-xs hover:underline">
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
            
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Press Shift+Enter for new line, Enter to send
                </div>
              </div>
              
              <div className="flex items-center gap-2">
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
