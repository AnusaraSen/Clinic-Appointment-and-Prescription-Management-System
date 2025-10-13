import React, { useState, useEffect } from 'react';
import { X, Edit, AlertCircle, Activity, Calendar, MapPin, Package } from 'lucide-react';
import { useHideNavbar } from '../../../shared/hooks/useHideNavbar';
import { ValidatedInput, ValidatedTextarea, ValidatedSelect } from '../../../shared/components/ValidatedInput';
import { validators } from '../../../shared/utils/formValidation';

/**
 * Edit Equipment Modal Component
 * Modal form for editing existing equipment entries
 */
export const EditEquipmentModal = ({ isOpen, onClose, onSuccess, equipment }) => {
  useHideNavbar(isOpen);
  
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
  const [touched, setTouched] = useState({});

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
    
    // Re-validate field if it was touched and had error
    if (touched[name] && errors[name]) {
      validateField(name, type === 'checkbox' ? checked : value);
    }
  };

  // Handle field blur
  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  // Validate individual field
  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'name':
        error = validators.required(value, 'Equipment name');
        if (!error && value.length > 100) {
          error = 'Equipment name must be less than 100 characters';
        }
        break;
      
      case 'type':
        error = validators.required(value, 'Equipment type');
        break;
      
      case 'location':
        error = validators.required(value, 'Location');
        if (!error && value.length > 200) {
          error = 'Location must be less than 200 characters';
        }
        break;
      
      case 'manufacturer':
        if (value && value.length > 100) {
          error = 'Manufacturer name must be less than 100 characters';
        }
        break;
      
      case 'modelNumber':
        error = validators.modelNumber(value);
        break;
      
      case 'serialNumber':
        error = validators.serialNumber(value);
        break;
      
      case 'purchaseDate':
        if (value) {
          error = validators.pastDate(value);
        }
        break;
      
      case 'warrantyExpiry':
        if (value) {
          error = validators.futureDate(value);
          // Additional check: warranty must be after purchase date
          if (!error && formData.purchaseDate && new Date(value) < new Date(formData.purchaseDate)) {
            error = 'Warranty expiry cannot be before purchase date';
          }
        }
        break;
      
      case 'maintenanceInterval':
        error = validators.numberRange(value, 1, 365, 'Maintenance interval');
        break;
      
      case 'notes':
        error = validators.textLength(value, 0, 1000, 'Notes');
        break;
    }

    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return error;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const allTouched = {};

    // Validate all fields
    const fieldsToValidate = ['name', 'type', 'location', 'manufacturer', 
      'modelNumber', 'serialNumber', 'purchaseDate', 'warrantyExpiry', 'maintenanceInterval', 'notes'];
    
    fieldsToValidate.forEach(field => {
      allTouched[field] = true;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setTouched(allTouched);
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
                <ValidatedInput
                  label="Equipment Name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={errors.name}
                  touched={touched.name}
                  required
                  placeholder="e.g., MRI Scanner, X-Ray Machine"
                />
              </div>

              {/* Equipment Type */}
              <ValidatedSelect
                label="Equipment Type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={errors.type}
                touched={touched.type}
                required
              >
                <option value="">Select type...</option>
                <option value="Medical Device">Medical Device</option>
                <option value="IT Equipment">IT Equipment</option>
                <option value="Laboratory Equipment">Laboratory Equipment</option>
                <option value="Facility Equipment">Facility Equipment</option>
                <option value="Office Equipment">Office Equipment</option>
                <option value="Furniture">Furniture</option>
                <option value="Other">Other</option>
              </ValidatedSelect>

              {/* Location */}
              <ValidatedInput
                label="Location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={errors.location}
                touched={touched.location}
                required
                placeholder="e.g., Room 205, Radiology Department"
              />

              {/* Status */}
              <ValidatedSelect
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={errors.status}
                touched={touched.status}
              >
                <option value="Operational">Operational</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Out of Service">Out of Service</option>
                <option value="Needs Repair">Needs Repair</option>
              </ValidatedSelect>

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
              <ValidatedInput
                label="Manufacturer"
                name="manufacturer"
                type="text"
                value={formData.manufacturer}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={errors.manufacturer}
                touched={touched.manufacturer}
                placeholder="e.g., Siemens, Philips"
                helpText="Optional"
              />

              {/* Model Number */}
              <ValidatedInput
                label="Model Number"
                name="modelNumber"
                type="text"
                value={formData.modelNumber}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={errors.modelNumber}
                touched={touched.modelNumber}
                placeholder="e.g., XR-2000"
                helpText="Optional"
              />

              {/* Serial Number */}
              <ValidatedInput
                label="Serial Number"
                name="serialNumber"
                type="text"
                value={formData.serialNumber}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={errors.serialNumber}
                touched={touched.serialNumber}
                placeholder="e.g., SN123456789"
                helpText="Optional"
              />
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
              <ValidatedInput
                label="Purchase Date"
                name="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={errors.purchaseDate}
                touched={touched.purchaseDate}
                helpText="Optional (cannot be future)"
              />

              {/* Warranty Expiry */}
              <ValidatedInput
                label="Warranty Expiry"
                name="warrantyExpiry"
                type="date"
                value={formData.warrantyExpiry}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={errors.warrantyExpiry}
                touched={touched.warrantyExpiry}
                helpText="Optional (must be after purchase date)"
              />

              {/* Maintenance Interval */}
              <ValidatedInput
                label="Maintenance Interval (days)"
                name="maintenanceInterval"
                type="number"
                value={formData.maintenanceInterval}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={errors.maintenanceInterval}
                touched={touched.maintenanceInterval}
                helpText="1-365 days"
              />
            </div>
          </div>

          {/* Notes */}
          <ValidatedTextarea
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            onBlur={handleFieldBlur}
            error={errors.notes}
            touched={touched.notes}
            placeholder="Additional notes about the equipment..."
            rows={3}
            maxLength={1000}
            showCharCount
            helpText="Optional (max 1000 characters)"
          />

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