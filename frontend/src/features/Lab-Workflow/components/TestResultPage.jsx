import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  Eye, 
  Download, 
  Printer,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Activity,
  X,
  ChevronRight,
  Trash2,
  Edit,
  Plus,
  Save
} from 'lucide-react';

const TestResultPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resultToDelete, setResultToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLabResults();
  }, []);

  const fetchLabResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching lab results...');
      
      // Fetch all lab tasks with completed results
      const response = await fetch('http://localhost:5000/api/labtasks');
      const data = await response.json();
      
      console.log('Fetched tasks:', data);
      
      if (data.tasks) {
        // Filter tasks that have completed clinical processing with results
        const completedResults = [];
        
        for (const task of data.tasks) {
          try {
            console.log(`Checking task ${task._id} for results...`);
            
            // Check if the task has results directly in the main response
            const hasDirectResults = task.results && (
              (task.results.testResults && task.results.testResults.length > 0) ||
              task.results.overallInterpretation ||
              task.results.recommendations
            );
            
            if (hasDirectResults) {
              // Use the task data directly if it has results
              completedResults.push({
                ...task,
                clinicalResults: task // Use the task itself as clinicalResults for consistency
              });
              console.log(`Task ${task._id} added directly with results`);
            } else {
              // Fallback: Check if task has clinical processing results via detailed API
              console.log(`Task ${task._id} checking detailed results...`);
              const processingResponse = await fetch(`http://localhost:5000/api/labtasks/${task._id}`);
              const processingData = await processingResponse.json();
              
              console.log(`Task ${task._id} detailed data:`, processingData);
              
              // Check if the detailed response has results
              const hasDetailedResults = processingData?.results && (
                (processingData.results.testResults && processingData.results.testResults.length > 0) ||
                processingData.results.overallInterpretation ||
                processingData.results.recommendations
              );
              
              if (hasDetailedResults) {
                completedResults.push({
                  ...task,
                  clinicalResults: processingData
                });
                console.log(`Task ${task._id} added with detailed results`);
              }
            }
          } catch (err) {
            console.warn(`Failed to process task ${task._id}:`, err);
          }
        }
        
        console.log('Completed results:', completedResults);
        console.log('KPI Debug Info:', {
          totalResults: completedResults.length,
          statusBreakdown: completedResults.map(r => ({ id: r._id, status: r.status })),
          dateBreakdown: completedResults.map(r => ({ 
            id: r._id, 
            updatedAt: r.updatedAt,
            lastUpdated: r.lastUpdated,
            clinicalLastUpdated: r.clinicalResults?.lastUpdated,
            clinicalUpdatedAt: r.clinicalResults?.updatedAt,
            approvalDateTime: r.clinicalResults?.results?.approvalDateTime
          })),
          todaysResults: completedResults.filter(r => {
            const today = new Date().toDateString();
            const possibleDates = [
              r.clinicalResults?.lastUpdated,
              r.clinicalResults?.updatedAt,
              r.clinicalResults?.results?.approvalDateTime,
              r.updatedAt,
              r.lastUpdated
            ];
            
            for (const date of possibleDates) {
              if (date) {
                try {
                  const resultDate = new Date(date).toDateString();
                  console.log(`Checking date ${date} -> ${resultDate} vs ${today}`);
                  if (today === resultDate) {
                    return true;
                  }
                } catch (e) {
                  continue;
                }
              }
            }
            return false;
          })
        });
        setResults(completedResults);
      }
    } catch (err) {
      console.error('Error fetching lab results:', err);
      setError('Failed to load lab results');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sample collected':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'results ready':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const handleViewResults = (taskId) => {
    const result = results.find(r => r._id === taskId);
    if (result) {
      setSelectedResult(result);
      setShowDetailModal(true);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedResult(null);
  };

  const handleDeleteResult = (result) => {
    setResultToDelete(result);
    setShowDeleteModal(true);
  };

  const handleEditResult = (result) => {
    setEditingResult(result);
    
    // Initialize the edit form with current result data
    const formData = {
      testResults: result.clinicalResults?.results?.testResults?.map(test => ({
        parameter: test.parameter || '',
        value: test.value || '',
        unit: test.unit || '',
        referenceRange: test.referenceRange || '',
        abnormalFlag: test.abnormalFlag || '',
        description: test.description || ''
      })) || [],
      overallInterpretation: result.clinicalResults?.results?.overallInterpretation || '',
      recommendations: result.clinicalResults?.results?.recommendations || '',
      reviewedBy: result.clinicalResults?.results?.reviewedBy || '',
      criticalValues: result.clinicalResults?.results?.criticalValues || false,
      supervisorApproval: result.clinicalResults?.results?.supervisorApproval || ''
    };
    
    setEditFormData(formData);
    setShowEditModal(true);
  };

  const handleSaveEditedResult = async () => {
    if (!editingResult || !editFormData) return;

    setSaving(true);
    try {
      console.log('=== SAVE EDIT DEBUG INFO ===');
      console.log('Editing result:', editingResult._id);
      console.log('Form data:', JSON.stringify(editFormData, null, 2));
      console.log('Update URL:', `http://localhost:5000/api/labtasks/${editingResult._id}`);
      console.log('============================');

      // Prepare the update payload to match the task structure
      const updatePayload = {
        results: {
          testResults: editFormData.testResults,
          overallInterpretation: editFormData.overallInterpretation,
          recommendations: editFormData.recommendations,
          reviewedBy: editFormData.reviewedBy,
          criticalValues: editFormData.criticalValues,
          supervisorApproval: editFormData.supervisorApproval,
          approvalDateTime: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      const response = await fetch(`http://localhost:5000/api/labtasks/${editingResult._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      console.log('Update response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          errorMessage = errorData.message || errorData.error || 'Failed to update result';
        } catch (e) {
          const errorText = await response.text();
          console.log('Error response text:', errorText);
          errorMessage = errorText || `HTTP ${response.status}`;
        }
        throw new Error(`Failed to update result: ${errorMessage}`);
      }

      console.log('Result updated successfully');
      
      // Refresh the results list
      await fetchLabResults();
      
      // Close the edit modal
      setShowEditModal(false);
      setEditingResult(null);
      setEditFormData(null);
      
      // Show success message
      alert('Test result updated successfully!');
      
    } catch (error) {
      console.error('Error updating result:', error);
      alert(`Failed to update the result: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingResult(null);
    setEditFormData(null);
  };

  const updateTestParameter = (index, field, value) => {
    setEditFormData(prev => ({
      ...prev,
      testResults: prev.testResults.map((test, i) => 
        i === index ? { ...test, [field]: value } : test
      )
    }));
  };

  const addTestParameter = () => {
    setEditFormData(prev => ({
      ...prev,
      testResults: [
        ...prev.testResults,
        {
          parameter: '',
          value: '',
          unit: '',
          referenceRange: '',
          abnormalFlag: '',
          description: ''
        }
      ]
    }));
  };

  const removeTestParameter = (index) => {
    setEditFormData(prev => ({
      ...prev,
      testResults: prev.testResults.filter((_, i) => i !== index)
    }));
  };

  const generateDetailedPrintReport = (result) => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleString();
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString();
    };
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lab Test Results - ${result?.task_id || 'Unknown'}</title>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6; 
            color: #333;
            background: white;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #007cba; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          .header h1 { 
            color: #007cba; 
            margin: 0; 
            font-size: 24px; 
          }
          .header h2 { 
            color: #666; 
            margin: 10px 0; 
            font-size: 18px; 
          }
          .clinic-header {
            text-align: center;
            margin-bottom: 20px;
          }
          .clinic-name {
            font-size: 28px;
            font-weight: bold;
            color: #007cba;
            margin: 0;
          }
          .clinic-subtitle {
            font-size: 18px;
            color: #666;
            margin: 5px 0;
          }
          .patient-info { 
            background: #f8f9fa; 
            padding: 20px; 
            margin-bottom: 25px; 
            border-radius: 8px; 
            border-left: 4px solid #007cba;
          }
          .patient-info h3 {
            margin-top: 0;
            color: #007cba;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 25px;
          }
          .info-section {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border-left: 3px solid #007cba;
          }
          .info-section h4 {
            margin: 0 0 10px 0;
            color: #007cba;
            font-size: 14px;
          }
          .results-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 25px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .results-table th { 
            background-color: #007cba; 
            color: white;
            padding: 12px 8px; 
            text-align: left; 
            font-weight: bold;
          }
          .results-table td { 
            border: 1px solid #ddd; 
            padding: 10px 8px; 
            text-align: left; 
          }
          .results-table tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .abnormal { 
            background-color: #fee; 
            color: #dc2626; 
            font-weight: bold; 
          }
          .critical { 
            background-color: #fcc; 
            color: #991b1b; 
            font-weight: bold; 
          }
          .normal { 
            color: #059669; 
            font-weight: 500;
          }
          .interpretation { 
            background: #f0f9ff; 
            padding: 20px; 
            margin: 25px 0; 
            border-left: 4px solid #007cba; 
            border-radius: 4px;
          }
          .interpretation h3 {
            color: #007cba;
            margin-top: 0;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 12px; 
            color: #666; 
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .critical-alert {
            background: #fee;
            border: 2px solid #dc2626;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #991b1b;
          }
          .critical-alert h3 {
            color: #991b1b;
            margin-top: 0;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="clinic-header">
          <h1 class="clinic-name">Family Health Care</h1>
          <p class="clinic-subtitle">CLINIC MANAGEMENT SYSTEM</p>
        </div>
        
        <div class="header">
          <h1>Clinical Laboratory Test Results</h1>
          <h2>${result?.taskTitle || result?.testType || 'Laboratory Test'}</h2>
          <p><strong>Task ID:</strong> ${result?.task_id || 'Unknown'}</p>
        </div>
        
        <div class="patient-info">
          <h3>Patient Information</h3>
          <p><strong>Name:</strong> ${result?.patient?.name || 'N/A'}</p>
          <p><strong>Patient ID:</strong> ${result?.patient?.patient_id || 'N/A'}</p>
          <p><strong>Test Requested:</strong> ${result?.taskTitle || result?.testType || 'N/A'}</p>
        </div>
        
        <div class="info-grid">
          <div class="info-section">
            <h4>Test Information</h4>
            <p><strong>Test Type:</strong> ${result?.taskTitle || result?.testType || 'N/A'}</p>
            <p><strong>Status:</strong> ${result?.status || 'N/A'}</p>
            <p><strong>Priority:</strong> ${result?.priority || 'Standard'}</p>
            <p><strong>Requested:</strong> ${formatDate(result?.requestedAt || result?.createdAt)}</p>
            <p><strong>Completed:</strong> ${formatDate(result?.completedAt || result?.updatedAt)}</p>
          </div>
          
          <div class="info-section">
            <h4>Sample & Processing</h4>
            <p><strong>Collected By:</strong> ${result?.clinicalResults?.sampleCollection?.collectedBy || 'N/A'}</p>
            <p><strong>Collection Date:</strong> ${formatDate(result?.clinicalResults?.sampleCollection?.collectionDateTime)}</p>
            <p><strong>Collection Site:</strong> ${result?.clinicalResults?.sampleCollection?.collectionSite || 'N/A'}</p>
            <p><strong>Tube Type:</strong> ${result?.clinicalResults?.sampleCollection?.tubeType || 'N/A'}</p>
            <p><strong>Processed By:</strong> ${result?.clinicalResults?.processing?.processedBy || 'N/A'}</p>
          </div>
          
          <div class="info-section">
            <h4>Review Information</h4>
            <p><strong>Reviewed By:</strong> ${result?.clinicalResults?.results?.reviewedBy || result?.reviewedBy || 'Pending Review'}</p>
            <p><strong>Technician:</strong> ${result?.assignedTo?.name || 'Lab Staff'}</p>
            <p><strong>Supervisor:</strong> ${result?.clinicalResults?.results?.supervisorApproval || 'Pending'}</p>
            <p><strong>Lab Department:</strong> Clinical Laboratory</p>
            <p><strong>Equipment:</strong> ${result?.clinicalResults?.processing?.instrumentUsed || 'N/A'}</p>
          </div>
        </div>
        
        ${result?.clinicalResults?.results?.criticalValues ? `
          <div class="critical-alert">
            <h3>⚠ Critical Values Detected</h3>
            <p>This test contains critical values that require immediate attention. Please review the results carefully and take appropriate action.</p>
          </div>
        ` : ''}
        
        ${result?.clinicalResults?.results?.testResults?.length > 0 ? `
          <div class="results-section">
            <h3 style="color: #007cba; margin-bottom: 15px;">📊 Test Parameters and Results</h3>
            <table class="results-table">
              <thead>
                <tr>
                  <th>PARAMETER</th>
                  <th>RESULT</th>
                  <th>UNIT</th>
                  <th>REFERENCE RANGE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                ${result.clinicalResults.results.testResults.map(test => `
                  <tr>
                    <td><strong>${test.parameter}</strong></td>
                    <td class="${test.abnormalFlag && test.abnormalFlag !== '' ? (test.abnormalFlag.includes('Critical') ? 'critical' : 'abnormal') : 'normal'}">${test.value}</td>
                    <td>${test.unit || '-'}</td>
                    <td>${test.referenceRange || 'N/A'}</td>
                    <td class="${test.abnormalFlag && test.abnormalFlag !== '' ? (test.abnormalFlag.includes('Critical') ? 'critical' : 'abnormal') : 'normal'}">
                      ${test.abnormalFlag && test.abnormalFlag.includes('Critical') ? '🚨 ' : ''}${test.abnormalFlag || 'Normal'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : '<p>No test results available.</p>'}
        
        ${result?.clinicalResults?.results?.overallInterpretation ? `
          <div class="interpretation">
            <h3>📝 Clinical Interpretation</h3>
            <p>${result.clinicalResults.results.overallInterpretation}</p>
          </div>
        ` : ''}
        
        ${result?.clinicalResults?.results?.recommendations ? `
          <div class="interpretation">
            <h3>💡 Recommendations</h3>
            <p>${result.clinicalResults.results.recommendations}</p>
          </div>
        ` : ''}
        
        <div class="info-grid" style="margin-top: 30px;">
          <div class="info-section">
            <h4>Additional Information</h4>
            <p><strong>Method:</strong> Standard Protocol</p>
            <p><strong>Quality Control:</strong> Passed</p>
            <p><strong>Chemical Used:</strong> ${result?.clinicalResults?.processing?.chemicalUsed || 'N/A'}</p>
          </div>
          <div class="info-section">
            <h4>Laboratory Information</h4>
            <p><strong>Lab Department:</strong> Clinical Laboratory</p>
            <p><strong>Technician:</strong> ${result?.assignedTo?.name || 'Lab Staff'}</p>
          </div>
          <div class="info-section">
            <h4>Timestamps</h4>
            <p><strong>Requested:</strong> ${formatDate(result?.requestedAt || result?.createdAt)}</p>
            <p><strong>Completed:</strong> ${formatDate(result?.completedAt || result?.updatedAt)}</p>
            <p><strong>Reviewed By:</strong> ${result?.reviewedBy || 'Sarasi Mannada'}</p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Report Generated:</strong> ${currentDate}</p>
          <p>This is an official laboratory report. For questions, please contact the laboratory.</p>
          <p><strong>Family Health Care Clinic Management System</strong></p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = function() {
      printWindow.print();
    };
  };

  const confirmDeleteResult = async () => {
    if (!resultToDelete) return;

    setDeleting(true);
    try {
      console.log('=== DELETE DEBUG INFO ===');
      console.log('Attempting to delete result:', resultToDelete._id);
      console.log('Result task_id:', resultToDelete.task_id);
      console.log('Result data:', JSON.stringify(resultToDelete, null, 2));
      console.log('Delete URL:', `http://localhost:5000/api/labtasks/${resultToDelete._id}`);
      console.log('=========================');
      
      // First, check if the task still exists
      const checkResponse = await fetch(`http://localhost:5000/api/labtasks/${resultToDelete._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Check task exists - Response status:', checkResponse.status);

      if (!checkResponse.ok) {
        if (checkResponse.status === 404) {
          console.log('Task already deleted or does not exist');
          // Task doesn't exist, so consider it already deleted
          await fetchLabResults(); // Refresh the list
          setShowDeleteModal(false);
          setResultToDelete(null);
          alert('The task has already been deleted or does not exist. Refreshing the list...');
          return;
        } else {
          throw new Error(`Error checking task existence: ${checkResponse.status}`);
        }
      }
      
      // If task exists, proceed with deletion
      const labTaskResponse = await fetch(`http://localhost:5000/api/labtasks/${resultToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Lab task API response status:', labTaskResponse.status);
      console.log('Lab task API response ok:', labTaskResponse.ok);

      if (!labTaskResponse.ok) {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await labTaskResponse.json();
          console.log('Error response data:', errorData);
          errorMessage = errorData.message || errorData.error || 'Failed to delete result';
        } catch (e) {
          const errorText = await labTaskResponse.text();
          console.log('Error response text:', errorText);
          errorMessage = errorText || `HTTP ${labTaskResponse.status}`;
        }
        console.error('Lab task deletion failed:', errorMessage);
        throw new Error(`Failed to delete result: ${errorMessage}`);
      }
      
      console.log('Lab task deletion successful');

      // Refresh the results list
      await fetchLabResults();
      
      // Close the modal
      setShowDeleteModal(false);
      setResultToDelete(null);
      
      // Show success message
      console.log('Result deleted successfully');
      alert('Result deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting result:', error);
      
      // More specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Network error: Unable to connect to the server. Please check if the backend server is running on port 5000.');
      } else if (error.message.includes('404') || error.message.includes('Task not found')) {
        alert('The task was not found or may have already been deleted. Refreshing the list...');
        // Refresh the list to show current data
        await fetchLabResults();
      } else {
        alert(`Failed to delete the result: ${error.message}`);
      }
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteResult = () => {
    setShowDeleteModal(false);
    setResultToDelete(null);
  };

  const filteredResults = results.filter(result => {
    const matchesSearch = searchTerm === '' || 
      result.task_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.testType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      result.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Lab Results</h2>
          <p className="text-gray-600">Fetching completed test results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchLabResults}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lab Results</h1>
            <p className="text-gray-600">View and manage completed laboratory test results</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchLabResults}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Results
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by task ID, patient, or test type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="sample collected">Sample Collected</option>
                <option value="in progress">In Progress</option>
                <option value="results ready">Results Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Results</p>
                <p className="text-2xl font-bold text-gray-900">{results.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {results.filter(r => {
                    const status = r.status?.toLowerCase();
                    return status === 'completed' || status === 'results ready';
                  }).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical Values</p>
                <p className="text-2xl font-bold text-gray-900">
                  {results.filter(r => r.clinicalResults?.results?.criticalValues).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Results</p>
                <p className="text-2xl font-bold text-gray-900">
                  {results.filter(r => {
                    const today = new Date().toDateString();
                    // Check multiple possible date fields for when the result was completed/updated
                    const possibleDates = [
                      r.clinicalResults?.lastUpdated,
                      r.clinicalResults?.updatedAt,
                      r.clinicalResults?.results?.approvalDateTime,
                      r.updatedAt,
                      r.lastUpdated
                    ];
                    
                    // Find the first valid date and check if it's today
                    for (const date of possibleDates) {
                      if (date) {
                        try {
                          const resultDate = new Date(date).toDateString();
                          if (today === resultDate) {
                            return true;
                          }
                        } catch (e) {
                          // Invalid date, continue to next one
                          continue;
                        }
                      }
                    }
                    return false;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Lab Test Results ({filteredResults.length})
            </h3>
          </div>

          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-500 mb-4">
                {results.length === 0 
                  ? "No completed lab results are available yet." 
                  : "No results match your current filters."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <div key={result._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-medium text-gray-900">
                          {result.task_id}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(result.status)}`}>
                          {result.status}
                        </span>
                        {result.clinicalResults?.results?.criticalValues && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Critical
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Patient</p>
                          <p className="font-medium text-gray-900">
                            {result.patient?.name || 'Unknown Patient'}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {result.patient?.patient_id || 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Test Type</p>
                          <p className="font-medium text-gray-900">
                            {result.testType || result.taskTitle || 'Lab Test'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {result.clinicalResults?.results?.testResults?.length || 0} parameters
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Completed</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(result.clinicalResults?.results?.approvalDateTime || 
                                       result.clinicalResults?.lastUpdated || 
                                       result.updatedAt || 
                                       result.clinicalResults?.updatedAt ||
                                       result.lastUpdated)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Reviewed by: {result.clinicalResults?.results?.reviewedBy || 'Pending'}
                          </p>
                        </div>
                      </div>

                      {/* Test Results Preview */}
                      {result.clinicalResults?.results?.testResults?.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Test Parameters:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {result.clinicalResults.results.testResults.slice(0, 6).map((test, index) => (
                              <div key={index} className="text-xs">
                                <span className="text-gray-600">{test.parameter}:</span>
                                <span className="ml-1 font-medium text-gray-900">{test.value}</span>
                                <span className="ml-1 text-gray-500">{test.unit}</span>
                                {test.abnormalFlag && (
                                  <span className="ml-1 text-red-600 font-medium">({test.abnormalFlag})</span>
                                )}
                              </div>
                            ))}
                            {result.clinicalResults.results.testResults.length > 6 && (
                              <div className="text-xs text-gray-500">
                                +{result.clinicalResults.results.testResults.length - 6} more...
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Clinical Interpretation Preview */}
                      {result.clinicalResults?.results?.overallInterpretation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">
                            <strong>Clinical Interpretation:</strong> {result.clinicalResults.results.overallInterpretation.substring(0, 150)}
                            {result.clinicalResults.results.overallInterpretation.length > 150 && '...'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      <button
                        onClick={() => handleViewResults(result._id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                      
                      <button
                        onClick={() => generateDetailedPrintReport(result)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Print
                      </button>

                      {/* Edit button - show for completed results */}
                      {(result.status === 'Completed' || result.status === 'Results Ready' || result.status?.toLowerCase() === 'completed' || result.status?.toLowerCase() === 'results ready') && (
                        <button
                          onClick={() => handleEditResult(result)}
                          className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                      )}

                      {/* Delete button - only show for completed results */}
                      {(result.status === 'Completed' || result.status === 'Results Ready' || result.status?.toLowerCase() === 'completed' || result.status?.toLowerCase() === 'results ready') && (
                        <button
                          onClick={() => handleDeleteResult(result)}
                          className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Results Modal */}
      {showDetailModal && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Lab Test Results Details</h2>
                <p className="text-blue-100 mt-1">Task ID: {selectedResult.task_id}</p>
              </div>
              <button
                onClick={closeDetailModal}
                className="text-white hover:bg-blue-700 rounded-lg p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Patient and Test Information */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Patient Information</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Name:</span> {selectedResult.patient?.name || 'Unknown Patient'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Patient ID:</span> {selectedResult.patient?.patient_id || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Test Information</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Test Type:</span> {selectedResult.testType || selectedResult.taskTitle || 'Lab Test'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Status:</span> 
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedResult.status)}`}>
                          {selectedResult.status}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Priority:</span> {selectedResult.priority || 'Normal'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Timestamps</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Requested:</span> {formatDate(selectedResult.createdAt || selectedResult.created_at)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Completed:</span> {formatDate(
                          selectedResult.clinicalResults?.results?.approvalDateTime || 
                          selectedResult.clinicalResults?.lastUpdated || 
                          selectedResult.updatedAt || 
                          selectedResult.clinicalResults?.updatedAt ||
                          selectedResult.lastUpdated ||
                          selectedResult.clinicalResults?.createdAt
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Reviewed By:</span> {selectedResult.clinicalResults?.results?.reviewedBy || 'Pending Review'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Results Section */}
              {selectedResult.clinicalResults?.results?.testResults?.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Test Parameters and Results
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Parameter
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Result
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reference Range
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedResult.clinicalResults.results.testResults.map((test, index) => (
                          <tr key={index} className={test.abnormalFlag ? 'bg-red-50' : 'hover:bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{test.parameter}</div>
                              {test.description && (
                                <div className="text-xs text-gray-500">{test.description}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-medium ${test.abnormalFlag ? 'text-red-900' : 'text-gray-900'}`}>
                                {test.value}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {test.unit || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {test.referenceRange || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {test.abnormalFlag ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {test.abnormalFlag}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Normal
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Clinical Interpretation */}
              {selectedResult.clinicalResults?.results?.overallInterpretation && (
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Clinical Interpretation
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {selectedResult.clinicalResults.results.overallInterpretation}
                    </p>
                  </div>
                </div>
              )}

              {/* Critical Values Alert */}
              {selectedResult.clinicalResults?.results?.criticalValues && (
                <div className="p-6 border-b border-gray-200">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-red-800 mb-1">Critical Values Detected</h3>
                        <p className="text-sm text-red-700">
                          This test contains critical values that require immediate attention. 
                          Please review the results carefully and take appropriate action.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Test Information */}
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Test Details</h4>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Equipment:</span> {selectedResult.clinicalResults?.processing?.instrumentUsed || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Method:</span> {selectedResult.clinicalResults?.results?.testMethod || 'Standard Protocol'}
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Quality Control:</span> {selectedResult.clinicalResults?.results?.qcStatus || 'Passed'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Laboratory Information</h4>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Lab Department:</span> {selectedResult.department || 'Clinical Laboratory'}
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Technician:</span> {selectedResult.assignedTo?.name || 'Lab Staff'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Last updated: {formatDate(selectedResult.clinicalResults?.lastUpdated)}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => generateDetailedPrintReport(selectedResult)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Results
                </button>
                {(selectedResult.status === 'Completed' || selectedResult.status === 'Results Ready' || selectedResult.status?.toLowerCase() === 'completed' || selectedResult.status?.toLowerCase() === 'results ready') && (
                  <button
                    onClick={() => {
                      closeDetailModal();
                      handleEditResult(selectedResult);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Results
                  </button>
                )}
                <button
                  onClick={closeDetailModal}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && resultToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-red-600 text-white p-6 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 mr-3" />
                <h2 className="text-xl font-semibold">Delete Test Result</h2>
              </div>
              <button
                onClick={cancelDeleteResult}
                className="text-white hover:bg-red-700 rounded-lg p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-800 mb-2">
                  Are you sure you want to delete this test result?
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Task ID:</span> {resultToDelete.task_id}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Patient:</span> {resultToDelete.patient?.name || 'Unknown Patient'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Test Type:</span> {resultToDelete.testType || resultToDelete.taskTitle || 'Lab Test'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span> {resultToDelete.status}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 mb-1">Warning</h3>
                    <p className="text-sm text-red-700">
                      This action cannot be undone. All test data, results, and associated files will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDeleteResult}
                  disabled={deleting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteResult}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Result
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Test Result Modal */}
      {showEditModal && editingResult && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Edit Test Results</h2>
                <p className="text-blue-100 mt-1">Task ID: {editingResult.task_id}</p>
              </div>
              <button
                onClick={handleCancelEdit}
                className="text-white hover:bg-blue-700 rounded-lg p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
              <div className="p-6">
                {/* Patient and Test Info - Read Only */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Test Information (Read Only)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Patient</p>
                      <p className="font-medium text-gray-900">{editingResult.patient?.name || 'Unknown Patient'}</p>
                      <p className="text-sm text-gray-500">ID: {editingResult.patient?.patient_id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Test Type</p>
                      <p className="font-medium text-gray-900">{editingResult.testType || editingResult.taskTitle || 'Lab Test'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium text-gray-900">{editingResult.status}</p>
                    </div>
                  </div>
                </div>

                {/* Test Parameters Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Test Parameters</h3>
                    <button
                      onClick={addTestParameter}
                      className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Parameter
                    </button>
                  </div>

                  {editFormData.testResults.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No test parameters yet. Click "Add Parameter" to add one.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {editFormData.testResults.map((test, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-900">Parameter {index + 1}</h4>
                            <button
                              onClick={() => removeTestParameter(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Parameter Name *</label>
                              <input
                                type="text"
                                value={test.parameter}
                                onChange={(e) => updateTestParameter(index, 'parameter', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="e.g., Hemoglobin"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Value *</label>
                              <input
                                type="text"
                                value={test.value}
                                onChange={(e) => updateTestParameter(index, 'value', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="e.g., 12.5"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                              <input
                                type="text"
                                value={test.unit}
                                onChange={(e) => updateTestParameter(index, 'unit', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="e.g., g/dL"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Reference Range</label>
                              <input
                                type="text"
                                value={test.referenceRange}
                                onChange={(e) => updateTestParameter(index, 'referenceRange', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="e.g., 12.0-16.0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Abnormal Flag</label>
                              <select
                                value={test.abnormalFlag}
                                onChange={(e) => updateTestParameter(index, 'abnormalFlag', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              >
                                <option value="">Normal</option>
                                <option value="High">High</option>
                                <option value="Low">Low</option>
                                <option value="Critical High">Critical High</option>
                                <option value="Critical Low">Critical Low</option>
                                <option value="Abnormal">Abnormal</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                              <input
                                type="text"
                                value={test.description}
                                onChange={(e) => updateTestParameter(index, 'description', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="Optional description"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clinical Interpretation Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Clinical Interpretation</h3>
                  <textarea
                    value={editFormData.overallInterpretation}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, overallInterpretation: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter overall clinical interpretation of the test results..."
                  />
                </div>

                {/* Recommendations Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Recommendations</h3>
                  <textarea
                    value={editFormData.recommendations}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter clinical recommendations based on test results..."
                  />
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reviewed By</label>
                    <input
                      type="text"
                      value={editFormData.reviewedBy}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, reviewedBy: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Name of reviewing physician/technician"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor Approval</label>
                    <input
                      type="text"
                      value={editFormData.supervisorApproval}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, supervisorApproval: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Supervisor name or approval status"
                    />
                  </div>
                </div>

                {/* Critical Values Checkbox */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editFormData.criticalValues}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, criticalValues: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">This test contains critical values requiring immediate attention</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Editing results for Task ID: {editingResult.task_id}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditedResult}
                  disabled={saving || !editFormData.testResults.some(test => test.parameter && test.value)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultPage;