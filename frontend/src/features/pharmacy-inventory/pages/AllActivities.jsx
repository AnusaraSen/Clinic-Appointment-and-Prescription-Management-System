import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../authentication/context/AuthContext';
import axios from 'axios';

import '../../../styles/Medicine/AllActivities.css';

const AllActivities = () => {
  const navigate = useNavigate();
  const { user } = useAuth?.() || {};
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, filterType, filterCategory, searchTerm]);

  const fetchAllActivities = async () => {
    try {
      setLoading(true);
      
      // Fetch medicines data
      const medicinesRes = await axios.get('http://localhost:5000/api/medicines');
      const medicines = medicinesRes.data.data || [];
      
      // Fetch lab inventory data
      const labRes = await axios.get('http://localhost:5000/api/lab-inventory');
      const labItems = labRes.data.data || [];
      
      // Generate comprehensive activity list
      const allActivities = [];
      
      // Add all medicine additions
      medicines.forEach((medicine) => {
        allActivities.push({
          type: 'add',
          item: `${medicine.medicineName} ${medicine.strength || ''}`.trim(),
          time: medicine.createdAt ? 
            new Date(medicine.createdAt) : 
            new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          quantity: medicine.quantity,
          category: 'medicine',
          id: medicine._id,
          details: {
            manufacturer: medicine.manufacturer,
            expiryDate: medicine.expiryDate,
            batchNumber: medicine.batchNumber
          }
        });
      });

      // Add all lab item additions
      labItems.forEach((labItem) => {
        allActivities.push({
          type: 'add',
          item: labItem.itemName,
          time: labItem.createdAt ? 
            new Date(labItem.createdAt) : 
            new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          quantity: labItem.quantity,
          category: 'lab',
          id: labItem._id,
          details: {
            unit: labItem.unit,
            location: labItem.location,
            expiryDate: labItem.expiryDate
          }
        });
      });

      // Add updates for items with updatedAt different from createdAt
      [...medicines, ...labItems].forEach((item) => {
        if (item.updatedAt && item.updatedAt !== item.createdAt) {
          allActivities.push({
            type: 'update',
            item: item.medicineName || item.itemName,
            time: new Date(item.updatedAt),
            quantity: item.quantity,
            category: item.medicineName ? 'medicine' : 'lab',
            id: item._id,
            details: item.medicineName ? {
              manufacturer: item.manufacturer,
              expiryDate: item.expiryDate,
              batchNumber: item.batchNumber
            } : {
              unit: item.unit,
              location: item.location,
              expiryDate: item.expiryDate
            }
          });
        }
      });

      // Add low stock alerts
      [...medicines, ...labItems].forEach((item) => {
        if ((item.quantity || 0) <= 10) {
          allActivities.push({
            type: 'alert',
            item: item.medicineName || item.itemName,
            time: new Date(), // Current time for alerts
            quantity: item.quantity,
            category: item.medicineName ? 'medicine' : 'lab',
            id: item._id,
            alertLevel: (item.quantity || 0) <= 5 ? 'critical' : 'warning',
            details: item.medicineName ? {
              manufacturer: item.manufacturer,
              expiryDate: item.expiryDate,
              batchNumber: item.batchNumber
            } : {
              unit: item.unit,
              location: item.location,
              expiryDate: item.expiryDate
            }
          });
        }
      });

      // Add expired items alerts
      [...medicines, ...labItems].forEach((item) => {
        if (item.expiryDate && new Date(item.expiryDate) < new Date()) {
          allActivities.push({
            type: 'expired',
            item: item.medicineName || item.itemName,
            time: new Date(item.expiryDate),
            quantity: item.quantity,
            category: item.medicineName ? 'medicine' : 'lab',
            id: item._id,
            details: item.medicineName ? {
              manufacturer: item.manufacturer,
              expiryDate: item.expiryDate,
              batchNumber: item.batchNumber
            } : {
              unit: item.unit,
              location: item.location,
              expiryDate: item.expiryDate
            }
          });
        }
      });

      // Sort by time (most recent first)
      const sortedActivities = allActivities.sort((a, b) => new Date(b.time) - new Date(a.time));
      
      setActivities(sortedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = activities;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.type === filterType);
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(activity => activity.category === filterCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.item.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'add': return 'fas fa-plus-circle';
      case 'update': return 'fas fa-edit';
      case 'alert': return 'fas fa-exclamation-triangle';
      case 'expired': return 'fas fa-times-circle';
      default: return 'fas fa-info-circle';
    }
  };

  const getActivityColor = (activity) => {
    switch (activity.type) {
      case 'add': return 'success';
      case 'update': return 'warning';
      case 'alert': 
        return activity.alertLevel === 'critical' ? 'danger' : 'warning';
      case 'expired': return 'danger';
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
        return `${activity.alertLevel === 'critical' ? 'Critical' : 'Low'} stock alert`;
      case 'expired': 
        return `Expired ${activity.category === 'medicine' ? 'medicine' : 'lab item'}`;
      default: 
        return 'Activity';
    }
  };

  const handleActivityClick = (activity) => {
    if (activity.category === 'medicine') {
      navigate(`/medicine/edit/${activity.id}`);
    } else if (activity.category === 'lab') {
      navigate(`/lab/edit/${activity.id}`);
    }
  };

  const formatTime = (time) => {
    const date = new Date(time);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activities-container">
          {/* Header */}
          <div className="activities-header">
            <div className="header-left">
              <button
                className="back-btn"
                onClick={() => {
                  const role = user?.role;
                  if (role === 'Pharmacist' || role === 'Pharmacy Manager') {
                    navigate('/pharmacist/dashboard');
                  } else {
                    navigate('/inventory-dashboard');
                  }
                }}
              >
                <i className="fas fa-arrow-left"></i>
                Back to Dashboard
              </button>
              <h1>All Activities</h1>
              <p className="activities-subtitle">Complete inventory activity history</p>
            </div>
          </div>

          {/* Filters */}
          <div className="activities-filters">
            <div className="filter-group">
              <label>Activity Type:</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="add">Added Items</option>
                <option value="update">Updated Items</option>
                <option value="alert">Low Stock Alerts</option>
                <option value="expired">Expired Items</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Category:</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                <option value="medicine">Medicines</option>
                <option value="lab">Lab Items</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Search:</label>
              <input
                type="text"
                placeholder="Search by item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="results-count">
              Showing {filteredActivities.length} of {activities.length} activities
            </div>
          </div>

          {/* Activities List */}
          <div className="activities-list">
            {filteredActivities.length === 0 ? (
              <div className="no-activities">
                <i className="fas fa-inbox"></i>
                <h3>No activities found</h3>
                <p>Try adjusting your filters or search terms</p>
              </div>
            ) : (
              filteredActivities.map((activity, index) => (
                <div 
                  key={`${activity.type}-${activity.id}-${index}`}
                  className={`activity-card ${getActivityColor(activity)}`}
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="activity-icon-wrapper">
                    <div className={`activity-icon ${getActivityColor(activity)}`}>
                      <i className={getActivityIcon(activity.type)}></i>
                    </div>
                  </div>
                  
                  <div className="activity-content">
                    <div className="activity-main">
                      <div className="activity-title">
                        <span className="activity-action">{getActivityText(activity)}</span>
                        <span className="activity-item-name">{activity.item}</span>
                      </div>
                      
                      <div className="activity-meta">
                        <span className={`activity-category ${activity.category}`}>
                          {activity.category === 'medicine' ? '💊 Medicine' : '🧪 Lab Item'}
                        </span>
                        {activity.quantity && (
                          <span className="activity-quantity">
                            Qty: {activity.quantity}
                          </span>
                        )}
                      </div>

                      {activity.details && (
                        <div className="activity-details">
                          {activity.details.manufacturer && (
                            <span>Manufacturer: {activity.details.manufacturer}</span>
                          )}
                          {activity.details.batchNumber && (
                            <span>Batch: {activity.details.batchNumber}</span>
                          )}
                          {activity.details.location && (
                            <span>Location: {activity.details.location}</span>
                          )}
                          {activity.details.unit && (
                            <span>Unit: {activity.details.unit}</span>
                          )}
                          {activity.details.expiryDate && (
                            <span>Expires: {new Date(activity.details.expiryDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="activity-time">
                      {formatTime(activity.time)}
                    </div>
                  </div>

                  <div className="activity-action-btn">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              ))
            )}
          </div>
    </div>
  );
};

export default AllActivities;