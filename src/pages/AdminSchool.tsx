
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Edit, MapPin, Mail, Phone, Users, GraduationCap, Calendar, X } from 'lucide-react';

const AdminSchool: React.FC = () => {
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  
  // Mock admin's school data
  const schoolData = {
    id: '1',
    name: 'Greenwood High School',
    address: '123 Education St, Knowledge City, KC 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@greenwoodhigh.edu',
    principal: 'Dr. Sarah Johnson',
    establishedYear: '1985',
    totalStudents: 450,
    totalTeachers: 32,
    totalClasses: 15
  };

  // Mock teachers data
  const teachers = [
    {
      id: '1',
      name: 'John Smith',
      subject: 'Mathematics',
      email: 'john.smith@greenwoodhigh.edu',
      phone: '+1 (555) 234-5678',
      experience: '8 years',
      qualification: 'M.Sc Mathematics',
      classes: ['Class 9-A', 'Class 10-B'],
      joiningDate: '2016-08-15'
    },
    {
      id: '2',
      name: 'Emily Johnson',
      subject: 'English Literature',
      email: 'emily.johnson@greenwoodhigh.edu',
      phone: '+1 (555) 345-6789',
      experience: '12 years',
      qualification: 'M.A English',
      classes: ['Class 8-A', 'Class 9-B'],
      joiningDate: '2012-07-20'
    },
    {
      id: '3',
      name: 'Michael Brown',
      subject: 'Science',
      email: 'michael.brown@greenwoodhigh.edu',
      phone: '+1 (555) 456-7890',
      experience: '6 years',
      qualification: 'M.Sc Physics',
      classes: ['Class 7-A', 'Class 8-B'],
      joiningDate: '2018-09-10'
    }
  ];

  // Mock classes data
  const classes = [
    {
      id: '1',
      name: 'Class 10',
      section: 'A',
      teacher: 'John Smith',
      students: 25,
      subject: 'Mathematics'
    },
    {
      id: '2',
      name: 'Class 9',
      section: 'B',
      teacher: 'Emily Johnson',
      students: 28,
      subject: 'English'
    },
    {
      id: '3',
      name: 'Class 8',
      section: 'A',
      teacher: 'Michael Brown',
      students: 22,
      subject: 'Science'
    }
  ];

  const breadcrumbItems = [
    { label: 'School Management', path: '/school-management' },
    { label: 'My School' }
  ];

  const TeacherModal = ({ teacher, onClose }: { teacher: any, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Teacher Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-semibold">{teacher.name.charAt(0)}</span>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800">{teacher.name}</h4>
              <p className="text-gray-600">{teacher.subject}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-gray-800 mb-3">Contact Information</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{teacher.phone}</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-3">Professional Details</h5>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Experience:</span>
                  <p className="text-sm">{teacher.experience}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Qualification:</span>
                  <p className="text-sm">{teacher.qualification}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Joining Date:</span>
                  <p className="text-sm">{new Date(teacher.joiningDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-gray-800 mb-3">Assigned Classes</h5>
            <div className="flex flex-wrap gap-2">
              {teacher.classes.map((cls: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {cls}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Edit Teacher
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout pageTitle="My School">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        {/* School Details Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{schoolData.name}</h1>
              <p className="text-gray-600">Established {schoolData.establishedYear}</p>
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit School
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">{schoolData.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-600">{schoolData.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-600">{schoolData.email}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Principal:</span> {schoolData.principal}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-600">Total Students</p>
              </div>
              <p className="text-2xl font-bold text-blue-800">{schoolData.totalStudents}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-600">Total Teachers</p>
              </div>
              <p className="text-2xl font-bold text-green-800">{schoolData.totalTeachers}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <p className="text-sm text-purple-600">Total Classes</p>
              </div>
              <p className="text-2xl font-bold text-purple-800">{schoolData.totalClasses}</p>
            </div>
          </div>
        </div>

        {/* Teachers Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Teachers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                onClick={() => setSelectedTeacher(teacher)}
                className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{teacher.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{teacher.name}</h3>
                    <p className="text-sm text-gray-600">{teacher.subject}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Experience: {teacher.experience}</p>
                  <p className="text-xs text-gray-500">Classes: {teacher.classes.length}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Classes Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <Link
                key={classItem.id}
                to={`/class-details/${classItem.id}`}
                className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">
                    {classItem.name} - {classItem.section}
                  </h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {classItem.students} students
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Teacher: {classItem.teacher}</p>
                  <p className="text-sm text-gray-600">Subject: {classItem.subject}</p>
                </div>
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

export default AdminSchool;
