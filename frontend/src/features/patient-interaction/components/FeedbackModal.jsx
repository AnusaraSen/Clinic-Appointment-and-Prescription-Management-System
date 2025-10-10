import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function FeedbackModal({ open, appointment, onClose, onSaved }) {
  const [rating, setRating] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingId, setExistingId] = useState(null);

  useEffect(() => {
    if (!open || !appointment) return;
    setRating('');
    setComments('');
    setExistingId(null);
    setError('');
    // Fetch existing feedback for this appointment (if any)
    const fetchExisting = async () => {
      const apptId = appointment._id || appointment.id || appointment;
      if (!apptId) return;
      const urls = [
        `/feedback/by-appointment/${apptId}`,
        `http://localhost:5000/feedback/by-appointment/${apptId}`,
        `http://127.0.0.1:5000/feedback/by-appointment/${apptId}`,
      ];
      for (const url of urls) {
        try {
          const res = await axios.get(url, { timeout: 6000 });
          if (res?.data?.feedback) {
            const fb = res.data.feedback;
            setExistingId(fb._id);
            setRating(String(fb.rating || ''));
            setComments(fb.comments || '');
            return;
          }
        } catch (_e) {}
      }
    };
    fetchExisting();
  }, [open, appointment]);

  const submit = async () => {
    if (!appointment?._id) { setError('Missing appointment id'); return; }
    if (!rating) { setError('Please select a rating'); return; }
    setLoading(true); setError('');
    const payload = {
      appointment_id: appointment._id,
      rating: Number(rating),
      comments: comments || undefined,
    };
    const urls = [
      '/feedback/upsert',
      'http://localhost:5000/feedback/upsert',
      'http://127.0.0.1:5000/feedback/upsert',
    ];
    let lastErr = null;
    for (const url of urls) {
      try {
        const res = await axios.put(url, payload, { timeout: 8000 });
        if (res?.data?.feedback) {
          onSaved?.(res.data.feedback);
          setLoading(false);
          return;
        }
      } catch (e) { lastErr = e; }
    }
    setLoading(false);
    setError(lastErr?.response?.data?.message || lastErr?.message || 'Failed to save feedback');
  };

  if (!open || !appointment) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ width: '100%', maxWidth: 520, background: 'white', borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #eef2ff', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{existingId ? 'Edit Feedback' : 'Give Feedback'}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Dr. {appointment.doctor_name || appointment.doctor?.name || 'Unknown'} on {new Date(appointment.appointment_date || appointment.date).toLocaleDateString()}</div>
        </div>
        <div style={{ padding: 16 }}>
          {error && <div style={{ marginBottom: 12, color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: '8px 10px', borderRadius: 8, fontSize: 14 }}>{error}</div>}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Rating</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setRating(String(n))} style={{
                  width: 40, height: 40, borderRadius: 8, border: '1px solid #e5e7eb',
                  background: Number(rating) >= n ? '#fef3c7' : 'white',
                  color: Number(rating) >= n ? '#b45309' : '#64748b',
                  fontSize: 18
                }}>★</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="comments" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Comments (optional)</label>
            <textarea id="comments" value={comments} onChange={e => setComments(e.target.value)} rows={4} placeholder="Share your experience…" style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, resize: 'vertical' }} />
          </div>
        </div>
        <div style={{ padding: 16, display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid #e5e7eb' }}>
          <button onClick={onClose} disabled={loading} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #16a34a', background: '#22c55e', color: 'white', fontWeight: 600 }}>{loading ? 'Saving…' : (existingId ? 'Save Changes' : 'Submit')}</button>
        </div>
      </div>
    </div>
  );
}
