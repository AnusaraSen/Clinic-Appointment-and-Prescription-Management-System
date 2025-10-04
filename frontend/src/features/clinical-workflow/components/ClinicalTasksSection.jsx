import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  User, 
  CheckCircle,
  Calendar
} from 'lucide-react';



export const ClinicalTasksSection = ({ tasks = [], isLoading, onCompleteTask }) => {
  const formatRelativeTime = (date) => {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInHours = Math.floor((targetDate - now) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Due now';
    } else if (diffInHours < 24) {
      return `Due in ${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Due in ${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 border-red-200 text-red-800';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const handleCompleteTask = (taskId) => {
    if (typeof onCompleteTask === 'function') {
      onCompleteTask(taskId);
    }
  };

  // Mock data fallback if no tasks provided
  const displayTasks = tasks.length > 0 ? tasks : [
    {
      _id: '1',
      title: 'Review lab results for Sarah Johnson',
      patient_name: 'Sarah Johnson',
      priority: 'urgent',
      due_date: new Date().toISOString(),
      type: 'lab_review',
      description: 'Blood work results ready for review'
    },
    {
      _id: '2',
      title: 'Follow-up call with Michael Chen',
      patient_name: 'Michael Chen',
      priority: 'high',
      due_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      type: 'follow_up',
      description: 'Post-surgery recovery check'
    },
    {
      _id: '3',
      title: 'Prescription refill approval',
      patient_name: 'Emily Davis',
      priority: 'medium',
      due_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      type: 'prescription',
      description: 'Hypertension medication refill request'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-50">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Urgent Tasks</h2>
            <p className="text-sm text-gray-600">
              {displayTasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length} high priority items
            </p>
          </div>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
          View All Tasks
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {displayTasks.map((task) => (
            <div
              key={task._id}
              className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getPriorityColor(task.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {/* Priority Indicator */}
                  <div className="text-lg">
                    {getPriorityIcon(task.priority)}
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {task.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <User className="h-3 w-3" />
                        <span className="font-medium">{task.patient_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeTime(task.due_date)}</span>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {task.description}
                      </p>
                    )}

                    {/* Task Type Badge */}
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs font-medium bg-white bg-opacity-50 rounded-md">
                        {task.type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority?.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complete Button */}
                <button
                  onClick={() => handleCompleteTask(task._id)}
                  className="ml-4 flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                  title="Mark as complete"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {displayTasks.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No urgent tasks</p>
              <p className="text-gray-400 text-sm">All caught up for now!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};