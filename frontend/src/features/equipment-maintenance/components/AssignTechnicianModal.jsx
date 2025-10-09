import React, { useState, useEffect } from 'react';
import { X, User, Clock, CheckCircle, Calendar, AlertTriangle } from 'lucide-react';

/**
 * Assign Technician Modal Component
 * Modal for assigning technicians to work requests
 */
export const AssignTechnicianModal = ({ 
  isOpen, 
  onClose, 
  workRequest, 
  technicians = [],
  onAssign,
  loading = false 
}) => {
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && workRequest) {
      setSelectedTechnician(workRequest.assignedTo || '');
      setErrors({});
    }
  }, [isOpen, workRequest]);

  // Don't render if not open
  if (!isOpen || !workRequest) return null;

  // Filter available technicians based on specialization and availability
  const getAvailableTechnicians = () => {
    return technicians.filter(tech => {
      // Check availability using the correct field names from API
      return tech.availability === true || tech.availabilityStatus === 'Available';
    });
  };

  // Get technician workload
  const getTechnicianWorkload = (technician) => {
    // Calculate real workload from technician's assigned requests
    const current = technician.assignedRequests?.length || 0;
    const max = technician.maxConcurrentRequests || 5; // Default max capacity
    const percentage = max > 0 ? Math.round((current / max) * 100) : 0;
    
    return { 
      current, 
      max, 
      percentage 
    };
  };

  // Get technician specialization match
  const getSpecializationMatch = (technician) => {
    // Mock specialization matching logic
    const equipmentCategory = workRequest.equipmentCategory || 'general';
    const techSpecialization = technician.specialization?.toLowerCase() || '';
    
    if (techSpecialization.includes(equipmentCategory.toLowerCase())) {
      return 'perfect';
    } else if (techSpecialization.includes('general') || equipmentCategory === 'general') {
      return 'good';
    }
    return 'basic';
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!selectedTechnician) {
      newErrors.technician = 'Please select a technician';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle assignment
  const handleAssign = async () => {
    if (!validateForm()) {
      return;
    }

    setIsAssigning(true);
    
    try {
      const assignmentData = {
        technicianId: selectedTechnician,
        technicianName: technicians.find(t => t._id === selectedTechnician)?.name || '',
        assignedAt: new Date().toISOString()
      };
      
      await onAssign(workRequest._id || workRequest.id, assignmentData);
      onClose();
    } catch (error) {
      console.error('Error assigning technician:', error);
      setErrors({ submit: 'Failed to assign technician. Please try again.' });
    } finally {
      setIsAssigning(false);
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const configs = {
      critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
      high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      low: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
    };
    
    const config = configs[priority] || configs.medium;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {priority === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  // Get workload indicator
  const getWorkloadIndicator = (percentage) => {
    if (percentage < 50) {
      return { color: 'bg-green-500', text: 'Light', textColor: 'text-green-600' };
    } else if (percentage < 80) {
      return { color: 'bg-yellow-500', text: 'Moderate', textColor: 'text-yellow-600' };
    } else {
      return { color: 'bg-red-500', text: 'Heavy', textColor: 'text-red-600' };
    }
  };

  // Get specialization indicator
  const getSpecializationIndicator = (match) => {
    const configs = {
      perfect: { icon: '🎯', text: 'Perfect Match', color: 'text-green-600' },
      good: { icon: '✅', text: 'Good Match', color: 'text-blue-600' },
      basic: { icon: '⚪', text: 'Basic Match', color: 'text-gray-600' }
    };
    return configs[match] || configs.basic;
  };

  const availableTechnicians = getAvailableTechnicians();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto admin-form">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Assign Technician</h3>
              <p className="text-sm text-gray-500">Assign work request to a technician</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Work Request Summary */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">{workRequest.title}</h4>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Due: {workRequest.date ? new Date(workRequest.date).toLocaleDateString() : 'Invalid Date'}
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Est: {workRequest.estimatedHours || 'N/A'} hours
            </span>
            {getPriorityBadge(workRequest.priority)}
          </div>
          <p className="text-sm text-gray-700 mt-2 line-clamp-2">
            {workRequest.description}
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800 text-sm">{errors.submit}</span>
              </div>
            </div>
          )}

          {/* Technician Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Technician <span className="text-red-500">*</span>
            </label>
            
            {availableTechnicians.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No technicians available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableTechnicians.map((technician) => {
                  const workload = getTechnicianWorkload(technician);
                  const workloadIndicator = getWorkloadIndicator(workload.percentage);
                  const specializationMatch = getSpecializationMatch(technician);
                  const specializationIndicator = getSpecializationIndicator(specializationMatch);
                  
                  return (
                    <div
                      key={technician._id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTechnician === technician._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTechnician(technician._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <input
                            type="radio"
                            name="selectedTechnician"
                            checked={selectedTechnician === technician._id}
                            onChange={() => setSelectedTechnician(technician._id)}
                            className="mt-1 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="font-medium text-gray-900">{technician.name}</h5>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                technician.availabilityStatus === 'Available' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {technician.availabilityStatus || 'Unknown'}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">
                              {technician.specialization} • {technician.department}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-sm">
                              {/* Specialization Match */}
                              <div className="flex items-center space-x-1">
                                <span>{specializationIndicator.icon}</span>
                                <span className={specializationIndicator.color}>
                                  {specializationIndicator.text}
                                </span>
                              </div>
                              
                              {/* Workload */}
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-500">Workload:</span>
                                <div className="flex items-center space-x-1">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${workloadIndicator.color}`}
                                      style={{ width: `${workload.percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className={`text-xs ${workloadIndicator.textColor}`}>
                                    {workload.current}/{workload.max}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {errors.technician && (
              <p className="text-red-600 text-sm mt-1">{errors.technician}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isAssigning}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={isAssigning || loading || !selectedTechnician}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <User className="h-4 w-4 mr-2" />
              {isAssigning ? 'Assigning...' : 'Assign Technician'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};