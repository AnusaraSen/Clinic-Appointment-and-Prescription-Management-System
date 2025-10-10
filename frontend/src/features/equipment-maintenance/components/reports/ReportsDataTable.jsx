import React, { useState } from 'react';
import { Download, ChevronUp, ChevronDown } from 'lucide-react';

/**
 * ReportsDataTable Component
 * Displays detailed maintenance requests data in a sortable, filterable table
 */
const ReportsDataTable = ({ data, loading, reportType = 'maintenance' }) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
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

    // Handle nested fields
    if (sortField === 'assignedTo') {
      aVal = a.assignedTo?.fullName || a.assignedTo?.name || '';
      bVal = b.assignedTo?.fullName || b.assignedTo?.name || '';
    } else if (sortField === 'reportedBy') {
      aVal = a.reportedBy?.name || '';
      bVal = b.reportedBy?.name || '';
    } else if (sortField === 'equipment') {
      aVal = a.equipment?.[0]?.name || '';
      bVal = b.equipment?.[0]?.name || '';
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
    { field: 'request_id', header: 'ID', width: 'w-24' },
    { field: 'title', header: 'Title', width: 'w-48' },
    { field: 'equipment', header: 'Equipment', width: 'w-32' },
    { field: 'priority', header: 'Priority', width: 'w-24' },
    { field: 'status', header: 'Status', width: 'w-28' },
    { field: 'assignedTo', header: 'Assigned To', width: 'w-32' },
    { field: 'date', header: 'Date', width: 'w-28' },
  ];

  const getStatusBadge = (status) => {
    const colors = {
      'Open': 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'Critical': 'bg-red-100 text-red-800',
      'High': 'bg-orange-100 text-orange-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority}
      </span>
    );
  };

  const exportToCSV = () => {
    console.log('Exporting CSV - Sample row:', sortedData[0]);
    
    const headers = columns.map(col => col.header).join(',');
    const rows = sortedData.map(row => {
      return columns.map(col => {
        let value = '';
        
        // Map each field correctly
        switch(col.field) {
          case 'request_id':
            value = row.request_id || 'N/A';
            break;
          case 'title':
            value = row.title || 'N/A';
            break;
          case 'equipment':
            value = row.equipment?.map(e => e.name).join('; ') || 'N/A';
            break;
          case 'priority':
            value = row.priority || 'N/A';
            break;
          case 'status':
            value = row.status || 'N/A';
            break;
          case 'assignedTo':
            value = row.assignedTo?.fullName || row.assignedTo?.name || 'Unassigned';
            break;
          case 'date':
            value = row.date ? new Date(row.date).toLocaleDateString() : 'N/A';
            break;
          default:
            value = row[col.field] || 'N/A';
        }
        
        return `"${value}"`;
      }).join(',');
    }).join('\n');
    
    console.log('CSV Headers:', headers);
    console.log('CSV Rows (first 2):', rows.split('\n').slice(0, 2));
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
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
          <h3 className="text-lg font-semibold text-gray-800">Detailed Report</h3>
          <p className="text-sm text-gray-600">
            Showing {paginatedData.length} of {sortedData.length} requests
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.field}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${column.width}`}
                  onClick={() => handleSort(column.field)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {sortField === column.field ? (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-1" />
                      )
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-1 opacity-0" />
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
                  No data available
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={row._id || row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.request_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={row.title}>
                      {row.title}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {row.equipment && row.equipment.length > 0 ? (
                      <div className="max-w-xs truncate" title={row.equipment.map(e => e.name).join(', ')}>
                        {row.equipment[0].name}
                        {row.equipment.length > 1 && ` +${row.equipment.length - 1}`}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {getPriorityBadge(row.priority)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {getStatusBadge(row.status)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {row.assignedTo ? (
                      row.assignedTo.fullName || row.assignedTo.name || 'N/A'
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}
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

export default ReportsDataTable;
