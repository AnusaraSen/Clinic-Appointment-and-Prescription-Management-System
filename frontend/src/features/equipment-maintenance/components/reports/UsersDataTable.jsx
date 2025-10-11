import React, { useState } from 'react';
import { Download, ChevronUp, ChevronDown, FileDown } from 'lucide-react';
import { exportUserData } from '../../../../api/userReportsApi';

/**
 * UsersDataTable Component
 * Displays user data in a sortable, filterable table with per-row export
 */
const UsersDataTable = ({ data, loading }) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [exportingUserId, setExportingUserId] = useState(null);
  const itemsPerPage = 10;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...(data || [])].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    // Handle special fields
    if (sortField === 'lastLogin') {
      aVal = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
      bVal = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const columns = [
    { field: 'user_id', header: 'User ID', width: 'w-28' },
    { field: 'name', header: 'Name', width: 'w-48' },
    { field: 'email', header: 'Email', width: 'w-56' },
    { field: 'role', header: 'Role', width: 'w-32' },
    { field: 'status', header: 'Status', width: 'w-28' },
    { field: 'lastLogin', header: 'Last Login', width: 'w-40' },
    { field: 'actions', header: 'Actions', width: 'w-24' },
  ];

  const getRoleBadge = (role) => {
    const colors = {
      'Admin': 'bg-purple-100 text-purple-800',
      'Doctor': 'bg-blue-100 text-blue-800',
      'Nurse': 'bg-green-100 text-green-800',
      'Patient': 'bg-gray-100 text-gray-800',
      'Pharmacist': 'bg-yellow-100 text-yellow-800',
      'LabStaff': 'bg-cyan-100 text-cyan-800',
      'LabSupervisor': 'bg-indigo-100 text-indigo-800',
      'Technician': 'bg-orange-100 text-orange-800',
      'InventoryManager': 'bg-pink-100 text-pink-800',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  const getStatusBadge = (isActive, isLocked) => {
    if (isLocked) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Locked
        </span>
      );
    }
    if (!isActive) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Inactive
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    );
  };

  const handleExportUser = async (userId, userName) => {
    try {
      setExportingUserId(userId);
      
      // Fetch PDF from backend
      const response = await fetch(`/api/users/${userId}/export`);
      
      if (!response.ok) {
        throw new Error('Failed to export user data');
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-${userId}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error exporting user data:', error);
      alert('Failed to export user data. Please try again.');
    } finally {
      setExportingUserId(null);
    }
  };

  const exportAllToCSV = () => {
    const headers = columns.filter(col => col.field !== 'actions').map(col => col.header).join(',');
    const rows = sortedData.map(row => {
      return [
        row.user_id,
        row.name,
        row.email,
        row.role,
        row.isLocked ? 'Locked' : (row.isActive ? 'Active' : 'Inactive'),
        row.lastLogin ? new Date(row.lastLogin).toLocaleString() : 'Never'
      ].map(cell => `"${cell}"`).join(',');
    }).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">User Details</h3>
          <p className="text-sm text-gray-600">
            Showing {paginatedData.length} of {sortedData.length} users
          </p>
        </div>
        <button
          onClick={exportAllToCSV}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Export All CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.field}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.field !== 'actions' ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.width}`}
                  onClick={() => column.field !== 'actions' && handleSort(column.field)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.field !== 'actions' && sortField === column.field && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-1" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={row.id || row._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.user_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={row.name}>
                      {row.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="max-w-xs truncate" title={row.email}>
                      {row.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {getRoleBadge(row.role)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {getStatusBadge(row.isActive, row.isLocked)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {row.lastLogin ? new Date(row.lastLogin).toLocaleString() : (
                      <span className="text-gray-400 italic">Never</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleExportUser(row.user_id, row.name)}
                      disabled={exportingUserId === row.user_id}
                      className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Export user data"
                    >
                      {exportingUserId === row.user_id ? (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      ) : (
                        <FileDown className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersDataTable;
