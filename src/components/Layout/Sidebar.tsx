import React, { useState } from 'react';
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
  HelpCircle,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  FileText,
  UserPlus
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
}

interface BaseMenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  roles: string[];
}

interface RegularMenuItem extends BaseMenuItem {
  path: string;
}

interface DropdownMenuItem extends BaseMenuItem {
  key: string;
  isDropdown: true;
  subItems: { path: string; label: string; icon?: React.ComponentType<{ className?: string }> }[];
}

type MenuItem = RegularMenuItem | DropdownMenuItem;

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      { path: '/dashboard', icon: Home, label: 'Home', roles: ['superadmin', 'admin', 'teacher', 'student'] }
    ];

    const roleSpecificItems: { [key: string]: MenuItem[] } = {
      'superadmin': [
        {
          key: 'school-management',
          icon: School,
          label: 'School Management',
          roles: ['superadmin'],
          isDropdown: true,
          subItems: [
            { path: '/schools', label: 'Schools', icon: School },
            { path: '/create-school', label: 'Create School', icon: UserPlus }
          ]
        }
      ],
      'admin': [
        {
          key: 'school-management',
          icon: School,
          label: 'School Management',
          roles: ['admin'],
          isDropdown: true,
          subItems: [
            { path: '/admin-school', label: 'My School', icon: School },
            { path: '/classes', label: 'Classes', icon: BookOpen },
            { path: '/teachers', label: 'teachers', icon: GraduationCap },
            { path: '/students', label: 'students', icon: Users }
          ]
        }
      ],
      'teacher': [
        {
          key: 'user-management',
          icon: Users,
          label: 'User Management',
          roles: ['teacher'],
          isDropdown: true,
          subItems: [
            { path: '/classes', label: 'Classes', icon: BookOpen },
            { path: '/students', label: 'students', icon: Users }
          ]
        }
      ],
      'student': [
        { path: '/profile', icon: User, label: 'My Profile', roles: ['student'] },
        { path: '/timetable', icon: Calendar, label: 'Timetable', roles: ['student'] },
        { path: '/grades', icon: BarChart3, label: 'Grades', roles: ['student'] }
      ]
    };

    // Help dropdown - different for superadmin vs others
    const helpSubItems: { path: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [];

    if (user?.role === 'superadmin') {
      // superadmin sees responses (from all admins)
      helpSubItems.push({ path: '/responses', label: 'Responses', icon: MessageSquare });
    } else {
      // Other roles see support, requests, and responses
      helpSubItems.push({ path: '/support', label: 'Support', icon: HelpCircle });
      
      if (user?.role !== 'student') {
        helpSubItems.push({ path: '/admin-requests', label: 'Requests', icon: FileText });
      }
      
      helpSubItems.push({ path: '/responses', label: 'Responses', icon: MessageSquare });
    }

    const helpItems: MenuItem[] = [
      {
        key: 'help',
        icon: HelpCircle,
        label: 'Help',
        roles: ['superadmin', 'admin', 'teacher', 'student'],
        isDropdown: true,
        subItems: helpSubItems
      }
    ];

    return [...baseItems, ...(roleSpecificItems[user?.role as keyof typeof roleSpecificItems] || []), ...helpItems];
  };

  const isActive = (path: string) => location.pathname === path;
  
  const isDropdownActive = (subItems: { path: string; label: string }[]) => {
    return subItems.some(subItem => isActive(subItem.path));
  };

  const isDropdownPathActive = (item: DropdownMenuItem) => {
    return item.subItems.some(subItem => location.pathname.startsWith(subItem.path));
  };

  React.useEffect(() => {
    const menuItems = getMenuItems();
    menuItems.forEach((item) => {
      if ('isDropdown' in item && item.isDropdown) {
        const shouldExpand = isDropdownPathActive(item);
        if (shouldExpand && !expandedMenus[item.key]) {
          setExpandedMenus(prev => ({
            ...prev,
            [item.key]: true
          }));
        }
      }
    });
  }, [location.pathname]);

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
            if (item.roles && item.roles.includes(user?.role || '')) {
              const Icon = item.icon;
              
              if ('isDropdown' in item && item.isDropdown) {
                const isExpanded = expandedMenus[item.key];
                const isDropdownHighlighted = isDropdownActive(item.subItems);
                
                return (
                  <li key={item.key}>
                    <button
                      onClick={() => toggleMenu(item.key)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                        isDropdownHighlighted 
                          ? 'bg-white/20 text-white' 
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>
                      {!isCollapsed && (
                        isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {isExpanded && !isCollapsed && item.subItems && (
                      <ul className="ml-8 mt-1 space-y-1">
                        {item.subItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <li key={subItem.path}>
                              <Link
                                to={subItem.path}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                  isActive(subItem.path) 
                                    ? 'bg-white/20 text-white font-medium' 
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                {SubIcon && <SubIcon className="w-4 h-4" />}
                                {subItem.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              } else {
                const regularItem = item as RegularMenuItem;
                return (
                  <li key={regularItem.path}>
                    <Link
                      to={regularItem.path}
                      className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                        isActive(regularItem.path) 
                          ? 'bg-white/20 text-white' 
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="truncate">{regularItem.label}</span>
                      )}
                    </Link>
                  </li>
                );
              }
            }
            return null;
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
