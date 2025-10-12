import React, { useState } from 'react';
import { ClinicalLayout } from '../layouts/ClinicalLayout';
import AllPrescriptions from './prescriptions/AllPrescriptions';

/**
 * 🩺 Prescriptions Page with Clinical Sidebar
 */

const PrescriptionsPage = ({ search: initialSearch }) => {
  const [search, setSearch] = useState(initialSearch || '');
  return (
    <ClinicalLayout currentPath="/prescription/all">
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          placeholder="Search prescriptions by patient, code, diagnosis, medicine..."
          className="w-full max-w-xl px-3 py-2 border rounded text-sm"
          aria-label="Search prescriptions"
        />
        {search && <button onClick={()=>setSearch('')} className="px-3 py-2 text-sm border rounded">Clear</button>}
      </div>
      <AllPrescriptions search={search} />
    </ClinicalLayout>
  );
};

export default PrescriptionsPage;