
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Edit, Plus, Mail, Phone, Search, Users as UsersIcon } from 'lucide-react';
import {getTeachersBySchoolId} from '../services/teacher';

const Teachers: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers,setTeachers] = useState([]);
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));

  // Mock teacher data
  const sampleData =  [
    {
      teacher_id: '1',
      teacher_first_name: 'Jane Doe',
      teacher_last_name : 'K',
      email: 'jane.doe@greenwood.edu',
      phone: '+91 98765 43210',
      subject: 'Mathematics',
      classes: ['Class 10-A', 'Class 9-B'],
      status: 'Active'
    },
    {
      teacher_id: '2',
      teacher_first_name: 'John Smith',
      teacher_last_name : 'K',
      email: 'john.smith@greenwood.edu',
      phone: '+91 98765 43211',
      subject: 'English',
      classes: ['Class 8-A', 'Class 7-B'],
      status: 'Active'
    },
    {
      teacher_id: '3',
      teacher_first_name: 'Sarah Wilson',
      teacher_last_name : 'K',
      email: 'sarah.wilson@greenwood.edu',
      phone: '+91 98765 43212',
      subject: 'Science',
      classes: ['Class 9-A', 'Class 8-B'],
      status: 'Active'
    }
  ];
  
  const getTeachersList = async () => {
    const response = await getTeachersBySchoolId(userData.school_id);
    if(response && response.teachers){
      setTeachers(response.teachers);
      // filteredTeachers = teachers;
      console.log("teachers",teachers,filteredTeachers);
    }
  }

  useEffect(() => {
      getTeachersList();
    }, []);

  let filteredTeachers = searchTerm.length>0 ? teachers.filter(teacher =>
    (teacher.teacher_first_name && teacher.teacher_first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    ( teacher.teacher_last_name && teacher.teacher_last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    ( teacher.subject && teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (  teacher.email && teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) )
  ) : teachers;

  const breadcrumbItems = user?.role === 'admin' 
    ? [
        { label: 'School Management', path: '/admin-school' },
        { label: 'Teachers' }
      ]
    : [
        { label: 'User Management', path: '/user-management' },
        { label: 'Teachers' }
      ];

  return (
    <MainLayout pageTitle="teachers">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
          </div>
          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <Link
              to={user?.role === 'admin' ? "/admin-add-teacher" : "/add-teacher"}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Teacher
            </Link>
          )}
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search teachers by name, subject or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <Link
              key={teacher.teacher_id}
              to={`/teacher-details/${teacher.teacher_id}`}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {teacher.teacher_first_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{teacher.teacher_first_name + " "+teacher.teacher_last_name }</h3>
                    <p className="text-sm text-gray-500">{teacher.subject}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{teacher.email}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{teacher.phone_number}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Classes:</p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.classes && teacher.classes.map((className, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {className}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {teacher.status || 'Active'}
                </span>
              </div>
            </Link>
          ))}
          {/* {filteredTeachers.length == 0 && (
              <div>
                No teachers found yet. You can add a new teacher by clicking the 'Add Teacher' button.
              </div>
            )} */}
        </div>
        {filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Teachers found</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'No teachers have been added yet.'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Teachers;
