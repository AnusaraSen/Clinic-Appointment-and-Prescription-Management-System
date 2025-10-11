import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ClinicalLayout } from '../layouts/ClinicalLayout';
import { fetchPatientHistory, formatPrescription, fetchLabReportsByPatient } from '../../../api/patientHistoryApi';
import { ChevronLeft, RefreshCw, FileText, AlertTriangle, Printer, Download, Layers } from 'lucide-react';
import logoUrl from '../../../assets/family-health-logo.svg';

export const PatientHistoryPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [source, setSource] = useState('');
  const [expanded, setExpanded] = useState({});
  const [yearFilter, setYearFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [labReports, setLabReports] = useState([]);
  const [loadingLabs, setLoadingLabs] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const load = async (isRefresh=false) => {
    try {
      if(isRefresh) setRefreshing(true); else setLoading(true);
      setError(null);
      const data = await fetchPatientHistory(patientId);
      setPatient(data.patient||null);
      setPrescriptions((data.prescriptions||[]).map(formatPrescription));
      setSource(data.source||'');
    } catch(e){
      setError(e.message||'Failed to load patient history');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };
  const loadLabReports = async (p) => {
    if(!p) return;
    try {
      setLoadingLabs(true);
      const reports = await fetchLabReportsByPatient(p._id, p.patient_ID);
      setLabReports(reports);
    } catch(e){
      console.warn('Lab reports load failed', e);
    } finally { setLoadingLabs(false); }
  };
  useEffect(()=>{ load(false); /* eslint-disable-next-line */ }, [patientId]);
  useEffect(()=>{ if(patient) loadLabReports(patient); }, [patient]);

  const toggle = id => setExpanded(prev=>({ ...prev, [id]: !prev[id] }));

  const doctorOptions = useMemo(()=>{
    const set = new Set(); prescriptions.forEach(p=>{ if(p.doctor) set.add(p.doctor); });
    return Array.from(set).sort();
  }, [prescriptions]);
  const yearOptions = useMemo(()=>{
    const set = new Set(); prescriptions.forEach(p=>{ if(p.date) set.add(p.date.getFullYear()); });
    return Array.from(set).sort((a,b)=>b-a);
  }, [prescriptions]);
  const filteredPrescriptions = useMemo(()=> prescriptions.filter(p=> (
    (doctorFilter==='all'||p.doctor===doctorFilter) && (yearFilter==='all'||(p.date && p.date.getFullYear().toString()===yearFilter))
  )), [prescriptions, doctorFilter, yearFilter]);
  const sortedPrescriptions = useMemo(()=> [...filteredPrescriptions].sort((a,b)=>(b.date?.getTime()||0)-(a.date?.getTime()||0)), [filteredPrescriptions]);
  const totalPages = Math.max(1, Math.ceil(sortedPrescriptions.length / pageSize));
  const paginated = useMemo(()=>{ const start=(page-1)*pageSize; return sortedPrescriptions.slice(start,start+pageSize); }, [sortedPrescriptions,page,pageSize]);
  useEffect(()=>{ if(page>totalPages) setPage(1); }, [totalPages,page]);

  const handlePrint = () => {
    const w = window.open('', '', 'width=1000,height=800');
    if (!w) return;
    const printDate = new Date().toLocaleString();

    // Build prescriptions rows
    const rows = sortedPrescriptions.map(p => {
      const meds = p.medicines.map(m => `${m.Medicine_Name} (${m.Dosage} ${m.Frequency} ${m.Duration})`).join('; ');
      return `<tr>
        <td>${p.date ? p.date.toLocaleDateString() : ''}</td>
        <td>${(p.doctor||'').toString().replace(/</g,'&lt;')}</td>
        <td>${(p.diagnosis||'').toString().replace(/</g,'&lt;')}</td>
        <td>${(meds||'').toString().replace(/</g,'&lt;')}</td>
        <td>${(p.instructions||'').toString().replace(/</g,'&lt;')}</td>
      </tr>`;
    }).join('');

    const patientPhoto = (patient && patient.photo) ? `<img src="${patient.photo}" alt="${(patient.patient_name||'Patient').toString().replace(/"/g,'&quot;')}" style="width:120px;height:120px;object-fit:cover;border-radius:50%;border:1px solid #e5e7eb;"/>` : '<div style="width:120px;height:120px;border-radius:50%;background:#f1f5f9;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:12px;">No Photo</div>';

    const headerLogo = `<img src="${logoUrl}" alt="System Logo" style="height:42px;vertical-align:middle;"/>`;
    const systemName = 'Clinic Appointment & Prescription Management System';

    const infoCell = (label, value) => `<div style="padding:6px 8px;border:1px solid #e5e7eb;border-radius:6px;background:#f8fafc;display:inline-block;margin:2px 6px 2px 0;min-width:120px;"><div style="color:#64748b;font-size:11px;">${label}</div><div style="font-weight:600;color:#0f172a;">${(value??'-')}</div></div>`;

    w.document.write(`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Patient History ${patientId}</title>
        <style>
          @media print { @page { margin: 16mm; } }
          body{font-family:Arial,Helvetica,sans-serif;color:#0f172a;padding:24px;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
          .header{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;border-bottom:2px solid #e5e7eb;padding-bottom:12px;margin-bottom:18px;}
          .system{display:inline-flex;align-items:center;gap:10px;justify-self:center}
          .system-name{font-size:18px;font-weight:700;color:#0f172a;letter-spacing:0.2px}
          .meta{color:#475569;font-size:12px;justify-self:end}
          .section{margin:18px 0}
          .title{font-size:18px;font-weight:700;margin:0 0 8px}
          .subtle{font-size:12px;color:#64748b}
          .grid{display:flex;gap:18px}
          .grid .col{flex:1}
          table{width:100%;border-collapse:collapse;font-size:12px;margin-top:10px}
          th,td{border:1px solid #e5e7eb;padding:6px;text-align:left;vertical-align:top}
          th{background:#f8fafc;color:#334155}
        </style>
      </head>
      <body>
        <div class="header">
          <div></div>
          <div class="system">${headerLogo}<div class="system-name">${systemName}</div></div>
          <div class="meta">Generated: ${printDate}</div>
        </div>

        <div class="section">
          <div class="title">Patient Summary</div>
          <div class="grid">
            <div class="col" style="max-width:220px;text-align:center">
              ${patientPhoto}
              <div style="margin-top:10px;font-weight:700">${patient?.patient_name || ''}</div>
              <div class="subtle">Patient Code: ${patient?.patient_ID || ''}</div>
            </div>
            <div class="col">
              ${infoCell('Email', patient?.Email || '-')}
              ${infoCell('Age', patient?.patient_age || '-')}
              ${infoCell('Gender', patient?.Gender || '-')}
              ${infoCell('Blood', patient?.Blood_group || '-')}
              ${infoCell('Smoke', patient?.Smoking_status ?? '0')}
              ${infoCell('Alcohol', patient?.Alcohol_consumption ?? '0')}
              ${infoCell('Emergency', patient?.Emergency_Contact || '-')}
              <div style="margin-top:8px"> 
                <div class="subtle" style="margin:6px 0 2px">Allergies</div>
                <div style="font-weight:600">${patient?.Allergies || '-'}</div>
                <div class="subtle" style="margin:10px 0 2px">Current Conditions</div>
                <div style="font-weight:600">${patient?.Current_medical_conditions || '-'}</div>
                <div class="subtle" style="margin:10px 0 2px">Past Surgeries</div>
                <div style="font-weight:600">${patient?.Past_surgeries || '-'}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="title">Prescription History</div>
          <div class="subtle">Patient ID: ${patientId} • Total: ${sortedPrescriptions.length}</div>
          <table>
            <thead><tr><th>Date</th><th>Doctor</th><th>Diagnosis</th><th>Medicines</th><th>Instructions</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </body>
    </html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };
  const handleExportCSV = () => {
    const headers=['Date','Doctor','Diagnosis','Medicines','Instructions'];
    const lines = sortedPrescriptions.map(p=>{ const meds=p.medicines.map(m=>`${m.Medicine_Name} (${m.Dosage}/${m.Frequency}/${m.Duration})`).join('|'); return [p.date? p.date.toISOString():'', p.doctor||'', p.diagnosis||'', meds, (p.instructions||'').replace(/\n/g,' ')].map(v=>`"${v.replace(/"/g,'""')}"`).join(','); });
    const csv=[headers.join(','),...lines].join('\n'); const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`patient_${patientId}_history.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <ClinicalLayout currentPath="/patient/all">
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <nav className="text-xs text-slate-500 flex items-center gap-1">
                <Link to="/patient/all" className="hover:text-slate-700">All Patients</Link>
                <span>/</span>
                <span className="text-slate-700 font-medium">History</span>
              </nav>
              <div className="flex items-center gap-2">
                <button onClick={()=>navigate(-1)} className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"><ChevronLeft className="h-4 w-4"/> Back</button>
                <h1 className="text-xl font-semibold text-slate-900">Patient History</h1>
                <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">ID: {patientId}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <select value={doctorFilter} onChange={e=>{setDoctorFilter(e.target.value); setPage(1);}} className="text-xs border rounded px-2 py-1 bg-white"><option value="all">All Doctors</option>{doctorOptions.map(d=> <option key={d} value={d}>{d}</option>)}</select>
                <select value={yearFilter} onChange={e=>{setYearFilter(e.target.value); setPage(1);}} className="text-xs border rounded px-2 py-1 bg-white"><option value="all">All Years</option>{yearOptions.map(y=> <option key={y} value={y}>{y}</option>)}</select>
                <select value={pageSize} onChange={e=>{setPageSize(parseInt(e.target.value)||5); setPage(1);}} className="text-xs border rounded px-2 py-1 bg-white">{[5,10,20].map(s=> <option key={s} value={s}>{s}/page</option>)}</select>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handlePrint} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700"><Printer className="h-4 w-4"/>Print</button>
                <button onClick={() => {
                  fetch(`/patient/history/${patientId}/export/pdf`).then(res=>{
                    if(!res.ok) throw new Error('Failed PDF');
                    return res.blob();
                  }).then(blob=>{
                    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`patient_${patientId}_history.pdf`; a.click(); URL.revokeObjectURL(url);
                  }).catch(err=>console.error('PDF export failed', err));
                }} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700">PDF</button>
                <button onClick={handleExportCSV} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700"><Download className="h-4 w-4"/>Export</button>
                <button onClick={()=>load(true)} disabled={refreshing} className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-slate-700 text-white text-xs hover:bg-slate-800 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${refreshing?'animate-spin':''}`}/>{refreshing?'Refreshing':'Refresh'}</button>
              </div>
              {source && <span className="text-[10px] text-slate-400">{source}</span>}
            </div>
          </div>
        </div>
        {loading && (
          <div className="space-y-6 animate-pulse" aria-label="Loading patient history">
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center md:items-start w-full md:w-1/3 gap-4">
                  <div className="w-40 h-40 rounded-full bg-slate-200" />
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {Array.from({length:6}).map((_,i)=>(<div key={i} className="h-12 rounded bg-slate-100 border border-slate-200" />))}
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  {Array.from({length:4}).map((_,i)=>(<div key={i} className="space-y-2">
                    <div className="h-2 w-28 bg-slate-200 rounded" />
                    <div className="h-4 w-full bg-slate-100 rounded" />
                    <div className="h-4 w-3/4 bg-slate-100 rounded" />
                  </div>))}
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 w-40 bg-slate-200 rounded" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
              </div>
              <ul className="divide-y divide-slate-100">
                {Array.from({length:3}).map((_,i)=>(
                  <li key={i} className="py-4">
                    <div className="space-y-2">
                      <div className="flex gap-3 items-center">
                        <div className="h-4 w-20 bg-slate-200 rounded" />
                        <div className="h-3 w-16 bg-slate-100 rounded" />
                        <div className="h-3 w-24 bg-slate-100 rounded" />
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded" />
                      <div className="h-3 w-5/6 bg-slate-100 rounded" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 w-32 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
              </div>
              <div className="space-y-2">
                {Array.from({length:4}).map((_,i)=>(<div key={i} className="h-6 w-full bg-slate-100 rounded" />))}
              </div>
            </div>
          </div>
        )}
        {error && <div className="p-4 border border-red-200 bg-red-50 rounded-md flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-red-500"/><div className="flex-1"><p className="text-sm font-medium text-red-800 mb-1">Failed to load history</p><p className="text-xs text-red-600 mb-2">{error}</p><button onClick={()=>load(false)} className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">Retry</button></div></div>}
        {!loading && !error && !patient && <div className="p-8 border rounded-md bg-white text-center text-sm text-slate-500">No patient found for ID {patientId}</div>}
        {patient && <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm"><div className="flex flex-col md:flex-row md:items-start gap-6"><div className="flex flex-col items-center md:items-start w-full md:w-1/3">{patient.photo ? <img src={patient.photo} alt={patient.patient_name} className="w-40 h-40 object-cover rounded-full border border-slate-200 shadow-sm"/>: <div className="w-40 h-40 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm border border-slate-200">No Photo</div>}<h2 className="mt-4 text-lg font-semibold text-slate-800">{patient.patient_name}</h2><p className="text-xs text-slate-500 font-medium">Patient Code: {patient.patient_ID}</p><div className="mt-3 grid grid-cols-2 gap-2 w-full text-xs"><InfoStat label="Age" value={patient.patient_age||'-'}/><InfoStat label="Gender" value={patient.Gender||'-'}/><InfoStat label="Blood" value={patient.Blood_group||'-'}/><InfoStat label="Smoke" value={patient.Smoking_status||'0'}/><InfoStat label="Alcohol" value={patient.Alcohol_consumption||'0'}/><InfoStat label="Emergency" value={patient.Emergency_Contact||'-'}/></div></div><div className="flex-1 space-y-4 text-sm"><Section label="Email" value={patient.Email}/><Section label="Allergies" value={patient.Allergies||'-'}/><Section label="Current Conditions" value={patient.Current_medical_conditions||'-'}/><Section label="Past Surgeries" value={patient.Past_surgeries||'-'}/></div></div></div>}
  {patient && <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm"><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><FileText className="h-5 w-5 text-slate-500"/> Prescription History</h3><div className="flex items-center gap-4"><span className="text-xs text-slate-500">{sortedPrescriptions.length} total</span>{sortedPrescriptions.length>pageSize && <div className="flex items-center gap-2 text-xs"><button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-2 py-1 border rounded disabled:opacity-40">Prev</button><span>{page} / {totalPages}</span><button disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-2 py-1 border rounded disabled:opacity-40">Next</button></div>}</div></div>{sortedPrescriptions.length===0 && <div className="text-xs text-slate-500 border border-dashed rounded p-4">No prescriptions found.</div>}{sortedPrescriptions.length>0 && <ul className="divide-y divide-slate-200">{paginated.map(p=> <li key={p.id} className="py-4"><div className="flex items-start justify-between gap-4"><div className="flex-1 min-w-0"><div className="flex items-center gap-3 mb-1"><span className="text-sm font-medium text-slate-800">{p.date? p.date.toLocaleDateString():'—'}</span>{p.doctor && <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{p.doctor}</span>}{p.diagnosis && <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Dx: {p.diagnosis}</span>}</div><div className="text-xs text-slate-600 line-clamp-2">{(p.instructions||p.symptoms||'').slice(0,220)||'No notes'}{(p.instructions||p.symptoms||'').length>220?'...':''}</div>{expanded[p.id] && <div className="mt-3 space-y-3">{p.symptoms && <DetailRow label="Symptoms" value={p.symptoms}/>} {p.diagnosis && <DetailRow label="Diagnosis" value={p.diagnosis}/>} {p.clinical_findings && <DetailRow label="Findings" value={p.clinical_findings}/>} {p.instructions && <DetailRow label="Instructions" value={p.instructions}/>} {p.medicines.length>0 && <div><p className="text-xs font-semibold text-slate-700 mb-1">Medicines</p><div className="border rounded overflow-hidden"><table className="w-full text-xs"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-2 py-1 text-left font-medium">Name</th><th className="px-2 py-1 text-left font-medium">Dosage</th><th className="px-2 py-1 text-left font-medium">Frequency</th><th className="px-2 py-1 text-left font-medium">Duration</th></tr></thead><tbody>{p.medicines.map((m,i)=><tr key={i} className="odd:bg-white even:bg-slate-50"><td className="px-2 py-1">{m.Medicine_Name}</td><td className="px-2 py-1">{m.Dosage}</td><td className="px-2 py-1">{m.Frequency}</td><td className="px-2 py-1">{m.Duration}</td></tr>)}</tbody></table></div></div>}</div>}</div><div className="flex flex-col items-end gap-2"><div className="flex flex-col gap-1"><button onClick={()=>toggle(p.id)} className="text-xs px-3 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50">{expanded[p.id] ? 'Hide Details' : 'View Details'}</button><button onClick={()=>{ const w=window.open('', '', 'width=800,height=700'); if(!w) return; w.document.write('<html><head><title>Prescription</title><style>body{font-family:Arial;padding:24px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:4px;font-size:12px;text-align:left;}th{background:#eee;}</style></head><body>'); w.document.write(`<h2>Prescription - ${p.date? p.date.toLocaleDateString():''}</h2>`); if(p.doctor) w.document.write(`<p><strong>Doctor:</strong> ${p.doctor}</p>`); if(p.diagnosis) w.document.write(`<p><strong>Diagnosis:</strong> ${p.diagnosis}</p>`); if(p.symptoms) w.document.write(`<p><strong>Symptoms:</strong> ${p.symptoms}</p>`); if(p.instructions) w.document.write(`<p><strong>Instructions:</strong> ${(p.instructions||'').replace(/</g,'&lt;')}</p>`); if(p.medicines.length){ w.document.write('<h3>Medicines</h3><table><thead><tr><th>Name</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead><tbody>'); p.medicines.forEach(m=>{ w.document.write(`<tr><td>${m.Medicine_Name}</td><td>${m.Dosage}</td><td>${m.Frequency}</td><td>${m.Duration}</td></tr>`); }); w.document.write('</tbody></table>'); } w.document.write('</body></html>'); w.document.close(); setTimeout(()=>w.print(),200); }} className="text-[10px] px-2 py-1 rounded border border-slate-200 text-slate-500 hover:bg-slate-50">Print</button><button onClick={()=>{ const shareData=window.location.origin + `/patient/history/${patientId}?p=${p.id}`; navigator.clipboard.writeText(shareData); }} className="text-[10px] px-2 py-1 rounded border border-slate-200 text-slate-500 hover:bg-slate-50">Share</button></div></div></div></li>)}</ul>}</div>}
        {patient && <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm"><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><Layers className="h-5 w-5 text-slate-500"/> Lab Reports</h3><span className="text-xs text-slate-500">{loadingLabs? 'Loading...' : labReports.length + ' found'}</span></div>{loadingLabs && <div className="text-xs text-slate-500">Loading lab reports...</div>}{!loadingLabs && labReports.length===0 && <div className="text-xs text-slate-500 border border-dashed rounded p-4">No lab reports linked to this patient.</div>}{!loadingLabs && labReports.length>0 && <div className="overflow-x-auto"><table className="w-full text-xs border"><thead className="bg-slate-50"><tr className="text-slate-600"><th className="px-2 py-1 text-left font-medium">Code</th><th className="px-2 py-1 text-left font-medium">Type</th><th className="px-2 py-1 text-left font-medium">Doctor</th><th className="px-2 py-1 text-left font-medium">Status</th><th className="px-2 py-1 text-left font-medium">Priority</th><th className="px-2 py-1 text-left font-medium">Created</th><th className="px-2 py-1 text-left font-medium">Report</th></tr></thead><tbody>{labReports.map(r=> <tr key={r.id} className="odd:bg-white even:bg-slate-50"><td className="px-2 py-1 font-medium text-slate-700">{r.code}</td><td className="px-2 py-1">{r.type}</td><td className="px-2 py-1">{r.doctor||'-'}</td><td className="px-2 py-1">{r.status}</td><td className="px-2 py-1">{r.priority}</td><td className="px-2 py-1">{r.createdAt? new Date(r.createdAt).toLocaleDateString():''}</td><td className="px-2 py-1">{r.reportUrl? <a className="text-slate-700 underline" href={r.reportUrl} target="_blank" rel="noreferrer">View</a> : '-'}</td></tr>)}</tbody></table></div>}</div>}
      </div>
    </ClinicalLayout>
  );
};

const Section = ({ label, value }) => <div><p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium mb-1">{label}</p><div className="text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">{value||'-'}</div></div>;
const DetailRow = ({ label, value }) => <div className="text-xs text-slate-600"><span className="font-semibold text-slate-500 mr-1">{label}:</span>{value}</div>;
const InfoStat = ({ label, value }) => <div className="p-2 rounded bg-slate-50 border border-slate-200"><span className="block text-slate-500">{label}</span><span className="font-semibold text-slate-800">{value}</span></div>;

export default PatientHistoryPage;
