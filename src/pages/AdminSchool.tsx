
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Edit, Search, Plus, BookOpen, Users } from 'lucide-react';

const AdminSchool: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [classSearchTerm, setClassSearchTerm] = useState('');
  const [schoolData, setSchoolData] = useState({
    name: 'Greenwood High School',
    email: 'admin@greenwood.edu',
    phone: '+1 234-567-8900',
    address: '123 Education Street, Learning City, LC 12345'
  });

  // Mock data for admin's school
  const school = {
    id: '1',
    name: 'Greenwood High School',
    email: 'admin@greenwood.edu',
    phone: '+1 234-567-8900',
    address: '123 Education Street, Learning City, LC 12345'
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My School' }
  ];

  // Mock data for teachers and classes
  const teachers = [
    { id: '1', name: 'John Smith', subject: 'Mathematics', email: 'john@school.com', phone: '+1234567890' },
    { id: '2', name: 'Sarah Johnson', subject: 'English', email: 'sarah@school.com', phone: '+1234567891' },
    { id: '3', name: 'Mike Wilson', subject: 'Science', email: 'mike@school.com', phone: '+1234567892' },
    { id: '4', name: 'Emily Davis', subject: 'History', email: 'emily@school.com', phone: '+1234567893' },
    { id: '5', name: 'Robert Brown', subject: 'Geography', email: 'robert@school.com', phone: '+1234567894' },
    { id: '6', name: 'Lisa White', subject: 'Physics', email: 'lisa@school.com', phone: '+1234567895' },
    { id: '7', name: 'David Green', subject: 'Chemistry', email: 'david@school.com', phone: '+1234567896' }
  ];

  const classes = [
    { id: '1', name: 'Class 10', section: 'A', students: 25, teacher: 'John Smith' },
    { id: '2', name: 'Class 10', section: 'B', students: 28, teacher: 'Sarah Johnson' },
    { id: '3', name: 'Class 11', section: 'A', students: 22, teacher: 'Mike Wilson' },
    { id: '4', name: 'Class 11', section: 'B', students: 26, teacher: 'Emily Davis' },
    { id: '5', name: 'Class 12', section: 'A', students: 24, teacher: 'Robert Brown' },
    { id: '6', name: 'Class 12', section: 'B', students: 23, teacher: 'Lisa White' },
    { id: '7', name: 'Class 9', section: 'A', students: 30, teacher: 'David Green' }
  ];

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(teacherSearchTerm.toLowerCase())
  );

  const filteredClasses = classes.filter(classItem =>
    classItem.name.toLowerCase().includes(classSearchTerm.toLowerCase()) ||
    classItem.section.toLowerCase().includes(classSearchTerm.toLowerCase()) ||
    classItem.teacher.toLowerCase().includes(classSearchTerm.toLowerCase())
  );

  const handleSchoolInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSchoolData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSchool = () => {
    console.log('Saving school data:', schoolData);
    setIsEditing(false);
    alert('School information updated successfully!');
  };

  const handleTeacherClick = (teacherId: string) => {
    navigate(`/teacher-details/${teacherId}`);
  };

  const handleClassClick = (classId: string) => {
    // Pass state to indicate this navigation is from My School
    navigate(`/class-details/${classId}`, { state: { from: 'admin-school' } });
  };

  return (
    <MainLayout pageTitle={`My School - ${school.name}`}>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* School Details Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">School Information</h2>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={schoolData.name}
                  onChange={handleSchoolInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{schoolData.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={schoolData.email}
                  onChange={handleSchoolInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{schoolData.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={schoolData.phone}
                  onChange={handleSchoolInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{schoolData.phone}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={schoolData.address}
                  onChange={handleSchoolInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{schoolData.address}</p>
              )}
            </div>
          </div>
          
          {isEditing && (
            <div className="flex gap-2 mt-6">
              <button 
                onClick={handleSaveSchool}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Teachers Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Teachers</h2>
            </div>
            <Link
              to="/admin-add-teacher"
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Teacher
            </Link>
          </div>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search teachers by name or subject..."
                value={teacherSearchTerm}
                onChange={(e) => setTeacherSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeachers.slice(0, 6).map((teacher) => (
                <div
                  key={teacher.id}
                  onClick={() => handleTeacherClick(teacher.id)}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="font-semibold text-gray-800">{teacher.name}</h3>
                  <p className="text-sm text-gray-600">{teacher.subject}</p>
                  <p className="text-sm text-gray-500">{teacher.email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Classes Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Classes</h2>
            </div>
            <Link
              to="/add-class"
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Class
            </Link>
          </div>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search classes by name, section or teacher..."
                value={classSearchTerm}
                onChange={(e) => setClassSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClasses.slice(0, 6).map((classItem) => (
                <div
                  key={classItem.id}
                  onClick={() => handleClassClick(classItem.id)}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{classItem.name} - {classItem.section}</h3>
                    <BookOpen className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-600">Students: {classItem.students}</p>
                  <p className="text-sm text-gray-500">Teacher: {classItem.teacher}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminSchool;
