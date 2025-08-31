
import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Upload, FileText } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Support: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    requestTitle: '',
    category: '',
    priorityLevel: '',
    detailedDescription: '',
    expectedOutcome: '',
    attachments: [] as File[]
  });

  const breadcrumbItems = [
    { label: 'Help & Support' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create support request object
    const supportRequest = {
      id: `VIGYS-${Date.now()}`,
      title: formData.requestTitle,
      category: formData.category,
      priority: formData.priorityLevel,
      description: formData.detailedDescription,
      expectedOutcome: formData.expectedOutcome,
      status: 'Open',
      createdAt: new Date().toISOString(),
      attachments: formData.attachments.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      })),
      messages: []
    };
    
    // Save to localStorage
    const existingRequests = JSON.parse(localStorage.getItem('support_requests') || '[]');
    existingRequests.push(supportRequest);
    localStorage.setItem('support_requests', JSON.stringify(existingRequests));
    
    toast({
      title: "Support Request Submitted",
      description: "Your request has been submitted successfully. We'll get back to you shortly.",
    });
    
    // Reset form
    setFormData({
      requestTitle: '',
      category: '',
      priorityLevel: '',
      detailedDescription: '',
      expectedOutcome: '',
      attachments: []
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({
      ...formData,
      attachments: [...formData.attachments, ...files]
    });
  };

  const removeFile = (index: number) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      attachments: newAttachments
    });
  };

  return (
    <MainLayout pageTitle="Help & Support">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* <Breadcrumb items={breadcrumbItems} /> */}
        
        <div className="text-center">
          {/* <h1 className="text-2xl font-bold text-gray-800 mb-2">Help & Support</h1> */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mt-8">
            {/* <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Support Center</h2>
              <p className="text-gray-600">Submit your questions, issues, or feature requests. Our support team will get back to you shortly.</p>
            </div> */}

            <div className=" rounded-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-800">Create Support Request</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex iems-start text-sm font-medium text-gray-700 mb-2">
                      Request Title *
                    </label>
                    <input
                      type="text"
                      name="requestTitle"
                      value={formData.requestTitle}
                      onChange={handleChange}
                      placeholder="Brief description of your issue"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="flex iems-start text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="attendance">Attendance</option>
                      <option value="feature">Feature Request</option>
                      <option value="technical">Technical Issue</option>
                      <option value="account">Account Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex iems-start text-sm font-medium text-gray-700 mb-2">
                    Priority Level *
                  </label>
                  <select
                    name="priorityLevel"
                    value={formData.priorityLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="flex iems-start text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    name="detailedDescription"
                    value={formData.detailedDescription}
                    onChange={handleChange}
                    placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="flex iems-start text-sm font-medium text-gray-700 mb-2">
                    Expected Outcome *
                  </label>
                  <textarea
                    name="expectedOutcome"
                    value={formData.expectedOutcome}
                    onChange={handleChange}
                    placeholder="What outcome are you expecting?"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="flex iems-start text-sm font-medium text-gray-700 mb-2">
                    Attachments (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drop files here or click to upload</p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
                    >
                      Choose Files
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Max file size: 10MB. Supported formats: JPG, PNG, PDF, DOC, TXT</p>
                  </div>
                  
                  {formData.attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Support;
