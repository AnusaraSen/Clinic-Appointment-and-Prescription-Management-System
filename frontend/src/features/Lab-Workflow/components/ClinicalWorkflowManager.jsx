import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertTriangle,
  TestTube,
  Settings,
  FileText,
  User
} from 'lucide-react';
import SampleCollectionForm from './SampleCollectionForm';
import TestProcessingForm from './TestProcessingForm';
import TestResultsForm from './TestResultsForm';

const ClinicalWorkflowManager = ({ taskId, onClose, isModal = false }) => {
  const [currentStep, setCurrentStep] = useState(null);
  const [workflowData, setWorkflowData] = useState({
    hasSampleCollection: false,
    hasProcessing: false,
    hasResults: false,
    status: 'Pending'
  });
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  const steps = [
    {
      id: 'collection',
      title: 'Sample Collection',
      description: 'Record sample collection details',
      icon: TestTube,
      color: 'blue',
      component: SampleCollectionForm
    },
    {
      id: 'processing',
      title: 'Test Processing',
      description: 'Process the sample and run tests',
      icon: Settings,
      color: 'green',
      component: TestProcessingForm
    },
    {
      id: 'results',
      title: 'Results Entry',
      description: 'Enter and review test results',
      icon: FileText,
      color: 'yellow',
      component: TestResultsForm
    }
  ];

  useEffect(() => {
    if (taskId) {
      fetchWorkflowStatus();
    }
  }, [taskId]);

  const fetchWorkflowStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/labtasks/${taskId}/processing`);
      if (response.ok) {
        const result = await response.json();
        console.log('Workflow status response:', result); // Debug log
        if (result.success) {
          setWorkflowData({
            hasSampleCollection: result.data.hasSampleCollection,
            hasProcessing: result.data.hasProcessing,
            hasResults: result.data.hasResults,
            status: result.data.status,
            sampleCollection: result.data.sampleCollection,
            processing: result.data.processing,
            results: result.data.results,
            lastUpdated: result.data.lastUpdated
          });
        }
      } else {
        console.error('Failed to fetch workflow status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching workflow status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (stepId) => {
    setCurrentStep(stepId);
    setSuccessMessage('');
  };

  const handleStepComplete = (message) => {
    setSuccessMessage(message);
    setCurrentStep(null);
    fetchWorkflowStatus(); // Refresh the workflow status
  };

  const handleStepClose = () => {
    setCurrentStep(null);
    setSuccessMessage('');
  };

  const getStepStatus = (stepId) => {
    const status = (() => {
      switch (stepId) {
        case 'collection':
          return workflowData.hasSampleCollection ? 'completed' : 'available';
        case 'processing':
          return workflowData.hasProcessing ? 'completed' : 
                 workflowData.hasSampleCollection ? 'available' : 'locked';
        case 'results':
          return workflowData.hasResults ? 'completed' : 
                 workflowData.hasProcessing ? 'available' : 'locked';
        default:
          return 'available';
      }
    })();
    console.log(`Step ${stepId} status: ${status}`, {
      hasSampleCollection: workflowData.hasSampleCollection,
      hasProcessing: workflowData.hasProcessing,
      hasResults: workflowData.hasResults
    });
    return status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'available':
        return <Circle className="h-5 w-5 text-blue-600" />;
      case 'locked':
        return <Circle className="h-5 w-5 text-gray-400" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'available':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer';
      case 'locked':
        return 'bg-gray-50 border-gray-200 opacity-60';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Render the current step's form
  if (currentStep) {
    const step = steps.find(s => s.id === currentStep);
    const StepComponent = step.component;
    
    return (
      <StepComponent
        taskId={taskId}
        onClose={handleStepClose}
        onSuccess={handleStepComplete}
        isModal={isModal}
      />
    );
  }

  return (
    <div 
      className={`${isModal ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' : ''}`}
      onClick={isModal ? (e) => e.target === e.currentTarget && onClose : undefined}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl ${isModal ? 'max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto' : 'w-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Clinical Test Workflow</h2>
            <p className="text-gray-600 mt-1">Task ID: {taskId}</p>
            <div className="flex items-center mt-2">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                workflowData.status === 'Completed' ? 'bg-green-100 text-green-800' :
                workflowData.status === 'Results Ready' ? 'bg-blue-100 text-blue-800' :
                workflowData.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                workflowData.status === 'Sample Collected' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {workflowData.status}
              </div>
              {workflowData.lastUpdated && (
                <span className="ml-3 text-xs text-gray-500">
                  Last updated: {new Date(workflowData.lastUpdated).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Workflow Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Workflow Steps</h3>
            
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const IconComponent = step.icon;
              
              return (
                <div key={step.id}>
                  <div
                    className={`p-4 border rounded-lg transition-colors ${getStatusColor(status)}`}
                    onClick={() => status === 'available' ? handleStepClick(step.id) : null}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-4 ${
                        status === 'completed' ? 'bg-green-100' :
                        status === 'available' ? `bg-${step.color}-100` :
                        'bg-gray-100'
                      }`}>
                        <IconComponent className={`h-5 w-5 ${
                          status === 'completed' ? 'text-green-600' :
                          status === 'available' ? `text-${step.color}-600` :
                          'text-gray-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{step.title}</h4>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                          
                          <div className="flex items-center">
                            {getStatusIcon(status)}
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              {status === 'completed' ? 'Completed' :
                               status === 'available' ? 'Click to start' :
                               'Waiting for previous step'}
                            </span>
                          </div>
                        </div>

                        {/* Show completion details for completed steps */}
                        {status === 'completed' && (
                          <div className="mt-2 text-xs text-gray-500">
                            {step.id === 'collection' && workflowData.sampleCollection?.collectedBy && (
                              <span>Collected by: {workflowData.sampleCollection.collectedBy}</span>
                            )}
                            {step.id === 'processing' && workflowData.processing?.processedBy && (
                              <span>Processed by: {workflowData.processing.processedBy}</span>
                            )}
                            {step.id === 'results' && workflowData.results?.reviewedBy && (
                              <span>Reviewed by: {workflowData.results.reviewedBy}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center">
                      <div className="w-0.5 h-4 bg-gray-300"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Workflow Summary */}
          {workflowData.hasResults && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">
                  Clinical test workflow completed successfully!
                </span>
              </div>
              {workflowData.results?.criticalValues && (
                <div className="mt-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-sm text-red-700">
                    Critical values detected - physician notification may be required
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalWorkflowManager;