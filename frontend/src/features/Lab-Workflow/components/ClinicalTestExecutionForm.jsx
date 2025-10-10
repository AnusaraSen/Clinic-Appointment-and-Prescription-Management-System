import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle,
  CheckCircle,
  TestTube,
  User,
  Clock,
  FileText,
  Settings,
  Shield
} from 'lucide-react';
import ValidationAlert from './ValidationAlert';

const ClinicalTestExecutionForm = ({ taskId, onClose, isModal = false }) => {
  const [formData, setFormData] = useState({
    // Sample Collection
    collectedBy: '',
    collectionDateTime: '',
    collectionSite: '',
    tubeType: '',
    volume: '',
    labelsApplied: false,
    
    // Processing
    receivedDateTime: '',
    processedBy: '',
    instrumentUsed: '',
    methodUsed: '',
    chemicalUsed: '', // New field for chemical used
    qualityControlPassed: false,
    processingNotes: ''
  });

  const [testResults, setTestResults] = useState([
    { id: 1, parameter: '', value: '', unit: '', referenceRange: '', abnormalFlag: '' }
  ]);

  const [savedExecutions, setSavedExecutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const abnormalFlags = ['', 'H', 'L', 'Critical High', 'Critical Low', 'Abnormal'];
  const tubeTypes = ['EDTA', 'Heparin', 'Serum', 'Citrate', 'Fluoride', 'Plain'];
  const instruments = ['Chemistry Analyzer', 'Hematology Analyzer', 'Microscope', 'Immunoassay Analyzer', 'Manual'];

  // Real-time validation rules
  const validationRules = [
    {
      id: 'collectedBy',
      field: 'Collected By',
      validator: (data) => ({
        isValid: Boolean(data.collectedBy?.trim()),
        message: data.collectedBy?.trim() ? 'Sample collector assigned' : 'Please enter who collected the sample',
        severity: 'error'
      })
    },
    {
      id: 'processedBy', 
      field: 'Processed By',
      validator: (data) => ({
        isValid: Boolean(data.processedBy?.trim()),
        message: data.processedBy?.trim() ? 'Sample processor assigned' : 'Please enter who processed the sample',
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
        if (collectionDate > now) {
          return { isValid: false, message: 'Collection time cannot be in the future', severity: 'error' };
        }
        return { isValid: true, message: 'Collection time valid', severity: 'success' };
      }
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
      id: 'instrumentUsed',
      field: 'Instrument',
      validator: (data) => ({
        isValid: Boolean(data.instrumentUsed),
        message: data.instrumentUsed ? `Using ${data.instrumentUsed}` : 'Please select the instrument used',
        severity: 'error'
      })
    },
    {
      id: 'qualityControlPassed',
      field: 'Quality Control',
      validator: (data) => ({
        isValid: data.qualityControlPassed === true,
        message: data.qualityControlPassed ? 'Quality control passed' : 'Quality control must pass before proceeding',
        severity: data.qualityControlPassed ? 'success' : 'error'
      })
    }
  ];

  // Real-time test results validation
  const getTestResultsValidation = () => {
    const completeResults = testResults.filter(result => 
      result.parameter?.trim() && result.value?.trim() && result.referenceRange?.trim()
    );
    
    if (testResults.length === 0 || (testResults.length === 1 && !testResults[0].parameter)) {
      return {
        id: 'testResults',
        field: 'Test Results',
        validator: () => ({
          isValid: false,
          message: 'At least one test result is required',
          severity: 'error'
        })
      };
    }

    if (completeResults.length === 0) {
      return {
        id: 'testResults',
        field: 'Test Results',
        validator: () => ({
          isValid: false,
          message: 'Please complete at least one test result with parameter, value, and reference range',
          severity: 'error'
        })
      };
    }

    const incompleteResults = testResults.filter(result => 
      (result.parameter || result.value || result.referenceRange) && 
      (!result.parameter?.trim() || !result.value?.trim() || !result.referenceRange?.trim())
    );

    if (incompleteResults.length > 0) {
      return {
        id: 'testResults',
        field: 'Test Results',
        validator: () => ({
          isValid: false,
          message: `${incompleteResults.length} test result(s) are incomplete - please complete all fields or remove`,
          severity: 'warning'
        })
      };
    }

    return {
      id: 'testResults',
      field: 'Test Results',
      validator: () => ({
        isValid: true,
        message: `${completeResults.length} test result(s) completed`,
        severity: 'success'
      })
    };
  };

  // Combine all validations
  const allValidations = [...validationRules, getTestResultsValidation()];

  useEffect(() => {
    fetchSavedExecutions();
    setCurrentDateTime();
  }, []);

  const setCurrentDateTime = () => {
    const now = new Date();
    const currentDateTime = now.toISOString().slice(0, 16);
    setFormData(prev => ({ 
      ...prev, 
      collectionDateTime: currentDateTime,
      receivedDateTime: currentDateTime 
    }));
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close the form?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  const fetchSavedExecutions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/labtasks/${taskId}/executions`);
      if (response.ok) {
        const data = await response.json();
        // Use new processing data format if available, otherwise fall back to legacy executions
        setSavedExecutions(data.processing ? [data.processing] : data.executions || []);
      }
    } catch (error) {
      console.error('Error fetching processing records:', error);
      setSavedExecutions([]);
    }
  };

  const addTestResult = () => {
    const newId = Math.max(...testResults.map(r => r.id), 0) + 1;
    setTestResults([...testResults, { 
      id: newId, 
      parameter: '', 
      value: '', 
      unit: '', 
      referenceRange: '', 
      abnormalFlag: '' 
    }]);
  };

  const removeTestResult = (id) => {
    setTestResults(testResults.filter(r => r.id !== id));
  };

  const updateTestResult = (id, field, value) => {
    setTestResults(testResults.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
    markAsChanged();
  };

  const validateForm = () => {
    if (!formData.collectedBy || !formData.processedBy) {
      alert('Please fill in required fields: Collected By and Processed By');
      return false;
    }
    
    if (testResults.some(result => !result.parameter || !result.value || !result.referenceRange)) {
      alert('Please complete all test result fields');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      const executionData = {
        sampleCollection: {
          collectedBy: formData.collectedBy,
          collectionDateTime: formData.collectionDateTime,
          collectionSite: formData.collectionSite,
          tubeType: formData.tubeType,
          volume: formData.volume,
          labelsApplied: formData.labelsApplied
        },
        processing: {
          receivedDateTime: formData.receivedDateTime,
          processedBy: formData.processedBy,
          instrumentUsed: formData.instrumentUsed,
          methodUsed: formData.methodUsed,
          chemicalUsed: formData.chemicalUsed, // Include chemical used in submission
          qualityControlPassed: formData.qualityControlPassed,
          processingNotes: formData.processingNotes
        },
        results: {
          testResults: testResults.filter(r => r.parameter && r.value),
          overallInterpretation: '',
          recommendations: '',
          criticalValues: testResults.some(r => r.abnormalFlag && r.abnormalFlag.includes('Critical')),
          reviewedBy: formData.processedBy,
          approvalDateTime: new Date().toISOString()
        }
      };

      const response = await fetch(`http://localhost:5000/api/labtasks/${taskId}/processing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(executionData),
      });

      if (response.ok) {
        alert('Clinical test processing completed successfully!');
        setHasUnsavedChanges(false);
        fetchSavedExecutions();
        resetForm();
      } else {
        alert('Error saving processing data');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving processing data');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      collectedBy: '',
      collectionDateTime: '',
      collectionSite: '',
      tubeType: '',
      volume: '',
      labelsApplied: false,
      receivedDateTime: '',
      processedBy: '',
      instrumentUsed: '',
      methodUsed: '',
      chemicalUsed: '', // Include chemical used in reset
      qualityControlPassed: false,
      processingNotes: ''
    });
    setTestResults([
      { id: 1, parameter: '', value: '', unit: '', referenceRange: '', abnormalFlag: '' }
    ]);
    setHasUnsavedChanges(false);
    setCurrentDateTime();
  };

  return (
    <div 
      className={`${isModal ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' : ''}`}
      onClick={isModal ? (e) => e.target === e.currentTarget && handleClose() : undefined}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl ${isModal ? 'max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto' : 'w-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Clinical Test Processing</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Real-time Validation Display */}
          <ValidationAlert 
            validations={allValidations}
            formData={{...formData, testResults}}
            showSuccessMessages={false}
          />

          {/* Sample Collection Section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
              <TestTube className="h-5 w-5 mr-2" />
              Sample Collection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collected By *
                </label>
                <input
                  type="text"
                  value={formData.collectedBy}
                  onChange={(e) => {
                    setFormData({...formData, collectedBy: e.target.value});
                    markAsChanged();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collection Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.collectionDateTime}
                  onChange={(e) => setFormData({...formData, collectionDateTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collection Site
                </label>
                <input
                  type="text"
                  value={formData.collectionSite}
                  onChange={(e) => setFormData({...formData, collectionSite: e.target.value})}
                  placeholder="e.g., Left antecubital vein"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tube Type
                </label>
                <select
                  value={formData.tubeType}
                  onChange={(e) => setFormData({...formData, tubeType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select tube type</option>
                  {tubeTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volume
                </label>
                <input
                  type="text"
                  value={formData.volume}
                  onChange={(e) => setFormData({...formData, volume: e.target.value})}
                  placeholder="e.g., 5ml"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.labelsApplied}
                  onChange={(e) => setFormData({...formData, labelsApplied: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Labels Applied Correctly
                </label>
              </div>
            </div>
          </div>

          {/* Processing Section */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Test Processing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Received Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.receivedDateTime}
                  onChange={(e) => setFormData({...formData, receivedDateTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processed By *
                </label>
                <input
                  type="text"
                  value={formData.processedBy}
                  onChange={(e) => {
                    setFormData({...formData, processedBy: e.target.value});
                    markAsChanged();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instrument Used
                </label>
                <select
                  value={formData.instrumentUsed}
                  onChange={(e) => setFormData({...formData, instrumentUsed: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select instrument</option>
                  {instruments.map(instrument => (
                    <option key={instrument} value={instrument}>{instrument}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Method Used
                </label>
                <input
                  type="text"
                  value={formData.methodUsed}
                  onChange={(e) => setFormData({...formData, methodUsed: e.target.value})}
                  placeholder="e.g., Enzymatic, Immunoturbidimetric"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chemical Used
                </label>
                <input
                  type="text"
                  value={formData.chemicalUsed}
                  onChange={(e) => setFormData({...formData, chemicalUsed: e.target.value})}
                  placeholder="e.g., Reagent A, Buffer Solution, Enzyme Mix"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.qualityControlPassed}
                  onChange={(e) => setFormData({...formData, qualityControlPassed: e.target.checked})}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Quality Control Passed
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processing Notes
                </label>
                <textarea
                  value={formData.processingNotes}
                  onChange={(e) => setFormData({...formData, processingNotes: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Any special observations or issues during processing..."
                />
              </div>
            </div>
          </div>

          {/* Test Results Section */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-yellow-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Test Results
              </h3>
              <button
                onClick={addTestResult}
                className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Result
              </button>
            </div>
            
            <div className="space-y-3">
              {testResults.map((result) => (
                <div key={result.id} className="bg-white p-3 rounded-md border border-yellow-200">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Parameter *
                      </label>
                      <input
                        type="text"
                        value={result.parameter}
                        onChange={(e) => updateTestResult(result.id, 'parameter', e.target.value)}
                        placeholder="e.g., Glucose"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-yellow-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Value *
                      </label>
                      <input
                        type="text"
                        value={result.value}
                        onChange={(e) => updateTestResult(result.id, 'value', e.target.value)}
                        placeholder="e.g., 95"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-yellow-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={result.unit}
                        onChange={(e) => updateTestResult(result.id, 'unit', e.target.value)}
                        placeholder="e.g., mg/dL"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Reference Range *
                      </label>
                      <input
                        type="text"
                        value={result.referenceRange}
                        onChange={(e) => updateTestResult(result.id, 'referenceRange', e.target.value)}
                        placeholder="e.g., 70-100"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-yellow-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Flag
                      </label>
                      <select
                        value={result.abnormalFlag}
                        onChange={(e) => updateTestResult(result.id, 'abnormalFlag', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-yellow-500"
                      >
                        {abnormalFlags.map(flag => (
                          <option key={flag} value={flag}>{flag || 'Normal'}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => removeTestResult(result.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        disabled={testResults.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Processing Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalTestExecutionForm;