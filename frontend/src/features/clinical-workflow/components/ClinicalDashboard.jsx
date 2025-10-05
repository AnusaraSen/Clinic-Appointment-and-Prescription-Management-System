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

        {/* Medical Dashboard Header - simplified for a professional look */}
        <div className="relative bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Stethoscope className="h-7 w-7 text-gray-700" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-0">Clinical Dashboard</h1>
                    <div className="flex items-center gap-2 mt-1">
                      {getSystemStatusIcon()}
                      <span className="text-gray-600 text-sm">Clinical systems online</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Patient care overview and clinical workflow management
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
                  </div>
                  <span className="opacity-60">•</span>
                  <span>Real-time monitoring</span>
                  <span className="opacity-60">•</span>
                  <span>Secure data</span>
                </div>
              </div>

              <div className="hidden lg:flex items-start space-x-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Today's Date</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date().toLocaleDateString('en-US', { year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={handleRefreshDashboard}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
                  title="Refresh clinical data"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="text-sm">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
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