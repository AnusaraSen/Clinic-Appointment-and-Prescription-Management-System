import React from 'react';
import { useNavigate } from 'react-router-dom';
import SupervisorDashboard from '../dashboards/SupervisorDashboard';
import LabAssistantDashboard from '../dashboards/LabAssistantDashboard';
import { useAuth } from '../../authentication/context/AuthContext';

const RoleDashboardRouter = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access your dashboard.</p>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => navigate('/auth')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'LabSupervisor':
      return <SupervisorDashboard />;
    
    case 'LabStaff':
      return <LabAssistantDashboard />;
    
    default:
      // Default to assistant dashboard for unknown roles
      console.warn(`Unknown role: ${user.role}. Defaulting to Lab Assistant Dashboard.`);
      return <LabAssistantDashboard />;
  }
};

export default RoleDashboardRouter;