import React, { useState } from 'react';
import { X, Save, Clock, FileText, AlertTriangle, Check, Wrench } from 'lucide-react';
import { useHideNavbar } from '../../../shared/hooks/useHideNavbar';

/**
 * Task Status Modal - Update task status with notes
 * Matches the modal styling used throughout the application
 */
export const TaskStatusModal = ({ task, isOpen, onClose, onUpdate }) => {
  useHideNavbar(isOpen);
  
  const [status, setStatus] = useState(task?.status || 'Open');
  const [notes, setNotes] = useState(task?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const statusOptions = [
    { value: 'Open', label: 'Open', description: 'Task is open and waiting to start' },
    { value: 'In Progress', label: 'In Progress', description: 'Currently working on this task' },
    { value: 'Completed', label: 'Completed', description: 'Task has been finished successfully' },
    { value: 'Cancelled', label: 'Cancelled', description: 'Task has been cancelled' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/maintenance-requests/${task.id || task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status,
          notes: notes
        })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setSuccess(`Status updated to ${status} successfully!`);
        setTimeout(() => {
          onUpdate(updatedTask.data || updatedTask);
          onClose();
        }, 1500); // Show success message briefly before closing
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update task status');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error updating task status:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'Open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Wrench className="h-6 w-6 text-gray-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Update Request Status</h2>
              <p className="text-sm text-gray-600 mt-1">
                {task?.title || 'Maintenance Request'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center">
              <Check className="h-5 w-5 mr-2" />
              <span>Status updated successfully!</span>
            </div>
          )}

          {/* Current Request Info Card */}
          <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Request Title and Info */}
                <div className="flex items-center space-x-3 mb-3">
                  <Wrench className="h-5 w-5 text-gray-500" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {task?.title || 'Maintenance Request'}
                  </h3>
                </div>

                {/* Equipment and Details */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">
                      Equipment: {task?.equipment?.map(eq => eq.name || eq.id).join(', ') || 'N/A'}
                    </span>
                  </div>
                  
                  {task?.date && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Date: {new Date(task.date).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {task?.estimatedHours && (
                    <div>
                      <span>Duration: {task.estimatedHours}h</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {task?.description && (
                  <p className="text-sm text-gray-600 mt-3 bg-gray-50 rounded-lg p-3">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Status and Priority Badges */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task?.status)}`}>
                  {task?.status}
                </span>
                
                {task?.priority && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    task.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                    task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {task.priority}
                  </span>
                )}

                <span className="text-xs text-gray-500 font-mono">
                  #{task?.id || task?._id}
                </span>
              </div>
            </div>
          </div>

          {/* Current Status Display */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{task?.title || 'Maintenance Request'}</h3>
            <p className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Current status:</span> {task?.status || 'Open'}
            </p>
          </div>

          {/* Status Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select New Status
            </label>
            <div className="space-y-3">
              {statusOptions.map((option) => (
                <div key={option.value} className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id={`status-${option.value}`}
                      name="status"
                      type="radio"
                      value={option.value}
                      checked={status === option.value}
                      onChange={(e) => setStatus(e.target.value)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor={`status-${option.value}`} className="font-medium text-gray-700 cursor-pointer">
                      {option.label}
                    </label>
                    <p className="text-gray-500">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Technician Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any relevant notes about the task progress, issues encountered, or completion details..."
            />
            <p className="mt-1 text-xs text-gray-500">
              These notes will be saved with the task for future reference.
            </p>
          </div>

          {/* Previous Notes */}
          {task?.notes && task.notes !== notes && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Previous Notes</h4>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
                {task.notes}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Status
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskStatusModal;