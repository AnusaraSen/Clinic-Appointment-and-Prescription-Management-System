import React from 'react';
import { ClinicalLayout } from '../layouts/ClinicalLayout';
import AllPrescriptions from './prescriptions/AllPrescriptions';

/**
 * 🩺 Prescriptions Page with Clinical Sidebar
 */

const PrescriptionsPage = ({ search }) => {
  return (
    <ClinicalLayout currentPath="/prescription/all">
      <AllPrescriptions search={search} />
    </ClinicalLayout>
  );
};

export default PrescriptionsPage;