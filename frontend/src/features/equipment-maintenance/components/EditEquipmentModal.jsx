import React, { useState, useEffect } from 'react';
import { X, Edit, AlertCircle, Activity, Calendar, MapPin, Package } from 'lucide-react';

/**
 * Edit Equipment Modal Component
 * Modal form for editing existing equipment entries
 */
export const EditEquipmentModal = ({ isOpen, onClose, onSuccess, equipment }) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    status: 'Operational',
    isCritical: false,
    manufacturer: '',
    modelNumber: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyExpiry: '',
    maintenanceInterval: 90,
    notes: ''
  });

  // Component state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [initialLoad, setInitialLoad] = useState(false);

  // Initialize form data when equipment changes
  useEffect(() => {
    if (equipment && isOpen) {
      console.log('=== EDIT EQUIPMENT MODAL LOADING ===');
      console.log('Equipment object:', equipment);
      console.log('Equipment ID (_id):', equipment._id);
      console.log('Equipment ID (id):', equipment.id);
      console.log('Equipment name:', equipment.name);
      console.log('Equipment equipment_name:', equipment.equipment_name);
      
      // Format dates for input fields
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      const newFormData = {
        name: equipment.name || equipment.equipment_name || '',
        type: equipment.type || equipment.equipment_type || '',
        location: equipment.location || '',
        status: equipment.status || 'Operational',
        isCritical: equipment.isCritical || false,
        manufacturer: equipment.manufacturer || '',
        modelNumber: equipment.modelNumber || equipment.model_number || '',
        serialNumber: equipment.serialNumber || equipment.serial_number || '',
        purchaseDate: formatDate(equipment.purchaseDate || equipment.purchase_date),
        warrantyExpiry: formatDate(equipment.warrantyExpiry || equipment.warranty_expiry),
        maintenanceInterval: equipment.maintenanceInterval || equipment.maintenance_interval || 90,
        notes: equipment.notes || ''
      };
      
      console.log('Setting form data:', newFormData);
      setFormData(newFormData);
      
      setInitialLoad(true);
      setErrors({});
      setApiError('');
    } else if (isOpen && !equipment) {
      console.log('=== EDIT MODAL OPENED BUT NO EQUIPMENT ===');
      setApiError('No equipment selected for editing');
    }
  }, [equipment, isOpen]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Equipment name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Equipment name must be less than 100 characters';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Equipment type is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.length > 200) {
      newErrors.location = 'Location must be less than 200 characters';
    }

    // Date validations
    if (formData.purchaseDate) {
      const purchaseDate = new Date(formData.purchaseDate);
      if (purchaseDate > new Date()) {
        newErrors.purchaseDate = 'Purchase date cannot be in the future';
      }
    }

    if (formData.warrantyExpiry && formData.purchaseDate) {
      const warrantyDate = new Date(formData.warrantyExpiry);
      const purchaseDate = new Date(formData.purchaseDate);
      if (warrantyDate < purchaseDate) {
        newErrors.warrantyExpiry = 'Warranty expiry cannot be before purchase date';
      }
    }

    // Maintenance interval validation
    if (formData.maintenanceInterval < 1 || formData.maintenanceInterval > 365) {
      newErrors.maintenanceInterval = 'Maintenance interval must be between 1 and 365 days';
    }

    // Notes validation
    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = 'Notes must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!equipment || !(equipment._id || equipment.id)) {
      setApiError('No equipment selected for editing');
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      // Prepare data for API
      const equipmentData = {
        name: formData.name.trim(),
        type: formData.type.trim(),
        location: formData.location.trim(),
        status: formData.status,
        isCritical: formData.isCritical,
        manufacturer: formData.manufacturer.trim() || undefined,
        modelNumber: formData.modelNumber.trim() || undefined,
        serialNumber: formData.serialNumber.trim() || undefined,
        purchaseDate: formData.purchaseDate || undefined,
        warrantyExpiry: formData.warrantyExpiry || undefined,
        maintenanceInterval: parseInt(formData.maintenanceInterval),
        notes: formData.notes.trim() || undefined
      };

      const equipmentId = equipment._id || equipment.id;
      console.log('Updating equipment:', equipmentId, equipmentData);

      const response = await fetch(`http://localhost:5000/api/equipment/${equipmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Equipment updated successfully:', result);

      // Call success callback
      if (onSuccess) {
        onSuccess(result.data);
      }

      // Close modal
      onClose();

    } catch (error) {
      console.error('Error updating equipment:', error);
      setApiError(error.message || 'Failed to update equipment');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      setErrors({});
      setApiError('');
      setInitialLoad(false);
      onClose();
    }
  };

  // Check if form has changes
  const hasChanges = () => {
    if (!equipment || !initialLoad) return false;
    
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    return (
      formData.name !== (equipment.name || equipment.equipment_name || '') ||
      formData.type !== (equipment.type || equipment.equipment_type || '') ||
      formData.location !== (equipment.location || '') ||
      formData.status !== (equipment.status || 'Operational') ||
      formData.isCritical !== (equipment.isCritical || false) ||
      formData.manufacturer !== (equipment.manufacturer || '') ||
      formData.modelNumber !== (equipment.modelNumber || equipment.model_number || '') ||
      formData.serialNumber !== (equipment.serialNumber || equipment.serial_number || '') ||
      formData.purchaseDate !== formatDate(equipment.purchaseDate || equipment.purchase_date) ||
      formData.warrantyExpiry !== formatDate(equipment.warrantyExpiry || equipment.warranty_expiry) ||
      formData.maintenanceInterval !== (equipment.maintenanceInterval || equipment.maintenance_interval || 90) ||
      formData.notes !== (equipment.notes || '')
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Edit className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Equipment</h2>
              <p className="text-sm text-gray-500">
                {equipment?.name || 'Update equipment information'}
              </p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* API Error */}
          {apiError && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 text-sm">{apiError}</span>
            </div>
          )}

          {/* Changes Indicator */}
          {hasChanges() && (
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-yellow-700 text-sm">You have unsaved changes</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-orange-600" />
              <span>Basic Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Equipment Name */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., MRI Scanner, X-Ray Machine"
                  maxLength="100"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Equipment Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.type ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option key="type-placeholder" value="">Select type...</option>
                  <option key="type-medical" value="Medical Device">Medical Device</option>
                  <option key="type-it" value="IT Equipment">IT Equipment</option>
                  <option key="type-lab" value="Laboratory Equipment">Laboratory Equipment</option>
                  <option key="type-facility" value="Facility Equipment">Facility Equipment</option>
                  <option key="type-office" value="Office Equipment">Office Equipment</option>
                  <option key="type-furniture" value="Furniture">Furniture</option>
                  <option key="type-other" value="Other">Other</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Room 205, Radiology Department"
                  maxLength="200"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option key="status-operational" value="Operational">Operational</option>
                  <option key="status-under" value="Under Maintenance">Under Maintenance</option>
                  <option key="status-out" value="Out of Service">Out of Service</option>
                  <option key="status-needs" value="Needs Repair">Needs Repair</option>
                  <option key="status-scheduled" value="Scheduled for Maintenance">Scheduled for Maintenance</option>
                </select>
              </div>

              {/* Critical Equipment */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isCritical"
                    checked={formData.isCritical}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Critical Equipment
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Mark as critical if this equipment is essential for operations
                </p>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <Package className="h-5 w-5 text-orange-600" />
              <span>Technical Details</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Manufacturer */}
              <div>
                <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturer
                </label>
                <input
                  type="text"
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Siemens, Philips"
                />
              </div>

              {/* Model Number */}
              <div>
                <label htmlFor="modelNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Model Number
                </label>
                <input
                  type="text"
                  id="modelNumber"
                  name="modelNumber"
                  value={formData.modelNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., XR-2000"
                />
              </div>

              {/* Serial Number */}
              <div>
                <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number
                </label>
                <input
                  type="text"
                  id="serialNumber"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., SN123456789"
                />
              </div>
            </div>
          </div>

          {/* Dates and Maintenance */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <span>Dates & Maintenance</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Purchase Date */}
              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Date
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.purchaseDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.purchaseDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.purchaseDate}</p>
                )}
              </div>

              {/* Warranty Expiry */}
              <div>
                <label htmlFor="warrantyExpiry" className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Expiry
                </label>
                <input
                  type="date"
                  id="warrantyExpiry"
                  name="warrantyExpiry"
                  value={formData.warrantyExpiry}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.warrantyExpiry ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.warrantyExpiry && (
                  <p className="mt-1 text-sm text-red-600">{errors.warrantyExpiry}</p>
                )}
              </div>

              {/* Maintenance Interval */}
              <div>
                <label htmlFor="maintenanceInterval" className="block text-sm font-medium text-gray-700 mb-2">
                  Maintenance Interval (days)
                </label>
                <input
                  type="number"
                  id="maintenanceInterval"
                  name="maintenanceInterval"
                  value={formData.maintenanceInterval}
                  onChange={handleInputChange}
                  min="1"
                  max="365"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.maintenanceInterval ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.maintenanceInterval && (
                  <p className="mt-1 text-sm text-red-600">{errors.maintenanceInterval}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-vertical ${
                errors.notes ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Additional notes about the equipment..."
              maxLength="1000"
            />
            <div className="flex justify-between mt-1">
              {errors.notes && (
                <p className="text-sm text-red-600">{errors.notes}</p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.notes.length}/1000 characters
              </p>
            </div>
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
              type="submit"
              disabled={loading || !hasChanges()}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Updating...' : 'Update Equipment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};