import React from 'react';
import { Users, UserCheck, UserPlus, Shield, TrendingUp } from 'lucide-react';

/**
 * UserMetricsCards Component
 * Displays key performance indicators for user management
 */
const UserMetricsCards = ({ metrics, loading }) => {
  const cards = [
    {
      title: 'Total Users',
      value: metrics?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: metrics?.activeUsers || 0,
      subtitle: 'Last 30 days',
      icon: UserCheck,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'New Users',
      value: metrics?.newUsersThisMonth || 0,
      subtitle: 'This month',
      icon: UserPlus,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Activity Rate',
      value: `${metrics?.activityRate || 0}%`,
      subtitle: 'Login activity',
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Locked Accounts',
      value: metrics?.lockedAccounts || 0,
      subtitle: 'Security alerts',
      icon: Shield,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${card.textColor}`} />
              </div>
            </div>
            
            <h3 className="text-gray-500 text-sm font-medium mb-1">
              {card.title}
            </h3>
            
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">
                {card.value}
              </p>
            </div>
            
            {card.subtitle && (
              <p className="text-xs text-gray-500 mt-1">
                {card.subtitle}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UserMetricsCards;
