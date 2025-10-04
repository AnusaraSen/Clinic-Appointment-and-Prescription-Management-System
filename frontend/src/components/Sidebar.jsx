import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      icon: 'fas fa-tachometer-alt',
      label: 'Dashboard',
      path: '/dashboard'
    },
    {
      icon: 'fas fa-flask',
      label: 'Lab Inventory',
      path: '/lab-inventory'
    },
    {
      icon: 'fas fa-pills',
      label: 'Medicine Inventory',
      path: '/medicine-list'
    },
    {
      icon: 'fas fa-shopping-cart',
      label: 'Order Management',
      path: '/orders'
    }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Inventory Manager Dashboard</h3>
      </div>
      
      <div className="sidebar-menu">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
