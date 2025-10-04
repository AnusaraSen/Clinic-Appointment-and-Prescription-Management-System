import React from 'react';
import { ClinicalLayout } from '../layouts/ClinicalLayout';
import DoctorAvailability from './DoctorAvailability';

/**
 * 🩺 Doctor Calendar Page with Clinical Sidebar
 */

const DoctorCalendarPage = () => {
  return (
    <ClinicalLayout currentPath="/doctor-availability">
      <DoctorAvailability />
    </ClinicalLayout>
  );
};

export default DoctorCalendarPage;