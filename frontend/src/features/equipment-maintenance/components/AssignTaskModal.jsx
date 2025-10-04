import React, { useState, useEffect } from 'react';
import { X, UserCheck, Calendar, AlertCircle, Clock, Wrench } from 'lucide-react';

/**
 * Assign Task Modal
 * Modal for assigning new tasks directly to a technician
 */
export const AssignTaskModal = ({ isOpen, onClose, onSuccess, technician }) => {
  // Form state
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    scheduledDate: '',
    estimatedDuration: '',
    equipment_id: '',
    taskType: 'Maintenance'
  });
  
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingEquipment, setFetchingEquipment] = useState(true);

  // Fetch equipment list when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchEquipment();
      resetForm();
    }
  }, [isOpen]);

  const fetchEquipment = async () => {
    setFetchingEquipment(true);
    try {
      const response = await fetch('http://localhost:5000/api/equipment');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setEquipment(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setError('Failed to load equipment list');
    } finally {
      setFetchingEquipment(false);
    }
  };

  const resetForm = () => {
    setTaskData({
      title: '',
      description: '',
      priority: 'Medium',
      scheduledDate: '',
      estimatedDuration: '',
      equipment_id: '',
      taskType: 'Maintenance'
    });
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!taskData.title.trim()) {
      setError('Task title is required');
      setLoading(false);
      return;
    }

    if (!taskData.scheduledDate) {
      setError('Scheduled date is required');
      setLoading(false);
      return;
    }

    try {
      // Create maintenance request with assigned technician
      const requestData = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        equipment_id: taskData.equipment_id,
        scheduled_date: taskData.scheduledDate,
        estimated_duration: taskData.estimatedDuration ? parseInt(taskData.estimatedDuration) : null,
        task_type: taskData.taskType,
        assigned_technician: technician.employeeId || technician._id,
        status: 'Assigned'
      };

      console.log('Creating task assignment:', requestData);

      const response = await fetch('http://localhost:5000/api/maintenance-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Task assigned successfully:', result.data);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      handleClose();

    } catch (error) {
      console.error('Error assigning task:', error);
      setError(error.message || 'Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen || !technician) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto admin-form">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Wrench className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Assign Task</h2>
              <p className="text-sm text-gray-500">
                Create and assign a task to {technician.firstName} {technician.lastName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Technician Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center">
              <UserCheck className="h-4 w-4 mr-2" />
              Assigned Technician
            </h3>
            <div className="text-sm text-blue-800">
              <p><span className="font-medium">Name:</span> {technician.firstName} {technician.lastName}</p>
              <p><span className="font-medium">Department:</span> {technician.department || 'General Maintenance'}</p>
              <p><span className="font-medium">Status:</span> {technician.availabilityStatus || 'Available'}</p>
              {technician.skills && technician.skills.length > 0 && (
                <p><span className="font-medium">Skills:</span> {technician.skills.join(', ')}</p>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Task Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={taskData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter task title..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={taskData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the task details..."
              />
            </div>

            {/* Priority and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={taskData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option key="priority-low" value="Low">Low</option>
                  <option key="priority-medium" value="Medium">Medium</option>
                  <option key="priority-high" value="High">High</option>
                  <option key="priority-critical" value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label htmlFor="taskType" className="block text-sm font-medium text-gray-700 mb-2">
                  Task Type
                </label>
                <select
                  id="taskType"
                  name="taskType"
                  value={taskData.taskType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option key="job-maintenance" value="Maintenance">Maintenance</option>
                  <option key="job-repair" value="Repair">Repair</option>
                  <option key="job-inspection" value="Inspection">Inspection</option>
                  <option key="job-installation" value="Installation">Installation</option>
                  <option key="job-calibration" value="Calibration">Calibration</option>
                </select>
              </div>
            </div>

            {/* Equipment Selection */}
            <div>
              <label htmlFor="equipment_id" className="block text-sm font-medium text-gray-700 mb-2">
                Related Equipment (Optional)
              </label>
              <select
                id="equipment_id"
                name="equipment_id"
                value={taskData.equipment_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={fetchingEquipment}
              >
                <option key="select-equipment-optional" value="">Select equipment (optional)</option>
                {equipment.map((item) => (
                  <option key={item._id || item.id} value={item.equipment_id}>
                    {item.equipment_id} - {item.name}
                  </option>
                ))}
              </select>
              {fetchingEquipment && (
                <p className="text-sm text-gray-500 mt-1">Loading equipment...</p>
              )}
            </div>

            {/* Scheduled Date and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date *
                </label>
                <input
                  type="datetime-local"
                  id="scheduledDate"
                  name="scheduledDate"
                  value={taskData.scheduledDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration (hours)
                </label>
                <input
                  type="number"
                  id="estimatedDuration"
                  name="estimatedDuration"
                  value={taskData.estimatedDuration}
                  onChange={handleInputChange}
                  min="0.5"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2.5"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !taskData.title.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && <Clock className="h-4 w-4 animate-spin" />}
              <span>{loading ? 'Assigning...' : 'Assign Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};