import React, { useState, useEffect } from 'react';
import { DonutChart } from "../../../shared/components/ui/DonutChart";
import { WorkRequestsTable } from './WorkRequestsTable';
import { TrendingUp, RefreshCw, BarChart3 } from 'lucide-react';

/**
 * 📋 Maintenance Overview Section Component
 * 
 * Features:
 * ✅ Enhanced maintenance requests table
 * ✅ Interactive donut chart with status visualization
 * ✅ Real-time data from maintenance-requests API
 * ✅ Status breakdown with color coding
 * ✅ Professional styling with tabs/sections
 */

export const MaintenanceOverviewSection = ({ maintenanceRequests = [], onNavigate }) => {
  const [maintenanceData, setMaintenanceData] = useState({
    requests: maintenanceRequests || [],
    loading: true,
    lastUpdated: null
  });

  const [activeTab, setActiveTab] = useState('table'); // 'table' or 'chart'

  useEffect(() => {
    // If parent provided maintenanceRequests, use them; otherwise fetch
    if (maintenanceRequests && maintenanceRequests.length > 0) {
      setMaintenanceData({ requests: maintenanceRequests, loading: false, lastUpdated: new Date() });
    } else {
      fetchMaintenanceData();
    }
  }, [maintenanceRequests]);

  /**
   * 📊 Fetch maintenance requests data from API
   */
  const fetchMaintenanceData = async () => {
    try {
      setMaintenanceData(prev => ({ ...prev, loading: true }));
      
      const response = await fetch('http://localhost:5000/api/maintenance-requests');
      
      if (response.ok) {
        const result = await response.json();
        const requests = result.success ? result.data : [];
        
        setMaintenanceData({
          requests,
          loading: false,
          lastUpdated: new Date()
        });
      } else {
        console.error('Failed to fetch maintenance data');
        setMaintenanceData(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      setMaintenanceData(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * 🧮 Calculate chart data from maintenance requests
   */
  const getChartData = () => {
    if (!maintenanceData.requests.length) {
      return [];
    }

    const statusCounts = maintenanceData.requests.reduce((acc, request) => {
      const status = request.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Define status colors and mapping
    const statusConfig = {
      'Open': { color: '#ef4444', label: 'Open', description: 'Awaiting assignment' },
      'In Progress': { color: '#f59e0b', label: 'In Progress', description: 'Currently being worked on' },
      'Completed': { color: '#10b981', label: 'Completed', description: 'Successfully resolved' },
      'On Hold': { color: '#6b7280', label: 'On Hold', description: 'Temporarily paused' },
      'Cancelled': { color: '#9ca3af', label: 'Cancelled', description: 'No longer needed' }
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      label: statusConfig[status]?.label || status,
      value: count,
      color: statusConfig[status]?.color || '#6b7280',
      description: statusConfig[status]?.description || `${status} requests`
    }));
  };

  /**
   * 📈 Calculate summary statistics
   */
  const getSummaryStats = () => {
    const total = maintenanceData.requests.length;
    const openRequests = maintenanceData.requests.filter(r => r.status === 'Open').length;
    const inProgressRequests = maintenanceData.requests.filter(r => r.status === 'In Progress').length;
    const completedRequests = maintenanceData.requests.filter(r => r.status === 'Completed').length;
    const highPriorityRequests = maintenanceData.requests.filter(r => r.priority === 'High').length;

    return {
      total,
      openRequests,
      inProgressRequests,
      completedRequests,
      highPriorityRequests,
      completionRate: total > 0 ? Math.round((completedRequests / total) * 100) : 0
    };
  };

  const chartData = getChartData();
  const stats = getSummaryStats();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">
            Maintenance Overview
          </h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            Live Data
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Last Updated */}
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-500">Last Updated</p>
            <p className="text-sm font-medium text-gray-700">
              {maintenanceData.lastUpdated 
                ? maintenanceData.lastUpdated.toLocaleTimeString() 
                : 'Loading...'}
            </p>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={fetchMaintenanceData}
            disabled={maintenanceData.loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`h-5 w-5 ${maintenanceData.loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.total}</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-red-900">Open</span>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.openRequests}</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium text-yellow-900">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.inProgressRequests}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-900">Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.completedRequests}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('table')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'table'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📋 Requests Table
        </button>
        <button
          onClick={() => setActiveTab('chart')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'chart'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart3 className="inline h-4 w-4 mr-1" />
          Visual Analytics
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'table' ? (
        <div>
          {/* Enhanced Table (dashboard view: hide actions and add button) */}
          <WorkRequestsTable showActions={false} showAddButton={false} onNavigate={onNavigate} />
          
          {/* Table Footer with Summary */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {stats.total} maintenance requests
              </span>
              <div className="flex items-center gap-4">
                <span>Completion Rate: <strong className="text-green-600">{stats.completionRate}%</strong></span>
                <span>High Priority: <strong className="text-red-600">{stats.highPriorityRequests}</strong></span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Donut Chart Analytics */}
          {maintenanceData.loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-500">Loading analytics...</p>
              </div>
            </div>
          ) : chartData.length > 0 ? (
            <DonutChart 
              data={chartData}
              centerText={stats.total}
              title="Requests"
              size={280}
            />
          ) : (
            <div className="flex items-center justify-center p-12">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No data available</p>
                <p className="text-sm">Add some maintenance requests to see analytics</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};