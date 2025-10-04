import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { EnhancedKPICards } from './EnhancedKPICards';
import { MaintenanceOverviewSection } from "../../equipment-maintenance/components/MaintenanceOverviewSection";
import { UserManagementSection } from './UserManagementSection';
import { fetchDashboardStatistics, refreshDashboardCache } from '../../../api/dashboardStatistics';

export const Dashboard = ({ onNavigate }) => {
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [dashboardData, setDashboardData] = useState({});
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [systemStatus, setSystemStatus] = useState({ server: 'online', database: 'connected', lastSync: new Date() });

  useEffect(() => {
    // Fetch comprehensive dashboard statistics using the proper API
    const fetchAndBuildDashboard = async () => {
      setIsInitialLoading(true);
      try {
        // Fetch comprehensive dashboard statistics
        const dashboardStats = await fetchDashboardStatistics();
        setDashboardData(dashboardStats);

        // Also fetch maintenance requests separately for the table display
        const res = await fetch('/api/maintenance-requests');
        if (!res.ok) throw new Error(`Failed to load maintenance requests: ${res.status}`);
        const payload = await res.json();
        const requests = payload && payload.success && Array.isArray(payload.data) ? payload.data : [];
        setMaintenanceRequests(requests);

        setApiError(null);
      } catch (err) {
        console.error('Dashboard: failed to build dashboard data', err);
        setApiError(err.message || 'Failed to load dashboard data');
        
        // Fallback: try to get just maintenance requests
        try {
          const res = await fetch('/api/maintenance-requests');
          if (res.ok) {
            const payload = await res.json();
            const requests = payload && payload.success && Array.isArray(payload.data) ? payload.data : [];
            setMaintenanceRequests(requests);
            
            // Build basic metrics as fallback
            const total = requests.length;
            const pending = requests.filter(r => r.status === 'Open').length;
            const inProgress = requests.filter(r => r.status === 'In Progress').length;
            const completed = requests.filter(r => r.status === 'Completed').length;

            setDashboardData({
              kpiMetrics: {
                totalMaintenanceRequests: total,
                pendingRequests: pending,
                inProgressRequests: inProgress,
                completedRequests: completed
              }
            });
          }
        } catch (fallbackErr) {
          console.error('Fallback fetch also failed:', fallbackErr);
          setDashboardData({});
        }
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchAndBuildDashboard();
  }, []);

  const handleRefreshDashboard = async () => {
    setIsRefreshing(true);
    try {
      // Force refresh the cache and get new data
      await refreshDashboardCache();
      
      // Fetch fresh dashboard statistics
      const dashboardStats = await fetchDashboardStatistics();
      setDashboardData(dashboardStats);
      
      // Also refresh maintenance requests
      const res = await fetch('/api/maintenance-requests');
      if (res.ok) {
        const payload = await res.json();
        const requests = payload && payload.success && Array.isArray(payload.data) ? payload.data : [];
        setMaintenanceRequests(requests);
      }
      
      setLastRefresh(new Date());
      setApiError(null);
    } catch (err) {
      setApiError(err.message || 'Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleNavigate = (target) => {
    if (typeof onNavigate === 'function') onNavigate(target);
  };
  const handleOpenModal = () => {};

  const getSystemStatusIcon = () => {
    if (systemStatus.server === 'online' && systemStatus.database === 'connected') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="space-y-6">
      {isInitialLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
            <p className="text-gray-600">Initializing clinic management system...</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Clinic Management Dashboard</h1>
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                {getSystemStatusIcon()}
                <span>System Online</span>
              </div>
            </div>
            <p className="text-gray-600 text-lg" style={{ textAlign: 'left' }}>Complete overview of maintenance, equipment, and user management</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
              <span>•</span>
              <span>Auto-refresh: Every 10 minutes</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right mr-4">
              <p className="text-sm font-medium text-gray-500">Today's Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button
              onClick={handleRefreshDashboard}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Refresh dashboard data"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="font-medium">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

  <EnhancedKPICards dashboardData={dashboardData} isLoading={isInitialLoading || isRefreshing} error={apiError} />

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <UserManagementSection dashboardData={dashboardData} isLoading={isInitialLoading || isRefreshing} />
        </div>

        <div className="space-y-6">
          <MaintenanceOverviewSection dashboardData={dashboardData} maintenanceRequests={maintenanceRequests} isLoading={isInitialLoading || isRefreshing} onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

