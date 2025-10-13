import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Wrench } from 'lucide-react';
import { useHideNavbar } from '../../../shared/hooks/useHideNavbar';
import { ValidatedInput, ValidatedTextarea, ValidatedSelect } from '../../../shared/components/ValidatedInput';
import { validators } from '../../../shared/utils/formValidation';


export const EditMaintenanceRequestModal = ({ isOpen, request, onClose, onSuccess }) => {
  useHideNavbar(isOpen);
  
  // 📝 Form state with current request data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    equipment: [],
    date: '' // Due date field
  });
  
  // 🔧 Equipment dropdown state
  const [equipmentList, setEquipmentList] = useState([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  
  // 🎯 Form interaction states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [touched, setTouched] = useState({});

  // 🚀 Load equipment options and populate form when modal opens
  useEffect(() => {
    if (isOpen && request) {
      // Pre-fill form with current request data
      console.log('🔧 Edit Modal - Request data:', request);

      setFormData({
        title: request.title || '',
        description: request.description || '',
        priority: request.priority || 'Medium',
        status: request.status || 'Open',
        equipment: request.equipment ? request.equipment.map(eq => eq.id || eq._id) : [],
        date: request.date ? new Date(request.date).toISOString().split('T')[0] : '' // Format date for input
      });
      
      fetchEquipment();
      setErrors({});
      setApiError('');
    }
  }, [isOpen, request]);

  // 🔧 Fetch equipment from backend for dropdown
  const fetchEquipment = async () => {
    try {
      setEquipmentLoading(true);
      const response = await fetch('http://localhost:5000/api/equipment');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch equipment: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('EditModal - Equipment data:', result);
      
      if (result.success && result.data) {
        setEquipmentList(result.data);
      } else {
        throw new Error('Invalid equipment response format');
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setApiError('Failed to load equipment options. Please try again.');
    } finally {
      setEquipmentLoading(false);
    }
  };

  // 📝 Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Re-validate field if it was touched and had error
    if (touched[name] && errors[name]) {
      validateField(name, value);
    }
  };

  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'title':
        error = validators.required(value, 'Title');
        if (!error && value.length > 200) {
          error = 'Title must be less than 200 characters';
        }
        break;
      case 'description':
        error = validators.required(value, 'Description');
        if (!error) {
          error = validators.textLength(value, 10, 2000, 'Description');
        }
        break;
      case 'priority':
        error = validators.required(value, 'Priority');
        break;
      case 'equipment':
        if (Array.isArray(value) && value.length === 0) {
          error = 'At least one equipment must be selected';
        }
        break;
      case 'date':
        if (value) {
          error = validators.futureDate(value);
        }
        break;
    }

    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return error;
  };

  // 🎯 Handle equipment selection changes
  const handleEquipmentChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      equipment: selectedOptions
    }));
    
    // Clear equipment error
    if (errors.equipment) {
      setErrors(prev => ({
        ...prev,
        equipment: ''
      }));
    }
  };

  // ✅ Validate form data
  const validateForm = () => {
    const newErrors = {};
    const allTouched = {};

    const fieldsToValidate = ['title', 'description', 'priority', 'equipment', 'date'];
    
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

  const oldValidateForm = () => {
    const newErrors = {};
    
    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    // Priority validation
    if (!['Low', 'Medium', 'High'].includes(formData.priority)) {
      newErrors.priority = 'Please select a valid priority';
    }
    
    // Equipment validation
    if (!formData.equipment || formData.equipment.length === 0) {
      newErrors.equipment = 'Please select at least one equipment item';
    }

    // Date validation (optional but if provided, should not be in the past)
    if (formData.date) {
      const today = new Date();
      const selectedDate = new Date(formData.date);
      if (selectedDate < today.setHours(0, 0, 0, 0)) {
        newErrors.date = 'Due date cannot be in the past';
      }
    }

    // Category validation
    const validCategories = ['maintenance', 'repair', 'inspection', 'calibration', 'installation', 'upgrade', 'emergency'];
    if (!validCategories.includes(formData.category)) {
      newErrors.category = 'Please select a valid category';
    }
    
    return Object.keys(newErrors).length === 0;
  };

  // 💾 Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setApiError('');
    
    try {
      // Prepare the update data
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        equipment: formData.equipment,
        date: formData.date || null // Include due date
      };
      
      console.log('EditModal - Submitting update:', JSON.stringify(updateData, null, 2));
      
      const response = await fetch(`http://localhost:5000/api/maintenance-requests/${request.id || request._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      console.log('EditModal - Response status:', response.status);
      const result = await response.json();
      console.log('EditModal - Response data:', result);
      
      if (response.ok && result.success) {
        console.log('✅ Request updated successfully!');
        onSuccess(); // This will close modal and refresh table
      } else {
        console.error('❌ Update failed:', result);
        setApiError(result.message || 'Failed to update maintenance request');
      }
      
    } catch (error) {
      console.error('EditModal - Network error:', error);
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if modal is not open or no request provided
  if (!isOpen || !request) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto admin-form">
        {/* 📋 Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Wrench className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Edit Maintenance Request
              </h3>
              <p className="text-sm text-gray-500">
                Updating request: {request.request_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 📝 Edit Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* API Error Display */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Update Failed
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{apiError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Title Field */}
          <ValidatedInput
            label="Request Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            onBlur={handleFieldBlur}
            error={touched.title ? errors.title : ''}
            required
            placeholder="What needs to be fixed or maintained?"
          />

          {/* Description Field */}
          <ValidatedTextarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            onBlur={handleFieldBlur}
            error={touched.description ? errors.description : ''}
            required
            placeholder="Describe the issue in detail..."
            rows={4}
          />

          {/* Status, Priority and Due Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <ValidatedSelect
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={touched.status ? errors.status : ''}
                touched={touched.status}
                disabled
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </ValidatedSelect>
              <p className="text-xs text-gray-500 mt-1">Status cannot be changed from this form</p>
            </div>

            <ValidatedSelect
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={touched.priority ? errors.priority : ''}
              required
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </ValidatedSelect>

            {/* Due Date */}
            <ValidatedInput
              label="Due Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={touched.date ? errors.date : ''}
            />
          </div>

          {/* Equipment Selection */}
          <div>
            <label htmlFor="equipment" className="block text-sm font-medium text-gray-700 mb-2">
              Equipment <span className="text-red-500">*</span>
            </label>
            {equipmentLoading ? (
              <div className="w-full px-3 py-8 border border-gray-300 rounded-md bg-gray-50 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading equipment...</p>
              </div>
            ) : (
              <select
                id="equipment"
                name="equipment"
                multiple
                value={formData.equipment}
                onChange={handleEquipmentChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] ${
                  errors.equipment ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                {equipmentList.length === 0 ? (
                  <option key="no-equipment-2" disabled>No equipment available</option>
                ) : (
                  equipmentList.map((item) => (
                    <option key={item.id || item._id} value={item.id || item._id}>
                      {item.name} - {item.location} ({item.type})
                    </option>
                  ))
                )}
              </select>
            )}
            {errors.equipment && (
              <p className="mt-1 text-sm text-red-600">{errors.equipment}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Hold Ctrl (Cmd on Mac) to select multiple equipment items
            </p>
          </div>

          {/* 🎯 Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || equipmentLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
