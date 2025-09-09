import React, { useState, forwardRef } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

// 👇 use forwardRef here
const MainLayout = forwardRef<HTMLDivElement, MainLayoutProps>(
  ({ children, pageTitle }, ref) => {
  // Default to expanded for screens 1024px and above (like 1440px behavior)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth >= 768) {
      setIsCollapsed(!isCollapsed);
    } else {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };

  // Handle window resize - keep expanded for 1024px+ screens
  React.useEffect(() => {
    const handleResize = () => {
      // For screens 1024px and above, default to expanded (like 1440px behavior)
      if (window.innerWidth >= 1024) {
        // Don't auto-change state, let user control it
      } else {
        // Below 1024px, collapse the sidebar
        setIsCollapsed(true);
      }
      // Close mobile menu when resizing to larger screens
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

    return (
      // bg-gray-50  bg-[#f1f8fd]
      <div className="flex h-screen bg-gray-50 relative">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 
          fixed md:relative 
          z-50 md:z-auto 
          transition-transform duration-300 ease-in-out
        `}>
          <Sidebar 
            isCollapsed={isCollapsed} 
            isMobileMenuOpen={isMobileMenuOpen}
            onMobileClose={() => setIsMobileMenuOpen(false)}
            onExpandSidebar={() => setIsCollapsed(false)}
          />
        </div>
        
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar 
            isCollapsed={isCollapsed} 
            toggleSidebar={toggleSidebar} 
            pageTitle={pageTitle} 
          />
          {/* 👇 forward the ref here */}
          <main ref={ref} className="flex-1 overflow-y-auto p-6">
            <div className="max-w-full mb-[1rem]">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }
);

export default MainLayout;
