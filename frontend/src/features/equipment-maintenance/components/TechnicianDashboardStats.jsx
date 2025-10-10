import React, { useState, useEffect } from 'react';
import { Wrench, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

/**
 * TechnicianDashboardStats - Display quick KPI stats for technician
 * Uses the new /api/technicians/dashboard-stats endpoint
 */
export const TechnicianDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      
      // If no token, don't make the request
      if (!token) {
        console.warn('⚠️ No access token found in localStorage for dashboard stats');
        setError('Please login to view stats');
        setLoading(false);
        return;
      }

      console.log('🔑 Fetching dashboard stats with token:', token.substring(0, 20) + '...');

      const response = await fetch('/api/technicians/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('❌ Dashboard stats fetch failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch stats');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-red-800">Failed to load dashboard stats: {error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const cards = [
    {
      title: 'Total Assigned',
      value: stats.totalAssigned,
      icon: Wrench,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      description: 'All work orders'
    },
    {
      title: 'Open Tasks',
      value: stats.open,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      description: 'Awaiting action'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      description: 'Currently working'
    },
    {
      title: 'Completed Today',
      value: stats.completedToday,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      description: `${stats.completedTotal} total completed`
    }
  ];

  const avgHours = stats.avgCompletionTimeHours 
    ? stats.avgCompletionTimeHours.toFixed(1)
    : '0.0';

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* Additional stats row */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Average Completion Time</h3>
            <p className="text-3xl font-bold text-gray-900">
              {avgHours} <span className="text-lg text-gray-600">hours</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Based on completed work orders</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>
    </>
  );
};

export default TechnicianDashboardStats;
