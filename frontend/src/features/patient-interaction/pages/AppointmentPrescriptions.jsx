import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import prescriptionsApi from '../../../api/prescriptionsApi';

// Lightweight page to list prescriptions tied to a specific appointment
// URL: /appointment/:appointmentId/prescriptions (or via query param ?appointmentId=...)
export default function AppointmentPrescriptions() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const sp = new URLSearchParams(location.search);
  const appointmentId = params.appointmentId || sp.get('appointmentId');
  const patientId = sp.get('patientId') || null;
  const [items, setItems] = useState([]);
  const [inferred, setInferred] = useState(false);
  const [legacyApplied, setLegacyApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!appointmentId) {
      setError('Missing appointment ID');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const res = await prescriptionsApi.listByAppointment(appointmentId);
        if (!cancelled) {
          setItems(res.data?.items || []);
          setInferred(!!res.data?.inferred);
          setLegacyApplied(!!res.data?.legacyFallbackApplied);
        }
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || e.message || 'Failed to load prescriptions');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [appointmentId]);

  const goBack = () => navigate(-1);

  const downloadSinglePdf = (id) => {
    window.open(`http://localhost:5000/prescription/${encodeURIComponent(id)}/export/pdf`, '_blank');
  };
  const downloadAllPdf = () => {
    if (!appointmentId) return;
    window.open(`http://localhost:5000/prescription/by-appointment/${encodeURIComponent(appointmentId)}/export/pdf`, '_blank');
  };
  const printPage = () => window.print();

  // If the NavBar is fixed at top, add a consistent offset (adjust if navbar height changes)
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto 80px', padding: '96px 28px 0' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <button onClick={goBack} style={{ background:'#0f766e', color:'white', border:'none', borderRadius:8, padding:'10px 18px', cursor:'pointer', fontWeight:600, boxShadow:'0 4px 10px rgba(15,118,110,0.25)' }}>← Back</button>
          <div>
            <h2 style={{ margin:'0 0 4px', fontSize:'1.9rem', letterSpacing:'-.5px', color:'#0f172a' }}>Appointment Prescriptions</h2>
            <div style={{ fontSize:'0.82rem', color:'#64748b', fontWeight:500 }}>All prescriptions linked to this appointment.</div>
            {inferred && (
              <div style={{ marginTop:6, fontSize:'0.7rem', fontWeight:600, color:'#b45309', background:'#fef3c7', border:'1px solid #fcd34d', padding:'6px 10px', borderRadius:8 }}>
                Legacy fallback: showing prescriptions inferred by patient ID & date (not originally linked)
              </div>
            )}
          </div>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <button onClick={printPage} style={toolbarBtn('#334155')}>🖨️ Print Page</button>
          <button onClick={downloadAllPdf} disabled={!items.length} style={toolbarBtn(items.length ? '#1e3a8a' : '#94a3b8')}>⬇️ Download All PDF</button>
        </div>
      </div>
      <div style={{
        display:'flex',
        flexWrap:'wrap',
        gap:16,
        marginBottom:24,
        background:'#f1f5f9',
        padding:'14px 18px',
        borderRadius:14,
        border:'1px solid #e2e8f0'
      }}>
        <InfoBadge label="Appointment" value={appointmentId || '—'} />
        {patientId && <InfoBadge label="Patient" value={patientId} />}
        <InfoBadge label="Count" value={String(items.length)} />
        {!loading && !error && items.length > 0 && (
          <div style={{ fontSize:'0.7rem', fontWeight:600, letterSpacing:'.08em', background:'#ecfdf5', padding:'6px 10px', borderRadius:8, color:'#047857', border:'1px solid #a7f3d0' }}>READY</div>
        )}
      </div>
      {loading && <SkeletonList />}
      {error && !loading && (
        <div style={{ padding:24, border:'1px solid #fecaca', background:'linear-gradient(135deg,#fef2f2,#ffe4e6)', borderRadius:16, color:'#b91c1c', fontWeight:600 }}>{error}</div>
      )}
      {!loading && !error && items.length === 0 && (
        <EmptyState />
      )}
      <div style={{ display:'grid', gap:22 }}>
        {items.map(p => (
          <div key={p._id} style={cardStyle}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:18, flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:260 }}>
                <div style={miniLabel}>PRESCRIPTION</div>
                <h3 style={{ margin:'4px 0 8px', fontSize:'1.35rem', color:'#0f172a', letterSpacing:'-.5px' }}>{p.Diagnosis || 'No Diagnosis'}</h3>
                <div style={metaLine}>Date: <strong>{p.Date ? new Date(p.Date).toLocaleDateString() : '—'}</strong><span style={dotSep}>•</span>Doctor: <strong>{p.doctor_Name || '—'}</strong></div>
                <div style={metaSub}>Patient: {p.patient_name} ({p.patient_ID})</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                {p.appointment_id && <div style={tagBadge('#0369a1','#e0f2fe')}>Linked</div>}
                {!p.appointment_id && inferred && <div style={tagBadge('#92400e','#fef3c7')}>Inferred</div>}
                <button onClick={() => downloadSinglePdf(p._id)} style={smallBtn('#1e40af')}>Download PDF</button>
              </div>
            </div>
            {Array.isArray(p.Medicines) && p.Medicines.length > 0 && (
              <div style={{ marginTop:16 }}>
                <div style={sectionHeader}>Medicines</div>
                <table style={tableStyle}>
                  <thead>
                    <tr><th>Name</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr>
                  </thead>
                  <tbody>
                    {p.Medicines.map((m,i) => (
                      <tr key={i}>
                        <td>{m.Medicine_Name}</td>
                        <td>{m.Dosage}</td>
                        <td>{m.Frequency}</td>
                        <td>{m.Duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {p.Instructions && (
              <div style={{ marginTop:18 }}>
                <div style={sectionHeader}>Instructions</div>
                <div style={instructionsBox}>{p.Instructions}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- UI Helpers ---
const toolbarBtn = (bg) => ({
  background: bg,
  color:'#fff',
  border:'none',
  borderRadius:10,
  padding:'10px 16px',
  fontSize:'0.7rem',
  fontWeight:700,
  letterSpacing:'.08em',
  cursor:'pointer',
  boxShadow:'0 3px 10px rgba(0,0,0,0.12)'
});

const cardStyle = {
  background:'linear-gradient(135deg,#ffffff,#f8fafc)',
  border:'1px solid #e2e8f0',
  borderRadius:24,
  padding:'26px 30px 24px',
  boxShadow:'0 8px 28px rgba(15,23,42,0.06)',
  position:'relative'
};
const miniLabel = { fontSize:'0.55rem', letterSpacing:'.18em', fontWeight:800, color:'#0f766e', background:'#ecfdf5', display:'inline-block', padding:'4px 8px', borderRadius:6, border:'1px solid #a7f3d0' };
const metaLine = { fontSize:'0.75rem', color:'#475569', fontWeight:600, display:'flex', alignItems:'center', flexWrap:'wrap', gap:6 };
const metaSub = { fontSize:'0.7rem', color:'#64748b', fontWeight:500, marginTop:4 };
const dotSep = { color:'#94a3b8' };
const tagBadge = (fg,bg) => ({ fontSize:'0.6rem', fontWeight:700, letterSpacing:'.12em', background:bg, color:fg, padding:'6px 10px', borderRadius:14, border:`1px solid ${fg}22` });
const sectionHeader = { fontSize:'0.65rem', fontWeight:800, letterSpacing:'.15em', textTransform:'uppercase', color:'#334155', marginBottom:10 };
const tableStyle = { width:'100%', borderCollapse:'collapse', fontSize:'0.72rem', background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' };
const instructionsBox = { fontSize:'0.75rem', lineHeight:1.4, background:'#fff7ed', border:'1px solid #fed7aa', padding:'12px 14px', borderRadius:12, color:'#9a3412', fontWeight:500 };
const smallBtn = (bg) => ({ background:bg, color:'#fff', border:'none', borderRadius:8, padding:'6px 10px', fontSize:'0.6rem', fontWeight:700, letterSpacing:'.08em', cursor:'pointer', boxShadow:'0 2px 6px rgba(0,0,0,0.15)' });

const EmptyState = () => (
  <div style={{ padding:48, textAlign:'center', background:'#ffffff', border:'2px dashed #e2e8f0', borderRadius:28 }}>
    <div style={{ fontSize:'1.1rem', fontWeight:700, color:'#0f172a' }}>No prescriptions yet</div>
    <div style={{ fontSize:'0.8rem', marginTop:6, color:'#64748b', maxWidth:500, marginInline:'auto' }}>When a doctor issues a prescription tied to this appointment, it will automatically appear here and can be exported as PDF.</div>
  </div>
);

const SkeletonList = () => (
  <div style={{ display:'grid', gap:20, marginBottom:24 }}>
    {Array.from({ length:2 }).map((_,i) => (
      <div key={i} style={{ ...cardStyle, background:'#f1f5f9', borderColor:'#e2e8f0', boxShadow:'none', position:'relative', overflow:'hidden' }}>
        <div style={{ height:14, width:90, background:'#e2e8f0', borderRadius:4, marginBottom:18 }} />
        <div style={{ height:22, width:'55%', background:'#e2e8f0', borderRadius:6, marginBottom:12 }} />
        <div style={{ height:10, width:'40%', background:'#e2e8f0', borderRadius:4, marginBottom:8 }} />
        <div style={{ height:10, width:'30%', background:'#e2e8f0', borderRadius:4, marginBottom:18 }} />
        <div style={{ height:60, width:'100%', background:'#e2e8f0', borderRadius:10 }} />
      </div>
    ))}
  </div>
);

const InfoBadge = ({ label, value }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:4, background:'#fff', padding:'10px 14px', borderRadius:12, border:'1px solid #e2e8f0', minWidth:130, boxShadow:'0 2px 4px rgba(0,0,0,0.04)' }}>
    <div style={{ fontSize:'0.55rem', letterSpacing:'.15em', fontWeight:800, color:'#475569' }}>{label.toUpperCase()}</div>
    <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#0f172a' }}>{value}</div>
  </div>
);