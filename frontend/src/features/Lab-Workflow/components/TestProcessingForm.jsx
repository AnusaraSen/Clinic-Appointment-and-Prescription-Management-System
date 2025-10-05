import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Settings,
  User,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ValidationAlert from './ValidationAlert';

const TestProcessingForm = ({ taskId, onClose, onSuccess, isModal = false }) => {
  // Current user - should match the logged-in user from dashboard
  const currentUser = {
    name: 'Kasun',
    id: 'LAB-0001',
    role: 'Lab Technician'
  };

  const [formData, setFormData] = useState({
    receivedDateTime: '',
    processedBy: currentUser.name, // Auto-populate with current user
    instrumentUsed: '',
    methodUsed: '',
    qualityControlPassed: false,
    processingNotes: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const instruments = [
    'Chemistry Analyzer', 
    'Hematology Analyzer', 
    'Microscope', 
    'Immunoassay Analyzer', 
    'PCR Machine',
    'Spectrophotometer',
    'Centrifuge',
    'Manual'
  ];

  // Real-time validation rules
  const validationRules = [
    {
      id: 'processedBy',
      field: 'Processed By',
      validator: (data) => ({
        isValid: Boolean(data.processedBy?.trim()),
        message: data.processedBy?.trim() ? 'Processor assigned' : 'Please enter who processed the sample',
        severity: 'error'
      })
    },
    {
      id: 'receivedDateTime',
      field: 'Received Date & Time',
      validator: (data) => {
        if (!data.receivedDateTime) {
          return { isValid: false, message: 'Reception time is required', severity: 'error' };
        }
        const receivedDate = new Date(data.receivedDateTime);
        const now = new Date();
        
        if (receivedDate > now) {
          return { isValid: false, message: 'Reception time cannot be in the future', severity: 'error' };
        }
        const hoursDiff = (now - receivedDate) / (1000 * 60 * 60);
        if (hoursDiff > 48) {
          return { isValid: false, message: 'Sample received more than 48 hours ago - verify processing timeline', severity: 'warning' };
        }
        return { isValid: true, message: 'Reception time recorded', severity: 'success' };
      }
    },
    {
      id: 'instrumentUsed',
      field: 'Instrument',
      validator: (data) => {
        if (!data.instrumentUsed) {
          return { isValid: false, message: 'Please select the instrument used for processing', severity: 'error' };
        }
        if (data.instrumentUsed === 'Manual') {
          return { isValid: true, message: 'Manual processing selected - ensure proper documentation', severity: 'info' };
        }
        return { isValid: true, message: `Using ${data.instrumentUsed}`, severity: 'success' };
      }
    },
    {
      id: 'methodUsed',
      field: 'Method',
      validator: (data) => {
        if (!data.methodUsed?.trim()) {
          return { isValid: false, message: 'Please specify the processing method', severity: 'error' };
        }
        if (data.methodUsed.length < 5) {
          return { isValid: false, message: 'Method description seems too short - please provide more detail', severity: 'warning' };
        }
        return { isValid: true, message: 'Processing method documented', severity: 'success' };
      }
    },
    {
      id: 'qualityControl',
      field: 'Quality Control',
      validator: (data) => ({
        isValid: data.qualityControlPassed === true,
        message: data.qualityControlPassed ? 'Quality control passed' : 'Quality control must pass before proceeding',
        severity: data.qualityControlPassed ? 'success' : 'error'
      })
    },
    {
      id: 'processingNotes',
      field: 'Processing Notes',
      validator: (data) => {
        if (!data.processingNotes?.trim()) {
          return { isValid: false, message: 'Processing notes help with quality assurance', severity: 'info' };
        }
        if (data.processingNotes.length < 10) {
          return { isValid: false, message: 'Consider adding more detailed processing notes', severity: 'info' };
        }
        return { isValid: true, message: 'Processing notes documented', severity: 'success' };
      }
    }
  ];

  useEffect(() => {
    setCurrentDateTime();
    if (taskId) {
      fetchExistingData();
    }
  }, [taskId]);

  const setCurrentDateTime = () => {
    const now = new Date();
    const currentDateTime = now.toISOString().slice(0, 16);
    setFormData(prev => ({ 
      ...prev, 
      receivedDateTime: currentDateTime
    }));
  };

  const fetchExistingData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/labtasks/${taskId}/processing`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.processing) {
          const existing = result.data.processing;
          setFormData({
            receivedDateTime: existing.receivedDateTime ? new Date(existing.receivedDateTime).toISOString().slice(0, 16) : '',
            processedBy: existing.processedBy || currentUser.name, // Preserve current user if no existing data
            instrumentUsed: existing.instrumentUsed || '',
            methodUsed: existing.methodUsed || '',
            qualityControlPassed: existing.qualityControlPassed || false,
            processingNotes: existing.processingNotes || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.processedBy) {
      setError('Please select who processed the sample');
      return false;
    }
    if (!formData.receivedDateTime) {
      setError('Received date and time is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    setError('');
    
    try {
      const processingData = {
        processing: {
          ...formData,
          receivedDateTime: new Date(formData.receivedDateTime).toISOString()
        }
      };

      const response = await fetch(`http://localhost:5000/api/labtasks/${taskId}/processing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processingData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ Test processing recorded:', result.data);
        onSuccess && onSuccess('Test processing completed successfully!');
        onClose();
      } else {
        setError(result.error || 'Failed to save processing data');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div 
      className={`${isModal ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' : ''}`}
      onClick={isModal ? (e) => e.target === e.currentTarget && handleClose() : undefined}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl ${isModal ? 'max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto' : 'w-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Settings className="h-6 w-6 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Test Processing</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Validation Display */}
          <ValidationAlert 
            validations={validationRules}
            formData={formData}
            showSuccessMessages={false}
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Processing Information */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-900 mb-4">Processing Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Received Date & Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Received Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="receivedDateTime"
                    value={formData.receivedDateTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                {/* Processed By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Processed By *
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                    <User className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-900 font-medium">{currentUser.name}</span>
                    <span className="text-gray-500 ml-2">({currentUser.id})</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Test processed by current logged-in user</p>
                  {/* Hidden input to maintain form data */}
                  <input 
                    type="hidden" 
                    name="processedBy" 
                    value={formData.processedBy} 
                  />
                </div>

                {/* Instrument Used */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instrument Used
                  </label>
                  <select
                    name="instrumentUsed"
                    value={formData.instrumentUsed}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select instrument</option>
                    {instruments.map(instrument => (
                      <option key={instrument} value={instrument}>{instrument}</option>
                    ))}
                  </select>
                </div>

                {/* Method Used */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Method Used
                  </label>
                  <input
                    type="text"
                    name="methodUsed"
                    value={formData.methodUsed}
                    onChange={handleInputChange}
                    placeholder="e.g., Enzymatic, Immunoturbidimetric, PCR"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Quality Control */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="qualityControlPassed"
                    checked={formData.qualityControlPassed}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Quality Control Passed
                  </label>
                </div>
              </div>

              {/* Processing Notes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Notes
                </label>
                <textarea
                  name="processingNotes"
                  value={formData.processingNotes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Any special observations, issues, or notes during processing..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Record Processing
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TestProcessingForm;