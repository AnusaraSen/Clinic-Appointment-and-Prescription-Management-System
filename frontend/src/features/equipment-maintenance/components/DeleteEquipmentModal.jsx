import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, Shield, Clock } from 'lucide-react';
import { useHideNavbar } from '../../../shared/hooks/useHideNavbar';

/**
 * Delete Equipment Confirmation Dialog
 * Safety-focused confirmation dialog for equipment deletion
 */
export const DeleteEquipmentModal = ({ isOpen, onClose, onConfirm, equipment }) => {
  useHideNavbar(isOpen);
  
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [confirmationText, setConfirmationText] = useState('');

  // Handle deletion
  const handleDelete = async () => {
    if (!equipment || (!equipment._id && !equipment.id)) {
      setApiError('No equipment selected for deletion');
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      // Use either _id or id field depending on what's available
      const equipmentId = equipment._id || equipment.id;
      console.log('Deleting equipment:', equipmentId);

      const response = await fetch(`http://localhost:5000/api/equipment/${equipmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      console.log('Equipment deleted successfully');

      // Call success callback
      if (onConfirm) {
        onConfirm(equipmentId);
      }

      // Close modal
      handleClose();

    } catch (error) {
      console.error('Error deleting equipment:', error);
      setApiError(error.message || 'Failed to delete equipment');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      setConfirmationText('');
      setApiError('');
      onClose();
    }
  };

  // Check if confirmation text matches
  const isConfirmationValid = () => {
    return confirmationText.toLowerCase() === 'delete';
  };

  // Get equipment status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-100 text-green-800';
      case 'Under Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Needs Repair':
        return 'bg-red-100 text-red-800';
      case 'Out of Service':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (!isOpen || !equipment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Delete Equipment</h2>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* API Error */}
          {apiError && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 text-sm">{apiError}</span>
            </div>
          )}

          {/* Warning Message */}
          <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Warning: Permanent Deletion
              </h3>
              <p className="text-red-700 text-sm leading-relaxed">
                You are about to permanently delete this equipment record. This action will:
              </p>
              <ul className="text-red-700 text-sm mt-2 space-y-1 pl-4">
                <li>• Remove all equipment information from the database</li>
                <li>• Delete associated maintenance history</li>
                <li>• Cancel any scheduled maintenance tasks</li>
                <li>• Remove equipment from all reports and analytics</li>
              </ul>
              <p className="text-red-700 text-sm mt-2 font-medium">
                This action cannot be undone and the data cannot be recovered.
              </p>
            </div>
          </div>

          {/* Equipment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-gray-600" />
              <span>Equipment to be deleted:</span>
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {/* Equipment Name */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {equipment.name}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {equipment.type} • {equipment.location}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(equipment.status)}`}>
                    {equipment.status}
                  </span>
                  {equipment.isCritical && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      Critical
                    </span>
                  )}
                </div>
              </div>

              {/* Equipment Details */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                {equipment.manufacturer && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Manufacturer</p>
                    <p className="text-sm text-gray-900">{equipment.manufacturer}</p>
                  </div>
                )}
                {equipment.modelNumber && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Model</p>
                    <p className="text-sm text-gray-900">{equipment.modelNumber}</p>
                  </div>
                )}
                {equipment.serialNumber && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Serial Number</p>
                    <p className="text-sm text-gray-900">{equipment.serialNumber}</p>
                  </div>
                )}
                {equipment.purchaseDate && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Purchase Date</p>
                    <p className="text-sm text-gray-900">
                      {new Date(equipment.purchaseDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Last Updated */}
              <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                <Clock className="h-4 w-4 text-gray-400" />
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(equipment.updatedAt || equipment.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Critical Equipment Warning */}
          {equipment.isCritical && (
            <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-amber-900 mb-1">
                  Critical Equipment Warning
                </h3>
                <p className="text-amber-700 text-sm">
                  This equipment is marked as <strong>critical</strong> for operations. 
                  Deleting it may impact essential services and patient care. Please ensure 
                  this deletion is authorized by appropriate personnel.
                </p>
              </div>
            </div>
          )}

          {/* Confirmation Input */}
          <div className="space-y-2">
            <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700">
              To confirm deletion, type <span className="font-mono bg-gray-100 px-1 rounded">delete</span> in the box below:
            </label>
            <input
              type="text"
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
              placeholder="Type 'delete' to confirm"
              autoComplete="off"
            />
            {confirmationText && !isConfirmationValid() && (
              <p className="text-sm text-red-600">
                Please type "delete" exactly to confirm
              </p>
            )}
          </div>

          {/* Alternative Actions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Consider these alternatives:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Change status to "Out of Service" instead of deleting</li>
              <li>• Archive the equipment for historical records</li>
              <li>• Transfer to a different location or department</li>
              <li>• Contact IT support for data backup before deletion</li>
            </ul>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || !isConfirmationValid()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <Trash2 className="h-4 w-4" />
              <span>{loading ? 'Deleting...' : 'Delete Equipment'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};