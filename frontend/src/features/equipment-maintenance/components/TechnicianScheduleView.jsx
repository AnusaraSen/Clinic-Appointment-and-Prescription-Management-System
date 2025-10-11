import React, { useState } from 'react';
import { Calendar, Clock, Wrench, AlertTriangle, Eye, Edit3 } from 'lucide-react';
import { useHideNavbar } from '../../../shared/hooks/useHideNavbar';

// Helper functions for styling
const getStatusColor = (status) => {
  switch (status) {
    case 'Scheduled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'Assigned':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'In Progress':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Rescheduled':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Technician Schedule View - Display upcoming scheduled maintenance tasks
 * Clean calendar-style view of technician's upcoming work
 */
export const TechnicianScheduleView = ({ schedule, loading, onRefresh }) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = (task) => {
    setSelectedTask(task);
    setShowStatusModal(true);
  };

  const updateTaskStatus = async (taskId, newStatus, notes = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/scheduled-maintenance/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          ...(notes && { notes })
        }),
      });

      if (response.ok) {
        console.log('✅ Status updated successfully');
        // Refresh the data after a short delay to show the updated status
        setTimeout(() => {
          if (onRefresh) {
            onRefresh(); // Refresh the schedule list without page reload
          }
        }, 1000);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to update status:', errorData);
        alert(`Failed to update status: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const groupTasksByDate = (tasks) => {
    const grouped = {};
    tasks.forEach(task => {
      // Use 'date' field from MaintenanceRequest model instead of 'scheduled_date'
      const dateValue = task.date || new Date().toISOString().split('T')[0]; // fallback to today
      const date = new Date(dateValue).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(task);
    });
    return grouped;
  };

  const sortedGroups = schedule.length > 0 ? 
    Object.entries(groupTasksByDate(schedule)).sort(([a], [b]) => new Date(a) - new Date(b)) :
    [];

  if (schedule.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Tasks</h3>
        <p className="text-gray-600">Your schedule is clear for the upcoming period.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'No time set';
    try {
      const time = new Date(`2000-01-01T${timeString}`);
      return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Schedule Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Schedule</h3>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          <Calendar className="h-4 w-4" />
          Refresh Schedule
        </button>
      </div>

      {/* Schedule by Date */}
      <div className="space-y-6">
        {sortedGroups.map(([date, tasks]) => (
          <div key={date} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Date Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h4 className="text-lg font-medium text-gray-900">
                {formatDate(date)}
                <span className="ml-2 text-sm text-gray-500">
                  ({tasks.length} task{tasks.length !== 1 ? 's' : ''})
                </span>
              </h4>
            </div>

            {/* Tasks for this date */}
            <div className="divide-y divide-gray-200">
              {tasks.map((task, index) => (
                <div key={task.id || task._id || index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    {/* Left: Task Name */}
                    <div className="flex items-center space-x-3 flex-1">
                      <Wrench className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      <h5 className="text-base font-semibold text-gray-900">
                        {task.title || 'Maintenance Task'}
                      </h5>
                    </div>

                    {/* Center: Badges */}
                    <div className="flex items-center space-x-2 mx-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      
                      {task.maintenance_type && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {task.maintenance_type}
                        </span>
                      )}

                      {task.priority && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      )}
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleViewDetails(task)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(task)}
                        className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedTask && (
        <ScheduleDetailsModal
          task={selectedTask}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTask(null);
          }}
        />
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedTask && (
        <UpdateStatusModal
          task={selectedTask}
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedTask(null);
          }}
          onStatusUpdate={(taskId, newStatus, notes) => {
            // Handle status update
            updateTaskStatus(taskId, newStatus, notes);
            setShowStatusModal(false);
            setSelectedTask(null);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
};

/**
 * Schedule Details Modal Component
 */
const ScheduleDetailsModal = ({ task, isOpen, onClose }) => {
  useHideNavbar(isOpen);
  
  if (!isOpen || !task) return null;

  const formatDateTime = (date, time) => {
    if (!date) return 'Not specified';
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (time) {
      try {
        const timeObj = new Date(`2000-01-01T${time}`);
        const formattedTime = timeObj.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        return `${formattedDate} at ${formattedTime}`;
      } catch {
        return `${formattedDate} at ${time}`;
      }
    }
    return formattedDate;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Schedule Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-gray-600 mb-1">Title</label>
                <p className="text-gray-900 font-medium">{task.title || 'Maintenance Task'}</p>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Task ID</label>
                <p className="text-gray-900 font-mono text-xs">#{task.id || task._id}</p>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Priority</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority || 'Not set'}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Schedule Information</h4>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <label className="block text-gray-600 mb-1">Scheduled Date & Time</label>
                <p className="text-gray-900">{formatDateTime(task.scheduled_date, task.scheduled_time)}</p>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Estimated Duration</label>
                <p className="text-gray-900">{task.estimated_duration ? `${task.estimated_duration} hours` : 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Maintenance Type</label>
                <p className="text-gray-900">{task.maintenance_type || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Equipment Information */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Equipment Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-gray-600 mb-1">Equipment</label>
                <p className="text-gray-900">{task.equipment_name || task.equipment_id || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Location</label>
                <p className="text-gray-900">{task.location || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Description</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 text-sm">{task.description}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 text-sm">{task.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Update Status Modal Component
 */
const UpdateStatusModal = ({ task, isOpen, onClose, onStatusUpdate }) => {
  useHideNavbar(isOpen);
  
  const [selectedStatus, setSelectedStatus] = useState(task?.status || '');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = [
    { value: 'In Progress', label: 'In Progress', description: 'Currently working on this task' },
    { value: 'Completed', label: 'Completed', description: 'Task has been finished successfully' },
    { value: 'Cancelled', label: 'Cancelled', description: 'Task has been cancelled' }
  ];

  const handleSubmit = async () => {
    if (!selectedStatus || selectedStatus === task.status) {
      onClose();
      return;
    }

    setIsUpdating(true);
    try {
      await onStatusUpdate(task._id || task.id, selectedStatus, notes);
      // Close modal after successful update
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Update Status</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
            <p className="text-sm text-gray-600">
              Current status: <span className="font-medium">{task.status}</span>
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Select New Status
            </label>
            {statusOptions.map((option) => (
              <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={selectedStatus === option.value}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Notes Section */}
          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Technician Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any relevant notes about the status update..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating || !selectedStatus || selectedStatus === task.status}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianScheduleView;