import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import { useAuth } from '../../authentication/context/AuthContext.jsx';
import { getDoctorAppointments, getDoctorAppointmentsByName, getAllAppointments } from '../../../api/appointmentsApi.js';

export const ClinicalPastAppointmentsSection = () => {
  const { user } = useAuth() || {};
  const doctorId = user?._id;
  const doctorName = user?.name;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const toYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
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
          data = (all||[]).filter(a => {
            const d = new Date(a.appointment_date||a.date); d.setHours(0,0,0,0);
            const isPast = d.getTime() < today.getTime();
            const idMatch = doctorId && String(a.doctor_id) === String(doctorId);
            const nameMatch = (a.doctor_name||'').toLowerCase().includes(lowered);
            return isPast && (idMatch || nameMatch);
          });
        } catch(_){}
      }
      const normalized = (data||[]).map(a => {
        const d = new Date(a.appointment_date || a.date);
        d.setHours(0,0,0,0);
        // derive display status for consistency
        const baseStatus = a.status || 'upcoming';
        const displayStatus = baseStatus === 'completed' ? 'completed' : baseStatus?.toLowerCase()?.startsWith('cancel') ? baseStatus : 'past';
        return {
          id: a._id,
          dateObj: d,
          date: d.toISOString().split('T')[0],
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

  return (
    <div className="cd-card" role="region" aria-label="Past Appointments">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClinicalPastAppointmentsSection;
