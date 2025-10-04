import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  BarChart2, 
  Settings as SettingsIcon, 
  ChevronLeft, 
  ChevronRight, 
  Stethoscope,
  Wrench,
  ClipboardList,
  Activity,
  Calendar,
  LogOut,
  TestTube,
  FlaskConical,
  FileBarChart,
  Pill,
  Package
} from 'lucide-react';
import { useAuth } from "../../../features/authentication/context/AuthContext";

/**
 * Professional Sidebar Component (Converted from reference Sidebar.tsx)
 * Provides collapsible navigation with modern styling and maintenance-focused menu items
 */
const ProfessionalSidebar = ({ 
  sidebarOpen = true, 
  setSidebarOpen = () => {},
  currentPage
}) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Navigation items adapted for clinic maintenance management
  const getNavItems = () => {
    // For Pharmacist users, show pharmacist-specific navigation
    if (user?.role === 'Pharmacist') {
      return [
        {
          name: 'Dashboard',
          icon: <LayoutDashboard size={20} />,
          page: 'dashboard',
          path: '/pharmacist/dashboard'
        },
        {
          name: 'Prescriptions',
          icon: <Pill size={20} />,
          page: 'prescriptions',
          path: '/prescriptions'
        },
        {
          name: 'Dispensing Module',
          icon: <Package size={20} />,
          page: 'dispensing',
          path: '/dispensing'
        },
        {
          name: 'Profile',
          icon: <UserCircle size={20} />,
          page: 'profile',
          path: '/pharmacist-profile'
        }
      ];
    }

    // For Admin users, show admin-specific navigation
    if (user?.role === 'Admin') {
      return [
        {
          name: 'Dashboard',
          icon: <LayoutDashboard size={20} />,
          page: 'admin-dashboard',
          path: '/dashboard/admin'
        },
        {
          name: 'Users',
          icon: <Users size={20} />,
          page: 'users',
          path: '/users'
        },
        {
          name: 'Maintenance',
          icon: <Wrench size={20} />,
          page: 'maintenance',
          path: '/maintenance'
        },
        {
          name: 'Equipment',
          icon: <Activity size={20} />,
          page: 'equipment',
          path: '/equipment'
        },
        {
          name: 'Reports',
          icon: <BarChart2 size={20} />,
          page: 'reports',
          path: '/reports'
        },
        {
          name: 'Settings',
          icon: <SettingsIcon size={20} />,
          page: 'settings',
          path: '/settings'
        }
      ];
    }

    // For technicians, only show dashboard
    if (user?.role === 'Technician') {
      return [
        {
          name: 'Dashboard',
          icon: <LayoutDashboard size={20} />,
          page: 'technician-dashboard',
          path: '/technician-dashboard'
        }
      ];
    }

    // For Lab Supervisors, show lab-specific navigation
    if (user?.role === 'LabSupervisor') {
      return [
        {
          name: 'Lab Dashboard',
          icon: <LayoutDashboard size={20} />,
          page: 'lab-dashboard',
          path: '/lab-workflow/dashboard'
        },
        {
          name: 'Lab Tasks',
          icon: <ClipboardList size={20} />,
          page: 'lab-tasks',
          path: '/lab-workflow/tasks'
        }
      ];
    }

    // For Lab Staff, show assistant-specific navigation (simplified view)
    if (user?.role === 'LabStaff') {
      return [
        {
          name: 'My Tasks',
          icon: <ClipboardList size={20} />,
          page: 'my-tasks',
          path: '/lab-workflow/tasks'
        },
        {
          name: 'Lab Results',
          icon: <FileBarChart size={20} />,
          page: 'lab-results',
          path: '/lab-workflow/test-results'
        },
        {
          name: 'Equipment',
          icon: <Activity size={20} />,
          page: 'equipment',
          path: '/equipment'
        }
      ];
    }

    // For Inventory Managers, show inventory-specific navigation
    if (user?.role === 'InventoryManager') {
      return [
        {
          name: 'Dashboard',
          icon: <LayoutDashboard size={20} />,
          page: 'dashboard',
          path: '/inventory-dashboard'
        },
        {
          name: 'Lab Inventory',
          icon: <TestTube size={20} />,
          page: 'lab-inventory',
          path: '/lab-inventory'
        },
        {
          name: 'Medicine Inventory',
          icon: <Pill size={20} />,
          page: 'medicine-inventory',
          path: '/medicine-inventory'
        },
        {
          name: 'Order Management',
          icon: <Package size={20} />,
          page: 'order-management',
          path: '/order-management'
        },
        {
          name: 'Profile',
          icon: <UserCircle size={20} />,
          page: 'profile',
          path: '/inventory-profile'
        }
      ];
    }

    // For non-technician users, show regular admin items
    const baseItems = [
      {
        name: 'Dashboard',
        icon: <LayoutDashboard size={20} />,
        page: 'dashboard',
        path: '/dashboard'
      },
      {
        name: 'Users',
        icon: <Users size={20} />,
        page: 'users',
        path: '/users'
      },
      {
        name: 'Maintenance',
        icon: <Wrench size={20} />,
        page: 'maintenance',
        path: '/maintenance'
      },
      {
        name: 'Reports',
        icon: <BarChart2 size={20} />,
        page: 'reports',
        path: '/reports'
      },
      {
        name: 'Settings',
        icon: <SettingsIcon size={20} />,
        page: 'settings',
        path: '/settings'
      }
    ];

    return baseItems;
  };

  const navItems = getNavItems();

  const handleNavClick = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleToggle = () => {
    const next = !sidebarOpen;
    // Only save to localStorage on desktop
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      try { 
        localStorage.setItem('sidebarOpen', next); 
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    setSidebarOpen(next);
  };

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
      sidebarOpen ? 'w-64' : 'w-20'
    } relative flex-shrink-0 min-h-screen z-10 flex flex-col ${
      // On mobile, overlay the content when open
      sidebarOpen ? 'md:relative absolute inset-y-0 left-0' : ''
    }`}>
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[-1] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Toggle button - positioned outside the sidebar when collapsed */}
      {!sidebarOpen && (
        <button
          onClick={handleToggle}
          className="absolute -right-4 top-4 p-2 rounded-full bg-white hover:bg-gray-50 transition-all duration-200 shadow-lg border border-gray-300 z-50"
          aria-label="Expand sidebar"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {sidebarOpen ? (
          <>
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-lg font-semibold text-gray-800">
                {user?.role === 'Pharmacist' ? 'Pharmacist Dashboard' :
                 user?.role === 'Admin' ? 'Admin Panel' :
                 user?.role === 'InventoryManager' ? 'Inventory Manager Dashboard' :
                 user?.role === 'LabSupervisor' ? 'Lab Supervisor' : 
                 user?.role === 'LabStaff' ? 'Lab Assistant' : 'Clinic Admin'}
              </h1>
            </div>
            
            {/* Collapse button - only shown when sidebar is open */}
            <button
              onClick={handleToggle}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          </>
        ) : (
          <div className="mx-auto">
            <Stethoscope className="h-8 w-8 text-blue-600" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-6 flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name} className={`relative ${sidebarOpen ? 'px-3' : 'px-2'}`}>
              <button
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center py-3 rounded-lg transition-all duration-200 ${
                  sidebarOpen ? 'px-3' : 'px-0 justify-center'
                } ${
                  currentPage === item.page
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onMouseEnter={() => !sidebarOpen && setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span className={`flex-shrink-0 ${sidebarOpen ? '' : 'mx-auto'}`}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span className="ml-3 font-medium">{item.name}</span>
                )}
                <span className="sr-only">{item.name}</span>
              </button>
              
              {/* Improved tooltip positioning */}
              {!sidebarOpen && hoveredItem === item.name && (
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-gray-900 text-white text-sm py-2 px-3 rounded-md z-50 whitespace-nowrap shadow-lg">
                  {item.name}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User section and logout */}
      <div className="border-t border-gray-200 p-3">
        {/* User info - only show when sidebar is open */}
        {sidebarOpen && user && (
          <div className="mb-3 px-3">
            <div className="flex items-center">
              <UserCircle className="h-8 w-8 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Logout button */}
        <div className="relative">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 ${
              sidebarOpen ? 'px-3' : 'px-0 justify-center'
            }`}
            onMouseEnter={() => !sidebarOpen && setHoveredItem('Logout')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <span className={`flex-shrink-0 ${sidebarOpen ? '' : 'mx-auto'}`}>
              <LogOut size={20} />
            </span>
            {sidebarOpen && (
              <span className="ml-3 font-medium">Logout</span>
            )}
            <span className="sr-only">Logout</span>
          </button>
          
          {/* Improved logout tooltip */}
          {!sidebarOpen && hoveredItem === 'Logout' && (
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-gray-900 text-white text-sm py-2 px-3 rounded-md z-50 whitespace-nowrap shadow-lg">
              Logout
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default ProfessionalSidebar;