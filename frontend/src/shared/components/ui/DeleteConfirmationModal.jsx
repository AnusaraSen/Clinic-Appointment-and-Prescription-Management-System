import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { safeTechnicianName } from '../../utils/SafeRender';


const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  request,
  isLoading = false 
}) => {
  // Don't render anything if modal is not open or no request provided
  if (!isOpen || !request) return null;

  /**
   * Get appropriate warning message based on request status
   * Different statuses require different levels of caution when deleting
   */
  const getWarningMessage = (status) => {
    switch (status) {
      case 'Pending':
        return 'This request has not been started yet. It can be safely deleted.';
      case 'In Progress':
        return 'Warning: This request is currently being worked on by a technician. Deleting it may disrupt ongoing work.';
      case 'Completed':
        return 'This request has been completed. Consider if you need to keep this record for historical purposes.';
      case 'Cancelled':
        return 'This request was already cancelled. Deleting will remove it from the system permanently.';
      default:
        return 'Please review this request carefully before deleting.';
    }
  };

  /**
   * Get warning color based on status to provide visual cues
   * More dangerous operations get more prominent warning colors
   */
  const getWarningColor = (status) => {
    switch (status) {
      case 'Pending':
      case 'Cancelled':
        return 'text-yellow-600';
      case 'In Progress':
        return 'text-red-600';
      case 'Completed':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  /**
   * Handle the backdrop click to close modal
   * Only close if user clicks the backdrop, not the modal content
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * Handle the delete confirmation
   * Pass the request ID to the parent component for deletion
   */
  const handleDelete = () => {
    onConfirm(request.id || request._id);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Delete Maintenance Request
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Request Details */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Request Details
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Request ID:</span>
                <span className="text-gray-900">{request.request_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Title:</span>
                <span className="text-gray-900 text-right max-w-48 truncate" title={request.title}>
                  {request.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  request.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {request.status}
                </span>
              </div>
              {request.assignedTo && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Assigned To:</span>
                  <span className="text-gray-900">{safeTechnicianName(request.assignedTo)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Warning Message */}
          <div className="mb-6">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className={`w-5 h-5 mt-0.5 ${getWarningColor(request.status)}`} />
              <div>
                <p className="font-medium text-gray-900 mb-1">
                  Please confirm deletion
                </p>
                <p className={`text-sm ${getWarningColor(request.status)}`}>
                  {getWarningMessage(request.status)}
                </p>
              </div>
            </div>
          </div>

          {/* Permanent Warning */}
          <div className="mb-6">
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 mb-1">
                  This action cannot be undone
                </p>
                <p className="text-sm text-red-700">
                  The maintenance request and all associated data will be permanently removed from the system.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
