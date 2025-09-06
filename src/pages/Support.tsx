
import React, { useEffect, useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Upload, FileText } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { getIssueTypes, getAvailableModules, createTicket } from '../services/support'
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { Button } from '../components/ui/button';

const Support: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    requestTitle: '',
    category: '',
    priorityLevel: '',
    issueType: '',
    issue_type_id: null,
    related_section_id: null,
    detailedDescription: '',
    expectedOutcome: '',
    attachments: [] as File[]
    attachments: [] as File[]
  });
  const [issueTypes, setIssueTypes] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);

  const breadcrumbItems = [
    { label: 'Help & Support' }
    { label: 'Help & Support' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createTicketData();

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
      attachments: formData.attachments.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      })),
      messages: []
    };

    // Save to localStorage
    // const existingRequests = JSON.parse(localStorage.getItem('support_requests') || '[]');
    // existingRequests.push(supportRequest);
    // localStorage.setItem('support_requests', JSON.stringify(existingRequests));

  };


  const createTicketData = async () => {
    try {
      const payload = {
        school_id: userData.school_id,
        title: formData.requestTitle,
        issue_type_id: formData.issue_type_id,
        related_section_id: formData.related_section_id,
        issue_description: formData.detailedDescription,
        expected_outcome: formData.expectedOutcome,
        file_attachment: formData.attachments
      }
      const response = await createTicket(payload);
      if (response && response.message) {
        showSnackbar({
          title: "Success",
          description: `${response.message} ✅`,
          status: "success"
        });
        setFormData({
          requestTitle: '',
          category: '',
          priorityLevel: '',
          issue_type_id: null,
          related_section_id: null,
          issueType: '',
          detailedDescription: '',
          expectedOutcome: '',
          attachments: []
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

  const getIssueTypesData = async () => {
    try {
      const response = await getIssueTypes();
      if (response && response.data) {
        setIssueTypes(response.data);
      }
    } catch (error: any) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }


  const getAvailableModulesData = async () => {
    try {
      const response = await getAvailableModules();
      if (response && response.data) {
        setAvailableModules(response.data);
      }
    } catch (error: any) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }


  useEffect(() => {
    getIssueTypesData();
    getAvailableModulesData();
  }, [])

  const getIssueTypeId = (IssueName: string) => {
    const data = issueTypes.find((val: any) => (val.issue_type_name) == IssueName);
    const id = data?.issue_type_id ? data.issue_type_id : 0;
    return id;
  }

  const getAvailableModuleId = (section: string) => {
    const data = availableModules.find((val: any) => (val.related_section_name) == section);
    const id = data?.related_section_id ? data.related_section_id : 0;
    return id;
  }

  const handleIssueType = (value: string) => {
    setFormData(prev => ({
      ...prev,
      issueType: value,
      issue_type_id: getIssueTypeId(value)
    }));
    // setErrors(prev => ({ ...prev, class: '' }));
  };


  const handleAvailableModules = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value,
      related_section_id: getAvailableModuleId(value)
    }));
    // setErrors(prev => ({ ...prev, class: '' }));
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

  const handleCancel = () => {
    setFormData({
      requestTitle: '',
      category: '',
      priorityLevel: '',
      issue_type_id: null,
      related_section_id: null,
      issueType: '',
      detailedDescription: '',
      expectedOutcome: '',
      attachments: []
    });
  }

  return (
    <MainLayout pageTitle="Help & Support">
    <MainLayout pageTitle="Help & Support">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* <Breadcrumb items={breadcrumbItems} /> */}

        <div className="text-center">
          {/* <h1 className="text-2xl font-bold text-gray-800 mb-2">Help & Support</h1> */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sm:p-0 md:p-8 mt-8">
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
                <div>
                  <div>
                    <label className="flex iems-start text-sm font-medium text-gray-700 mb-2">
                      Request Title *
                    </label>
                    <input
                      type="text"
                      name="requestTitle"
                      value={formData.requestTitle}
                      onChange={handleChange}
                      placeholder="Title that describes your issue for eg: reset-password issue"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-start text-sm font-medium text-gray-700 mb-2">
                      Issue Type *
                    </label>
                    <Select value={formData.issueType} onValueChange={handleIssueType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Issue Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {issueTypes.map((val, index) => (
                          <SelectItem key={val.issue_type_id} value={val.issue_type_name}>
                            {val.issue_type_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>} */}
                  </div>

                  <div>
                    <label className="flex iems-start text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <Select value={formData.category} onValueChange={handleAvailableModules}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Issue Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModules.map((val, index) => (
                          <SelectItem key={val.related_section_id} value={val.related_section_name}>
                            {val.related_section_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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

                <div className="flex flex-col md:flex-row justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Reset
                  </Button>
                  <button
                    type="submit"
                    className="mt-3 md:mt-0 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      !formData.requestTitle ||
                      !formData.issueType ||
                      !formData.category ||
                      !formData.detailedDescription ||
                      !formData.expectedOutcome
                    }
                  >
                    Submit Request
                  </button>

                </div>
              </form>
            </div>
          </div>
        </div>
      </div >
    </MainLayout >
  );
};

export default Support;