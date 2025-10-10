import React, { useState, useEffect } from 'react';
import { Plus, Filter, ChevronDown, RefreshCw, Calendar, Download, Move, Search, Eye, Grid, List, Users, ClipboardList } from 'lucide-react';
import { WorkRequestKPICards } from '../components/WorkRequestKPICards';
import { WorkRequestListTable } from '../components/WorkRequestListTable';
import { WorkRequestFilters } from '../components/WorkRequestFilters';
import { CreateWorkRequestModal } from '../components/CreateWorkRequestModal';
import { WorkRequestDetailsModal } from '../components/WorkRequestDetailsModal';
import { AssignTechnicianModal } from '../components/AssignTechnicianModal';
import { EquipmentKPICards } from '../components/EquipmentKPICards';
import { EquipmentListTable } from '../components/EquipmentListTable';
import { AddEquipmentModal } from '../components/AddEquipmentModal';
import { SimplifiedMaintenanceSchedule } from '../components/SimplifiedMaintenanceSchedule';
import { TechnicianCard } from '../components/TechnicianCard';
import { TechnicianFilters } from '../components/TechnicianFilters';
import { TechnicianDetailsModal } from '../components/TechnicianDetailsModal';
import { EditTechnicianModal } from '../components/EditTechnicianModal';
import { AssignTaskModal } from '../components/AssignTaskModal';

/**
 * Maintenance Management Page with 4-Tab Interface
 * Converted from reference MaintenanceManagement.tsx to JSX
 * Integrates existing functional components with professional styling
 */
const MaintenanceManagementPage = ({ onNavigate, defaultTab = 'requests' }) => {
  // Map legacy page names to tab values
  const mapPageToTab = (page) => {
    switch (page) {
      case 'work-requests':
        return 'requests';
      case 'equipment':
        return 'equipment';
      case 'calendar':
        return 'schedule';
      case 'technicians':
        return 'technicians';
      default:
        return page;
    }
  };

  const [activeTab, setActiveTab] = useState(mapPageToTab(defaultTab));

  // Work Requests Tab State (from WorkRequestListPage.jsx)
  const [workRequests, setWorkRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  
  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedWorkRequest, setSelectedWorkRequest] = useState(null);

  // Technician Modal States
  const [showTechnicianDetailsModal, setShowTechnicianDetailsModal] = useState(false);
  const [showTechnicianAssignModal, setShowTechnicianAssignModal] = useState(false);
  const [showTechnicianAddModal, setShowTechnicianAddModal] = useState(false);
  const [showTechnicianEditModal, setShowTechnicianEditModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  // Equipment Tab State (from EquipmentStatusPage.jsx)
  const [addEquipmentModalOpen, setAddEquipmentModalOpen] = useState(false);
  const [equipmentRefreshKey, setEquipmentRefreshKey] = useState(0);

  // Technicians Tab State (from TechnicianListPage.jsx)
  const [technicianSearchTerm, setTechnicianSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [technicianViewMode, setTechnicianViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [technicianError, setTechnicianError] = useState(null);

  // Load technicians on component mount (needed for assignment modals)
  React.useEffect(() => {
    loadTechnicians();
  }, []);

  // Load initial data when component mounts or when switching to specific tabs
  React.useEffect(() => {
    if (activeTab === 'requests') {
      loadWorkRequestsData();
    } else if (activeTab === 'technicians') {
      loadTechniciansData();
    }
  }, [activeTab]);

  // Apply filters and search
  React.useEffect(() => {
    if (activeTab === 'requests') {
      applyFiltersAndSearch();
    }
  }, [workRequests, searchTerm, filters, activeTab]);

  /**
   * Load all work requests data
   */
  const loadWorkRequestsData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadWorkRequests(),
        loadTechnicians(),
        loadEquipment()
      ]);
    } catch (error) {
      console.error('Error loading work requests data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load work requests from API
   */
  const loadWorkRequests = async () => {
    try {
      console.log('Loading work requests...');
      const response = await fetch('http://localhost:5000/api/maintenance-requests');
      if (response.ok) {
        const result = await response.json();
        console.log('Work requests loaded:', result);
        const requests = result.success && result.data ? result.data : [];
        setWorkRequests(requests);
        setFilteredRequests(requests); // Update filtered list immediately
      }
    } catch (error) {
      console.error('Error loading work requests:', error);
      // Use mock data for development
      setWorkRequests(getMockWorkRequests());
    }
  };

  /**
   * Load technicians from API
   */
  const loadTechnicians = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/technicians');
      if (response.ok) {
        const result = await response.json();
        const techData = result.success && result.data ? result.data : [];
        setTechnicians(techData);
      }
    } catch (error) {
      console.error('Error loading technicians:', error);
      setTechnicians([]);
    }
  };

  /**
   * Load equipment from API
   */
  const loadEquipment = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/equipment');
      if (response.ok) {
        const result = await response.json();
        const equipData = result.success && result.data ? result.data : [];
        setEquipment(equipData);
      }
    } catch (error) {
      console.error('Error loading equipment:', error);
      setEquipment([]);
    }
  };

  /**
   * Apply filters and search to work requests
   */
  const applyFiltersAndSearch = () => {
    let filtered = [...workRequests];

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.request_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        switch (key) {
          case 'status':
            filtered = filtered.filter(request => request.status === value);
            break;
          case 'priority':
            filtered = filtered.filter(request => request.priority === value);
            break;
          case 'assignedTo':
            filtered = filtered.filter(request => request.assignedTo === value);
            break;
        }
      }
    });

    setFilteredRequests(filtered);
  };

  /**
   * Handle create work request
   */
  const handleCreateWorkRequest = async (requestData) => {
    try {
      console.log('Creating work request with data:', requestData);
      
      const response = await fetch('http://localhost:5000/api/maintenance-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Create response:', result);
        
        // Backend returns { success: true, data: {...} }
        const newRequest = result.success && result.data ? result.data : result;
        
        // Refresh the entire list to get properly populated data
        await loadWorkRequests();
        setShowCreateModal(false);
        
        // Show success message
        alert('Maintenance request created successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert(`Failed to create request: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating work request:', error);
      alert('Failed to create maintenance request. Please try again.');
    }
  };

  /**
   * Handle update work request
   */
  const handleUpdateWorkRequest = async (id, updates) => {
    try {
      const response = await fetch(`http://localhost:5000/api/maintenance-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const text = await response.text();
      let result;
      try {
        result = text ? JSON.parse(text) : null;
      } catch (e) {
        result = text;
      }

      if (response.ok) {
        console.log('✅ Update response:', result);
        // Handle the backend response format: { success: true, data: {...} }
        if (result && result.success && result.data) {
          const updatedRequest = result.data;
          setWorkRequests(prev => prev.map(req => 
            (req.id === id || req._id === id) ? updatedRequest : req
          ));
          
          // If this request is currently selected in the details modal, update it too
          if (selectedWorkRequest && (selectedWorkRequest.id === id || selectedWorkRequest._id === id)) {
            setSelectedWorkRequest(updatedRequest);
          }
        } else {
          console.error('❌ Unexpected response format:', result);
        }
      } else {
        console.error('❌ Update request failed:', response.status, result);
      }
    } catch (error) {
      console.error('Error updating work request:', error);
    }
  };

  /**
   * Handle delete work request
   */
  const handleDeleteWorkRequest = async (request) => {
    if (!window.confirm(`Are you sure you want to delete "${request.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/maintenance-requests/${request.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setWorkRequests(prev => prev.filter(req => req.id !== request.id));
      }
    } catch (error) {
      console.error('Error deleting work request:', error);
    }
  };

  /**
   * Handle assign technician
   */
  const handleAssignTechnician = async (requestId, assignmentData) => {
    try {
      console.log('Assigning technician:', { requestId, assignmentData });
      
      const response = await fetch(`http://localhost:5000/api/maintenance-requests/${requestId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
      });

      const result = await response.json();
      console.log('Assign response:', result);
      
      if (response.ok && result && result.success) {
        // Reload the entire list to get properly populated data
        await loadWorkRequests();
        setShowAssignModal(false);
        setSelectedWorkRequest(null);
        
        // Show success message
        alert('Technician assigned successfully!');
      } else {
        console.error('Assignment failed:', result);
        alert(`Failed to assign technician: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error assigning technician:', error);
      alert('Failed to assign technician. Please try again.');
    }
  };

  // Technician Management Functions
  
  /**
   * Handle view technician details
   */
  const handleViewTechnicianDetails = (technician) => {
    setSelectedTechnician(technician);
    setShowTechnicianDetailsModal(true);
  };

  /**
   * Handle assign task to technician
   */
  const handleAssignTaskToTechnician = (technician) => {
    setSelectedTechnician(technician);
    setShowTechnicianAssignModal(true);
  };

  /**
   * Handle assign task success
   */
  const handleAssignTaskSuccess = () => {
    // Refresh data if needed
    setShowTechnicianAssignModal(false);
    setSelectedTechnician(null);
  };

  /**
   * Handle edit technician
   */
  const handleEditTechnician = (technician) => {
    setSelectedTechnician(technician);
    setShowTechnicianEditModal(true);
  };

  /**
   * Handle delete technician
   */
  const handleDeleteTechnician = async (technician) => {
    if (window.confirm(`Are you sure you want to delete technician ${technician.firstName} ${technician.lastName}? This action cannot be undone.`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/technicians/${technician._id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Refresh technicians list
          loadTechniciansData();
          console.log('Technician deleted successfully');
        } else {
          console.error('Failed to delete technician');
          alert('Failed to delete technician. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting technician:', error);
        alert('Error deleting technician. Please try again.');
      }
    }
  };

  /**
   * Handle edit technician success
   */
  const handleEditTechnicianSuccess = () => {
    // Refresh technicians list
    loadTechniciansData();
    setShowTechnicianEditModal(false);
    setSelectedTechnician(null);
  };

  // Equipment Management Functions
  
  /**
   * Handle equipment refresh
   */
  const handleEquipmentRefresh = () => {
    setEquipmentRefreshKey(prev => prev + 1);
  };

  /**
   * Handle maintenance requests refresh
   */
  const handleMaintenanceRequestsRefresh = async () => {
    setRefreshing(true);
    try {
      await loadWorkRequestsData();
    } catch (error) {
      console.error('Error refreshing maintenance requests:', error);
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Handle add equipment success
   */
  const handleAddEquipmentSuccess = (newEquipment) => {
    // Trigger refresh by updating key
    setEquipmentRefreshKey(prev => prev + 1);
    setAddEquipmentModalOpen(false);
  };

  // Technician Management Functions

  /**
   * Load technicians data for technicians tab
   */
  const loadTechniciansData = async () => {
    setLoading(true);
    setTechnicianError(null);
    try {
      await loadTechnicians();
    } catch (error) {
      console.error('Error loading technicians data:', error);
      setTechnicianError('Failed to load technician data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter technicians based on search and filter criteria
   */
  const getFilteredTechnicians = () => {
    return technicians.filter(technician => {
      // Search filter
      const searchMatch = !technicianSearchTerm || (
        `${technician.firstName} ${technician.lastName}`.toLowerCase().includes(technicianSearchTerm.toLowerCase()) ||
        technician.email?.toLowerCase().includes(technicianSearchTerm.toLowerCase()) ||
        technician.employeeId?.toLowerCase().includes(technicianSearchTerm.toLowerCase()) ||
        technician.location?.toLowerCase().includes(technicianSearchTerm.toLowerCase()) ||
        technician.department?.toLowerCase().includes(technicianSearchTerm.toLowerCase())
      );

      // Availability filter
      const availabilityMatch = !availabilityFilter || 
        technician.availabilityStatus?.toLowerCase() === availabilityFilter.toLowerCase();

      // Department filter
      const departmentMatch = !departmentFilter || 
        technician.department?.toLowerCase().includes(departmentFilter.toLowerCase());

      // Skill filter
      const skillMatch = !skillFilter || (
        technician.skills && 
        technician.skills.some(skill => 
          skill.toLowerCase().includes(skillFilter.toLowerCase())
        )
      );

      return searchMatch && availabilityMatch && departmentMatch && skillMatch;
    });
  };

  /**
   * Get status counts for technicians
   */
  const getTechnicianStatusCounts = () => {
    const counts = {
      total: technicians.length,
      available: 0,
      busy: 0,
      offline: 0,
      onLeave: 0
    };

    technicians.forEach(tech => {
      const status = tech.availabilityStatus?.toLowerCase();
      if (status === 'available') counts.available++;
      else if (status === 'busy') counts.busy++;
      else if (status === 'offline') counts.offline++;
      else if (status === 'on leave') counts.onLeave++;
    });

    return counts;
  };

  /**
   * Handle technician filters clear
   */
  const handleClearTechnicianFilters = () => {
    setTechnicianSearchTerm('');
    setAvailabilityFilter('');
    setDepartmentFilter('');
    setSkillFilter('');
    setCurrentPage(1);
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [technicianSearchTerm, availabilityFilter, departmentFilter, skillFilter]);

  // Mock data for development
  const getMockWorkRequests = () => {
    return [
      {
        id: 1,
        request_id: 'REQ-001',
        title: 'MRI Machine Calibration Required',
        description: 'Annual calibration needed for MRI machine in Radiology Department',
        priority: 'High',
        status: 'Open',
        equipment: [{ name: 'Siemens MRI Scanner' }],
        assignedTo: null,
        createdAt: new Date().toISOString()
      }
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Page Header */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Maintenance Management
                </h1>
                <p className="text-gray-600 text-lg">
                  Comprehensive maintenance operations for clinic equipment and facilities
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-6 pb-8">

      {/* Professional Tabbed Interface Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Enhanced Tab Navigation */}
        <div className="bg-gray-50 border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              className={`py-4 px-2 text-sm font-semibold transition-all duration-200 border-b-2 ${
                activeTab === 'requests'
                  ? 'text-blue-600 border-blue-600 bg-white rounded-t-lg shadow-sm'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('requests')}
            >
              <span className="flex items-center">
                <ClipboardList size={18} className="mr-2" />
                Maintenance Requests
              </span>
            </button>
            <button
              className={`py-4 px-2 text-sm font-semibold transition-all duration-200 border-b-2 ${
                activeTab === 'equipment'
                  ? 'text-blue-600 border-blue-600 bg-white rounded-t-lg shadow-sm'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('equipment')}
            >
              <span className="flex items-center">
                <Grid size={18} className="mr-2" />
                Equipment Status
              </span>
            </button>
            <button
              className={`py-4 px-2 text-sm font-semibold transition-all duration-200 border-b-2 ${
                activeTab === 'schedule'
                  ? 'text-blue-600 border-blue-600 bg-white rounded-t-lg shadow-sm'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('schedule')}
            >
              <span className="flex items-center">
                <Calendar size={18} className="mr-2" />
                Maintenance Schedule
              </span>
            </button>
            <button
              className={`py-4 px-2 text-sm font-semibold transition-all duration-200 border-b-2 ${
                activeTab === 'technicians'
                  ? 'text-blue-600 border-blue-600 bg-white rounded-t-lg shadow-sm'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('technicians')}
            >
              <span className="flex items-center">
                <Users size={18} className="mr-2" />
                Technicians
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content Areas */}
        
        {/* Tab 1: Maintenance Requests */}
        {activeTab === 'requests' && (
          <div className="p-6">
            {/* Maintenance Requests Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-800">Maintenance Requests</h2>
                  <p className="text-gray-600 mt-1">
                    Manage work requests, assign technicians, and track maintenance progress
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Maintenance Request</span>
                  </button>
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                  <button 
                    onClick={handleMaintenanceRequestsRefresh}
                    disabled={refreshing}
                    className={`px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center space-x-2 ${
                      refreshing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Work Request KPI Cards */}
            <WorkRequestKPICards 
              workRequests={workRequests}
              loading={loading}
            />

            {/* Work Request Filters */}
            <WorkRequestFilters
              onSearch={setSearchTerm}
              onFilter={setFilters}
              workRequests={workRequests}
              technicians={technicians}
              equipment={equipment}
              filters={filters}
              searchTerm={searchTerm}
            />

            {/* Work Requests Table */}
            <WorkRequestListTable
              workRequests={filteredRequests}
              onEdit={(request) => {
                setSelectedWorkRequest(request);
                setShowDetailsModal(true);
              }}
              onDelete={handleDeleteWorkRequest}
              onView={(request) => {
                setSelectedWorkRequest(request);
                setShowDetailsModal(true);
              }}
              onAssign={(request) => {
                setSelectedWorkRequest(request);
                setShowAssignModal(true);
              }}
              loading={loading}
            />
          </div>
        )}

        {/* Tab 2: Equipment Status */}
        {activeTab === 'equipment' && (
          <div className="p-6">
            {/* Equipment Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-800">Equipment Status</h2>
                  <p className="text-gray-600 mt-1">
                    Monitor and manage all clinic equipment and their maintenance status
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                  <button 
                    onClick={handleEquipmentRefresh}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Equipment KPI Cards */}
            <div className="mb-6">
              <EquipmentKPICards key={`kpi-${equipmentRefreshKey}`} />
            </div>

            {/* Equipment List Table */}
            <div>
              <EquipmentListTable 
                key={`list-${equipmentRefreshKey}`} 
                onAddEquipment={() => setAddEquipmentModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Maintenance Schedule */}
        {activeTab === 'schedule' && (
          <div className="p-6">
            <SimplifiedMaintenanceSchedule />
          </div>
        )}

        {/* Tab 4: Technicians */}
        {activeTab === 'technicians' && (
          <div className="p-6">
            {/* Technicians Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-800">Workforce Management</h2>
                  <p className="text-gray-600 mt-1">
                    Manage technicians, track availability, and assign maintenance tasks
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                  <button 
                    onClick={loadTechniciansData}
                    disabled={loading}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Status Summary Cards */}
            {(() => {
              const statusCounts = getTechnicianStatusCounts();
              return (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
                    <div className="text-sm text-gray-600">Total Technicians</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-2xl font-bold text-green-600">{statusCounts.available}</div>
                    <div className="text-sm text-gray-600">Available</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-2xl font-bold text-yellow-600">{statusCounts.busy}</div>
                    <div className="text-sm text-gray-600">Busy</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-2xl font-bold text-gray-600">{statusCounts.offline}</div>
                    <div className="text-sm text-gray-600">Offline</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-2xl font-bold text-red-600">{statusCounts.onLeave}</div>
                    <div className="text-sm text-gray-600">On Leave</div>
                  </div>
                </div>
              );
            })()}

            {/* Technician Filters */}
            <TechnicianFilters
              searchTerm={technicianSearchTerm}
              onSearchChange={setTechnicianSearchTerm}
              availabilityFilter={availabilityFilter}
              onAvailabilityChange={setAvailabilityFilter}
              departmentFilter={departmentFilter}
              onDepartmentChange={setDepartmentFilter}
              skillFilter={skillFilter}
              onSkillChange={setSkillFilter}
              viewMode={technicianViewMode}
              onViewModeChange={setTechnicianViewMode}
              onClearFilters={handleClearTechnicianFilters}
              technicians={technicians}
            />

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading technicians...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {technicianError && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-red-600 mr-3">⚠️</div>
                    <div>
                      <h3 className="text-red-800 font-medium">Error Loading Technicians</h3>
                      <p className="text-red-700 text-sm mt-1">{technicianError}</p>
                    </div>
                  </div>
                  <button
                    onClick={loadTechniciansData}
                    className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Technicians Content */}
            {!loading && !technicianError && (() => {
              const filteredTechnicians = getFilteredTechnicians();
              const totalPages = Math.ceil(filteredTechnicians.length / itemsPerPage);
              const startIndex = (currentPage - 1) * itemsPerPage;
              const paginatedTechnicians = filteredTechnicians.slice(startIndex, startIndex + itemsPerPage);

              if (filteredTechnicians.length === 0) {
                return (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Technicians Found</h3>
                    <p className="text-gray-600 mb-4">
                      {technicianSearchTerm || availabilityFilter || departmentFilter || skillFilter
                        ? 'Try adjusting your search or filter criteria.'
                        : 'No technicians have been added to the system yet.'
                      }
                    </p>
                    {(technicianSearchTerm || availabilityFilter || departmentFilter || skillFilter) && (
                      <button
                        onClick={handleClearTechnicianFilters}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <>
                  {/* Technicians Grid/List */}
                  <div className={`${technicianViewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                    : 'space-y-4'
                  }`}>
                    {paginatedTechnicians.map((technician) => (
                      <TechnicianCard
                        key={technician._id || technician.id}
                        technician={technician}
                        onViewDetails={handleViewTechnicianDetails}
                        onEdit={handleEditTechnician}
                        onDelete={handleDeleteTechnician}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center space-x-4">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      <div className="flex space-x-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                pageNum === currentPage
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      </div> {/* Main Content Container */}

      {/* Modals */}
      <CreateWorkRequestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateWorkRequest}
        equipment={equipment}
        technicians={technicians}
      />

      <WorkRequestDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedWorkRequest(null);
        }}
        workRequest={selectedWorkRequest}
        onUpdate={handleUpdateWorkRequest}
        onStatusChange={(id, status) => handleUpdateWorkRequest(id, { status })}
        technicians={technicians}
      />

      {/* Modals Section */}
      <AssignTechnicianModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedWorkRequest(null);
        }}
        workRequest={selectedWorkRequest}
        technicians={technicians}
        onAssign={handleAssignTechnician}
      />

      {/* Equipment Modals */}
      <AddEquipmentModal
        isOpen={addEquipmentModalOpen}
        onClose={() => setAddEquipmentModalOpen(false)}
        onSuccess={handleAddEquipmentSuccess}
      />

      {/* Technician Modals */}
      {showTechnicianDetailsModal && selectedTechnician && (
        <TechnicianDetailsModal
          isOpen={showTechnicianDetailsModal}
          onClose={() => {
            setShowTechnicianDetailsModal(false);
            setSelectedTechnician(null);
          }}
          technician={selectedTechnician}
        />
      )}

      {showTechnicianAssignModal && selectedTechnician && (
        <AssignTaskModal
          isOpen={showTechnicianAssignModal}
          onClose={() => {
            setShowTechnicianAssignModal(false);
            setSelectedTechnician(null);
          }}
          technician={selectedTechnician}
          onAssignSuccess={handleAssignTaskSuccess}
        />
      )}

      {showTechnicianEditModal && (
        <EditTechnicianModal
          isOpen={showTechnicianEditModal}
          onClose={() => setShowTechnicianEditModal(false)}
          onSuccess={handleEditTechnicianSuccess}
          technician={selectedTechnician}
        />
      )}
    </div>
  );
};

export default MaintenanceManagementPage;