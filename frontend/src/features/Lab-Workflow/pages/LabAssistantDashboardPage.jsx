import React from 'react';
import { useNavigate } from 'react-router-dom';
import LabAssistantDashboard from '../dashboards/LabAssistantDashboard';

const LabAssistantDashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="lab-assistant-dashboard-page">
      <LabAssistantDashboard onNavigate={navigate} />
    </div>
  );
};

export default LabAssistantDashboardPage;