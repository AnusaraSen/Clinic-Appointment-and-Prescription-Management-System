import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ClinicalSidebar.css';

const ClinicalSidebar = ({ onToggle }) => {
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
      body.classList.add('clinical-sidebar-collapsed');
    } else {
      body.classList.remove('clinical-sidebar-collapsed');
    }

    return () => {
      body.classList.remove('clinical-sidebar-collapsed');
    };
  }, [isCollapsed]);

  return (
    <div className={`clinical-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="clinical-sidebar-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">🏥</div>
            <h3>MediCare Pro</h3>
          </div>
          <button className="toggle-btn" onClick={toggleSidebar}>
            <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>
      </div>
      
      <nav className="clinical-sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">
            <span className="nav-text">Overview</span>
          </div>
          
          <Link 
            to="/dashboard" 
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            title="Dashboard"
          >
            <i className="fas fa-chart-line"></i>
            <span className="nav-text">Dashboard</span>
          </Link>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">
            <span className="nav-text">Schedule</span>
          </div>
          
          <Link 
            to="/doctor-availability" 
            className={`nav-item ${isActive('/doctor-availability') ? 'active' : ''}`}
            title="Availability"
          >
            <i className="fas fa-calendar-check"></i>
            <span className="nav-text">Availability</span>
          </Link>
          
          <Link 
            to="/doctor-calendar" 
            className={`nav-item ${isActive('/doctor-calendar') ? 'active' : ''}`}
            title="Calendar"
          >
            <i className="fas fa-calendar-alt"></i>
            <span className="nav-text">Calendar</span>
          </Link>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">
            <span className="nav-text">Patient Care</span>
          </div>
          
          <Link 
            to="/getPatient" 
            className={`nav-item ${isActive('/getPatient') ? 'active' : ''}`}
            title="All Patients"
          >
            <i className="fas fa-users"></i>
            <span className="nav-text">All Patients</span>
          </Link>
          
          <Link 
            to="/allPrescriptions" 
            className={`nav-item ${isActive('/allPrescriptions') ? 'active' : ''}`}
            title="Prescriptions"
          >
            <i className="fas fa-prescription-bottle-alt"></i>
            <span className="nav-text">Prescriptions</span>
          </Link>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">
            <span className="nav-text">Profile</span>
          </div>
          
          <Link 
            to="/doctor-profile" 
            className={`nav-item ${isActive('/doctor-profile') ? 'active' : ''}`}
            title="Doctor Profile"
          >
            <i className="fas fa-user-md"></i>
            <span className="nav-text">Doctor Profile</span>
          </Link>
        </div>
      </nav>

      <div className="clinical-sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            <i className="fas fa-user-md"></i>
          </div>
          <div className="user-details">
            <span className="nav-text user-name">Dr. Alex Mitchell</span>
            <span className="nav-text user-role">Senior Physician</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalSidebar;