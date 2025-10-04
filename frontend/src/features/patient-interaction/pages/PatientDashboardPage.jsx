import React from 'react';
import { useNavigate } from 'react-router-dom';
import PatientDashboard from './Dashboard';

const PatientDashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="patient-dashboard-page">
      <PatientDashboard onNavigate={navigate} />
    </div>
  );
};

export default PatientDashboardPage;