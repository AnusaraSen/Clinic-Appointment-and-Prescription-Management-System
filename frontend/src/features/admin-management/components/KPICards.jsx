import React, { useState, useEffect } from 'react';
import { Wrench, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

// 📊 KPI Cards component - these show important statistics at the top of your dashboard
// Perfect for your university project - they'll display real data from your backend!
// KPI stands for "Key Performance Indicators" - fancy business term for "important numbers" 😊

export const KPICards = () => {
  // 📈 State to store our statistics data
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    urgentRequests: 0,
    loading: true
  });

  // 🔄 useEffect hook to fetch data when component loads
  // This is like automatically asking your backend for the latest numbers
  useEffect(() => {
    fetchMaintenanceStats();
  }, []);

  // 🌐 Function to get statistics from your backend API
  const fetchMaintenanceStats = async () => {
    try {
      // 📞 Call your backend to get all maintenance requests
      const response = await fetch('http://localhost:5000/api/maintenance-requests');
      
      if (response.ok) {
        const result = await response.json();
        console.log('KPI Cards - Got data from backend:', result);
        
        // Handle the backend response format: { success: true, data: [...] }
        const requests = result.success && result.data ? result.data : [];
        
        // 🧮 Calculate statistics from the data
        // This is where we crunch the numbers to show meaningful insights
        const totalRequests = requests.length;
        const pendingRequests = requests.filter(req => req.status === 'Open' || req.status === 'In Progress').length;
        const completedRequests = requests.filter(req => req.status === 'Completed').length;
        const urgentRequests = requests.filter(req => req.priority === 'High').length;

        // 💾 Update our state with the calculated stats
        setStats({
          totalRequests,
          pendingRequests,
          completedRequests,
          urgentRequests,
          loading: false
        });
      } else {
        console.error('Failed to fetch maintenance stats');
        setStats(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error fetching maintenance stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  // 📋 KPI cards configuration - each card shows a different statistic
  const kpiCards = [
    {
      title: 'Total Requests',
      value: stats.totalRequests,
      icon: <Wrench className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'All maintenance requests'
    },
    {
      title: 'Pending',
      value: stats.pendingRequests,
      icon: <Clock className="h-6 w-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Awaiting attention'
    },
    {
      title: 'Completed',
      value: stats.completedRequests,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Successfully resolved'
    },
    {
      title: 'Urgent',
      value: stats.urgentRequests,
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'High priority items'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpiCards.map((card, index) => (
        <div 
          key={index} 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200 transform hover:-translate-y-1"
        >
          {/* Card content with enhanced layout */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-xl ${card.bgColor} shadow-sm`}>
                  <span className={card.color}>
                    {card.icon}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    {card.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {card.description}
                  </p>
                </div>
              </div>
              
              {/* Main number display with enhanced typography */}
              <div className="mt-2">
                {stats.loading ? (
                  <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                ) : (
                  <div className="flex items-baseline">
                    <p className={`text-4xl font-bold ${card.color} mr-2`}>
                      {card.value}
                    </p>
                    <span className="text-gray-400 text-sm font-medium">items</span>
                  </div>
                )}
              </div>
              
              {/* Progress indicator */}
              <div className="mt-4">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${card.color.replace('text-', 'bg-')}`}
                    style={{ width: `${Math.min((card.value / (stats.totalRequests || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
