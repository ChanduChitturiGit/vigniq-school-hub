
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Edit, Plus, Mail, Phone, Search, Users as UsersIcon, LoaderCircle, Grid, List, Eye, Trash2, Trash, ArrowLeft, Book, RefreshCcw, PlayCircle, CheckCircle } from 'lucide-react';
import { getTeachersBySchoolId, deleteTeacherById, getTeachersListBySchoolId, reactivateTeacherById } from '../services/teacher';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { SpinnerOverlay } from '../pages/SpinnerOverlay';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

const Teachers: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [loader, setLoader] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const schoolId = JSON.parse(localStorage.getItem("current_school_id"));
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    status: 'Active',
    is_active: true,
  });



  const getTeachersList = async (isActive = true) => {
    setLoader(true);
    try {
      const response = await getTeachersListBySchoolId({ school_id: (userData.school_id ? userData.school_id : schoolId), is_active: isActive });
      if (response && response.teachers) {
        setLoader(false);
        setTeachers(response.teachers);
      }
    } catch (error) {
      setLoader(false);
      console.error('Error fetching teachers:', error);
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }

  //reactivateTeacherById
  const handleTeacherReactivate = async (teacherId: number) => {
    setLoader(true);
    try {
      const response = await reactivateTeacherById({ teacher_id: teacherId, school_id: userData.school_id ? userData.school_id : schoolId });
      if (response && response.message) {
        showSnackbar({
          title: "Success",
          description: "Teacher reactivated successfully ✅",
          status: "success"
        });
      } else {
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong",
          status: "error"
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
      getTeachersList(false);
    }
  }

  useEffect(() => {
    getTeachersList();
  }, []);

  let filteredTeachers = searchTerm.length > 0 ? teachers.filter(teacher =>
    (teacher.teacher_first_name && teacher.teacher_first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (teacher.teacher_last_name && teacher.teacher_last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (teacher.subject && teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (teacher.email && teacher.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : teachers;

  const breadcrumbItems = user?.role === 'admin'
    ? [
      { label: 'School Management', path: '/admin-school' },
      { label: 'Teachers' }
    ]
    : [
      { label: userData.role == 'teacher' ? 'Home' : 'My School', path: (userData.role == 'superadmin' ? `/schools/school-details/${schoolId}` : userData.role == 'admin' ? '/admin-school' : '/dashboard') },
      { label: 'Teachers' }
    ];

  // Handle delete action
  const handleTeacherDelete = async (teacherId: number) => {
    setLoader(true);
    try {
      const response = await deleteTeacherById({ teacher_id: teacherId, school_id: userData.school_id ? userData.school_id : schoolId });
      if (response && response.message) {
        showSnackbar({
          title: "Success",
          description: "Teacher deleted successfully ✅",
          status: "success"
        });
      } else {
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong",
          status: "error"
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
      getTeachersList();
    }
  }

  const handleDelete = (teacherId: string) => {
    // Delete functionality - you can implement this based on your API
    handleTeacherDelete(Number(teacherId));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prevState => ({ ...prevState, status: value, is_active: value === 'Active' ? true : false }));
    setTimeout(() => {
      getTeachersList(value === 'Active' ? true : false);
    }, 100);
  }


  const deleteModal = (teacher: any) => {
    return (
      <>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors">
              <Trash2 className="w-4 h-4" />
              {/* Reset Password */}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
              <AlertDialogDescription className='text-gray-700'>
                <p>Are you sure you want to delete teacher <span className='font-bold'>{teacher.teacher_first_name} {teacher.teacher_last_name}</span>?</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(teacher.teacher_id)} className="bg-red-600 hover:bg-red-700">
                Confirm Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  const reActiveModal = (teacher: any) => {
    return (
      <>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors">
              <CheckCircle className="w-4 h-4" />
              Make Active
              {/* Reset Password */}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Activate Teacher</AlertDialogTitle>
              <AlertDialogDescription className='text-gray-700'>
                <p>Are you sure you want to Re-Activate Teacher <span className='font-bold'>{teacher.teacher_first_name} {teacher.teacher_last_name}</span>?</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleTeacherReactivate(teacher.teacher_id)} className="bg-orange-600 hover:bg-orange-700">
                Confirm Active
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }


  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTeachers.map((teacher) => (
        <div
          key={teacher.teacher_id}
          onClick={() => { navigate(`/teachers/teacher-details/${teacher.teacher_id}`) }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {teacher.teacher_first_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{teacher.teacher_first_name + " " + teacher.teacher_last_name}</h3>
                  {/* <p className="text-sm text-gray-500">{teacher.subject}</p> */}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-600">{teacher.email}</p>
              </div>

              <div className="flex items-center gap-2">
                <Book className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-600 truncate" title={teacher?.subject_assignments.join(",")}>{teacher?.subject_assignments.join(",")}</p>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-600">{teacher.phone_number}</p>
              </div>

              {/* <div>
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
            </div> */}

            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between"
            onClick={(e) => e.stopPropagation()} >
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${teacher.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {teacher.is_active ? 'Active' : 'In Active'}
            </span>
            {(userData?.role === 'admin' || userData?.role === 'superadmin') &&
              (teacher.is_active ? deleteModal(teacher) : reActiveModal(teacher))
            }
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">Name</TableHead>
              <TableHead className="font-medium">Subject</TableHead>
              <TableHead className="font-medium">Email</TableHead>
              <TableHead className="font-medium">Phone</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeachers.map((teacher) => (
              <TableRow key={teacher.teacher_id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {teacher.teacher_first_name.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium">{teacher.teacher_first_name + " " + teacher.teacher_last_name}</span>
                  </div>
                </TableCell>
                <TableCell className='truncate' title={teacher?.subject_assignments.join(",")}>{teacher?.subject_assignments.join(",")}</TableCell>
                <TableCell className="max-w-xs truncate">{teacher.email}</TableCell>
                <TableCell>{teacher.phone_number}</TableCell>
                <TableCell>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                     {teacher.is_active ? 'Active' : 'In Active'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      to={`/teachers/teacher-details/${teacher.teacher_id}`}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {(userData?.role === 'admin' || userData?.role === 'superadmin') &&
                      (teacher.is_active ? deleteModal(teacher) : reActiveModal(teacher))
                    }
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
    <MainLayout pageTitle="teachers">
      <div className="space-y-6">
        {/* <Breadcrumb items={breadcrumbItems} /> */}

        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <div className="p-2 bg-green-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-green-600" />
            </div> */}
            {/* <h1 className="text-xl md:text-2xl font-bold text-gray-800">Teachers</h1> */}
            <div
              onClick={() => window.history.back()}
              className="max-w-fit flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className='flex items-center justify gap-2'>
              {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label> */}
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a board" />
                </SelectTrigger>
                <SelectContent>
                  {['Active', 'In Active'].map((val, index) => (
                    <SelectItem key={index} value={val}>
                      {val}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
                title="Grid View"
              >
                <Grid className="w-3 h-3 md:w-4 md:h-4" />
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
            {(user?.role === 'admin' || user?.role === 'superadmin') && (
              <Link
                to={"/teachers/admin-add-teacher"}
                className="bg-blue-500 text-white px-2 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
                Add Teacher
              </Link>
            )}
          </div>
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

        {viewMode === 'grid' ? renderGridView() : renderTableView()}

        {filteredTeachers.length === 0 && !loader && (
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

export default Teachers;
