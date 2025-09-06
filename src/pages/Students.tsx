
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Edit, Search, Plus, GraduationCap, LoaderCircle, Grid, List, Eye, Trash2 } from 'lucide-react';
import { getStudentsBySchoolId, deleteStudentById } from '../services/student';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSnackbar } from "../components/snackbar/SnackbarContext";

const Students: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [loader, setLoader] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const [students, setStudents] = useState([]);

  const filteredStudents = students.filter(student =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roll_number.includes(searchTerm) ||
    student.parent_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBreadcrumbItems = () => {
    if (user?.role === 'admin') {
      return [
        { label: 'School Management', path: '/admin-school' },
        { label: 'Students' }
      ];
    } else if (user?.role === 'teacher') {
      return [
        { label: 'Home', path: '/dashboard' },
        { label: 'Students' }
      ];
    } else {
      return [
        { label: 'School Management' },
        { label: 'Students' }
      ];
    }
  };

  const getStudents = async () => {
    setLoader(true);
    const response = await getStudentsBySchoolId(userData.school_id);
    if (response && response.students) {
      setLoader(false);
      setStudents(response.students);
    }
  }

  const deleteStudent = async (studentId: string) => {
    setLoader(true);
    try {
      const response = await deleteStudentById({ student_id: studentId, school_id: userData.school_id });
      if (response && response.message) {
        // setStudents(students.filter(student => student.student_id !== studentId));
        showSnackbar({
          title: "✅ Success",
          description: "Student deleted successfully",
          status: "success"
        });
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    } finally {
      setLoader(false);
      getStudents();
    }
  }

  useEffect(() => {
    getStudents();
  }, [])

  const getAddStudentPath = () => {
    return '/add-student';
  };

  const handleDelete = (studentId: string) => {
    // Delete functionality - you can implement this based on your API
    deleteStudent(studentId);
    // console.log('Delete student:', studentId);
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredStudents.map((student) => (
        <Link
          key={student.student_id}
          to={`/student-details/${student.student_id}`}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {student.student_name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{student.student_name}</h3>
                <p className="text-sm text-gray-500">{student.class}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Class :</span>
              <span className="font-medium text-gray-800">{'Class '+student.class_number + ' - ' + student.section}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Roll Number:</span>
              <span className="font-medium text-gray-800">{student.roll_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Parent:</span>
              <span className="font-medium text-gray-800">{student.parent_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Phone:</span>
              <span className="font-medium text-gray-800">{student.parent_phone}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              {student.status || 'active'}
            </span>
            {(user?.role !== 'student') && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(student.student_id);
                }}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Student"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
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
              <TableHead className="font-medium">Student</TableHead>
              <TableHead className="font-medium">Class</TableHead>
              <TableHead className="font-medium">Roll No.</TableHead>
              <TableHead className="font-medium">Parent</TableHead>
              <TableHead className="font-medium">Phone</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.student_id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {student.student_name.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium">{student.student_name}</span>
                  </div>
                </TableCell>
                <TableCell>{'Class '+student.class_number + ' - ' + student.section}</TableCell>
                <TableCell>{student.roll_number}</TableCell>
                <TableCell>{student.parent_name}</TableCell>
                <TableCell>{student.parent_phone}</TableCell>
                <TableCell>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {student.status || 'Active'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      to={`/student-details/${student.student_id}`}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {(user?.role !== 'student') && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(student.student_id);
                        }}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
    <MainLayout pageTitle="Students">
      <div className="space-y-6">
        {/* <Breadcrumb items={getBreadcrumbItems()} /> */}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* <div className="p-2 bg-purple-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Students</h1> */}
            <Breadcrumb items={getBreadcrumbItems()} />
          </div>
          <div className="flex items-center gap-2">
            {/* window.innerWidth >= 768 */}
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
            {(user?.role === 'admin' || user?.role === 'teacher') && (window.innerWidth >= 768) && (
              <Link
                to={getAddStudentPath()}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Student
              </Link>
            )}
          </div>
        </div>
        {(user?.role === 'admin' || user?.role === 'teacher') && (window.innerWidth < 768) && (
          <Link
            to={getAddStudentPath()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Link>
        )}

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search students by name, class, roll number or parent name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {viewMode === 'grid' ? renderGridView() : renderTableView()}

        {filteredStudents.length === 0 && !loader && (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'No students have been added yet.'}
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

export default Students;
