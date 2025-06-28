
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  User, 
  Calendar, 
  BarChart3, 
  Settings, 
  Users, 
  BookOpen,
  GraduationCap,
  School,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: Home, label: 'Home', roles: ['Super Admin', 'Admin', 'Teacher', 'Student'] }
    ];

    const roleSpecificItems = {
      'Super Admin': [
        { path: '/schools', icon: School, label: 'Schools', roles: ['Super Admin'] },
        { path: '/create-school', icon: Settings, label: 'Create School', roles: ['Super Admin'] }
      ],
      'Admin': [
        { path: '/admin-center', icon: Settings, label: 'Admin Center', roles: ['Admin'], hasSubmenu: true },
        { path: '/manage-teachers', icon: Users, label: 'Manage Teachers', roles: ['Admin'], isSubmenu: true },
        { path: '/create-students', icon: User, label: 'Create Students', roles: ['Admin'], isSubmenu: true },
        { path: '/manage-students', icon: GraduationCap, label: 'Manage Students', roles: ['Admin'], isSubmenu: true },
        { path: '/create-class', icon: BookOpen, label: 'Create Class', roles: ['Admin'], isSubmenu: true },
        { path: '/manage-class', icon: BookOpen, label: 'Manage Class', roles: ['Admin'], isSubmenu: true },
        { path: '/dashboards', icon: BarChart3, label: 'Dashboards', roles: ['Admin'] },
        { path: '/calendar', icon: Calendar, label: 'Calendar', roles: ['Admin'] },
        { path: '/support', icon: HelpCircle, label: 'Support', roles: ['Admin'] }
      ],
      'Teacher': [
        { path: '/my-classes', icon: BookOpen, label: 'My Classes', roles: ['Teacher'] },
        { path: '/students', icon: Users, label: 'Students', roles: ['Teacher'] },
        { path: '/edit-requests', icon: User, label: 'Edit Requests', roles: ['Teacher'] }
      ],
      'Student': [
        { path: '/profile', icon: User, label: 'My Profile', roles: ['Student'] },
        { path: '/timetable', icon: Calendar, label: 'Timetable', roles: ['Student'] },
        { path: '/grades', icon: BarChart3, label: 'Grades', roles: ['Student'] }
      ]
    };

    return [...baseItems, ...(roleSpecificItems[user?.role as keyof typeof roleSpecificItems] || [])];
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`bg-gradient-to-b from-blue-400 to-blue-500 text-white h-screen transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col`}>
      {/* Logo Section */}
      <div className="p-4 border-b border-blue-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-blue-500 font-bold">V</span>
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold">VIGNIQ</span>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {getMenuItems().map((item) => {
            if (item.roles.includes(user?.role || '')) {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                      isActive(item.path) 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    } ${item.isSubmenu ? 'ml-8 text-sm' : ''}`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            }
            return null;
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
