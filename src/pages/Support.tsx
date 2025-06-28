
import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';

const Support: React.FC = () => {
  const [formData, setFormData] = useState({
    issueType: '',
    section: '',
    description: '',
    expectedOutcome: '',
    userName: '',
    email: '',
    schoolName: ''
  });

  const breadcrumbItems = [
    { label: 'Support' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create help object
    const helpObject = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      status: 'Open'
    };
    
    // Save to localStorage
    const existingHelp = JSON.parse(localStorage.getItem('vigniq_help') || '[]');
    existingHelp.push(helpObject);
    localStorage.setItem('vigniq_help', JSON.stringify(existingHelp));
    
    console.log('Support request submitted:', helpObject);
    alert('Support request submitted successfully!');
    
    // Reset form
    setFormData({
      issueType: '',
      section: '',
      description: '',
      expectedOutcome: '',
      userName: '',
      email: '',
      schoolName: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <MainLayout pageTitle="Support">
      <div className="max-w-4xl mx-auto space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Support</h1>
          <p className="text-gray-600">Need help? Raise a query and we'll get back to you.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Raise a Query</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Name
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Name
              </label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                placeholder="Enter your school name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Type
                </label>
                <select
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select issue type</option>
                  <option value="Technical">Technical Issue</option>
                  <option value="Account">Account Issue</option>
                  <option value="Feature">Feature Request</option>
                  <option value="Bug">Bug Report</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Section
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select section</option>
                  <option value="Dashboard">Dashboard</option>
                  <option value="Schools">Schools</option>
                  <option value="Teachers">Teachers</option>
                  <option value="Students">Students</option>
                  <option value="Classes">Classes</option>
                  <option value="Login">Login/Authentication</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your issue in detail"
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Outcome
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
    </MainLayout>
  );
};

export default Support;
