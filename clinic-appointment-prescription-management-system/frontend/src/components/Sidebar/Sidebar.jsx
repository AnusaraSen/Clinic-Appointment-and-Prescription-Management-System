import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ onToggle }) => {
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

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="header-content">
          <h3>Inventory Manager Dashboard</h3>
          <button className="toggle-btn" onClick={toggleSidebar}>
            <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <Link 
          to="/dashboard" 
          className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          title="Dashboard"
        >
          <i className="fas fa-tachometer-alt"></i>
          <span className="nav-text">Dashboard</span>
        </Link>
        
        <Link 
          to="/lab/list" 
          className={`nav-item ${isActive('/lab') ? 'active' : ''}`}
          title="Lab Inventory"
        >
          <i className="fas fa-flask"></i>
          <span className="nav-text">Lab Inventory</span>
        </Link>
        
        <Link 
          to="/medicine/list" 
          className={`nav-item ${isActive('/medicine') ? 'active' : ''}`}
          title="Medicine Inventory"
        >
          <i className="fas fa-pills"></i>
          <span className="nav-text">Medicine Inventory</span>
        </Link>
        
        <Link 
          to="/orders" 
          className={`nav-item ${isActive('/orders') ? 'active' : ''}`}
          title="Order Management"
        >
          <i className="fas fa-shopping-cart"></i>
          <span className="nav-text">Order Management</span>
        </Link>
        
        <Link 
          to="/inventory-manager-profile" 
          className={`nav-item ${isActive('/inventory-manager-profile') ? 'active' : ''}`}
          title="Profile"
        >
          <i className="fas fa-user-circle"></i>
          <span className="nav-text">Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
