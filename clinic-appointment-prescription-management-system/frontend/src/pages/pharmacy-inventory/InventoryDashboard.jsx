import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InventoryNavigationSidebar from '../../components/InventoryNavigationSidebar';
import '../../styles/Medicine/InventoryDashboard.css';

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
      
      // Generate real recent activity based on actual data
      const recentActivity = [];
      
      // Add recent medicine additions (sort by creation date or ID)
      const recentMedicines = medicines
        .sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id))
        .slice(0, 3);
      
      recentMedicines.forEach((medicine, index) => {
        recentActivity.push({
          type: 'add',
          item: `${medicine.medicineName} ${medicine.strength}`,
          time: medicine.createdAt ? 
            new Date(medicine.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : 
            `${index + 1} day${index > 0 ? 's' : ''} ago`,
          quantity: medicine.quantity,
          category: 'medicine',
          id: medicine._id
        });
      });

      // Add recent lab item additions
      const recentLabItems = labItems
        .sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id))
        .slice(0, 3);
      
      recentLabItems.forEach((labItem, index) => {
        recentActivity.push({
          type: 'add',
          item: labItem.itemName,
          time: labItem.createdAt ? 
            new Date(labItem.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : 
            `${index + 1} day${index > 0 ? 's' : ''} ago`,
          quantity: labItem.quantity,
          category: 'lab',
          id: labItem._id
        });
      });

      // Add recent updates (items with recent updatedAt timestamps)
      const recentUpdates = [...medicines, ...labItems]
        .filter(item => item.updatedAt && item.updatedAt !== item.createdAt)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 2);

      recentUpdates.forEach((item) => {
        recentActivity.push({
          type: 'update',
          item: item.medicineName || item.itemName,
          time: new Date(item.updatedAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          quantity: item.quantity,
          category: item.medicineName ? 'medicine' : 'lab',
          id: item._id
        });
      });

      // Add low stock alerts for critical items
      const criticalItems = [...medicines, ...labItems]
        .filter(item => (item.quantity || 0) <= 5)
        .slice(0, 2);

      criticalItems.forEach((item) => {
        recentActivity.push({
          type: 'alert',
          item: item.medicineName || item.itemName,
          time: 'Today',
          quantity: item.quantity,
          category: item.medicineName ? 'medicine' : 'lab',
          id: item._id
        });
      });

      // Sort all activities by time (most recent first) and limit to 8 items
      const sortedActivity = recentActivity
        .sort((a, b) => {
          // Convert time strings to dates for sorting
          const timeA = new Date(a.time.includes('ago') ? Date.now() - (parseInt(a.time) * 24 * 60 * 60 * 1000) : a.time);
          const timeB = new Date(b.time.includes('ago') ? Date.now() - (parseInt(b.time) * 24 * 60 * 60 * 1000) : b.time);
          return timeB - timeA;
        })
        .slice(0, 8);
      
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
        recentActivity: sortedActivity,
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

    const getActivityText = (activity) => {
      switch (activity.type) {
        case 'add': 
          return `Added new ${activity.category === 'medicine' ? 'medicine' : 'lab item'}`;
        case 'update': 
          return `Updated ${activity.category === 'medicine' ? 'medicine' : 'lab item'}`;
        case 'alert': 
          return `Low stock alert for ${activity.category === 'medicine' ? 'medicine' : 'lab item'}`;
        case 'order': 
          return 'Order delivered';
        default: 
          return 'Activity';
      }
    };

    const handleItemClick = () => {
      if (activity.category === 'medicine') {
        navigate(`/medicine/edit/${activity.id}`);
      } else if (activity.category === 'lab') {
        navigate(`/lab/edit/${activity.id}`);
      }
    };

    return (
      <div className="activity-item" onClick={handleItemClick} style={{ cursor: 'pointer' }}>
        <div className={`activity-icon ${getActivityColor(activity.type)}`}>
          <i className={getActivityIcon(activity.type)}></i>
        </div>
        <div className="activity-content">
          <div className="activity-text">
            <span className="activity-action">
              {getActivityText(activity)}
            </span>
            <span className="activity-item-name">{activity.item}</span>
            {activity.quantity && (
              <span className="activity-quantity">
                Quantity: {activity.quantity}
              </span>
            )}
            {activity.category && (
              <span className={`activity-category ${activity.category}`}>
                {activity.category === 'medicine' ? '💊 Medicine' : '🧪 Lab Item'}
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
    <div className="inventory-nav-layout">
      <InventoryNavigationSidebar />
      <div className="inventory-nav-content">
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
                    <button 
                      className="view-all-btn"
                      onClick={() => navigate('/activities')}
                    >
                      View All Activity
                    </button>
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
                      <span className="alert-count low-stock">
                        Low Stock ({
                          dashboardData.medicines.filter(med => (med.quantity || 0) <= 10).length +
                          dashboardData.labItems.filter(item => (item.quantity || 0) <= 10).length
                        })
                      </span>
                      <span className="alert-count expired">
                        Expired ({
                          dashboardData.medicines.filter(med => med.expiryDate && new Date(med.expiryDate) < new Date()).length +
                          dashboardData.labItems.filter(item => item.expiryDate && new Date(item.expiryDate) < new Date()).length
                        })
                      </span>
                    </div>
                  </div>
                  <div className="stock-alerts">
                    {/* Low Stock Medicines */}
                    {dashboardData.medicines
                      .filter(med => (med.quantity || 0) <= 10)
                      .slice(0, 3)
                      .map((medicine, index) => (
                        <div key={`medicine-${index}`} className="alert-item low-stock">
                          <div className="alert-icon">
                            <i className="fas fa-pills"></i>
                          </div>
                          <div className="alert-content">
                            <div className="alert-title">{medicine.medicineName}</div>
                            <div className="alert-subtitle">
                              {medicine.quantity || 0} {medicine.unit || 'units'} left
                            </div>
                            <div className="alert-progress">
                              <div 
                                className="progress-bar" 
                                style={{ 
                                  width: `${Math.min(((medicine.quantity || 0) / 100) * 100, 100)}%`,
                                  backgroundColor: (medicine.quantity || 0) <= 5 ? '#ef4444' : '#f59e0b'
                                }}
                              ></div>
                            </div>
                          </div>
                          <button 
                            className="alert-action"
                            onClick={() => navigate(`/medicine/edit/${medicine._id}`)}
                          >
                            Update
                          </button>
                        </div>
                      ))}

                    {/* Low Stock Lab Items */}
                    {dashboardData.labItems
                      .filter(item => (item.quantity || 0) <= 10)
                      .slice(0, 3)
                      .map((labItem, index) => (
                        <div key={`lab-${index}`} className="alert-item low-stock">
                          <div className="alert-icon">
                            <i className="fas fa-flask"></i>
                          </div>
                          <div className="alert-content">
                            <div className="alert-title">{labItem.itemName}</div>
                            <div className="alert-subtitle">
                              {labItem.quantity || 0} {labItem.unit || 'units'} left
                            </div>
                            <div className="alert-progress">
                              <div 
                                className="progress-bar" 
                                style={{ 
                                  width: `${Math.min(((labItem.quantity || 0) / 100) * 100, 100)}%`,
                                  backgroundColor: (labItem.quantity || 0) <= 5 ? '#ef4444' : '#f59e0b'
                                }}
                              ></div>
                            </div>
                          </div>
                          <button 
                            className="alert-action"
                            onClick={() => navigate(`/lab/edit/${labItem._id}`)}
                          >
                            Update
                          </button>
                        </div>
                      ))}

                    {/* Expired Items */}
                    {dashboardData.medicines
                      .filter(med => med.expiryDate && new Date(med.expiryDate) < new Date())
                      .slice(0, 2)
                      .map((medicine, index) => (
                        <div key={`expired-med-${index}`} className="alert-item expired">
                          <div className="alert-icon">
                            <i className="fas fa-times-circle"></i>
                          </div>
                          <div className="alert-content">
                            <div className="alert-title">{medicine.medicineName}</div>
                            <div className="alert-subtitle">
                              Expired: {new Date(medicine.expiryDate).toLocaleDateString()}
                            </div>
                            <div className="alert-progress">
                              <div className="progress-bar expired" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                          <button 
                            className="alert-action"
                            onClick={() => navigate(`/medicine/delete/${medicine._id}`)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}

                    {dashboardData.labItems
                      .filter(item => item.expiryDate && new Date(item.expiryDate) < new Date())
                      .slice(0, 2)
                      .map((labItem, index) => (
                        <div key={`expired-lab-${index}`} className="alert-item expired">
                          <div className="alert-icon">
                            <i className="fas fa-times-circle"></i>
                          </div>
                          <div className="alert-content">
                            <div className="alert-title">{labItem.itemName}</div>
                            <div className="alert-subtitle">
                              Expired: {new Date(labItem.expiryDate).toLocaleDateString()}
                            </div>
                            <div className="alert-progress">
                              <div className="progress-bar expired" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                          <button 
                            className="alert-action"
                            onClick={() => navigate(`/lab/delete/${labItem._id}`)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}

                    {/* Show message if no low stock items */}
                    {dashboardData.medicines.filter(med => (med.quantity || 0) <= 10).length === 0 &&
                     dashboardData.labItems.filter(item => (item.quantity || 0) <= 10).length === 0 && (
                      <div className="no-alerts">
                        <i className="fas fa-check-circle"></i>
                        <p>All items are well stocked!</p>
                      </div>
                    )}
                  </div>
                  <div className="view-stock-items">
                    <button 
                      className="view-all-stock-btn"
                      onClick={() => navigate('/low-stock-items')}
                    >
                      View All Low Stock
                    </button>
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
