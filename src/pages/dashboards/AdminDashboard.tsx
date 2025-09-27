
import React, { useEffect, useState } from 'react';
import { Users, BookOpen, School, MapPin, Phone, Mail, GraduationCap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getSchools } from '../../data/schools';
import { useSnackbar } from "@/components/snackbar/SnackbarContext";
import { getHomePageData } from '@/services/home';
import { getSchoolById, editSchool } from '@/services/school';


const AdminDashboard: React.FC = () => {
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const schools = getSchools();
  const school = schools[0]; // Assuming admin manages first school
  const [schoolData, setSchoolData] = useState({
    school_name: '',
    school_email: '',
    school_contact_number: '',
    school_address: '',
    boards:[]
  });


  const [stats, setStats] = useState([
    {
      title: 'Teachers',
      value: '9',
      icon: Users,
      color: 'bg-blue-500',
      change: '12% from last month',
      link: '/teachers'
    },
    {
      title: 'Classes',
      value: '5',
      icon: BookOpen,
      color: 'bg-green-500',
      change: '5% from last month',
      link: '/classes'
    },
    {
      title: 'Students',
      value: '1',
      icon: GraduationCap,
      color: 'bg-purple-500',
      change: 'Manage school details',
      link: '/students'
    }
  ]);


  const fetchDashboardData = async () => {
    try {
      const response = await getHomePageData();
      // Process and set the data as needed
      // console.log(response);
      if (response && response.data) {
        setStats(
          [
            {
              title: 'Teachers',
              value: response.data.total_teachers || 0,
              icon: Users,
              color: 'bg-blue-500',
              change: `${response.data.total_teachers || '0'} Active`,
              link: '/teachers'
            },
            {
              title: 'Classes',
              value: response.data.total_classes || 0,
              icon: BookOpen,
              color: 'bg-green-500',
              change: `${response.data.total_classes || '0'} Active`,
              link: '/classes'
            },
            {
              title: 'Students',
              value: response.data.total_students || 0,
              icon: GraduationCap,
              color: 'bg-purple-500',
              change: `${response.data.total_students || '0'} Active`,
              link: '/students'
            }
          ]
        )
      } else {
        showSnackbar({
          title: "⛔ Error fetching dashboard data",
          description: "Please try again later.",
          status: "error"
        });
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error fetching dashboard data",
        description: "Please try again later.",
        status: "error"
      });
    }
  }

  const schoolDataById = async () => {
    const schoolData = await getSchoolById(userData.school_id);
    if (schoolData && schoolData.school) {
      // console.log(schoolData.school);
      setSchoolData(schoolData.school);
    }
  }

  useEffect(() => {
    schoolDataById();
    fetchDashboardData();
  }, []);


  return (
    <div className="space-y-6">
      {/* <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      </div> */}

      {/* School Info Card */}
      <div
        onClick={() => navigate('/admin-school')}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:scale-101 transition-all duration-200 cursor-pointer">
        <h2 className="text-xl font-bold text-blue-600 mb-4">{schoolData.school_name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{schoolData.school_address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{schoolData.school_contact_number}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>{schoolData.school_email}</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span>
              {schoolData?.boards?.map((board: any) => board.name).join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  {/* <p className="text-xs text-green-600 mt-2">
                    {stat.change}
                  </p> */}
                </div>
                <div className={`p-4 rounded-lg ${stat.color}`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
