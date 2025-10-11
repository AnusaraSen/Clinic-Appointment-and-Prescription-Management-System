import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PatientLayout } from '../components/PatientLayout';

function Stars({ value=0 }) {
  const v = Math.max(0, Math.min(5, Number(value)||0));
  return (
    <span aria-label={`Rating ${v} of 5`}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={i < v ? '#f59e0b' : 'none'} stroke={i < v ? '#f59e0b' : '#d1d5db'} className="inline w-4 h-4 mr-0.5">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.036a1 1 0 00-1.176 0l-2.802 2.036c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81H6.93a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function MyFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const justAdded = params.get('justAdded') === '1';
  const focusAppointmentId = params.get('appointmentId');
  const [highlightId, setHighlightId] = useState(null);

  // Accept patient identity hints to filter client-side if backend isn't session-filtered
  const currentPatientIds = useMemo(() => {
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
  }, []);

  const endpoints = [
    '/feedback/',
    'http://localhost:5000/feedback/',
    'http://127.0.0.1:5000/feedback/',
  ];

  const fetchAll = async () => {
    setLoading(true); setError('');
    let lastErr = null;
    for (const url of endpoints) {
      try {
        const res = await axios.get(url, { timeout: 7000 });
        if (Array.isArray(res.data)) return res.data;
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Unable to fetch feedback');
  };

  const fetchAppointment = async (id) => {
    if (!id) return null;
    const urls = [
      `/appointment/get/${id}`,
      `http://localhost:5000/appointment/get/${id}`,
      `http://127.0.0.1:5000/appointment/get/${id}`,
    ];
    for (const url of urls) {
      try { const res = await axios.get(url, { timeout: 7000 }); if (res?.data?.appointment) return res.data.appointment; } catch(_e) {}
    }
    return null;
  };

  const load = async () => {
    try {
      const raw = await fetchAll();
      // Build IDs and resolve missing appointment details
      const ids = Array.from(new Set(raw.map(f => {
        const a = f.appointment_id;
        return (a && typeof a === 'object' && a._id) ? String(a._id) : (typeof a === 'string' ? a : null);
      }).filter(Boolean)));
      const detailPairs = await Promise.all(ids.map(async id => [id, await fetchAppointment(id)]));
      const byAppt = new Map(detailPairs);

      // Merge
      const merged = raw.map(f => {
        const a = f.appointment || f.appointment_id;
        const id = f.appointment?._id || (a && typeof a === 'object' && a._id) ? String((f.appointment?._id) || a._id) : (typeof f.appointment_id === 'string' ? f.appointment_id : (typeof a === 'string' ? a : null));
        const appt = f.appointment || ((a && typeof a === 'object' && a._id) ? a : (byAppt.get(id) || null));
        return { ...f, _appointment: appt, _appointmentId: id };
      });

      // Filter per patient if we can infer identity locally
      let visible = currentPatientIds.size === 0 ? merged : merged.filter(f => {
        const pid = f?._appointment?.patient_id;
        return pid ? currentPatientIds.has(String(pid)) : false;
      });
      // If filtering removes all items but a focus appointment is present (just added), fall back to show it
      if (visible.length === 0 && focusAppointmentId) {
        visible = merged.filter(f => f._appointmentId === focusAppointmentId);
      }

      // Prefer showing the just-added appointment's feedback first if provided
  let arranged = visible.sort((a,b)=> new Date(b.created_at||b.createdAt||0) - new Date(a.created_at||a.createdAt||0));
      if (focusAppointmentId) {
        arranged = arranged.slice().sort((a,b) => {
          const aMatch = (a._appointmentId === focusAppointmentId) ? 1 : 0;
          const bMatch = (b._appointmentId === focusAppointmentId) ? 1 : 0;
          if (aMatch !== bMatch) return bMatch - aMatch; // move matching ones to top
          return 0;
        });
        setHighlightId(focusAppointmentId);
        // Clear highlight after a short delay for UX
        setTimeout(()=> setHighlightId(null), 4000);
      }
      setItems(arranged);
      // If nothing visible but we have a focusAppointmentId, try a narrow fetch-by-appointment fallback
      if (arranged.length === 0 && focusAppointmentId) {
        try {
          const urls = [
            `/feedback/by-appointment/${focusAppointmentId}`,
            `http://localhost:5000/feedback/by-appointment/${focusAppointmentId}`,
            `http://127.0.0.1:5000/feedback/by-appointment/${focusAppointmentId}`,
          ];
          for (const url of urls) {
            try {
              const r = await axios.get(url, { timeout: 6000 });
              if (r?.data?.feedback) {
                const fb = r.data.feedback;
                const appt = await fetchAppointment(fb.appointment_id?._id || fb.appointment_id);
                setItems([{ ...fb, _appointment: appt || fb.appointment_id, _appointmentId: appt?._id || (fb.appointment_id?._id || fb.appointment_id) }]);
                break;
              }
            } catch (_) {}
          }
        } catch (_) {}
      }
    } catch (e) { setError(e?.message || 'Failed to load feedback'); }
    finally { setLoading(false); }
  };

  useEffect(()=> { load(); }, []);

  return (
    <PatientLayout currentPage="feedback">
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">My Feedback</h1>
              {!loading && (
                <span title="Total feedback count" className="inline-flex items-center justify-center px-2 py-0.5 text-sm font-semibold rounded-full border border-gray-200 bg-gray-50 text-gray-800 shadow-sm">
                  {items.length}
                </span>
              )}
            </div>
            <p className="text-gray-500">Your submitted feedback and ratings</p>
          </div>
          <div className="space-x-2">
            <button onClick={load} className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50 text-sm">Refresh</button>
          </div>
        </div>

        {loading && <div className="p-6 text-gray-500">Loading…</div>}
        {error && !loading && <div className="p-4 border border-red-200 bg-red-50 rounded text-red-700 text-sm mb-4">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="p-10 text-center text-gray-600 border border-dashed rounded bg-gray-50">No feedback found.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(f => {
            const a = f._appointment || {};
            const patientName = f.patient_name || a.patient_name || a.patient_id || '—';
            const doctorName = f.doctor_name || a.doctor_name || a.doctor_id || '—';
            const dateVal = f.appointment_date || a.appointment_date;
            const created = f.created_at ? new Date(f.created_at) : null;
            const apptDate = dateVal ? new Date(dateVal) : null;
            return (
              <div key={f._id} className={`border rounded-lg shadow-sm p-4 ${highlightId && f._appointmentId===highlightId ? 'bg-emerald-50 border-emerald-300' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-500">Appointment</div>
                  <code className={`px-2 py-0.5 rounded text-xs ${f._appointmentId ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{f._appointmentId || 'Not provided'}</code>
                </div>
                <div className="text-sm text-gray-700 mb-1">
                  <span className="text-gray-500">Date:</span> {apptDate ? apptDate.toLocaleDateString() : '—'}
                </div>
                <div className="text-sm text-gray-700">
                  <span className="text-gray-500">Patient:</span> {patientName}
                </div>
                <div className="text-sm text-gray-700 mb-3">
                  <span className="text-gray-500">Doctor:</span> {doctorName}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Stars value={f.rating} />
                  <span className="text-sm text-gray-600">({f.rating}/5)</span>
                </div>
                <div className="text-gray-800 text-sm mb-2"><span className="text-teal-700 font-medium">Comments:</span> {f.comments || '—'}</div>
                {created && <div className="text-xs text-gray-500">Created: {created.toLocaleString()}</div>}
                {/* Actions */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    className="px-2.5 py-1.5 text-xs rounded border border-teal-200 text-teal-700 hover:bg-teal-50"
                    onClick={() => navigate(`/feedback/update?id=${encodeURIComponent(f._id)}${f._appointmentId ? `&appointmentId=${encodeURIComponent(f._appointmentId)}` : ''}`)}
                    title="Update this feedback"
                  >
                    Update
                  </button>
                  <button
                    className="px-2.5 py-1.5 text-xs rounded border border-rose-200 text-rose-700 hover:bg-rose-50"
                    onClick={() => navigate(`/feedback/delete?id=${encodeURIComponent(f._id)}${f._appointmentId ? `&appointmentId=${encodeURIComponent(f._appointmentId)}` : ''}`)}
                    title="Delete this feedback"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PatientLayout>
  );
}
