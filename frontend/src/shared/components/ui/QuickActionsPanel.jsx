import React, { useState } from 'react';
import { 
  Wrench, 
  Settings, 
  Users, 
  UserCog, 
  Calendar, 
  BarChart3, 
  ExternalLink, 
  ArrowRight,
  PlusCircle,
  List,
  Monitor,
  Plus,
  UserPlus
} from 'lucide-react';

// Import existing modals
import { AddMaintenanceRequestForm } from '../../../features/equipment-maintenance/components/AddMaintenanceRequestForm';
import { AddEquipmentModal } from '../../../features/equipment-maintenance/components/AddEquipmentModal';
import { AssignTechnicianModal } from './modals/AssignTechnicianModal';
import AddUserModal from '../../../features/admin-management/components/AddUserModal';

/**
 * QuickActionsPanel - Navigation shortcuts to key sections
 * Provides easy access to main application areas with professional styling
 */
export const QuickActionsPanel = ({ onNavigate, onOpenModal }) => {
  // Modal state management
  const [modals, setModals] = useState({
    createWorkRequest: false,
    addEquipment: false,
    assignTechnician: false,
    addUser: false
  });

  // Selected data for modals
  const [selectedData, setSelectedData] = useState({
    requestId: null,
    equipmentId: null
  });

  /**
   * Handle navigation to different sections
   */
  const handleNavigation = (path, description) => {
    console.log(`Navigating to: ${path} - ${description}`);
    if (onNavigate) {
      onNavigate(path);
    }
  };

  /**
   * Handle modal opening
   */
  const handleOpenModal = (modalType, data = {}) => {
    console.log(`Opening modal: ${modalType}`, data);
    setSelectedData(data);
    setModals(prev => ({
      ...prev,
      [modalType]: true
    }));
  };

  /**
   * Handle modal closing
   */
  const handleCloseModal = (modalType) => {
    setModals(prev => ({
      ...prev,
      [modalType]: false
    }));
    setSelectedData({ requestId: null, equipmentId: null });
  };

  /**
   * Handle modal success (refresh data if needed)
   */
  const handleModalSuccess = (modalType, data) => {
    console.log(`${modalType} completed successfully:`, data);
    handleCloseModal(modalType);
    // Could trigger data refresh here if needed
  };

  /**
   * Navigation action items with comprehensive routing
   */
  const navigationActions = [
    {
      id: 'maintenance-requests',
      label: 'Maintenance Requests',
      description: 'View and manage all maintenance requests',
      icon: Wrench,
      path: '/maintenance-management',
      color: 'blue',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200'
    },
    {
      id: 'equipment-management',
      label: 'Equipment Management',
      description: 'Monitor and manage clinic equipment',
      icon: Settings,
      path: '/equipment-management',
      color: 'orange',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200'
    },
    {
      id: 'user-management',
      label: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      path: '/user-management',
      color: 'green',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-800',
      borderColor: 'border-green-200'
    },
    {
      id: 'technician-dashboard',
      label: 'Technician Dashboard',
      description: 'View technician workload and assignments',
      icon: UserCog,
      path: '/technician-dashboard',
      color: 'purple',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-200'
    },
    {
      id: 'appointments',
      label: 'Appointments',
      description: 'Schedule and manage appointments',
      icon: Calendar,
      path: '/appointments',
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100',
      iconColor: 'text-indigo-600',
      textColor: 'text-indigo-800',
      borderColor: 'border-indigo-200'
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      description: 'View performance metrics and reports',
      icon: BarChart3,
      path: '/analytics',
      color: 'teal',
      bgColor: 'bg-teal-50',
      hoverColor: 'hover:bg-teal-100',
      iconColor: 'text-teal-600',
      textColor: 'text-teal-800',
      borderColor: 'border-teal-200'
    }
  ];

  /**
   * Quick access shortcuts for frequently used features
   */
  const quickShortcuts = [
    {
      id: 'view-all-requests',
      label: 'All Requests',
      description: 'View complete maintenance request list',
      icon: List,
      action: () => handleNavigation('/maintenance-management', 'View all maintenance requests'),
      color: 'blue'
    },
    {
      id: 'equipment-status',
      label: 'Equipment Status',
      description: 'Check equipment operational status',
      icon: Monitor,
      action: () => handleNavigation('/equipment-management', 'Check equipment status'),
      color: 'orange'
    },
    {
      id: 'active-users',
      label: 'Active Users',
      description: 'View currently active system users',
      icon: Users,
      action: () => handleNavigation('/user-management', 'View active users'),
      color: 'green'
    },
    {
      id: 'create-request',
      label: 'New Request',
      description: 'Create new maintenance request',
      icon: Plus,
      action: () => handleOpenModal('createWorkRequest'),
      color: 'blue'
    }
  ];

  /**
   * Modal action shortcuts - Direct access to creation forms
   */
  const modalActions = [
    {
      id: 'add-equipment',
      label: 'Add Equipment',
      description: 'Register new clinic equipment',
      icon: Settings,
      action: () => handleOpenModal('addEquipment'),
      color: 'orange',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200'
    },
    {
      id: 'add-user',
      label: 'Add User',
      description: 'Create new user account',
      icon: UserPlus,
      action: () => handleOpenModal('addUser'),
      color: 'green',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-800',
      borderColor: 'border-green-200'
    },
    {
      id: 'create-work-request',
      label: 'Work Request',
      description: 'Create maintenance work order',
      icon: Wrench,
      action: () => handleOpenModal('createWorkRequest'),
      color: 'blue',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-bold text-gray-900">
            Quick Actions
          </h2>
        </div>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          Navigation + Modals
        </span>
      </div>

      {/* Main Navigation Actions */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Main Sections
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {navigationActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleNavigation(action.path, action.description)}
                className={`group p-3 rounded-lg border-2 border-dashed transition-all duration-200 text-left w-full ${action.bgColor} ${action.hoverColor} ${action.borderColor} hover:border-solid hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`h-4 w-4 ${action.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${action.textColor} group-hover:font-semibold transition-all`}>
                        {action.label}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5 truncate">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className={`h-4 w-4 ${action.iconColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal Actions Section */}
      <div className="p-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Create New
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {modalActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`group p-3 rounded-lg border transition-all duration-200 text-left w-full ${action.bgColor} ${action.hoverColor} ${action.borderColor} hover:shadow-md`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded ${action.bgColor} group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`h-4 w-4 ${action.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${action.textColor} group-hover:font-semibold transition-all`}>
                      {action.label}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {action.description}
                    </p>
                  </div>
                  <Plus className={`h-3 w-3 ${action.iconColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Shortcuts Section */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Quick Shortcuts
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {quickShortcuts.map((shortcut) => {
            const IconComponent = shortcut.icon;
            const colorClasses = {
              blue: 'bg-blue-500 hover:bg-blue-600 text-white',
              orange: 'bg-orange-500 hover:bg-orange-600 text-white',
              green: 'bg-green-500 hover:bg-green-600 text-white',
              purple: 'bg-purple-500 hover:bg-purple-600 text-white'
            };
            
            return (
              <button
                key={shortcut.id}
                onClick={shortcut.action}
                className={`group p-3 rounded-lg transition-all duration-200 text-center ${colorClasses[shortcut.color]} hover:shadow-lg hover:scale-105`}
                title={shortcut.description}
              >
                <div className="flex flex-col items-center">
                  <IconComponent className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium leading-tight">
                    {shortcut.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Quick access to main sections and creation forms
          </p>
          <span className="text-xs text-gray-400">
            Phase 5C ✨
          </span>
        </div>
      </div>

      {/* Modal Components */}
      
      {/* Create Work Request Modal */}
      {modals.createWorkRequest && (
        <AddMaintenanceRequestForm
          isOpen={modals.createWorkRequest}
          onClose={() => handleCloseModal('createWorkRequest')}
          onSuccess={(data) => handleModalSuccess('createWorkRequest', data)}
        />
      )}

      {/* Add Equipment Modal */}
      {modals.addEquipment && (
        <AddEquipmentModal
          isOpen={modals.addEquipment}
          onClose={() => handleCloseModal('addEquipment')}
          onSuccess={(data) => handleModalSuccess('addEquipment', data)}
        />
      )}

      {/* Assign Technician Modal */}
      {modals.assignTechnician && selectedData.requestId && (
        <AssignTechnicianModal
          isOpen={modals.assignTechnician}
          request={{ _id: selectedData.requestId }}
          onClose={() => handleCloseModal('assignTechnician')}
          onSuccess={(data) => handleModalSuccess('assignTechnician', data)}
        />
      )}

      {/* Add User Modal */}
      {modals.addUser && (
        <AddUserModal
          isOpen={modals.addUser}
          onClose={() => handleCloseModal('addUser')}
          onSuccess={(data) => handleModalSuccess('addUser', data)}
        />
      )}

    </div>
  );
};

export default QuickActionsPanel;