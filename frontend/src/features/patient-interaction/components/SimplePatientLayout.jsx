import React, { useState } from 'react';
import { PatientClinicalSidebar } from './PatientClinicalSidebar';

// Simple Patient Layout Component without Topbar API dependencies
export const SimplePatientLayout = ({ children, currentPage }) => {
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
        {/* Simple header without API calls */}
        <div style={{
          height: '80px',
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'fixed',
          top: 0,
          left: isSidebarExpanded ? 256 : 64,
          right: 0,
          zIndex: 10,
          transition: 'left 0.3s ease'
        }}>
          <h1 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem' }}>Patient Portal</h1>
          <div style={{ 
            padding: '8px 16px', 
            background: '#f3f4f6', 
            borderRadius: '8px', 
            color: '#6b7280' 
          }}>
            Welcome, Patient
          </div>
        </div>
        
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

export default SimplePatientLayout;