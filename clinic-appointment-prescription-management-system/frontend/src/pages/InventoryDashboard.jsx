import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar/Sidebar';
import '../styles/InventoryDashboard.css';

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalInventory: 0,
    lowStock: 0,
    expiredItems: 0,
    inventoryValue: 0,
    medicines: [],
    labItems: [],
    recentActivity: [],
    upcomingDeliveries: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch medicines data
      const medicinesRes = await axios.get('http://localhost:5000/api/medicines');
      const medicines = medicinesRes.data.data || [];
      
      // Fetch lab inventory data
      const labRes = await axios.get('http://localhost:5000/api/lab-inventory');
      const labItems = labRes.data.data || [];
      
      // Calculate metrics
      const totalInventory = medicines.length + labItems.length;
      const lowStock = medicines.filter(med => (med.quantity || 0) <= 10).length + 
                      labItems.filter(item => (item.quantity || 0) <= 10).length;
      const expiredItems = medicines.filter(med => 
        med.expiryDate && new Date(med.expiryDate) < new Date()
      ).length + labItems.filter(item => 
        item.expiryDate && new Date(item.expiryDate) < new Date()
      ).length;
      
      // Mock inventory value calculation
      const inventoryValue = 285750;
      
      // Recent activity (mock data for now)
      const recentActivity = [
        { type: 'add', item: 'Amoxicillin 500mg', time: 'Today, 10:23 AM', quantity: 100 },
        { type: 'order', item: 'Order #ORD-2023-089', time: 'Today, 09:10 AM' },
        { type: 'update', item: 'Microscope Slides', time: 'Yesterday, 04:30 PM', quantity: 50 },
        { type: 'alert', item: 'Lisinopril 10mg', time: 'Yesterday, 02:00 PM', quantity: 25 },
        { type: 'order', item: 'Order #ORD-2023-090', time: 'Yesterday, 11:30 AM' }
      ];
      
      // Upcoming deliveries (mock data)
      const upcomingDeliveries = [
        { id: 'ORD-2023-090', supplier: 'PharmaCorp', items: 12, date: 'Tomorrow' },
        { id: 'ORD-2023-092', supplier: 'MediSupply', items: 5, date: 'Oct 16' },
        { id: 'ORD-2023-095', supplier: 'LabEquip Co.', items: 15, date: 'Oct 18' }
      ];

      setDashboardData({
        totalInventory,
        lowStock,
        expiredItems,
        inventoryValue,
        medicines,
        labItems,
        recentActivity,
        upcomingDeliveries
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, trend, color = 'blue' }) => (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-header">
        <div className="stat-info">
          <h3 className="stat-title">{title}</h3>
          <div className="stat-value">{value}</div>
          {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        </div>
        <div className="stat-icon">
          <i className={icon}></i>
        </div>
      </div>
      {trend && (
        <div className="stat-trend">
          <span className={`trend ${trend.type}`}>
            <i className={`fas fa-arrow-${trend.type === 'up' ? 'up' : 'down'}`}></i>
            {trend.value}
          </span>
          <span className="trend-text">{trend.text}</span>
        </div>
      )}
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'add': return 'fas fa-plus-circle';
        case 'order': return 'fas fa-shopping-cart';
        case 'update': return 'fas fa-edit';
        case 'alert': return 'fas fa-exclamation-triangle';
        default: return 'fas fa-info-circle';
      }
    };

    const getActivityColor = (type) => {
      switch (type) {
        case 'add': return 'success';
        case 'order': return 'primary';
        case 'update': return 'warning';
        case 'alert': return 'danger';
        default: return 'info';
      }
    };

    return (
      <div className="activity-item">
        <div className={`activity-icon ${getActivityColor(activity.type)}`}>
          <i className={getActivityIcon(activity.type)}></i>
        </div>
        <div className="activity-content">
          <div className="activity-text">
            <span className="activity-action">
              {activity.type === 'add' && 'Added new item'}
              {activity.type === 'order' && 'Order delivered'}
              {activity.type === 'update' && 'Updated item'}
              {activity.type === 'alert' && 'Low stock alert'}
            </span>
            <span className="activity-item-name">{activity.item}</span>
            {activity.quantity && (
              <span className="activity-quantity">
                Quantity: {activity.quantity}
              </span>
            )}
          </div>
          <div className="activity-time">{activity.time}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content-with-sidebar">
        <div className="dashboard-container">
          {/* Header */}
          <div className="header">
            <div className="header-left">
              <h1>Inventory Dashboard</h1>
              <div className="current-date">Monday, September 2, 2025</div>
            </div>
            <div className="header-right">
              <div className="pharmacist-info">
                <i className="fas fa-user-circle"></i>
                <span className="pharmacist-name">Inventory Manager</span>
              </div>
              
            </div>
          </div>

          {/* Dashboard Main Content */}
          <div className="dashboard-main">
            <div className="dashboard-content">
              <div className="left-content">
                {/* Statistics Cards */}
                <div className="stats-row">
                  <div className="stat-card pending">
                    <div className="stat-icon">
                      <i className="fas fa-boxes"></i>
                    </div>
                    <div className="stat-info">
                      <div className="stat-label">Total Inventory Items</div>
                      <div className="stat-value">{dashboardData.totalInventory}</div>
                      <div className="stat-detail">+3.5% vs last month</div>
                    </div>
                  </div>
                  
                  <div className="stat-card low-stock">
                    <div className="stat-icon">
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div className="stat-info">
                      <div className="stat-label">Low Stock</div>
                      <div className="stat-value">{dashboardData.lowStock}</div>
                      <div className="stat-detail">items attention</div>
                    </div>
                  </div>

                  <div className="stat-card expired">
                    <div className="stat-icon">
                      <i className="fas fa-times-circle"></i>
                    </div>
                    <div className="stat-info">
                      <div className="stat-label">Expired Items</div>
                      <div className="stat-value">{dashboardData.expiredItems}</div>
                      <div className="stat-detail">need disposal</div>
                    </div>
                  </div>

                  <div className="stat-card value">
                    <div className="stat-icon">
                      <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="stat-info">
                      <div className="stat-label">Inventory Value</div>
                      <div className="stat-value">${dashboardData.inventoryValue.toLocaleString()}</div>
                      <div className="stat-detail">+5.2% vs last month</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <h2 className="card-title">Recent Activity</h2>
                    <button className="view-all-btn">View All Activity</button>
                  </div>
                  <div className="activity-list">
                    {dashboardData.recentActivity.map((activity, index) => (
                      <ActivityItem key={index} activity={activity} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side Content */}
              <div className="right-content">
                {/* Stock Alerts */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <h2 className="card-title">Stock Alerts</h2>
                    <div className="alert-counts">
                      <span className="alert-count low-stock">Low Stock (4)</span>
                      <span className="alert-count expired">Expired (4)</span>
                    </div>
                  </div>
                  <div className="stock-alerts">
            <div className="alert-item low-stock">
              <div className="alert-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="alert-content">
                <div className="alert-title">Lisinopril 10mg</div>
                <div className="alert-subtitle">25 left</div>
                <div className="alert-progress">
                  <div className="progress-bar" style={{ width: '25%' }}></div>
                </div>
              </div>
              <button className="alert-action">Add</button>
            </div>
            
            <div className="alert-item low-stock">
              <div className="alert-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="alert-content">
                <div className="alert-title">Test Tubes (10ml)</div>
                <div className="alert-subtitle">15 left</div>
                <div className="alert-progress">
                  <div className="progress-bar" style={{ width: '15%' }}></div>
                </div>
              </div>
              <button className="alert-action">Add</button>
            </div>

            <div className="alert-item low-stock">
              <div className="alert-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="alert-content">
                <div className="alert-title">Metformin 850mg</div>
                <div className="alert-subtitle">8 left</div>
                <div className="alert-progress">
                  <div className="progress-bar" style={{ width: '8%' }}></div>
                </div>
              </div>
              <button className="alert-action">Add</button>
            </div>

            <div className="alert-item expired">
              <div className="alert-icon">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="alert-content">
                <div className="alert-title">Microscope Slides</div>
                <div className="alert-subtitle">50 items expired</div>
                <div className="alert-progress">
                  <div className="progress-bar expired" style={{ width: '100%' }}></div>
                </div>
              </div>
              <button className="alert-action">View</button>
            </div>
          </div>
          <div className="view-stock-items">
            <Link to="/lab-inventory" className="stock-link">View All Low Stock Items</Link>
          </div>
        </div>

        {/* Upcoming Deliveries */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Deliveries</h2>
          </div>
          <div className="deliveries-list">
            {dashboardData.upcomingDeliveries.map((delivery, index) => (
              <div key={index} className="delivery-item">
                <div className="delivery-info">
                  <div className="delivery-id">{delivery.id}</div>
                  <div className="delivery-supplier">{delivery.supplier}</div>
                </div>
                <div className="delivery-items">{delivery.items} Items</div>
                <div className="delivery-date">{delivery.date}</div>
              </div>
            ))}
          </div>
          <div className="view-all-orders">
            <Link to="/orders" className="orders-link">View All Orders</Link>
          </div>
        </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <div className="action-card">
                <div className="action-icon">
                  <i className="fas fa-flask"></i>
                </div>
                <div className="action-content">
                  <div>
                    <h3>Lab Inventory</h3>
                    <p>Manage laboratory equipment and supplies</p>
                  </div>
                  <button className="action-btn" onClick={() => navigate('/lab/list')}>Go to Lab Inventory</button>
                </div>
              </div>

              <div className="action-card">
                <div className="action-icon">
                  <i className="fas fa-pills"></i>
                </div>
                <div className="action-content">
                  <div>
                    <h3>Medicine Inventory</h3>
                    <p>Manage pharmaceutical products and medications</p>
                  </div>
                  <button className="action-btn" onClick={() => navigate('/medicine/list')}>Go to Medicine Inventory</button>
                </div>
              </div>

              <div className="action-card">
                <div className="action-icon">
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <div className="action-content">
                  <div>
                    <h3>Order Management</h3>
                    <p>Track and manage inventory orders and deliveries</p>
                  </div>
                  <button className="action-btn" onClick={() => navigate('/orders')}>Go to Order Management</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
