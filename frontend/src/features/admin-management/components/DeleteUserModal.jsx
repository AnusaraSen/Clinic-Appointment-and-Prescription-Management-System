import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useHideNavbar } from '../../../shared/hooks/useHideNavbar';

export const DeleteUserModal = ({ isOpen, onClose, user, onConfirm, isDeleting }) => {
  useHideNavbar(isOpen);
  
  if (!isOpen || !user) return null;

  const handleConfirm = () => {
    const userId = user.id || user._id || user.user_id;
    onConfirm(userId, user);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700">
              Are you sure you want to delete the user <strong>{user.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This will permanently remove:
            </p>
            <ul className="text-sm text-gray-500 mt-1 ml-4 list-disc">
              <li>User account and profile information</li>
              <li>All associated data and permissions</li>
              <li>Access to the system</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Warning</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              This action is permanent and cannot be reversed. Consider deactivating the user instead if you might need to restore access later.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
};