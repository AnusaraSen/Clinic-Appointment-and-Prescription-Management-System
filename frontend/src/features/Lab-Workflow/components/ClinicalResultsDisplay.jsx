import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Printer,
  RefreshCw
} from 'lucide-react';

const ClinicalResultsDisplay = ({ taskId, taskData }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (taskId) {
      fetchClinicalResults();
    }
  }, [taskId]);

  const fetchClinicalResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/labtasks/${taskId}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('Clinical results response:', data); // Debug log
        // Handle both formats: direct task response or wrapped response
        const taskData = data.success ? data.task : data;
        setResults(taskData);
      } else {
        setError('Failed to fetch results');
      }
    } catch (err) {
      console.error('Error fetching clinical results:', err);
      setError('Error loading results');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (flag) => {
    switch (flag) {
      case 'H':
      case 'Critical High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'L':
      case 'Critical Low':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Abnormal':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusIcon = (flag) => {
    switch (flag) {
      case 'H':
        return <TrendingUp className="h-4 w-4" />;
      case 'L':
        return <TrendingDown className="h-4 w-4" />;
      case 'Critical High':
      case 'Critical Low':
      case 'Abnormal':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const generatePrintableReport = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleString();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lab Test Results - ${taskData?.task_id || 'Unknown'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .patient-info { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
          .results-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .results-table th, .results-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .results-table th { background-color: #f2f2f2; font-weight: bold; }
          .abnormal { background-color: #fee; color: #c33; font-weight: bold; }
          .critical { background-color: #fcc; color: #a00; font-weight: bold; }
          .normal { color: #060; }
          .interpretation { background: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #007cba; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Clinical Laboratory Test Results</h1>
          <h2>${taskData?.testInformation?.testType || taskData?.taskTitle || 'Laboratory Test'}</h2>
          <p>Task ID: ${taskData?.task_id || 'Unknown'}</p>
        </div>
        
        <div class="patient-info">
          <h3>Patient Information</h3>
          <p><strong>Name:</strong> ${taskData?.patient?.name || 'N/A'}</p>
          <p><strong>Patient ID:</strong> ${taskData?.patient?.patient_id || 'N/A'}</p>
          <p><strong>Test Requested:</strong> ${taskData?.testInformation?.testType || taskData?.taskTitle || 'N/A'}</p>
          <p><strong>Collection Date:</strong> ${results?.sampleCollection?.collectionDateTime ? formatDate(results.sampleCollection.collectionDateTime) : 'N/A'}</p>
          <p><strong>Processed Date:</strong> ${results?.processing?.receivedDateTime ? formatDate(results.processing.receivedDateTime) : 'N/A'}</p>
        </div>
        
        ${results?.results?.testResults?.length > 0 ? `
          <div class="results-section">
            <h3>Test Results</h3>
            <table class="results-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Result</th>
                  <th>Reference Range</th>
                  <th>Unit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${results.results.testResults.map(test => `
                  <tr>
                    <td>${test.parameter}</td>
                    <td class="${test.abnormalFlag && test.abnormalFlag !== '' ? (test.abnormalFlag.includes('Critical') ? 'critical' : 'abnormal') : 'normal'}">${test.value}</td>
                    <td>${test.referenceRange || 'N/A'}</td>
                    <td>${test.unit || ''}</td>
                    <td class="${test.abnormalFlag && test.abnormalFlag !== '' ? (test.abnormalFlag.includes('Critical') ? 'critical' : 'abnormal') : 'normal'}">${test.abnormalFlag || 'Normal'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : '<p>No test results available.</p>'}
        
        ${results?.results?.overallInterpretation ? `
          <div class="interpretation">
            <h3>Clinical Interpretation</h3>
            <p>${results.results.overallInterpretation}</p>
          </div>
        ` : ''}
        
        ${results?.results?.recommendations ? `
          <div class="interpretation">
            <h3>Recommendations</h3>
            <p>${results.results.recommendations}</p>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Report generated on ${currentDate}</p>
          <p>Reviewed by: ${results?.results?.reviewedBy || 'Pending Review'}</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const generatePDFReport = () => {
    const currentDate = new Date().toLocaleString();
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString();
    };
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lab Test Results - ${taskData?.task_id || 'Unknown'}</title>
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
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
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
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Clinical Laboratory Test Results</h1>
          <h2>${taskData?.testInformation?.testType || taskData?.taskTitle || 'Laboratory Test'}</h2>
          <p><strong>Task ID:</strong> ${taskData?.task_id || 'Unknown'}</p>
        </div>
        
        <div class="patient-info">
          <h3>Patient Information</h3>
          <p><strong>Name:</strong> ${taskData?.patient?.name || 'N/A'}</p>
          <p><strong>Patient ID:</strong> ${taskData?.patient?.patient_id || 'N/A'}</p>
          <p><strong>Test Requested:</strong> ${taskData?.testInformation?.testType || taskData?.taskTitle || 'N/A'}</p>
          <p><strong>Collection Date:</strong> ${results?.sampleCollection?.collectionDateTime ? formatDate(results.sampleCollection.collectionDateTime) : 'N/A'}</p>
          <p><strong>Processed Date:</strong> ${results?.processing?.receivedDateTime ? formatDate(results.processing.receivedDateTime) : 'N/A'}</p>
        </div>
        
        ${results?.results?.testResults?.length > 0 ? `
          <div class="results-section">
            <h3 style="color: #007cba; margin-bottom: 15px;">Test Results</h3>
            <table class="results-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Result</th>
                  <th>Reference Range</th>
                  <th>Unit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${results.results.testResults.map(test => `
                  <tr>
                    <td><strong>${test.parameter}</strong></td>
                    <td class="${test.abnormalFlag && test.abnormalFlag !== '' ? (test.abnormalFlag.includes('Critical') ? 'critical' : 'abnormal') : 'normal'}">${test.value}</td>
                    <td>${test.referenceRange || 'N/A'}</td>
                    <td>${test.unit || '-'}</td>
                    <td class="${test.abnormalFlag && test.abnormalFlag !== '' ? (test.abnormalFlag.includes('Critical') ? 'critical' : 'abnormal') : 'normal'}">${test.abnormalFlag || 'Normal'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : '<p>No test results available.</p>'}
        
        <div class="info-grid">
          <div class="info-section">
            <h4>Sample & Processing Information</h4>
            <p><strong>Collected By:</strong> ${results?.sampleCollection?.collectedBy || 'N/A'}</p>
            <p><strong>Collection Site:</strong> ${results?.sampleCollection?.collectionSite || 'N/A'}</p>
            <p><strong>Processed By:</strong> ${results?.processing?.processedBy || 'N/A'}</p>
            <p><strong>Instrument Used:</strong> ${results?.processing?.instrumentUsed || 'N/A'}</p>
            <p><strong>Chemical Used:</strong> ${results?.processing?.chemicalUsed || 'N/A'}</p>
          </div>
          <div class="info-section">
            <h4>Review Information</h4>
            <p><strong>Reviewed By:</strong> ${results?.results?.reviewedBy || 'Pending Review'}</p>
            <p><strong>Critical Values:</strong> ${results?.results?.criticalValues ? 'Yes' : 'No'}</p>
            <p><strong>Physician Notified:</strong> ${results?.results?.physicianNotified ? 'Yes' : 'No'}</p>
            <p><strong>Status:</strong> ${results?.status || 'Pending'}</p>
          </div>
        </div>
        
        ${results?.results?.overallInterpretation ? `
          <div class="interpretation">
            <h3>Clinical Interpretation</h3>
            <p>${results.results.overallInterpretation}</p>
          </div>
        ` : ''}
        
        ${results?.results?.recommendations ? `
          <div class="interpretation">
            <h3>Recommendations</h3>
            <p>${results.results.recommendations}</p>
          </div>
        ` : ''}
        
        <div class="footer">
          <p><strong>Report Generated:</strong> ${currentDate}</p>
          <p>This is an official laboratory report. For questions, please contact the laboratory.</p>
        </div>
      </body>
      </html>
    `;

    // Create a blob with the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lab_Report_${taskData?.task_id || 'Unknown'}_${new Date().toISOString().split('T')[0]}.html`;
    link.style.display = 'none';
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    URL.revokeObjectURL(url);
    
    // Show success message
    alert('Lab report downloaded successfully! You can open the HTML file in any browser and print it as PDF.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading results...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchClinicalResults}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Check if any results are available
  const hasResults = results?.results?.testResults?.length > 0;
  const hasSampleCollection = results?.sampleCollection && 
    results?.sampleCollection?.collectedBy && 
    results?.sampleCollection?.collectionDateTime;
  const hasProcessing = results?.processing && 
    (results?.processing?.processedBy || results?.processing?.receivedDateTime);

  if (!hasResults) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Available</h3>
        <p className="text-gray-500 mb-4">
          {!hasSampleCollection && !hasProcessing 
            ? "Clinical workflow has not been started yet." 
            : !hasResults 
            ? "Test results have not been entered yet." 
            : "Results are being processed."}
        </p>
        {(hasSampleCollection || hasProcessing) && (
          <div className="bg-blue-50 p-4 rounded-lg inline-block">
            <h4 className="font-medium text-blue-900 mb-2">Workflow Progress:</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <div className="flex items-center">
                {hasSampleCollection ? <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> : <Minus className="h-4 w-4 text-gray-400 mr-2" />}
                Sample Collection {hasSampleCollection ? 'Completed' : 'Pending'}
              </div>
              <div className="flex items-center">
                {hasProcessing ? <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> : <Minus className="h-4 w-4 text-gray-400 mr-2" />}
                Test Processing {hasProcessing ? 'Completed' : 'Pending'}
              </div>
              <div className="flex items-center">
                {hasResults ? <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> : <Minus className="h-4 w-4 text-gray-400 mr-2" />}
                Results Entry {hasResults ? 'Completed' : 'Pending'}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Clinical Test Results</h3>
            <p className="text-sm text-gray-500">
              Results completed on {formatDate(
                results.results?.approvalDateTime || 
                results.lastUpdated || 
                results.updatedAt || 
                results.createdAt ||
                taskData?.updatedAt ||
                taskData?.lastUpdated
              )}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={generatePrintableReport}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
          >
            <Printer className="h-4 w-4 mr-1" />
            Print Report
          </button>
          <button
            onClick={generatePDFReport}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Test Results Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Test Parameters & Results</h4>
        </div>
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
                  Reference Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.results.testResults.map((test, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{test.parameter}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">{test.value}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{test.referenceRange || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{test.unit || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(test.abnormalFlag)}`}>
                      {getStatusIcon(test.abnormalFlag)}
                      <span className="ml-1">{test.abnormalFlag || 'Normal'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinical Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sample & Processing Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Sample & Processing Information
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Collected By:</span>
              <span className="text-gray-900">{results.sampleCollection?.collectedBy || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Collection Date:</span>
              <span className="text-gray-900">{formatDate(results.sampleCollection?.collectionDateTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Collection Site:</span>
              <span className="text-gray-900">{results.sampleCollection?.collectionSite || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tube Type:</span>
              <span className="text-gray-900">{results.sampleCollection?.tubeType || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Processed By:</span>
              <span className="text-gray-900">{results.processing?.processedBy || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Instrument Used:</span>
              <span className="text-gray-900">{results.processing?.instrumentUsed || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Chemical Used:</span>
              <span className="text-gray-900">{results.processing?.chemicalUsed || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Review Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-green-600" />
            Review Information
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Reviewed By:</span>
              <span className="text-gray-900">{results.results?.reviewedBy || 'Pending Review'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Critical Values:</span>
              <span className={results.results?.criticalValues ? 'text-red-600 font-medium' : 'text-green-600'}>
                {results.results?.criticalValues ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Physician Notified:</span>
              <span className={results.results?.physicianNotified ? 'text-green-600' : 'text-gray-500'}>
                {results.results?.physicianNotified ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span className="text-gray-900 capitalize">{results.status || 'Pending'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Interpretation */}
      {(results.results?.overallInterpretation || results.results?.recommendations) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-4">Clinical Interpretation & Recommendations</h4>
          <div className="space-y-4">
            {results.results?.overallInterpretation && (
              <div>
                <h5 className="text-sm font-medium text-blue-800 mb-2">Overall Interpretation:</h5>
                <p className="text-sm text-blue-700">{results.results.overallInterpretation}</p>
              </div>
            )}
            {results.results?.recommendations && (
              <div>
                <h5 className="text-sm font-medium text-blue-800 mb-2">Recommendations:</h5>
                <p className="text-sm text-blue-700">{results.results.recommendations}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalResultsDisplay;