import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Edit, Trash2, Wrench, Plus, UserPlus } from 'lucide-react';
import { AddMaintenanceRequestForm } from '../../../features/equipment-maintenance/components/AddMaintenanceRequestForm';
import { AssignTechnicianModal } from './modals/AssignTechnicianModal';
import { EditMaintenanceRequestModal } from '../../../features/equipment-maintenance/components/EditMaintenanceRequestModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

/**
 * Work Requests Table - Shows all maintenance requests from your backend! 🔧
 * Now with add functionality for creating new maintenance requests
 */
export const WorkRequestsTable = ({ showActions = true, showAddButton = true, onNavigate }) => {
  console.log('SHARED WorkRequestsTable: Component mounted/rendered with props:', { showActions, showAddButton, onNavigate });
  
  // State to hold our maintenance requests from the backend
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  //  State to control the add form modal
  const [showAddForm, setShowAddForm] = useState(false);
  
  //  State to control the assignment modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  //  State to control the edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRequest, setEditRequest] = useState(null);
  
  //  State to control the delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRequest, setDeleteRequest] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Admin IDs for permission checking (all 3 admins)
  const ADMIN_IDS = [
    '68b2d9e68ec1571a1d749e2b', // Nimal
    '68b2df4f8ec1571a1d749e3a', // Admin Ramesh  
    '68b2df4f8ec1571a1d749e3b'  // Admin Nadeesha
  ];
  const currentUserId = '68b2d9e68ec1571a1d749e2b'; // Hardcoded for Sprint 1
  
  // 🔐 Check if current user is admin
  const isAdmin = ADMIN_IDS.includes(currentUserId);

  // Fetch maintenance requests from your backend when component loads
  useEffect(() => {
    fetchRequests();
  }, []);

  // 🌐 Function to fetch requests from your backend
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/maintenance-requests');
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('WorkRequestsTable - Got data from backend:', result);
      
      // Handle the backend response format: { success: true, data: [...] }
      if (result.success && result.data) {
        setRequests(result.data);
      } else {
        throw new Error('Unexpected response format from backend');
      }
    } catch (err) {
      console.error('Error fetching maintenance requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 📝 Handle successful form submission
  const handleFormSuccess = () => {
    setShowAddForm(false);
    fetchRequests(); // Refresh the table data
  };

  // 👥 Handle assignment modal operations
  const handleAssignRequest = (request) => {
    setSelectedRequest(request);
    setShowAssignModal(true);
  };

  const handleAssignmentSuccess = () => {
    setShowAssignModal(false);
    setSelectedRequest(null);
    fetchRequests(); // Refresh the table to show updated assignment
  };

  // ✏️ Handle edit modal operations  
  const handleEditRequest = (request) => {
    setEditRequest(request);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditRequest(null);
    fetchRequests(); // Refresh the table to show updated data
  };

  // 🗑️ Handle delete modal operations
  const handleDeleteRequest = (request) => {
    setDeleteRequest(request);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (requestId) => {
    try {
      setDeleteLoading(true);
      
      // Call the DELETE API endpoint
      const response = await fetch(`http://localhost:5000/api/maintenance-requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success! Close modal and refresh table
        setShowDeleteModal(false);
        setDeleteRequest(null);
        fetchRequests(); // Refresh the table to remove deleted item
        
        // Could add a success toast here in the future
        console.log('✅ Request deleted successfully:', result.message);
      } else {
        // Handle API error
        console.error('❌ Delete failed:', result.message);
        alert(`Failed to delete request: ${result.message}`);
      }
    } catch (error) {
      // Handle network or other errors
      console.error('❌ Delete error:', error);
      alert('Failed to delete request. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteRequest(null);
  };

  // Helper function to show priority with enhanced styling
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-200">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800 border border-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
            <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
            {priority || 'Unknown'}
          </span>
        );
    }
  };

  // Helper function to show status with enhanced icons and styling
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open':
        return <Clock className="h-5 w-5 text-amber-500 drop-shadow-sm" />;
      case 'In Progress':
        return <AlertCircle className="h-5 w-5 text-blue-500 drop-shadow-sm" />;
      case 'Completed':
        return <CheckCircle className="h-5 w-5 text-green-500 drop-shadow-sm" />;
      case 'Cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500 drop-shadow-sm" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500 drop-shadow-sm" />;
    }
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 mb-6 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading maintenance requests...</p>
        </div>
      </div>
    );
  }

  // Show error message if something went wrong
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 mb-6 p-8">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Oops! Couldn't load maintenance requests</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <p className="text-sm text-gray-500 mt-2">
            Make sure your backend server is running on port 5000!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Enhanced header with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Maintenance Requests</h2>
            <p className="text-sm text-gray-600 flex items-center">
              <Wrench className="h-4 w-4 mr-2 text-blue-600" />
              {requests.length} total requests from your database
            </p>
          </div>
          <div className="flex space-x-3">
            {showAddButton && (
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                onClick={() => {
                  console.log('SHARED WorkRequestsTable: New Request button clicked!');
                  console.log('SHARED WorkRequestsTable: showAddButton value:', showAddButton);
                  console.log('SHARED WorkRequestsTable: Current showAddForm value:', showAddForm);
                  setShowAddForm(true);
                  console.log('SHARED WorkRequestsTable: setShowAddForm(true) called');
                }}
              >
                <Plus className="h-4 w-4" />
                New Request
              </button>
            )}
            <button className="text-blue-600 hover:text-blue-800 font-semibold px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors" onClick={() => onNavigate ? onNavigate('maintenance') : null}>
              View All
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Request ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Equipment
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Reported By
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Date
              </th>
              {showActions && (
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={showActions ? "10" : "9"} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Wrench className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-700 mb-2">No maintenance requests found</p>
                    <p className="text-sm text-gray-500">Your database appears to be empty</p>
                  </div>
                  </td>
                </tr>
            ) : (
              requests.map((request, index) => (
                <tr key={request.id || request._id || index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                      {request.request_id || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {request.title || 'Untitled'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                    <div className="truncate" title={request.description}>
                      {request.description || 'No description'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getPriorityBadge(request.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(request.status)}
                      <span className="font-medium">{request.status || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    {/* 🏥 Equipment Details */}
                    {request.equipment && request.equipment.length > 0 ? (
                      <div className="space-y-1">
                        {request.equipment.map((eq, idx) => (
                          <div key={eq.id || idx} className="truncate" title={`${eq.name} - ${eq.location}`}>
                            <span className="font-medium">{eq.name}</span>
                            <span className="text-gray-500 text-xs ml-1">({eq.location})</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No equipment</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {/* 👤 Reported By Details */}
                    {typeof request.reportedBy === 'object' && request.reportedBy?.name 
                      ? (
                        <div title={request.reportedBy.email}>
                          <div className="font-medium">{request.reportedBy.name}</div>
                          <div className="text-xs text-gray-500">{request.reportedBy.role}</div>
                        </div>
                      ) 
                      : request.reportedBy || 'Unknown'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof request.assignedTo === 'object' && request.assignedTo?.name 
                      ? request.assignedTo.name 
                      : (typeof request.assignedTo === 'string' ? request.assignedTo : 'Unassigned')}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.date ? new Date(request.date).toLocaleDateString() : 'No date'}
                  </td>
                  {showActions && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {/* 👥 Assign button - only show if not already assigned */}
                        {(!request.assignedTo || request.assignedTo === 'Unassigned') && (
                          <button 
                            className="text-green-600 hover:text-green-800" 
                            title="Assign to technician"
                            onClick={() => handleAssignRequest(request)}
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                        )}
                        {/* ✏️ Edit button - only show for admins */}
                        {isAdmin && (
                          <button 
                            className="text-blue-600 hover:text-blue-800" 
                            title="Edit request"
                            onClick={() => handleEditRequest(request)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {/* 🗑️ Delete button - only show for admins */}
                        {isAdmin && (
                          <button 
                            className="text-red-600 hover:text-red-800" 
                            title="Delete request"
                            onClick={() => handleDeleteRequest(request)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Show total count at the bottom */}
      {requests.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing {requests.length} maintenance request{requests.length !== 1 ? 's' : ''} from your database
          </p>
        </div>
      )}

      {/* 📝 Add Maintenance Request Modal */}
      {showAddForm && (
        <>
          {console.log('SHARED WorkRequestsTable: Rendering AddMaintenanceRequestForm modal, showAddForm:', showAddForm)}
          <AddMaintenanceRequestForm
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            onSuccess={handleFormSuccess}
          />
        </>
      )}

      {/* 👥 Assign Technician Modal */}
      {showAssignModal && selectedRequest && (
        <AssignTechnicianModal
          isOpen={showAssignModal}
          request={selectedRequest}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={handleAssignmentSuccess}
        />
      )}

      {/* ✏️ Edit Maintenance Request Modal */}
      {showEditModal && editRequest && (
        <EditMaintenanceRequestModal
          isOpen={showEditModal}
          request={editRequest}
          onClose={() => {
            setShowEditModal(false);
            setEditRequest(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* 🗑️ Delete Confirmation Modal */}
      {showDeleteModal && deleteRequest && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          request={deleteRequest}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          isLoading={deleteLoading}
        />
      )}
    </div>
  );
};
