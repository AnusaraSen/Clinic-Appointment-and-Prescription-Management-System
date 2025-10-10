import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, Clock, AlertCircle, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * TechnicianMyTasksTable - Display and manage work orders assigned to the logged-in technician
 * Uses the new /api/technicians/my-work-orders endpoint
 */
export const TechnicianMyTasksTable = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchWorkOrders();
  }, [filters, pagination.page]);

  const fetchWorkOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      
      // If no token, don't make the request
      if (!token) {
        console.warn('No access token found, skipping work orders fetch');
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);

      const response = await fetch(`/api/technicians/my-work-orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch work orders: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setWorkOrders(data.data.workOrders);
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          pages: data.data.pagination.pages
        }));
      } else {
        throw new Error(data.message || 'Failed to fetch work orders');
      }
    } catch (err) {
      console.error('Error fetching work orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async (workOrderId) => {
    setActionLoading(prev => ({ ...prev, [workOrderId]: 'starting' }));
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/technicians/work-orders/${workOrderId}/start`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to start work order: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update local state optimistically
        setWorkOrders(prev => 
          prev.map(wo => 
            wo._id === workOrderId 
              ? { ...wo, status: 'In Progress', startedAt: new Date().toISOString() }
              : wo
          )
        );
      } else {
        throw new Error(data.message || 'Failed to start work order');
      }
    } catch (err) {
      console.error('Error starting work order:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [workOrderId]: null }));
    }
  };

  const handleCompleteWork = async (workOrderId) => {
    const notes = prompt('Add completion notes (optional):');
    
    setActionLoading(prev => ({ ...prev, [workOrderId]: 'completing' }));
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/technicians/work-orders/${workOrderId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: notes || '' })
      });

      if (!response.ok) {
        throw new Error(`Failed to complete work order: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update local state optimistically
        setWorkOrders(prev => 
          prev.map(wo => 
            wo._id === workOrderId 
              ? { ...wo, status: 'Completed', completedAt: new Date().toISOString() }
              : wo
          )
        );
      } else {
        throw new Error(data.message || 'Failed to complete work order');
      }
    } catch (err) {
      console.error('Error completing work order:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [workOrderId]: null }));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'text-blue-600 bg-blue-50';
      case 'In Progress': return 'text-purple-600 bg-purple-50';
      case 'Completed': return 'text-green-600 bg-green-50';
      case 'Cancelled': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${month} ${day}, ${year} ${hours}:${minutes}`;
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Work Orders</h2>
        
        {/* Filters */}
        <div className="flex gap-3">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Priority</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading work orders...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-2" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchWorkOrders}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : workOrders.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No work orders found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workOrders.map((workOrder) => (
                  <tr key={workOrder._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {workOrder.request_id}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{workOrder.title}</div>
                        <div className="text-gray-500 text-xs truncate max-w-xs">
                          {workOrder.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(workOrder.priority)}`}>
                        {workOrder.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(workOrder.status)}`}>
                        {workOrder.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(workOrder.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {workOrder.status === 'Open' && (
                          <button
                            onClick={() => handleStartWork(workOrder._id)}
                            disabled={actionLoading[workOrder._id] === 'starting'}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading[workOrder._id] === 'starting' ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <Play className="h-3 w-3 mr-1" />
                                Start
                              </>
                            )}
                          </button>
                        )}
                        
                        {workOrder.status === 'In Progress' && (
                          <button
                            onClick={() => handleCompleteWork(workOrder._id)}
                            disabled={actionLoading[workOrder._id] === 'completing'}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading[workOrder._id] === 'completing' ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Complete
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6 px-4">
              <div className="text-sm text-gray-700">
                Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                <span className="font-medium">{pagination.pages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TechnicianMyTasksTable;
