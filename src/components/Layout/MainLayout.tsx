
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
  // Default to collapsed on tablet screens (768px - 1024px)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      // For desktop/tablet screens, sidebar stays open - only toggle hamburger state
      setIsCollapsed(!isCollapsed);
    }
  };

  // Handle window resize to maintain consistent behavior
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Mobile: use mobile menu state
        setIsCollapsed(true);
        setIsMobileMenuOpen(false);
      } else {
        // Desktop/Tablet: sidebar always visible, no collapse
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
