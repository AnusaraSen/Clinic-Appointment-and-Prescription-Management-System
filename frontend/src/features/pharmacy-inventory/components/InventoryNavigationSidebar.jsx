import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../../styles/InventoryNavigationSidebar.css';

const InventoryNavigationSidebar = ({ collapsed = false, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    // Set active section based on current path
    const path = location.pathname;
    if (path.includes('/inventory-dashboard') || path === '/dashboard') {
      setActiveSection('dashboard');
    } else if (path.includes('/medicine') || path.includes('/medicine-inventory')) {
      setActiveSection('medicines');
    } else if (path.includes('/chemical-inventory')) {
      setActiveSection('chemicals');
    } else if (path.includes('/equipment-inventory')) {
      setActiveSection('equipment');
    } else if (path.includes('/orders')) {
      setActiveSection('orders');
    }
  }, [location.pathname]);

  const navigationItems = [
    {
      section: 'dashboard',
      title: 'Inventory Dashboard',
      icon: 'fas fa-tachometer-alt',
      path: '/inventory-dashboard',
      description: 'Overview of inventory metrics and alerts'
    },
    {
      section: 'medicines',
      title: 'Medicine Inventory',
      icon: 'fas fa-pills',
      path: '/medicine-inventory',
      description: 'Manage pharmaceutical products'
    },
    {
      section: 'chemicals',
      title: 'Chemical Inventory',
      icon: 'fas fa-flask',
      path: '/chemical-inventory',
      description: 'Manage laboratory chemicals and reagents'
    },
    {
      section: 'equipment',
      title: 'Equipment Inventory', 
      icon: 'fas fa-microscope',
      path: '/equipment-inventory',
      description: 'Manage laboratory equipment and instruments'
    },
    {
      section: 'orders',
      title: 'Order Management',
      icon: 'fas fa-shopping-cart',
      path: '/orders',
      description: 'Track and manage inventory orders'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (typeof onToggle === 'function') onToggle(next);
  };

  return (
  <div className={`inventory-nav-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="inventory-nav-sidebar-header">
        <div className="inventory-nav-sidebar-logo">
          <div className="nav-logo-icon">
            <i className="fas fa-warehouse"></i>
          </div>
          {!isCollapsed && (
            <div className="nav-logo-text">
              <h3>Inventory</h3>
              <span>Management System</span>
            </div>
          )}
        </div>
        <button
          className="nav-sidebar-toggle-btn"
          onClick={toggleSidebar}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="inventory-nav-sidebar-nav">
        <ul className="nav-menu-list">
          {navigationItems.map((item) => (
            <li key={item.section} className="nav-menu-item">
              <div 
                className={`nav-menu-link ${activeSection === item.section ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                <div className="nav-menu-link-content">
                  <div className="nav-menu-icon">
                    <i className={item.icon}></i>
                  </div>
                  {!isCollapsed && (
                    <div className="nav-menu-text">
                      <span className="nav-menu-title">{item.title}</span>
                      <span className="nav-menu-description">{item.description}</span>
                    </div>
                  )}
                </div>
                {isCollapsed && (
                  <div className="nav-menu-tooltip">
                    <div className="tooltip-title">{item.title}</div>
                    <div className="tooltip-description">{item.description}</div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="inventory-nav-sidebar-footer">
          <div className="nav-footer-stats">
            <div className="nav-stat-item">
              <div className="nav-stat-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="nav-stat-info">
                <div className="nav-stat-label">System Status</div>
                <div className="nav-stat-value">Active</div>
              </div>
            </div>
          </div>
          
          <div className="nav-footer-actions">
            <button 
              className="nav-footer-btn"
              onClick={() => handleNavigation('/inventory-settings')}
              title="Settings"
            >
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryNavigationSidebar;