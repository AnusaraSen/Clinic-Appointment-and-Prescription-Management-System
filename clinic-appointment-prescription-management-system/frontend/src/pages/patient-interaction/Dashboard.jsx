import React, { useEffect, useState } from 'react';
import { CalendarClock, FileText, Activity, CheckCircle, Eye, Pencil, Trash2 } from 'lucide-react';
import Sidebar from '../../components/SidebarPatient';
import Topbar from '../../components/Topbar';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Patient-Interaction/Dashboard.css';

const Dashboard = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [completedVisitsCount, setCompletedVisitsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Prescriptions state
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [rxLoading, setRxLoading] = useState(false);
  const [rxError, setRxError] = useState("");
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

  useEffect(() => {
    const fetchAppointments = async () => {
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
            // Use appointment_date field instead of date
            const appDate = new Date(app.appointment_date || app.date);
            appDate.setHours(0, 0, 0, 0);
            return appDate >= today; // Future appointments
          })
          .sort((a, b) => {
            // Sort by appointment_date in ascending order (soonest first)
            const dateA = new Date(a.appointment_date || a.date);
            const dateB = new Date(b.appointment_date || b.date);
            return dateA - dateB;
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
        const first = upcoming[0];
        const pid = first ? (typeof first.patient_id === 'object' ? first.patient_id?._id : first.patient_id) : null;
        if (pid) localStorage.setItem('patientId', pid);
      } catch (err) {
        const msg = err?.response?.data || err?.message || "Failed to load appointments";
        setError(`Failed to load appointments: ${msg}`);
      }
      setLoading(false);
    };
    fetchAppointments();
  }, []);
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220, minHeight: '100vh', background: 'transparent' }}>
        <Topbar />

        <main style={{ padding: '84px 32px 32px 32px', maxWidth: 1400, margin: '0 auto', minHeight: 'calc(100vh - 84px)' }}>
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
              Welcome back, <span className="welcome-name" style={{ color: '#fef9c3', textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>John!</span>
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
              <Link to="/appointments" style={{ color: '#008080', fontWeight: 500, fontSize: '1rem', marginTop: 8, textDecoration: 'none' }}>View all</Link>
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
                <div style={{ fontWeight: 700, fontSize: '1.3rem', color: 'white', marginBottom: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
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
                    background: index === 0 ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' : 'transparent',
                    border: index === 0 ? '2px solid rgba(59, 130, 246, 0.1)' : 'none',
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
                        </div>
                        {app.appointment_type && (
                          <div style={{ 
                            color: '#059669', 
                            fontSize: '0.8rem', 
                            marginTop: 6, 
                            fontWeight: 600, 
                            background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)', 
                            padding: '3px 8px', 
                            borderRadius: 8, 
                            display: 'inline-block',
                            border: '1px solid rgba(34, 197, 94, 0.2)'
                          }}>
                            📋 {app.appointment_type}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 3, alignItems: 'center', justifyContent: 'flex-end' }}>
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
        </main>
      </div>
    </div>
  
  );
};

export default Dashboard;