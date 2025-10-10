import React, { useState } from 'react';
import { Clock, CheckCircle, AlertTriangle, Calendar, MapPin, Wrench, Filter, Search, Eye, Edit } from 'lucide-react';
import { TaskStatusModal } from './TaskStatusModal';
import { WorkRequestDetailsModal } from './WorkRequestDetailsModal';

export const AssignedTasksList = ({ tasks = [], isLoading = false, onRefresh, onTaskAction }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Open': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock, label: 'Open' },
      'In Progress': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle, label: 'In Progress' },
      'Completed': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Completed' },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle, label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig['Open'];
    const IconComponent = config.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'Low': { bg: 'bg-gray-100', text: 'text-gray-800' },
      'Medium': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'High': { bg: 'bg-orange-100', text: 'text-orange-800' },
      'Critical': { bg: 'bg-red-100', text: 'text-red-800' }
    };
    const config = priorityConfig[priority] || priorityConfig['Medium'];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {priority}
      </span>
    );
  };

  const handleTaskAction = (task, action) => {
    if (action === 'view') {
      // Open details modal for viewing full information
      setSelectedTask(task);
      setShowDetailsModal(true);
    } else if (action === 'updateStatus') {
      // Open status update modal
      setSelectedTask(task);
      setShowStatusModal(true);
    } else if (onTaskAction) {
      onTaskAction(task, action);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesSearch = !searchTerm || 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.equipment?.some(eq => eq.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesPriority && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Wrench className="w-5 h-5 mr-2 text-blue-600" />
              Assigned Maintenance Tasks
            </h2>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Clock className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full appearance-none"
            >
              <option key="status-all" value="all">All Status</option>
              <option key="status-open" value="Open">Open</option>
              <option key="status-progress" value="In Progress">In Progress</option>
              <option key="status-completed" value="Completed">Completed</option>
              <option key="status-cancelled" value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full appearance-none"
            >
              <option key="priority-all" value="all">All Priority</option>
              <option key="priority-low" value="Low">Low</option>
              <option key="priority-medium" value="Medium">Medium</option>
              <option key="priority-high" value="High">High</option>
              <option key="priority-critical" value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">
              {tasks.length === 0 
                ? "No maintenance tasks assigned yet."
                : "No tasks match your current filters. Try adjusting your search criteria."
              }
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task._id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {task.title}
                      </h3>
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {task.date && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(task.date).toLocaleDateString()}
                        </div>
                      )}
                      
                      {task.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {task.location}
                        </div>
                      )}

                      {task.equipment && task.equipment.length > 0 && (
                        <div className="flex items-center">
                          <Wrench className="w-4 h-4 mr-1" />
                          {task.equipment.map(eq => eq.name).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleTaskAction(task, 'view')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleTaskAction(task, 'updateStatus')}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showStatusModal && selectedTask && (
        <TaskStatusModal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onUpdate={() => {
            setShowStatusModal(false);
            setSelectedTask(null);
            if (onRefresh) {
              onRefresh();
            }
          }}
        />
      )}

      {showDetailsModal && selectedTask && (
        <WorkRequestDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTask(null);
          }}
          workRequest={selectedTask}
          onUpdate={() => {
            setShowDetailsModal(false);
            setSelectedTask(null);
            if (onRefresh) {
              onRefresh();
            }
          }}
          canEdit={false}
        />
      )}
    </div>
  );
};
