import React, { useEffect, useMemo, useState } from 'react';
import PatientLayout from '../components/PatientLayout';
import { useAuth } from '../../authentication/context/AuthContext.jsx';
import { labTestApi } from '../../../api/labTestApi';

const apiBases = [
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  ''
];

// Ensure report URLs are absolute (prefix backend base when needed)
function toAbsoluteUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${apiBases[0]}${path}`;
}

async function fetchJsonWithFallback(paths) {
  for (const url of paths) {
    try {
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (res.ok) return await res.json();
    } catch { /* try next */ }
  }
  throw new Error('All patient fetch attempts failed');
}

const LabReports = () => {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState({ loading: true, error: null, reports: [], patientId: null, patientCode: null });

  const isPatient = user?.role === 'Patient';

  const patientResolveUrls = useMemo(() => {
    if (!user?.id && !user?._id) return [];
    const uid = user.id || user._id;
    const paths = apiBases.map(base => `${base}/api/patients/by-user/${uid}`);
    return paths;
  }, [user?.id, user?._id]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!isAuthenticated || !isPatient) {
        setState(s => ({ ...s, loading: false, error: 'Only patients can view lab reports.' }));
        return;
      }
      try {
        // 1) Resolve Patient document by linked user id
        const patient = await fetchJsonWithFallback(patientResolveUrls);
        const patientData = patient?.data || patient; // controller may return { success, data }
        const patientId = patientData?._id || patientData?.id;
        const patientCode = patientData?.patient_id;

        if (!patientId) throw new Error('Could not resolve patient record for the current user');

        // 2) Fetch data sources in parallel
        const labTestsPromise = labTestApi.getLabTestsByPatient(patientId);
        const testResultsPromise = (async () => {
          // Fetch all test results for this patient code; filter client-side
          const urls = apiBases.map(base => `${base}/api/test-results?patientId=${encodeURIComponent(patientCode)}`);
          try {
            for (const url of urls) {
              const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
              if (res.ok) return await res.json();
            }
          } catch {}
          return null;
        })();
        const labHistoryPromise = (async () => {
          // Completed LabTasks history
          const urls = apiBases.map(base => `${base}/api/patients/${encodeURIComponent(patientId)}/history`);
          try {
            for (const url of urls) {
              const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
              if (res.ok) return await res.json();
            }
          } catch {}
          return null;
        })();

        const [labTestsRes, testResultsRes, labHistoryRes] = await Promise.all([labTestsPromise, testResultsPromise, labHistoryPromise]);

        // Normalize LabTests
        const labTests = labTestsRes?.data?.labTests || labTestsRes?.labTests || labTestsRes?.data || [];
        const labTestReports = labTests.map(t => ({
          id: t._id,
          code: t.labtest_id,
          type: t.type,
          status: t.status,
          priority: t.priorityLevel,
          doctor: t.doctor?.name || t.requestedBy,
          createdAt: t.createdAt,
          reportUrl: t.reportUrl,
          source: 'LabTest'
        }));

        // Normalize TestResults
        const trArr = Array.isArray(testResultsRes?.data) ? testResultsRes.data : (testResultsRes?.data?.data || []);
        const testResultReports = trArr.map(tr => ({
          id: tr._id || tr.testId,
          code: tr.testId,
          type: tr.testType,
          status: tr.status, // Completed/Verified/etc.
          priority: '-',
          doctor: tr.requestedBy,
          createdAt: tr.completedDate || tr.updatedAt || tr.createdAt,
          reportUrl: Array.isArray(tr.attachments) && tr.attachments[0]?.filePath ? tr.attachments[0].filePath : '',
          source: 'TestResult'
        }));

        // Normalize Lab History (LabTasks)
        const histArr = labHistoryRes?.history || labHistoryRes?.data?.history || [];
        const taskReports = histArr.map(h => ({
          id: h._id,
          code: h.testType,
          type: h.testType,
          status: h.status || 'Completed',
          priority: h.priority || '-',
          doctor: h.technician || '-',
          createdAt: h.date,
          reportUrl: '',
          source: 'LabTask'
        }));

        // Determine issued/finalized items
        const allReports = [...labTestReports, ...testResultReports, ...taskReports];
        const issued = allReports.filter(r => {
          const status = (r.status || '').toLowerCase();
          // Include finalized or explicitly attached reports
          if (status === 'completed' || status === 'verified' || status === 'results ready' || status === 'issued') return true;
          if (r.reportUrl && r.reportUrl !== '') return true;
          // Also include LabTask history entries to reflect patient-visible history
          if (r.source === 'LabTask') return true;
          return false;
        });

        if (!alive) return;
        setState({ loading: false, error: null, reports: issued, patientId, patientCode });
      } catch (e) {
        if (!alive) return;
        setState({ loading: false, error: e.message || 'Failed to load lab reports', reports: [], patientId: null, patientCode: null });
      }
    };
    load();
    return () => { alive = false; };
  }, [isAuthenticated, isPatient, patientResolveUrls]);

  return (
    <PatientLayout currentPage="lab-reports">
      <div>
        <h1 style={{ fontWeight: 700, fontSize: '1.6rem', color: '#111' }}>Lab Reports</h1>
        <p style={{ color: '#555', marginTop: 2 }}>View reports issued by the lab for your tests.</p>

        {state.loading && (
          <div style={{ marginTop: 16, color: '#666' }}>Loading your lab reports…</div>
        )}
        {!state.loading && state.error && (
          <div style={{ marginTop: 16, color: '#b91c1c', background: '#fee2e2', padding: 12, borderRadius: 8 }}>
            {state.error}
          </div>
        )}
        {!state.loading && !state.error && state.reports.length === 0 && (
          <div style={{ marginTop: 16, color: '#555', background: '#fafafa', padding: 12, border: '1px dashed #e5e7eb', borderRadius: 8 }}>
            No lab reports found yet.
          </div>
        )}
        {!state.loading && !state.error && state.reports.length > 0 && (
          <div style={{ marginTop: 20, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#334155' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #e5e7eb' }}>Code</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #e5e7eb' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #e5e7eb' }}>Priority</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #e5e7eb' }}>Created</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #e5e7eb' }}>Report</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #e5e7eb' }}>Source</th>
                </tr>
              </thead>
              <tbody>
                {state.reports
                  .sort((a,b)=> new Date(b.createdAt||0) - new Date(a.createdAt||0))
                  .map(r => (
                  <tr key={r.id} style={{ background: '#fff' }}>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#0f172a' }}>{r.code}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>{r.type}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>{r.priority}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9', color: '#15803d', fontWeight: 600 }}>Completed</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>
                      {r.reportUrl ? (
                        <a href={toAbsoluteUrl(r.reportUrl)} target="_blank" rel="noreferrer" style={{ color: '#0369a1', textDecoration: 'underline' }}>View</a>
                      ) : (
                        <span style={{ color: '#64748b' }}>Not attached</span>
                      )}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9', color:'#64748b' }}>{r.source}</td>
                  </tr>
                ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default LabReports;
