
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import PasswordInput from '../components/ui/password-input';
import ClassSectionSubjectInput, { ClassSectionSubjectData } from '../components/ui/class-section-subject-input';
import { Plus } from 'lucide-react';
import {addTeacher} from '../services/teacher';

const AdminAddTeacher: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [teachingAssignments, setTeachingAssignments] = useState<ClassSectionSubjectData[]>([
    { class: '', section: '', subject: '' }
  ]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    user_name: '',
    email: '',
    phone_number: '',
    qualification: '',
    experience: '',
    address: '',
    joiningDate: '',
    emergency_contact: ''
  });

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My School', path: '/admin-school' },
    { label: 'Add Teacher' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssignmentChange = (index: number, data: ClassSectionSubjectData) => {
    const updatedAssignments = [...teachingAssignments];
    updatedAssignments[index] = data;
    setTeachingAssignments(updatedAssignments);
  };

  const addNewAssignment = () => {
    setTeachingAssignments([...teachingAssignments, { class: '', section: '', subject: '' }]);
  };

  const removeAssignment = (index: number) => {
    if (teachingAssignments.length > 1) {
      const updatedAssignments = teachingAssignments.filter((_, i) => i !== index);
      setTeachingAssignments(updatedAssignments);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.user_name || 
        !formData.email || !formData.phone_number || !formData.qualification || 
        !formData.joiningDate || !password) {
      alert('Please fill in all required fields including password');
      return;
    }
    
    // Filter valid assignments (all three fields must be filled) - now optional
    const validAssignments = teachingAssignments.filter(assignment => 
      assignment.class && assignment.section && assignment.subject
    );

    const teacherData = {
      ...formData,
      teachingAssignments: validAssignments,
      password: password
    };
    
    console.log('Adding teacher:', teacherData);

    const response = await addTeacher(teacherData);

    if(response){
      alert('Teacher added successfully!');
      navigate('/admin-school');
      //console.log("response",response);
    }
    
    // Simulate API call with success
    // setTimeout(() => {
    //   alert('Teacher added successfully!');
    //   navigate('/admin-school');
    // }, 500);
  };

  return (
    <MainLayout pageTitle="Add Teacher">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Teacher</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">user name *</label>
                <input
                  type="text"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter password"
                  required
                  showGenerator
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualification *</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., M.Sc Mathematics"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="e.g., 5 years"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date *</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                <input
                  type="tel"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Teaching Assignments (Optional)</label>
                <button
                  type="button"
                  onClick={addNewAssignment}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Assignment
                </button>
              </div>
              
              <div className="space-y-4">
                {teachingAssignments.map((assignment, index) => (
                  <ClassSectionSubjectInput
                    key={index}
                    data={assignment}
                    onChange={(data) => handleAssignmentChange(index, data)}
                    onRemove={() => removeAssignment(index)}
                    canRemove={teachingAssignments.length > 1}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Teacher
              </button>
              <button
                type="button"
                // onClick={() => navigate('/admin-school')}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminAddTeacher;
