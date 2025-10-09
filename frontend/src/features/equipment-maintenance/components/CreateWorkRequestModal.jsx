import React, { useState, useEffect } from 'react';
import { useHideNavbar } from '../../../shared/hooks/useHideNavbar';
import { useAuth } from '../../../features/authentication/context/AuthContext';

// CreateWorkRequestModal - Compatible with backend API
// Expected props: isOpen, onClose, onSubmit, equipment, technicians
export const CreateWorkRequestModal = ({ isOpen, onClose, onSubmit, equipment = [], technicians = [] }) => {
  useHideNavbar(isOpen);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    date: '', // Due date for the maintenance request
    equipment: [], // Backend expects array of equipment IDs
    reportedBy: user?._id || user?.id || '', // Required by backend
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        date: '',
        equipment: [],
        reportedBy: user?._id || user?.id || '',
      });
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleEquipmentChange = (e) => {
    const selectedId = e.target.value;
    if (selectedId) {
      setFormData((f) => ({ 
        ...f, 
        equipment: [selectedId] // Backend expects array
      }));
    } else {
      setFormData((f) => ({ ...f, equipment: [] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.description) {
      alert('Please fill in title and description');
      return;
    }
    
    if (!formData.reportedBy) {
      alert('User information is missing. Please log in again.');
      return;
    }
    
    // Prepare data matching backend API expectations
    const requestData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority || 'Medium',
      reportedBy: formData.reportedBy, // Required by backend
      equipment: formData.equipment, // Array of equipment IDs
    };
    
    // Add date if provided
    if (formData.date) {
      requestData.date = formData.date;
    }
    
    console.log('Submitting work request:', requestData);
    
    if (onSubmit) {
      onSubmit(requestData);
    }
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Create Work Request</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <input 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              className="mt-1 block w-full border rounded p-2" 
              required
              placeholder="Enter request title"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              className="mt-1 block w-full border rounded p-2" 
              rows="4"
              required
              placeholder="Describe the maintenance issue"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium">Priority</label>
              <select 
                name="priority" 
                value={formData.priority} 
                onChange={handleChange} 
                className="mt-1 block w-full border rounded p-2"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium">Due Date</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange} 
                className="mt-1 block w-full border rounded p-2"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium">Equipment (Optional)</label>
            <select 
              value={formData.equipment[0] || ''} 
              onChange={handleEquipmentChange} 
              className="mt-1 block w-full border rounded p-2"
            >
              <option value="">-- No equipment specified --</option>
              {(equipment || []).map((eq) => (
                <option key={eq._id || eq.id} value={eq._id || eq.id}>
                  {eq.name || eq.label || `Equipment ${eq._id || eq.id}`}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              You can assign a technician later after the request is created
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
