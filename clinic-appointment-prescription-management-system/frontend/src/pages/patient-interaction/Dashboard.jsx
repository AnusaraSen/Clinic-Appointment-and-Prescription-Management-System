import React, { useEffect, useState } from 'react';
import { CalendarClock, FileText, Activity, CheckCircle, Eye, Pencil, Trash2 } from 'lucide-react';
import Sidebar from '../../components/SidebarPatient';
import Topbar from '../../components/Topbar';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Patient-Interaction/Dashboard.css';

const Dashboard = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
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
        // Filter for upcoming appointments (date >= today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = (res.data || []).filter(app => {
          const appDate = new Date(app.date);
          appDate.setHours(0, 0, 0, 0);
          return appDate >= today;
        });
        // IMPORTANT: Do not override populated doctor provided by backend
        // The backend returns `doctor` (populated from doctor_id) already.
        setUpcomingAppointments(upcoming);
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220, minHeight: '100vh', background: '#f5f7fa' }}>
        <Topbar />

        <main style={{ padding: '4px 32px 32px 32px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontWeight: 700, fontSize: '2rem', color: '#222', marginBottom: 4 }}>Welcome back, <span style={{ color: '#008080' }}>John!</span></h1>
            <p style={{ color: '#555', fontSize: '1.1rem', margin: 0 }}>Here's an overview of your health information.</p>
          </div>

          <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
            <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,128,128,0.06)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CalendarClock size={32} color="#3b82f6" />
              <div style={{ fontWeight: 600, fontSize: '1.08rem', color: '#222', marginTop: 8 }}>Upcoming Appointments</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#222', margin: '8px 0' }}>{upcomingAppointments.length}</div>
              <Link to="/appointments" style={{ color: '#3b82f6', fontWeight: 500, fontSize: '1rem', marginTop: 8 }}>View all</Link>
            </div>

            <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,128,128,0.06)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FileText size={32} color="#22c55e" />
              <div style={{ fontWeight: 600, fontSize: '1.08rem', color: '#222', marginTop: 8 }}>Prescriptions</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#222', margin: '8px 0' }}>{recentPrescriptions.length}</div>
              <Link to="/dashboard/prescriptions" style={{ color: '#22c55e', fontWeight: 500, fontSize: '1rem', marginTop: 8 }}>View all</Link>
            </div>

            <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,128,128,0.06)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Activity size={32} color="#6366f1" />
              <div style={{ fontWeight: 600, fontSize: '1.08rem', color: '#222', marginTop: 8 }}>Lab Reports</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#222', margin: '8px 0' }}>3</div>
              <Link to="/dashboard/lab-reports" style={{ color: '#6366f1', fontWeight: 500, fontSize: '1rem', marginTop: 8 }}>View all</Link>
            </div>

            <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,128,128,0.06)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CheckCircle size={32} color="#22d3ee" />
              <div style={{ fontWeight: 600, fontSize: '1.08rem', color: '#222', marginTop: 8 }}>Completed Visits</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#222', margin: '8px 0' }}>12</div>
              <Link to="/appointments" style={{ color: '#22d3ee', fontWeight: 500, fontSize: '1rem', marginTop: 8 }}>View history</Link>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 2, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,128,128,0.06)', padding: 24 }}>
              <div style={{ fontWeight: 600, fontSize: '1.15rem', color: '#222', marginBottom: 18 }}>Upcoming Appointments</div>
              {loading ? (
                <div>Loading appointments...</div>
              ) : error ? (
                <div style={{ color: 'red' }}>{error}</div>
              ) : upcomingAppointments.length > 0 ? upcomingAppointments.map(app => (
                <div key={app._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {(() => {
                      const doctorName = app.doctor?.name
                        ? app.doctor.name
                        : (typeof app.doctor_id === 'object'
                          ? (app.doctor_id?.name || String(app.doctor_id?._id || 'Doctor'))
                          : String(app.doctor_id || 'Doctor'));
                      const avatar = app.doctor?.avatar || (typeof app.doctor_id === 'object' ? app.doctor_id?.avatar : null);
                      if (avatar) {
                        return (
                          <img
                            onClick={() => navigate(`/patient/${(typeof app.patient_id === 'object' ? app.patient_id?._id : app.patient_id)}`)}
                            src={avatar}
                            alt={doctorName || 'Doctor'}
                            style={{ width: 48, height: 48, borderRadius: '50%', marginRight: 14, cursor: 'pointer', objectFit: 'cover' }}
                          />
                        );
                      }
                      return (
                        <div
                          onClick={() => navigate(`/patient/${(typeof app.patient_id === 'object' ? app.patient_id?._id : app.patient_id)}`)}
                          title={doctorName || 'Doctor'}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            marginRight: 14,
                            cursor: 'pointer',
                            background: '#e0f2f1',
                            color: '#008080',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                          }}
                        >
                          {getInitials(doctorName)}
                        </div>
                      );
                    })()}
                    <div>
                      <div
                        onClick={() => navigate(`/patient/${(typeof app.patient_id === 'object' ? app.patient_id?._id : app.patient_id)}`)}
                        style={{ fontWeight: 700, color: '#008080', fontSize: '1.08rem', cursor: 'pointer' }}
                      >
                        {app.doctor?.name
                          ? app.doctor.name
                          : (typeof app.doctor_id === 'object'
                            ? (app.doctor_id?.name || String(app.doctor_id?._id || ''))
                            : String(app.doctor_id || ''))}
                      </div>
                      {((app.doctor && app.doctor.specialty) || (typeof app.doctor_id === 'object' && app.doctor_id?.specialty)) && (
                        <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                          {(app.doctor?.specialty) || (typeof app.doctor_id === 'object' ? app.doctor_id?.specialty : '')}
                        </div>
                      )}
                      <div style={{ color: '#555', fontSize: '1rem', marginTop: 2 }}>
                        <CalendarClock size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} /> {new Date(app.date).toLocaleDateString()} at {app.time}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end' }}>
                    <span style={{ cursor: 'pointer' }} title="View" onClick={() => navigate(`/appointment/${app._id}`)}>
                      <Eye size={22} color="#3b82f6" style={{ verticalAlign: 'middle' }} />
                    </span>
                    <span style={{ cursor: 'pointer' }} title="Update" onClick={() => navigate(`/update?id=${app._id}`)}>
                      <Pencil size={22} color="#fbbf24" style={{ verticalAlign: 'middle' }} />
                    </span>
                    <span style={{ cursor: 'pointer' }} title="Delete" onClick={() => navigate(`/delete?id=${app._id}`)}>
                      <Trash2 size={22} color="#ef4444" style={{ verticalAlign: 'middle' }} />
                    </span>
                  </div>
                </div>
              )) : <div style={{ color: '#888' }}>No upcoming appointments</div>}
              <Link to="/doctors"><button style={{ width: '100%', marginTop: '18px', background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: '1.08rem', borderRadius: 8, border: 'none', padding: '12px 0', cursor: 'pointer' }}>Schedule New Appointment</button></Link>
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,128,128,0.06)', padding: 24 }}>
              <div style={{ fontWeight: 600, fontSize: '1.15rem', color: '#222', marginBottom: 18 }}>Recent Prescriptions</div>
              {!patientCode && (
                <div style={{ color: '#888', fontSize: '0.95rem', marginBottom: 8 }}>Provide patient code in route to load prescriptions</div>
              )}
              {rxLoading ? (
                <div>Loading prescriptions...</div>
              ) : rxError ? (
                <div style={{ color: 'red' }}>{rxError}</div>
              ) : recentPrescriptions.length > 0 ? recentPrescriptions.map(rx => (
                <div key={rx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div>
                    <Link to={"#"} style={{ color: '#22c55e', fontWeight: 600, fontSize: '1.08rem', textDecoration: 'none' }}>
                      {(rx.medicines && rx.medicines[0]?.name) || rx.diagnosis || 'Prescription'}
                    </Link>
                    <div style={{ color: '#555', fontSize: '1rem', marginTop: 2 }}>Prescribed by {rx.doctorName || '-'} on {rx.date ? new Date(rx.date).toLocaleDateString() : '-'}</div>
                  </div>
                  <div style={{ color: '#888', fontSize: '0.98rem', display: 'flex', alignItems: 'center' }}><CalendarClock size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} /> {rx.date ? new Date(rx.date).toLocaleDateString() : '-'}</div>
                </div>
              )) : <div style={{ color: '#888' }}>{patientCode ? 'No recent prescriptions' : 'Provide patient code in route to load prescriptions'}</div>}
              <Link to="/dashboard/prescriptions"><button style={{ width: '100%', marginTop: '18px', background: '#fff', color: '#222', fontWeight: 600, fontSize: '1.08rem', borderRadius: 8, border: '1px solid #e0e0e0', padding: '12px 0', cursor: 'pointer' }}>View All Prescriptions</button></Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;