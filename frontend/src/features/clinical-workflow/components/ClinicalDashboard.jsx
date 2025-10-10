import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, Stethoscope, Heart } from 'lucide-react';
import { ClinicalKPICards } from './ClinicalKPICards';
import { ClinicalAppointmentsSection } from './ClinicalAppointmentsSection';
import { ClinicalActivitySection } from './ClinicalActivitySection';
import ClinicalPastAppointmentsSection from './ClinicalPastAppointmentsSection.jsx';
import { ClinicalLayout } from '../layouts/ClinicalLayout';
import CalmLoader from '../../../components/CalmLoader';
import '../styles/clinicalDashboard.css';
import { useAuth } from '../../authentication/context/AuthContext.jsx';
import { getDoctorAppointments, getDoctorAppointmentsByName, getAllAppointments } from '../../../api/appointmentsApi.js';


export const ClinicalDashboard = ({ onNavigate }) => {
  const { user } = useAuth() || {};
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [dashboardData, setDashboardData] = useState({});
  const [appointments, setAppointments] = useState([]);
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

  // Helpers to normalize and filter appointments for today's date
  const toYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const extractApptYMD = (a) => {
    const raw = (
      a?.appointment_date ?? a?.appointmentDate ?? a?.date ?? a?.scheduledDate ?? a?.datetime ?? a?.startTime ?? a?.time
    );
    if (!raw) return null;
    if (typeof raw === 'string') {
      const s = raw.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s; // YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10); // ISO date
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : toYMD(d);
    }
    if (typeof raw === 'number') { const d = new Date(raw); return isNaN(d.getTime()) ? null : toYMD(d); }
    try { const d = new Date(raw); return isNaN(d.getTime()) ? null : toYMD(d); } catch { return null; }
  };
  const normalizeTodaysAppointments = (payload) => {
    const todayYmd = toYMD(new Date());
    if (Array.isArray(payload)) return payload.filter(a => extractApptYMD(a) === todayYmd);
    if (payload && typeof payload === 'object') {
      const arr = payload.items || payload.appointments || payload.data || payload.results;
      if (Array.isArray(arr)) return arr.filter(a => extractApptYMD(a) === todayYmd);
      // Object keyed by dates
      const keys = Object.keys(payload);
      if (keys.length && keys.every(k => /^\d{4}-\d{2}-\d{2}$/.test(k))) {
        return Array.isArray(payload[todayYmd]) ? payload[todayYmd] : [];
      }
      // Nested today container
      if (payload.today) {
        const t = payload.today;
        const tArr = Array.isArray(t) ? t : (t.items || t.appointments || t.data || t.results);
        if (Array.isArray(tArr)) return tArr.filter(a => extractApptYMD(a) === todayYmd);
      }
    }
    return [];
  };

  const fetchClinicalDashboardData = async () => {
    setIsInitialLoading(true);
    try {
      const base = 'http://localhost:5000';
      
      // Fetch clinical dashboard data
      const [statsRes, appointmentsRes, activitiesRes] = await Promise.all([
        fetch(`${base}/dashboard/clinical/stats`).catch(() => ({ ok: false })),
        fetch(`${base}/dashboard/appointments/today`).catch(() => ({ ok: false })),
        fetch(`${base}/dashboard/activities/recent`).catch(() => ({ ok: false }))
      ]);

      // Process responses
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setDashboardData(stats);
      }

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        let todayList = normalizeTodaysAppointments(appointmentsData);

        // Fallbacks if empty: fetch by doctor id/name or all, then filter to today
        if (!todayList || todayList.length === 0) {
          try {
            const todayYmd = toYMD(new Date());
            let fetched = [];
            const doctorId = user?._id || user?.doctorId;
            const doctorName = user?.name || user?.fullName || user?.username;
            if (doctorId) {
              try {
                const byId = await getDoctorAppointments({ doctorId, start: todayYmd, end: todayYmd });
                if (Array.isArray(byId) && byId.length) fetched = byId;
              } catch {}
            }
            if ((!fetched || fetched.length === 0) && doctorName) {
              try {
                const byName = await getDoctorAppointmentsByName({ doctorName, start: todayYmd, end: todayYmd, loose: true });
                if (Array.isArray(byName) && byName.length) fetched = byName;
              } catch {}
            }
            if (!fetched || fetched.length === 0) {
              try {
                const all = await getAllAppointments();
                const lowered = (doctorName || '').toLowerCase();
                fetched = (all || []).filter(a => {
                  const dateStr = (a.appointment_date || a.date || '').toString();
                  const ymd = dateStr.includes('T') ? dateStr.slice(0,10) : dateStr;
                  const nameStr = (a.doctor_name || '').toLowerCase();
                  return ymd === todayYmd && (!doctorName || nameStr.includes(lowered));
                });
              } catch {}
            }
            todayList = fetched;
          } catch {}
        }
        setAppointments(todayList || []);
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
      <div className="cd-layout-section" aria-live="polite" aria-busy={isInitialLoading}>
        <div className="space-y-6">
          {isInitialLoading && (
            <CalmLoader fullscreen title="Loading Clinical Dashboard" note="Please wait..." />
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
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
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
              {/* New: Past Appointments section */}
              <ClinicalPastAppointmentsSection />
            </div>
          </div>

        {/* Recent Activity Section */}
        <ClinicalActivitySection
          activities={recentActivities}
          isLoading={isInitialLoading || isRefreshing}
        />

          {/* Medical Error Display */}
          {apiError && (
            <div className="bg-white border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-3 mb-1">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <p className="text-sm font-medium text-red-600">{apiError}</p>
              </div>
              <button
                onClick={handleRefreshDashboard}
                className="mt-1 inline-flex px-3 py-1.5 text-xs border border-red-300 rounded text-red-600 hover:bg-red-50"
              >Retry</button>
            </div>
          )}
        </div>
      </div>
    </ClinicalLayout>
  );
};

export default ClinicalDashboard;