import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, UserCheck, Stethoscope, Heart, Activity } from 'lucide-react';
import { ClinicalKPICards } from './ClinicalKPICards';
import { ClinicalAppointmentsSection } from './ClinicalAppointmentsSection';
import { ClinicalTasksSection } from './ClinicalTasksSection';
import { ClinicalActivitySection } from './ClinicalActivitySection';
import { ClinicalLayout } from '../layouts/ClinicalLayout';


export const ClinicalDashboard = ({ onNavigate }) => {
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [dashboardData, setDashboardData] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [urgentTasks, setUrgentTasks] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [systemStatus, setSystemStatus] = useState({ 
    server: 'online', 
    database: 'connected', 
    lastSync: new Date() 
  });

  useEffect(() => {
    fetchClinicalDashboardData();
  }, []);

  const fetchClinicalDashboardData = async () => {
    setIsInitialLoading(true);
    try {
      const base = 'http://localhost:5000';
      
      // Fetch clinical dashboard data
      const [statsRes, appointmentsRes, tasksRes, activitiesRes] = await Promise.all([
        fetch(`${base}/dashboard/clinical/stats`).catch(() => ({ ok: false })),
        fetch(`${base}/dashboard/appointments/today`).catch(() => ({ ok: false })),
        fetch(`${base}/dashboard/tasks/urgent`).catch(() => ({ ok: false })),
        fetch(`${base}/dashboard/activities/recent`).catch(() => ({ ok: false }))
      ]);

      // Process responses
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setDashboardData(stats);
      }

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : appointmentsData.data || []);
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setUrgentTasks(Array.isArray(tasksData) ? tasksData : tasksData.data || []);
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setRecentActivities(Array.isArray(activitiesData) ? activitiesData : activitiesData.data || []);
      }

      setApiError(null);
    } catch (err) {
      console.error('Clinical Dashboard: failed to load data', err);
      setApiError(err.message || 'Failed to load clinical dashboard data');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleRefreshDashboard = async () => {
    setIsRefreshing(true);
    try {
      await fetchClinicalDashboardData();
      setLastRefresh(new Date());
      setApiError(null);
    } catch (err) {
      setApiError(err.message || 'Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateAppointment = async (appointmentId, action) => {
    try {
      const base = 'http://localhost:5000';
      let status;
      
      switch (action) {
        case 'start':
          status = 'in-progress';
          break;
        case 'complete':
          status = 'completed';
          break;
        case 'cancel':
          status = 'cancelled';
          break;
        case 'reschedule':
          // Handle reschedule logic
          console.log('Reschedule functionality would be implemented here');
          return;
        default:
          status = action;
      }

      await fetch(`${base}/dashboard/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      // Refresh appointments data
      fetchClinicalDashboardData();
    } catch (error) {
      console.error('Error updating appointment:', error);
      setApiError('Failed to update appointment');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const base = 'http://localhost:5000';
      await fetch(`${base}/dashboard/tasks/${taskId}/complete`, {
        method: 'PATCH'
      });

      // Refresh tasks data
      fetchClinicalDashboardData();
    } catch (error) {
      console.error('Error completing task:', error);
      setApiError('Failed to complete task');
    }
  };

  const handleNavigate = (target) => {
    if (typeof onNavigate === 'function') onNavigate(target);
  };

  const getSystemStatusIcon = () => {
    if (systemStatus.server === 'online' && systemStatus.database === 'connected') {
      return <Heart className="h-4 w-4 text-emerald-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  };

  return (
    <ClinicalLayout currentPath="/clinical/dashboard">
      <div className="space-y-6">
        {isInitialLoading && (
          <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="text-center">
              <div className="relative">
                <Stethoscope className="h-16 w-16 text-blue-600 animate-pulse mx-auto mb-4" />
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Medical Dashboard</h2>
              <p className="text-gray-600">Preparing your clinical workspace...</p>
            </div>
          </div>
        )}

        {/* Medical Dashboard Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 rounded-2xl shadow-2xl border border-blue-200 overflow-hidden">
          {/* Medical Pattern Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4">
              <Stethoscope className="h-32 w-32 text-white" />
            </div>
            <div className="absolute bottom-4 right-4">
              <Heart className="h-24 w-24 text-white" />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Activity className="h-20 w-20 text-white" />
            </div>
          </div>
          
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-4 mb-3 ">
                  <div className="p-3 bg-black bg-opacity-20 rounded-2xl backdrop-blur-sm">
                    <Stethoscope className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-1">Clinical Dashboard</h1>
                    <div className="flex items-center gap-2">
                      {getSystemStatusIcon()}
                      <span className="text-emerald-100 text-sm font-medium">Clinical Systems Online</span>
                    </div>
                  </div>
                </div>
                <p className="text-blue-100 text-lg font-medium">
                  Comprehensive patient care and clinical workflow management
                </p>
                <div className="flex items-center gap-6 mt-3 text-sm text-blue-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
                  </div>
                  <span>•</span>
                  <span>Real-time patient monitoring</span>
                  <span>•</span>
                  <span>Secure medical data</span>
                </div>
              </div>

              <div className="hidden lg:flex items-center space-x-6">
                <div className="text-right text-white">
                  <p className="text-sm font-medium text-blue-100">Today's Date</p>
                  <p className="text-xl font-bold">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-blue-100">
                    {new Date().toLocaleDateString('en-US', { year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={handleRefreshDashboard}
                  disabled={isRefreshing}
                  className="flex items-center gap-3 px-6 py-3 bg-white bg-opacity-20 text-white rounded-xl hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-sm border border-white border-opacity-20"
                  title="Refresh clinical data"
                >
                  <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="font-semibold">{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Clinical KPI Cards */}
      <ClinicalKPICards 
        dashboardData={dashboardData} 
        isLoading={isInitialLoading || isRefreshing} 
        error={apiError} 
      />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <ClinicalAppointmentsSection
              appointments={appointments}
              isLoading={isInitialLoading || isRefreshing}
              onUpdateAppointment={handleUpdateAppointment}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <ClinicalTasksSection
              tasks={urgentTasks}
              isLoading={isInitialLoading || isRefreshing}
              onCompleteTask={handleCompleteTask}
            />
          </div>
        </div>

      {/* Recent Activity Section */}
      <ClinicalActivitySection
        activities={recentActivities}
        isLoading={isInitialLoading || isRefreshing}
      />

        {/* Medical Error Display */}
        {apiError && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-red-800 font-bold text-lg">Clinical System Alert</p>
                <p className="text-red-700">{apiError}</p>
              </div>
            </div>
            <button
              onClick={handleRefreshDashboard}
              className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>
    </ClinicalLayout>
  );
};

export default ClinicalDashboard;