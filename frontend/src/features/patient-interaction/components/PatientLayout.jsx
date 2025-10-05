import React, { useState } from 'react';
import { PatientClinicalSidebar } from './PatientClinicalSidebar';
import Topbar from './Topbar';

// Reusable Patient Layout Component
export const PatientLayout = ({ children, currentPage }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handlePageChange = (page) => {
    // Page change is handled by navigation in the sidebar
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <PatientClinicalSidebar 
        isExpanded={isSidebarExpanded}
        onToggle={toggleSidebar}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
      <div style={{ 
        flex: 1, 
        marginLeft: isSidebarExpanded ? 256 : 64, 
        minHeight: '100vh', 
        background: 'transparent',
        transition: 'margin-left 0.3s ease'
      }}>
        <Topbar sidebarWidth={isSidebarExpanded ? 256 : 64} />
        <main style={{ 
          padding: '120px 32px 32px 32px', 
          maxWidth: 1400, 
          margin: '0 auto', 
          minHeight: 'calc(100vh - 120px)'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;