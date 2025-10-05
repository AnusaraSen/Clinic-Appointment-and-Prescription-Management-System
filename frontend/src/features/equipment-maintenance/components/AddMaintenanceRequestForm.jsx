import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, AlertCircle, Wrench } from 'lucide-react';
import { useAuth } from '../../authentication/context/AuthContext';

export const AddMaintenanceRequestForm = ({ isOpen, onClose, onSuccess }) => {
  // 🔐 Get current logged-in user
  const { user } = useAuth();
  
  // 📋 Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    date: '',
    equipment: ''
  });

  // 📊 Component state
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔄 Fetch equipment data when form opens
  useEffect(() => {
    if (isOpen) {
      fetchEquipment();
      // Reset form when opening
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Open',
        date: '',
        equipment: ''
      });
      setError('');
    }
  }, [isOpen]);

  //  Fetch equipment list for dropdown
  const fetchEquipment = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/equipment');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setEquipmentList(result.data);
        }
      } else {
        console.warn('Failed to fetch equipment list');
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  //  Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  //  Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    //  Client-side validation
    if (!formData.title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      setLoading(false);
      return;
    }

    try {
      // 🚨 Check if user is logged in
      if (!user || !user.id) {
        setError('User not logged in. Please log in and try again.');
        setLoading(false);
        return;
      }

      //  Prepare data for backend
      const requestData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        reportedBy: user.id, // Use current logged-in user's ID
        date: formData.date ? new Date(formData.date) : null,
        equipment: formData.equipment ? [formData.equipment] : []
      };

      console.log('Sending maintenance request with user:', { userId: user.id, userName: user.firstName + ' ' + user.lastName });
      console.log('Request data:', requestData);
      console.log('Equipment ID being sent:', formData.equipment);

      const response = await fetch('http://localhost:5000/api/maintenance-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const result = await response.json();
      console.log('Backend response:', result);
      console.log('Full error details:', JSON.stringify(result, null, 2));

      if (response.ok && result.success) {
        console.log('✅ Maintenance request created:', result.data);
        
        //  Success! Reset form and close modal
        setFormData({
          title: '',
          description: '',
          priority: 'Medium',
          date: '',
          equipment: ''
        });
        
        onSuccess && onSuccess();
        onClose();
      } else {
        console.error('❌ Backend validation failed:', result);
        setError(result.message || 'Failed to create maintenance request');
      }
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🚫 Don't render if modal is closed
  if (!isOpen) return null;

  return (
    //  Modal backdrop
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      
      {/*  Modal container */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/*  Modal header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">New Maintenance Request</h2>
              <p className="text-sm text-gray-500">Create a work order for equipment maintenance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/*  Form content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/*  Error message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/*  Reporter Info */}
          {user && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className="text-blue-700 text-sm">
                <strong>Reported by:</strong> {user.firstName} {user.lastName} ({user.email})
              </span>
            </div>
          )}

          {/*  Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              <span>Request Details</span>
            </h3>
            
            {/*  Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., X-ray machine not working"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {/*  Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the issue in detail..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                required
              />
            </div>

            {/*  Priority, Status and Date row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option key="priority-low" value="Low">🟢 Low Priority</option>
                  <option key="priority-medium" value="Medium">🟡 Medium Priority</option>
                  <option key="priority-high" value="High">🔴 High Priority</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option key="status-open" value="Open">Open</option>
                  <option key="status-inprogress" value="In Progress">In Progress</option>
                  <option key="status-completed" value="Completed">Completed</option>
                  <option key="status-cancelled" value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/*  Equipment Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Equipment (Optional)</h3>
            
            <div>
              <label htmlFor="equipment" className="block text-sm font-medium text-gray-700 mb-2">
                Related Equipment
              </label>
              <select
                id="equipment"
                name="equipment"
                value={formData.equipment}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option key="select-equipment" value="">Select equipment...</option>
                {equipmentList.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.location}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select the equipment this request is related to (optional)
              </p>
            </div>
          </div>

          {/*  Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            
            {/*  Cancel button */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            {/*  Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
