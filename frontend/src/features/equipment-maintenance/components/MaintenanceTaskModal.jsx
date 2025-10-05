import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Wrench, AlertTriangle, Plus } from 'lucide-react';

/**
 * Maintenance Task Modal Component
 * Modal form for creating and editing maintenance tasks
 */
export const MaintenanceTaskModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  task = null, // null for new task, object for editing
  selectedDate = null,
  equipment = [],
  technicians = []
}) => {
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    equipmentId: '',
    technicianId: '',
    scheduledDate: '',
    estimatedDuration: 60, // minutes
    priority: 'medium',
    type: 'preventive',
    recurrence: 'none',
    recurrenceInterval: 1,
    notes: ''
  });

  // Component state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  // Initialize form data
  useEffect(() => {
    console.log('=== MODAL INITIALIZATION ===');
    console.log('isOpen:', isOpen);
    console.log('task:', task);
    console.log('equipment:', equipment);
    console.log('technicians:', technicians);
    console.log('selectedDate:', selectedDate);
    
    if (isOpen) {
      if (task) {
        // Editing existing task
        console.log('=== EDITING TASK ===');
        console.log('Original task object:', task);
        console.log('Task keys:', Object.keys(task));
        console.log('Task structure:');
        console.log('- title:', task.title);
        console.log('- description:', task.description);
        console.log('- equipment_id:', task.equipment_id);
        console.log('- equipmentId:', task.equipmentId);
        console.log('- assigned_technician:', task.assigned_technician);
        console.log('- technicianId:', task.technicianId);
        console.log('- scheduledDate:', task.scheduledDate);
        console.log('- scheduled_date:', task.scheduled_date);
        console.log('- priority:', task.priority);
        console.log('- maintenance_type:', task.maintenance_type);
        console.log('- type:', task.type);
        console.log('- estimated_duration:', task.estimated_duration);
        console.log('- notes:', task.notes);
        
        // Safe date parsing - handle both field name formats
        let taskDateString = '';
        const dateField = task.scheduled_date || task.scheduledDate;
        if (dateField) {
          try {
            const taskDate = new Date(dateField);
            if (!isNaN(taskDate.getTime())) {
              taskDateString = taskDate.toISOString().split('T')[0];
            }
            console.log('Parsed date:', taskDateString);
          } catch (error) {
            console.error('Error parsing task date:', error);
          }
        }
        
        const mappedFormData = {
          title: task.title || '',
          description: task.description || '',
          equipmentId: task.equipment_id || task.equipmentId || '',
          technicianId: task.assigned_technician || task.technicianId || '',
          scheduledDate: taskDateString,
          estimatedDuration: (task.estimated_duration || task.estimatedDuration) ? (task.estimated_duration || task.estimatedDuration) * 60 : 60, // Convert hours to minutes
          priority: (task.priority || '').toLowerCase() || 'medium',
          type: ((task.maintenance_type || task.maintenanceType || task.type) || '').toLowerCase() || 'preventive',
          recurrence: task.recurrence || 'none',
          recurrenceInterval: task.recurrenceInterval || 1,
          notes: task.notes || ''
        };
        
        console.log('=== MAPPED FORM DATA ===');
        console.log('Mapped form data:', mappedFormData);
        
        setFormData(mappedFormData);
      } else {
        // New task
        const defaultDate = selectedDate ? 
          (selectedDate instanceof Date ? selectedDate.toISOString().split('T')[0] : '') : 
          '';
        
        setFormData({
          title: '',
          description: '',
          equipmentId: '',
          technicianId: '',
          scheduledDate: defaultDate,
          estimatedDuration: 60,
          priority: 'medium',
          type: 'preventive',
          recurrence: 'none',
          recurrenceInterval: 1,
          notes: ''
        });
      }
      
      setErrors({});
      setApiError('');
    }
  }, [isOpen, task, selectedDate]);

  // Debug effect to track formData changes
  useEffect(() => {
    console.log('=== FORM DATA UPDATED ===');
    console.log('Current formData:', formData);
  }, [formData]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
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
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    }

    if (!formData.equipmentId) {
      newErrors.equipmentId = 'Please select equipment';
    } else if (equipment.length === 0) {
      newErrors.equipmentId = 'No equipment available - please check data loading';
    }

    if (!formData.technicianId) {
      newErrors.technicianId = 'Please assign a technician';
    } else if (technicians.length === 0) {
      newErrors.technicianId = 'No technicians available - please check data loading';
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Please select a date';
    } else {
      const selectedDate = new Date(formData.scheduledDate);
      
      // Check if the date is valid
      if (isNaN(selectedDate.getTime())) {
        newErrors.scheduledDate = 'Please enter a valid date';
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          newErrors.scheduledDate = 'Cannot schedule maintenance in the past';
        }
      }
    }

    if (formData.estimatedDuration < 15 || formData.estimatedDuration > 480) {
      newErrors.estimatedDuration = 'Duration must be between 15 minutes and 8 hours';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Form data:', formData);
    console.log('Task prop:', task);
    console.log('Is editing?', !!task);
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      // Prepare data for API - map frontend fields to backend schema
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        equipment_id: formData.equipmentId, // Equipment ID should be in EQ-XXXX format
        assigned_technician: formData.technicianId || undefined,
        scheduled_date: new Date(formData.scheduledDate).toISOString(), // Ensure proper date format
        scheduled_time: "09:00", // Default time - backend expects this field
        estimated_duration: parseFloat(formData.estimatedDuration) / 60, // Convert minutes to hours
        priority: formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1), // Capitalize first letter
        maintenance_type: formData.type.charAt(0).toUpperCase() + formData.type.slice(1), // Capitalize first letter
        notes: formData.notes.trim() || undefined
      };

      // Validate equipment_id format before sending
      if (!taskData.equipment_id || !taskData.equipment_id.match(/^EQ-\d+$/)) {
        throw new Error(`Invalid equipment ID format: ${taskData.equipment_id}. Expected format: EQ-1234`);
      }

      console.log('Submitting maintenance task:', taskData);
      console.log('Task object:', task); // Debug log
      console.log('Selected equipment from form:', formData.equipmentId);
      console.log('Formatted task data for API:', JSON.stringify(taskData, null, 2));

      // Validate task ID for updates - more flexible validation
      if (task && task._id && typeof task._id === 'string' && task._id.trim() === '') {
        throw new Error('Invalid task ID for update operation');
      }

      // Determine if this is a create or update operation
      const isUpdate = task && task._id && task._id.length > 0;
      
      const url = isUpdate 
        ? `http://localhost:5000/api/scheduled-maintenance/${task._id}`
        : 'http://localhost:5000/api/scheduled-maintenance';
      
      const method = isUpdate ? 'PUT' : 'POST';

      console.log('=== API REQUEST DETAILS ===');
      console.log('URL:', url);
      console.log('Method:', method);
      console.log('Is editing?', !!task);
      console.log('Task ID:', task?._id);
      console.log('Task object full:', task);
      console.log('Task object type:', typeof task);
      console.log('Task object keys:', task ? Object.keys(task) : 'null');

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        console.error('Request that failed:', {
          url,
          method,
          body: taskData
        });
        throw new Error(errorData.message || `Server error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Maintenance task saved successfully:', result);

      // Call success callback
      if (onSuccess) {
        onSuccess(result.data);
      }

      // Close modal
      onClose();

    } catch (error) {
      console.error('Error saving maintenance task:', error);
      setApiError(error.message || 'Failed to save maintenance task');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Get equipment name by ID
  const getEquipmentName = (id) => {
    const item = equipment.find(eq => eq._id === id);
    return item ? item.name : 'Unknown Equipment';
  };

  // Get technician name by ID
  const getTechnicianName = (id) => {
    const tech = technicians.find(t => t._id === id);
    return tech ? `${tech.firstName} ${tech.lastName}` : 'Unknown Technician';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {task ? 'Edit Maintenance Task' : 'Schedule New Maintenance'}
              </h2>
              <p className="text-sm text-gray-500">
                {task ? 'Update maintenance task details' : 'Create a new maintenance schedule'}
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
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 text-sm">{apiError}</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Task Information</h3>
            
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., Quarterly MRI Scanner Maintenance"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Detailed description of the maintenance task..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Assignment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Assignment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Equipment Selection */}
              <div>
                <label htmlFor="equipmentId" className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment <span className="text-red-500">*</span>
                </label>
                <select
                  id="equipmentId"
                  name="equipmentId"
                  value={formData.equipmentId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.equipmentId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option key="select-equipment" value="">Select equipment...</option>
                  {equipment.length > 0 ? equipment.map((item) => {
                    console.log('🔧 Equipment item:', item);
                    const equipId = item.equipment_id || item._id;
                    const name = item.name || item.equipment_name || 'Unknown Equipment';
                    const isSelected = equipId === formData.equipmentId;
                    console.log(`Equipment ${equipId} selected: ${isSelected} (formData.equipmentId: ${formData.equipmentId})`);
                    return (
                      <option key={item._id} value={equipId}>
                        {name} - {item.location} ({equipId})
                      </option>
                    );
                  }) : (
                      <option key="no-equipment" disabled>No equipment available</option>
                  )}
                </select>
                {console.log('Equipment dropdown - Current selected value:', formData.equipmentId)}
                {console.log('Equipment dropdown render - equipment count:', equipment.length)}
                {errors.equipmentId && (
                  <p className="mt-1 text-sm text-red-600">{errors.equipmentId}</p>
                )}
              </div>

              {/* Technician Assignment */}
              <div>
                <label htmlFor="technicianId" className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Technician <span className="text-red-500">*</span>
                </label>
                <select
                  id="technicianId"
                  name="technicianId"
                  value={formData.technicianId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.technicianId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option key="select-technician" value="">Select technician...</option>
                  {(() => {
                    console.log('🔧 Technicians array:', technicians);
                    console.log('🔧 Technicians length:', technicians.length);
                    
                    if (!Array.isArray(technicians) || technicians.length === 0) {
                      return <option key="no-technicians" disabled>No technicians available</option>;
                    }
                    
                    // Use all technicians for now to see if data loads
                    return technicians.map((tech) => {
                      const techId = tech._id || tech.id;
                      const displayName = tech.firstName && tech.lastName 
                        ? `${tech.firstName} ${tech.lastName}` 
                        : tech.name || tech.fullName || 'Unknown Technician';
                      
                      const department = tech.department || tech.specialization || 'Maintenance';
                      const isSelected = techId === formData.technicianId;
                      console.log(`Technician ${techId} selected: ${isSelected} (formData.technicianId: ${formData.technicianId})`);
                      
                      return (
                        <option key={techId} value={techId}>
                          {displayName} - {department}
                        </option>
                      );
                    });
                  })()}
                </select>
                {console.log('Technician dropdown - Current selected value:', formData.technicianId)}
                {errors.technicianId && (
                  <p className="mt-1 text-sm text-red-600">{errors.technicianId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Scheduling Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Schedule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date */}
              <div>
                <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="scheduledDate"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.scheduledDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.scheduledDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.scheduledDate}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="estimatedDuration"
                  name="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={handleInputChange}
                  min="15"
                  max="480"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.estimatedDuration ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.estimatedDuration && (
                  <p className="mt-1 text-sm text-red-600">{errors.estimatedDuration}</p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option key="low" value="low">Low</option>
                  <option key="medium" value="medium">Medium</option>
                  <option key="high" value="high">High</option>
                  <option key="critical" value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Maintenance Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option key="preventive" value="preventive">Preventive</option>
                  <option key="repair" value="repair">Repair</option>
                  <option key="inspection" value="inspection">Inspection</option>
                  <option key="calibration" value="calibration">Calibration</option>
                  <option key="cleaning" value="cleaning">Cleaning</option>
                </select>
              </div>

              {/* Recurrence */}
              <div>
                <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700 mb-2">
                  Recurrence
                </label>
                <select
                  id="recurrence"
                  name="recurrence"
                  value={formData.recurrence}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option key="none" value="none">One-time</option>
                  <option key="daily" value="daily">Daily</option>
                  <option key="weekly" value="weekly">Weekly</option>
                  <option key="monthly" value="monthly">Monthly</option>
                  <option key="quarterly" value="quarterly">Quarterly</option>
                  <option key="yearly" value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Any special instructions or notes..."
            />
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
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Saving...' : (task ? 'Update Task' : 'Schedule Task')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};