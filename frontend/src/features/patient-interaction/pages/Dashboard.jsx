import React, { useEffect, useState, useCallback } from 'react';
import { CalendarClock, FileText, Activity, CheckCircle, Eye, Pencil, Trash2, MessageSquare } from 'lucide-react';
import { PatientLayout } from '../components/PatientLayout';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/Patient-Interaction/Dashboard.css';

const Dashboard = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [completedVisitsCount, setCompletedVisitsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Prescriptions state
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [rxLoading, setRxLoading] = useState(false);
  const [rxError, setRxError] = useState("");
  
  // Feedback state
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const search = new URLSearchParams(location.search);
  const patientCode = params.code || params.id || search.get('code') || null;

  const getInitials = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return 'Dr';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase() || 'DR';
  };

  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchAppointments = useCallback(async (manual=false) => {
      if (manual) setRefreshing(true);
      setLoading(true);
      setError("");
      try {
        // Try multiple endpoints to avoid 404s from singular/plural or proxy issues
        const endpoints = [
          "/appointment/",
          "/appointments/",
          "http://localhost:5000/appointment/",
          "http://localhost:5000/appointments/",
        ];

        let res = null;
        let lastErr = null;
        for (const url of endpoints) {
          try {
            res = await axios.get(url, { timeout: 5000 });
            if (res && Array.isArray(res.data)) break;
          } catch (e) {
            lastErr = e;
          }
        }
        if (!res || !Array.isArray(res.data)) {
          throw lastErr || new Error("No valid appointments response");
        }
        // Filter for upcoming and completed appointments and sort by date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcoming = (res.data || [])
          .filter(app => {
            const appDate = new Date(app.appointment_date || app.date);
            appDate.setHours(0, 0, 0, 0);
            return appDate >= today; // today + future
          })
          .sort((a, b) => {
            // Earliest upcoming first (soonest)
            const baseA = new Date(a.appointment_date || a.date);
            const baseB = new Date(b.appointment_date || b.date);
            const [hA, mA] = (a.appointment_time || '00:00').split(':').map(Number);
            const [hB, mB] = (b.appointment_time || '00:00').split(':').map(Number);
            baseA.setHours(hA||0, mA||0, 0, 0);
            baseB.setHours(hB||0, mB||0, 0, 0);
            return baseA - baseB;
          });

        const completed = (res.data || [])
          .filter(app => {
            // Count past appointments
            const appDate = new Date(app.appointment_date || app.date);
            appDate.setHours(0, 0, 0, 0);
            return appDate < today; // Past appointments
          });

        // IMPORTANT: Do not override populated doctor provided by backend
        // The backend returns `doctor` (populated from doctor_id) already.
        setUpcomingAppointments(upcoming);
        setCompletedVisitsCount(completed.length);
        
        // Cache a patientId for Topbar navigation convenience (first upcoming appointment)
        const first = upcoming[0]; // soonest upcoming
  const pid = first ? (typeof first.patient_id === 'object' ? first.patient_id?._id : first.patient_id) : null;
        if (pid) localStorage.setItem('patientId', pid);
        setLastRefreshed(new Date());
      } catch (err) {
        const msg = err?.response?.data || err?.message || "Failed to load appointments";
        setError(`Failed to load appointments: ${msg}`);
      }
      setLoading(false);
      if (manual) setRefreshing(false);
    }, [setUpcomingAppointments, setCompletedVisitsCount]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleRefreshAppointments = () => {
    fetchAppointments(true);
  };
  // Fetch last 2 prescriptions via route param patient code
  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!patientCode) return; // no patient code present in route/search
      setRxLoading(true);
      setRxError("");
      const endpoints = [
        `http://localhost:5000/prescriptions/by-patient-code/${patientCode}?limit=2`,
        `http://127.0.0.1:5000/prescriptions/by-patient-code/${patientCode}?limit=2`,
        `/prescriptions/by-patient-code/${patientCode}?limit=2`,
      ];
      let lastErr = null;
      for (const url of endpoints) {
        try {
          const res = await axios.get(url, { timeout: 5000 });
          if (Array.isArray(res.data)) {
            setRecentPrescriptions(res.data);
            setRxLoading(false);
            return;
          }
        } catch (e) {
          lastErr = e;
        }
      }
      const status = lastErr?.response?.status;
      let msg = 'Failed to load prescriptions';
      if (status === 404) msg = 'No recent prescriptions';
      else if (lastErr?.code === 'ERR_NETWORK') msg = 'Backend not reachable';
      else if (lastErr?.message?.toLowerCase().includes('timeout')) msg = 'Request timed out';
      setRxError(msg);
      setRxLoading(false);
    };
    fetchPrescriptions();
    // Polling: re-fetch every 30 seconds when a code is present
    if (patientCode) {
      const id = setInterval(fetchPrescriptions, 30000);
      return () => clearInterval(id);
    }
  }, [patientCode]);

  // Fetch feedback count
  useEffect(() => {
    const fetchFeedbackCount = async () => {
      setFeedbackLoading(true);

      // Build current patient identity hints (same strategy as MyFeedback)
      const currentPatientIds = (() => {
        const ids = new Set();
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            if (u?._id) ids.add(String(u._id));
            if (u?.patientId) ids.add(String(u.patientId));
            if (u?.patient_id) ids.add(String(u.patient_id));
            if (u?.patientCode) ids.add(String(u.patientCode));
            if (u?.code) ids.add(String(u.code));
          } catch {}
        }
        const knownKeys = ['patientId','patient_id','patientCode','code'];
        for (const k of knownKeys) {
          const v = localStorage.getItem(k);
          if (v) ids.add(String(v));
        }
        return ids;
      })();

      const feedbackEndpoints = [
        "/feedback/",
        "http://localhost:5000/feedback/",
        "http://127.0.0.1:5000/feedback/",
      ];

      let all = [];
      for (const url of feedbackEndpoints) {
        try {
          const res = await axios.get(url, { timeout: 5000 });
          if (Array.isArray(res.data)) { all = res.data; break; }
        } catch (err) {
          console.warn(`Failed to fetch feedback from ${url}:`, err?.message);
        }
      }

      if (!Array.isArray(all) || all.length === 0) { setFeedbackCount(0); setFeedbackLoading(false); return; }

      // If we don't know the patient's ids, just show total
      if (currentPatientIds.size === 0) {
        setFeedbackCount(all.length);
        setFeedbackLoading(false);
        return;
      }

      // Map feedbacks to appointment IDs to resolve patient ownership
      const apptIds = Array.from(new Set(all.map(f => {
        const a = f.appointment_id || f.appointment;
        if (!a) return null;
        if (typeof a === 'string') return a;
        if (typeof a === 'object' && a._id) return String(a._id);
        return null;
      }).filter(Boolean)));

      const fetchAppointment = async (id) => {
        const urls = [
          `/appointment/get/${id}`,
          `http://localhost:5000/appointment/get/${id}`,
          `http://127.0.0.1:5000/appointment/get/${id}`,
        ];
        for (const u of urls) {
          try { const r = await axios.get(u, { timeout: 5000 }); if (r?.data?.appointment) return r.data.appointment; } catch(_) {}
        }
        return null;
      };

      const pairs = await Promise.all(apptIds.map(async id => [id, await fetchAppointment(id)]));
      const apptById = new Map(pairs);

      const visible = all.filter(f => {
        // Prefer appointment-derived patient id
        const a = f.appointment || f.appointment_id;
        let id = null;
        if (typeof a === 'string') id = a; else if (typeof a === 'object' && a?._id) id = String(a._id);
        const appt = id ? (typeof a === 'object' ? a : apptById.get(id)) : null;
        const pid = appt?.patient_id;
        if (pid && currentPatientIds.has(String(pid))) return true;
        // Fallback if feedback contains patient hints directly
        if (f.patient_id && currentPatientIds.has(String(f.patient_id))) return true;
        if (f.patient_code && currentPatientIds.has(String(f.patient_code))) return true;
        return false;
      });

      setFeedbackCount(visible.length);
      setFeedbackLoading(false);
    };
    fetchFeedbackCount();
  }, []);

  return (
    <PatientLayout currentPage="dashboard">
      <div className="welcome-header" style={{ 
        marginBottom: 32, 
        padding: '32px 40px', 
        background: 'linear-gradient(135deg, #008080 0%, #20b2aa 100%)', 
        borderRadius: 16, 
        color: 'white',
        boxShadow: '0 8px 32px rgba(0, 128, 128, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h1 style={{ fontWeight: 700, fontSize: '2.5rem', color: 'white', marginBottom: 8, margin: '0 0 8px 0', position: 'relative', zIndex: 2 }}>
          Welcome back, <span className="welcome-name" style={{ color: '#fef9c3', textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}></span>
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '1.2rem', margin: 0, opacity: 0.9, position: 'relative', zIndex: 2 }}>Here's an overview of your health information and upcoming activities.</p>
      </div>

          <div className="stats-grid" style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
            <div className="stat-card" style={{ 
              flex: 1, 
              minWidth: 250,
              background: '#fff', 
              borderRadius: 16, 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', 
              padding: 28, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              border: '1px solid rgba(0, 128, 128, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}>
              <CalendarClock size={32} color="#3b82f6" />
              <div style={{ fontWeight: 600, fontSize: '1.08rem', color: '#222', marginTop: 8 }}>Upcoming Appointments</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#222', margin: '8px 0' }}>{upcomingAppointments.length}</div>
              <Link to="/patient/appointments" style={{ color: '#008080', fontWeight: 500, fontSize: '1rem', marginTop: 8, textDecoration: 'none' }}>View all</Link>
            </div>

            <div className="stat-card" style={{ 
              flex: 1, 
              minWidth: 250,
              background: '#fff', 
              borderRadius: 16, 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', 
              padding: 28, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              border: '1px solid rgba(0, 128, 128, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}>
              <FileText size={32} color="#22c55e" />
              <div style={{ fontWeight: 600, fontSize: '1.08rem', color: '#222', marginTop: 8 }}>Prescriptions</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#222', margin: '8px 0' }}>{recentPrescriptions.length}</div>
              <Link to="/dashboard/prescriptions" style={{ color: '#008080', fontWeight: 500, fontSize: '1rem', marginTop: 8, textDecoration: 'none' }}>View all</Link>
            </div>

            <div className="stat-card" style={{ 
              flex: 1, 
              minWidth: 250,
              background: '#fff', 
              borderRadius: 16, 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', 
              padding: 28, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              border: '1px solid rgba(0, 128, 128, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}>
              <Activity size={32} color="#6366f1" />
              <div style={{ fontWeight: 600, fontSize: '1.08rem', color: '#222', marginTop: 8 }}>Lab Reports</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#222', margin: '8px 0' }}>3</div>
              <Link to="/dashboard/lab-reports" style={{ color: '#008080', fontWeight: 500, fontSize: '1rem', marginTop: 8, textDecoration: 'none' }}>View all</Link>
            </div>

            <div className="stat-card" style={{ 
              flex: 1, 
              minWidth: 250,
              background: '#fff', 
              borderRadius: 16, 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', 
              padding: 28, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              border: '1px solid rgba(0, 128, 128, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}>
              <CheckCircle size={32} color="#22d3ee" />
              <div style={{ fontWeight: 600, fontSize: '1.08rem', color: '#222', marginTop: 8 }}>Completed Visits</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#222', margin: '8px 0' }}>{completedVisitsCount}</div>
              <Link to="/completed-visits" style={{ color: '#008080', fontWeight: 500, fontSize: '1rem', marginTop: 8, textDecoration: 'none' }}>View history</Link>
            </div>

            <div className="stat-card" style={{ 
              flex: 1, 
              minWidth: 250,
              background: '#fff', 
              borderRadius: 16, 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', 
              padding: 28, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              border: '1px solid rgba(0, 128, 128, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}>
              <MessageSquare size={32} color="#8b5cf6" />
              <div style={{ fontWeight: 600, fontSize: '1.08rem', color: '#222', marginTop: 8 }}>My Feedback</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#222', margin: '8px 0' }}>
                {feedbackLoading ? '...' : feedbackCount}
              </div>
              <Link to="/feedback" style={{ color: '#008080', fontWeight: 500, fontSize: '1rem', marginTop: 8, textDecoration: 'none' }}>View & manage</Link>
            </div>
          </div>
          <div className="content-section" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div className="content-card appointments-card" style={{ 
              flex: 2, 
              minWidth: 600,
              background: 'linear-gradient(135deg, #fff 0%, #fafbff 100%)', 
              borderRadius: 20, 
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', 
              border: '1px solid rgba(99, 102, 241, 0.1)',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ padding: '28px 32px', borderBottom: '1px solid rgba(0, 0, 0, 0.06)', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                <div style={{ fontWeight: 700, fontSize: '1.3rem', color: 'white', marginBottom: 0, display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: 10, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CalendarClock size={24} color="white" />
                  </div>
                  Upcoming Appointments
                  <span style={{ 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    color: 'white', 
                    padding: '4px 12px', 
                    borderRadius: 20, 
                    fontSize: '0.9rem', 
                    fontWeight: 600,
                    marginLeft: 'auto'
                  }}>
                    {upcomingAppointments.length} {upcomingAppointments.length === 1 ? 'appointment' : 'appointments'}
                  </span>
                  <button
                    onClick={handleRefreshAppointments}
                    disabled={refreshing}
                    title={lastRefreshed ? `Last refreshed at ${lastRefreshed.toLocaleTimeString()}` : 'Refresh appointments'}
                    style={{
                      marginLeft: 12,
                      background: 'rgba(255,255,255,0.25)',
                      backdropFilter: 'blur(2px)',
                      border: '1px solid rgba(255,255,255,0.4)',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '6px 10px',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: refreshing ? 'wait' : 'pointer',
                      opacity: refreshing ? 0.7 : 1,
                      transition: 'background .2s'
                    }}
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              </div>
              <div style={{ padding: '32px 32px 24px 32px' }}>
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: '#6b7280' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 20, height: 20, border: '2px solid #e5e7eb', borderTop: '2px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>Loading your appointments...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="error-message" style={{ 
                    color: '#dc2626', 
                    background: 'linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%)', 
                    border: '1px solid #fecaca', 
                    padding: '20px 24px', 
                    borderRadius: 16, 
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <div style={{ background: '#dc2626', width: 6, height: 6, borderRadius: '50%' }}></div>
                    {error}
                  </div>
                ) : upcomingAppointments.length > 0 ? upcomingAppointments.map((app, index) => (
                  <div key={app._id} className="appointment-item" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '10px 16px', 
                    borderBottom: index === upcomingAppointments.length - 1 ? 'none' : '1px solid rgba(0, 0, 0, 0.06)', 
                    transition: 'all 0.3s ease', 
                    borderRadius: 8, 
                    margin: '0 -32px 8px -32px', 
                    marginLeft: -32, 
                    marginRight: -32,
                    background: (app.status && app.status.toLowerCase().startsWith('cancel'))
                      ? 'linear-gradient(135deg,#f8fafc 0%, #f1f5f9 100%)'
                      : index === 0 ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' : 'transparent',
                    border: (app.status && app.status.toLowerCase().startsWith('cancel'))
                      ? '2px solid rgba(239,68,68,0.25)'
                      : index === 0 ? '2px solid rgba(59, 130, 246, 0.1)' : 'none',
                    opacity: (app.status && app.status.toLowerCase().startsWith('cancel')) ? 0.55 : 1,
                    filter: (app.status && app.status.toLowerCase().startsWith('cancel')) ? 'grayscale(0.4)' : 'none',
                    position: 'relative'
                  }}>
                    {index === 0 && (
                      <div style={{
                        position: 'absolute',
                        top: -4,
                        left: 12,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: 6,
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                      }}>
                        NEXT
                      </div>
                    )}
                    {app.status && app.status.toLowerCase().startsWith('cancel') && (
                      <div style={{
                        position: 'absolute',
                        top: -4,
                        right: 12,
                        background: 'linear-gradient(135deg,#dc2626,#b91c1c)',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: '0.55rem',
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        boxShadow: '0 4px 12px rgba(220,38,38,0.35)'
                      }}>
                        CANCELLED BY DOCTOR
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      {(() => {
                        // Handle both old and new appointment structures
                        const doctorName = app.doctor_name || app.doctor?.name
                          ? (app.doctor_name || app.doctor.name)
                          : (typeof app.doctor_id === 'object'
                            ? (app.doctor_id?.name || String(app.doctor_id?._id || 'Doctor'))
                            : String(app.doctor_id || 'Doctor'));
                        const avatar = app.doctor?.avatar || (typeof app.doctor_id === 'object' ? app.doctor_id?.avatar : null);
                        if (avatar) {
                          return (
                            <div style={{ position: 'relative' }}>
                              <img
                                onClick={() => navigate(`/patient/${(typeof app.patient_id === 'object' ? app.patient_id?._id : app.patient_id)}`)}
                                src={avatar}
                                alt={doctorName || 'Doctor'}
                                style={{ 
                                  width: 36, 
                                  height: 36, 
                                  borderRadius: '50%', 
                                  marginRight: 12, 
                                  cursor: 'pointer', 
                                  objectFit: 'cover', 
                                  border: '2px solid rgba(99, 102, 241, 0.2)', 
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                bottom: -1,
                                right: 10,
                                width: 10,
                                height: 10,
                                background: '#22c55e',
                                borderRadius: '50%',
                                border: '1px solid white',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                              }}></div>
                            </div>
                          );
                        }
                        return (
                          <div style={{ position: 'relative' }}>
                            <div
                              onClick={() => navigate(`/patient/${(typeof app.patient_id === 'object' ? app.patient_id?._id : app.patient_id)}`)}
                              title={doctorName || 'Doctor'}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                marginRight: 12,
                                cursor: 'pointer',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                border: '2px solid rgba(99, 102, 241, 0.2)',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              {getInitials(doctorName)}
                            </div>
                            <div style={{
                              position: 'absolute',
                              bottom: -1,
                              right: 10,
                              width: 10,
                              height: 10,
                              background: '#22c55e',
                              borderRadius: '50%',
                              border: '1px solid white',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                            }}></div>
                          </div>
                        );
                      })()}
                      <div style={{ flex: 1 }}>
                        <div
                          onClick={() => navigate(`/patient/${(typeof app.patient_id === 'object' ? app.patient_id?._id : app.patient_id)}`)}
                          style={{ fontWeight: 700, color: '#1f2937', fontSize: '0.95rem', cursor: 'pointer', transition: 'color 0.2s ease', marginBottom: 2 }}
                        >
                          {app.doctor_name || app.doctor?.name
                            ? (app.doctor_name || app.doctor.name)
                            : (typeof app.doctor_id === 'object'
                              ? (app.doctor_id?.name || String(app.doctor_id?._id || ''))
                              : String(app.doctor_id || ''))}
                        </div>
                        {((app.doctor_specialty || app.doctor && app.doctor.specialty) || (typeof app.doctor_id === 'object' && app.doctor_id?.specialty)) && (
                          <div style={{ 
                            color: '#6366f1', 
                            fontSize: '0.75rem', 
                            marginBottom: 4, 
                            fontWeight: 600,
                            background: 'rgba(99, 102, 241, 0.1)', 
                            padding: '1px 6px', 
                            borderRadius: 6, 
                            display: 'inline-block' 
                          }}>
                            {app.doctor_specialty || (app.doctor?.specialty) || (typeof app.doctor_id === 'object' ? app.doctor_id?.specialty : '')}
                          </div>
                        )}
                        <div style={{ 
                          color: '#374151', 
                          fontSize: '0.85rem', 
                          marginTop: 4, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 6,
                          background: 'rgba(249, 250, 251, 0.8)',
                          padding: '6px 10px',
                          borderRadius: 8,
                          border: '1px solid rgba(0, 0, 0, 0.05)'
                        }}>
                          <CalendarClock size={14} color="#6366f1" style={{ marginRight: 2 }} /> 
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {new Date(app.appointment_date || app.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                          <span style={{ color: '#9ca3af', margin: '0 2px' }}>•</span>
                          <span style={{ fontWeight: 600, color: '#6366f1', fontSize: '0.9rem' }}>
                            {app.appointment_time || app.time}
                          </span>
                          {typeof app.timing_status !== 'undefined' && app.timing_status && app.status && !app.status.toLowerCase().startsWith('cancel') && (
                            <span style={{
                              marginLeft: 8,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              letterSpacing: 0.5,
                              padding: '4px 8px',
                              borderRadius: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              background: app.timing_status === 'on-time' ? 'linear-gradient(135deg,#f1f5f9,#e2e8f0)' : (app.timing_status === 'early' ? 'linear-gradient(135deg,#ecfdf5,#d1fae5)' : 'linear-gradient(135deg,#fee2e2,#fecaca)'),
                              color: app.timing_status === 'on-time' ? '#334155' : (app.timing_status === 'early' ? '#047857' : '#b91c1c'),
                              border: '1px solid rgba(0,0,0,0.06)'
                            }} title={app.timing_status === 'on-time' ? 'Doctor expects to be on schedule' : app.timing_status === 'early' ? 'Doctor may see you earlier' : 'Doctor is delayed'}>
                              {app.timing_status === 'on-time' && 'ON TIME'}
                              {app.timing_status === 'early' && `EARLY (${Math.abs(app.timing_offset_minutes||0)}m)`}
                              {app.timing_status === 'late' && `DELAY (${app.timing_offset_minutes||0}m)`}
                            </span>
                          )}
                        </div>
                        {app.appointment_type && (
                          <div style={{ 
                            color: (app.status && app.status.toLowerCase().startsWith('cancel')) ? '#b91c1c' : '#059669', 
                            fontSize: '0.8rem', 
                            marginTop: 6, 
                            fontWeight: 600, 
                            background: (app.status && app.status.toLowerCase().startsWith('cancel'))
                              ? 'linear-gradient(135deg,#fee2e2 0%, #fecaca 100%)'
                              : 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)', 
                            padding: '3px 8px', 
                            borderRadius: 8, 
                            display: 'inline-block',
                            border: (app.status && app.status.toLowerCase().startsWith('cancel'))
                              ? '1px solid rgba(220,38,38,0.35)'
                              : '1px solid rgba(34, 197, 94, 0.2)'
                          }}>
                            {app.status && app.status.toLowerCase().startsWith('cancel') ? '🚫 ' : '📋 '}{app.appointment_type}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => navigate(`/appointment/${encodeURIComponent(app._id)}/prescriptions?patientId=${encodeURIComponent(app.patient_id || app.patient_ID || '')}`)}
                        style={{
                          background:'#075985',
                          color:'white',
                          border:'none',
                          borderRadius:6,
                          padding:'6px 10px',
                          fontSize:'0.65rem',
                          fontWeight:600,
                          letterSpacing:'.05em',
                          cursor:'pointer',
                          boxShadow:'0 2px 4px rgba(0,0,0,0.15)',
                          transition:'background .2s ease'
                        }}
                      >RX</button>
                      <div 
                        className="action-icon" 
                        style={{ 
                          cursor: 'pointer', 
                          padding: 4, 
                          borderRadius: 4, 
                          transition: 'all 0.2s ease', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          background: 'rgba(59, 130, 246, 0.06)',
                          border: 'none',
                          '&:hover': { 
                            backgroundColor: 'rgba(59, 130, 246, 0.12)', 
                            transform: 'scale(1.1)' 
                          }
                        }} 
                        title="View Details" 
                        onClick={() => navigate(`/appointment/${app._id}`)}
                      >
                        <Eye size={18} color="#3b82f6" style={{ verticalAlign: 'middle' }} />
                      </div>
                      <div 
                        className="action-icon" 
                        style={{ 
                          cursor: 'pointer', 
                          padding: 4, 
                          borderRadius: 4, 
                          transition: 'all 0.2s ease', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          background: 'rgba(251, 191, 36, 0.06)',
                          border: 'none',
                          '&:hover': { 
                            backgroundColor: 'rgba(251, 191, 36, 0.12)', 
                            transform: 'scale(1.1)' 
                          }
                        }} 
                        title="Reschedule" 
                        onClick={() => navigate(`/update?id=${app._id}`)}
                      >
                        <Pencil size={18} color="#f59e0b" style={{ verticalAlign: 'middle' }} />
                      </div>
                      <div 
                        className="action-icon" 
                        style={{ 
                          cursor: 'pointer', 
                          padding: 4, 
                          borderRadius: 4, 
                          transition: 'all 0.2s ease', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          background: 'rgba(239, 68, 68, 0.06)',
                          border: 'none',
                          '&:hover': { 
                            backgroundColor: 'rgba(239, 68, 68, 0.12)', 
                            transform: 'scale(1.1)' 
                          }
                        }} 
                        title="Cancel" 
                        onClick={() => navigate(`/delete?id=${app._id}`)}
                      >
                        <Trash2 size={18} color="#ef4444" style={{ verticalAlign: 'middle' }} />
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="empty-message" style={{ 
                    color: '#6b7280', 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                    border: '2px dashed #cbd5e1', 
                    padding: '40px 32px', 
                    borderRadius: 20, 
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 16
                  }}>
                    <div style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8
                    }}>
                      <CalendarClock size={40} color="#6366f1" />
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                      No upcoming appointments
                    </div>
                    <div style={{ fontSize: '1rem', color: '#6b7280', marginBottom: 16 }}>
                      Schedule your next appointment with one of our specialists
                    </div>
                    <Link to="/doctors" style={{ textDecoration: 'none' }}>
                      <button style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: 12,
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)'
                      }}>
                        Find a Doctor
                      </button>
                    </Link>
                  </div>
                )}
              </div>
              <div style={{ padding: '24px 32px', borderTop: '1px solid rgba(0, 0, 0, 0.06)', background: 'rgba(249, 250, 251, 0.5)' }}>
                <Link to="/doctors" style={{ textDecoration: 'none' }}>
                  <button className="professional-btn" style={{ 
                    width: '100%', 
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
                    color: 'white', 
                    border: 'none', 
                    padding: '16px 24px', 
                    borderRadius: 16, 
                    fontWeight: 700, 
                    fontSize: '1.1rem', 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <CalendarClock size={24} />
                    Schedule New Appointment
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                      pointerEvents: 'none'
                    }}></div>
                  </button>
                </Link>
              </div>
            </div>
            <div className="content-card prescriptions-card" style={{ 
              flex: 1, 
              minWidth: 350,
              background: '#fff', 
              borderRadius: 16, 
              boxShadow: '0 6px 25px rgba(0, 0, 0, 0.08)', 
              border: '1px solid rgba(0, 128, 128, 0.1)',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ padding: 24, borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontWeight: 600, fontSize: '1.15rem', color: '#222', marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={20} color="#008080" />
                  Recent Prescriptions
                </div>
              </div>
              <div style={{ padding: 24 }}>
                {!patientCode && (
                  <div style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: 8, padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, textAlign: 'center', fontStyle: 'italic' }}>Provide patient code in route to load prescriptions</div>
                )}
                {rxLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, color: '#6b7280' }}>
                    <span className="loading-spinner"></span>
                    Loading prescriptions...
                  </div>
                ) : rxError ? (
                  <div className="error-message" style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: 8, fontWeight: 500 }}>{rxError}</div>
                ) : recentPrescriptions.length > 0 ? recentPrescriptions.map(rx => (
                  <div key={rx.id} className="prescription-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0', transition: 'all 0.2s ease', borderRadius: 8, margin: '0 -24px', paddingLeft: 24, paddingRight: 24 }}>
                    <div>
                      <Link to={"#"} style={{ color: '#22c55e', fontWeight: 600, fontSize: '1.08rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>
                        {(rx.medicines && rx.medicines[0]?.name) || rx.diagnosis || 'Prescription'}
                      </Link>
                      <div style={{ color: '#555', fontSize: '1rem', marginTop: 2 }}>Prescribed by {rx.doctorName || '-'} on {rx.date ? new Date(rx.date).toLocaleDateString() : '-'}</div>
                    </div>
                    <div style={{ color: '#888', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CalendarClock size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} /> {rx.date ? new Date(rx.date).toLocaleDateString() : '-'}
                    </div>
                  </div>
                )) : (
                  <div className="empty-message" style={{ color: '#6b7280', background: '#f9fafb', border: '1px solid #e5e7eb', padding: 20, borderRadius: 8, textAlign: 'center', fontStyle: 'italic' }}>
                    {patientCode ? 'No recent prescriptions' : 'Provide patient code in route to load prescriptions'}
                  </div>
                )}
              </div>
              <div style={{ padding: 24, borderTop: '1px solid #f0f0f0' }}>
                <Link to="/dashboard/prescriptions">
                  <button className="secondary-btn" style={{ 
                    width: '100%', 
                    background: 'white', 
                    color: '#374151', 
                    border: '2px solid #e5e7eb', 
                    padding: '14px 24px', 
                    borderRadius: 12, 
                    fontWeight: 600, 
                    fontSize: '1.08rem', 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}>
                    View All Prescriptions
                  </button>
                </Link>
              </div>
            </div>
          </div>
    </PatientLayout>
  );
};

export default Dashboard;
