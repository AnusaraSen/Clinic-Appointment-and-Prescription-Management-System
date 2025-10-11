import React, { useEffect, useState } from 'react';
import { MessageSquare, X, User, Calendar, Clock, Star } from 'lucide-react';
import { getFeedbackByAppointment } from '../../../api/feedbackApi.js';

export default function FeedbackViewerModal({ appointment, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const list = await getFeedbackByAppointment(appointment?.id || appointment?._id);
        setItems(list || []);
      } catch (e) {
        setError(e?.message || 'Failed to load feedback');
      } finally { setLoading(false); }
    };
    if (appointment) load();
  }, [appointment]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-gray-100"><MessageSquare className="w-4 h-4 text-gray-700"/></div>
            <h3 className="text-base font-semibold text-gray-800">Patient Feedback</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600"/>
          </button>
        </div>
        <div className="p-4">
          <div className="mb-4 text-xs text-gray-500 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3"/>{appointment?.date || appointment?.appointment_date}</span>
            {appointment?.time && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3"/>{appointment?.time || appointment?.appointment_time}</span>}
          </div>
          {loading && <div className="text-sm text-gray-500">Loading feedback…</div>}
          {error && !loading && (
            <div className="p-3 rounded bg-amber-50 border border-amber-200 text-amber-700 text-sm">{error}</div>
          )}
          {!loading && !error && items.length===0 && (
            <div className="text-center py-10 border border-dashed border-gray-200 rounded-lg text-gray-600 text-sm">
              No feedback submitted for this appointment yet.
            </div>
          )}
          <div className="space-y-3 max-h-[50vh] overflow-auto pr-1">
            {items.map(f => (
              <div key={f._id} className="border border-gray-200 rounded-md p-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-600">
                      {(f.patient_name || (f.patient && f.patient.name) || 'P').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <span>{f.patient_name || (f.patient && f.patient.name) || 'Patient'}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(f.created_at || f.createdAt).toLocaleString()}</div>
                </div>
                {Number(f.rating) > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    {[1,2,3,4,5].map(i => {
                      const filled = i <= Math.max(0, Math.min(5, Math.round(Number(f.rating))))
                      return (
                        <Star key={i} className={`${filled ? 'text-yellow-500 fill-yellow-400' : 'text-gray-300'} w-4 h-4`} fill={filled ? 'currentColor' : 'none'} strokeWidth={filled ? 0 : 2} />
                      );
                    })}
                    <span className="ml-1 text-xs text-gray-500">{Math.max(0, Math.min(5, Math.round(Number(f.rating))))}/5</span>
                  </div>
                )}
                <div className="mt-1.5">
                  <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Comment</div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{(() => { const t = (f.feedback || f.comment || f.comments || f.message || '').toString().trim(); return t || '—'; })()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 border-t flex justify-end">
          <button onClick={onClose} className="px-3 py-1.5 text-xs rounded-md border border-gray-300 hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}
