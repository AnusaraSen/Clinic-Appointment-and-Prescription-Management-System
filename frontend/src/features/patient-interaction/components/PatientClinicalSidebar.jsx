import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Activity, 
  ClipboardList, 
  User,
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
      name: 'Appointments', // Redirects to Find Doctors
      icon: <Calendar className="h-5 w-5" />,
      page: 'appointments',
      path: '/patient/doctors'
    },
    {
      name: 'Feedbacks', // Redirects to new feedbacks page
      icon: <ClipboardList className="h-5 w-5" />,
      page: 'feedback',
      path: '/feedback'
    },
    {
      name: 'Lab Reports',
      icon: <Activity className="h-5 w-5" />,
      page: 'lab-reports',
      path: '/dashboard/lab-reports'
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
    if (pathname === '/patient/dashboard' || pathname === '/dashboard') return 'dashboard';
  if (pathname === '/patient/doctors' || pathname === '/doctors' || pathname === '/appointments') return 'appointments'; // treat doctors as appointments
    if (pathname.includes('/feedback')) return 'feedback';
    if (pathname.includes('/lab-reports')) return 'lab-reports';
    
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
        bg-white/95 backdrop-blur-sm border-r border-gray-100 flex-shrink-0 
        fixed inset-y-0 left-0 transition-all duration-300 ease-in-out z-10
        ${isExpanded ? 'w-64' : 'w-16'} rounded-r-2xl shadow-xl
      `}>
        
        {/* Header section with patient portal branding */}
        <div className="h-16 flex items-center justify-center border-b border-gray-100 px-2">
          {isExpanded ? (
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-800 tracking-tight">Patient Portal</span>
            </div>
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
              <User className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        {/* Navigation menu with patient theme */}
        <nav className="mt-4 px-2 space-y-1">
          {menuItems.map(item => {
            const isActive = activePage === item.page;
            return (
              <button 
                key={item.name} 
                onClick={() => handleNavigation(item.page, item.path)}
                className={`
                  group relative flex items-center py-2 text-sm font-medium rounded-lg transition-all duration-200 w-full text-left
                  ${isExpanded ? 'px-3' : 'px-2 justify-center'}
                  ${isActive
                    ? 'bg-gradient-to-r from-teal-50 to-white text-teal-700 ring-1 ring-teal-100 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                `}
                title={!isExpanded ? item.name : ''}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && isExpanded && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r bg-teal-500" aria-hidden="true" />
                )}
                <span
                  className={`
                    ${isExpanded ? 'mr-3' : ''}
                    w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                    ${isActive ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'}
                  `}
                >
                  {item.icon}
                </span>
                {isExpanded && (
                  <span className="truncate tracking-tight">
                    {item.name}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};