import React, { useState, useEffect } from 'react';
import { Users, Plus, RefreshCw, Grid, List, AlertCircle } from 'lucide-react';
import { TechnicianCard } from '../components/TechnicianCard';
import { TechnicianFilters } from '../components/TechnicianFilters';
import { TechnicianDetailsModal } from '../components/TechnicianDetailsModal';
import { AssignTaskModal } from '../components/AssignTaskModal';
import { AddTechnicianModal } from '../components/AddTechnicianModal';

/**
 * Technician List Page
 * Main page for technician management and workforce overview
 */
const TechnicianListPage = () => {
  // State management
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  
  // UI states
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  // Fetch technicians data
  useEffect(() => {
    fetchTechnicians();
  }, []);

  // Debug modal states
  useEffect(() => {
    console.log('🔬 Modal states:', {
      showDetailsModal,
      showAssignModal,
      showAddModal,
      selectedTechnician: selectedTechnician ? `${selectedTechnician.firstName} ${selectedTechnician.lastName}` : null
    });
  }, [showDetailsModal, showAssignModal, showAddModal, selectedTechnician]);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching technicians...');
      const response = await fetch('http://localhost:5000/api/technicians');
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Technicians data:', result);
      
      if (result.success && result.data) {
        setTechnicians(result.data);
      } else {
        console.warn('No technician data found');
        setTechnicians([]);
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
      setError('Failed to load technician data');
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter technicians based on search and filter criteria
  const filteredTechnicians = technicians.filter(technician => {
    // Search filter
    const searchMatch = !searchTerm || (
      `${technician.firstName} ${technician.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technician.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technician.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technician.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technician.department?.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Pagination
  const totalPages = Math.ceil(filteredTechnicians.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTechnicians = filteredTechnicians.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, availabilityFilter, departmentFilter, skillFilter]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setAvailabilityFilter('');
    setDepartmentFilter('');
    setSkillFilter('');
  };

  // Handle technician actions
  const handleViewDetails = (technician) => {
    try {
      console.log('🔍 View details for:', technician);
      setSelectedTechnician(technician);
      setShowDetailsModal(true);
      console.log('✅ Details modal should open');
    } catch (error) {
      console.error('❌ Error in handleViewDetails:', error);
    }
  };

  const handleAssignTask = (technician) => {
    try {
      console.log('📋 Assign task to:', technician);
      setSelectedTechnician(technician);
      setShowAssignModal(true);
      console.log('✅ Assign task modal should open');
    } catch (error) {
      console.error('❌ Error in handleAssignTask:', error);
    }
  };

  const handleAddTechnician = () => {
    try {
      console.log('➕ Add new technician clicked');
      console.log('Current showAddModal state:', showAddModal);
      console.log('Setting showAddModal to true');
      setShowAddModal(true);
      console.log('✅ Add technician modal should open, showAddModal:', true);
      
      // Temporary alert to confirm the button is working
      alert('Add Technician button clicked! Check console for modal state.');
    } catch (error) {
      console.error('❌ Error in handleAddTechnician:', error);
    }
  };

  // Handle modal close
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTechnician(null);
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedTechnician(null);
  };

  // Handle add technician modal close
  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  // Handle successful technician creation
  const handleAddSuccess = (newTechnician) => {
    handleCloseAddModal();
    // Refresh technicians data to include the new technician
    fetchTechnicians();
  };

  // Handle successful task assignment
  const handleAssignmentSuccess = () => {
    handleCloseAssignModal();
    // Refresh technicians data to get updated availability
    fetchTechnicians();
  };

  // Get availability status counts for summary
  const getStatusCounts = () => {
    const counts = {
      total: technicians.length,
      available: 0,
      busy: 0,
      onLeave: 0,
      offDuty: 0
    };

    technicians.forEach(tech => {
      const status = tech.availabilityStatus?.toLowerCase();
      switch (status) {
        case 'available':
          counts.available++;
          break;
        case 'busy':
          counts.busy++;
          break;
        case 'on leave':
        case 'leave':
          counts.onLeave++;
          break;
        case 'off duty':
          counts.offDuty++;
          break;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading technicians...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workforce Management</h1>
            <p className="text-gray-600 mt-1">
              Manage technicians, track availability, and assign maintenance tasks
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <button 
              onClick={fetchTechnicians}
              disabled={loading}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={handleAddTechnician}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Technician</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{statusCounts.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-xl font-bold text-green-600">{statusCounts.available}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Busy</p>
              <p className="text-xl font-bold text-yellow-600">{statusCounts.busy}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">On Leave</p>
              <p className="text-xl font-bold text-red-600">{statusCounts.onLeave}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Off Duty</p>
              <p className="text-xl font-bold text-gray-600">{statusCounts.offDuty}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <TechnicianFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        availabilityFilter={availabilityFilter}
        setAvailabilityFilter={setAvailabilityFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        skillFilter={skillFilter}
        setSkillFilter={setSkillFilter}
        onClearFilters={handleClearFilters}
        totalCount={technicians.length}
        filteredCount={filteredTechnicians.length}
      />

      {/* View Mode Toggle and Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          {filteredTechnicians.length === 0 ? (
            'No technicians found'
          ) : (
            `${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredTechnicians.length)} of ${filteredTechnicians.length} technicians`
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={fetchTechnicians}
              className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Technicians Grid/List */}
      {filteredTechnicians.length === 0 && !loading && !error ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Technicians Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || availabilityFilter || departmentFilter || skillFilter
              ? 'Try adjusting your search or filter criteria.'
              : 'No technicians have been added to the system yet.'
            }
          </p>
          {(searchTerm || availabilityFilter || departmentFilter || skillFilter) && (
            <button
              onClick={handleClearFilters}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={`${viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }`}>
            {paginatedTechnicians.map((technician) => (
              <TechnicianCard
                key={technician._id}
                technician={technician}
                onViewDetails={handleViewDetails}
                onAssignTask={handleAssignTask}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                {totalPages > 5 && (
                  <>
                    <span className="text-gray-400">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === totalPages
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {console.log('🔍 Rendering modals with states:', { 
        showDetailsModal, 
        showAssignModal, 
        showAddModal,
        selectedTechnician: selectedTechnician?.firstName 
      })}
      
      <TechnicianDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        technician={selectedTechnician}
      />

      <AssignTaskModal
        isOpen={showAssignModal}
        onClose={handleCloseAssignModal}
        onSuccess={handleAssignmentSuccess}
        technician={selectedTechnician}
      />

      {showAddModal && console.log('🎯 AddTechnicianModal should be visible!')}
      <AddTechnicianModal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default TechnicianListPage;