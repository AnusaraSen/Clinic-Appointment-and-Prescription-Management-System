import React, { useState, useEffect } from 'react';
import { Activity, Users, Clock, TrendingUp, AlertCircle, CheckCircle, Plus, Filter, Calendar, UserCheck, BarChart3 } from 'lucide-react';
import TaskListPage from '../components/TaskListPage';

const SupervisorDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from API
      const tasksResponse = await fetch('http://localhost:5000/api/labtasks');
      const tasksData = await tasksResponse.json();
      
      const staffResponse = await fetch('http://localhost:5000/api/labtasks/lab-staff');
      const staffData = await staffResponse.json();
      
      // Ensure data is in the correct format
      const processedTasks = Array.isArray(tasksData) ? tasksData : 
                            (tasksData && Array.isArray(tasksData.tasks) ? tasksData.tasks : []);
      
      // Process staff data to handle different data structures
      const rawStaffData = Array.isArray(staffData) ? staffData : [];
      const processedStaff = rawStaffData.map(staff => ({
        ...staff,
        name: staff.user?.name || staff.name || `(${staff.lab_staff_id || staff.staff_id})`,
        specialization: staff.specialization || staff.position || 'General'
      }));
      
      setTasks(processedTasks);
      setAssistants(processedStaff);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data. Please check if the backend server is running.');
      
      // Fallback to mock data if API fails
      const mockTasks = [
        {
          _id: 'LTASK001',
          title: 'Blood Analysis - Patient ID: P001',
          assignedStaff: 'Dr. Sarah Wilson',
          priority: 'High',
          status: 'In Progress',
          dueDate: new Date(),
          patient_name: 'John Doe',
          createdAt: new Date()
        },
        {
          _id: 'LTASK002',
          title: 'Urine Analysis - Patient ID: P002',
          assignedStaff: 'Dr. Mike Chen',
          priority: 'Medium',
          status: 'Pending',
          dueDate: new Date(),
          patient_name: 'Jane Smith',
          createdAt: new Date()
        },
        {
          _id: 'LTASK003',
          title: 'Culture Test - Patient ID: P003',
          assignedStaff: 'Dr. Lisa Adams',
          priority: 'Low',
          status: 'Completed',
          dueDate: new Date(),
          patient_name: 'Robert Johnson',
          createdAt: new Date()
        }
      ];

      const mockAssistants = [
        {
          _id: '675b4123456789abcdef0001',
          name: 'Dr. Sarah Wilson',
          status: 'available',
          currentTasks: 2,
          specialization: 'Hematology'
        },
        {
          _id: '675b4123456789abcdef0002',
          name: 'Dr. Mike Chen',
          status: 'busy',
          currentTasks: 3,
          specialization: 'Clinical Chemistry'
        },
        {
          _id: '675b4123456789abcdef0003',
          name: 'Dr. Lisa Adams',
          status: 'available',
          currentTasks: 1,
          specialization: 'Microbiology'
        }
      ];
      
      setTasks(mockTasks);
      setAssistants(mockAssistants);
    } finally {
      setLoading(false);
    }
  };

  // Calculate comprehensive KPIs from real data with safety checks
  const safeTask = Array.isArray(tasks) ? tasks : [];
  const safeAssistants = Array.isArray(assistants) ? assistants : [];
  
  const totalTasks = safeTask.length;
  const completedTasks = safeTask.filter(task => task.status === 'Completed').length;
  const pendingTasks = safeTask.filter(task => task.status === 'Pending').length;
  const inProgressTasks = safeTask.filter(task => task.status === 'In Progress').length;
  const urgentTasks = safeTask.filter(task => task.priority === 'High' || task.priority === 'Urgent').length;
  const overdueTasks = safeTask.filter(task => {
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return dueDate < today && task.status !== 'Completed';
    }
    return false;
  }).length;

  // Staff calculations
  const totalStaff = safeAssistants.length;
  const availableStaff = safeAssistants.filter(assistant => 
    assistant.status === 'available' || assistant.status === 'Available'
  ).length;
  const busyStaff = safeAssistants.filter(assistant => 
    assistant.status === 'busy' || assistant.status === 'Busy'
  ).length;

  // Calculate completion rate
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get latest 5 tasks
  const latestTasks = safeTask
    .sort((a, b) => new Date(b.createdAt || b.dueDate) - new Date(a.createdAt || a.dueDate))
    .slice(0, 5);

  // Helper functions for styling
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
      case 'normal':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'on hold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStaffStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-red-100 text-red-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'tasks') {
    return <TaskListPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lab Supervisor Dashboard</h1>
            <p className="text-gray-600">Monitor lab operations and staff performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setActiveView('tasks')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Manage Tasks
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
                <p className="text-xs text-gray-500 mt-1">All lab tasks</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
                <p className="text-xs text-gray-500 mt-1">{completionRate}% completion rate</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{inProgressTasks}</p>
                <p className="text-xs text-gray-500 mt-1">Active tasks</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-600">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Urgent Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{urgentTasks}</p>
                <p className="text-xs text-gray-500 mt-1">High priority</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Available Staff</p>
                <p className="text-2xl font-bold text-gray-900">{availableStaff}</p>
                <p className="text-xs text-gray-500 mt-1">of {totalStaff} total</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Lab Staff Table and Latest Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Lab Staff Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Lab Staff Overview</h2>
                <span className="text-sm text-gray-500">{totalStaff} staff members</span>
              </div>
            </div>
            <div className="p-6">
              {safeAssistants.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No staff data available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">Name</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">Specialization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {safeAssistants.map((staff) => (
                        <tr key={staff._id} className="hover:bg-gray-50">
                          <td className="py-3">
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <Users className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{staff.name}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="text-sm text-gray-600">{staff.specialization || 'General'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Latest Tasks Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Latest Lab Tasks</h2>
                <button 
                  onClick={() => setActiveView('tasks')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              {latestTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tasks available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {latestTasks.map((task) => (
                    <div key={task._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 text-sm">{task.taskTitle || task.title || 'Untitled Task'}</h3>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority || 'Medium'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status || 'Pending'}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          <span>Assigned to: {task.labAssistant || task.assignedStaff || 'Unassigned'}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</span>
                        </div>
                        {(task.patient || task.patient_name) && (
                          <div className="flex items-center">
                            <UserCheck className="h-4 w-4 mr-2" />
                            <span>Patient: {task.patient?.patient_id || task.patient_name || 'Unknown'}</span>
                          </div>
                        )}
                        {task.taskDescription && (
                          <div className="text-xs text-gray-500 mt-2">
                            {task.taskDescription.substring(0, 100)}{task.taskDescription.length > 100 ? '...' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
