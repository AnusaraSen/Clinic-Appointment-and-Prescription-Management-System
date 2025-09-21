import React, { useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Topbar.css';

const Topbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [patientId, setPatientId] = useState(null);
  const [patient, setPatient] = useState(null);

  const getInitials = (name) => {
    if (!name) return 'P';
    const parts = String(name).trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase() || 'P';
  };

  // Resolve a patient id from localStorage, current URL, or patient code
  useEffect(() => {
    const resolvePatient = async () => {
      // 1) From localStorage
      let pid = localStorage.getItem('patientId');
      if (!pid) {
        // 2) From current URL /patient/:id
        const match = location.pathname.match(/^\/patient\/([a-f\d]{24})$/i);
        if (match && match[1]) {
          pid = match[1];
          localStorage.setItem('patientId', pid);
        }
      }
      if (!pid) {
        // 3) Resolve with patient code via backend
        const search = new URLSearchParams(location.search);
        const code = search.get('code') || localStorage.getItem('patientCode');
        if (code) {
          const endpoints = [
            `http://localhost:5000/patients/code/${code}`,
            `http://127.0.0.1:5000/patients/code/${code}`,
            `/patients/code/${code}`,
          ];
          for (const url of endpoints) {
            try {
              const res = await axios.get(url, { timeout: 5000 });
              const data = res?.data;
              const resolvedId = data?.id || data?._id;
              if (resolvedId) {
                pid = resolvedId;
                localStorage.setItem('patientId', pid);
                break;
              }
            } catch { /* next */ }
          }
        }
      }
      if (pid) setPatientId(pid);
    };
    resolvePatient();
  }, [location.pathname, location.search]);

  // Fetch patient details when we have an id
  const patientEndpoints = useMemo(() => patientId ? [
    `http://localhost:5000/patients/id/${patientId}`,
    `http://127.0.0.1:5000/patients/id/${patientId}`,
    `/patients/id/${patientId}`,
  ] : [], [patientId]);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return;
      for (const url of patientEndpoints) {
        try {
          const res = await axios.get(url, { timeout: 5000 });
          if (res?.data) {
            setPatient(res.data);
            return;
          }
        } catch { /* try next */ }
      }
    };
    fetchPatient();
  }, [patientId, patientEndpoints]);

  const handleProfileClick = async () => {
    // 1) If we already know a patient id, use it
    const pid = localStorage.getItem('patientId') || patientId;
    if (pid) return navigate(`/patient/${pid}`);

    // 2) Try to derive from current URL if we're on /patient/:id
    const m = location.pathname.match(/^\/patient\/([a-f\d]{24})$/i);
    if (m && m[1]) {
      localStorage.setItem('patientId', m[1]);
      return navigate(`/patient/${m[1]}`);
    }

    // 3) Try to resolve via patient code from URL or localStorage
    const search = new URLSearchParams(location.search);
    const code = search.get('code') || localStorage.getItem('patientCode');
    if (code) {
      const endpoints = [
        `http://localhost:5000/patients/code/${code}`,
        `http://127.0.0.1:5000/patients/code/${code}`,
        `/patients/code/${code}`,
      ];
      for (const url of endpoints) {
        try {
          const res = await axios.get(url, { timeout: 5000 });
          const data = res?.data;
          const resolvedId = data?.id || data?._id;
          if (resolvedId) {
            localStorage.setItem('patientId', resolvedId);
            return navigate(`/patient/${resolvedId}`);
          }
        } catch (_e) {
          // try next endpoint
        }
      }
    }

    // 4) Last resort: go to dashboard
    navigate('/dashboard');
  };
  return (
    <header className="topbar">
      <div className="topbar-title">My Account</div>
      <div className="topbar-actions">
        <Bell size={22} color="#008080" style={{ marginRight: 24, cursor: 'pointer' }} />
        <div className="topbar-user" onClick={handleProfileClick} style={{ cursor: 'pointer' }} title="View profile">
          {patient?.avatar ? (
            <img src={patient.avatar} alt={patient?.name || 'Patient'} />
          ) : (
            <div className="topbar-user-initials">{getInitials(patient?.name)}</div>
          )}
          <div className="topbar-user-texts">
            <div className="topbar-user-name">{patient?.name || 'Patient'}</div>
            <div className="topbar-user-sub">{patient?.email || (patient?.phone ? patient.phone : (patientId ? `ID: ${patientId}` : 'View profile'))}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
