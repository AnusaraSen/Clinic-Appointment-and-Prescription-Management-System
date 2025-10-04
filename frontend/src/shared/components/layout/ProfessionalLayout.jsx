import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProfessionalSidebar from './ProfessionalSidebar';
import ProfessionalTopNav from './ProfessionalTopNav';

/**
 * Professional Layout Component (Converted from reference Layout.tsx)
 * Provides the main layout structure with collapsible sidebar and top navigation
 */
const ProfessionalLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Check if we're on mobile initially
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return false; // Start collapsed on mobile
    }
    // Try to get saved preference for desktop
    try {
      const saved = localStorage.getItem('sidebarOpen');
      return saved === null ? true : saved === 'true';
    } catch (e) {
      return true;
    }
  });

  const location = useLocation();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      // Auto-collapse on mobile, restore preference on desktop
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        try {
          const saved = localStorage.getItem('sidebarOpen');
          if (saved !== null) {
            setSidebarOpen(saved === 'true');
          }
        } catch (e) {
          setSidebarOpen(true);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save sidebar state to localStorage (for desktop)
  useEffect(() => {
    if (window.innerWidth >= 768) {
      try {
        localStorage.setItem('sidebarOpen', sidebarOpen.toString());
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }, [sidebarOpen]);

  // Determine current page from location
  const getCurrentPage = () => {
    const path = location.pathname.replace('/', '');
    return path || 'dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ProfessionalSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        currentPage={getCurrentPage()}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <ProfessionalTopNav 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ProfessionalLayout;