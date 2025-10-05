import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../components/Dashboard';
import ProfessionalLayout from '../../../shared/components/layout/ProfessionalLayout';

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  return (
    <ProfessionalLayout>
      <AdminDashboard onNavigate={navigate} />
    </ProfessionalLayout>
  );
};

export default AdminDashboardPage;