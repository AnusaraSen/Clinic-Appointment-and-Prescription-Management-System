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
  ChevronRight
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

  useEffect(() => {
    fetchLabResults();
  }, []);

  const fetchLabResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all lab tasks with completed results
      const response = await fetch('http://localhost:5000/api/labtasks');
      const data = await response.json();
      
      if (data.tasks) {
        // Filter tasks that have completed clinical processing with results
        const completedResults = [];
        
        for (const task of data.tasks) {
          try {
            // Check if task has clinical processing results
            const processingResponse = await fetch(`http://localhost:5000/api/labtasks/${task._id}/processing`);
            const processingData = await processingResponse.json();
            
            if (processingData.success && processingData.data.hasResults && 
                processingData.data.results?.testResults?.length > 0) {
              completedResults.push({
                ...task,
                clinicalResults: processingData.data
              });
            }
          } catch (err) {
            console.warn(`Failed to fetch processing data for task ${task._id}:`, err);
          }
        }
        
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
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
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
              Refresh
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
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
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
                  {results.filter(r => r.status === 'Completed').length}
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
                    const resultDate = new Date(r.clinicalResults?.lastUpdated).toDateString();
                    return today === resultDate;
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
              {results.length === 0 && (
                <button
                  onClick={() => navigate('/lab-workflow/tasks')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Lab Tasks
                </button>
              )}
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
                            {formatDate(result.clinicalResults?.lastUpdated)}
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
                        onClick={() => {
                          // Implement print functionality
                          window.print();
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Print
                      </button>
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
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Age:</span> {selectedResult.patient?.age || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Gender:</span> {selectedResult.patient?.gender || 'N/A'}
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
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Sample Type:</span> {selectedResult.sampleType || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Timestamps</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Requested:</span> {formatDate(selectedResult.created_at)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Completed:</span> {formatDate(selectedResult.clinicalResults?.lastUpdated)}
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
                        <span className="font-medium">Equipment:</span> {selectedResult.equipmentAssigned || 'N/A'}
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
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Supervisor:</span> {selectedResult.clinicalResults?.results?.supervisorApproval || 'Pending'}
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
                  onClick={() => window.print()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Results
                </button>
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
    </div>
  );
};

export default TestResultPage;