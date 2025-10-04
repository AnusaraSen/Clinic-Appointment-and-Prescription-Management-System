import React from 'react';
import { useNavigate } from 'react-router-dom';
import InventoryDashboard from './InventoryDashboard';

const InventoryDashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="inventory-dashboard-page">
      <InventoryDashboard onNavigate={navigate} />
    </div>
  );
};

export default InventoryDashboardPage;