import React from 'react';
import { 
  X, Mail, User, Shield, Clock, Phone, MapPin, Calendar, 
  UserCheck, Key, Activity, CheckCircle, XCircle 
} from 'lucide-react';
import { useHideNavbar } from '../../../shared/hooks/useHideNavbar';

export const UserDetailsModal = ({ isOpen, onClose, user }) => {
  useHideNavbar(isOpen);
  
  if (!isOpen || !user) return null;

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleString();
  };

  const isUserActive = user.isActive !== false && !user.isLocked;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <p className="text-sm text-gray-500">Profile information and status</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Profile Section */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center lg:items-start lg:w-1/3">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-700">
                    {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </span>
                </div>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white ${
                  isUserActive ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {isUserActive ? <CheckCircle className="h-3 w-3 text-white" /> : <XCircle className="h-3 w-3 text-white" />}
                </div>
              </div>
              
              <div className="text-center lg:text-left mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{user.name || 'Unknown User'}</h2>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  <Shield className="h-3 w-3" />
                  {user.role || 'No Role'}
                </span>
              </div>

              {/* Status Info */}
              <div className="w-full space-y-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Activity className={`h-4 w-4 ${isUserActive ? 'text-green-600' : 'text-red-600'}`} />
                    <div>
                      <div className="text-xs text-gray-500">Account Status</div>
                      <div className={`text-sm font-medium ${isUserActive ? 'text-green-700' : 'text-red-700'}`}>
                        {isUserActive ? 'Active' : 'Inactive / Locked'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-xs text-gray-500">Login Status</div>
                      <div className="text-sm font-medium text-blue-700">
                        {user.isFirstLogin ? 'First time user' : 'Returning user'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="lg:w-2/3 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <User className="h-3 w-3" />
                      User ID
                    </div>
                    <div className="font-medium text-gray-900">{user.user_id || user.id || user._id || 'N/A'}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <Phone className="h-3 w-3" />
                      Phone Number
                    </div>
                    <div className="font-medium text-gray-900">{user.phone || 'Not provided'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <Calendar className="h-3 w-3" />
                      Date of Birth
                    </div>
                    <div className="font-medium text-gray-900">
                      {user.dob ? new Date(user.dob).toLocaleDateString() : 'Not provided'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <User className="h-3 w-3" />
                      Age / Gender
                    </div>
                    <div className="font-medium text-gray-900">
                      {user.age ? `${user.age} years` : 'N/A'} • {user.gender || 'Not specified'}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <MapPin className="h-3 w-3" />
                      Address
                    </div>
                    <div className="font-medium text-gray-900">{user.address || 'No address provided'}</div>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <h3 className="text-md font-semibold text-gray-900 mb-4">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3" />
                      Account Created
                    </div>
                    <div className="font-medium text-gray-900">
                      {formatDateTime(user.createdAt || user.created || user.updatedAt)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <UserCheck className="h-3 w-3" />
                      Last Login
                    </div>
                    <div className="font-medium text-gray-900">{formatDateTime(user.lastLogin)}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <Key className="h-3 w-3" />
                      Password Changed
                    </div>
                    <div className="font-medium text-gray-900">{formatDateTime(user.passwordChangedAt)}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3" />
                      Last Updated
                    </div>
                    <div className="font-medium text-gray-900">
                      {formatDateTime(user.updatedAt || user.passwordChangedAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {user.notes && (
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Notes</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{user.notes}</div>
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-medium text-red-900">Security Information</div>
                    <div className="text-sm text-red-700 mt-1">
                      Password hash and sensitive security data are protected and not displayed for security reasons.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-gray-100">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
