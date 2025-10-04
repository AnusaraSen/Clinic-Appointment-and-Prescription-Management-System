import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../../styles/PharmacistSidebar.css';

const PharmacistSidebar = ({ activeTab, onTabChange, onSidebarToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);



  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      path: '/pharmacist/dashboard'
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      icon: 'fas fa-prescription-bottle-alt',
      path: '/pharmacist/prescriptions'
    },
    {
      id: 'dispensing',
      label: 'Dispensing Module',
      icon: 'fas fa-pills',
      path: '/pharmacist/dispensing'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'fas fa-user-md',
      path: '/pharmacist/profile'
    }
  ];

  const handleItemClick = (item) => {
    if (onTabChange) {
      // Use the onTabChange handler for internal navigation
      onTabChange(item.id);
    } else {
      // Fallback to direct navigation
      navigate(item.path);
    }
  };

  const getActiveItem = () => {
    if (activeTab) {
      return activeTab;
    }
    
    // Determine active item based on current path
    const currentPath = location.pathname;
    if (currentPath.includes('/prescriptions')) return 'prescriptions';
    if (currentPath.includes('/dispensing')) return 'dispensing';
    if (currentPath.includes('/profile')) return 'profile';
    return 'dashboard';
  };

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    // Notify parent component about sidebar state change
    if (onSidebarToggle) {
      onSidebarToggle(newCollapsedState);
    }
  };



  return (
    <div className={`pharmacist-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        
        <div className="header-content">
          <button 
            className="toggle-btn"
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
          </button>
          <br></br><br></br>
        
      </div>
        <ul className="nav-list">
          {sidebarItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${getActiveItem() === item.id ? 'active' : ''}`}
                onClick={() => handleItemClick(item)}
                title={isCollapsed ? item.label : ''}
              >
                <div className="nav-icon">
                  <i className={item.icon}></i>
                </div>
                {!isCollapsed && (
                  <span className="nav-label">{item.label}</span>
                )}
                {isCollapsed && (
                  <div className="nav-tooltip">
                    {item.label}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="pharmacist-info">
            <div className="avatar">
              <i className="fas fa-user-circle"></i>
            </div>
            <div className="info">
              <h4>Dr. Sarah Johnson</h4>
              <span>Senior Pharmacist</span>
            </div>
          </div>
          <button className="logout-btn" title="Logout">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default PharmacistSidebar;
