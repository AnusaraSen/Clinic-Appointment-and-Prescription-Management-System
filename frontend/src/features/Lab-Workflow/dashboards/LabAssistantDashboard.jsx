import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Play, 
  User, 
  Calendar,
  FileText,
  Bell,
  Eye,
  Plus,
  RefreshCw,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import TaskDetailModal from '../components/TaskDetailModal';

const LabAssistantDashboard = () => {
  // State management
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [assistantInfo, setAssistantInfo] = useState({
    name: 'Kasun',
    id: 'LAB-0001', // Lab staff ID format
    specialization: 'Clinical Chemistry'
  });

  // Fetch tasks assigned to this assistant
  const fetchAssignedTasks = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await fetch(`http://localhost:5000/api/labtasks`);
      const data = await response.json();
      
      console.log('All tasks data:', data);
      console.log('Current assistant info:', assistantInfo);
      
      // Filter tasks assigned to current assistant
      // Check both labAssistant field (name) and any ID-based assignments
      const assistantTasks = data.tasks?.filter(task => {
        const isAssignedByName = task.labAssistant === assistantInfo.name;
        const isAssignedById = task.assignedTo === assistantInfo.id;
        
        console.log(`Task ${task.task_id}: labAssistant="${task.labAssistant}", assignedTo="${task.assignedTo}", matches: name=${isAssignedByName}, id=${isAssignedById}`);
        
        return isAssignedByName || isAssignedById;
      }) || [];
      
      console.log('Filtered assistant tasks:', assistantTasks);
      
      setTasks(assistantTasks);
      setFilteredTasks(assistantTasks);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
      
      // For now, don't use mock data, let the user see the actual error
      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on search and filters
  useEffect(() => {
    let filtered = tasks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.taskTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.patient?.patient_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchAssignedTasks();
    
    // Set up less frequent polling for background updates
    let interval;
    if (autoRefreshEnabled) {
      interval = setInterval(() => {
        // Only auto-refresh if no modal is open (user not actively working)
        if (!showTaskModal) {
          fetchAssignedTasks(false); // Don't show loading spinner for background updates
        }
      }, 300000); // Poll every 5 minutes instead of 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefreshEnabled, showTaskModal]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    await fetchAssignedTasks(true);
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
  };

  // Helper functions
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/labtasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setTasks(tasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus } : task
        ));
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Calculate quick stats
  const pendingTasks = tasks.filter(task => task.status === 'Pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
  const completedToday = tasks.filter(task => {
    const today = new Date().toDateString();
    const taskDate = new Date(task.updatedAt || task.createdAt).toDateString();
    return task.status === 'Completed' && taskDate === today;
  }).length;
  const urgentTasks = tasks.filter(task => task.priority === 'High' || task.priority === 'Urgent').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lab Assistant Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {assistantInfo.name} 
                <span className="ml-2 text-sm text-gray-400">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Manual Refresh Button */}
              <button 
                onClick={handleManualRefresh}
                disabled={loading}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              {/* Auto-refresh Toggle */}
              <button
                onClick={toggleAutoRefresh}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {autoRefreshEnabled ? (
                  <ToggleRight className="h-4 w-4 mr-2 text-green-600" />
                ) : (
                  <ToggleLeft className="h-4 w-4 mr-2 text-gray-400" />
                )}
                Auto-refresh {autoRefreshEnabled ? 'ON' : 'OFF'}
              </button>
              
              {/* Notification Bell */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
                {urgentTasks > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                )}
              </button>
              <div className="flex items-center space-x-2">
                <User className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{assistantInfo.name}</p>
                  <p className="text-xs text-gray-500">{assistantInfo.specialization}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Auto-refresh status indicator */}
        {autoRefreshEnabled && !showTaskModal && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">
                  Auto-refresh enabled - Dashboard updates every 5 minutes
                  {loading && <span className="ml-2 italic">Updating...</span>}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-orange-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{pendingTasks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <Play className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{inProgressTasks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">{completedToday}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Urgent Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{urgentTasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks, patients, or task IDs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Assigned Tasks ({filteredTasks.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tasks found matching your criteria</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{task.taskTitle}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{task.taskDescription}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>Patient: {task.patient?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          <span>Assigned by: {task.assignedBy || 'Supervisor'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {task.status === 'Pending' && (
                        <button
                          onClick={() => updateTaskStatus(task._id, 'In Progress')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Start Task
                        </button>
                      )}
                      {task.status === 'In Progress' && (
                        <button
                          onClick={() => updateTaskStatus(task._id, 'Completed')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => openTaskDetail(task)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onTaskUpdate={fetchAssignedTasks}
        />
      )}
    </div>
  );
};

export default LabAssistantDashboard;