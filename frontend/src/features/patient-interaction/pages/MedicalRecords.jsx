import React from 'react';
import PatientLayout from '../components/PatientLayout';

const MedicalRecords = () => (
  <PatientLayout currentPage="medical-records">
    <h1 style={{ fontWeight: 700, fontSize: '1.6rem', color: '#111' }}>Medical Records</h1>
    <p style={{ color: '#555' }}>This section will show medical records. Coming soon.</p>
  </PatientLayout>
);

export default MedicalRecords;
