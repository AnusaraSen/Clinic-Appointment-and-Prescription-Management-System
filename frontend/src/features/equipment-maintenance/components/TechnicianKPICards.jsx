import React from 'react';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  TrendingUp
} from 'lucide-react';

/**
 * Technician KPI Cards - Dashboard statistics for technicians
 * Matches the styling of EnhancedKPICards with technician-specific metrics
 */
export const TechnicianKPICards = ({ data, loading }) => {
  const kpiData = data || {};

  const cards = [
    {
      id: 'total-tasks',
      title: 'Total Tasks',
      value: kpiData.totalTasks || 0,
      subtitle: 'Assigned to you',
      icon: Wrench,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      breakdown: [
        { label: 'Today', value: kpiData.todaysTasks || 0, color: 'text-blue-600' },
        { label: 'This Week', value: kpiData.weekTasks || 0, color: 'text-blue-500' },
        { label: 'Overdue', value: kpiData.overdueTasks || 0, color: 'text-red-600' }
      ]
    },
    {
      id: 'pending-tasks',
      title: 'Pending Tasks',
      value: kpiData.pendingTasks || 0,
      subtitle: 'Awaiting action',
      icon: Clock,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      breakdown: [
        { label: 'Scheduled', value: kpiData.scheduledTasks || 0, color: 'text-orange-600' },
        { label: 'Assigned', value: kpiData.assignedTasks || 0, color: 'text-orange-500' },
        { label: 'Priority', value: kpiData.priorityTasks || 0, color: 'text-red-600' }
      ]
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      value: kpiData.inProgressTasks || 0,
      subtitle: 'Currently working',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      breakdown: [
        { label: 'Maintenance', value: kpiData.maintenanceInProgress || 0, color: 'text-yellow-600' },
        { label: 'Repairs', value: kpiData.repairsInProgress || 0, color: 'text-yellow-500' },
        { label: 'Inspections', value: kpiData.inspectionsInProgress || 0, color: 'text-blue-500' }
      ]
    },
    {
      id: 'completed',
      title: 'Completed',
      value: kpiData.completedTasks || 0,
      subtitle: 'This month',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      breakdown: [
        { label: 'This Week', value: kpiData.completedThisWeek || 0, color: 'text-green-600' },
        { label: 'Today', value: kpiData.completedToday || 0, color: 'text-green-500' },
        { label: 'Avg/Day', value: Math.round((kpiData.completedTasks || 0) / 30) || 0, color: 'text-blue-500' }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const total = card.value || 0;
        
        return (
          <div
            key={card.id}
            className={`bg-white rounded-xl shadow-sm border ${card.borderColor} p-6 hover:shadow-md transition-shadow duration-200`}
          >
            {/* Header with Icon and Value */}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 font-medium">+5%</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {total.toLocaleString()}
              </h3>
              <p className="text-sm font-medium text-gray-900 mb-1">{card.title}</p>
              <p className="text-xs text-gray-500">{card.subtitle}</p>
            </div>

            {/* Breakdown Statistics */}
            <div className="space-y-2 border-t border-gray-100 pt-4">
              {card.breakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{item.label}</span>
                  <span className={`text-xs font-medium ${item.color}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Completion Rate</span>
                <span>
                  {total > 0 ? Math.round(((kpiData.completedTasks || 0) / total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${card.iconColor.replace('text-', 'bg-')}`}
                  style={{
                    width: `${total > 0 ? Math.min(((kpiData.completedTasks || 0) / total) * 100, 100) : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TechnicianKPICards;