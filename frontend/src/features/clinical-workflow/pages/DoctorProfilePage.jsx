import React from 'react';
import { ClinicalLayout } from '../layouts/ClinicalLayout';
import DoctorProfile from './DoctorProfile';

/**
 * 🩺 Doctor Profile Page with Clinical Sidebar
 */

const DoctorProfilePage = () => {
  return (
    <ClinicalLayout currentPath="/doctor-profile">
      <DoctorProfile />
    </ClinicalLayout>
  );
};

export default DoctorProfilePage;