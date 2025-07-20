import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Edit, Search, Plus, X,GraduationCap } from 'lucide-react';
import {getClassesById} from '../services/class'

const ClassDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const [allStudents,setAllStudents] = useState([]);
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    email: '',
    phone: '',
    rollNo: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    admissionDate: ''
  });

  // Mock students data for this class
  const sampleAllStudents = [
    {
      id: '1',
      name: 'Alice Johnson',
      rollNumber: '001',
      email: 'alice.johnson@school.edu',
      parentName: 'Robert Johnson',
      phone: '+91 98765 43210',
      status: 'Active',
      dateOfBirth: '15/05/2008',
      address: '123 Main St, City'
    },
    {
      id: '2',
      name: 'Bob Wilson',
      rollNumber: '002',
      email: 'bob.wilson@school.edu',
      parentName: 'Sarah Wilson',
      phone: '+91 98765 43211',
      status: 'Active',
      dateOfBirth: '22/03/2008',
      address: '456 Oak Ave, City'
    },
    {
      id: '3',
      name: 'Charlie Brown',
      rollNumber: '003',
      email: 'charlie.brown@school.edu',
      parentName: 'David Brown',
      phone: '+91 98765 43212',
      status: 'Active',
      dateOfBirth: '10/07/2008',
      address: '789 Pine St, City'
    }
  ];

  // Mock class data
  const sampleClassData = {
    id: id,
    class_name: 'Class 10',
    section: 'A',
    academicYear: '2024-25',
    teacher_name: 'John Smith',
    studends_list: allStudents
  };
   const [classData,setClassData] = useState(sampleClassData);

  

  const getClass = async () => {
    const response = await getClassesById(Number(id),userData.school_id);
    if(response && response.class){
      setClassData(response.class);
      setAllStudents(response.class.studends_list);
    }
  }

  useEffect(()=>{
    getClass();
  },[])

  const filteredStudents = allStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.includes(searchTerm)
  );

  // Determine breadcrumb based on navigation context
  const getBreadcrumbItems = () => {
    // Check if we came from admin-school (My School) or from the regular classes page
    const referrer = document.referrer;
    const isFromAdminSchool = referrer.includes('/admin-school') || location.state?.from === 'admin-school';
    
    if (isFromAdminSchool) {
      return [
        { label: 'My School', path: '/admin-school' },
        { label: `${classData.class_name}-${classData.section}` }
      ];
    } else {
      return [
        { label: 'User Management', path: '/user-management' },
        { label: 'Schools', path: '/schools' },
        { label: 'School Details', path: '/school-details/1' },
        { label: `${classData.class_name}-${classData.section}` }
      ];
    }
  };

  const breadcrumbItems = getBreadcrumbItems();

  const handleStudentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewStudentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newStudentData.name || !newStudentData.rollNo || !newStudentData.dateOfBirth || 
        !newStudentData.gender || !newStudentData.parentName || !newStudentData.parentPhone || 
        !newStudentData.admissionDate) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Adding student to class:', newStudentData);
    
    // Simulate API call with success
    setTimeout(() => {
      alert('Student added successfully!');
      setShowAddStudentForm(false);
      setNewStudentData({
        name: '',
        email: '',
        phone: '',
        rollNo: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        admissionDate: ''
      });
    }, 500);
  };

  return (
    <MainLayout pageTitle={`${classData.class_name}-${classData.section} Students`}>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Class Info Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {classData.class_name} - {classData.section}
              </h1>
              <p className="text-gray-600">{classData.academicYear}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Class Teacher</p>
              <p className="font-semibold text-gray-800">{classData.teacher_name || 'N/A'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-800">{classData.studends_list.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">Active Students</p>
              {/* {filteredStudents.filter(s => s.status === 'Active').length} */}
              <p className="text-2xl font-bold text-green-800">{classData.studends_list.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600">Academic Year</p>
              <p className="text-lg font-bold text-purple-800">{classData.academicYear || '2025-26'}</p>
            </div>
          </div>
        </div>

        {/* Search and Add Student */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={() => setShowAddStudentForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Link
              key={student.id}
              to={`/student-details/${student.id}`}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {student.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{student.name}</h3>
                    <p className="text-sm text-gray-500">Roll: {student.rollNumber}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // Handle edit action
                  }}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Parent:</span>
                  <span className="font-medium text-gray-800">{student.parentName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium text-gray-800">{student.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium text-gray-800 truncate">{student.email}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {student.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Students found</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'No students have been added yet.'}
            </p>
          </div>
        )}

        {/* Add Student Modal */}
        {showAddStudentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add New Student</h3>
                <button 
                  onClick={() => setShowAddStudentForm(false)} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddStudent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={newStudentData.name}
                      onChange={handleStudentInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={newStudentData.email}
                      onChange={handleStudentInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={newStudentData.phone}
                      onChange={handleStudentInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number *</label>
                    <input
                      type="text"
                      name="rollNo"
                      value={newStudentData.rollNo}
                      onChange={handleStudentInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={newStudentData.dateOfBirth}
                      onChange={handleStudentInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                    <select
                      name="gender"
                      value={newStudentData.gender}
                      onChange={handleStudentInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date *</label>
                    <input
                      type="date"
                      name="admissionDate"
                      value={newStudentData.admissionDate}
                      onChange={handleStudentInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian Name *</label>
                    <input
                      type="text"
                      name="parentName"
                      value={newStudentData.parentName}
                      onChange={handleStudentInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone *</label>
                    <input
                      type="tel"
                      name="parentPhone"
                      value={newStudentData.parentPhone}
                      onChange={handleStudentInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent Email</label>
                    <input
                      type="email"
                      name="parentEmail"
                      value={newStudentData.parentEmail}
                      onChange={handleStudentInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    name="address"
                    value={newStudentData.address}
                    onChange={handleStudentInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                  >
                    Add Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddStudentForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ClassDetails;
