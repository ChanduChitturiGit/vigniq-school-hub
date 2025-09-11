import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Edit, Search, Plus, BookOpen, Users, LoaderCircle, ExternalLink, Expand, ArrowLeft } from 'lucide-react';
import { getSchoolById, editSchool } from '../services/school';
import { getTeachersBySchoolId } from '../services/teacher';
import { getClassesBySchoolId } from '../services/class';
import { useParams } from 'react-router-dom';
import { toast } from '../components/ui/sonner';
import { useSnackbar } from "../components/snackbar/SnackbarContext";

const AdminSchool: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [classSearchTerm, setClassSearchTerm] = useState('');
  const [teachers, setteachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classLoader, setClassLoader] = useState(true);
  const [teacherLoader, seteacherLoader] = useState(true);
  const [schoolData, setSchoolData] = useState({
    school_name: '',
    school_email: '',
    school_contact_number: '',
    school_address: ''
  });
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const { id } = useParams();
  const [breadcrumbItems, setBreadCrumbItems] = useState([
    { label: 'Home', path: '/dashboard' },
    { label: 'My School' }
  ]);
  const [showMore, setShowMore] = useState(false);



  // Mock data for admin's school
  const school = {
    id: '1',
    name: 'Greenwood High School',
    email: 'admin@greenwood.edu',
    phone: '+1 234-567-8900',
    address: '123 Education Street, Learning City, LC 12345'
  };



  const setBreadCrumb = () => {
    if (userData.role == 'superadmin') {
      setBreadCrumbItems([
        { label: 'Home', path: '/dashboard' },
        { label: 'Schools', path: '/schools' },
        { label: 'My School' }
      ])
    }
  }

  // Mock data for teachers and classes
  let sampleTeachers = [
    { id: '1', name: 'John Smith', subject: 'Mathematics', email: 'john@school.com', phone: '+1234567890' },
    { id: '2', name: 'Sarah Johnson', subject: 'English', email: 'sarah@school.com', phone: '+1234567891' },
    { id: '3', name: 'Mike Wilson', subject: 'Science', email: 'mike@school.com', phone: '+1234567892' },
    { id: '4', name: 'Emily Davis', subject: 'History', email: 'emily@school.com', phone: '+1234567893' },
    { id: '5', name: 'Robert Brown', subject: 'Geography', email: 'robert@school.com', phone: '+1234567894' },
    { id: '6', name: 'Lisa White', subject: 'Physics', email: 'lisa@school.com', phone: '+1234567895' },
    { id: '7', name: 'David Green', subject: 'Chemistry', email: 'david@school.com', phone: '+1234567896' }
  ];

  let sampleClasses = [
    { id: '1', name: 'Class 10', section: 'A', students: 25, teacher: 'John Smith' },
    { id: '2', name: 'Class 10', section: 'B', students: 28, teacher: 'Sarah Johnson' },
    { id: '3', name: 'Class 11', section: 'A', students: 22, teacher: 'Mike Wilson' },
    { id: '4', name: 'Class 11', section: 'B', students: 26, teacher: 'Emily Davis' },
    { id: '5', name: 'Class 12', section: 'A', students: 24, teacher: 'Robert Brown' },
    { id: '6', name: 'Class 12', section: 'B', students: 23, teacher: 'Lisa White' },
    { id: '7', name: 'Class 9', section: 'A', students: 30, teacher: 'David Green' }
  ];

  const schoolDataById = async () => {
    const schoolData = await getSchoolById(id ? id : userData.school_id);
    if (schoolData && schoolData.school) {
      setSchoolData(schoolData.school);
    }
  }

  const fetchSchools = async () => {
    //schools list api
    schoolDataById();

    //teachers list api
    seteacherLoader(true);
    const teachersData = await getTeachersBySchoolId(id ? id : userData.school_id);
    if (teachersData && teachersData.teachers) {
      seteacherLoader(false);
      setteachers(teachersData.teachers);
    }

    //classes list api
    setClassLoader(true);
    const classesData = await getClassesBySchoolId(id ? id : userData.school_id);
    if (classesData && classesData.classes) {
      setClassLoader(false);
      setClasses(classesData.classes);
    }

  };


  const setSchoolId = async () => {
    localStorage.setItem('current_school_id', id)
  }

  useEffect(() => {
    if (userData.role == 'superadmin') {
      setSchoolId();

    }
    setBreadCrumb();
    fetchSchools();
  }, []);


  const filteredTeachers = teachers.filter(teacher =>
    (teacher.teacher_first_name && teacher.teacher_first_name.toLowerCase().includes(teacherSearchTerm.toLowerCase())) ||
    (teacher.teacher_lastt_name && teacher.teacher_lastt_name.toLowerCase().includes(teacherSearchTerm.toLowerCase())) ||
    (teacher.subject && teacher.subject.toLowerCase().includes(teacherSearchTerm.toLowerCase()))
  );

  const filteredClasses = classes.filter(classItem =>
    (classItem.class_number && classItem.class_number.toString().toLowerCase().includes(classSearchTerm.toLowerCase())) ||
    (classItem.section && classItem.section.toLowerCase().includes(classSearchTerm.toLowerCase())) ||
    (classItem.class_number && classItem.section && ('Class ' + classItem.class_number + ' - ' + classItem.section).toLowerCase().includes(classSearchTerm.toLowerCase()))
  );

  const handleSchoolInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSchoolData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSchool = async () => {
    try {
      //edit school api.
      const response = await editSchool(schoolData);
      if (response && response.message) {
        setIsEditing(false);
        showSnackbar({
          title: "Success",
          description: "School information updated successfully ✅",
          status: "success"
        });
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
    schoolDataById();
  };

  const handleTeacherClick = (teacherId: string) => {
    if (userData && userData.role && userData.role == 'superadmin') {
      localStorage.setItem('current_school_id', id)
    }
    navigate(`/teacher-details/${teacherId}`);
  };

  const handleClassClick = (classId: string) => {
    if (userData && userData.role && userData.role == 'superadmin') {
      localStorage.setItem('current_school_id', id)
    }
    navigate(`/class-details/${classId}`);
  };

  return (
    <MainLayout pageTitle={`My School - ${schoolData.school_name}`}>
      <div className="space-y-6">
        {/* <Breadcrumb items={breadcrumbItems} /> */}
        <div
          onClick={() =>  window.history.back()}
          className="max-w-fit flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </div>

        {/* School Details Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">School Information</h2>
            </div>
            {userData.role == 'superadmin' && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="school_name"
                  value={schoolData.school_name}
                  onChange={handleSchoolInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{schoolData.school_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="school_email"
                  value={schoolData.school_email}
                  onChange={handleSchoolInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{schoolData.school_email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="school_contact_number"
                  value={schoolData.school_contact_number}
                  onChange={handleSchoolInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{schoolData.school_contact_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              {isEditing ? (
                <textarea
                  name="school_address"
                  value={schoolData.school_address}
                  onChange={handleSchoolInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{schoolData.school_address}</p>
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
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Teachers</h2>
            </div>
            <div className="flex items-center gap-1">
              <Link
                to="/admin-add-teacher"
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Teacher
              </Link>
              <Link
                to="/teachers"
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="View all teachers"
              >
                <Expand className="w-4 h-4" />
              </Link>
            </div>
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
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.teacher_id}
                  onClick={() => handleTeacherClick(teacher.teacher_id)}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="font-semibold text-gray-800">{teacher.teacher_first_name + " " + teacher.teacher_last_name}</h3>
                  <p className="text-sm text-gray-600">{teacher.phone_number}</p>
                  <p className="text-sm text-gray-500">{teacher.email}</p>
                </div>
              ))}
            </div>
            {filteredTeachers.length === 0 && !teacherLoader && (
              <div>
                No teachers found yet. You can add a new teacher by clicking the 'Add Teacher' button.
              </div>
            )}
            {
              teacherLoader && (
                <LoaderCircle className="spinner-icon" size={40} />
              )
            }
          </div>
        </div>

        {/* Classes Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Classes</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/add-class"
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Class
              </Link>
              <Link
                to="/classes"
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="View all classes"
              >
                <Expand className="w-4 h-4" />
              </Link>
            </div>
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
              {filteredClasses.map((classItem) => (
                <div
                  key={classItem.class_id}
                  onClick={() => handleClassClick(classItem.class_id)}
                  // state={{ from: 'admin-school' }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{'Class ' + classItem.class_number} - {classItem.section}</h3>
                    <BookOpen className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-600">Students: {classItem.student_count}</p>
                  <p className="text-sm text-gray-500">Teacher: {classItem.teacher_name || 'N/A'}</p>
                </div>
              ))}
            </div>
            {filteredClasses.length === 0 && !classLoader && (
              <div>
                No classes found yet. You can add a new classes by clicking the 'Add Class' button.
              </div>
            )}
            {
              classLoader && (
                <LoaderCircle className="spinner-icon" size={40} />
              )
            }
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminSchool;
