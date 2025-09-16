import React, { useEffect, useState } from 'react';
import { Menu, User, LogOut, HelpCircle, Bell } from 'lucide-react';
import { format, isToday, isYesterday, differenceInSeconds, differenceInMinutes, differenceInHours } from "date-fns";
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getSupportNotifications } from '../../services/support';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { get } from 'http';

interface TopNavbarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  pageTitle: string;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ isCollapsed, toggleSidebar, pageTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = React.useState(false); // Notification dropdown state
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const userName = userData.role == 'superadmin' && !userData?.first_name && !userData?.last_name ? userData?.user_name : (userData?.first_name + ' ' + userData?.last_name);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const notificationMenuRef = React.useRef<HTMLDivElement>(null);

  // Mock notifications
  const [notifications, setNotifications] = useState([]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    localStorage.clear();
    sessionStorage.clear();
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


  const formatChatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();

    const diffSeconds = differenceInSeconds(now, d);
    const diffMinutes = differenceInMinutes(now, d);
    const diffHours = differenceInHours(now, d);

    if (diffSeconds < 60) {
      return diffSeconds > 0 ? `${diffSeconds} seconds ago` : 'Just now';
    }
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    }
    if (diffHours < 2) {
      return `${diffHours} hours ago`;
    }
    if (isToday(d)) {
      return `Today, ${format(d, "hh:mm a")}`;
    }
    if (isYesterday(d)) {
      return `Yesterday, ${format(d, "hh:mm a")}`;
    }
    return format(d, "dd-MM-yyyy, hh:mm a");
  };

  const fetchNotifications = async () => {
    try {
      const response = await getSupportNotifications();
      if (response && response.data) {
        // console.log('Fetched notifications:', response);
        setNotifications(response.data || []);
      }
      // Update notifications state if needed
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = (ticket_id: number) => {
    navigate(`/support-details/${ticket_id}`);
    setShowNotificationMenu(false);
  }

  // Fetch notifications from backend (example)
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setShowNotificationMenu(false);
      }
    };

    if (showUserMenu || showNotificationMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showNotificationMenu]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-2 md:px-4">
      {/* Left Section */}
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-[1rem] md:text-xl font-semibold text-gray-800">{pageTitle}</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notification Icon */}
        <div className="relative" ref={notificationMenuRef}>
          <button
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu)
              fetchNotifications()
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {/* Red dot for unread notifications */}
            {
              notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )
            }
          </button>
          {/* Notification Dropdown */}
          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-56 md:w-64 max-h-72 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100 font-semibold text-gray-800">
                Notifications
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500">No new notifications</div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.ticket_id} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                  onClick={() => handleNotificationClick(notif.ticket_id)}>
                    {/* <div>{notif.latest_message}</div> */}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {notif.latest_message}
                    </ReactMarkdown>
                    <div className="text-xs text-gray-400">{formatChatDate(notif.latest_message_time)}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="User menu"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-left hidden xs:hidden sm:block">
              <div className="text-sm font-medium text-gray-800 truncate max-w-[100px]">{userName}</div>
              <div className="text-xs text-gray-500 truncate max-w-[100px]">{user?.role}</div>
            </div>
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-40 md:w-48 max-h-72 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
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
      </div>
    </header>
  );
};

export default TopNavbar;
