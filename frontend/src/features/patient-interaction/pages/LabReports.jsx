import React from 'react';
import PatientLayout from '../components/PatientLayout';

const LabReports = () => (
  <PatientLayout currentPage="lab-reports">
    <h1 style={{ fontWeight: 700, fontSize: '1.6rem', color: '#111' }}>Lab Reports</h1>
    <p style={{ color: '#555' }}>This section will show lab reports. Coming soon.</p>
  </PatientLayout>
);

export default LabReports;
