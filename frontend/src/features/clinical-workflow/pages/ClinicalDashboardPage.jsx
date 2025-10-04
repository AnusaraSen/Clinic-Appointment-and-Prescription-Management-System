import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClinicalDashboard } from '../components/ClinicalDashboard';

const ClinicalDashboardPage = () => {
  const navigate = useNavigate();

  return (
    <ClinicalDashboard onNavigate={navigate} />
  );
};

export default ClinicalDashboardPage;