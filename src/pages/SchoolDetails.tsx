
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { getSchools } from '../data/schools';
import { Edit, MapPin, Mail, Phone, Users, BookOpen, X } from 'lucide-react';

const SchoolDetails: React.FC = () => {
  const { id } = useParams();
  const schools = getSchools();
  const school = schools.find(s => s.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  if (!school) {
    return <MainLayout pageTitle="School Not Found"><div>School not found</div></MainLayout>;
  }

  const breadcrumbItems = [
    { label: 'User Management', path: '/user-management' },
    { label: 'Schools', path: '/schools' },
    { label: school.name }
  ];

  // Mock data for teachers and classes
  const teachers = [
    { id: '1', name: 'John Smith', subject: 'Mathematics', email: 'john@school.com', phone: '+1234567890' },
    { id: '2', name: 'Sarah Johnson', subject: 'English', email: 'sarah@school.com', phone: '+1234567891' },
    { id: '3', name: 'Mike Wilson', subject: 'Science', email: 'mike@school.com', phone: '+1234567892' }
  ];

  const classes = [
    { id: '1', name: 'Class 10', section: 'A', students: 25, teacher: 'John Smith' },
    { id: '2', name: 'Class 10', section: 'B', students: 28, teacher: 'Sarah Johnson' },
    { id: '3', name: 'Class 11', section: 'A', students: 22, teacher: 'Mike Wilson' }
  ];

  const TeacherModal = ({ teacher, onClose }: { teacher: any, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Teacher Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              defaultValue={teacher.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              defaultValue={teacher.subject}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              defaultValue={teacher.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              defaultValue={teacher.phone}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
              Save Changes
            </button>
            <button onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout pageTitle={`School Details - ${school.name}`}>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* School Details Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">School Information</h2>
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
                  defaultValue={school.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{school.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  defaultValue={school.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{school.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  defaultValue={school.phone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{school.phone}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              {isEditing ? (
                <textarea
                  defaultValue={school.address}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{school.address}</p>
              )}
            </div>
          </div>
          
          {isEditing && (
            <div className="flex gap-2 mt-6">
              <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
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
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Teachers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                onClick={() => setSelectedTeacher(teacher)}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="font-semibold text-gray-800">{teacher.name}</h3>
                <p className="text-sm text-gray-600">{teacher.subject}</p>
                <p className="text-sm text-gray-500">{teacher.email}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Classes Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((classItem) => (
              <Link
                key={classItem.id}
                to={`/class-details/${classItem.id}`}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{classItem.name} - {classItem.section}</h3>
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-sm text-gray-600">Students: {classItem.students}</p>
                <p className="text-sm text-gray-500">Teacher: {classItem.teacher}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {selectedTeacher && (
        <TeacherModal
          teacher={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
        />
      )}
    </MainLayout>
  );
};

export default SchoolDetails;
