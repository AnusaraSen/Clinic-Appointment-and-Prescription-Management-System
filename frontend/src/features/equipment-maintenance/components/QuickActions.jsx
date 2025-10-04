import React from 'react';
import { 
  Wrench, 
  Calendar, 
  Clock, 
  CheckCircle,
  Plus,
  Settings,
  RefreshCw,
  FileText
} from 'lucide-react';

/**
 * Quick Actions Panel - Provides quick access to common technician actions
 * Styled to match the admin dashboard quick action cards
 */
export const QuickActions = ({ onNavigate, taskCounts }) => {
  const actions = [
    {
      id: 'view-tasks',
      title: 'My Tasks',
      description: 'View all assigned tasks',
      icon: Wrench,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      count: taskCounts?.totalTasks || 0,
      action: () => onNavigate && onNavigate('tasks')
    },
    {
      id: 'urgent-tasks',
      title: 'Urgent Tasks',
      description: 'High priority items',
      icon: Clock,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      count: taskCounts?.priorityTasks || 0,
      action: () => onNavigate && onNavigate('urgent-tasks')
    },
    {
      id: 'schedule',
      title: 'My Schedule',
      description: 'View upcoming schedule',
      icon: Calendar,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      count: taskCounts?.todaysTasks || 0,
      action: () => onNavigate && onNavigate('schedule')
    },
    {
      id: 'completed',
      title: 'Completed',
      description: 'Recent completions',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      count: taskCounts?.completedTasks || 0,
      action: () => onNavigate && onNavigate('completed')
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        
        return (
          <button
            key={action.id}
            onClick={action.action}
            className={`${action.bgColor} ${action.borderColor} border rounded-xl p-6 text-left hover:shadow-md transition-all duration-200 hover:scale-105 group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-white rounded-lg shadow-sm`}>
                <Icon className={`h-6 w-6 ${action.iconColor}`} />
              </div>
              
              {action.count > 0 && (
                <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${
                  action.iconColor.includes('red') ? 'bg-red-100 text-red-800' :
                  action.iconColor.includes('blue') ? 'bg-blue-100 text-blue-800' :
                  action.iconColor.includes('purple') ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {action.count}
                </span>
              )}
            </div>
            
            <div>
              <h3 className={`text-lg font-semibold mb-1 ${action.iconColor.replace('text-', 'text-')}`}>
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-700">
                {action.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;