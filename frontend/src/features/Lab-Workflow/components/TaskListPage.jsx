import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Trash2, Plus, Search, Filter, AlertCircle, CheckCircle, Clock, Calendar, UserPlus, User } from "lucide-react";
import TaskAPI from "../../../api/api";
import PatientSearchModal from "./PatientSearchModal";
// import "../../styles/TaskList.css"; // Removed to prevent style conflicts

const TaskListPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState(null);
  const [labStaff, setLabStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    taskTitle: '',
    taskDescription: '',
    priority: '',
    status: '',
    dueDate: ''
  });
  const [addFormData, setAddFormData] = useState({
    taskTitle: '',
    taskDescription: '',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '',
    patient_id: '',
    patientName: ''
  });
  const [showPatientSearchModal, setShowPatientSearchModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await TaskAPI.get("/");
      console.log("Tasks API response:", response.data);
      
      // Handle different response structures:
      // - Backend API returns: { tasks: [...], count: n }
      // - Mock API returns: { success: true, message: "...", tasks: [...] }
      let tasksData = [];
      
      if (response.data && response.data.tasks && Array.isArray(response.data.tasks)) {
        tasksData = response.data.tasks;
      } else if (Array.isArray(response.data)) {
        tasksData = response.data;
      } else {
        console.warn("Unexpected response structure:", response.data);
        tasksData = [];
      }
      
      setTasks(tasksData);
      setError(null);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to load tasks");
      // Mock data for testing
      setTasks([
        {
          _id: "1",
          task_id: "LTASK001",
          taskTitle: "Blood Sample Analysis",
          taskDescription: "Complete blood count analysis for patient #12345",
          priority: "High",
          status: "Pending",
          dueDate: "2025-09-25",
          labAssistant: "Sarah Johnson",
          createdAt: new Date().toISOString()
        },
        {
          _id: "2", 
          task_id: "LTASK002",
          taskTitle: "Urine Test Processing",
          taskDescription: "Process urine samples from morning collection",
          priority: "Medium",
          status: "In Progress",
          dueDate: "2025-09-22",
          labAssistant: "Michael Chen",
          createdAt: new Date().toISOString()
        },
        {
          _id: "3",
          task_id: "LTASK003", 
          taskTitle: "Equipment Calibration",
          taskDescription: "Weekly calibration of microscopes and analyzers",
          priority: "Low",
          status: "Completed",
          dueDate: "2025-09-20",
          labAssistant: "Emily Davis",
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await TaskAPI.delete(`/${taskId}`);
      setTasks(tasks.filter(task => task._id !== taskId));
      setShowDeleteModal(false);
      setTaskToDelete(null);
      alert("Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Error deleting task: " + error.message);
    }
  };

  const openDeleteModal = (task) => {
    console.log("Opening delete modal for task:", task);
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  const openAssignModal = (task) => {
    console.log("Opening assign modal for task:", task);
    setTaskToAssign(task);
    setShowAssignModal(true);
    setSelectedStaff("");
    fetchLabStaff();
  };

  const closeAssignModal = () => {
    console.log("Closing assign modal");
    setShowAssignModal(false);
    setTaskToAssign(null);
    setSelectedStaff("");
  };

  const fetchLabStaff = async () => {
    console.log("Fetching lab staff...");
    try {
      // You'll need to create this API endpoint
      const response = await TaskAPI.get("/lab-staff");
      console.log("Lab staff response:", response.data);
      setLabStaff(response.data);
    } catch (error) {
      console.error("Error fetching lab staff:", error);
      setLabStaff([]);
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedStaff || !taskToAssign) return;

    try {
      // Validate that the selected staff exists in our list
      const staffMember = labStaff.find(staff => 
        (staff.lab_staff_id || staff.staff_id || staff.id || staff._id) === selectedStaff
      );
      if (!staffMember) {
        setError("Selected staff member not found. Please refresh and try again.");
        return;
      }
      
      const response = await TaskAPI.put(`/${taskToAssign._id}`, {
        labAssistant: selectedStaff
      });
      
      // Refresh tasks list
      fetchTasks();
      closeAssignModal();
      
      // Show success message
      setError(null);
      setTimeout(() => {
        const staffName = staffMember.user?.name || staffMember.name || selectedStaff;
        setError(`Successfully assigned ${staffName} to task ${taskToAssign.task_id}`);
        setTimeout(() => setError(null), 3000);
      }, 100);
    } catch (error) {
      console.error("Error assigning staff:", error);
      console.error("Error details:", error.response?.data);
      setError("Error assigning staff: " + (error.response?.data?.error || error.message));
    }
  };

  const handleAddTask = async () => {
    if (!addFormData.taskTitle || !addFormData.taskDescription) {
      setError("Task title and description are required");
      return;
    }

    if (!addFormData.patient_id) {
      setError("Please select a patient for this task");
      return;
    }

    try {
      await TaskAPI.post('/', {
        taskTitle: addFormData.taskTitle,
        taskDescription: addFormData.taskDescription,
        priority: addFormData.priority,
        status: addFormData.status,
        dueDate: addFormData.dueDate,
        patient_id: addFormData.patient_id
      });
      
      // Refresh tasks list
      fetchTasks();
      closeAddModal();
      
      // Show success message
      setError(null);
      setTimeout(() => {
        setError(`Successfully created task: ${addFormData.taskTitle}`);
        setTimeout(() => setError(null), 3000);
      }, 100);
    } catch (error) {
      console.error("Error creating task:", error);
      setError("Error creating task: " + error.message);
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddFormData({
      taskTitle: '',
      taskDescription: '',
      priority: 'Medium',
      status: 'Pending',
      dueDate: '',
      patient_id: '',
      patientName: ''
    });
    setSelectedPatient(null);
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openPatientSearchModal = () => {
    setShowPatientSearchModal(true);
  };

  const closePatientSearchModal = () => {
    setShowPatientSearchModal(false);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setAddFormData(prev => ({
      ...prev,
      patient_id: patient._id,
      patientName: patient.name
    }));
    closePatientSearchModal();
  };

  const openEditModal = (task) => {
    console.log("openEditModal called with task:", task);
    setTaskToEdit(task);
    setEditFormData({
      taskTitle: task.taskTitle || '',
      taskDescription: task.taskDescription || '',
      priority: task.priority || '',
      status: task.status || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
    
    // Force re-render by using setTimeout
    setTimeout(() => {
      console.log("Modal state after timeout:", { showEditModal: true, taskToEdit: task });
    }, 100);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setTaskToEdit(null);
    setEditFormData({
      taskTitle: '',
      taskDescription: '',
      priority: '',
      status: '',
      dueDate: ''
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateTask = async () => {
    if (!taskToEdit) return;

    try {
      await TaskAPI.put(`/${taskToEdit._id}`, editFormData);
      
      // Refresh tasks list
      fetchTasks();
      closeEditModal();
      setError("Task updated successfully!");
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Error updating task: " + error.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'in progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      default: return 'status-default';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredTasks = Array.isArray(tasks) ? tasks.filter(task => {
    const matchesSearch = task.taskTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.task_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.labAssistant && (
                           (typeof task.labAssistant === 'string' && task.labAssistant.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (typeof task.labAssistant === 'object' && task.labAssistant.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                         ));
    
    const matchesStatus = statusFilter === "All" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Force cache refresh - Button restored: 2025-09-20 17:35 */}
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Lab Tasks</h1>
            <p className="text-gray-600 mt-1">Manage and track all laboratory tasks</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Add New Task
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{tasks.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock size={20} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {tasks.filter(task => task.status === 'Pending').length}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock size={20} className="text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {tasks.filter(task => task.status === 'In Progress').length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertCircle size={20} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {tasks.filter(task => task.status === 'Completed').length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={20} className="text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks by title, ID, or assistant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors min-w-28"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors min-w-28"
              >
                <option value="All">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-6">
                {tasks.length === 0 
                  ? "No tasks have been created yet." 
                  : "No tasks match your current filters."
                }
              </p>
              <Link 
                to="/add-task" 
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Add Your First Task
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="w-24 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task ID
                    </th>
                    <th className="w-64 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title & Description
                    </th>
                    <th className="w-40 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="w-40 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="w-24 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="w-28 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="w-28 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="w-40 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">{task.task_id}</span>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{task.taskTitle}</p>
                          {task.taskDescription && (
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              {task.taskDescription}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Patient Column */}
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          {task.patient ? (
                            <>
                              <p className="text-sm font-medium text-gray-900 truncate">{task.patient.name}</p>
                              <p className="text-sm text-gray-600 truncate">{task.patient.patient_id}</p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">No patient assigned</p>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 flex-shrink-0">
                            {task.labAssistant 
                              ? (typeof task.labAssistant === 'string' 
                                  ? task.labAssistant.split(' ').map(n => n[0]).join('').toUpperCase()
                                  : task.labAssistant.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
                                )
                              : '?'
                            }
                          </div>
                          <div className="ml-2 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {task.labAssistant 
                                ? (typeof task.labAssistant === 'string' 
                                    ? task.labAssistant 
                                    : task.labAssistant.name || 'Unknown'
                                  )
                                : 'Unassigned'}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          task.priority === 'High' ? 'bg-red-100 text-red-800' :
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900">
                          {formatDate(task.dueDate)}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              console.log("Assign button clicked!");
                              openAssignModal(task);
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors focus:outline-none focus:ring-0"
                            title="Assign Staff"
                          >
                            <UserPlus size={16} />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("Edit button clicked for task:", task);
                              openEditModal(task);
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-0"
                            title="Edit Task"
                          >
                            <Edit size={16} />
                          </button>
                          
                          <button
                            onClick={() => {
                              console.log("Delete button clicked!");
                              openDeleteModal(task);
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-0"
                            title="Delete Task"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && taskToDelete && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Delete Task</h3>
                <p className="text-sm text-gray-600 text-center mb-4">
                  Are you sure you want to delete this task? This action cannot be undone.
                </p>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="text-sm font-medium text-gray-900">{taskToDelete.task_id}</div>
                  <div className="text-sm text-gray-600">{taskToDelete.taskTitle}</div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={closeDeleteModal}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteTask(taskToDelete._id)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assign Staff Modal */}
        {showAssignModal && taskToAssign && (
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              backdropFilter: 'blur(2px)'
            }}
            onClick={closeAssignModal}
          >
            <div 
              className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto"
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                maxWidth: '32rem',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <UserPlus className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Assign Lab Assistant</h3>
                    <p className="text-sm text-gray-500">{taskToAssign?.task_id}</p>
                  </div>
                </div>
                <button
                  onClick={closeAssignModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Task Info */}
                  <div className="bg-gray-50 rounded-md p-4">
                    <div className="text-sm font-medium text-gray-900 mb-1">{taskToAssign.taskTitle}</div>
                    <div className="text-xs text-gray-600 mb-2">{taskToAssign.taskDescription}</div>
                    <div className="text-xs text-gray-500">
                      Currently assigned: {taskToAssign.labAssistant
                        ? (typeof taskToAssign.labAssistant === 'string' 
                            ? taskToAssign.labAssistant 
                            : taskToAssign.labAssistant.name || 'Unknown')
                        : 'Unassigned'}
                    </div>
                  </div>

                  {/* Staff Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Lab Assistant <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedStaff}
                      onChange={(e) => setSelectedStaff(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white"
                    >
                      <option value="">Select a lab assistant</option>
                      {labStaff.map((staff) => (
                        <option key={staff.lab_staff_id || staff.staff_id || staff._id} value={staff.lab_staff_id || staff.staff_id}>
                          {staff.user?.name || staff.name || `(${staff.lab_staff_id || staff.staff_id})`}
                        </option>
                      ))}
                    </select>
                    {labStaff.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">No lab assistants available</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={closeAssignModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignStaff}
                  disabled={!selectedStaff}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Assign Staff
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {showEditModal && (
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              backdropFilter: 'blur(2px)'
            }}
            onClick={closeEditModal}
          >
            <div 
              className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto"
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                maxWidth: '32rem',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <Edit className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
                    <p className="text-sm text-gray-500">{taskToEdit?.task_id}</p>
                  </div>
                </div>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form Body */}
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="taskTitle"
                      value={editFormData.taskTitle}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Enter task title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="taskDescription"
                      value={editFormData.taskDescription}
                      onChange={handleEditFormChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                      placeholder="Enter task description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={editFormData.priority}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                      >
                        <option value="">Select Priority</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                      >
                        <option value="">Select Status</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={editFormData.dueDate}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTask}
                  disabled={!editFormData.taskTitle.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Update Task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Task Modal */}
        {showAddModal && (
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              backdropFilter: 'blur(2px)'
            }}
            onClick={closeAddModal}
          >
            <div 
              className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto"
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                maxWidth: '32rem',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <Plus className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Add New Task</h3>
                    <p className="text-sm text-gray-500">Create a new laboratory task</p>
                  </div>
                </div>
                <button
                  onClick={closeAddModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form Body */}
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="taskTitle"
                      value={addFormData.taskTitle}
                      onChange={handleAddFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      placeholder="Enter task title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="taskDescription"
                      value={addFormData.taskDescription}
                      onChange={handleAddFormChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm resize-none"
                      placeholder="Enter task description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={addFormData.priority}
                        onChange={handleAddFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={addFormData.status}
                        onChange={handleAddFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={addFormData.dueDate}
                      onChange={handleAddFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>

                  {/* Patient Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={selectedPatient ? `${selectedPatient.name} (${selectedPatient.patient_id})` : ''}
                          placeholder="No patient selected"
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={openPatientSearchModal}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <User size={16} />
                        <span>Find Patient</span>
                      </button>
                    </div>
                    {selectedPatient && (
                      <div className="mt-2 text-xs text-gray-600">
                        Selected: {selectedPatient.name} - {selectedPatient.patient_id}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={closeAddModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={!addFormData.taskTitle.trim() || !addFormData.taskDescription.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center">
              <AlertCircle size={18} className="mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Patient Search Modal */}
        <PatientSearchModal
          isOpen={showPatientSearchModal}
          onClose={closePatientSearchModal}
          onSelectPatient={handleSelectPatient}
        />
      </div>
    </div>
  );
};

export default TaskListPage;