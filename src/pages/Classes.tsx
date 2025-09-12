
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { getClasses } from '../data/classes';
import { Users, Plus, Search, BookOpen, LoaderCircle, Grid, List, Eye, Trash2, ArrowLeft } from 'lucide-react';
import { getClassesBySchoolId } from '@/services/class';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSnackbar } from "../components/snackbar/SnackbarContext";

const Classes: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [classes, setClasses] = useState([]);
  const [loader, setLoader] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const schoolId = JSON.parse(localStorage.getItem("current_school_id"));

  const filteredClasses = classes.filter(classItem =>
    (classItem.class_number && classItem.class_number.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
    (classItem.section && classItem.section.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (classItem.class_number && classItem.section && ('Class ' + classItem.class_number + ' - ' + classItem.section).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const breadcrumbItems = user?.role === 'admin'
    ? [
      { label: 'School Management', path: '/admin-school' },
      { label: 'Classes' }
    ]
    : [
      { label: userData.role == 'teacher' ? 'Home' : 'My School', path: (userData.role == 'superadmin' ? `/school-details/${schoolId}` : userData.role == 'admin' ? '/admin-school' : '/dashboard') },
      { label: 'Classes' }
    ];

  const getClasses = async () => {
    setLoader(true);
    const classesData = await getClassesBySchoolId(userData.school_id ? userData.school_id : schoolId);
    if (classesData && classesData.classes) {
      setLoader(false);
      setClasses(classesData.classes);
    }
  }

  useEffect(() => {
    getClasses();
  }, []);

  const handleDelete = (classId: string) => {
    // Delete functionality - you can implement this based on your API
    console.log('Delete class:', classId);
  };

  const renderGridView = () => (
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
                {'Class ' + classItem.class_number} - {classItem.section}
              </h3>
              <p className="text-sm text-gray-500">{classItem.academicYear || null}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Board:</span>
              <span className="font-medium text-gray-800">{classItem.school_board_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Students:</span>
              <span className="font-medium text-gray-800">{classItem.student_count}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Teacher:</span>
              <span className="font-medium text-gray-800">{classItem.teacher_name ? classItem.teacher_name : 'N/A'}</span>
            </div>
          </div>

          {/* <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              Active
            </span>
          </div> */}
        </Link>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">Class</TableHead>
              <TableHead className="font-medium">Section</TableHead>
              <TableHead className="font-medium">Board</TableHead>
              <TableHead className="font-medium">Students</TableHead>
              <TableHead className="font-medium">Teacher</TableHead>
              {/* <TableHead className="font-medium">Status</TableHead> */}
              <TableHead className="font-medium text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClasses.map((classItem) => (
              <TableRow key={classItem.class_id} className="hover:bg-gray-50">
                <TableCell className="font-medium">Class {classItem.class_number}</TableCell>
                <TableCell>{classItem.section}</TableCell>
                <TableCell>{classItem.school_board_name}</TableCell>
                <TableCell>{classItem.student_count}</TableCell>
                <TableCell>{classItem.teacher_name || 'N/A'}</TableCell>
                {/* <TableCell>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </TableCell> */}
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      to={`/class-details/${classItem.class_id}`}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {/* {user?.role === 'admin' && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(classItem.class_id);
                        }}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Class"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )} */}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <MainLayout pageTitle="Classes">
      <div className="space-y-6">
        {/* <Breadcrumb items={breadcrumbItems} /> */}

        <div className="flex items-center justify-between">
          {/* <h1 className="text-2xl font-bold text-gray-800">Classes</h1> */}
          {/* <Breadcrumb items={breadcrumbItems} /> */}
          <div
            onClick={() => window.history.back()}
            className="max-w-fit flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                  }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                  }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
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

        {viewMode === 'grid' ? renderGridView() : renderTableView()}

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
