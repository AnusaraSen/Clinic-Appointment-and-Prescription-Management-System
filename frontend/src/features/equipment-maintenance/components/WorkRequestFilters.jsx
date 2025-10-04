import React, { useState } from 'react';
import { Search, Filter, X, Calendar, User, AlertTriangle } from 'lucide-react';

/**
 * Work Request Filters Component
 * Provides filtering and search functionality for work requests
 */
export const WorkRequestFilters = ({ 
  onFilterChange, 
  onSearch,
  technicians = [],
  equipment = [],
  filters = {},
  searchTerm = ''
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    onSearch && onSearch(value);
  };

  // Handle filter changes
  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    onFilterChange && onFilterChange(newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setLocalSearchTerm('');
    onSearch && onSearch('');
    onFilterChange && onFilterChange({});
  };

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(value => 
    value && value !== 'all' && value !== ''
  ).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={localSearchTerm}
            onChange={handleSearchChange}
            placeholder="Search work requests by title, description, or equipment..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {localSearchTerm && (
            <button
              onClick={() => {
                setLocalSearchTerm('');
                onSearch && onSearch('');
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${
              showAdvancedFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option key="status-all" value="all">All Statuses</option>
                <option key="status-pending" value="pending">Pending</option>
                <option key="status-inprogress" value="in-progress">In Progress</option>
                <option key="status-completed" value="completed">Completed</option>
                <option key="status-cancelled" value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={filters.priority || 'all'}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option key="priority-all" value="all">All Priorities</option>
                <option key="priority-critical" value="critical">Critical</option>
                <option key="priority-high" value="high">High</option>
                <option key="priority-medium" value="medium">Medium</option>
                <option key="priority-low" value="low">Low</option>
              </select>
            </div>

            {/* Assigned Technician Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <select
                value={filters.assignedTo || 'all'}
                onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option key="tech-all" value="all">All Technicians</option>
                <option key="tech-unassigned" value="unassigned">Unassigned</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.name}>
                    {tech.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Equipment Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment
              </label>
              <select
                value={filters.equipmentId || 'all'}
                onChange={(e) => handleFilterChange('equipmentId', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option key="equipment-all" value="all">All Equipment</option>
                {equipment.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created From
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date Range To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created To
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Due Date Range From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due From
              </label>
              <input
                type="date"
                value={filters.dueDateFrom || ''}
                onChange={(e) => handleFilterChange('dueDateFrom', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Due Date Range To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due To
              </label>
              <input
                type="date"
                value={filters.dueDateTo || ''}
                onChange={(e) => handleFilterChange('dueDateTo', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('status', 'pending')}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  filters.status === 'pending'
                    ? 'bg-orange-100 border-orange-300 text-orange-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Pending Only
              </button>
              
              <button
                onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  handleFilterChange('dateFrom', weekAgo.toISOString().split('T')[0]);
                  handleFilterChange('dateTo', today.toISOString().split('T')[0]);
                }}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Calendar className="h-3 w-3 mr-1" />
                This Week
              </button>
              
              <button
                onClick={() => handleFilterChange('assignedTo', 'unassigned')}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  filters.assignedTo === 'unassigned'
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="h-3 w-3 mr-1" />
                Unassigned
              </button>
              
              <button
                onClick={() => handleFilterChange('priority', 'critical')}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  filters.priority === 'critical'
                    ? 'bg-red-100 border-red-300 text-red-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Critical Priority
              </button>
              
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  handleFilterChange('dueDateTo', today);
                }}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Overdue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value || value === 'all' || value === '') return null;
              
              let displayValue = value;
              if (key === 'assignedTo' && value === 'unassigned') {
                displayValue = 'Unassigned';
              }
              
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {key}: {displayValue}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};