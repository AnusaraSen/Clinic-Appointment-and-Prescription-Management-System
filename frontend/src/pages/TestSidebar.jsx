import React, { useEffect } from 'react';
import PharmacistSidebar from '../features/pharmacy-inventory/components/PharmacistSidebar';

const TestSidebar = () => {
  useEffect(() => {
    document.body.classList.add('has-fixed-navbar');
    return () => {
      document.body.classList.remove('has-fixed-navbar');
    };
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f0f0',
      position: 'relative'
    }}>
      <PharmacistSidebar activeTab="dashboard" />
      <div style={{
        marginLeft: '300px',
        padding: '20px',
        color: '#333',
        minHeight: '100vh'
      }}>
        <h1>Test Sidebar Page</h1>
        <p>This is a test page to check if the PharmacistSidebar is rendering correctly.</p>
        <p>The sidebar should appear on the left side of this content.</p>
        <p>If you can see this text but no sidebar, there's an issue with the sidebar component.</p>
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
          <h2>Debug Info</h2>
          <p>Current URL: {window.location.pathname}</p>
          <p>Test content to verify layout is working</p>
        </div>
      </div>
    </div>
  );
};

export default TestSidebar;