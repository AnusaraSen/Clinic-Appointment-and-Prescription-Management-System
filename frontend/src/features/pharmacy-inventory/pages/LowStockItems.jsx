import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sidebar } from '../../../shared/components/layout/Sidebar';
import '../../../styles/Medicine/LowStockItems.css';

const LowStockItems = () => {
  const navigate = useNavigate();
  const [lowStockData, setLowStockData] = useState({
    medicines: [],
    labItems: [],
    expiredMedicines: [],
    expiredLabItems: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lowStock');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchLowStockData();
  }, []);

  const fetchLowStockData = async () => {
    try {
      setLoading(true);
      
      // Fetch medicines data
      const medicinesRes = await axios.get('http://localhost:5000/api/medicines');
      const allMedicines = medicinesRes.data.data || [];
      
      // Fetch lab inventory data
      const labRes = await axios.get('http://localhost:5000/api/lab-inventory');
      const allLabItems = labRes.data.data || [];
      
      // Filter low stock items (quantity <= 10)
      const lowStockMedicines = allMedicines.filter(med => (med.quantity || 0) <= 10);
      const lowStockLabItems = allLabItems.filter(item => (item.quantity || 0) <= 10);
      
      // Filter expired items
      const expiredMedicines = allMedicines.filter(med => 
        med.expiryDate && new Date(med.expiryDate) < new Date()
      );
      const expiredLabItems = allLabItems.filter(item => 
        item.expiryDate && new Date(item.expiryDate) < new Date()
      );
      
      setLowStockData({
        medicines: lowStockMedicines,
        labItems: lowStockLabItems,
        expiredMedicines,
        expiredLabItems
      });
    } catch (error) {
      console.error('Error fetching low stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockLevel = (quantity) => {
    if (quantity <= 5) return 'critical';
    if (quantity <= 10) return 'warning';
    return 'normal';
  };

  const getStockLevelColor = (quantity) => {
    if (quantity <= 5) return '#ef4444';
    if (quantity <= 10) return '#f59e0b';
    return '#10b981';
  };

  const handleUpdateItem = (item, category) => {
    if (category === 'medicine') {
      navigate(`/medicine/edit/${item._id}`);
    } else {
      navigate(`/lab/edit/${item._id}`);
    }
  };

  const handleDeleteItem = (item, category) => {
    if (category === 'medicine') {
      navigate(`/medicine/delete/${item._id}`);
    } else {
      navigate(`/lab/delete/${item._id}`);
    }
  };

  const renderStockCard = (item, category) => {
    const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
    const stockLevel = getStockLevel(item.quantity || 0);
    
    return (
      <div key={item._id} className={`stock-card ${stockLevel} ${isExpired ? 'expired' : ''}`}>
        <div className="stock-card-header">
          <div className="item-icon">
            <i className={category === 'medicine' ? 'fas fa-pills' : 'fas fa-flask'}></i>
          </div>
          <div className="item-info">
            <h3 className="item-name">
              {category === 'medicine' ? item.medicineName : item.itemName}
              {category === 'medicine' && item.strength && ` ${item.strength}`}
            </h3>
            <div className="item-meta">
              <span className={`category-badge ${category}`}>
                {category === 'medicine' ? '💊 Medicine' : '🧪 Lab Item'}
              </span>
              {item.manufacturer && (
                <span className="manufacturer">{item.manufacturer}</span>
              )}
              {item.location && (
                <span className="location">📍 {item.location}</span>
              )}
            </div>
          </div>
        </div>

        <div className="stock-details">
          <div className="quantity-info">
            <div className="quantity-display">
              <span className="quantity-value">{item.quantity || 0}</span>
              <span className="quantity-unit">{item.unit || 'units'}</span>
            </div>
            <div className="stock-progress">
              <div 
                className="progress-bar" 
                style={{ 
                  width: `${Math.min(((item.quantity || 0) / 50) * 100, 100)}%`,
                  backgroundColor: getStockLevelColor(item.quantity || 0)
                }}
              ></div>
            </div>
            <div className={`stock-status ${stockLevel}`}>
              {stockLevel === 'critical' ? 'Critical Stock' : 'Low Stock'}
            </div>
          </div>

          {item.expiryDate && (
            <div className="expiry-info">
              <div className="expiry-label">Expiry Date:</div>
              <div className={`expiry-date ${isExpired ? 'expired' : ''}`}>
                {new Date(item.expiryDate).toLocaleDateString()}
                {isExpired && <span className="expired-badge">EXPIRED</span>}
              </div>
            </div>
          )}

          {item.batchNumber && (
            <div className="batch-info">
              <span className="batch-label">Batch:</span>
              <span className="batch-number">{item.batchNumber}</span>
            </div>
          )}
        </div>

        <div className="stock-actions">
          <button 
            className="action-btn update"
            onClick={() => handleUpdateItem(item, category)}
          >
            <i className="fas fa-edit"></i>
            Update Stock
          </button>
          {isExpired && (
            <button 
              className="action-btn delete"
              onClick={() => handleDeleteItem(item, category)}
            >
              <i className="fas fa-trash"></i>
              Remove Expired
            </button>
          )}
        </div>
      </div>
    );
  };

  const getFilteredItems = () => {
    let items = [];
    
    if (activeTab === 'lowStock') {
      if (filterCategory === 'all' || filterCategory === 'medicine') {
        items = [...items, ...lowStockData.medicines.map(item => ({ ...item, category: 'medicine' }))];
      }
      if (filterCategory === 'all' || filterCategory === 'lab') {
        items = [...items, ...lowStockData.labItems.map(item => ({ ...item, category: 'lab' }))];
      }
    } else if (activeTab === 'expired') {
      if (filterCategory === 'all' || filterCategory === 'medicine') {
        items = [...items, ...lowStockData.expiredMedicines.map(item => ({ ...item, category: 'medicine' }))];
      }
      if (filterCategory === 'all' || filterCategory === 'lab') {
        items = [...items, ...lowStockData.expiredLabItems.map(item => ({ ...item, category: 'lab' }))];
      }
    }

    // Sort by quantity (lowest first) for low stock, by expiry date for expired
    if (activeTab === 'lowStock') {
      items.sort((a, b) => (a.quantity || 0) - (b.quantity || 0));
    } else {
      items.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    }

    return items;
  };

  if (loading) {
    return (
      <div className="main-layout">
        <Sidebar />
        <div className="main-content-with-sidebar">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading stock data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content-with-sidebar">
        <div className="low-stock-container">
          {/* Header */}
          <div className="low-stock-header">
            <div className="header-left">
              <button className="back-btn" onClick={() => navigate('/dashboard')}>
                <i className="fas fa-arrow-left"></i>
                Back to Dashboard
              </button>
              <h1>Stock Management</h1>
              <p className="header-subtitle">Monitor and manage low stock and expired items</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="summary-stats">
            <div className="stat-item critical">
              <div className="stat-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {lowStockData.medicines.filter(m => (m.quantity || 0) <= 5).length + 
                   lowStockData.labItems.filter(l => (l.quantity || 0) <= 5).length}
                </div>
                <div className="stat-label">Critical Stock</div>
              </div>
            </div>

            <div className="stat-item warning">
              <div className="stat-icon">
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {lowStockData.medicines.length + lowStockData.labItems.length}
                </div>
                <div className="stat-label">Low Stock Items</div>
              </div>
            </div>

            <div className="stat-item expired">
              <div className="stat-icon">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {lowStockData.expiredMedicines.length + lowStockData.expiredLabItems.length}
                </div>
                <div className="stat-label">Expired Items</div>
              </div>
            </div>
          </div>

          {/* Tabs and Filters */}
          <div className="controls-section">
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'lowStock' ? 'active' : ''}`}
                onClick={() => setActiveTab('lowStock')}
              >
                <i className="fas fa-exclamation-triangle"></i>
                Low Stock Items
                <span className="tab-count">
                  {lowStockData.medicines.length + lowStockData.labItems.length}
                </span>
              </button>
              <button 
                className={`tab ${activeTab === 'expired' ? 'active' : ''}`}
                onClick={() => setActiveTab('expired')}
              >
                <i className="fas fa-times-circle"></i>
                Expired Items
                <span className="tab-count">
                  {lowStockData.expiredMedicines.length + lowStockData.expiredLabItems.length}
                </span>
              </button>
            </div>

            <div className="filters">
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="category-filter"
              >
                <option value="all">All Categories</option>
                <option value="medicine">Medicines Only</option>
                <option value="lab">Lab Items Only</option>
              </select>
            </div>
          </div>

          {/* Items Grid */}
          <div className="items-section">
            {filteredItems.length === 0 ? (
              <div className="no-items">
                <i className="fas fa-check-circle"></i>
                <h3>
                  {activeTab === 'lowStock' ? 'No Low Stock Items' : 'No Expired Items'}
                </h3>
                <p>
                  {activeTab === 'lowStock' 
                    ? 'All items are well stocked!' 
                    : 'No expired items found in inventory.'}
                </p>
              </div>
            ) : (
              <div className="items-grid">
                {filteredItems.map((item) => renderStockCard(item, item.category))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LowStockItems;