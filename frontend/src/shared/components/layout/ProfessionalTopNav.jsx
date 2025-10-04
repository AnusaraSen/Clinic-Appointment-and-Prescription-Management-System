import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  HelpCircle 
} from 'lucide-react';

/**
 * Professional Top Navigation Component (Converted from reference TopNavBar.tsx)
 * Provides search functionality, notifications, and user profile dropdown
 */
const ProfessionalTopNav = ({ 
  sidebarOpen = true, 
  setSidebarOpen = () => {} 
}) => {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 z-20">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200"
            aria-label="Toggle sidebar"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-md ml-4 md:ml-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search requests, equipment, technicians..."
              className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Right side - notifications and profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 relative">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center focus:outline-none"
            >
              <div className="mr-2 hidden md:block">
                <p className="text-sm font-medium text-gray-700">Maintenance Admin</p>
                <p className="text-xs text-gray-500">admin@clinic.com</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-blue-500 text-white flex items-center justify-center">
                <User size={18} />
              </div>
            </button>

            {/* Profile dropdown menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User size={16} className="mr-2" />
                  <span>My Profile</span>
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings size={16} className="mr-2" />
                  <span>Account Settings</span>
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <HelpCircle size={16} className="mr-2" />
                  <span>Help & Support</span>
                </a>
                <div className="border-t border-gray-100 my-1"></div>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut size={16} className="mr-2" />
                  <span>Sign out</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfessionalTopNav;