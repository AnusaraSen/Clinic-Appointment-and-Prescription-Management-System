/**
 * User Profile Component
 * Displays current user information and logout functionality
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Clock, LogOut, Settings, AlertTriangle } from 'lucide-react';

const UserProfile = ({ showFullProfile = false }) => {
  const { 
    user, 
    logout, 
    isLoading, 
    isFirstLogin,
    userName,
    userEmail,
    userRole,
    refreshProfile
  } = useAuth();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /**
   * Handle logout with confirmation
   */
  const handleLogout = async () => {
    if (showLogoutConfirm) {
      await logout();
      setShowLogoutConfirm(false);
    } else {
      setShowLogoutConfirm(true);
    }
  };

  /**
   * Cancel logout
   */
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  /**
   * Get role color
   */
  const getRoleColor = (role) => {
    const colors = {
      Admin: 'bg-red-100 text-red-800',
      Doctor: 'bg-green-100 text-green-800',
      Pharmacist: 'bg-blue-100 text-blue-800',
      Technician: 'bg-yellow-100 text-yellow-800',
      LabStaff: 'bg-purple-100 text-purple-800',
      InventoryManager: 'bg-indigo-100 text-indigo-800',
      LabSupervisor: 'bg-pink-100 text-pink-800',
      Patient: 'bg-gray-100 text-gray-800'
    };
    
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Compact profile for header/navbar
  if (!showFullProfile) {
    return (
      <div className="relative">
        {/* User Avatar and Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="hidden md:block">
            <div className="text-sm font-medium text-gray-900">
              {userName}
              {isFirstLogin && (
                <AlertTriangle className="w-4 h-4 text-orange-500 inline ml-1" title="First login - please change password" />
              )}
            </div>
            <div className="text-xs text-gray-500">{userRole}</div>
          </div>

          {/* Logout Button */}
          <div className="relative">
            {showLogoutConfirm ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  disabled={isLoading}
                >
                  Confirm
                </button>
                <button
                  onClick={cancelLogout}
                  className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-100"
                title="Logout"
                disabled={isLoading}
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full profile view
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
        <button
          onClick={refreshProfile}
          className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
          title="Refresh Profile"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* First Login Warning */}
      {isFirstLogin && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-orange-800">Action Required</h3>
            <p className="text-sm text-orange-700 mt-1">
              This is your first login. Please change your password to secure your account.
            </p>
          </div>
        </div>
      )}

      {/* User Information */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-900">{userName || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-gray-900">{userEmail || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Shield className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <div className="mt-1">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(userRole)}`}>
                    {userRole}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <label className="text-sm font-medium text-gray-500">Member Since</label>
                <p className="text-gray-900">{formatDate(user?.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <label className="text-sm font-medium text-gray-500">Last Login</label>
                <p className="text-gray-900">{formatDate(user?.lastLogin)}</p>
              </div>
            </div>

            {user?.user_id && (
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <label className="text-sm font-medium text-gray-500">User ID</label>
                  <p className="text-gray-900 font-mono">{user.user_id}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Status */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-green-800">Account Active</span>
              </div>
            </div>

            {isFirstLogin && (
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-orange-800">Password Change Required</span>
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-blue-800">Authenticated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t pt-6">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {isFirstLogin && (
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                Change Password
              </button>
            )}

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
              disabled={isLoading}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out? You'll need to sign in again to access your account.
            </p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
