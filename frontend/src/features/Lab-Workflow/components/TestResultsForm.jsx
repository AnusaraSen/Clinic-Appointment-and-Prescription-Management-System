import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  FileText,
  AlertCircle,
  CheckCircle,
  User
} from 'lucide-react';
import { useAuth } from '../../authentication/context/AuthContext';

const TestResultsForm = ({ taskId, onClose, onSuccess, isModal = false }) => {
  // Get current user from authentication context
  const { user } = useAuth();
  
  // Current user - should match the logged-in user from dashboard
  const currentUser = {
    name: user?.name || user?.firstName || user?.username || 'Unknown User',
    id: user?.lab_staff_id || user?.id || 'N/A',
    role: user?.role || user?.specialization || 'Lab Supervisor'
  };

  const [testResults, setTestResults] = useState([
    { id: 1, parameter: '', value: '', unit: '', referenceRange: '', abnormalFlag: '' }
  ]);

  const [formData, setFormData] = useState({
    overallInterpretation: '',
    recommendations: '',
    reviewedBy: currentUser.name // Auto-populate with current user name only
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const abnormalFlags = ['', 'H', 'L', 'Critical High', 'Critical Low', 'Abnormal'];

  useEffect(() => {
    if (taskId) {
      fetchExistingData();
    }
  }, [taskId]);

  const fetchExistingData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/labtasks/${taskId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.results) {
          const existing = result.results;
          
          if (existing.testResults && existing.testResults.length > 0) {
            setTestResults(existing.testResults.map((result, index) => ({
              id: index + 1,
              ...result
            })));
          }
          
          setFormData({
            overallInterpretation: existing.overallInterpretation || '',
            recommendations: existing.recommendations || '',
            reviewedBy: existing.reviewedBy || currentUser.name // Preserve existing or use current user name only
          });
        }
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
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
    if (testResults.length > 1) {
      setTestResults(testResults.filter(r => r.id !== id));
    }
  };

  const updateTestResult = (id, field, value) => {
    setTestResults(testResults.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
    setError('');
  };

  const validateForm = () => {
    // Check if at least one test result is complete
    const completeResults = testResults.filter(result => 
      result.parameter && result.value && result.referenceRange
    );
    
    if (completeResults.length === 0) {
      setError('Please complete at least one test result with parameter, value, and reference range');
      return false;
    }

    // Check that all filled results are complete
    for (const result of testResults) {
      if (result.parameter || result.value || result.referenceRange) {
        if (!result.parameter || !result.value || !result.referenceRange) {
          setError('Please complete all fields for each test result or remove incomplete entries');
          return false;
        }
      }
    }

    if (!formData.reviewedBy) {
      setError('Please select who reviewed the results');
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
      // Filter out incomplete results
      const completeResults = testResults.filter(result => 
        result.parameter && result.value && result.referenceRange
      );

      // Check for critical values
      const hasCriticalValues = completeResults.some(result => 
        result.abnormalFlag && (
          result.abnormalFlag.includes('Critical') || 
          result.abnormalFlag === 'Critical High' || 
          result.abnormalFlag === 'Critical Low'
        )
      );

      const resultsData = {
        results: {
          testResults: completeResults,
          overallInterpretation: formData.overallInterpretation,
          recommendations: formData.recommendations,
          criticalValues: hasCriticalValues,
          reviewedBy: formData.reviewedBy,
          approvalDateTime: new Date().toISOString()
        }
      };

      const response = await fetch(`http://localhost:5000/api/labtasks/${taskId}/processing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultsData),
      });

      const result = await response.json();
      console.log('Backend response:', result); // Debug log

      if (response.ok && (result.success || result.message)) {
        console.log('✅ Test results recorded:', result.task || result.data);
        onSuccess && onSuccess(result.message || `Test results recorded successfully! ${hasCriticalValues ? 'Critical values detected.' : ''}`);
        onClose();
      } else {
        console.error('Backend error:', result);
        setError(result.error || result.message || 'Failed to save test results');
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

  const getCriticalCount = () => {
    return testResults.filter(result => 
      result.abnormalFlag && (
        result.abnormalFlag.includes('Critical') || 
        result.abnormalFlag === 'Critical High' || 
        result.abnormalFlag === 'Critical Low'
      )
    ).length;
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
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Test Results Entry</h2>
              {getCriticalCount() > 0 && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getCriticalCount()} critical value(s) detected
                </p>
              )}
            </div>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Test Results Section */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-yellow-900">Test Results</h3>
                <button
                  type="button"
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
                          placeholder="e.g., Glucose, Hemoglobin"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-yellow-500"
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
                          placeholder="e.g., 95, 12.5"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-yellow-500"
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
                          placeholder="e.g., mg/dL, g/dL"
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
                          placeholder="e.g., 70-100, 12-16"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Flag
                        </label>
                        <select
                          value={result.abnormalFlag}
                          onChange={(e) => updateTestResult(result.id, 'abnormalFlag', e.target.value)}
                          className={`w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-yellow-500 ${
                            result.abnormalFlag && result.abnormalFlag.includes('Critical') ? 'bg-red-50 text-red-700' : ''
                          }`}
                        >
                          {abnormalFlags.map(flag => (
                            <option key={flag} value={flag}>{flag || 'Normal'}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
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

            {/* Review and Interpretation */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900 mb-4">Review and Interpretation</h3>
              
              <div className="space-y-4">
                {/* Reviewed By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reviewed By *
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                    <User className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-900 font-medium">{currentUser.name}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Results reviewed by current logged-in user</p>
                  {/* Hidden input to maintain form data */}
                  <input 
                    type="hidden" 
                    name="reviewedBy" 
                    value={formData.reviewedBy} 
                  />
                </div>

                {/* Overall Interpretation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Interpretation
                  </label>
                  <textarea
                    name="overallInterpretation"
                    value={formData.overallInterpretation}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Clinical interpretation of the test results..."
                  />
                </div>

                {/* Recommendations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommendations
                  </label>
                  <textarea
                    name="recommendations"
                    value={formData.recommendations}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Follow-up recommendations based on results..."
                  />
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
                className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Results
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

export default TestResultsForm;