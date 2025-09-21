import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css'; // Reuse the same sidebar styling

const PharmacistSidebar = ({ onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    
    // Notify parent component if callback is provided
    if (onToggle) {
      onToggle(newCollapsedState);
    }
  };

  // Update body class to handle main content margin
  useEffect(() => {
    const body = document.body;
    if (isCollapsed) {
      body.classList.add('sidebar-collapsed');
    } else {
      body.classList.remove('sidebar-collapsed');
    }

    return () => {
      body.classList.remove('sidebar-collapsed');
    };
  }, [isCollapsed]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="header-content">
          <h3>Pharmacist Dashboard</h3>
          <button className="toggle-btn" onClick={toggleSidebar}>
            <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <div
          className={`nav-item ${isActive('/pharmacist/dashboard') ? 'active' : ''}`}
          onClick={() => handleNavigation('/pharmacist/dashboard')}
          title="Dashboard"
          style={{ cursor: 'pointer' }}
        >
          <i className="fas fa-tachometer-alt"></i>
          <span className="nav-text">Dashboard</span>
        </div>
        
        <div
          className={`nav-item ${isActive('/prescriptions') ? 'active' : ''}`}
          onClick={() => handleNavigation('/pharmacist/dashboard')}
          title="Prescriptions"
          style={{ cursor: 'pointer' }}
        >
          <i className="fas fa-prescription"></i>
          <span className="nav-text">Prescriptions</span>
        </div>
        
        <div
          className={`nav-item ${isActive('/dispensing') ? 'active' : ''}`}
          onClick={() => handleNavigation('/pharmacist/dashboard')}
          title="Dispensing Module"
          style={{ cursor: 'pointer' }}
        >
          <i className="fas fa-pills"></i>
          <span className="nav-text">Dispensing Module</span>
        </div>
        
        <div
          className={`nav-item ${isActive('/pharmacist-profile') ? 'active' : ''}`}
          onClick={() => handleNavigation('/pharmacist-profile')}
          title="Profile"
          style={{ cursor: 'pointer' }}
        >
          <i className="fas fa-user-circle"></i>
          <span className="nav-text">Profile</span>
        </div>
      </nav>
    </div>
  );
};

export default PharmacistSidebar;