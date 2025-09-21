import React, { useState, useEffect, useMemo } from 'react';
import '../../../styles/clinical-workflow/AllPrescriptions.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAlert } from './AlertProvider.jsx';
import ClinicalSidebar from '../../../components/ClinicalSidebar';

// For printing
import { useRef } from 'react';

function AllPrescriptions({ search = '' }) {

  const [prescriptions, setPrescriptions] = useState([]);
  const { pushAlert } = useAlert();
  const tableRef = useRef();
  // All details will be always visible in each tab (card), no expand/collapse state needed.

  useEffect(() => {
    function getPrescriptions() {
      axios.get('http://localhost:5000/prescription/get')
        .then((res) => {
          setPrescriptions(res.data);
        })
        .catch((err) => {
          pushAlert(err.message || 'Failed to load prescriptions','error');
        });
    }
    getPrescriptions();
  }, []);

    // Print handler
    const handlePrint = () => {
      if (!tableRef.current) return;

      // Grab all existing stylesheet/link tags so colors/theme are preserved
      const collectedStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map(node => node.outerHTML)
        .join('\n');

      const printContents = tableRef.current.innerHTML;
      const printWindow = window.open('', '', 'height=900,width=1400');
      if (!printWindow) return;
      printWindow.document.write(`<!DOCTYPE html><html><head><title>Prescription Report</title>
        ${collectedStyles}
        <style>
          /* Ensure background colors & bootstrap coloring are kept */
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
            a { text-decoration: none; color: inherit; }
            /* Optional: shrink font slightly for dense tables */
            table { font-size: 0.85rem; }
          }
        </style>
      </head><body>`);
      printWindow.document.write('<div class="container-fluid">');
      printWindow.document.write('<h1 class="text-center mb-4">All Prescriptions</h1>');
      printWindow.document.write(printContents);
      printWindow.document.write('</div></body></html>');
      printWindow.document.close();
      printWindow.focus();
      // Delay slightly so styles can load before print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 300);
    };

  const filtered = useMemo(() => {
    if (!search.trim()) return prescriptions;
    const q = search.toLowerCase();
    return prescriptions.filter(p => {
      const fields = [
        p.patient_ID,
        p.patient_name,
        p.doctor_Name,
        p.Diagnosis,
        p.Symptoms,
        p.Instructions,
        p.Date ? new Date(p.Date).toLocaleDateString() : ''
      ].map(v => (v || '').toString().toLowerCase());
      // Include medicine related strings
      if (Array.isArray(p.Medicines)) {
        p.Medicines.forEach(m => {
          fields.push((m.Medicine_Name||'').toLowerCase());
          fields.push((m.Dosage||'').toLowerCase());
          fields.push((m.Frequency||'').toLowerCase());
          fields.push((m.Duration||'').toLowerCase());
        });
      }
      return fields.some(f => f.includes(q));
    });
  }, [search, prescriptions]);

  return (
    <div className="clinical-main-layout">
      <ClinicalSidebar />
      
      <div className="clinical-main-content">
        <div className="all-prescriptions-wrapper">
          <div className="d-flex justify-content-between align-items-center mb-3 no-print">
            <h2 className="ap-title mb-0">All Prescriptions</h2>
            <div className="ap-header-actions" style={{ display: 'flex', gap: '0.8rem' }}>
          <Link 
            to="/add" 
            className="btn btn-ap-primary" 
            style={{ textDecoration: 'none' }}
          >
            Add Prescription
          </Link>
          <button className="btn btn-ap-primary" onClick={handlePrint} disabled={!filtered.length}>Print / Export</button>
        </div>
      </div>
      <div ref={tableRef} className="ap-tabs-grid printable-area">
        {filtered.length > 0 ? filtered.map(p => (
          <div key={p._id} className="ap-tab-card show-all">
            <div className="ap-tab-header static" role="group">
              <div className="ap-tab-header-main">
                <span className="ap-tab-patient">{p.patient_name || 'Unknown'}</span>
                <small className="ap-tab-id">ID: {p.patient_ID || '-'}</small>
              </div>
              <div className="ap-tab-meta">
                <span className="badge bg-info text-dark me-1">{p.doctor_Name || 'Doctor'}</span>
                <span className="badge bg-secondary">{p.Diagnosis || 'Diagnosis'}</span>
              </div>
            </div>
            <div className="ap-tab-body" style={{display: 'block'}}>
              <dl className="ap-fields">
                <dt>Date</dt><dd>{p.Date ? new Date(p.Date).toLocaleDateString() : '-'}</dd>
                <dt>Symptoms</dt><dd>{p.Symptoms || '-'}</dd>
                <dt>Instructions</dt><dd>{p.Instructions || '-'}</dd>
              </dl>
              <div className="ap-meds-wrapper">
                <h6 className="ap-section-title">Medicines</h6>
                {p.Medicines && p.Medicines.length ? (
                  <ul className="ap-meds-list">
                    {p.Medicines.map((m,i)=>(
                      <li key={i} className="ap-med-item">
                        <strong>{m.Medicine_Name}</strong>
                        <div className="ap-med-sub ap-med-inline">
                          <span><strong>Dosage:</strong> {m.Dosage}</span>
                          <span><strong>Frequency:</strong> {m.Frequency}</span>
                          <span><strong>Duration:</strong> {m.Duration}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <div className="text-muted small">No Medicines</div>}
              </div>
            </div>
            <div className="ap-actions mt-3 no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <Link to={`/update/${p._id}`} className="btn-ap-update me-2">Update</Link>
              <Link to={`/delete/${p._id}`} className="btn-ap-delete">Delete</Link>
            </div>
          </div>
        )) : (
          <div className="ap-empty text-center w-100 py-5">{search ? 'No matching prescriptions' : 'No prescriptions found'}</div>
        )}
      </div>
      <div className="no-print d-flex justify-content-end small text-muted mt-2">
        Showing {filtered.length} of {prescriptions.length} prescriptions
      </div>
        </div>
      </div>
    </div>
  );
}

export default AllPrescriptions;