import React, { useState, useEffect } from 'react';
import { UserStatisticsCards } from './UserStatisticsCards';
import { DonutChart } from "../../../shared/components/ui/DonutChart";
import { RefreshCw, Users, BarChart3 } from 'lucide-react';

/**
 * 👥 User Management Section Component
 * 
 * Features:
 * ✅ Real-time user data from database
 * ✅ User statistics cards with role breakdown
 * ✅ Complete users table with search/filter
 * ✅ Role distribution visualization
 * ✅ Tab-based interface (Overview & Users)
 * ✅ No trends - pure database analytics
 */

export const UserManagementSection = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  // Single-view: always show overview (Users Directory removed)

  useEffect(() => {
    fetchUserData();
  }, []);

  /**
   * 📊 Fetch user data from API
   */
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:5000/api/users');
      
      if (response.ok) {
        const result = await response.json();
        const users = result.success ? result.data : [];
        
        setUserData(users);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🧮 Calculate role distribution for chart
   */
  const getRoleDistributionData = () => {
    if (!userData.length) return [];

    const roleCounts = userData.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Define role colors and grouping
    const roleConfig = {
      'Admin': { color: '#8b5cf6', group: 'Administration' },
      'Doctor': { color: '#3b82f6', group: 'Medical' },
      'LabStaff': { color: '#10b981', group: 'Support' },
      'LabSupervisor': { color: '#059669', group: 'Support' },
      'Technician': { color: '#f59e0b', group: 'Support' },
      'Pharmacist': { color: '#06b6d4', group: 'Support' },
      'InventoryManager': { color: '#6366f1', group: 'Support' },
      'Patient': { color: '#6b7280', group: 'Patients' }
    };

    return Object.entries(roleCounts).map(([role, count]) => ({
      label: role,
      value: count,
      color: roleConfig[role]?.color || '#6b7280',
      description: `${count} ${role.toLowerCase()}${count !== 1 ? 's' : ''}`
    }));
  };

  /**
   * 📈 Calculate summary statistics
   */
  const getSummaryStats = () => {
    const total = userData.length;
    const activeUsers = userData.filter(u => !u.isLocked).length;
    const lockedUsers = userData.filter(u => u.isLocked).length;
    const adminUsers = userData.filter(u => u.role === 'Admin').length;
    const medicalStaff = userData.filter(u => u.role === 'Doctor').length;
    const supportStaff = userData.filter(u => 
      ['LabStaff', 'LabSupervisor', 'Technician', 'Pharmacist', 'InventoryManager'].includes(u.role)
    ).length;

    return {
      total,
      activeUsers,
      lockedUsers,
      adminUsers,
      medicalStaff,
      supportStaff,
      activePercentage: total > 0 ? Math.round((activeUsers / total) * 100) : 0
    };
  };

  const roleDistributionData = getRoleDistributionData();
  const summaryStats = getSummaryStats();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">
            User Management
          </h2>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
            Live Data
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Last Updated */}
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-500">Last Updated</p>
            <p className="text-sm font-medium text-gray-700">
              {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading...'}
            </p>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={fetchUserData}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh user data"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* User Statistics Cards */}
      <UserStatisticsCards userData={userData} loading={loading} />

      {/* Overview (Users Directory removed) */}

      {/* Content Area */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
              <p className="text-gray-500">Loading user analytics...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Total Users</span>
                </div>
                <p className="text-2xl font-bold text-purple-600 mt-1">{summaryStats.total}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-900">Active</span>
                </div>
                <p className="text-2xl font-bold text-green-600 mt-1">{summaryStats.activeUsers}</p>
                <p className="text-xs text-green-600">{summaryStats.activePercentage}% of total</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-900">Medical Staff</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 mt-1">{summaryStats.medicalStaff}</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-orange-900">Support Staff</span>
                </div>
                <p className="text-2xl font-bold text-orange-600 mt-1">{summaryStats.supportStaff}</p>
              </div>
            </div>

            {/* Role Distribution Chart */}
            {roleDistributionData.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Distribution</h3>
                <DonutChart 
                  data={roleDistributionData}
                  centerText={summaryStats.total}
                  title="Users"
                  size={280}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center p-12">
                <div className="text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No user data available</p>
                  <p className="text-sm">User role distribution will appear here</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};