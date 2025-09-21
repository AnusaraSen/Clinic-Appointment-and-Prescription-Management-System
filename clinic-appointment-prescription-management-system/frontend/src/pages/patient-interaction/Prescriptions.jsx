import React from 'react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';

const Prescriptions = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Topbar />
        <main style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>
          <h1 style={{ fontWeight: 700, fontSize: '1.6rem', color: '#111' }}>Prescriptions</h1>
          <p style={{ color: '#555' }}>This section will show all prescriptions for the patient. Coming soon.</p>
        </main>
      </div>
    </div>
  );
};

export default Prescriptions;
