import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  AlertCircle,
  Save,
  Upload,
  Plus,
  Edit3,
  Eye,
  Download,
  MessageCircle,
  CheckCircle,
  Play
} from 'lucide-react';
import ClinicalWorkflowManager from './ClinicalWorkflowManager';
import ResultsUpload from './ResultsUpload';
import ClinicalResultsDisplay from './ClinicalResultsDisplay';

const TaskDetailModal = ({ task, onClose, onTaskUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [taskData, setTaskData] = useState(task);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [patientHistory, setPatientHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showResultsUpload, setShowResultsUpload] = useState(false);

  useEffect(() => {
    if (task) {
      setTaskData(task);
      fetchTaskNotes();
      fetchPatientHistory();
    }
  }, [task]);

  const fetchTaskNotes = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/labtasks/${task._id}/notes`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      // Mock notes for demonstration
      setNotes([
        {
          _id: 'note1',
          content: 'Sample collection completed. Sample appears normal.',
          author: 'John Doe',
          createdAt: '2025-09-21T10:30:00.000Z',
          type: 'general'
        },
        {
          _id: 'note2',
          content: 'Waiting for supervisor approval before proceeding with analysis.',
          author: 'John Doe',
          createdAt: '2025-09-21T11:00:00.000Z',
          type: 'status'
        }
      ]);
    }
  };

  const fetchPatientHistory = async () => {
    try {
      const patientId = task.patient?._id || task.patient_id;
      if (patientId) {
        const response = await fetch(`http://localhost:5000/api/patients/${patientId}/history`);
        if (response.ok) {
          const data = await response.json();
          setPatientHistory(data.history || []);
        }
      }
    } catch (error) {
      console.error('Error fetching patient history:', error);
      // Mock patient history
      setPatientHistory([
        {
          _id: 'hist1',
          testType: 'Complete Blood Count',
          date: '2025-08-15T00:00:00.000Z',
          result: 'Normal',
          technician: 'Jane Smith'
        },
        {
          _id: 'hist2',
          testType: 'Liver Function Test',
          date: '2025-07-20T00:00:00.000Z',
          result: 'Slightly elevated ALT',
          technician: 'Mike Johnson'
        }
      ]);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/labtasks/${task._id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newNote,
          author: 'John Doe', // Should come from auth context
          type: 'general'
        })
      });

      if (response.ok) {
        const newNoteObj = {
          _id: Date.now().toString(),
          content: newNote,
          author: 'John Doe',
          createdAt: new Date().toISOString(),
          type: 'general'
        };
        setNotes([...notes, newNoteObj]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const updateTaskStatus = async (newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/labtasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setTaskData({ ...taskData, status: newStatus });
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getStatusColor = (status) => {
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

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'patient', label: 'Patient Details', icon: User },
    { id: 'execution', label: 'Clinical Workflow', icon: FileText },
    { id: 'results', label: 'Results', icon: Upload },
    { id: 'notes', label: 'Notes & Comments', icon: MessageCircle }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">{taskData.taskTitle}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(taskData.priority)}`}>
              {taskData.priority}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(taskData.status)}`}>
              {taskData.status}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {taskData.status === 'Pending' && (
              <button
                onClick={() => updateTaskStatus('Sample Collected')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Collect Sample
              </button>
            )}
            {taskData.status === 'Sample Collected' && (
              <button
                onClick={() => updateTaskStatus('In Progress')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Analysis
              </button>
            )}
            {taskData.status === 'In Progress' && (
              <button
                onClick={() => updateTaskStatus('Results Ready')}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Enter Results
              </button>
            )}
            {taskData.status === 'Results Ready' && (
              <button
                onClick={() => updateTaskStatus('Completed')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete & Send
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Task Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Task ID:</span>
                      <span className="font-medium">{taskData.task_id || taskData._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-medium">{new Date(taskData.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{new Date(taskData.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assigned By:</span>
                      <span className="font-medium">{taskData.assignedBy || 'Supervisor'}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowTestForm(true)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Clinical Workflow
                    </button>
                    <button
                      onClick={() => setShowResultsUpload(true)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Results
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{taskData.taskDescription}</p>
              </div>
            </div>
          )}

          {/* Patient Details Tab */}
          {activeTab === 'patient' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                    <p className="mt-1 text-sm text-gray-900">{taskData.patient?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Patient ID</label>
                    <p className="mt-1 text-sm text-gray-900">{taskData.patient?.patient_id || 'Unknown'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Previous Lab Results</h3>
                {patientHistory.length === 0 ? (
                  <p className="text-gray-500">No previous lab results found.</p>
                ) : (
                  <div className="space-y-3">
                    {patientHistory.map((history) => (
                      <div key={history._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{history.testType}</h4>
                            <p className="text-sm text-gray-600">{history.result}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(history.date).toLocaleDateString()} - by {history.technician}
                            </p>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Test Execution Tab */}
          {activeTab === 'execution' && (
            <div>
              <ClinicalWorkflowManager taskId={taskData._id} onClose={() => {}} isModal={false} />
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div>
              <ClinicalResultsDisplay taskId={taskData._id} taskData={taskData} />
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Note</h3>
                <div className="space-y-3">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this task..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={addNote}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Previous Notes</h3>
                {notes.length === 0 ? (
                  <p className="text-gray-500">No notes available.</p>
                ) : (
                  notes.map((note) => (
                    <div key={note._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">{note.author}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{note.content}</p>
                      {note.type && (
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {note.type}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test Execution Form Modal */}
      {showTestForm && (
        <ClinicalWorkflowManager
          taskId={taskData._id}
          onClose={() => setShowTestForm(false)}
          isModal={true}
        />
      )}

      {/* Results Upload Modal */}
      {showResultsUpload && (
        <ResultsUpload
          taskId={taskData._id}
          onClose={() => setShowResultsUpload(false)}
          isModal={true}
        />
      )}
    </div>
  );
};

export default TaskDetailModal;