
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { getClasses } from '../data/classes';
import { Users, Plus, Search, BookOpen,LoaderCircle } from 'lucide-react';
import { getClassesBySchoolId } from '@/services/class';

const Classes: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [classes,setClasses] = useState([]);
  const [loader,setLoader] = useState(true);
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));

  const filteredClasses = classes.filter(classItem =>
    (classItem.class_name && classItem.class_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    ( classItem.section && classItem.section.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (classItem.class_name && classItem.section && (classItem.class_name+' - '+classItem.section).toLowerCase().includes(searchTerm.toLowerCase()))
    // classItem.academicYear.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const breadcrumbItems = user?.role === 'admin'
    ? [
      { label: 'School Management', path: '/admin-school' },
      { label: 'Classes' }
    ]
    : [
      { label: 'User Management', path: '/user-management' },
      { label: 'Classes' }
    ];

  //classes list api
  const getClasses = async () => {
    //classes list api
    setLoader(true);
    const classesData = await getClassesBySchoolId(userData.school_id);
    if (classesData && classesData.classes) {
      setLoader(false);
      setClasses(classesData.classes);
    }
  }

  useEffect(() => {
    getClasses();
  }, []);

  

  return (
    <MainLayout pageTitle="Classes">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
          {user?.role === 'admin' && (
            <Link
              to="/add-class"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Class
            </Link>
          )}
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search classes by name, section or academic year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <Link
              key={classItem.class_id}
              to={`/class-details/${classItem.class_id}`}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {classItem.class_name} - {classItem.section}
                  </h3>
                  <p className="text-sm text-gray-500">{classItem.academicYear || null}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Students:</span>
                  <span className="font-medium text-gray-800">{classItem.student_count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Teacher:</span>
                  <span className="font-medium text-gray-800">{classItem.teacher_name ? classItem.teacher_name : 'N/A'}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </Link>
          ))}
        </div>
        {filteredClasses.length === 0 && !loader && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes found</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'No classes have been added yet.'}
            </p>
          </div>
        )}
        {
          loader && (
            <div className="text-center py-12">
              <LoaderCircle className="spinner-icon mx-auto" size={40} />
            </div>
          )
        }
      </div>
    </MainLayout>
  );
};

export default Classes;
