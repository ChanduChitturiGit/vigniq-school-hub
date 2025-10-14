
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { getSchools } from '../data/schools';
import { Edit, MapPin, Mail, Phone, LoaderCircle as Loader, School, ArrowLeft, Trash2, CheckCircle } from 'lucide-react';
import { getSchoolsList, getBoardsList, getSchoolsListByStatus, deleteSchoolById, reactiveSchoolById } from '@/services/school';
import { SpinnerOverlay } from '../pages/SpinnerOverlay';
import { useSnackbar } from "../components/snackbar/SnackbarContext";
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



const Schools: React.FC = () => {
  //const schools = getSchools();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [schools, setschools] = useState([]);
  const [loader, setLoader] = useState(true);
  const [boards, setBoards] = useState([]);
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const [formData, setFormData] = useState({
    status: 'Active',
    is_active: true,
  });


  const fetchSchools = async (isActive = true) => {
    setLoader(true);
    try {
      const schoolsList = await getSchoolsListByStatus({ is_active: isActive });
      if (schoolsList && schoolsList.schools) {
        setLoader(false);
        setschools(schoolsList.schools);
      }
    } catch (error) {
      setLoader(false);
      showSnackbar({
        title: "⛔ Something went wrong ",
        description: "Please refresh and try again",
        status: "error"
      });
    }
  };

  const boardsList = async () => {
    const response = await getBoardsList();
    if (response && response.boards) {
      setBoards(response.boards);
    }
  }

  const deleteSchool = async (school_id: Number) => {
    setLoader(true);
    try {
      const reponse = await deleteSchoolById({ school_id: school_id });
      if (reponse && reponse.message) {
        fetchSchools();
        setLoader(false);
        showSnackbar({
          title: "Success",
          description: `${reponse.message}`,
          status: "success"
        });
      } else {
        showSnackbar({
          title: "⛔ Something went wrong ",
          description: "Please refresh and try again",
          status: "error"
        });
      }
    } catch (error) {
      setLoader(false);
      showSnackbar({
        title: "⛔ Something went wrong ",
        description: "Please refresh and try again",
        status: "error"
      });
    }
  };


  const reactiveSchool = async (school_id: Number) => {
    setLoader(true);
    try {
      const reponse = await reactiveSchoolById({ school_id: school_id });
      if (reponse && reponse.message) {
        fetchSchools(false);
        setLoader(false);
        showSnackbar({
          title: "Success",
          description: `${reponse.message}`,
          status: "success"
        });
      } else {
        showSnackbar({
          title: "⛔ Something went wrong ",
          description: "Please refresh and try again",
          status: "error"
        });
      }
    } catch (error) {
      setLoader(false);
      showSnackbar({
        title: "⛔ Something went wrong ",
        description: "Please refresh and try again",
        status: "error"
      });
    }
  };

  useEffect(() => {
    fetchSchools();
    boardsList();
  }, []);


  const breadcrumbItems = [
    // { label: 'School Management', path: '/user-management' },
    { label: 'Schools' }
  ];

  const handleStatusChange = (value: string) => {
    setFormData(prevState => ({ ...prevState, status: value, is_active: value === 'Active' ? true : false }));
    setTimeout(() => {
      fetchSchools(value === 'Active' ? true : false);
    }, 100);
  }


  const deleteModal = (school: any) => {
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
              <AlertDialogTitle>Inactive School</AlertDialogTitle>
              <AlertDialogDescription className='text-gray-700'>
                <p>Are you sure you want to Inactive the School :  <span className='font-bold'>{school.school_name}</span>?</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteSchool(school.school_id)} className="bg-red-600 hover:bg-red-700">
                Confirm Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  const reActiveModal = (school: any) => {
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
              <AlertDialogTitle>Activate School</AlertDialogTitle>
              <AlertDialogDescription className='text-gray-700'>
                <p>Are you sure you want to Re-Activate the School <span className='font-bold'>{school.school_name}</span>?</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => reactiveSchool(school.school_id)} className="bg-orange-600 hover:bg-orange-700">
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  return (
    <>
      <MainLayout pageTitle="Schools">
        <div className="space-y-6">
          {/* <Breadcrumb items={breadcrumbItems} /> */}

          <div className="flex items-center justify-between">
            {/* <h1 className="text-2xl font-bold text-gray-800">Schools</h1> */}
            <div
              onClick={() => window.history.back()}
              className="max-w-fit flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </div>

            <div className="flex items-center gap-4">
              <div className='w-48'>
                <Select value={formData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a board" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Active', 'Inactive'].map((val, index) => (
                      <SelectItem key={index} value={val}>
                        {val}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Link
                to="/create-school"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create New School
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school) => (
              <div
                key={school.school_id}
                onClick={() => navigate(`/schools/school-details/${school.school_id}`)}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className='flex gap-2'>
                    <School className='text-blue-400' />
                    <h3 className="text-lg font-semibold text-gray-800">{school.school_name}</h3>
                  </div>
                  {/* <button
                    onClick={(e) => {
                      e.preventDefault();
                      // Handle edit action
                    }}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button> */}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{school.school_address}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600">{school.school_contact_number}</p>
                  </div>

                  <div className="flex items-center gap-2 ">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600">{school.school_email}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Teachers: {school.teacher_count ? school.teacher_count : 0}</span>
                    <span className="text-gray-500">Students: {school.student_count ? school.student_count : 0}</span>
                  </div>
                </div>


                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()} >
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${!school?.is_active ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {!school.is_active ? 'In-Active' : 'Active'}
                  </span>
                  {(userData?.role == 'superadmin') &&
                      (school?.is_active ? deleteModal(school) : reActiveModal(school))
                    }
                </div>
              </div>
            ))}
          </div>

          {schools.length === 0 && !loader && (
            <div className="text-center py-12">
              <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Schools found</h3>
              <p className="text-gray-500">
                {'No schools have been added yet.'}
              </p>
            </div>
          )}
        </div>
      </MainLayout>
      {
        loader && (
          <SpinnerOverlay />
        )
      }
    </>
  );
};

export default Schools;
