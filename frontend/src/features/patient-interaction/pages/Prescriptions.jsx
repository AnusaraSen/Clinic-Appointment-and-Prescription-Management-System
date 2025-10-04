import React from 'react';
import PatientLayout from '../components/PatientLayout';

const Prescriptions = () => {
  return (
    <PatientLayout currentPage="prescriptions">
      <h1 style={{ fontWeight: 700, fontSize: '1.6rem', color: '#111' }}>Prescriptions</h1>
      <p style={{ color: '#555' }}>This section will show all prescriptions for the patient. Coming soon.</p>
    </PatientLayout>
  );
};

export default Prescriptions;
