import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Wrench,
  Filter,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';
import { ValidatedInput, ValidatedTextarea, ValidatedSelect } from '../../../shared/components/ValidatedInput';
import { validators } from '../../../shared/utils/formValidation';

/**
 * Simplified Maintenance Schedule Dashboard
 * Replaces complex calendar view with practical dashboard cards + list view
 */
export const SimplifiedMaintenanceSchedule = () => {
  // State management
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Equipment data for lookup
  const [equipmentLookup, setEquipmentLookup] = useState({});

  // View/Edit/Delete modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Task statistics
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    overdue: 0,
    upcoming: 0
  });

  // Fetch maintenance schedules from API
  useEffect(() => {
    fetchMaintenanceSchedules();
    fetchEquipmentLookup();
  }, []);

  // Filter tasks when search/filter criteria change
  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const fetchEquipmentLookup = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/equipment');
      if (response.ok) {
        const data = await response.json();
        const equipment = data.data || [];
        
        // Create lookup map by equipment_id and id
        const lookup = {};
        equipment.forEach(item => {
          if (item.equipment_id) {
            lookup[item.equipment_id] = {
              name: item.name || item.equipment_name || item.equipment_id,
              location: item.location || 'Unknown Location',
              type: item.type
            };
          }
          if (item.id && item.id !== item.equipment_id) {
            lookup[item.id] = {
              name: item.name || item.equipment_name || item.id,
              location: item.location || 'Unknown Location',
              type: item.type
            };
          }
        });
        
        setEquipmentLookup(lookup);
        console.log('Equipment lookup created:', lookup);
      }
    } catch (error) {
      console.error('Error fetching equipment lookup:', error);
    }
  };

  const fetchMaintenanceSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/scheduled-maintenance');
      
      if (response.ok) {
        const data = await response.json();
        const tasksData = data.data || [];
        setTasks(tasksData);
        calculateStats(tasksData);
      } else {
        console.error('Failed to fetch maintenance schedules');
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching maintenance schedules:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tasksData) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const stats = {
      today: 0,
      thisWeek: 0,
      overdue: 0,
      upcoming: 0
    };

    tasksData.forEach(task => {
      const taskDate = new Date(task.scheduled_date);
      const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());

      if (task.status !== 'Completed') {
        // Today's schedules
        if (taskDateOnly.getTime() === today.getTime()) {
          stats.today++;
        }
        
        // This week's schedules
        if (taskDateOnly >= today && taskDateOnly <= nextWeek) {
          stats.thisWeek++;
        }
        
        // Overdue schedules
        if (taskDateOnly < today) {
          stats.overdue++;
        }
        
        // Upcoming schedules (beyond this week)
        if (taskDateOnly > nextWeek) {
          stats.upcoming++;
        }
      }
    });

    setStats(stats);
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.equipment_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Sort by date (overdue first, then by scheduled date)
    filtered.sort((a, b) => {
      const dateA = new Date(a.scheduled_date);
      const dateB = new Date(b.scheduled_date);
      const now = new Date();

      // Overdue schedules first
      const isOverdueA = dateA < now && a.status !== 'Completed';
      const isOverdueB = dateB < now && b.status !== 'Completed';

      if (isOverdueA && !isOverdueB) return -1;
      if (!isOverdueA && isOverdueB) return 1;

      // Then by date
      return dateA - dateB;
    });

    setFilteredTasks(filtered);
  };

  // Helper function to get equipment display name
  const getEquipmentDisplayName = (task) => {
    // First, try API provided names
    if (task.equipmentName && task.equipmentName !== 'Unknown Equipment') {
      return task.equipmentName;
    }
    if (task.equipment_name && task.equipment_name !== 'Unknown Equipment') {
      return task.equipment_name;
    }
    
    // Then try equipment lookup
    const equipmentId = task.equipment_id || task.equipmentId;
    if (equipmentId && equipmentLookup[equipmentId]) {
      return equipmentLookup[equipmentId].name;
    }
    
    // Fallback to equipment ID
    return equipmentId ? `Equipment ${equipmentId}` : 'Equipment Not Specified';
  };

  // Helper function to get equipment location
  const getEquipmentLocation = (task) => {
    // First try API provided location
    if (task.equipmentLocation && task.equipmentLocation !== 'Unknown Location') {
      return task.equipmentLocation;
    }
    
    // Then try equipment lookup
    const equipmentId = task.equipment_id || task.equipmentId;
    if (equipmentId && equipmentLookup[equipmentId]) {
      return equipmentLookup[equipmentId].location;
    }
    
    return 'Unknown Location';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = (date, status) => {
    return new Date(date) < new Date() && status !== 'Completed';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Handle adding new maintenance schedule
  const handleAddSchedule = async (scheduleData) => {
    try {
      console.log('📤 Sending maintenance schedule data:', JSON.stringify(scheduleData, null, 2));
      
      const response = await fetch('http://localhost:5000/api/scheduled-maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      const responseData = await response.json();
      console.log('📥 Backend response:', JSON.stringify(responseData, null, 2));

      if (response.ok) {
        console.log('✅ Maintenance schedule created successfully');
        // Refresh the schedules list
        await fetchMaintenanceSchedules();
        setShowAddForm(false);
        
        // Show success message
        alert('Maintenance schedule created successfully!');
      } else {
        console.error('❌ Failed to create maintenance schedule:', JSON.stringify(responseData, null, 2));
        
        // Show specific validation errors to user
        if (responseData.errors && Array.isArray(responseData.errors)) {
          const errorMessage = 'Validation errors:\n' + responseData.errors.join('\n');
          alert(errorMessage);
        } else {
          alert(`Failed to create maintenance schedule: ${responseData.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('💥 Error creating maintenance schedule:', error);
      alert('Network error: Unable to create maintenance schedule. Please check your connection.');
    }
  };

  // View, Edit, Delete handlers
  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowViewModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"? This action cannot be undone.`)) {
      try {
        console.log('🗑️ Deleting task:', task._id, task.title);
        
        const response = await fetch(`http://localhost:5000/api/scheduled-maintenance/${task._id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          console.log('✅ Delete successful');
          // Remove the deleted task from the tasks list
          setTasks(prevTasks => prevTasks.filter(t => t._id !== task._id));
          alert('Maintenance schedule deleted successfully!');
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.error('❌ Delete failed:', response.status, errorData);
          alert(`Failed to delete maintenance schedule: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('💥 Error deleting maintenance schedule:', error);
        alert('Network error: Unable to delete maintenance schedule. Please check your connection.');
      }
    }
  };

  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      console.log('🔄 Updating task:', taskId, 'with data:', JSON.stringify(updatedData, null, 2));
      
      const response = await fetch(`http://localhost:5000/api/scheduled-maintenance/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Update successful:', responseData);
        
        // Update the task in the tasks list
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === taskId ? responseData.data : task
          )
        );
        setShowEditModal(false);
        setSelectedTask(null);
        alert('Maintenance schedule updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Update failed:', response.status, errorData);
        
        // Show specific validation errors to user
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessage = 'Validation errors:\n' + errorData.errors.join('\n');
          alert(errorMessage);
        } else {
          alert(`Failed to update maintenance schedule: ${errorData.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('💥 Error updating maintenance schedule:', error);
      alert('Network error: Unable to update maintenance schedule. Please check your connection.');
    }
  };

  // Dashboard Cards Component
  const DashboardCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Today's Schedules */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Today's Schedules</p>
            <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs text-gray-500">Due today</p>
        </div>
      </div>

      {/* This Week */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">This Week</p>
            <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs text-gray-500">Due within 7 days</p>
        </div>
      </div>

      {/* Overdue */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Overdue</p>
            <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs text-gray-500">Need immediate attention</p>
        </div>
      </div>

      {/* Upcoming */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Upcoming</p>
            <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs text-gray-500">Future scheduled tasks</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="ml-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Cards */}
      <DashboardCards />

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Maintenance Schedules</h2>
              <p className="mt-1 text-sm text-gray-500">
                {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} total
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                  showFilters
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4 mr-2 inline" />
                Filters
              </button>

              {/* Add Maintenance Schedule Button */}
              <button 
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Add Maintenance Schedule
              </button>
            </div>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option key="status-all" value="all">All Status</option>
                    <option key="status-pending" value="Pending">Pending</option>
                    <option key="status-inprogress" value="In Progress">In Progress</option>
                    <option key="status-completed" value="Completed">Completed</option>
                    <option key="status-cancelled" value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option key="priority-all" value="all">All Priorities</option>
                    <option key="priority-critical" value="Critical">Critical</option>
                    <option key="priority-high" value="High">High</option>
                    <option key="priority-medium" value="Medium">Medium</option>
                    <option key="priority-low" value="Low">Low</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setPriorityFilter('all');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Task List */}
        <div className="divide-y divide-gray-200">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <Wrench className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No maintenance schedules</h3>
              <p className="mt-1 text-sm text-gray-500">
                {tasks.length === 0 
                  ? "Get started by creating a new maintenance task."
                  : "No tasks match your current filters."
                }
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </h3>
                      
                      {/* Status Badge */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>

                      {/* Priority Badge */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>

                      {/* Overdue Indicator */}
                      {isOverdue(task.scheduled_date, task.status) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Overdue
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(task.scheduled_date)}
                      </span>
                      
                      <span className="flex items-center">
                        <Wrench className="w-4 h-4 mr-1" />
                        {getEquipmentDisplayName(task)}
                      </span>

                      {(task.technicianName && task.technicianName !== 'Unassigned') && (
                        <span className="flex items-center">
                          👤 {task.technicianName}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button 
                      onClick={() => handleViewTask(task)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditTask(task)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Edit Task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Maintenance Schedule Form Modal */}
      {showAddForm && (
        <AddMaintenanceScheduleForm 
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddSchedule}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedTask && (
        <ViewTaskModal 
          task={selectedTask}
          getEquipmentDisplayName={getEquipmentDisplayName}
          getEquipmentLocation={getEquipmentLocation}
          onClose={() => {
            setShowViewModal(false);
            setSelectedTask(null);
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTask && (
        <EditTaskModal 
          task={selectedTask}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTask(null);
          }}
          onUpdate={handleUpdateTask}
        />
      )}
    </div>
  );
};

/**
 * Add Maintenance Schedule Form Modal Component
 */
const AddMaintenanceScheduleForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    equipment_id: '',
    scheduled_date: '',
    scheduled_time: '09:00',
    priority: 'Medium',
    status: 'Pending',
    estimated_duration: '2', // Default to 2 hours
    technician_id: '',
    maintenance_type: 'Preventive',
    notes: ''
  });

  const [equipment, setEquipment] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Fetch equipment and technicians on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching equipment and technicians...');
        const [equipmentRes, techniciansRes] = await Promise.all([
          fetch('http://localhost:5000/api/equipment'),
          fetch('http://localhost:5000/api/technicians')
        ]);

        if (equipmentRes.ok) {
          const equipmentData = await equipmentRes.json();
          console.log('Equipment data received:', equipmentData.data?.length || 0, 'items');
          setEquipment(equipmentData.data || []);
        } else {
          console.error('Equipment fetch failed:', equipmentRes.status);
        }

        if (techniciansRes.ok) {
          const techniciansData = await techniciansRes.json();
          console.log('Technicians data received:', techniciansData.data?.length || 0, 'items');
          setTechnicians(techniciansData.data || []);
        } else {
          console.error('Technicians fetch failed:', techniciansRes.status);
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Re-validate field if it was touched and had error
    if (touched[name] && errors[name]) {
      validateField(name, value);
    }
  };

  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'title':
        error = validators.required(value, 'Title');
        if (!error && value.length > 200) {
          error = 'Title must be less than 200 characters';
        }
        break;
      case 'description':
        if (value && value.length > 0) {
          error = validators.textLength(value, 10, 2000, 'Description');
        }
        break;
      case 'equipment_id':
        error = validators.required(value, 'Equipment');
        break;
      case 'scheduled_date':
        error = validators.required(value, 'Scheduled Date');
        if (!error) {
          error = validators.futureDate(value, 'Scheduled Date');
        }
        break;
      case 'scheduled_time':
        error = validators.required(value, 'Scheduled Time');
        break;
      case 'estimated_duration':
        error = validators.required(value, 'Estimated Duration');
        if (!error) {
          error = validators.numberRange(value, 0.5, 8, 'Estimated Duration');
        }
        break;
      case 'priority':
        error = validators.required(value, 'Priority');
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title) {
        alert('Please enter a title for the maintenance schedule');
        setLoading(false);
        return;
      }
      
      if (!formData.equipment_id) {
        alert('Please select equipment');
        setLoading(false);
        return;
      }
      
      if (!formData.scheduled_date) {
        alert('Please select a scheduled date');
        setLoading(false);
        return;
      }

      // Find the selected equipment to get the correct equipment_id
      console.log('Looking for equipment with ID:', formData.equipment_id);
      const selectedEquipment = equipment.find(eq => eq.id === formData.equipment_id);
      if (!selectedEquipment) {
        console.error('Selected equipment not found. Form equipment_id:', formData.equipment_id);
        console.error('Available equipment IDs:', equipment.map(eq => eq.id));
        alert('Selected equipment not found');
        setLoading(false);
        return;
      }

      console.log('Selected equipment:', { id: selectedEquipment.id, equipment_id: selectedEquipment.equipment_id, name: selectedEquipment.name });

      // Validate estimated duration (must be between 0.5 and 8 hours)
      const duration = formData.estimated_duration ? parseFloat(formData.estimated_duration) : 2;
      if (duration < 0.5 || duration > 8) {
        alert('Duration must be between 0.5 and 8 hours');
        setLoading(false);
        return;
      }

      // Create proper date format - combine date and time into ISO string
      let scheduledDate = formData.scheduled_date;
      if (formData.scheduled_time) {
        // Combine date and time into proper ISO format
        scheduledDate = `${formData.scheduled_date}T${formData.scheduled_time}:00.000Z`;
      } else {
        // Default time if not specified
        scheduledDate = `${formData.scheduled_date}T09:00:00.000Z`;
      }

      const submitData = {
        title: formData.title,
        description: formData.description || '',
        equipment_id: selectedEquipment.equipment_id, // Use the actual equipment_id (e.g., "EQ-1002")
        scheduled_date: scheduledDate, // Use ISO format with time
        scheduled_time: formData.scheduled_time || '09:00', // Keep time separate too
        priority: formData.priority || 'Medium',
        status: formData.status || 'Pending',
        maintenance_type: formData.maintenance_type || 'Preventive', // Ensure valid maintenance type
        estimated_duration: duration, // Validated duration
        assigned_technician: formData.technician_id || undefined, // Use assigned_technician field name
        notes: formData.notes || ''
      };

      console.log('Submitting maintenance schedule data:', JSON.stringify(submitData, null, 2));
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Maintenance Schedule</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <ValidatedInput
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={touched.title ? errors.title : ''}
                required
                placeholder="Enter maintenance schedule title"
              />
            </div>

            <div className="md:col-span-2">
              <ValidatedTextarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={touched.description ? errors.description : ''}
                placeholder="Enter detailed description of the maintenance work"
                rows={3}
              />
            </div>

            <div>
              <ValidatedSelect
                label={`Equipment (${Array.isArray(equipment) ? equipment.length : 0} available)`}
                name="equipment_id"
                value={formData.equipment_id}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={touched.equipment_id ? errors.equipment_id : ''}
                required
              >
                <option value="">Select equipment</option>
                {Array.isArray(equipment) && equipment.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.equipment_id}
                  </option>
                ))}
              </ValidatedSelect>
            </div>

            <div>
              <ValidatedSelect
                label={`Technician (${Array.isArray(technicians) ? technicians.length : 0} available)`}
                name="technician_id"
                value={formData.technician_id}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={touched.technician_id ? errors.technician_id : ''}
              >
                <option value="">Select technician</option>
                {Array.isArray(technicians) && technicians.map((tech) => (
                  <option key={tech._id} value={tech._id}>
                    {tech.firstName} {tech.lastName} - {tech.employeeId}
                  </option>
                ))}
              </ValidatedSelect>
            </div>

            <div>
              <ValidatedInput
                label="Scheduled Date"
                type="date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={touched.scheduled_date ? errors.scheduled_date : ''}
                required
              />
            </div>

            <div>
              <ValidatedInput
                label="Scheduled Time"
                type="time"
                name="scheduled_time"
                value={formData.scheduled_time}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={touched.scheduled_time ? errors.scheduled_time : ''}
                required
              />
            </div>

            <div>
              <ValidatedSelect
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={touched.priority ? errors.priority : ''}
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </ValidatedSelect>
            </div>

            <div>
              <ValidatedSelect
                label="Maintenance Type"
                name="maintenance_type"
                value={formData.maintenance_type}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={touched.maintenance_type ? errors.maintenance_type : ''}
                required
              >
                <option value="Preventive">Preventive</option>
                <option value="Repair">Repair</option>
                <option value="Inspection">Inspection</option>
                <option value="Calibration">Calibration</option>
                <option value="Cleaning">Cleaning</option>
              </ValidatedSelect>
            </div>

            <div>
              <ValidatedInput
                label="Estimated Duration (hours)"
                type="number"
                name="estimated_duration"
                value={formData.estimated_duration}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={touched.estimated_duration ? errors.estimated_duration : ''}
                required
                min="0.5"
                max="8"
                step="0.5"
                placeholder="e.g., 2.0"
                helperText="Duration must be between 0.5 and 8 hours"
              />
            </div>

            <div>
              <ValidatedSelect
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={touched.status ? errors.status : ''}
                disabled
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </ValidatedSelect>
              <p className="text-xs text-gray-500 mt-1">Status is automatically set to "Pending" for new schedules</p>
            </div>

            <div className="md:col-span-2">
              <ValidatedTextarea
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={touched.notes ? errors.notes : ''}
                placeholder="Additional notes or special instructions"
                rows={2}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * View Task Modal Component
 */
const ViewTaskModal = ({ task, getEquipmentDisplayName, getEquipmentLocation, onClose }) => {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString, dateString) => {
    try {
      // If we have a separate time string, use it
      if (timeString) {
        return timeString;
      }
      // Otherwise extract time from the date
      if (dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return 'Not specified';
    } catch (error) {
      return 'Invalid Time';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Maintenance Task Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Title and Status */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">{task.title}</h4>
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                {task.priority} Priority
              </span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{task.description}</p>
            </div>
          )}

          {/* Equipment and Technician */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Equipment</label>
              <p className="text-gray-900">
                {getEquipmentDisplayName(task)}
                {getEquipmentLocation(task) && getEquipmentLocation(task) !== 'Unknown Location' && (
                  <span className="text-gray-500 text-sm"> • {getEquipmentLocation(task)}</span>
                )}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Technician</label>
              <p className="text-gray-900">{task.technicianName || 'Not assigned'}</p>
            </div>
          </div>

          {/* Dates and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date & Time</label>
              <p className="text-gray-900">
                {formatDate(task.scheduled_date)} at {formatTime(task.scheduled_time || task.scheduledTime, task.scheduled_date)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Duration</label>
              <p className="text-gray-900">{task.estimated_duration || task.estimatedDuration || 'Not specified'} hours</p>
            </div>
          </div>

          {/* Maintenance Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Type</label>
            <p className="text-gray-900">{task.maintenance_type || task.maintenanceType || 'Not specified'}</p>
          </div>

          {/* Notes */}
          {task.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{task.notes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <span className="font-medium">Created:</span> {formatDate(task.createdAt)}
            </div>
            {task.updatedAt && (
              <div>
                <span className="font-medium">Last Updated:</span> {formatDate(task.updatedAt)}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Edit Task Modal Component
 */
const EditTaskModal = ({ task, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    equipment_id: task.equipment_id || task.equipmentId || '',
    scheduled_date: (() => {
      // Extract date from ISO string
      const dateStr = task.scheduled_date || task.scheduledDate;
      if (dateStr) {
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0]; // Get YYYY-MM-DD format
      }
      return '';
    })(),
    scheduled_time: (() => {
      // Extract time from ISO string or use provided scheduledTime
      if (task.scheduledTime) {
        return task.scheduledTime;
      }
      if (task.scheduled_time) {
        return task.scheduled_time;
      }
      const dateStr = task.scheduled_date || task.scheduledDate;
      if (dateStr) {
        const date = new Date(dateStr);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
      return '09:00';
    })(),
    priority: task.priority || 'Medium',
    status: task.status || 'Pending',
    estimated_duration: task.estimated_duration || task.estimatedDuration || '2',
    assigned_technician: typeof task.assigned_technician === 'object' && task.assigned_technician !== null 
      ? task.assigned_technician._id || task.assigned_technician.id || ''
      : task.assigned_technician || '',
    maintenance_type: task.maintenance_type || task.maintenanceType || 'Preventive',
    notes: task.notes || ''
  });

  const [equipment, setEquipment] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Fetch equipment and technicians on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [equipmentRes, techniciansRes] = await Promise.all([
          fetch('http://localhost:5000/api/equipment'),
          fetch('http://localhost:5000/api/technicians')
        ]);

        if (equipmentRes.ok) {
          const equipmentData = await equipmentRes.json();
          setEquipment(equipmentData.data || []);
        }

        if (techniciansRes.ok) {
          const techniciansData = await techniciansRes.json();
          setTechnicians(techniciansData.data || []);
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };

    fetchData();
  }, []);

  // Update form data when equipment is loaded to set correct equipment selection
  useEffect(() => {
    if (equipment.length > 0 && task.equipment_id) {
      // Find the equipment by its equipment_id (e.g., "EQ-1002")
      const matchingEquipment = equipment.find(eq => eq.equipment_id === task.equipment_id);
      if (matchingEquipment) {
        setFormData(prev => ({
          ...prev,
          equipment_id: matchingEquipment.id // Use the database id for the dropdown
        }));
      }
    }
  }, [equipment, task.equipment_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Re-validate field if it was touched and had error
    if (touched[name] && errors[name]) {
      validateField(name, value);
    }
  };

  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'title':
        error = validators.required(value, 'Title');
        if (!error && value.length > 200) {
          error = 'Title must be less than 200 characters';
        }
        break;
      case 'description':
        if (value && value.length > 0) {
          error = validators.textLength(value, 10, 2000, 'Description');
        }
        break;
      case 'equipment_id':
        error = validators.required(value, 'Equipment');
        break;
      case 'scheduled_date':
        error = validators.required(value, 'Scheduled Date');
        if (!error) {
          error = validators.futureDate(value, 'Scheduled Date');
        }
        break;
      case 'scheduled_time':
        error = validators.required(value, 'Scheduled Time');
        break;
      case 'estimated_duration':
        error = validators.required(value, 'Estimated Duration');
        if (!error) {
          error = validators.numberRange(value, 0.5, 8, 'Estimated Duration');
        }
        break;
      case 'priority':
        error = validators.required(value, 'Priority');
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic validation
      if (!formData.title.trim()) {
        alert('Please enter a title');
        setLoading(false);
        return;
      }

      if (!formData.scheduled_date) {
        alert('Please select a scheduled date');
        setLoading(false);
        return;
      }

      // Validate estimated duration
      const duration = formData.estimated_duration ? parseFloat(formData.estimated_duration) : 2;
      if (duration < 0.5 || duration > 8) {
        alert('Duration must be between 0.5 and 8 hours');
        setLoading(false);
        return;
      }

      // Create proper date format
      let scheduledDate = formData.scheduled_date;
      if (formData.scheduled_time) {
        scheduledDate = `${formData.scheduled_date}T${formData.scheduled_time}:00.000Z`;
      } else {
        scheduledDate = `${formData.scheduled_date}T09:00:00.000Z`;
      }

      // Handle equipment ID conversion if equipment is selected
      let equipmentId = formData.equipment_id;
      if (formData.equipment_id && equipment.length > 0) {
        // Check if it's already in the EQ-xxxx format
        if (!formData.equipment_id.startsWith('EQ-')) {
          // Find the selected equipment to get the correct equipment_id
          const selectedEquipment = equipment.find(eq => eq.id === formData.equipment_id);
          if (selectedEquipment) {
            equipmentId = selectedEquipment.equipment_id;
          }
        }
      }

      // Validate assigned_technician - ensure it's a valid ObjectId or null
      let assignedTechnician = formData.assigned_technician;
      if (assignedTechnician === '' || assignedTechnician === 'undefined') {
        assignedTechnician = null;
      }

      const updateData = {
        title: formData.title,
        description: formData.description || '',
        equipment_id: equipmentId,
        scheduled_date: scheduledDate,
        scheduled_time: formData.scheduled_time || '09:00',
        priority: formData.priority || 'Medium',
        // Status is excluded - status changes should use separate workflow
        maintenance_type: formData.maintenance_type || 'Preventive',
        estimated_duration: duration,
        assigned_technician: assignedTechnician,
        notes: formData.notes || ''
      };

      console.log('Updating task with data:', JSON.stringify(updateData, null, 2));
      await onUpdate(task._id, updateData);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Edit Maintenance Task</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <ValidatedInput
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            onBlur={handleFieldBlur}
            error={touched.title ? errors.title : ''}
            required
            placeholder="Enter maintenance task title"
          />

          {/* Description */}
          <ValidatedTextarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            onBlur={handleFieldBlur}
            error={touched.description ? errors.description : ''}
            placeholder="Enter detailed description of the maintenance work"
            rows={3}
          />

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ValidatedSelect
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={touched.status ? errors.status : ''}
                touched={touched.status}
                disabled
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </ValidatedSelect>
              <p className="text-xs text-gray-500 mt-1">Status cannot be changed from this form</p>
            </div>

            <ValidatedSelect
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={touched.priority ? errors.priority : ''}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </ValidatedSelect>
          </div>

          {/* Equipment and Technician */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedSelect
              label={`Equipment (${Array.isArray(equipment) ? equipment.length : 0} available)`}
              name="equipment_id"
              value={formData.equipment_id}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={touched.equipment_id ? errors.equipment_id : ''}
              required
            >
              <option value="">Select equipment</option>
              {Array.isArray(equipment) && equipment.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.equipment_id}
                </option>
              ))}
            </ValidatedSelect>

            <ValidatedSelect
              label={`Technician (${Array.isArray(technicians) ? technicians.length : 0} available)`}
              name="assigned_technician"
              value={formData.assigned_technician}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={touched.assigned_technician ? errors.assigned_technician : ''}
            >
              <option value="">Select technician</option>
              {Array.isArray(technicians) && technicians.map((tech) => (
                <option key={tech._id} value={tech._id}>
                  {tech.firstName} {tech.lastName} - {tech.employeeId}
                </option>
              ))}
            </ValidatedSelect>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput
              label="Scheduled Date"
              type="date"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={touched.scheduled_date ? errors.scheduled_date : ''}
              required
            />

            <ValidatedInput
              label="Scheduled Time"
              type="time"
              name="scheduled_time"
              value={formData.scheduled_time}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={touched.scheduled_time ? errors.scheduled_time : ''}
              required
            />
          </div>

          {/* Maintenance Type and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedSelect
              label="Maintenance Type"
              name="maintenance_type"
              value={formData.maintenance_type}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={touched.maintenance_type ? errors.maintenance_type : ''}
            >
              <option value="Preventive">Preventive</option>
              <option value="Repair">Repair</option>
              <option value="Inspection">Inspection</option>
              <option value="Calibration">Calibration</option>
              <option value="Cleaning">Cleaning</option>
            </ValidatedSelect>

            <ValidatedInput
              label="Estimated Duration (hours)"
              type="number"
              name="estimated_duration"
              value={formData.estimated_duration}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={touched.estimated_duration ? errors.estimated_duration : ''}
              required
              min="0.5"
              max="8"
              step="0.5"
              placeholder="2.0"
            />
          </div>

          {/* Notes */}
          <ValidatedTextarea
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            onBlur={handleFieldBlur}
            error={touched.notes ? errors.notes : ''}
            placeholder="Additional notes or special instructions"
            rows={3}
          />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimplifiedMaintenanceSchedule;