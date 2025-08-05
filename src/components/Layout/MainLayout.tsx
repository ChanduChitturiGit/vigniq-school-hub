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
  // Default to collapsed only on screens smaller than 1024px
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      // For screens 1024px and above, behave like 1440px screen (allow toggle)
      setIsCollapsed(!isCollapsed);
    } else if (window.innerWidth >= 768) {
      // For tablet screens (768px - 1023px), toggle collapse state
      setIsCollapsed(!isCollapsed);
    } else {
      // For mobile screens, toggle mobile menu
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // For screens 1024px and above, keep current state (like 1440px)
        // Don't auto-change the collapsed state
        setIsMobileMenuOpen(false);
      } else if (window.innerWidth >= 768) {
        // For tablet screens, allow collapsed state but close mobile menu
        setIsMobileMenuOpen(false);
      } else {
        // For mobile screens, always expand sidebar in mobile view and close mobile menu
        setIsCollapsed(false);
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

    return (
      <div className="flex h-screen bg-gray-50 relative">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 
          fixed lg:relative 
          z-50 lg:z-auto 
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
            <div className="max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }
);

export default MainLayout;
