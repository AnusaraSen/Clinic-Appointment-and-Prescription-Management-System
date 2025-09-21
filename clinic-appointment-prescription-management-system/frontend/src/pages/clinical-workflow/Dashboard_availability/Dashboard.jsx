import React, { useState, useEffect } from 'react';
import '../../../styles/clinical-workflow/Dashboard.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ClinicalSidebar from '../../../components/ClinicalSidebar';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    patientsSeen: 0,
    pendingFollowUps: 0,
    prescriptionsIssued: 0,
    targetPercentage: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [urgentTasks, setUrgentTasks] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const base = 'http://localhost:5000';
      const [statsRes, appointmentsRes, tasksRes, activitiesRes] = await Promise.all([
        axios.get(`${base}/dashboard/stats`),
        axios.get(`${base}/dashboard/appointments/today`),
        axios.get(`${base}/dashboard/tasks/urgent`),
        axios.get(`${base}/dashboard/activities/recent`)
      ]);

      setStats(statsRes.data);
      setAppointments(appointmentsRes.data);
      setUrgentTasks(tasksRes.data);
      setRecentActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
  const base = 'http://localhost:5000';
  await axios.patch(`${base}/dashboard/appointments/${appointmentId}/status`, { status });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const completeTask = async (taskId) => {
    try {
  const base = 'http://localhost:5000';
  await axios.patch(`${base}/dashboard/tasks/${taskId}/complete`);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInHours = Math.floor((targetDate - now) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Due now';
    } else if (diffInHours < 24) {
      return `Due in ${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
    } else {
      return 'Due today';
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="clinical-main-layout">
      <ClinicalSidebar />
      
      <div className="clinical-main-content">
        <div className="dashboard-layout">
          {/* Main Content */}
          <div className="dashboard-main">
            {/* Header */}
            <header className="dashboard-header">
              <div className="header-left">
                <h1>Dashboard</h1>
              </div>
              <div className="header-right">
                <button className="notification-btn">🔔</button>
                <div className="user-profile" onClick={() => navigate('/doctor-profile')}>
                  <span className="user-avatar">👨‍⚕️</span>
                  <span className="user-name">Dr. Alex Mitchell</span>
                </div>
              </div>
            </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📅</div>
            <div className="stat-content">
              <h3>Today's Appointments</h3>
              <div className="stat-number">{stats.todayAppointments}</div>
              <div className="stat-change positive">+2 from yesterday</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">👥</div>
            <div className="stat-content">
              <h3>Patients Seen</h3>
              <div className="stat-number">{stats.patientsSeen}</div>
              <div className="stat-change">{stats.targetPercentage}% of daily target</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">⏰</div>
            <div className="stat-content">
              <h3>Pending Follow-ups</h3>
              <div className="stat-number">{stats.pendingFollowUps}</div>
              <div className="stat-change negative">2 due today</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">💊</div>
            <div className="stat-content">
              <h3>Prescriptions Issued</h3>
              <div className="stat-number">{stats.prescriptionsIssued}</div>
              <div className="stat-change positive">+5 from yesterday</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Today's Appointments */}
          <div className="content-section appointments-section">
            <div className="section-header">
              <h2>Today's Appointments</h2>
              <button className="view-calendar-btn">View Calendar →</button>
            </div>
            
            <div className="appointments-list">
              {appointments.map((appointment) => (
                <div key={appointment._id} className={`appointment-item ${appointment.status}`}>
                  <div className="appointment-time">
                    <span className="time">{formatTime(appointment.appointment_time)}</span>
                    <span className="type">{appointment.appointment_type}</span>
                  </div>
                  
                  <div className="appointment-patient">
                    <div className="patient-avatar">
                      {appointment.initials || getInitials(appointment.patient_name)}
                    </div>
                    <span className="patient-name">{appointment.patient_name}</span>
                  </div>

                  <div className="appointment-status">
                    {appointment.status === 'upcoming' && (
                      <>
                        <span className="status-badge upcoming">Upcoming</span>
                        <div className="appointment-actions">
                          <button 
                            className="btn-start"
                            onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                          >
                            Start Session
                          </button>
                          <button className="btn-reschedule">Reschedule</button>
                          <button 
                            className="btn-cancel"
                            onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                    {appointment.status === 'completed' && (
                      <>
                        <span className="status-badge completed">Completed</span>
                        <span className="status-icon">✅</span>
                      </>
                    )}
                    {appointment.status === 'cancelled' && (
                      <>
                        <span className="status-badge cancelled">Cancelled</span>
                        <span className="status-icon">❌</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent Tasks */}
          <div className="content-section tasks-section">
            <h2>Urgent Tasks</h2>
            <div className="tasks-list">
              {urgentTasks.map((task) => (
                <div key={task._id} className="task-item">
                  <div className="task-priority">
                    {task.priority === 'urgent' ? '🔴' : '🟠'}
                  </div>
                  <div className="task-content">
                    <h4>{task.title}</h4>
                    <p className="task-patient">for {task.patient_name}</p>
                    <span className="task-due">{formatRelativeTime(task.due_date)}</span>
                  </div>
                  <button 
                    className="task-complete-btn"
                    onClick={() => completeTask(task._id)}
                  >
                    ✓
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="content-section activity-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <button className="view-all-btn">View all</button>
          </div>
          
          <div className="activity-list">
            {recentActivities.map((activity) => (
              <div key={activity._id} className="activity-item">
                <div className="activity-content">
                  <p>{activity.description}</p>
                  <span className="activity-time">
                    {new Date(activity.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <span className={`activity-badge ${activity.type}`}>
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;