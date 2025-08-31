
import React from 'react';
import { Menu, User, LogOut, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TopNavbarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  pageTitle: string;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ isCollapsed, toggleSidebar, pageTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const userName = userData.role=='superadmin' && !userData?.first_name && !userData?.last_name ? userData?.user_name : (userData?.first_name +' '+userData?.last_name) ; // 'name' ;
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    localStorage.clear();
    navigate('/');

  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };

  const handleHelpClick = () => {
    if(userData.role == 'superadmin'){
      navigate('/requests');
    }else{
      navigate('/support');
    }
    setShowUserMenu(false);
  };

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-[1rem] md:text-xl font-semibold text-gray-800">{pageTitle}</h1>
      </div>

      {/* Right Section */}
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-sm font-medium text-gray-800">{userName}</div>
            <div className="text-xs text-gray-500">{user?.role}</div>
          </div>
        </button>

        {/* User Dropdown Menu */}
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="text-sm font-medium text-gray-800 truncate" title={userName}>{userName}</div>
              <div className="text-xs text-gray-500 truncate" title={user?.email}>{user?.email}</div>
            </div>
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={handleHelpClick}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Help & Support
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopNavbar;
