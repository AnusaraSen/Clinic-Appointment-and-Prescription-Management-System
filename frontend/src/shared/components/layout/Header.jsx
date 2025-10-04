import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings } from 'lucide-react';
import { useAuth } from '../../../features/authentication/context/AuthContext';
import UserProfile from './auth/UserProfile';

/**
 * Header Component - The top bar of our clinic dashboard! 🏥
 * 
 * Shows the clinic name and authenticated user info.
 * Now includes user profile and authentication status.
 */
export const Header = () => {
  const { isFirstLogin, userName } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-blue-600">
          Clinic Management System
        </h1>
        
        {/* First Login Indicator */}
        {isFirstLogin && (
          <div className="ml-4 px-3 py-1 bg-orange-100 border border-orange-300 rounded-full">
            <span className="text-xs font-medium text-orange-800">
              🔐 Password change required
            </span>
          </div>
        )}
      </div>
      
      {/* User actions */}
      <div className="flex items-center space-x-4">
        {/* Notification bell with red dot */}
        <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative">
          <span className="sr-only">View notifications</span>
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        
        {/* Settings/Profile Link */}
        <button 
          onClick={() => navigate('/profile')}
          className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          title="View Profile"
        >
          <span className="sr-only">User settings</span>
          <Settings className="h-6 w-6" />
        </button>
        
        {/* User profile component - compact version */}
        <UserProfile showFullProfile={false} />
      </div>
    </header>
  );
};
