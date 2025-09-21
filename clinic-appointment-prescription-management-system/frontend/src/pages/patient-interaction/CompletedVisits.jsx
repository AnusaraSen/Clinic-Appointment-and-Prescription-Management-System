import React, { useState, useEffect } from 'react';
import { Eye, MessageSquare, Calendar, Clock, User, UserCheck } from 'lucide-react';
import Sidebar from '../../components/SidebarPatient';
import Topbar from '../../components/Topbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Patient-Interaction/CompletedVisits.css';

const CompletedVisits = () => {
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const getInitials = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return 'Dr';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase() || 'DR';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  useEffect(() => {
    const fetchCompletedAppointments = async () => {
      setLoading(true);
      setError("");
      try {
        // Try multiple endpoints to avoid 404s
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
          throw lastErr || new Error("No valid response");
        }

        // Filter for completed appointments (past dates)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const completed = (res.data || [])
          .filter(app => {
            const appDate = new Date(app.appointment_date || app.date);
            appDate.setHours(0, 0, 0, 0);
            return appDate < today; // Past appointments
          })
          .sort((a, b) => {
            // Sort by date in descending order (most recent first)
            const dateA = new Date(a.appointment_date || a.date);
            const dateB = new Date(b.appointment_date || b.date);
            return dateB - dateA;
          });

        setCompletedAppointments(completed);
      } catch (err) {
        const msg = err?.response?.data || err?.message || "Failed to load completed appointments";
        setError(`Failed to load completed appointments: ${msg}`);
      }
      setLoading(false);
    };

    fetchCompletedAppointments();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220, minHeight: '100vh', background: 'transparent' }}>
        <Topbar />

        <main style={{ padding: '84px 32px 32px 32px', maxWidth: 1400, margin: '0 auto', minHeight: 'calc(100vh - 84px)' }}>
          {/* Header */}
          <div style={{ 
            marginBottom: 32, 
            padding: '32px 40px', 
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
            borderRadius: 16, 
            color: 'white',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <h1 style={{ fontWeight: 700, fontSize: '2.2rem', color: 'white', marginBottom: 8, margin: '0 0 8px 0' }}>
              Completed Visits
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '1.1rem', margin: 0, opacity: 0.9 }}>
              Review your past appointments and provide feedback
            </p>
          </div>

          {/* Content */}
          <div style={{ 
            background: 'linear-gradient(135deg, #fff 0%, #fafbff 100%)', 
            borderRadius: 20, 
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', 
            border: '1px solid rgba(99, 102, 241, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '28px 32px', borderBottom: '1px solid rgba(0, 0, 0, 0.06)', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <div style={{ fontWeight: 700, fontSize: '1.3rem', color: 'white', marginBottom: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: 10, borderRadius: 12 }}>
                  <Calendar size={24} />
                </div>
                Completed Appointments ({completedAppointments.length})
              </div>
            </div>

            <div style={{ padding: '24px 32px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <div style={{ fontSize: '1.1rem', marginBottom: 8 }}>Loading completed appointments...</div>
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ef4444' }}>
                  <div style={{ fontSize: '1.1rem', marginBottom: 8 }}>{error}</div>
                </div>
              ) : completedAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>No completed visits yet</div>
                  <div style={{ fontSize: '1rem' }}>Your past appointments will appear here after completion</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {completedAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: 16,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        borderRadius: 12,
                        border: '1px solid rgba(99, 102, 241, 0.1)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                      }}
                    >
                      {/* Doctor Avatar */}
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        marginRight: 16,
                        flexShrink: 0
                      }}>
                        {getInitials(appointment.doctor_name || appointment.doctor?.name)}
                      </div>

                      {/* Appointment Details */}
                      <div style={{ flex: 1, marginRight: 16 }}>
                        <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#1e293b', marginBottom: 4 }}>
                          Dr. {appointment.doctor_name || appointment.doctor?.name || 'Unknown Doctor'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.9rem', color: '#64748b' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={14} />
                            {formatDate(appointment.appointment_date || appointment.date)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={14} />
                            {formatTime(appointment.appointment_time || appointment.time)}
                          </div>
                          {appointment.reason && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <User size={14} />
                              {appointment.reason}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                          onClick={() => navigate(`/appointments/${appointment._id}`)}
                          style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: 'none',
                            borderRadius: 8,
                            padding: 8,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(99, 102, 241, 0.2)';
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(99, 102, 241, 0.1)';
                            e.target.style.transform = 'scale(1)';
                          }}
                          title="View Details"
                        >
                          <Eye size={16} color="#6366f1" />
                        </button>
                        <button
                          onClick={() => navigate(`/add-feedback?appointmentId=${appointment._id}`)}
                          style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: 'none',
                            borderRadius: 8,
                            padding: 8,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(34, 197, 94, 0.2)';
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(34, 197, 94, 0.1)';
                            e.target.style.transform = 'scale(1)';
                          }}
                          title="Give Feedback"
                        >
                          <MessageSquare size={16} color="#22c55e" />
                        </button>
                      </div>

                      {/* Status Badge */}
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(34, 197, 94, 0.1)',
                        color: '#22c55e',
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}>
                        Completed
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompletedVisits;