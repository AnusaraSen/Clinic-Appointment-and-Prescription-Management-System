import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import prescriptionsApi from '../../../api/prescriptionsApi';
import logoUrl from '../../../assets/family-health-logo.svg';

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
  const printPage = () => {
    const escape = (s) => String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    const toDate = (d) => {
      try { const dt = new Date(d); return isNaN(dt) ? '' : dt.toLocaleDateString(); } catch { return ''; }
    };

    const now = new Date();
    const printDate = now.toLocaleString();
    const sysNameTop = 'Family Health Care';
    const sysNameSub = 'Clinic Management System';
    const appt = escape(appointmentId || '—');
    const pid = escape(patientId || '—');
    const ready = (!loading && !error && items.length > 0);

    const headerLogo = `<img src="${logoUrl}" alt="Logo" style="height:28px;vertical-align:middle;"/>`;

    const sections = items.map((p, idx) => {
      const meds = Array.isArray(p.Medicines) ? p.Medicines : [];
      const medsRows = meds.map(m => `
        <tr>
          <td>${escape(m.Medicine_Name)}</td>
          <td>${escape(m.Dosage)}</td>
          <td>${escape(m.Frequency)}</td>
          <td>${escape(m.Duration)}</td>
        </tr>`).join('');

      const infoLine = [
        `Date: <strong>${escape(toDate(p.Date) || '—')}</strong>`,
        `Doctor: <strong>${escape(p.doctor_Name || '—')}</strong>`
      ].join('<span class="sep">•</span>');

      return `
        <section class="card ${idx>0 ? 'page-break' : ''}">
          <div class="pill">Prescription</div>
          <h3 class="card-title">${escape(p.Diagnosis || 'No Diagnosis')}</h3>
          <div class="meta">${infoLine}</div>
          <div class="meta-sub">Patient: ${escape(p.patient_name || '—')} (${escape(p.patient_ID || '—')})</div>
          ${meds.length ? `
            <div class="subheader">Medicines</div>
            <table class="table">
              <thead><tr><th>Name</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead>
              <tbody>${medsRows}</tbody>
            </table>
          ` : ''}
          ${p.Instructions ? `
            <div class="subheader">Instructions</div>
            <div class="note">${escape(p.Instructions)}</div>
          ` : ''}
        </section>`;
    }).join('');

    const w = window.open('', '', 'width=900,height=700');
    if (!w) return;
    w.document.write(`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Appointment Prescriptions ${appt}</title>
        <style>
          @media print { @page { margin: 14mm; } }
          body{font-family:Arial,Helvetica,sans-serif;color:#0f172a;margin:0;padding:20px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
          .header{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;border-bottom:1px solid #e5e7eb;padding-bottom:8px;margin-bottom:14px}
          .system{display:inline-flex;align-items:center;gap:8px;justify-self:center}
          .sys-top{font-weight:800;font-size:16px;letter-spacing:.2px}
          .sys-sub{font-size:10px;color:#64748b;letter-spacing:.18em;text-transform:uppercase}
          .meta-gen{font-size:11px;color:#475569;justify-self:end}
          .badges{display:flex;flex-wrap:wrap;gap:10px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;padding:8px 10px;margin:10px 0 14px}
          .badge{display:flex;flex-direction:column;gap:2px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;min-width:120px}
          .badge .l{font-size:9px;color:#475569;font-weight:800;letter-spacing:.15em}
          .badge .v{font-size:13px;font-weight:700}
          .ready{font-size:10px;font-weight:800;letter-spacing:.16em;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;border-radius:10px;padding:6px 10px}
          .note-warn{font-size:10px;font-weight:700;color:#92400e;background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:6px 10px;display:inline-block;margin-top:6px}
          .card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px 18px;margin:14px 0;box-shadow:0 4px 18px rgba(15,23,42,0.06)}
          .card-title{margin:4px 0 8px;font-size:18px;letter-spacing:-.3px}
          .pill{display:inline-block;font-size:9px;letter-spacing:.15em;font-weight:800;color:#0f766e;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:6px;padding:4px 8px}
          .meta{font-size:12px;color:#475569;font-weight:600;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
          .meta-sub{font-size:11px;color:#64748b;margin-top:3px}
          .subheader{font-size:10px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:#334155;margin:12px 0 8px}
          .table{width:100%;border-collapse:collapse;font-size:12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}
          .table th,.table td{border:1px solid #e2e8f0;padding:6px 8px;text-align:left}
          .table thead th{background:#f8fafc;color:#334155;font-weight:700}
          .note{font-size:12px;line-height:1.4;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:10px;color:#9a3412}
          .sep{color:#94a3b8;margin:0 6px}
          .page-break{page-break-before:always}
        </style>
      </head>
      <body>
        <div class="header">
          <div></div>
          <div class="system">${headerLogo}<div><div class="sys-top">${sysNameTop}</div><div class="sys-sub">${sysNameSub}</div></div></div>
          <div class="meta-gen">Generated: ${escape(printDate)}</div>
        </div>
        <h2 style="margin:0 0 4px;font-size:20px;letter-spacing:-.4px">Appointment Prescriptions</h2>
        <div style="font-size:12px;color:#64748b">All prescriptions linked to this appointment.</div>
        ${inferred ? '<div class="note-warn">Legacy fallback: showing prescriptions inferred by patient ID & date (not originally linked)</div>' : ''}
        <div class="badges">
          <div class="badge"><div class="l">APPOINTMENT</div><div class="v">${appt}</div></div>
          ${patientId ? `<div class="badge"><div class="l">PATIENT</div><div class="v">${pid}</div></div>` : ''}
          <div class="badge"><div class="l">COUNT</div><div class="v">${String(items.length)}</div></div>
          ${ready ? '<div class="ready">READY</div>' : ''}
        </div>
        ${sections || '<div style="margin-top:10mm;font-size:12px;color:#64748b">No prescriptions to print.</div>'}
      </body>
    </html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 150);
  };

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