import React, { useState, useEffect, useMemo, useRef } from 'react';
import '../../../styles/clinical-workflow/AllPatients.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAlert } from '../prescriptions/AlertProvider.jsx';
import ClinicalSidebar from '../../../components/ClinicalSidebar';

function AllPatients({ search = '' }) {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [openTabs, setOpenTabs] = useState([]); // [{_id, patient}]
  const [activeTab, setActiveTab] = useState(null);
  const tableRef = useRef(null);
  const { pushAlert } = useAlert();

  useEffect(() => {
    function getPatients() {
      axios.get('http://localhost:5000/patient/get')
        .then((res) => {
          setPatients(res.data);
        })
        .catch((err) => {
          pushAlert(err.message || 'Failed to load patients','error');
        });
    }
    getPatients();
  }, []);

  // Print handler (mirrors prescriptions print style) preserving theme colors
  const handlePrint = () => {
    if (!tableRef.current) return;
    const collectedStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(n => n.outerHTML).join('\n');
    const printContents = tableRef.current.innerHTML;
    const w = window.open('', '', 'height=900,width=1400');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Patient Report</title>${collectedStyles}<style>@media print { body{-webkit-print-color-adjust:exact;print-color-adjust:exact;} .no-print{display:none!important;} table{font-size:0.7rem;} }</style></head><body>`);
    w.document.write('<div class="container-fluid">');
    w.document.write('<h1 class="text-center mb-3">All Patients</h1>');
    w.document.write(printContents);
    w.document.write('</div></body></html>');
    w.document.close();
    w.focus();
    setTimeout(()=>{ w.print(); w.close(); }, 300);
  };

  const filtered = useMemo(()=>{
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter(p => {
      const fields = [
        p.patient_ID,
        p.patient_name,
        p.patient_age,
        p.Gender,
        p.Email,
        p.Emergency_Contact,
        p.Allergies,
        p.Current_medical_conditions,
        p.Past_surgeries,
        p.Blood_group,
        p.Smoking_status,
        p.Alcohol_consumption
      ].map(v => (v || '').toString().toLowerCase());
      return fields.some(f => f.includes(q));
    });
  }, [search, patients]);

  // Tab open/close logic
  const openPatientTab = (patient) => {
    if (!openTabs.some(tab => tab._id === patient._id)) {
      setOpenTabs([...openTabs, { _id: patient._id, patient }]);
    }
    setActiveTab(patient._id);
  };

  const closeTab = (_id) => {
    const idx = openTabs.findIndex(tab => tab._id === _id);
    const newTabs = openTabs.filter(tab => tab._id !== _id);
    setOpenTabs(newTabs);
    
  };

  // Tab style
  const tabStyle = {
    background: 'linear-gradient(135deg, var(--pt-soft), #fff)',
    border: '1.5px solid var(--pt-border)',
    borderBottom: 'none',
    borderRadius: '16px 16px 0 0',
    padding: '0.7rem 1.5rem 0.6rem',
    marginRight: 8,
    cursor: 'pointer',
    fontWeight: 600,
    color: 'var(--pt-text)',
    boxShadow: '0 -2px 10px 0 rgba(13,140,144,0.07)',
    outline: 'none',
    position: 'relative',
    minWidth: 140,
    fontSize: '1.08rem',
    transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 8
  };
  const tabActiveStyle = {
    ...tabStyle,
    background: 'linear-gradient(135deg, var(--pt-accent), var(--pt-accent-alt))',
    color: '#fff',
    borderBottom: '3px solid var(--pt-accent)',
    boxShadow: '0 2px 16px 0 rgba(13,140,144,0.13)',
    zIndex: 2
  };
  const tabCloseBtnStyle = {
    background: 'rgba(255,255,255,0.18)',
    border: 'none',
    color: 'inherit',
    fontWeight: 'bold',
    marginLeft: 8,
    cursor: 'pointer',
    fontSize: 20,
    borderRadius: '50%',
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.18s',
    outline: 'none',
    boxShadow: 'none'
  };

  return (
    <div className="clinical-main-layout">
      <ClinicalSidebar />
      
      <div className="clinical-main-content">
        <div className="all-patients-wrapper">
          <div className="no-print" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
            <h1 style={{margin:0}}>All Patients</h1>
            <div style={{display:'flex', gap:'0.8rem', alignItems:'center'}}>
          <button
            onClick={() => navigate('/dashboard')}
            className="pt-btn pt-btn-print"
            style={{
              background: 'linear-gradient(135deg, #0b5ed7, #3b82f6)',
              color: '#fff',
              border: '1px solid #0b5ed7',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Go to Dashboard
          </button>
          <Link 
            to="/addPatient" 
            className="pt-btn pt-btn-print" 
            style={{
              background: 'linear-gradient(135deg, var(--pt-accent), var(--pt-accent-alt))',
              color: '#fff',
              border: '1px solid var(--pt-accent-alt)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Add New Record
          </Link>
          <button onClick={handlePrint} className="pt-btn pt-btn-print" disabled={!filtered.length}>Print / Export</button>
        </div>
      </div>

      {/* Tabs for patient details */}
      {openTabs.length > 0 && (
        <div className="patient-modal-overlay">
          <div className="patient-modal-container">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '22px 22px 0 0',
              background: 'linear-gradient(135deg, var(--pt-accent), var(--pt-accent-alt))',
              color: '#fff',
              padding: '1.1rem 2.2rem 1.1rem 1.7rem',
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: '.5px',
              borderBottom: '2px solid var(--pt-border)'
            }}>
              <span>{openTabs.find(tab => tab._id === activeTab)?.patient.patient_name}</span>
              <button
                onClick={() => closeTab(activeTab)}
                style={{ background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff', fontWeight: 'bold', borderRadius: '50%', width: 34, height: 34, fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Close"
                aria-label="Close tab"
              >×</button>
            </div>
            {openTabs.map(tab => (
              tab._id === activeTab && (
                <div key={tab._id} style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 400 }}>
                  {/* Left side: name, image, id, email, emergency contact */}
                  <div style={{
                    flex: '0 0 44%',
                    background: 'linear-gradient(135deg, var(--pt-accent), var(--pt-accent-alt))',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 28px',
                    borderTopLeftRadius: 16,
                    borderBottomLeftRadius: 16,
                    minHeight: 400,
                  }}>
                    {tab.patient.photo ? (
                      <img
                        src={tab.patient.photo.startsWith('data:') ? tab.patient.photo : `data:image/jpeg;base64,${tab.patient.photo}`}
                        alt="Patient"
                        style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: '50%', border: '5px solid #fff', boxShadow: '0 4px 16px 0 rgba(255,255,255,0.13)', marginBottom: 32 }}
                      />
                    ) : (
                      <div style={{ width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: '#fff', margin: '0 auto 32px auto', border: '5px solid #fff' }}>No Photo</div>
                    )}
                    <div style={{ fontWeight: 800, fontSize: 28, marginBottom: 16,alignContent:'center' }}>{tab.patient.patient_name}</div>
                    <div style={{ fontSize: 16, marginBottom: 16 }}>ID: <span style={{ fontWeight: 700 }}>{tab.patient.patient_ID}</span></div>
                    <div style={{ fontSize: 16, marginBottom: 14 }}>Email: <span style={{ fontWeight: 600 }}>{tab.patient.Email}</span></div>
                    <div style={{ fontSize: 16, marginBottom: 14 }}>Emergency: <span style={{ fontWeight: 600 }}>{tab.patient.Emergency_Contact}</span></div>
                    <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 32 }}>
                      <Link to={`/updatePatient/${tab.patient._id}`} className="pt-btn pt-btn-update" style={{ fontSize: '1rem', padding: '0.8rem 2.1rem', borderRadius: 18, background: '#fff', color: 'var(--pt-accent)', border: '2px solid #fff', textDecoration: 'none' }}>Update</Link>
                      <Link to={`/deletePatient/${tab.patient._id}`} className="pt-btn pt-btn-delete" style={{ fontSize: '1rem', padding: '0.8rem 2.1rem', borderRadius: 18, background: 'linear-gradient(135deg,#034447,#0d8c90)', color: '#fff', border: '2px solid #034447', textDecoration: 'none' }}>Delete</Link>
                    </div>
                  </div>
                  {/* Right side: other details */}
                  <div style={{
                    flex: '1 1 56%',
                    background: 'none',
                    color: '#222',
                    padding: '48px 32px',
                    borderTopRightRadius: 16,
                    borderBottomRightRadius: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minWidth: 0,
                  }}>
                    <Detail label="Age" value={tab.patient.patient_age} large={true} />
                    <Detail label="Gender" value={tab.patient.Gender} large={true} />
                    <Detail label="Allergies" value={tab.patient.Allergies || '-'} large={true} />
                    <Detail label="Current Medical Conditions" value={tab.patient.Current_medical_conditions || '-'} large={true} />
                    <Detail label="Past Surgeries" value={tab.patient.Past_surgeries || '-'} large={true} />
                    <Detail label="Blood Group" value={tab.patient.Blood_group || 'Not Specified'} large={true} />
                    <Detail label="Smoking Status" value={tab.patient.Smoking_status || '0'} large={true} />
                    <Detail label="Alcohol Consumption" value={tab.patient.Alcohol_consumption || '0'} large={true} last={true} />
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      <div ref={tableRef} style={openTabs.length > 0 ? { filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none', transition: 'filter 0.2s' } : { transition: 'filter 0.2s' }}>
  <table className="patients-table" style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Patient ID</th>
              <th style={{ width: '12%' }}>Patient Name</th>
              <th style={{ width: '5%' }}>Age</th>
              <th style={{ width: '7%' }}>Gender</th>
              <th style={{ width: '15%' }}>Email</th>
              <th style={{ width: '11%' }}>Emergency Contact</th>
              <th style={{ width: '12%' }}>Allergies</th>
              <th style={{ width: '15%' }}>Current Medical Conditions</th>
              <th style={{ width: '11%' }}>Past Surgeries</th>
              <th style={{ width: '7%' }}>Blood Group</th>
              <th style={{ width: '6%' }}>Smoking Status</th>
              <th style={{ width: '6%' }}>Alcohol Consumption</th>
              <th style={{ width: '110px' }}>Photo</th>
              
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map((patient) => (
              <tr key={patient._id} style={{ cursor: 'pointer' }} onClick={e => { if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') openPatientTab(patient); }}>
                <td>{patient.patient_ID}</td>
                <td>{patient.patient_name}</td>
                <td>{patient.patient_age}</td>
                <td>{patient.Gender}</td>
                <td>{patient.Email}</td>
                <td>{patient.Emergency_Contact}</td>
                <td>{patient.Allergies || "-"}</td>
                <td>{patient.Current_medical_conditions || "-"}</td>
                <td>{patient.Past_surgeries || "-"}</td>
                <td>{patient.Blood_group || "Not Specified"}</td>
                <td>{patient.Smoking_status || "0"}</td>
                <td>{patient.Alcohol_consumption || "0"}</td>
                <td style={{ width: '110px' }}>
                  {patient.photo ? (
                    <img
                      src={patient.photo.startsWith('data:') ? patient.photo : `data:image/jpeg;base64,${patient.photo}`}
                      alt="Patient"
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    <span>No Photo</span>
                  )}
                </td>
                
              </tr>
            )) : (
              <tr>
                <td colSpan="12" className="text-center">{search ? 'No matching patients' : 'Loading Medical Records....'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="no-print small text-muted" style={{marginTop:'0.6rem', textAlign:'right'}}>Showing {filtered.length} of {patients.length} patients</div>
        </div>
      </div>
    </div>
  );

}

// Helper for detail rows
function Detail({ label, value, large, last }) {
  // Font size reduced by 2pt, add divider except for last row
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: last ? (large ? 10 : 6) : (large ? 10 : 6),
      paddingBottom: last ? 0 : (large ? 12 : 8),
      borderBottom: last ? 'none' : '1.2px solid #e3e8ee',
      minHeight: large ? 36 : 28
    }}>
      <div style={{
        width: large ? 170 : 140,
        color: '#7a8a9a',
        fontWeight: 600,
        fontSize: large ? 18 : 13,
        letterSpacing: '.01em',
        textAlign: 'right',
        paddingRight: 18
      }}>{label}:</div>
      <div style={{
        color: '#1a232b',
        fontWeight: 600,
        fontSize: large ? 18 : 13,
        wordBreak: 'break-word',
        flex: 1
      }}>{value}</div>
    </div>
  );
}

export default AllPatients;