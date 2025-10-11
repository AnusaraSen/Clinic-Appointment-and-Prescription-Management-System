import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle, Activity, Calendar, MapPin, Package } from 'lucide-react';
import { useHideNavbar } from '../../../shared/hooks/useHideNavbar';
import { ValidatedInput, ValidatedTextarea, ValidatedSelect } from '../../../shared/components/ValidatedInput';
import { validators } from '../../../shared/utils/formValidation';

/**
 * Add Equipment Modal Component
 * Modal form for creating new equipment entries
 */
export const AddEquipmentModal = ({ isOpen, onClose, onSuccess }) => {
  useHideNavbar(isOpen);
  
  // Form state
  const [formData, setFormData] = useState({
    equipment_id: '',
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
  const [touched, setTouched] = useState({});

  // Generate equipment ID when modal opens
  useEffect(() => {
    if (isOpen && !formData.equipment_id) {
      // Generate a simple equipment ID - in production, you might want to fetch the next available ID from the server
      const generateEquipmentId = () => {
        const randomNum = Math.floor(Math.random() * 9000) + 1000; // 4 digit number
        return `EQ-${randomNum}`;
      };
      
      setFormData(prev => ({
        ...prev,
        equipment_id: generateEquipmentId()
      }));
    }
  }, [isOpen, formData.equipment_id]);

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
      case 'equipment_id':
        if (!value || !value.trim()) {
          error = 'Equipment ID is required';
        } else if (!/^EQ-\d{4}$/.test(value)) {
          error = 'Equipment ID must be in format EQ-1234';
        }
        break;
      
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

    // Validate all required fields
    const fieldsToValidate = ['equipment_id', 'name', 'type', 'location', 'manufacturer', 
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

    setLoading(true);
    setApiError('');

    try {
      // Prepare data for API
      const equipmentData = {
        equipment_id: formData.equipment_id.trim(),
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

      console.log('Adding equipment:', equipmentData);

      const response = await fetch('http://localhost:5000/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        
        // Handle validation errors from backend
        if (errorData.errors && Array.isArray(errorData.errors)) {
          throw new Error(`Validation errors: ${errorData.errors.join(', ')}`);
        }
        
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Equipment added successfully:', result);

      // Reset form
      setFormData({
        equipment_id: '',
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

      // Call success callback
      if (onSuccess) {
        onSuccess(result.data);
      }

      // Close modal
      onClose();

    } catch (error) {
      console.error('Error adding equipment:', error);
      setApiError(error.message || 'Failed to add equipment');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      // Reset form
      setFormData({
        equipment_id: '',
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
      setErrors({});
      setApiError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Equipment</h2>
              <p className="text-sm text-gray-500">Create a new equipment entry in the system</p>
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

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Basic Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Equipment ID */}
              <ValidatedInput
                label="Equipment ID"
                name="equipment_id"
                type="text"
                value={formData.equipment_id}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={errors.equipment_id}
                touched={touched.equipment_id}
                required
                placeholder="e.g., EQ-1234"
                helpText="Format: EQ-####"
              />

              {/* Equipment Name */}
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

              {/* Equipment Type */}
              <ValidatedSelect
                label="Equipment Type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={touched.type ? errors.type : ''}
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
                error={touched.location ? errors.location : ''}
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
                error={touched.status ? errors.status : ''}
              >
                <option value="Operational">Operational</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Out of Service">Out of Service</option>
                <option value="Needs Repair">Needs Repair</option>
                <option value="Scheduled for Maintenance">Scheduled for Maintenance</option>
              </ValidatedSelect>

              {/* Critical Equipment */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isCritical"
                    checked={formData.isCritical}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
              <Package className="h-5 w-5 text-blue-600" />
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
              <Calendar className="h-5 w-5 text-blue-600" />
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Adding...' : 'Add Equipment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};