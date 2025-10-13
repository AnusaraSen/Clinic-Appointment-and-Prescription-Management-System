import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Wrench, RefreshCw, Calendar, Filter } from 'lucide-react';

// Maintenance Components
import MetricsCards from '../components/reports/MetricsCards';
import StatusDistributionChart from '../components/reports/StatusDistributionChart';
import TechnicianWorkloadChart from '../components/reports/TechnicianWorkloadChart';
import RequestsTrendChart from '../components/reports/RequestsTrendChart';
import ReportsDataTable from '../components/reports/ReportsDataTable';

// User Components
import UserMetricsCards from '../components/reports/UserMetricsCards';
import UserRegistrationTrendChart from '../components/reports/UserRegistrationTrendChart';
import UserActivityChart from '../components/reports/UserActivityChart';
import UsersDataTable from '../components/reports/UsersDataTable';

// API Services
import { 
  getReportMetrics, 
  getStatusDistribution, 
  getTechnicianWorkload, 
  getRequestsTrend,
  getDetailedRequests 
} from '../../../api/reportsApi';

import {
  getUserReportMetrics,
  getRegistrationTrend,
  getLoginEvents,
  getAllUsers
} from '../../../api/userReportsApi';

/**
 * MaintenanceReportsPage Component
 * Comprehensive page for user and maintenance reports with analytics
 */
const MaintenanceReportsPage = () => {
  // State for maintenance data
  const [metrics, setMetrics] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [technicianData, setTechnicianData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [detailedData, setDetailedData] = useState([]);

  // State for user data
  const [userMetrics, setUserMetrics] = useState(null);
  const [registrationTrend, setRegistrationTrend] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [usersData, setUsersData] = useState([]);

  // State for user filters
  const [filters, setFilters] = useState({
    startDate: '', // Optional: Registration start date
    endDate: '', // Optional: Registration end date
    status: '',
    lastLogin: '', // Optional: Filter by last login date
    role: 'all' // For user filtering
  });

  // State for maintenance filters
  const [maintenanceFilters, setMaintenanceFilters] = useState({
    startDate: '', // Optional: Work request creation start date
    endDate: '', // Optional: Work request creation end date
    status: '', // Work request status
    priority: '', // Work request priority
    technician: '' // Optional: Assigned technician
  });

  // Loading states
  const [loading, setLoading] = useState({
    // Maintenance loading
    metrics: false,
    status: false,
    technician: false,
    trend: false,
    table: false,
    // User loading
    userMetrics: false,
    registrationTrend: false,
    userActivity: false,
    usersTable: false
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showMaintenanceFilters, setShowMaintenanceFilters] = useState(false);

  // State for technicians list
  const [technicians, setTechnicians] = useState([]);

  // Fetch technicians on component mount
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/technicians', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTechnicians(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching technicians:', error);
      }
    };

    fetchTechnicians();
  }, []);

  /**
   * Load all report data (both user and maintenance)
   */
  const loadAllData = async () => {
    setLoading({
      metrics: true,
      status: true,
      technician: true,
      trend: true,
      table: true,
      userMetrics: true,
      registrationTrend: true,
      userActivity: true,
      usersTable: true
    });

    try {
      // Load USER data (without filters - filters only apply to report generation)
      console.log('MaintenanceReportsPage: Fetching all data for charts (no filters applied)');
      const [userMetricsRes, registrationTrendRes, loginEventsRes, usersRes] = await Promise.all([
        getUserReportMetrics({}).catch(err => {
          console.error('User metrics error:', err);
          return { data: null };
        }),
        getRegistrationTrend({}).catch(err => {
          console.error('Registration trend error:', err);
          return { data: [] };
        }),
        getLoginEvents({}).catch(err => {
          console.error('Login events error:', err);
          return { data: [] };
        }),
        getAllUsers().catch(err => {
          console.error('Users error:', err);
          return { data: [] };
        })
      ]);
      console.log('MaintenanceReportsPage: registrationTrendRes =', registrationTrendRes);
      setUserMetrics(userMetricsRes.data);
      setRegistrationTrend(registrationTrendRes.data);

      // Transform raw login events into the chart-friendly shape the component expects.
      // We create a single object containing all timestamps so the component will aggregate them.
      console.log('MaintenanceReportsPage: loginEventsRes =', loginEventsRes);
      const rawEvents = (loginEventsRes && loginEventsRes.data) || [];
      console.log('MaintenanceReportsPage: rawEvents =', rawEvents);
      const timestamps = rawEvents.map(e => e.timestamp);
      console.log('MaintenanceReportsPage: timestamps =', timestamps);
      console.log('MaintenanceReportsPage: Setting userActivity to:', [{ loginTimestamps: timestamps }]);
      setUserActivity([{ loginTimestamps: timestamps }]);
      setUsersData(usersRes.data);

      // Load MAINTENANCE data in parallel
      const [metricsRes, statusRes, technicianRes, trendRes, detailedRes] = await Promise.all([
        getReportMetrics(filters).catch(err => {
          console.error('Metrics error:', err);
          return { data: null };
        }),
        getStatusDistribution(filters).catch(err => {
          console.error('Status error:', err);
          return { data: [] };
        }),
        getTechnicianWorkload(filters).catch(err => {
          console.error('Technician error:', err);
          return { data: [] };
        }),
        getRequestsTrend(filters).catch(err => {
          console.error('Trend error:', err);
          return { data: [] };
        }),
        getDetailedRequests(filters).catch(err => {
          console.error('Detailed error:', err);
          return { data: [] };
        })
      ]);

      setMetrics(metricsRes.data);
      setStatusData(statusRes.data);
      setTechnicianData(technicianRes.data);
      setTrendData(trendRes.data);
      setDetailedData(detailedRes.data);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading({
        metrics: false,
        status: false,
        technician: false,
        trend: false,
        table: false,
        userMetrics: false,
        registrationTrend: false,
        userActivity: false,
        usersTable: false
      });
    }
  };

  /**
   * Load data on mount and when filters change
   */
  useEffect(() => {
    loadAllData();
  }, [filters.startDate, filters.endDate, filters.status, filters.priority, filters.role]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Reset filters to default
   */
  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: '',
      lastLogin: '',
      role: 'all'
    });
  };

  const handleGenerateReport = async () => {
    try {
      // Call API to generate report with current filters
      const response = await fetch('/api/users/reports/export-filtered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });

      if (!response.ok) throw new Error('Failed to generate report');

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  /**
   * Maintenance filter change handler
   */
  const handleMaintenanceFilterChange = (field, value) => {
    setMaintenanceFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Load maintenance data with current filters
   */
  const loadMaintenanceDataWithFilters = async () => {
    setLoading(prev => ({
      ...prev,
      metrics: true,
      status: true,
      technician: true,
      trend: true,
      table: true
    }));

    try {
      // Map technician to assignedTo for API compatibility
      const apiFilters = {
        ...maintenanceFilters,
        assignedTo: maintenanceFilters.technician || undefined
      };
      
      console.log('🔍 Loading maintenance data with filters:', apiFilters);

      // Use maintenanceFilters for loading data
      const [metricsRes, statusRes, technicianRes, trendRes, detailedRes] = await Promise.all([
        getReportMetrics(apiFilters).catch(err => {
          console.error('Metrics error:', err);
          return { data: null };
        }),
        getStatusDistribution(apiFilters).catch(err => {
          console.error('Status error:', err);
          return { data: [] };
        }),
        getTechnicianWorkload(apiFilters).catch(err => {
          console.error('Technician error:', err);
          return { data: [] };
        }),
        getRequestsTrend(apiFilters).catch(err => {
          console.error('Trend error:', err);
          return { data: [] };
        }),
        getDetailedRequests(apiFilters).catch(err => {
          console.error('Detailed error:', err);
          return { data: [] };
        })
      ]);

      setMetrics(metricsRes.data);
      setStatusData(statusRes.data);
      setTechnicianData(technicianRes.data);
      setTrendData(trendRes.data);
      setDetailedData(detailedRes.data);
    } catch (error) {
      console.error('Error loading maintenance data with filters:', error);
    } finally {
      setLoading(prev => ({
        ...prev,
        metrics: false,
        status: false,
        technician: false,
        trend: false,
        table: false
      }));
    }
  };

  /**
   * Reset maintenance filters to default
   */
  const resetMaintenanceFilters = () => {
    setMaintenanceFilters({
      startDate: '',
      endDate: '',
      status: '',
      priority: '',
      technician: ''
    });
  };

  /**
   * Generate maintenance report with filters
   */
  const handleGenerateMaintenanceReport = async () => {
    try {
      // Map technician to assignedTo for backend compatibility
      const exportFilters = {
        startDate: maintenanceFilters.startDate,
        endDate: maintenanceFilters.endDate,
        status: maintenanceFilters.status,
        priority: maintenanceFilters.priority,
        assignedTo: maintenanceFilters.technician // Map technician to assignedTo
      };

      console.log('📊 Generating report with filters:', exportFilters);

      // Call API to generate maintenance report with current filters
      const response = await fetch('http://localhost:5000/api/maintenance-requests/reports/export-filtered', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(exportFilters)
      });

      if (!response.ok) throw new Error('Failed to generate maintenance report');

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `maintenance_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating maintenance report:', error);
      alert('Failed to generate maintenance report. Please try again.');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Maintenance and User Reports</h1>
              <p className="text-gray-600">Analytics and insights for operations</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => loadAllData()}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ===== USER REPORTS SECTION ===== */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <UsersIcon className="h-6 w-6 text-purple-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">User Reports</h2>
        </div>

        {/* User Filters Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Registration Start (Optional)
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  placeholder="From registration date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Registration End (Optional)
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  placeholder="To registration date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Role
                </label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Patient">Patient</option>
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="LabStaff">Lab Staff</option>
                  <option value="LabSupervisor">Lab Supervisor</option>
                  <option value="Technician">Technician</option>
                  <option value="InventoryManager">Inventory Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Last Login (Optional)
                </label>
                <input
                  type="date"
                  value={filters.lastLogin}
                  onChange={(e) => handleFilterChange('lastLogin', e.target.value)}
                  placeholder="Filter by last login date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-4 flex justify-end gap-3">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Reset Filters
                </button>
                <button
                  onClick={handleGenerateReport}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Report
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Metrics Cards */}
        <UserMetricsCards metrics={userMetrics} loading={loading.userMetrics} />

        {/* User Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <UserRegistrationTrendChart data={registrationTrend} loading={loading.registrationTrend} />
          <UserActivityChart data={userActivity} loading={loading.userActivity} />
        </div>

        {/* Users Table */}
        <UsersDataTable data={usersData} loading={loading.usersTable} />
      </div>

      {/* ===== MAINTENANCE REPORTS SECTION ===== */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Wrench className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Maintenance Reports</h2>
        </div>

        {/* Maintenance Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </h3>
            <button
              onClick={() => setShowMaintenanceFilters(!showMaintenanceFilters)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showMaintenanceFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {showMaintenanceFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Request Start (Optional)
                </label>
                <input
                  type="date"
                  value={maintenanceFilters.startDate}
                  onChange={(e) => handleMaintenanceFilterChange('startDate', e.target.value)}
                  placeholder="From request date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Request End (Optional)
                </label>
                <input
                  type="date"
                  value={maintenanceFilters.endDate}
                  onChange={(e) => handleMaintenanceFilterChange('endDate', e.target.value)}
                  placeholder="To request date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={maintenanceFilters.status}
                  onChange={(e) => handleMaintenanceFilterChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={maintenanceFilters.priority}
                  onChange={(e) => handleMaintenanceFilterChange('priority', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technician (Optional)
                </label>
                <select
                  value={maintenanceFilters.technician}
                  onChange={(e) => handleMaintenanceFilterChange('technician', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Technicians</option>
                  {technicians.map((tech) => (
                    <option key={tech._id || tech.id} value={tech._id || tech.id}>
                      {tech.name || tech.firstName + ' ' + tech.lastName} 
                      {tech.technician_id ? ` (${tech.technician_id})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4 flex justify-end gap-3">
                <button
                  onClick={resetMaintenanceFilters}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Reset Filters
                </button>
                <button
                  onClick={handleGenerateMaintenanceReport}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Report
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Maintenance Metrics Cards */}
        <MetricsCards metrics={metrics} loading={loading.metrics} />

        {/* Maintenance Charts Grid - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <StatusDistributionChart data={statusData} loading={loading.status} />
          <TechnicianWorkloadChart data={technicianData} loading={loading.technician} />
        </div>

        {/* Maintenance Trend Chart - Full width */}
        <div className="mb-6">
          <RequestsTrendChart data={trendData} loading={loading.trend} />
        </div>

        {/* Maintenance Detailed Data Table */}
        <ReportsDataTable data={detailedData} loading={loading.table} />
      </div>
    </div>
  );
};

export default MaintenanceReportsPage;
