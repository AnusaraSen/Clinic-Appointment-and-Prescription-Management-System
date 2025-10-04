import React from 'react';
import { 
  ClipboardList, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Calendar,
  TrendingUp,
  
} from 'lucide-react';

/**
 * Work Request KPI Dashboard Component
 * Shows statistics and metrics for maintenance work requests
 */
export const WorkRequestKPICards = ({ workRequests = [], loading = false }) => {
  // Helper: normalize backend status labels to a known set
  const normalizeStatus = (s) => {
    if (!s) return 'pending';
    const map = {
      'open': 'pending',
      'in progress': 'in-progress',
      'in-progress': 'in-progress',
      'completed': 'completed',
      'cancelled': 'cancelled'
    };
    const key = String(s).toLowerCase();
    return map[key] || key;
  };

  // Helper: normalize priority to lowercase (backend may use 'High'/'Low')
  const normalizePriority = (p) => (p || '').toString().toLowerCase();

  // helper to get a date for created/due fields
  const getCreatedDate = (req) => new Date(req.createdAt || req.updatedAt || req.date || req.dateCreated || Date.now());
  const getDueDate = (req) => (req.date || req.dueDate) ? new Date(req.date || req.dueDate) : null;

  // Calculate statistics using normalized fields
  const stats = {
    total: workRequests.length,
    pending: workRequests.filter(req => normalizeStatus(req.status) === 'pending').length,
    inProgress: workRequests.filter(req => normalizeStatus(req.status) === 'in-progress').length,
    completed: workRequests.filter(req => normalizeStatus(req.status) === 'completed').length,
    cancelled: workRequests.filter(req => normalizeStatus(req.status) === 'cancelled').length,

    // Priority breakdown
    critical: workRequests.filter(req => normalizePriority(req.priority) === 'critical').length,
    high: workRequests.filter(req => normalizePriority(req.priority) === 'high').length,
    medium: workRequests.filter(req => normalizePriority(req.priority) === 'medium').length,
    low: workRequests.filter(req => normalizePriority(req.priority) === 'low').length,

    // Recent requests (last 7 days)
    recent: workRequests.filter(req => {
      const requestDate = getCreatedDate(req);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return requestDate >= weekAgo;
    }).length,

    // Overdue requests (use backend `date` or `dueDate`)
    overdue: workRequests.filter(req => {
      const nStatus = normalizeStatus(req.status);
      if (nStatus === 'completed' || nStatus === 'cancelled') return false;
      const due = getDueDate(req);
      if (!due) return false;
      return due < new Date();
    }).length
  };
  
  // Calculate completion rate
  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;
  
  // avgResponseTime removed (not used)

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="w-16 h-8 bg-gray-200 rounded mb-2"></div>
              <div className="w-20 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Requests */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ClipboardList className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Total Requests</h3>
            <p className="text-sm text-gray-500">All work requests</p>
          </div>
        </div>
        <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
        <div className="text-sm text-gray-500">{stats.recent} new this week</div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
            <p className="text-sm text-gray-500">Awaiting assignment</p>
          </div>
        </div>
        <div className="text-3xl font-bold text-orange-600 mb-2">{stats.pending}</div>
        <div className="text-sm text-gray-500">{stats.overdue > 0 ? `${stats.overdue} overdue` : 'None overdue'}</div>
      </div>

      {/* This Week */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Calendar className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
            <p className="text-sm text-gray-500">Recent activity</p>
          </div>
        </div>
        <div className="text-3xl font-bold text-indigo-600 mb-2">{stats.recent}</div>
        <div className="text-sm text-gray-500">New requests submitted</div>
      </div>

      {/* In Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <User className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">In Progress</h3>
            <p className="text-sm text-gray-500">Being worked on</p>
          </div>
        </div>
        <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.inProgress}</div>
        <div className="text-sm text-gray-500">Active assignments</div>
      </div>

      {/* Completed */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
            <p className="text-sm text-gray-500">Finished requests</p>
          </div>
        </div>
        <div className="text-3xl font-bold text-green-600 mb-2">{stats.completed}</div>
        <div className="text-sm text-gray-500">{completionRate}% completion rate</div>
      </div>

      

      {/* High Priority */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">High Priority</h3>
            <p className="text-sm text-gray-500">Important requests</p>
          </div>
        </div>
        <div className="text-3xl font-bold text-orange-600 mb-2">{stats.high}</div>
        <div className="text-sm text-gray-500">Requires prompt action</div>
      </div>
    </div>
  );
};