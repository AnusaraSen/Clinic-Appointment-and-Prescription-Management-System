import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Wrench, Shield } from 'lucide-react';

/**
 * Equipment KPI Cards Component
 * Displays key equipment statistics and status overview
 */
export const EquipmentKPICards = () => {
  const [stats, setStats] = useState({
    totalEquipment: 0,
    operational: 0,
    underMaintenance: 0,
    outOfService: 0,
    needsRepair: 0,
    critical: 0,
    loading: true
  });

  // Fetch equipment statistics from backend
  useEffect(() => {
    fetchEquipmentStats();
  }, []);

  const fetchEquipmentStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/equipment');
      
      if (response.ok) {
        const result = await response.json();
        console.log('Equipment KPI - Got data from backend:', result);
        
        const equipment = result.success && result.data ? result.data : [];
        
        // Calculate statistics from the equipment data
        const totalEquipment = equipment.length;
        const operational = equipment.filter(eq => eq.status === 'Operational').length;
        const underMaintenance = equipment.filter(eq => eq.status === 'Under Maintenance').length;
        const outOfService = equipment.filter(eq => eq.status === 'Out of Service').length;
        const needsRepair = equipment.filter(eq => eq.status === 'Needs Repair').length;
        const critical = equipment.filter(eq => eq.isCritical === true).length;

        setStats({
          totalEquipment,
          operational,
          underMaintenance,
          outOfService,
          needsRepair,
          critical,
          loading: false
        });
      } else {
        console.error('Failed to fetch equipment stats');
        setStats(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error fetching equipment stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Calculate operational percentage
  const operationalPercentage = stats.totalEquipment > 0 
    ? Math.round((stats.operational / stats.totalEquipment) * 100)
    : 0;

  // KPI cards configuration
  const kpiCards = [
    {
      title: 'Total Equipment',
      value: stats.totalEquipment,
      icon: <Activity className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'All equipment in system'
    },
    {
      title: 'Operational',
      value: stats.operational,
      percentage: operationalPercentage,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Working equipment'
    },
    {
      title: 'Under Maintenance',
      value: stats.underMaintenance,
      icon: <Wrench className="h-6 w-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Scheduled maintenance'
    },
    {
      title: 'Needs Repair',
      value: stats.needsRepair,
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Requires attention'
    },
    {
      title: 'Out of Service',
      value: stats.outOfService,
      icon: <Clock className="h-6 w-6" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      description: 'Non-functional'
    },
    {
      title: 'Critical Equipment',
      value: stats.critical,
      icon: <Shield className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Mission critical'
    }
  ];

  if (stats.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {kpiCards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700 truncate">
              {card.title}
            </h3>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <div className={card.color}>
                {card.icon}
              </div>
            </div>
          </div>
          
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-gray-900">
              {card.value}
            </p>
            {card.percentage !== undefined && (
              <span className={`text-sm font-medium ${
                card.percentage >= 80 ? 'text-green-600' :
                card.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {card.percentage}%
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
};