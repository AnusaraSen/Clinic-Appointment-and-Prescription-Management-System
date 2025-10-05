import React, { useState, useRef } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { EquipmentKPICards } from '../components/dashboard/EquipmentKPICards';
import { EquipmentListTable } from '../components/dashboard/EquipmentListTable';
import { AddEquipmentModal } from '../components/dashboard/AddEquipmentModal';

/**
 * Equipment Status Page
 * Main page for equipment management and monitoring
 */
const EquipmentStatusPage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const equipmentListRef = useRef();

  const handleAddSuccess = (newEquipment) => {
    console.log('Equipment added successfully:', newEquipment);
    
    // Close the modal
    setAddModalOpen(false);
    
    // Add equipment to the list without full refresh
    if (equipmentListRef.current) {
      equipmentListRef.current.addEquipment(newEquipment);
    } else {
      // Fallback: trigger refresh if ref is not available
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Equipment Status</h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage all clinic equipment and their maintenance status
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <button 
              onClick={handleRefresh}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button 
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Equipment</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="mb-6">
        <EquipmentKPICards key={`kpi-${refreshKey}`} />
      </div>

      {/* Equipment List Section */}
      <div>
        <EquipmentListTable 
          ref={equipmentListRef}
          refreshTrigger={refreshKey} 
        />
      </div>

      {/* Add Equipment Modal */}
      <AddEquipmentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default EquipmentStatusPage;