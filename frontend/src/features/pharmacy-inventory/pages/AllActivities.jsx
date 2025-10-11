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
      
      // Fetch chemicals data
      const chemicalsRes = await axios.get('http://localhost:5000/api/chemical-inventory');
      const chemicals = chemicalsRes.data.data || [];
      
      // Fetch equipment data
      const equipmentRes = await axios.get('http://localhost:5000/api/equipment-inventory');
      const equipment = equipmentRes.data.data || [];
      
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

      // Add all chemical additions
      chemicals.forEach((chemical) => {
        allActivities.push({
          type: 'add',
          item: chemical.itemName,
          time: chemical.createdAt ? 
            new Date(chemical.createdAt) : 
            new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          quantity: chemical.quantity,
          category: 'chemical',
          id: chemical._id,
          details: {
            unit: chemical.unit,
            location: chemical.location,
            expiryDate: chemical.expiryDate,
            hazardClass: chemical.hazardClass
          }
        });
      });

      // Add all equipment additions
      equipment.forEach((equip) => {
        allActivities.push({
          type: 'add',
          item: equip.itemName,
          time: equip.createdAt ? 
            new Date(equip.createdAt) : 
            new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          quantity: equip.quantity,
          category: 'equipment',
          id: equip._id,
          details: {
            unit: equip.unit,
            location: equip.location,
            manufacturer: equip.manufacturer,
            modelNumber: equip.modelNumber,
            condition: equip.condition
          }
        });
      });

      // Add updates for medicines
      medicines.forEach((medicine) => {
        if (medicine.updatedAt && medicine.updatedAt !== medicine.createdAt) {
          allActivities.push({
            type: 'update',
            item: `${medicine.medicineName} ${medicine.strength || ''}`.trim(),
            time: new Date(medicine.updatedAt),
            quantity: medicine.quantity,
            category: 'medicine',
            id: medicine._id,
            details: {
              manufacturer: medicine.manufacturer,
              expiryDate: medicine.expiryDate,
              batchNumber: medicine.batchNumber
            }
          });
        }
      });

      // Add updates for chemicals
      chemicals.forEach((chemical) => {
        if (chemical.updatedAt && chemical.updatedAt !== chemical.createdAt) {
          allActivities.push({
            type: 'update',
            item: chemical.itemName,
            time: new Date(chemical.updatedAt),
            quantity: chemical.quantity,
            category: 'chemical',
            id: chemical._id,
            details: {
              unit: chemical.unit,
              location: chemical.location,
              expiryDate: chemical.expiryDate,
              hazardClass: chemical.hazardClass
            }
          });
        }
      });

      // Add updates for equipment
      equipment.forEach((equip) => {
        if (equip.updatedAt && equip.updatedAt !== equip.createdAt) {
          allActivities.push({
            type: 'update',
            item: equip.itemName,
            time: new Date(equip.updatedAt),
            quantity: equip.quantity,
            category: 'equipment',
            id: equip._id,
            details: {
              unit: equip.unit,
              location: equip.location,
              manufacturer: equip.manufacturer,
              modelNumber: equip.modelNumber,
              condition: equip.condition
            }
          });
        }
      });

      // Add low stock alerts for medicines
      medicines.forEach((medicine) => {
        if ((medicine.quantity || 0) <= 10) {
          allActivities.push({
            type: 'alert',
            item: `${medicine.medicineName} ${medicine.strength || ''}`.trim(),
            time: new Date(),
            quantity: medicine.quantity,
            category: 'medicine',
            id: medicine._id,
            alertLevel: (medicine.quantity || 0) <= 5 ? 'critical' : 'warning',
            details: {
              manufacturer: medicine.manufacturer,
              expiryDate: medicine.expiryDate,
              batchNumber: medicine.batchNumber
            }
          });
        }
      });

      // Add low stock alerts for chemicals
      chemicals.forEach((chemical) => {
        if ((chemical.quantity || 0) <= 10) {
          allActivities.push({
            type: 'alert',
            item: chemical.itemName,
            time: new Date(),
            quantity: chemical.quantity,
            category: 'chemical',
            id: chemical._id,
            alertLevel: (chemical.quantity || 0) <= 5 ? 'critical' : 'warning',
            details: {
              unit: chemical.unit,
              location: chemical.location,
              expiryDate: chemical.expiryDate,
              hazardClass: chemical.hazardClass
            }
          });
        }
      });

      // Add low stock alerts for equipment
      equipment.forEach((equip) => {
        if ((equip.quantity || 0) <= 10) {
          allActivities.push({
            type: 'alert',
            item: equip.itemName,
            time: new Date(),
            quantity: equip.quantity,
            category: 'equipment',
            id: equip._id,
            alertLevel: (equip.quantity || 0) <= 5 ? 'critical' : 'warning',
            details: {
              unit: equip.unit,
              location: equip.location,
              manufacturer: equip.manufacturer,
              modelNumber: equip.modelNumber,
              condition: equip.condition
            }
          });
        }
      });

      // Add expired items alerts for medicines
      medicines.forEach((medicine) => {
        if (medicine.expiryDate && new Date(medicine.expiryDate) < new Date()) {
          allActivities.push({
            type: 'expired',
            item: `${medicine.medicineName} ${medicine.strength || ''}`.trim(),
            time: new Date(medicine.expiryDate),
            quantity: medicine.quantity,
            category: 'medicine',
            id: medicine._id,
            details: {
              manufacturer: medicine.manufacturer,
              expiryDate: medicine.expiryDate,
              batchNumber: medicine.batchNumber
            }
          });
        }
      });

      // Add expired items alerts for chemicals
      chemicals.forEach((chemical) => {
        if (chemical.expiryDate && new Date(chemical.expiryDate) < new Date()) {
          allActivities.push({
            type: 'expired',
            item: chemical.itemName,
            time: new Date(chemical.expiryDate),
            quantity: chemical.quantity,
            category: 'chemical',
            id: chemical._id,
            details: {
              unit: chemical.unit,
              location: chemical.location,
              expiryDate: chemical.expiryDate,
              hazardClass: chemical.hazardClass
            }
          });
        }
      });

      // Add expired items alerts for equipment (if applicable)
      equipment.forEach((equip) => {
        if (equip.expiryDate && new Date(equip.expiryDate) < new Date()) {
          allActivities.push({
            type: 'expired',
            item: equip.itemName,
            time: new Date(equip.expiryDate),
            quantity: equip.quantity,
            category: 'equipment',
            id: equip._id,
            details: {
              unit: equip.unit,
              location: equip.location,
              manufacturer: equip.manufacturer,
              modelNumber: equip.modelNumber,
              condition: equip.condition
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
    const categoryName = activity.category === 'medicine' ? 'medicine' : 
                         activity.category === 'chemical' ? 'chemical' : 
                         activity.category === 'equipment' ? 'equipment' : 'item';
    
    switch (activity.type) {
      case 'add': 
        return `Added new ${categoryName}`;
      case 'update': 
        return `Updated ${categoryName}`;
      case 'alert': 
        return `${activity.alertLevel === 'critical' ? 'Critical' : 'Low'} stock alert`;
      case 'expired': 
        return `Expired ${categoryName}`;
      default: 
        return 'Activity';
    }
  };

  const handleActivityClick = (activity) => {
    if (activity.category === 'medicine') {
      navigate(`/medicine/edit/${activity.id}`);
    } else if (activity.category === 'chemical') {
      navigate(`/chemical-inventory/edit/${activity.id}`);
    } else if (activity.category === 'equipment') {
      navigate(`/equipment-inventory/edit/${activity.id}`);
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
                <option value="medicine">Medicine</option>
                <option value="chemical">Chemical</option>
                <option value="equipment">Equipment</option>
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
                          {activity.category === 'medicine' && '💊 Medicine'}
                          {activity.category === 'chemical' && '🧪 Chemical'}
                          {activity.category === 'equipment' && '🔧 Equipment'}
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
                          {activity.details.hazardClass && (
                            <span>Hazard: {activity.details.hazardClass}</span>
                          )}
                          {activity.details.modelNumber && (
                            <span>Model: {activity.details.modelNumber}</span>
                          )}
                          {activity.details.condition && (
                            <span>Condition: {activity.details.condition}</span>
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