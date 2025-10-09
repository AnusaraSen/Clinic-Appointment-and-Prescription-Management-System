import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getDoctorAppointments, getDoctorAppointmentsByName, getAllAppointments, cancelAppointment, updateAppointmentTiming } from '../../../api/appointmentsApi.js';
// Adjusted relative path: this file is at src/features/clinical-workflow/pages
// AuthContext lives at src/features/authentication/context/AuthContext.jsx
import { useAuth } from '../../authentication/context/AuthContext.jsx';

/* DoctorAppointmentsPage
   Lists all appointments for the logged-in doctor (doctor_id match) sorted by date/time.
   Falls back to doctor name filtering if doctor_id missing.
*/
export default function DoctorAppointmentsPage() {
  const { user } = useAuth() || {}; // user may contain _id, name, role
  const doctorId = user?._id;
  const doctorName = user?.name;
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastLoadedAt, setLastLoadedAt] = useState(null);

  const [fetchPath, setFetchPath] = useState(null); // debug: which path succeeded
  const [cancellingId, setCancellingId] = useState(null);
  const [editingTimingId, setEditingTimingId] = useState(null);
  const [tempOffset, setTempOffset] = useState(0);
  const [savingTiming, setSavingTiming] = useState(false);

  const handleCancel = async (appt) => {
    if (!window.confirm('Cancel this appointment?')) return;
    setCancellingId(appt.id);
    try {
      await cancelAppointment(appt.id.replace('appt-',''), { actor: user?._id || 'doctor', reason: 'Cancelled by doctor' });
      await load();
    } catch (e) {
      alert('Cancel failed: ' + e.message);
    } finally {
      setCancellingId(null);
    }
  };

  const load = async () => {
    if (!doctorId && !doctorName) { setError('No doctor identity available'); setLoading(false); return; }
    setLoading(true); setError(null); setFetchPath(null);
    try {
      const wideStart = '2020-01-01';
      const wideEnd = '2099-12-31';
      let data = [];
      // 1. Attempt by doctorId (if available)
      if (doctorId) {
        try {
          data = await getDoctorAppointments({ doctorId, start: wideStart, end: wideEnd });
          if (Array.isArray(data) && data.length > 0) {
            setFetchPath('by-id');
          }
        } catch (e) {
          console.debug('[DoctorAppointmentsPage] by-id fetch failed', e.message);
        }
      }
      // 2. If empty, attempt by doctor name (loose regex)
      if ((!data || data.length === 0) && doctorName) {
        try {
          const byName = await getDoctorAppointmentsByName({ doctorName, start: wideStart, end: wideEnd, loose: true });
          if (Array.isArray(byName) && byName.length > 0) {
            data = byName;
            setFetchPath('by-name');
          }
        } catch (e) {
          console.debug('[DoctorAppointmentsPage] by-name fetch failed', e.message);
        }
      }
      // 3. If still empty, fetch all and filter locally (case-insensitive contains)
      if ((!data || data.length === 0) && doctorName) {
        try {
          const all = await getAllAppointments();
          const lowered = doctorName.toLowerCase();
            const filtered = (all||[]).filter(a => (a.doctor_name||'').toLowerCase().includes(lowered));
          if (filtered.length > 0) {
            data = filtered;
            setFetchPath('all+filter');
          }
        } catch (e) {
          console.debug('[DoctorAppointmentsPage] all+filter fetch failed', e.message);
        }
      }
      // If still nothing, leave empty but set path attempted summary
      if (!fetchPath && (!data || data.length === 0)) {
        setFetchPath(doctorId ? 'attempted: id > name > all' : 'attempted: name > all');
      }
      const normalized = (data||[]).map(a => {
        const d = new Date(a.appointment_date);
        return {
          id: a._id,
          patient: a.patient_name || 'Unknown',
          dateObj: d,
          date: d.toISOString().split('T')[0],
          time: a.appointment_time,
          type: a.appointment_type,
          status: a.status,
          timing_offset_minutes: a.timing_offset_minutes ?? 0,
          timing_status: a.timing_status || 'on-time',
          raw: a
        };
      }).sort((a,b)=> a.dateObj - b.dateObj || a.time.localeCompare(b.time));
      setAppointments(normalized);
      setLastLoadedAt(new Date());
    } catch (err) {
      console.error('[DoctorAppointmentsPage] load failed', err);
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=> { load(); // initial
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, doctorName]);

  const grouped = useMemo(()=> {
    return appointments.reduce((acc,a)=> { (acc[a.date] ||= []).push(a); return acc; }, {});
  }, [appointments]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {lastLoadedAt && <span>Last load: {lastLoadedAt.toLocaleTimeString()}</span>}
          <button onClick={load} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm">Refresh</button>
        </div>
      </div>
      <div className="mb-4">
        {fetchPath && (
          <div className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded flex flex-wrap gap-2 items-center">
            <span className="font-medium">Fetch path:</span>
            <code className="bg-white px-2 py-0.5 rounded border text-[10px]">{fetchPath}</code>
            {fetchPath==='by-name' && <span className="text-amber-600">(doctor_id mismatch suspected)</span>}
            {fetchPath==='all+filter' && <span className="text-red-600">(severe mismatch – recommend data cleanup)</span>}
          </div>
        )}
        {!doctorId && doctorName && !fetchPath && (
          <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded">
            Using doctor name fallback. For more precise matching ensure the account has a doctor ID association.
          </div>
        )}
      </div>
      {loading && (
        <div className="animate-pulse text-gray-500">Loading appointments…</div>
      )}
      {error && !loading && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex items-center justify-between">
          <span>{error}</span>
          <button onClick={load} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Retry</button>
        </div>
      )}
      {!loading && !error && appointments.length === 0 && (
        <div className="p-6 text-center text-gray-500 border border-dashed rounded bg-gray-50">No appointments found.</div>
      )}
      <div className="space-y-6">
        {Object.keys(grouped).sort().map(date => (
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
                  <th className="px-4 py-2">Timing</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {grouped[date].map(a => (
                  <tr key={a.id} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50/50">
                    <td className="px-4 py-2 font-mono text-xs">{a.time}</td>
                    <td className="px-4 py-2">{a.patient}</td>
                    <td className="px-4 py-2">{a.type}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${a.status==='upcoming' ? 'bg-blue-100 text-blue-700' : a.status==='completed' ? 'bg-green-100 text-green-700' : a.status?.toLowerCase()?.startsWith('cancel') ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'}`}>{a.status || '—'}</span>
                    </td>
                    <td className="px-4 py-2 align-top">
                      {editingTimingId === a.id ? (
                        <div className="space-y-1 w-40">
                          <input
                            type="range"
                            min="-120"
                            max="120"
                            step="5"
                            value={tempOffset}
                            onChange={e=>setTempOffset(Number(e.target.value))}
                            className="w-full"
                          />
                          <div className="flex items-center justify-between text-[10px] text-gray-500">
                            <span>-120</span><span>0</span><span>+120</span>
                          </div>
                          <div className="text-xs font-medium">
                            {tempOffset === 0 ? 'On time' : tempOffset < 0 ? `Early (${Math.abs(tempOffset)}m)` : `Delay (${tempOffset}m)`}
                          </div>
                          <div className="flex gap-1">
                            <button disabled={savingTiming} onClick={async ()=>{
                              setSavingTiming(true);
                              try {
                                await updateAppointmentTiming(a.id.replace('appt-',''), tempOffset);
                                setEditingTimingId(null); setTempOffset(0); await load();
                              } catch(e){ alert('Save failed: '+e.message);} finally { setSavingTiming(false);} }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded px-2 py-1 text-[10px] disabled:opacity-50">{savingTiming? 'Saving...' : 'Save'}</button>
                            <button disabled={savingTiming} onClick={()=>{ setEditingTimingId(null); setTempOffset(0); }} className="flex-1 bg-gray-200 hover:bg-gray-300 rounded px-2 py-1 text-[10px]">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className={`px-2 py-1 rounded text-[10px] font-semibold inline-block shadow-sm ${a.timing_status==='on-time' ? 'bg-gray-100 text-gray-700 border border-gray-200' : a.timing_status==='early' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{a.timing_status === 'on-time' ? 'On Time' : a.timing_status==='early' ? `Early (${Math.abs(a.timing_offset_minutes)}m)` : `Delay (${a.timing_offset_minutes}m)`}</span>
                            {!a.status?.toLowerCase()?.startsWith('cancel') && (
                              <button
                                onClick={()=>{ setEditingTimingId(a.id); setTempOffset(a.timing_offset_minutes||0); }}
                                title="Adjust early / delay timing"
                                className="group inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-600/10 hover:bg-blue-600/20 text-[10px] font-medium text-blue-700 border border-blue-300/50 transition shadow-sm"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-12.5a.75.75 0 00-1.5 0v4.25c0 .199.079.39.22.53l2.5 2.5a.75.75 0 101.06-1.06l-2.28-2.28V5.5z" clipRule="evenodd" />
                                </svg>
                                Adjust
                              </button>
                            )}
                          </div>
                          {a.timing_status !== 'on-time' && a.timing_offset_minutes !== 0 && a.raw?.timing_updated_at && (
                            <div className="text-[9px] text-gray-400 italic">updated {new Date(a.raw.timing_updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      {a.status?.toLowerCase()?.startsWith('cancel') ? (
                        <span className="text-xs text-red-500 font-semibold">Cancelled</span>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              const apptId = a.id;
                              navigate(`/prescription/add?appointmentId=${encodeURIComponent(apptId)}`, { state: { appointmentId: apptId, patientNic: a.raw?.patient_nic || a.raw?.patient_id, patientName: a.raw?.patient_name } });
                            }}
                            className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                            title="Create a prescription for this appointment"
                          >
                            Diagnose
                          </button>
                          <button disabled={cancellingId===a.id} onClick={()=>handleCancel(a)} className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            {cancellingId===a.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
