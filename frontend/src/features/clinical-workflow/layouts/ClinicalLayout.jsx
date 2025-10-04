import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ClinicalSidebar } from '../components/ClinicalSidebar';

/**
 * 🩺 Clinical Layout - Wrapper for Clinical Pages
 * 
 * Features:
 * ✅ Consistent sidebar navigation across clinical pages
 * ✅ Responsive layout with sidebar toggle
 * ✅ Medical-themed styling
 * ✅ Route-aware active states
 */

export const ClinicalLayout = ({ children, currentPath }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Use provided currentPath or fall back to location.pathname
  const activePath = currentPath || location.pathname;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 pt-20">
      {/* Clinical Sidebar */}
      <ClinicalSidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={handleToggleSidebar}
        currentPath={activePath}
      />
      
      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-72'
      }`}>
        <div className="p-6 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ClinicalLayout;