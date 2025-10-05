import React from 'react';
import { useNavigate } from 'react-router-dom';
import LabSupervisorDashboard from '../dashboards/SupervisorDashboard';

const LabSupervisorDashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="lab-supervisor-dashboard-page">
      <LabSupervisorDashboard onNavigate={navigate} />
    </div>
  );
};

export default LabSupervisorDashboardPage;