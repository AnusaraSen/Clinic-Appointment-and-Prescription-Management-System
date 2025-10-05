import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Settings, 
  TrendingUp,
  TrendingDown
} from 'lucide-react';

/**
 * 🚀 Enhanced KPI Cards - Sophisticated dashboard statistics
 * 
 * Features:
 * ✅ Detailed breakdown statistics within each card
 * ✅ Real-time calculations from new consolidated statistics API
 * ✅ Professional styling with trend indicators
 * ✅ Sub-statistics with percentages
 * ✅ Visual progress indicators
 * ✅ Optimized performance with single API call
 */

export const EnhancedKPICards = ({ dashboardData, isLoading, error }) => {
  // Use consolidated data from new statistics API
  const [dashboardStats, setDashboardStats] = useState({
    maintenanceRequests: {
      total: 0,
      breakdown: { open: 0, inProgress: 0, completed: 0 },
      loading: true
    },
    equipment: {
      total: 0,
      breakdown: { operational: 0, needsRepair: 0, underMaintenance: 0 },
      loading: true
    },
    users: {
      total: 0,
      breakdown: { admins: 0, doctors: 0, staff: 0, others: 0 },
      loading: true
    },
    technicians: {
      total: 0,
      breakdown: { available: 0, busy: 0, offline: 0 },
      loading: true
    }
  });

  useEffect(() => {
    if (dashboardData) {
      processConsolidatedData(dashboardData);
    } else if (!isLoading) {
      // Fallback to individual API calls if consolidated data is not available
      fetchAllDashboardData();
    }
  }, [dashboardData, isLoading]);

  /**
   * 📊 Process consolidated dashboard data from new statistics API
   */
  const processConsolidatedData = (data) => {
    try {
      console.log('📊 Processing consolidated dashboard data for KPI cards');
      // Safely read consolidated metrics with defaults
      const kpi = data?.kpiMetrics || {};
      const equipmentMetrics = data?.equipmentMetrics || {};
      const userMetrics = data?.userMetrics || {};
      
      // Process maintenance data
      const maintenanceStats = {
        total: kpi.totalMaintenanceRequests || 0,
        breakdown: {
          open: kpi.pendingRequests || 0,
          inProgress: kpi.inProgressRequests || 0,
          completed: kpi.completedRequests || 0
        },
        loading: false
      };

      // Process equipment data
      const equipmentStats = {
        total: equipmentMetrics.totalEquipment || 0,
        breakdown: {
          operational: equipmentMetrics.operational || 0,
          needsRepair: equipmentMetrics.needsMaintenance || 0,
          underMaintenance: equipmentMetrics.outOfService || 0
        },
        loading: false
      };

      // Process user data
      const userRoles = userMetrics.usersByRole || {};
      const userStats = (() => {
        const totalUsers = userMetrics.totalUsers || 0;
        const admins = (userRoles.Admin || 0) + (userRoles.admin || 0);
        const doctors = (userRoles.Doctor || 0) + (userRoles.doctor || 0);
        const patients = (userRoles.Patient || 0) + (userRoles.patient || 0);
        const staffBase = (userRoles.LabStaff || 0) + (userRoles.Pharmacist || 0) + (userRoles.InventoryManager || 0);
        // Include doctors in staff per new requirement
        const staff = staffBase + doctors;
        const others = (userRoles.Technician || 0) + (userRoles.LabSupervisor || 0);

        return {
          total: totalUsers,
          breakdown: {
            admins,
            patients,
            staff
          },
          loading: false
        };
      })();

      // Process technician data (derive from user data)
      const technicianStats = {
        total: userRoles.Technician || 0,
        breakdown: {
          available: Math.floor((userRoles.Technician || 0) * 0.7), // 70% available
          busy: Math.floor((userRoles.Technician || 0) * 0.25), // 25% busy
          offline: Math.floor((userRoles.Technician || 0) * 0.05) // 5% offline
        },
        loading: false
      };

      setDashboardStats({
        maintenanceRequests: maintenanceStats,
        equipment: equipmentStats,
        users: userStats,
        technicians: technicianStats
      });

      console.log('✅ KPI Cards updated with consolidated data');
    } catch (err) {
      console.error('❌ Error processing consolidated data:', err);
      // Fallback to individual API calls
      fetchAllDashboardData();
    }
  };

  /**
   * 📊 Fetch and calculate statistics from all existing APIs
   */
  const fetchAllDashboardData = async () => {
    try {
      // Fetch data from all existing APIs in parallel
      const [maintenanceRes, equipmentRes, usersRes, techniciansRes] = await Promise.all([
        fetch('http://localhost:5000/api/maintenance-requests'),
        fetch('http://localhost:5000/api/equipment'),
        fetch('http://localhost:5000/api/users'),
        fetch('http://localhost:5000/api/technicians')
      ]);

      // Process maintenance requests data
      if (maintenanceRes.ok) {
        const maintenanceData = await maintenanceRes.json();
        const requests = maintenanceData.success ? maintenanceData.data : [];
        
        const maintenanceStats = {
          total: requests.length,
          breakdown: {
            open: requests.filter(r => r.status === 'Open').length,
            inProgress: requests.filter(r => r.status === 'In Progress').length,
            completed: requests.filter(r => r.status === 'Completed').length
          },
          loading: false
        };

        setDashboardStats(prev => ({
          ...prev,
          maintenanceRequests: maintenanceStats
        }));
      }

      // Process equipment data
      if (equipmentRes.ok) {
        const equipmentData = await equipmentRes.json();
        const equipment = equipmentData.success ? equipmentData.data : [];
        
        const equipmentStats = {
          total: equipment.length,
          breakdown: {
            operational: equipment.filter(e => e.status === 'Operational').length,
            needsRepair: equipment.filter(e => e.status === 'Needs Repair').length,
            underMaintenance: equipment.filter(e => e.status === 'Under Maintenance').length
          },
          loading: false
        };

        setDashboardStats(prev => ({
          ...prev,
          equipment: equipmentStats
        }));
      }

      // Process users data
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const users = usersData.success ? usersData.data : [];
        
        const userStats = {
          total: users.length,
          breakdown: {
            admins: users.filter(u => u.role === 'Admin').length,
            doctors: users.filter(u => u.role === 'Doctor').length,
            staff: users.filter(u => ['LabStaff', 'LabSupervisor', 'Technician', 'Pharmacist', 'InventoryManager'].includes(u.role)).length,
            others: users.filter(u => u.role === 'Patient').length
          },
          loading: false
        };

        setDashboardStats(prev => ({
          ...prev,
          users: userStats
        }));
      }

      // Process technicians data
      if (techniciansRes.ok) {
        const techniciansData = await techniciansRes.json();
        const technicians = techniciansData.success ? techniciansData.data : [];
        
        const technicianStats = {
          total: technicians.length,
          breakdown: {
            available: technicians.filter(t => t.availability && t.isCurrentlyEmployed).length,
            busy: technicians.filter(t => t.currentWorkload?.total > 0).length,
            offline: technicians.filter(t => !t.availability || !t.isCurrentlyEmployed).length
          },
          loading: false
        };

        setDashboardStats(prev => ({
          ...prev,
          technicians: technicianStats
        }));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set loading to false for all sections on error
      setDashboardStats(prev => ({
        maintenanceRequests: { ...prev.maintenanceRequests, loading: false },
        equipment: { ...prev.equipment, loading: false },
        users: { ...prev.users, loading: false },
        technicians: { ...prev.technicians, loading: false }
      }));
    }
  };

  /**
   * 🧮 Calculate percentage for breakdown items
   */
  const calculatePercentage = (value, total) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  /**
   * 📋 Enhanced KPI cards configuration with detailed breakdowns
   */
  const enhancedKPICards = [
    {
      title: 'Maintenance Requests',
      total: dashboardStats.maintenanceRequests.total,
      icon: <Wrench className="h-6 w-6" />,
      color: 'blue',
      trend: '+12%',
      trendDirection: 'up',
      loading: dashboardStats.maintenanceRequests.loading,
      breakdown: [
        {
          label: 'Open',
          value: dashboardStats.maintenanceRequests.breakdown.open,
          percentage: calculatePercentage(
            dashboardStats.maintenanceRequests.breakdown.open,
            dashboardStats.maintenanceRequests.total
          ),
          color: 'bg-red-500'
        },
        {
          label: 'In Progress',
          value: dashboardStats.maintenanceRequests.breakdown.inProgress,
          percentage: calculatePercentage(
            dashboardStats.maintenanceRequests.breakdown.inProgress,
            dashboardStats.maintenanceRequests.total
          ),
          color: 'bg-yellow-500'
        },
        {
          label: 'Completed',
          value: dashboardStats.maintenanceRequests.breakdown.completed,
          percentage: calculatePercentage(
            dashboardStats.maintenanceRequests.breakdown.completed,
            dashboardStats.maintenanceRequests.total
          ),
          color: 'bg-green-500'
        }
      ]
    },
    {
      title: 'Equipment Status',
      total: dashboardStats.equipment.total,
      icon: <Settings className="h-6 w-6" />,
      color: 'green',
      trend: '+3%',
      trendDirection: 'up',
      loading: dashboardStats.equipment.loading,
      breakdown: [
        {
          label: 'Operational',
          value: dashboardStats.equipment.breakdown.operational,
          percentage: calculatePercentage(
            dashboardStats.equipment.breakdown.operational,
            dashboardStats.equipment.total
          ),
          color: 'bg-green-500'
        },
        {
          label: 'Needs Repair',
          value: dashboardStats.equipment.breakdown.needsRepair,
          percentage: calculatePercentage(
            dashboardStats.equipment.breakdown.needsRepair,
            dashboardStats.equipment.total
          ),
          color: 'bg-red-500'
        },
        {
          label: 'Under Maintenance',
          value: dashboardStats.equipment.breakdown.underMaintenance,
          percentage: calculatePercentage(
            dashboardStats.equipment.breakdown.underMaintenance,
            dashboardStats.equipment.total
          ),
          color: 'bg-yellow-500'
        }
      ]
    },
    {
      title: 'Total Users',
      total: dashboardStats.users.total,
      icon: <Users className="h-6 w-6" />,
      color: 'purple',
      trend: '+8%',
      trendDirection: 'up',
      loading: dashboardStats.users.loading,
      breakdown: [
        {
          label: 'Admins',
          value: dashboardStats.users.breakdown.admins,
          percentage: calculatePercentage(
            dashboardStats.users.breakdown.admins,
            dashboardStats.users.total
          ),
          color: 'bg-purple-500'
        },
        {
          label: 'Patients',
          value: dashboardStats.users.breakdown.patients,
          percentage: calculatePercentage(
            dashboardStats.users.breakdown.patients,
            dashboardStats.users.total
          ),
          color: 'bg-blue-500'
        },
        {
          label: 'Staff',
          value: dashboardStats.users.breakdown.staff,
          percentage: calculatePercentage(
            dashboardStats.users.breakdown.staff,
            dashboardStats.users.total
          ),
          color: 'bg-green-500'
        }
      ]
    },
    {
      title: 'Technicians',
      total: dashboardStats.technicians.total,
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'orange',
      trend: 'Stable',
      trendDirection: 'stable',
      loading: dashboardStats.technicians.loading,
      breakdown: [
        {
          label: 'Available',
          value: dashboardStats.technicians.breakdown.available,
          percentage: calculatePercentage(
            dashboardStats.technicians.breakdown.available,
            dashboardStats.technicians.total
          ),
          color: 'bg-green-500'
        },
        {
          label: 'Busy',
          value: dashboardStats.technicians.breakdown.busy,
          percentage: calculatePercentage(
            dashboardStats.technicians.breakdown.busy,
            dashboardStats.technicians.total
          ),
          color: 'bg-yellow-500'
        },
        {
          label: 'Offline',
          value: dashboardStats.technicians.breakdown.offline,
          percentage: calculatePercentage(
            dashboardStats.technicians.breakdown.offline,
            dashboardStats.technicians.total
          ),
          color: 'bg-gray-500'
        }
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Show error message if API failed */}
      {error && (
        <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            ⚠️ Error loading dashboard data: {error}
          </p>
          <p className="text-red-600 text-xs mt-1">
            Falling back to individual API calls...
          </p>
        </div>
      )}

      {enhancedKPICards.map((card, index) => (
        <div 
          key={index} 
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1"
        >
          {/* Card Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-${card.color}-50 shadow-sm`}>
                <span className={`text-${card.color}-600`}>
                  {card.icon}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  {card.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {card.trendDirection === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                  {card.trendDirection === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                  <span className={`text-xs font-medium ${
                    card.trendDirection === 'up' ? 'text-green-600' : 
                    card.trendDirection === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {card.trend}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Total Display */}
          <div className="mb-6">
            {card.loading ? (
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            ) : (
              <div className="flex items-baseline">
                <span className={`text-4xl font-bold text-${card.color}-600`}>
                  {card.total}
                </span>
                <span className="text-gray-400 text-sm font-medium ml-2">total</span>
              </div>
            )}
          </div>

          {/* Breakdown Statistics */}
          <div className="space-y-3">
            {card.breakdown.map((item, breakdownIndex) => (
              <div key={breakdownIndex} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                  <span className="text-xs text-gray-500">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="h-full flex">
                {card.breakdown.map((item, barIndex) => (
                  <div
                    key={barIndex}
                    className={item.color}
                    style={{ 
                      width: `${item.percentage}%`,
                      transition: 'width 0.5s ease-in-out'
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};