import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Wrench, Shield, Search, Filter, Plus, Edit, Trash2, MoreVertical } from 'lucide-react';
import { EditEquipmentModal } from './EditEquipmentModal';
import { DeleteEquipmentModal } from './DeleteEquipmentModal';

/**
 * Equipment List Table Component
 * Displays all equipment with status indicators, search, and filtering
 */
export const EquipmentListTable = forwardRef(({ refreshTrigger, onEquipmentUpdate, onAddEquipment }, ref) => {
  // State management
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  // Fetch equipment data - refetch when refreshTrigger changes
  useEffect(() => {
    fetchEquipment();
  }, [refreshTrigger]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/equipment');
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Equipment List - Got data from backend:', result);
      
      if (result.success && result.data) {
        setEquipment(result.data);
      } else {
        console.warn('No equipment data found');
        setEquipment([]);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setError('Failed to load equipment data');
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handleEditEquipment = (equipmentItem) => {
    setSelectedEquipment(equipmentItem);
    setEditModalOpen(true);
  };

  const handleDeleteEquipment = (equipmentItem) => {
    setSelectedEquipment(equipmentItem);
    setDeleteModalOpen(true);
  };

  const handleEditSuccess = (updatedEquipment) => {
    // Update the equipment in the list
    setEquipment(prev => 
      prev.map(item => 
        (item._id || item.id) === (updatedEquipment._id || updatedEquipment.id) ? updatedEquipment : item
      )
    );
    
    // Notify parent component
    if (onEquipmentUpdate) {
      onEquipmentUpdate('update', updatedEquipment);
    }
  };

  const handleDeleteSuccess = (deletedEquipmentId) => {
    // Remove the equipment from the list
    setEquipment(prev => 
      prev.filter(item => (item._id || item.id) !== deletedEquipmentId)
    );
    
    // Notify parent component
    if (onEquipmentUpdate) {
      onEquipmentUpdate('delete', { id: deletedEquipmentId });
    }
  };

  // Function to handle adding new equipment (called from parent)
  const handleAddSuccess = (newEquipment) => {
    console.log('Adding new equipment to list:', newEquipment);
    
    // Check if equipment already exists to avoid duplicates
    const equipmentId = newEquipment._id || newEquipment.id || newEquipment.equipment_id;
    const exists = equipment.some(item => 
      (item._id || item.id || item.equipment_id) === equipmentId ||
      item.equipment_id === newEquipment.equipment_id
    );
    
    if (!exists) {
      setEquipment(prev => [...prev, newEquipment]);
      console.log('Equipment added to list successfully');
    } else {
      console.log('Equipment already exists in list, skipping duplicate');
      // Refresh the list to ensure data consistency
      fetchEquipment();
    }
    
    // Notify parent component
    if (onEquipmentUpdate) {
      onEquipmentUpdate('add', newEquipment);
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    addEquipment: handleAddSuccess,
    refreshEquipment: fetchEquipment
  }));

  const closeModals = () => {
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedEquipment(null);
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'Operational':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          badge: 'bg-green-100 text-green-800',
          text: 'Operational'
        };
      case 'Under Maintenance':
        return {
          icon: <Wrench className="h-5 w-5 text-yellow-500" />,
          badge: 'bg-yellow-100 text-yellow-800',
          text: 'Under Maintenance'
        };
      case 'Out of Service':
        return {
          icon: <Clock className="h-5 w-5 text-gray-500" />,
          badge: 'bg-gray-100 text-gray-800',
          text: 'Out of Service'
        };
      case 'Needs Repair':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          badge: 'bg-red-100 text-red-800',
          text: 'Needs Repair'
        };
      case 'Scheduled for Maintenance':
        return {
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          badge: 'bg-blue-100 text-blue-800',
          text: 'Scheduled'
        };
      default:
        return {
          icon: <Activity className="h-5 w-5 text-gray-500" />,
          badge: 'bg-gray-100 text-gray-800',
          text: status || 'Unknown'
        };
    }
  };

  // Filter equipment based on search and filters
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesType = !typeFilter || item.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEquipment = filteredEquipment.slice(startIndex, startIndex + itemsPerPage);

  // Get unique types for filter dropdown
  const uniqueTypes = [...new Set(equipment.map(item => item.type).filter(Boolean))];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading equipment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-8">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchEquipment}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Equipment Inventory</h2>
            <p className="text-sm text-gray-600">
              Manage all clinic equipment and their maintenance status
            </p>
          </div>
          
          <button 
            onClick={onAddEquipment}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </button>
        </div>

        {/* Filters and Search */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option key="status-all" value="">All Status</option>
            <option key="status-operational" value="Operational">Operational</option>
            <option key="status-under-maintenance" value="Under Maintenance">Under Maintenance</option>
            <option key="status-out-of-service" value="Out of Service">Out of Service</option>
            <option key="status-needs-repair" value="Needs Repair">Needs Repair</option>
            <option key="status-scheduled" value="Scheduled for Maintenance">Scheduled</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option key="types-all" value="">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setTypeFilter('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {paginatedEquipment.length} of {filteredEquipment.length} equipment
          {searchTerm || statusFilter || typeFilter ? ' (filtered)' : ''}
        </p>
      </div>

      {/* Equipment Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Serial Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedEquipment.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center">
                  <div className="text-gray-500">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No equipment found</p>
                    <p className="text-sm mt-1">
                      {searchTerm || statusFilter || typeFilter 
                        ? 'Try adjusting your filters' 
                        : 'Add some equipment to get started'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedEquipment.map((item) => {
                const statusInfo = getStatusInfo(item.status);
                return (
                  <tr key={`${item._id || item.id || item.equipment_id}-${item.equipment_id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {item.name}
                            </p>
                            {item.isCritical && (
                              <Shield className="h-4 w-4 text-purple-500" title="Critical Equipment" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{item.equipment_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {statusInfo.icon}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.badge}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.location || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.type || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.modelNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.serialNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditEquipment(item)}
                          className="text-blue-600 hover:text-blue-900" 
                          title="Edit Equipment"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEquipment(item)}
                          className="text-red-600 hover:text-red-900" 
                          title="Delete Equipment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" title="More Options">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <p className="text-sm text-gray-600">
              {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredEquipment.length)} of {filteredEquipment.length}
            </p>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      <EditEquipmentModal
        isOpen={editModalOpen}
        onClose={closeModals}
        onSuccess={handleEditSuccess}
        equipment={selectedEquipment}
      />

      {/* Delete Equipment Modal */}
      <DeleteEquipmentModal
        isOpen={deleteModalOpen}
        onClose={closeModals}
        onConfirm={handleDeleteSuccess}
        equipment={selectedEquipment}
      />
    </div>
  );
});