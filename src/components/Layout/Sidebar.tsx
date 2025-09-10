import React, { useState } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
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
  UserPlus,
  Upload,
  Eye,
  Award,
  TrendingUp,
  Plus,
  UserCheck,
  ClipboardCheck,
  FileCheck
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileMenuOpen?: boolean;
  onMobileClose?: () => void;
  onExpandSidebar?: () => void;
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

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, isMobileMenuOpen, onMobileClose, onExpandSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const schoolName = userData?.school_name ?? '';

  // Check if we're in a subject-specific context
  const isInSubjectContext = location.pathname.includes('/grades/syllabus') || location.pathname.includes('/grades/progress/')  || location.pathname.includes('/grades/lesson-plan') || location.pathname.includes('/grades/exams')
  || location.pathname.includes('/grades/lesson-plan/create') || location.pathname.includes('/grades/lesson-plan/customize') || location.pathname.includes('/grades/lesson-plan/day') || location.pathname.includes('/grades/chapter');

  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const subject = searchParams.get('subject') || '';
  const classId = searchParams.get('class_id') || searchParams.get('classId') || '';
  const subjectId = searchParams.get('subject_id') || searchParams.get('subjectId') || location.pathname.split('/').pop()?.split('?')[0]  || '';
  const schoolId = searchParams.get('school_id') || searchParams.get('schoolId') || '';
  const boardId = searchParams.get('school_board_id') || searchParams.get('boardId') || '';
  const chapterName = searchParams.get('chapterName') || '';
  const pathData = `${subjectId}?class=${className}&class_id=${classId}&section=${section}&subject=${subject}&subject_id=${subjectId}&school_board_id=${boardId}&school_id=${schoolId}&chapterName=${encodeURIComponent(chapterName)}`;


  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const getSubjectSpecificMenuItems = (): MenuItem[] => {
    const baseSubjectPath = `/grades/syllabus/${pathData}`;
    const progressPath = `/grades/progress/${pathData}`;
    const examsPath = `/grades/exams/${pathData}`;

    return [
      { path: '/grades', icon: Award, label: 'Home', roles: ['teacher'] },
      { path: baseSubjectPath, icon: BookOpen, label: 'Syllabus', roles: ['teacher'] },
      { path: progressPath, icon: TrendingUp, label: 'Progress', roles: ['teacher'] },
       { path: examsPath, icon: FileCheck, label: 'Exams', roles: ['teacher'] },
    ];
  };

  const getMenuItems = (): MenuItem[] => {
    // If we're in subject context, show subject-specific menu
    if (isInSubjectContext && user?.role === 'teacher') {
      return getSubjectSpecificMenuItems();
    }

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
        },
        {
          key: 'ebooks',
          icon: BookOpen,
          label: 'E-Books',
          roles: ['superadmin'],
          isDropdown: true,
          subItems: [
            { path: '/upload-ebooks', label: 'Upload E-books', icon: Upload },
            { path: '/view-ebooks', label: 'View E-books', icon: Eye }
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
        },
        { path: '/view-ebooks', icon: BookOpen, label: 'E-Books', roles: ['admin'] }
      ],
      'teacher': [
        { path: '/grades', icon: Award, label: 'Subjects', roles: ['teacher'] },
        { path: '/attendance', icon: ClipboardCheck, label: 'Attendance', roles: ['teacher'] },
        {
          key: 'school-management',
          icon: Users,
          label: 'School Management',
          roles: ['teacher'],
          isDropdown: true,
          subItems: [
            { path: '/classes', label: 'Classes', icon: BookOpen },
            { path: '/students', label: 'students', icon: Users }
          ]
        },
        { path: '/view-ebooks', icon: BookOpen, label: 'E-Books', roles: ['teacher'] }
      ],
      'student': [
        { path: '/profile', icon: User, label: 'My Profile', roles: ['student'] },
        { path: '/view-ebooks', icon: BookOpen, label: 'E-Books', roles: ['student'] }
      ]
    };

    // Help dropdown - different for superadmin vs others
    const helpSubItems: { path: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [];
    

    if (user?.role === 'superadmin') {
      // helpSubItems.push({ path: '/responses', label: 'Responses', icon: MessageSquare });
      helpSubItems.push({ path: '/requests', label: 'Responses', icon: MessageSquare });
    } else {
      helpSubItems.push({ path: '/support', label: 'Support', icon: HelpCircle });
      helpSubItems.push({ path: '/requests', label: 'Responses', icon: MessageSquare });

      // if (user?.role !== 'student') {
      //   helpSubItems.push({ path: '/requests', label: 'Responses', icon: FileText });
      // }

      // helpSubItems.push({ path: '/responses', label: 'Responses', icon: MessageSquare });
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

  const isActive = (path: string) => {
    if (path === '#') return false;

    // For subject-specific paths, match the full path including query params
    if (path.includes('?')) {
      return path.includes(location.pathname);
    }

    return location.pathname === path;
  };

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

  const handleLinkClick = () => {
    // Only close sidebar on mobile screens (< 768px)
    if (onMobileClose && window.innerWidth < 768) {
      onMobileClose();
    }
  };

  const handleIconClick = (path: string) => {
    // If sidebar is collapsed and we're on desktop/tablet, expand it first then navigate
    if (isCollapsed && window.innerWidth >= 768 && onExpandSidebar) {
      onExpandSidebar();
      // Navigate after a short delay to allow the sidebar to expand
      setTimeout(() => {
        if (path !== '#') {
          navigate(path);
        }
      }, 100);
    }
  };

  return (
    <div className={`bg-slate-50 text-gray-700 h-screen transition-all duration-500 ease-in-out ${isCollapsed && window.innerWidth >= 768 ? 'w-16' : 'w-64'
      } flex flex-col border-r border-gray-200`}>
      {/* Logo Section */}
      {/* bg-white */}
      <div className="p-4 bg-[#E0F2FE] border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="rounded flex items-center justify-center">
            <img src="/assets/logo.png" alt="Logo" className="w-[2rem] h-[2rem] bg-white rounded-[0.6rem] object-contain" />
          </div>
          {(!isCollapsed || window.innerWidth < 768) && (
            <div className="transition-opacity duration-500 ease-in-out w-[70%]">
              <span className="text-xl font-bold text-blue-600">VIGYS AI</span>
               <div className={`text-xs text-gray-500 mt-1 truncate `} title={schoolName}>
                  {schoolName || 'School Name here'}
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="bg-[#E0F2FE] flex-1 py-4 px-3">
        <ul className="space-y-2">
          {getMenuItems().map((item) => {
            if (item.roles && item.roles.includes(user?.role || '')) {
              const Icon = item.icon;

              if ('isDropdown' in item && item.isDropdown) {
                const isExpanded = expandedMenus[item.key];
                const isDropdownHighlighted = isDropdownActive(item.subItems);

                return (
                  <li key={item.key}>
                    <button
                      onClick={() => {
                        if (isCollapsed && window.innerWidth >= 768) {
                          handleIconClick('#');
                        } else {
                          toggleMenu(item.key);
                        }
                      }}
                      className={`w-full flex items-center justify-between gap-3 ${isCollapsed ? 'px-1' : 'px-4'} py-3 rounded-lg transition-all duration-200 ease-in-out ${isDropdownHighlighted
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-[#BAE6FD]'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {(!isCollapsed || window.innerWidth < 768) && (
                          <span className="truncate transition-opacity duration-500 ease-in-out font-medium">{item.label}</span>
                        )}
                      </div>
                      {(!isCollapsed || window.innerWidth < 768) && (
                        <div className="transition-transform duration-300 ease-in-out">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      )}
                    </button>
                    {isExpanded && (!isCollapsed || window.innerWidth < 768) && item.subItems && (
                      <ul className="ml-8 mt-1 space-y-1 transition-all duration-300 ease-in-out">
                        {item.subItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <li key={subItem.path}>
                              <Link
                                to={subItem.path}
                                onClick={handleLinkClick}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ease-in-out ${isActive(subItem.path)
                                  ? 'bg-blue-500 text-white shadow-sm font-medium'
                                  : 'text-gray-600 hover:bg-[#BAE6FD]'
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
                      onClick={(e) => {
                        if (isCollapsed && window.innerWidth >= 768) {
                          e.preventDefault();
                          handleIconClick(regularItem.path);
                        } else {
                          handleLinkClick();
                        }
                      }}
                      className={`flex items-center gap-3 px-[0.5rem] py-3 rounded-lg transition-all duration-200 ease-in-out ${isActive(regularItem.path)
                        ? 'bg-blue-500 text-white shadow-sm font-medium'
                        : 'text-gray-700 hover:bg-[#BAE6FD]'
                        }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {(!isCollapsed || window.innerWidth < 768) && (
                        <span className="truncate transition-opacity duration-500 ease-in-out font-medium">{regularItem.label}</span>
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
