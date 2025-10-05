import React, { useState, useEffect } from 'react';
import { 
  Beaker, 
  Clock, 
  User, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Calendar,
  Stethoscope,
  TestTube
} from 'lucide-react';

const ClinicalLabTaskCard = ({ task, onUpdateTask }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'STAT': return 'bg-red-100 text-red-800 border-red-200';
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'Urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Routine': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Sample Collected': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-purple-100 text-purple-800';
      case 'Results Ready': return 'bg-orange-100 text-orange-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = (newStatus) => {
    onUpdateTask(task._id, { status: newStatus });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{task.task_id}</h3>
          <p className="text-sm text-gray-600">{task.testInformation?.testType || task.taskTitle}</p>
        </div>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>
      </div>

      {/* Patient Information */}
      <div className="flex items-center space-x-3 mb-3">
        <User className="h-4 w-4 text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-900">
            {task.patient?.name || 'Patient Information'}
          </p>
          <p className="text-xs text-gray-500">
            ID: {task.patient?.patient_id} | Ordered by: {task.ordering_physician || 'Dr. Unknown'}
          </p>
        </div>
      </div>

      {/* Test Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center space-x-2">
          <TestTube className="h-4 w-4 text-blue-500" />
          <span className="text-gray-600">
            {task.testInformation?.specimenType || 'Specimen'}: 
            <span className="font-medium ml-1">
              {task.testInformation?.specimenType || 'Blood'}
            </span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-green-500" />
          <span className="text-gray-600">
            Due: 
            <span className="font-medium ml-1">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
            </span>
          </span>
        </div>
      </div>

      {/* Clinical Information */}
      {task.testInformation?.clinicalIndication && (
        <div className="mb-4">
          <div className="flex items-start space-x-2">
            <Stethoscope className="h-4 w-4 text-indigo-500 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Clinical Indication:</p>
              <p className="text-sm text-gray-700">{task.testInformation.clinicalIndication}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2 mt-4">
        {task.status === 'Pending' && (
          <button
            onClick={() => handleStatusUpdate('Sample Collected')}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            Collect Sample
          </button>
        )}
        {task.status === 'Sample Collected' && (
          <button
            onClick={() => handleStatusUpdate('In Progress')}
            className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
          >
            Start Analysis
          </button>
        )}
        {task.status === 'In Progress' && (
          <button
            onClick={() => handleStatusUpdate('Results Ready')}
            className="flex-1 px-3 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors"
          >
            Enter Results
          </button>
        )}
        {task.status === 'Results Ready' && (
          <button
            onClick={() => handleStatusUpdate('Completed')}
            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
          >
            Complete & Send
          </button>
        )}
        
        <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
          <FileText className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{getProgressPercentage(task.status)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage(task.status)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const getProgressPercentage = (status) => {
  switch (status) {
    case 'Pending': return 0;
    case 'Sample Collected': return 25;
    case 'In Progress': return 50;
    case 'Results Ready': return 75;
    case 'Completed': return 100;
    default: return 0;
  }
};

export default ClinicalLabTaskCard;