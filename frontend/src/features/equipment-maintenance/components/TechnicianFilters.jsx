import React from 'react';
import { Search, Filter, X, Users, Clock, Wrench } from 'lucide-react';

/**
 * Technician Filters Component
 * Provides search and filtering controls for technician management
 */
export const TechnicianFilters = ({
  searchTerm,
  setSearchTerm,
  availabilityFilter,
  setAvailabilityFilter,
  departmentFilter,
  setDepartmentFilter,
  skillFilter,
  setSkillFilter,
  onClearFilters,
  totalCount,
  filteredCount
}) => {
  // Available filter options
  const availabilityOptions = [
    { value: '', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'busy', label: 'Busy' },
    { value: 'on leave', label: 'On Leave' },
    { value: 'off duty', label: 'Off Duty' }
  ];

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'IT Support', label: 'IT Support' },
    { value: 'Biomedical', label: 'Biomedical' },
    { value: 'Facilities', label: 'Facilities' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'General', label: 'General' }
  ];

  const skillOptions = [
    { value: '', label: 'All Skills' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'mechanical', label: 'Mechanical' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'medical equipment', label: 'Medical Equipment' },
    { value: 'it support', label: 'IT Support' },
    { value: 'networking', label: 'Networking' },
    { value: 'carpentry', label: 'Carpentry' },
    { value: 'painting', label: 'Painting' }
  ];

  // Check if any filters are active
  const hasActiveFilters = searchTerm || availabilityFilter || departmentFilter || skillFilter;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Filter Technicians</h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by name, employee ID, email, or location..."
          />
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Availability Status Filter */}
        <div>
          <label htmlFor="availability-filter" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>Availability Status</span>
            </div>
          </label>
          <select
            id="availability-filter"
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availabilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        <div>
          <label htmlFor="department-filter" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-gray-400" />
              <span>Department</span>
            </div>
          </label>
          <select
            id="department-filter"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {departmentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Skill Filter */}
        <div>
          <label htmlFor="skill-filter" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-1">
              <Wrench className="h-4 w-4 text-gray-400" />
              <span>Skills</span>
            </div>
          </label>
          <select
            id="skill-filter"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {skillOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {hasActiveFilters ? (
            <>
              Showing <span className="font-medium">{filteredCount}</span> of{' '}
              <span className="font-medium">{totalCount}</span> technicians
            </>
          ) : (
            <>
              Showing all <span className="font-medium">{totalCount}</span> technicians
            </>
          )}
        </div>
        
        {hasActiveFilters && (
          <div className="flex items-center space-x-1 text-xs text-blue-600">
            <Filter className="h-3 w-3" />
            <span>Filters active</span>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {availabilityFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Status: {availabilityFilter}
                <button
                  onClick={() => setAvailabilityFilter('')}
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-green-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {departmentFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Dept: {departmentFilter}
                <button
                  onClick={() => setDepartmentFilter('')}
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-purple-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {skillFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Skill: {skillFilter}
                <button
                  onClick={() => setSkillFilter('')}
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-orange-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};