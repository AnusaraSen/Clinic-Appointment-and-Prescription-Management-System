import React, { useState } from 'react';
import { ClinicalLayout } from '../layouts/ClinicalLayout';
import AllPatients from './medical-records/AllPatients';

/**
 * 🩺 Medical Records Page with Clinical Sidebar
 */

const MedicalRecordsPage = ({ search: initialSearch }) => {
  const [search, setSearch] = useState(initialSearch || '');
  return (
    <ClinicalLayout currentPath="/patient/all">
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          placeholder="Search patients by code, name, email, conditions..."
          className="w-full max-w-xl px-3 py-2 border rounded text-sm"
          aria-label="Search medical records"
        />
        {search && <button onClick={()=>setSearch('')} className="px-3 py-2 text-sm border rounded">Clear</button>}
      </div>
      <AllPatients search={search} />
    </ClinicalLayout>
  );
};

export default MedicalRecordsPage;