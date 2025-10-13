import React from 'react';
import { X, Activity, MapPin, Calendar, Wrench, Shield, Hash, Package, Clock, FileText, DollarSign } from 'lucide-react';

/**
 * View Equipment Details Modal
 * Displays comprehensive information about a specific equipment item
 */
export const ViewEquipmentModal = ({ isOpen, onClose, equipment }) => {
  if (!isOpen || !equipment) return null;

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Under Maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Out of Service':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Needs Repair':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{equipment.name}</h2>
              <p className="text-sm text-gray-600">Equipment Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Basic Information Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Equipment ID</label>
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">{equipment.equipment_id || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Equipment Name</label>
                <p className="text-sm font-medium text-gray-900">{equipment.name || 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Type</label>
                <p className="text-sm text-gray-900">{equipment.type || 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(equipment.status)}`}>
                  {equipment.status || 'Unknown'}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Location</label>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-900">{equipment.location || 'N/A'}</p>
                </div>
              </div>

              {equipment.isCritical && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase">Priority</label>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-600">Critical Equipment</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Wrench className="h-5 w-5 mr-2 text-blue-600" />
              Technical Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Model Number</label>
                <p className="text-sm text-gray-900">{equipment.modelNumber || 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Serial Number</label>
                <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                  {equipment.serialNumber || 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Manufacturer</label>
                <p className="text-sm text-gray-900">{equipment.manufacturer || 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Purchase Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-900">{formatDate(equipment.purchaseDate)}</p>
                </div>
              </div>

              {equipment.purchaseCost && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase">Purchase Cost</label>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">${equipment.purchaseCost.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Warranty & Maintenance */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Warranty & Maintenance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Warranty Expiry</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-900">{formatDate(equipment.warrantyExpiry || equipment.warrantyExpires)}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Last Maintenance</label>
                <div className="flex items-center space-x-2">
                  <Wrench className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-900">{formatDate(equipment.lastMaintenance)}</p>
                </div>
              </div>

              {equipment.maintenanceInterval && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase">Maintenance Interval</label>
                  <p className="text-sm text-gray-900">{equipment.maintenanceInterval} days</p>
                </div>
              )}

              {equipment.nextMaintenance && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase">Next Maintenance</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <p className="text-sm font-medium text-blue-600">{formatDate(equipment.nextMaintenance)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          {equipment.notes && (
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Additional Notes
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{equipment.notes}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-500">
              <div>
                <span className="font-medium">Created:</span> {formatDate(equipment.createdAt)}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {formatDate(equipment.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
