import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  TestTube,
  User,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ValidationAlert from './ValidationAlert';
import { useAuth } from '../../authentication/context/AuthContext';

const SampleCollectionForm = ({ taskId, onClose, onSuccess, isModal = false }) => {
  // Get current user from authentication context
  const { user } = useAuth();
  
  // Current user - should match the logged-in user from dashboard
  const currentUser = {
    name: user?.name || user?.firstName || user?.username || 'Unknown User',
    id: user?.lab_staff_id || user?.id || 'N/A',
    role: user?.role || user?.specialization || 'Lab Assistant'
  };

  const [formData, setFormData] = useState({
    collectedBy: currentUser.name, // Auto-populate with current user name only
    collectionDateTime: '',
    collectionSite: '',
    tubeType: '',
    volume: '',
    labelsApplied: false,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const tubeTypes = ['EDTA', 'Heparin', 'Serum', 'Citrate', 'Fluoride', 'Plain'];

  // Real-time validation rules
  const validationRules = [
    {
      id: 'collectedBy',
      field: 'Collected By',
      validator: (data) => ({
        isValid: Boolean(data.collectedBy?.trim()),
        message: data.collectedBy?.trim() ? 'Valid collector name' : 'Please enter who collected the sample',
        severity: 'error'
      })
    },
    {
      id: 'collectionDateTime',
      field: 'Collection Date & Time',
      validator: (data) => {
        if (!data.collectionDateTime) {
          return { isValid: false, message: 'Collection date and time is required', severity: 'error' };
        }
        const collectionDate = new Date(data.collectionDateTime);
        const now = new Date();
        const hoursDiff = (now - collectionDate) / (1000 * 60 * 60);
        
        if (collectionDate > now) {
          return { isValid: false, message: 'Collection time cannot be in the future', severity: 'error' };
        }
        if (hoursDiff > 24) {
          return { isValid: false, message: 'Collection was more than 24 hours ago - please verify', severity: 'warning' };
        }
        if (hoursDiff > 72) {
          return { isValid: false, message: 'Sample is more than 72 hours old - may affect test quality', severity: 'error' };
        }
        return { isValid: true, message: 'Collection time is appropriate', severity: 'success' };
      }
    },
    {
      id: 'collectionSite',
      field: 'Collection Site',
      validator: (data) => ({
        isValid: Boolean(data.collectionSite?.trim()),
        message: data.collectionSite?.trim() ? 'Collection site specified' : 'Please specify where the sample was collected',
        severity: 'error'
      })
    },
    {
      id: 'tubeType',
      field: 'Tube Type',
      validator: (data) => ({
        isValid: Boolean(data.tubeType),
        message: data.tubeType ? `Using ${data.tubeType} tube` : 'Please select the appropriate tube type',
        severity: 'error'
      })
    },
    {
      id: 'volume',
      field: 'Sample Volume',
      validator: (data) => {
        if (!data.volume?.trim()) {
          return { isValid: false, message: 'Please enter the sample volume', severity: 'error' };
        }
        const volumeNum = parseFloat(data.volume);
        if (isNaN(volumeNum) || volumeNum <= 0) {
          return { isValid: false, message: 'Volume must be a positive number', severity: 'error' };
        }
        if (volumeNum < 1) {
          return { isValid: false, message: 'Volume seems very low - please verify', severity: 'warning' };
        }
        if (volumeNum > 100) {
          return { isValid: false, message: 'Volume seems very high - please verify', severity: 'warning' };
        }
        return { isValid: true, message: `Sample volume: ${volumeNum}mL`, severity: 'success' };
      }
    },
    {
      id: 'labelsApplied',
      field: 'Sample Labels',
      validator: (data) => ({
        isValid: data.labelsApplied === true,
        message: data.labelsApplied ? 'Sample properly labeled' : 'Please confirm that labels have been applied to the sample',
        severity: data.labelsApplied ? 'success' : 'warning'
      })
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
      collectionDateTime: currentDateTime
    }));
  };

  const fetchExistingData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/labtasks/${taskId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.task.sampleCollection) {
          const existing = result.task.sampleCollection;
          setFormData({
            collectedBy: existing.collectedBy || currentUser.name, // Preserve existing or use current user name only
            collectionDateTime: existing.collectionDateTime ? new Date(existing.collectionDateTime).toISOString().slice(0, 16) : '',
            collectionSite: existing.collectionSite || '',
            tubeType: existing.tubeType || '',
            volume: existing.volume || '',
            labelsApplied: existing.labelsApplied || false,
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
    console.log('Validating form data:', formData); // Debug log
    if (!formData.collectedBy) {
      setError('Please select who collected the sample');
      return false;
    }
    if (!formData.collectionDateTime) {
      setError('Collection date and time is required');
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
      const sampleCollectionData = {
        sampleCollection: {
          ...formData,
          collectionDateTime: new Date(formData.collectionDateTime).toISOString()
        }
      };

      console.log('Submitting sample collection data:', sampleCollectionData); // Debug log
      console.log('Task ID:', taskId); // Debug log
      console.log('API URL:', `http://localhost:5000/api/labtasks/${taskId}/processing`); // Debug log

      const response = await fetch(`http://localhost:5000/api/labtasks/${taskId}/processing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleCollectionData),
      });

      const result = await response.json();
      console.log('Backend response:', result); // Debug log
      console.log('Response status:', response.status); // Debug log
      console.log('Response ok:', response.ok); // Debug log

      if (response.ok && (result.success || result.message)) {
        console.log('✅ Sample collection recorded:', result.task || result.data);
        onSuccess && onSuccess(result.message || 'Sample collection completed successfully!');
        onClose();
      } else {
        console.error('Backend error:', result);
        console.error('Full error details:', JSON.stringify(result, null, 2));
        setError(result.error || result.message || `Server error (${response.status}): Failed to save sample collection data`);
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
            <TestTube className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Sample Collection</h2>
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
            {/* Collection Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900 mb-4">Collection Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Collected By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collected By *
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                    <User className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-900 font-medium">{currentUser.name}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Sample collected by current logged-in user</p>
                  {/* Hidden input to maintain form data */}
                  <input 
                    type="hidden" 
                    name="collectedBy" 
                    value={formData.collectedBy} 
                  />
                </div>

                {/* Collection Date & Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="collectionDateTime"
                    value={formData.collectionDateTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Collection Site */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Site
                  </label>
                  <input
                    type="text"
                    name="collectionSite"
                    value={formData.collectionSite}
                    onChange={handleInputChange}
                    placeholder="e.g., Left antecubital vein"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Tube Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tube Type
                  </label>
                  <select
                    name="tubeType"
                    value={formData.tubeType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select tube type</option>
                    {tubeTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Volume */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volume
                  </label>
                  <input
                    type="text"
                    name="volume"
                    value={formData.volume}
                    onChange={handleInputChange}
                    placeholder="e.g., 5ml"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Labels Applied */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="labelsApplied"
                    checked={formData.labelsApplied}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Labels Applied Correctly
                  </label>
                </div>
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
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Record Sample Collection
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

export default SampleCollectionForm;