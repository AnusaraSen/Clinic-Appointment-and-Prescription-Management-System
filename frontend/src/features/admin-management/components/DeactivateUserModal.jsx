import React from 'react';
import { X, UserX, AlertTriangle } from 'lucide-react';

const DeactivateUserModal = ({ isOpen, onClose, user, onConfirm, isLoading = false }) => {
  if (!isOpen || !user) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const verb = user.isLocked ? 'Reactivate' : 'Deactivate';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <UserX className="w-5 h-5 text-yellow-700" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{verb} User</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100" disabled={isLoading}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-700 mb-4">Are you sure you want to <strong>{verb.toLowerCase()}</strong> the user <strong>{user.name}</strong> ({user.email})?</p>

          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 mb-1">This action affects login access</p>
              <p className="text-sm text-yellow-800">{user.isLocked ? 'Reactivating will restore access.' : 'Deactivating will prevent the user from logging in.'}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
            <button onClick={() => onConfirm(user)} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md shadow-sm hover:bg-yellow-700 flex items-center gap-2">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {verb}ing...
                </>
              ) : (
                <>
                  <UserX className="w-4 h-4" />
                  {verb}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeactivateUserModal;
