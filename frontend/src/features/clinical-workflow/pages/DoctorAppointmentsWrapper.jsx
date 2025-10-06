import React from 'react';
import { ClinicalLayout } from '../layouts/ClinicalLayout';
import DoctorAppointmentsPage from './DoctorAppointmentsPage';

/**
 * 🩺 Doctor Appointments Page with Clinical Sidebar
 */
const DoctorAppointmentsWrapper = () => {
  return (
    <ClinicalLayout currentPath="/doctor-appointments">
      <DoctorAppointmentsPage />
    </ClinicalLayout>
  );
};

export default DoctorAppointmentsWrapper;
