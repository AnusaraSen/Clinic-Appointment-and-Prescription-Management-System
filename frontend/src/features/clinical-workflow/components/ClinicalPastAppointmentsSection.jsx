import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../../authentication/context/AuthContext.jsx';
import { getDoctorAppointments, getDoctorAppointmentsByName, getAllAppointments } from '../../../api/appointmentsApi.js';
import axios from 'axios';

// Simple star renderer for ratings (0-5)
function Stars({ value = 0 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span aria-label={`Rating ${v} of 5`} className="inline-flex">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill={i < v ? '#f59e0b' : 'none'}
          stroke={i < v ? '#f59e0b' : '#d1d5db'}
          className="inline w-4 h-4 mr-0.5"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.036a1 1 0 00-1.176 0l-2.802 2.036c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81H6.93a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}
import FeedbackViewerModal from './FeedbackViewerModal.jsx';

export const ClinicalPastAppointmentsSection = () => {
  const { user } = useAuth() || {};
  const doctorId = user?._id;
  const doctorName = user?.name;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fbOpen, setFbOpen] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);
  const [fbError, setFbError] = useState('');
  const [fbItems, setFbItems] = useState([]);
  const [fbApptId, setFbApptId] = useState(null);
  const [viewing, setViewing] = useState(null);

  const toYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  };

  // Parse date in common formats: YYYY-MM-DD, YYYY/MM/DD, DD/MM/YYYY, MM/DD/YYYY, or Date-compatible
  const parseDateSafe = (val) => {
    if (!val) return new Date(NaN);
    if (val instanceof Date) return val;
    const s = String(val).trim();
    // YYYY-MM-DD or YYYY/MM/DD
    let m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/);
    if (m) {
      const y = parseInt(m[1],10), mo = parseInt(m[2],10)-1, d = parseInt(m[3],10);
      const dt = new Date(y, mo, d);
      dt.setHours(0,0,0,0);
      return dt;
    }
    // DD/MM/YYYY
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
      const d = parseInt(m[1],10), mo = parseInt(m[2],10)-1, y = parseInt(m[3],10);
      const dt = new Date(y, mo, d);
      dt.setHours(0,0,0,0);
      return dt;
    }
    // Fallback to Date parsing
    const dt = new Date(s);
    dt.setHours(0,0,0,0);
    return dt;
  };

  const load = async () => {
    setLoading(true); setError('');
    try {
      const today = new Date(); today.setHours(0,0,0,0);
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1);
      const wideStart = '1970-01-01';
      const end = toYMD(yesterday);
      let data = [];
      if (doctorId) {
        try { data = await getDoctorAppointments({ doctorId, start: wideStart, end }); } catch(_) {}
      }
      if ((!data || data.length===0) && doctorName) {
        try { data = await getDoctorAppointmentsByName({ doctorName, start: wideStart, end, loose: true }); } catch(_) {}
      }
      if ((!data || data.length===0) && (doctorId || doctorName)) {
        try {
          const all = await getAllAppointments();
          const lowered = (doctorName||'').toLowerCase();
          const norm = (n)=> String(n||'').toLowerCase().replace(/^dr\.?\s+/,'');
          data = (all||[]).filter(a => {
            const d = parseDateSafe(a.appointment_date||a.date);
            const isPast = d.getTime() < today.getTime();
            const did = String(a.doctor_id || a.doctorId || a.doctor?._id || '').trim();
            const dname = norm(a.doctor_name || a.doctorName || (a.doctor && a.doctor.name));
            const idMatch = doctorId && String(did) === String(doctorId);
            const nameMatch = lowered ? (dname.includes(norm(doctorName))) : false;
            return isPast && (idMatch || nameMatch);
          });
        } catch(_){}
      }
      const normalized = (data||[]).map(a => {
        const d = parseDateSafe(a.appointment_date || a.date);
        // derive display status for consistency
        const baseStatus = a.status || 'upcoming';
        const displayStatus = baseStatus === 'completed' ? 'completed' : baseStatus?.toLowerCase()?.startsWith('cancel') ? baseStatus : 'past';
        return {
          id: a._id,
          dateObj: d,
          date: toYMD(d),
          time: a.appointment_time,
          patient: a.patient_name || 'Unknown',
          type: a.appointment_type || 'Consultation',
          status: baseStatus,
          displayStatus
        };
      })
      // Newest dates first, then latest times first within date
      .sort((a,b)=> (b.dateObj - a.dateObj) || b.time.localeCompare(a.time));
      setItems(normalized);
    } catch (e) {
      setError(e?.message || 'Failed to load past appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); }, [doctorId, doctorName]);

  const grouped = useMemo(()=>{
    return items.reduce((acc,a)=> { (acc[a.date] ||= []).push(a); return acc; }, {});
  }, [items]);

  const sortedDatesDesc = useMemo(()=> Object.keys(grouped).sort((a,b)=> b.localeCompare(a)), [grouped]);

  const fetchFeedbackByAppointment = async (appointmentId) => {
    const urls = [
      `/feedback/by-appointment/${appointmentId}`,
      `http://localhost:5000/feedback/by-appointment/${appointmentId}`,
      `http://127.0.0.1:5000/feedback/by-appointment/${appointmentId}`,
      `/feedback/`,
      `http://localhost:5000/feedback/`,
    ];
    let lastErr = null;
    for (const url of urls) {
      try {
        const res = await axios.get(url, { timeout: 7000 });
        if (res?.data?.feedback) {
          return Array.isArray(res.data.feedback) ? res.data.feedback : [res.data.feedback];
        }
        if (Array.isArray(res?.data)) {
          // Fallback: filter all feedback by appointment id
          return res.data.filter(f => {
            const id = f.appointment?._id || (typeof f.appointment_id === 'string' ? f.appointment_id : f.appointment_id?._id);
            return id && String(id) === String(appointmentId);
          });
        }
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Unable to fetch feedback');
  };

  const openFeedback = async (appointmentId) => {
    setFbOpen(true); setFbLoading(true); setFbError(''); setFbItems([]); setFbApptId(appointmentId);
    try {
      const list = await fetchFeedbackByAppointment(appointmentId);
      setFbItems(list);
    } catch (e) { setFbError(e?.message || 'Failed to load feedback'); }
    finally { setFbLoading(false); }
  };

  return (
    <div id="past-appointments" className="cd-card" role="region" aria-label="Past Appointments">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100"><Calendar className="h-5 w-5 text-gray-600"/></div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Past Appointments</h2>
            <p className="text-xs text-gray-500">Before today • {items.length} total</p>
          </div>
        </div>
        <button onClick={load} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Refresh</button>
      </div>
      {loading && <div className="text-gray-500 text-sm">Loading…</div>}
      {error && !loading && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded">{error}</div>
      )}
      {!loading && items.length===0 && !error && (
        <div className="text-center py-10 border border-dashed border-gray-200 rounded-lg">
          <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No past appointments</p>
          <p className="text-gray-400 text-xs">Past appointments will appear here</p>
        </div>
      )}

      <div className="space-y-6">
        {sortedDatesDesc.map(date => (
          <div key={date} className="border rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 text-sm font-semibold flex items-center justify-between">
              <span>{date}</span>
              <span className="text-xs text-gray-500">{grouped[date].length} appointment(s)</span>
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-white border-b">
                <tr className="text-left">
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">Patient</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {grouped[date]
                  .slice()
                  .sort((a,b)=> b.time.localeCompare(a.time))
                  .map(a => (
                  <tr key={a.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs flex items-center gap-1"><Clock className="h-3 w-3"/>{a.time}</td>
                    <td className="px-4 py-2 flex items-center gap-2"><User className="h-3 w-3 text-gray-500"/><span>{a.patient}</span></td>
                    <td className="px-4 py-2">{a.type}</td>
                    <td className="px-4 py-2"><span className={`px-2 py-1 rounded text-xs ${a.displayStatus==='completed' ? 'bg-green-100 text-green-700' : a.displayStatus==='past' ? 'bg-amber-100 text-amber-700' : a.displayStatus?.toLowerCase()?.startsWith('cancel') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{a.displayStatus}</span></td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={()=> setViewing(a)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700"
                        title="View feedback for this appointment"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        View Feedback
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Feedback Modal */}
      {fbOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={()=>setFbOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Feedback for appointment</h3>
              <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{fbApptId}</code>
            </div>
            {fbLoading && <div className="text-sm text-gray-500">Loading…</div>}
            {fbError && !fbLoading && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-2">{fbError}</div>}
            {!fbLoading && !fbError && fbItems.length === 0 && (
              <div className="text-sm text-gray-600">No feedback found for this appointment.</div>
            )}
            {!fbLoading && !fbError && fbItems.length > 0 && (
              <div className="space-y-3 max-h-80 overflow-auto pr-1">
                {fbItems.map(f => (
                  <div key={f._id} className="border rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Stars value={f.rating} />
                      <span className="text-sm text-gray-600">({typeof f.rating !== 'undefined' ? `${f.rating}/5` : '—'})</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="text-gray-600 font-medium">Comments:</span>
                      <div className="mt-1 border rounded p-2 text-gray-800">{f.comments || '—'}</div>
                    </div>
                    {f.created_at && <div className="text-[11px] text-gray-500 mt-2">Created: {new Date(f.created_at).toLocaleString()}</div>}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 text-right">
              <button onClick={()=>setFbOpen(false)} className="px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
        )}
      {viewing && (
        <FeedbackViewerModal appointment={viewing} onClose={()=> setViewing(null)} />
      )}
    </div>
  );
};

export default ClinicalPastAppointmentsSection;
