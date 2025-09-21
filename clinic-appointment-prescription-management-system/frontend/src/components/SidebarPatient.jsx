import React from 'react';
import { User, FileText, FolderOpen, Activity, ClipboardList, HelpCircle, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import '../css/Sidebar.css';

const navItems = [
  { label: 'My Account', icon: <User size={20} />, to: '/dashboard' },
  { label: 'Find Doctors', icon: <User size={20} />, to: '/doctors' },
  { label: 'Prescriptions', icon: <FileText size={20} />, to: '/dashboard/prescriptions' },
  { label: 'Medical Records', icon: <FolderOpen size={20} />, to: '/dashboard/medical-records' },
  { label: 'Lab Reports', icon: <Activity size={20} />, to: '/dashboard/lab-reports' },
  { label: 'Feedback', icon: <ClipboardList size={20} />, to: '/feedback/add' },
  { label: 'Support', icon: <HelpCircle size={20} />, to: '/dashboard/support' },
  { label: 'Logout', icon: <LogOut size={20} />, to: '/logout' },
];

const Sidebar = () => {
  const location = useLocation();
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="logo">HealthConnect</span>
      </div>
      <nav>
        <ul>
          {navItems.map(item => {
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
            <li key={item.label} className={isActive ? 'active' : ''}>
              <Link to={item.to}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
