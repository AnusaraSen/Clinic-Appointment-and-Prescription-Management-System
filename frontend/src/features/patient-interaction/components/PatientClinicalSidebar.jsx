import React from 'react';
import { 
  LayoutDashboard, 
  User, 
  Calendar, 
  FileText, 
  Activity, 
  FolderOpen, 
  ClipboardList, 
  HelpCircle, 
  LogOut,
  Menu, 
  X 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// Reusable Patient Clinical Sidebar Component
export const PatientClinicalSidebar = ({ isExpanded, onToggle, currentPage, onPageChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Patient-specific menu items using clinical sidebar design
  const menuItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      page: 'dashboard',
      path: '/patient/dashboard'
    },
    {
      name: 'Find Doctors',
      icon: <User className="h-5 w-5" />,
      page: 'doctors',
      path: '/doctors'
    },
    {
      name: 'My Appointments',
      icon: <Calendar className="h-5 w-5" />,
      page: 'appointments',
      path: '/appointments'
    },
    {
      name: 'Prescriptions',
      icon: <FileText className="h-5 w-5" />,
      page: 'prescriptions',
      path: '/dashboard/prescriptions'
    },
    {
      name: 'Lab Reports',
      icon: <Activity className="h-5 w-5" />,
      page: 'lab-reports',
      path: '/dashboard/lab-reports'
    },
    {
      name: 'Medical Records',
      icon: <FolderOpen className="h-5 w-5" />,
      page: 'medical-records',
      path: '/dashboard/medical-records'
    },
    {
      name: 'My Feedback',
      icon: <ClipboardList className="h-5 w-5" />,
      page: 'feedback',
      path: '/feedback'
    },
    {
      name: 'Support',
      icon: <HelpCircle className="h-5 w-5" />,
      page: 'support',
      path: '/dashboard/support'
    },
    {
      name: 'Logout',
      icon: <LogOut className="h-5 w-5" />,
      page: 'logout',
      path: '/logout'
    }
  ];

  const handleNavigation = (page, path) => {
    if (onPageChange) {
      onPageChange(page);
    }
    if (path) {
      navigate(path);
    }
  };

  // Determine current page based on location pathname if not explicitly set
  const getCurrentPage = () => {
    if (currentPage) return currentPage;
    
    const pathname = location.pathname;
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname === '/doctors') return 'doctors';
    if (pathname === '/appointments') return 'appointments';
    if (pathname.includes('/prescriptions')) return 'prescriptions';
    if (pathname.includes('/lab-reports')) return 'lab-reports';
    if (pathname.includes('/medical-records')) return 'medical-records';
    if (pathname.includes('/feedback')) return 'feedback';
    if (pathname.includes('/support')) return 'support';
    
    return 'dashboard'; // default
  };

  const activePage = getCurrentPage();

  return (
    <>
      {/* Sidebar toggle button with patient theme */}
      <button 
        onClick={onToggle} 
        className="fixed top-4 left-4 z-20 p-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg" 
        aria-label="Toggle sidebar"
        title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Main sidebar container with clinical design */}
      <aside className={`
        bg-white border-r border-gray-200 flex-shrink-0 
        fixed inset-y-0 left-0 transition-all duration-300 ease-in-out z-10
        ${isExpanded ? 'w-64' : 'w-16'}
      `}>
        
        {/* Header section with patient portal branding */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 px-2">
          {isExpanded && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-800">Patient Portal</span>
            </div>
          )}
        </div>

        {/* Navigation menu with patient theme */}
        <nav className="mt-5 px-2 space-y-1">
          {menuItems.map(item => (
            <button 
              key={item.name} 
              onClick={() => handleNavigation(item.page, item.path)}
              className={`
                group flex items-center py-2 text-sm font-medium rounded-md transition-all duration-200 w-full text-left
                ${isExpanded ? 'px-2' : 'px-2 justify-center'}
                ${activePage === item.page
                  ? 'bg-teal-50 text-teal-600' // Active item styling with patient theme
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900' // Normal item styling
                }
              `}
              title={!isExpanded ? item.name : ''} // Show tooltip when collapsed
            >
              {/* Icon with dynamic coloring */}
              <span className={`${activePage === item.page ? 'text-teal-600' : 'text-gray-500'} ${isExpanded ? 'mr-3' : ''}`}>
                {item.icon}
              </span>
              {/* Text label - only show when expanded */}
              {isExpanded && (
                <span className="truncate">
                  {item.name}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};