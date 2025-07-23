
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { getSchools } from '../data/schools';
import { Edit, MapPin, Mail, Phone, LoaderCircle  as Loader, School } from 'lucide-react';
import { getSchoolsList } from '@/services/school';
import {SpinnerOverlay} from '../pages/SpinnerOverlay';



const Schools: React.FC = () => {
  //const schools = getSchools();
  const [schools, setschools] = useState([]);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      setLoader(true);
      const schoolsList = await getSchoolsList();
      if (schoolsList && schoolsList.schools) {
        setLoader(false);
        setschools(schoolsList.schools);
      }
    };
    fetchSchools();
  }, []);


  const breadcrumbItems = [
    // { label: 'School Management', path: '/user-management' },
    { label: 'Schools' }
  ];

  return (
    <MainLayout pageTitle="Schools">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Schools</h1>
          <Link
            to="/create-school"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create New School
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <Link
              key={school.school_id}
              to={`/school-details/${school.school_id}`}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{school.school_name}</h3>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // Handle edit action
                  }}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
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

                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{school.school_email}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Students: {school.teacher_count ? school.teacher_count : 0}</span>
                  <span className="text-gray-500">Teachers: {school.student_count ? school.student_count : 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {schools.length === 0 && !loader &&(
          <div className="text-center py-12">
            <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Schools found</h3>
            <p className="text-gray-500">
              {'No schools have been added yet.'}
            </p>
          </div>
        )}

        {
          loader && (
            <SpinnerOverlay/>
          )
        }
      </div>
    </MainLayout>
  );
};

export default Schools;
