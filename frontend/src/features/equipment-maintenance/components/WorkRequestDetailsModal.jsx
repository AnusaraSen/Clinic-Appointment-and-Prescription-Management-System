import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Edit,
  Save,
  Wrench,
  MessageSquare,
  MapPin,
  BarChart3
} from 'lucide-react';

/**
 * Work Request Details Modal Component
 * Modal for viewing and editing work request details
 */
export const WorkRequestDetailsModal = ({ 
  isOpen, 
  onClose, 
  workRequest, 
  onUpdate,
  onStatusChange,
  loading = false,
  canEdit = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Category options mapping (keep in sync with select options below)
  const categoryOptions = [
    { value: 'maintenance', label: 'Preventive Maintenance' },
    { value: 'repair', label: 'Repair' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'calibration', label: 'Calibration' },
    { value: 'installation', label: 'Installation' },
    { value: 'upgrade', label: 'Upgrade' },
    { value: 'emergency', label: 'Emergency' }
  ];

  // Initialize edit data when modal opens
  useEffect(() => {
    if (workRequest) {
      // initialize edit data from incoming workRequest
      
      // Handle equipment array - backend returns array, frontend expects single object
      const firstEquipment = Array.isArray(workRequest.equipment) && workRequest.equipment.length > 0 
        ? workRequest.equipment[0] 
        : workRequest.equipment || {};
      
      setEditData({
        title: workRequest.title || '',
        description: workRequest.description || '',
        // Convert priority case: Backend 'High'/'Medium'/'Low' -> Frontend 'high'/'medium'/'low'
        priority: workRequest.priority ? workRequest.priority.toLowerCase() : 'medium',
        // Backend uses 'date' field, not 'dueDate'
        dueDate: workRequest.date ? new Date(workRequest.date).toISOString().split('T')[0] : '',
        // Normalize status for edit controls: 'pending'|'in-progress'|'completed'|'cancelled'
        status: workRequest.status
          ? (workRequest.status === 'Open' ? 'pending' :
             workRequest.status === 'In Progress' ? 'in-progress' :
             workRequest.status === 'Completed' ? 'completed' :
             workRequest.status === 'Cancelled' ? 'cancelled' : workRequest.status.toLowerCase())
          : 'pending',
  // These fields may exist in backend - provide defaults
  // Normalize incoming category values to known option keys
  category: (function(cat) {
    if (!cat) return 'maintenance';
    const normalized = String(cat).toLowerCase().trim();
    const byValue = categoryOptions.find(c => c.value === normalized);
    if (byValue) return byValue.value;
    const byLabel = categoryOptions.find(c => c.label.toLowerCase() === normalized);
    if (byLabel) return byLabel.value;
    // Handle cases where backend stored a human label like 'Preventive Maintenance'
    const matched = categoryOptions.find(c => c.label.toLowerCase().includes(normalized) || normalized.includes(c.value));
    return matched ? matched.value : 'maintenance';
  })(workRequest.category),
  // notes removed from edit form per UX
        // Handle equipment information from array
        equipment: firstEquipment?.name || 'Not specified',
        location: firstEquipment?.location || 'Not specified',
        model: firstEquipment?.modelNumber || firstEquipment?.model || 'Not specified'
      });
      
      // No activity/comments in this view per UX request
    }
  }, [workRequest]);

  if (!isOpen || !workRequest) return null;
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // Handle save changes
  const handleSave = async () => {
    setIsUpdating(true);
    try {
      // Transform frontend data to backend format
      const backendData = {
        title: editData.title,
        description: editData.description,
        // Convert priority back to backend case: 'high' -> 'High'
        priority: editData.priority.charAt(0).toUpperCase() + editData.priority.slice(1),
        // Convert dueDate back to 'date' field for backend
        date: editData.dueDate ? new Date(editData.dueDate).toISOString() : null,
        // Map status back to backend labels if provided in editData
        ...(editData.status ? {
          status: editData.status === 'pending' ? 'Open' :
                  editData.status === 'in-progress' ? 'In Progress' :
                  editData.status === 'completed' ? 'Completed' :
                  editData.status === 'cancelled' ? 'Cancelled' : editData.status
  } : {}),
    // Include category (normalize to option key)
    ...(editData.category ? { category: (function(cat){
      if (!cat) return 'maintenance';
      const normalized = String(cat).toLowerCase().trim();
      const byValue = categoryOptions.find(c => c.value === normalized);
      if (byValue) return byValue.value;
      const byLabel = categoryOptions.find(c => c.label.toLowerCase() === normalized);
      if (byLabel) return byLabel.value;
      const matched = categoryOptions.find(c => c.label.toLowerCase().includes(normalized) || normalized.includes(c.value));
      return matched ? matched.value : cat;
    })(editData.category) } : {}),
  // Include notes (can be empty string)
  ...(editData.notes !== undefined ? { notes: editData.notes } : {})
      };
        console.log('🔁 Sending update payload for request', workRequest.id || workRequest._id, backendData);
        await onUpdate(workRequest.id || workRequest._id, backendData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating work request:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange(workRequest.id || workRequest._id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  

  // Get priority badge
  const getPriorityBadge = (priority) => {
    // Convert backend priority case ('High'/'Medium'/'Low') to lowercase for consistency
    const normalizedPriority = priority ? priority.toLowerCase() : 'medium';
    
    const configs = {
      critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
      high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      low: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
    };
    
    const config = configs[normalizedPriority] || configs.medium;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {normalizedPriority === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
        {normalizedPriority.charAt(0).toUpperCase() + normalizedPriority.slice(1)}
      </span>
    );
  };

  // Get status badge
  const getStatusBadge = (status) => {
    // Map backend status to frontend expected values
    const statusMapping = {
      'Open': 'pending',
      'In Progress': 'in-progress', 
      'Completed': 'completed',
      'Cancelled': 'cancelled'
    };
    
    const normalizedStatus = statusMapping[status] || status?.toLowerCase() || 'pending';
    
    const configs = {
      pending: { 
        bg: 'bg-orange-100', 
        text: 'text-orange-800', 
        border: 'border-orange-200',
        icon: <Clock className="w-3 h-3 mr-1" />
      },
      'in-progress': { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        border: 'border-blue-200',
        icon: <User className="w-3 h-3 mr-1" />
      },
      completed: { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        border: 'border-green-200',
        icon: <CheckCircle className="w-3 h-3 mr-1" />
      },
      cancelled: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        border: 'border-gray-200',
        icon: <XCircle className="w-3 h-3 mr-1" />
      }
    };
    
    const config = configs[normalizedStatus] || configs.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.icon}
        {/* Display original backend status text */}
        {status || 'Pending'}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryLabel = (val) => {
    if (!val) return 'Not specified';
    const found = categoryOptions.find(c => c.value === val);
    if (found) return found.label;
    return val.split(/[-_ ]+/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  };

  // Normalize backend status to a predictable set used in the UI
  const statusMapping = {
    'Open': 'pending',
    'In Progress': 'in-progress',
    'Completed': 'completed',
    'Cancelled': 'cancelled'
  };
  const normalizedStatus = statusMapping[workRequest.status] || workRequest.status?.toLowerCase();

  const dueDateValue = workRequest.date || workRequest.dueDate;
  const isOverdue = dueDateValue &&
    normalizedStatus !== 'completed' &&
    normalizedStatus !== 'cancelled' &&
    new Date(dueDateValue) < new Date();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wrench className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Work Request #{workRequest.request_id || workRequest.id || workRequest._id}
              </h3>
              <p className="text-sm text-gray-500">
                Created {formatDateTime(workRequest.createdAt || workRequest.updatedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {canEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                disabled={isUpdating}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title={isEditing ? "Cancel Edit" : "Edit Request"}
              >
                <Edit className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Description */}
            <div>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={editData.title}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={editData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {workRequest.title}
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {workRequest.description}
                  </p>
                </div>
              )}
            </div>

            {/* Equipment Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                <Wrench className="h-4 w-4 mr-2" />
                Equipment Details
              </h5>
              <div className="text-sm text-gray-600">
                {isEditing ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Equipment</label>
                      <input
                        type="text"
                        name="equipment"
                        value={editData.equipment}
                        onChange={handleInputChange}
                        placeholder="Equipment name"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={editData.location}
                        onChange={handleInputChange}
                        placeholder="Equipment location"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Model</label>
                      <input
                        type="text"
                        name="model"
                        value={editData.model}
                        onChange={handleInputChange}
                        placeholder="Equipment model"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    {(() => {
                      // Handle equipment array from backend
                      const firstEquipment = Array.isArray(workRequest.equipment) && workRequest.equipment.length > 0 
                        ? workRequest.equipment[0] 
                        : workRequest.equipment || {};
                      
                      return (
                        <>
                          <p><strong>Equipment:</strong> {firstEquipment?.name || 'Not specified'}</p>
                          <p><strong>Location:</strong> {firstEquipment?.location || 'Not specified'}</p>
                          <p><strong>Model:</strong> {firstEquipment?.modelNumber || firstEquipment?.model || 'Not specified'}</p>
                          {Array.isArray(workRequest.equipment) && workRequest.equipment.length > 1 && (
                            <p className="text-xs text-gray-500 mt-1">
                              + {workRequest.equipment.length - 1} more equipment item(s)
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Notes removed per request */}

            {/* Save/Cancel Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdating}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status and Priority */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-4">Status & Priority</h5>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Status</label>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(workRequest.status)}
                    {isOverdue && (
                      <span className="text-xs text-red-600 font-medium">OVERDUE</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Priority</label>
                  {isEditing ? (
                    <select
                      name="priority"
                      value={editData.priority}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option key="low" value="low">Low</option>
                      <option key="medium" value="medium">Medium</option>
                      <option key="high" value="high">High</option>
                      <option key="critical" value="critical">Critical</option>
                    </select>
                  ) : (
                    getPriorityBadge(workRequest.priority)
                  )}
                </div>

                {isEditing && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Status</label>
                    <select
                      name="status"
                      value={editData.status}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option key="pending" value="pending">Pending</option>
                      <option key="in-progress" value="in-progress">In Progress</option>
                      <option key="completed" value="completed">Completed</option>
                      <option key="cancelled" value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Status Change Actions removed per UX request */}
            </div>

            {/* Dates */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-4">Dates</h5>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Due Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dueDate"
                      value={editData.dueDate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  ) : (
                    <p className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {formatDate(workRequest.date || workRequest.dueDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-4">Category</h5>
              {isEditing ? (
                <select
                  name="category"
                  value={editData.category}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option key="maintenance" value="maintenance">Preventive Maintenance</option>
                  <option key="repair" value="repair">Repair</option>
                  <option key="inspection" value="inspection">Inspection</option>
                  <option key="calibration" value="calibration">Calibration</option>
                  <option key="installation" value="installation">Installation</option>
                  <option key="upgrade" value="upgrade">Upgrade</option>
                  <option key="emergency" value="emergency">Emergency</option>
                </select>
              ) : (
                <p className="text-sm text-gray-900">
                  {getCategoryLabel(workRequest.category)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Activity & Comments removed per UX request */}
      </div>
    </div>
  );
};