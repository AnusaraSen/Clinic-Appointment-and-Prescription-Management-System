import React from 'react';
import { ClinicalLayout } from '../layouts/ClinicalLayout';
import AllPatients from './medical-records/AllPatients';

/**
 * 🩺 Medical Records Page with Clinical Sidebar
 */

const MedicalRecordsPage = ({ search }) => {
  return (
    <ClinicalLayout currentPath="/patient/all">
      <AllPatients search={search} />
    </ClinicalLayout>
  );
};

export default MedicalRecordsPage;