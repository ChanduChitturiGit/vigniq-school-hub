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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth >= 768) {
      setIsCollapsed(!isCollapsed);
    } else {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };

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
