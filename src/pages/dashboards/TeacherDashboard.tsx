import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Users, Clock, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { useSnackbar } from "@/components/snackbar/SnackbarContext";
import { getHomePageData } from '@/services/home';


const TeacherDashboard: React.FC = () => {
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);

  // Mock recent requests from students
  const recentRequests = [
    {
      id: '1',
      studentName: 'Alice Johnson',
      class: 'Class 10-A',
      subject: 'Profile Update Request',
      time: '2 hours ago',
      priority: 'medium'
    },
    {
      id: '2',
      studentName: 'Bob Wilson',
      class: 'Class 9-B',
      subject: 'Grade Review Request',
      time: '4 hours ago',
      priority: 'high'
    },
    {
      id: '3',
      studentName: 'Charlie Brown',
      class: 'Class 10-A',
      subject: 'Schedule Change Request',
      time: '1 day ago',
      priority: 'low'
    }
  ];

  // Mock classes data
  const myClasses = [
    {
      id: '1',
      name: 'Class 10-A',
      subject: 'Mathematics',
      students: 30,
      nextClass: 'Today 2:00 PM'
    },
    {
      id: '2',
      name: 'Class 9-B',
      subject: 'Mathematics',
      students: 28,
      nextClass: 'Tomorrow 10:00 AM'
    },
    {
      id: '3',
      name: 'Class 11-C',
      subject: 'Mathematics',
      students: 27,
      nextClass: 'Tomorrow 3:00 PM'
    }
  ];

  const [schoolData, setSchoolData] = useState({
    school_name: '',
    school_email: '',
    school_contact_number: '',
    school_address: ''
  });


  const fetchDashboardData = async () => {
    try {
      const response = await getHomePageData();
      // Process and set the data as needed
      if (response && response.data) {
        setStats(
          [
            {
              title: 'My Classes',
              value: response.data.total_classes || 0,
              subValue: response.data.total_students+' total students',
              icon: BookOpen,
              color: 'bg-blue-500',
              link: '/classes'
            },
            {
              title: 'Total Students',
              value: response.data.total_students || 0,
              subValue: 'across all classes',
              icon: Users,
              color: 'bg-green-500',
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





  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
        <div className="text-sm text-gray-500">
          Manage your classes and students
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subValue}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Recent Requests</h2>
            <Link
              to="/requests"
              className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title="View all requests"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <Link
                  key={request.id}
                  to={`/requests?request=${request.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{request.studentName}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{request.class} - {request.subject}</p>
                    <p className="text-xs text-gray-500">{request.time}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}

              {recentRequests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent requests</p>
                </div>
              )}
            </div>
          </div>
        </div> */}

        {/* My Classes */}
        {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">My Classes</h2>
            <Link
              to="/classes"
              className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title="View all classes"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {myClasses.map((classItem) => (
                <Link
                  key={classItem.id}
                  to={`/class-details/${classItem.id}`}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{classItem.name}</p>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {classItem.subject}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{classItem.students} students</p>
                    <p className="text-xs text-gray-500">Next: {classItem.nextClass}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}

              {myClasses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No classes assigned</p>
                </div>
              )}
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};



export default TeacherDashboard;