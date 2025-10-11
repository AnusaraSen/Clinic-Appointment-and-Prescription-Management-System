import React from 'react';
import { Wrench, CheckCircle, Clock, Users } from 'lucide-react';

/**
 * MetricsCards Component
 * Displays 4 key performance indicators at the top of the reports page
 */
const MetricsCards = ({ metrics, loading }) => {
  const cards = [
    {
      title: 'Total Requests',
      value: metrics?.totalRequests || 0,
      icon: <Wrench className="h-5 w-5 text-blue-600" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      trend: metrics?.requestsTrend || null
    },
    {
      title: 'Completion Rate',
      value: `${metrics?.completionRate || 0}%`,
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      trend: metrics?.completionTrend || null
    },
    {
      title: 'Avg. Completion Time',
      value: `${metrics?.avgCompletionTime || 0} hrs`,
      icon: <Clock className="h-5 w-5 text-orange-600" />,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      trend: metrics?.timeTrend || null
    },
    {
      title: 'Active Technicians',
      value: metrics?.activeTechnicians || 0,
      icon: <Users className="h-5 w-5 text-indigo-600" />,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      trend: metrics?.techniciansTrend || null
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-600">
              {card.title}
            </span>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-gray-800">
              {card.value}
            </span>
          </div>
          {card.trend && (
            <div className="mt-2 flex items-center">
              <span className={`text-xs ${card.trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {card.trend.isPositive ? '↑' : '↓'} {card.trend.value}
              </span>
              <span className="text-xs text-gray-500 ml-1">from last period</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;
