import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, Clock, Wrench, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../../authentication/context/AuthContext';
import { TechnicianKPICards } from '../components/TechnicianKPICards';
import { AssignedTasksList } from '../components/AssignedTasksList';
import { TechnicianScheduleView } from '../components/TechnicianScheduleView';

/**
 * Technician Dashboard - Specialized dashboard for maintenance technicians
 * Matches admin dashboard styling with technician-specific functionality
 */
const TechnicianDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  console.log('TechnicianDashboard: Component rendering, user:', user);
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [dashboardData, setDashboardData] = useState({});
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [systemStatus, setSystemStatus] = useState({ 
    server: 'online', 
    database: 'connected', 
    lastSync: new Date() 
  });

  // Extract user ID from auth
  const userId = user?.id || user?._id;
  console.log('TechnicianDashboard: User ID extracted:', userId);

  useEffect(() => {
    if (userId) {
      fetchTechnicianDashboard();
    }
  }, [userId]);

  const fetchTechnicianDashboard = async () => {
    setIsInitialLoading(true);
    try {
      console.log('📊 Fetching dashboard data for user ID:', userId);
      
      // Step 1: Find the technician record that corresponds to this user
      const technicianRes = await fetch(`/api/technicians`);
      let technicianId = null;
      
      if (technicianRes.ok) {
        const technicianData = await technicianRes.json();
        const allTechnicians = technicianData.data || [];
        
        // Find technician by user reference
        const myTechnician = allTechnicians.find(tech => 
          tech.user === userId || 
          (tech.user && tech.user._id === userId) ||
          (tech.user && tech.user.toString() === userId.toString())
        );
        
        if (myTechnician) {
          technicianId = myTechnician.id || myTechnician._id;
          console.log('✅ Found technician record:', myTechnician.name, 'ID:', technicianId);
        } else {
          console.warn('⚠️ No technician record found for user:', userId);
          // Check if any technician has matching email or name as fallback
          const userEmail = user?.email;
          const fallbackTechnician = allTechnicians.find(tech => 
            tech.email === userEmail || tech.name === user?.name
          );
          if (fallbackTechnician) {
            technicianId = fallbackTechnician.id || fallbackTechnician._id;
            console.log('📧 Found technician by email/name fallback:', fallbackTechnician.name);
          }
        }
      }
      
      // Step 2: Get maintenance requests and scheduled maintenance for this technician
      const [tasksRes, scheduledMaintenanceRes] = await Promise.allSettled([
        fetch(`/api/maintenance-requests`),
        technicianId ? fetch(`/api/technicians/${technicianId}`) : Promise.reject('No technician ID')
      ]);

      let assignedTasks = [];
      let scheduledMaintenance = [];

      if (tasksRes.status === 'fulfilled' && tasksRes.value.ok) {
        const tasksData = await tasksRes.value.json();
        const allTasks = tasksData.data || [];
        
        if (technicianId) {
          // Filter tasks assigned to this technician
          assignedTasks = allTasks.filter(task => {
            if (!task.assignedTo) return false;
            
            // Check if assignedTo.id matches our technician ID
            const assignedToId = task.assignedTo.id || task.assignedTo._id;
            return assignedToId === technicianId || assignedToId?.toString() === technicianId?.toString();
          });
          
          console.log('📋 Found assigned tasks for technician:', assignedTasks.length);
        } else {
          console.log('❌ No technician ID found, cannot filter tasks');
        }
        
        setAssignedTasks(assignedTasks);
      } else {
        console.warn('⚠️ Failed to fetch maintenance requests');
        setAssignedTasks([]);
      }

      // Step 3: Get scheduled maintenance from technician's scheduledMaintenance array
      if (scheduledMaintenanceRes.status === 'fulfilled' && scheduledMaintenanceRes.value.ok) {
        const technicianData = await scheduledMaintenanceRes.value.json();
        const technician = technicianData.data;
        
        if (technician && technician.scheduledMaintenance && technician.scheduledMaintenance.length > 0) {
          // Fetch details for each scheduled maintenance ID in the technician's array
          const scheduledMaintenancePromises = technician.scheduledMaintenance.map(async (scheduleId) => {
            try {
              const response = await fetch(`/api/scheduled-maintenance/${scheduleId}`);
              if (response.ok) {
                const data = await response.json();
                return data.data;
              }
              return null;
            } catch (error) {
              console.warn(`⚠️ Failed to fetch scheduled maintenance ${scheduleId}:`, error);
              return null;
            }
          });
          
          const scheduledResults = await Promise.allSettled(scheduledMaintenancePromises);
          scheduledMaintenance = scheduledResults
            .filter(result => result.status === 'fulfilled' && result.value)
            .map(result => result.value);
          
          console.log('📅 Found scheduled maintenance for technician:', scheduledMaintenance.length);
        } else {
          console.log('📅 No scheduled maintenance in technician array');
        }
        
        setUpcomingSchedule(scheduledMaintenance);
      } else {
        console.warn('⚠️ Failed to fetch technician data for scheduled maintenance');
        setUpcomingSchedule([]);
      }

      // Build basic stats from tasks data
      const total = assignedTasks.length;
      const pending = assignedTasks.filter(t => t.status === 'Pending' || t.status === 'Assigned').length;
      const inProgress = assignedTasks.filter(t => t.status === 'In Progress').length;
      const completed = assignedTasks.filter(t => t.status === 'Completed').length;
      
      setDashboardData({
        totalTasks: total,
        pendingTasks: pending,
        inProgressTasks: inProgress,
        completedTasks: completed,
        todaysTasks: assignedTasks.filter(t => {
          const taskDate = new Date(t.createdAt);
          const today = new Date();
          return taskDate.toDateString() === today.toDateString();
        }).length,
        scheduledCount: scheduledMaintenance.length
      });

      setApiError(null);
      
    } catch (err) {
      console.error('❌ Technician Dashboard: failed to load data', err);
      setApiError(err.message || 'Failed to load dashboard data');
      setDashboardData({});
      setAssignedTasks([]);
      setUpcomingSchedule([]);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleRefreshDashboard = async () => {
    setIsRefreshing(true);
    try {
      await fetchTechnicianDashboard();
      setLastRefresh(new Date());
    } catch (err) {
      setApiError(err.message || 'Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleNavigate = (target) => {
    if (onNavigate) {
      onNavigate(target);
    }
  };

  // If there's an API error and no data, show a centered error state
  if (apiError && !dashboardData.totalTasks && assignedTasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">{apiError}</p>
          <button
            onClick={handleRefreshDashboard}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isRefreshing ? 'Refreshing...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Technician Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.name || 'Technician'}! Manage your assigned tasks and schedule.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <button
                onClick={handleRefreshDashboard}
                disabled={isRefreshing}
                className={`px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center space-x-2 ${
                  isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Wrench className="inline h-4 w-4 mr-2" />
                My Tasks
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'schedule'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="inline h-4 w-4 mr-2" />
                Schedule
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="inline h-4 w-4 mr-2" />
                Profile
              </button>
            </nav>
          </div>
        </div>

        {/* Loading State */}
        {isInitialLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="mx-auto h-8 w-8 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {!isInitialLoading && (
          <>
            {activeTab === 'tasks' && (
              <div className="space-y-6">
                {/* KPI Cards */}
                <TechnicianKPICards
                  dashboardData={dashboardData}
                  loading={isInitialLoading}
                />

                {/* Assigned Tasks List */}
                <AssignedTasksList
                  tasks={assignedTasks}
                  isLoading={isInitialLoading}
                  onRefresh={handleRefreshDashboard}
                  onTaskAction={handleRefreshDashboard}
                />
              </div>
            )}

            {activeTab === 'schedule' && (
              <TechnicianScheduleView
                schedule={upcomingSchedule}
                tasks={assignedTasks}
                loading={isInitialLoading}
                onNavigate={handleNavigate}
                onRefresh={handleRefreshDashboard}
              />
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.email || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.role || 'technician'}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Error Banner */}
        {apiError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                <p className="text-sm text-red-700 mt-1">{apiError}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianDashboard;