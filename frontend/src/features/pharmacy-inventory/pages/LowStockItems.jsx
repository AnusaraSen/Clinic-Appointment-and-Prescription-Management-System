import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import orderApi from '../../../api/orderApi';
import '../../../styles/Medicine/LowStockItems.css';

const LowStockItems = () => {
  const navigate = useNavigate();
  // items: { low: Array<Item>, expired: Array<Item> }
  const [items, setItems] = useState({ low: [], expired: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lowStock');
  // filterCategory: all | medicine | chemical | equipment
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchLowStockData();
  }, []);

  const fetchLowStockData = async () => {
    try {
      setLoading(true);
      const res = await orderApi.lowStock();
      const data = res?.data?.data || [];

      // Normalize into our UI shape
      const normalizeCategory = (c) => {
        if (!c) return 'other';
        const map = { Medicine: 'medicine', Chemical: 'chemical', Equipment: 'equipment' };
        return map[c] || 'other';
      };

      const normalized = data.map((it, idx) => ({
        id: `${it.name}|${it.category}|${idx}`,
        name: it.name,
        category: normalizeCategory(it.category), // medicine | chemical | equipment
        rawCategory: it.category, // original label from server
        quantity: Number(it.quantity || 0),
        threshold: Number(it.threshold || 0),
        reason: it.reason, // 'Low Stock' | 'Expired'
      }));

      setItems({
        low: normalized.filter((it) => it.reason === 'Low Stock'),
        expired: normalized.filter((it) => it.reason === 'Expired'),
      });
    } catch (error) {
      console.error('Error fetching low stock data:', error);
      setItems({ low: [], expired: [] });
    } finally {
      setLoading(false);
    }
  };

  // Determine stock severity relative to threshold when available
  const getStockLevel = (quantity, threshold) => {
    if (threshold > 0) {
      if (quantity <= Math.max(1, Math.floor(threshold / 2))) return 'critical';
      if (quantity < threshold) return 'warning';
      return 'normal';
    }
    // Fallback heuristic when threshold unknown
    if (quantity <= 5) return 'critical';
    if (quantity <= 10) return 'warning';
    return 'normal';
  };

  const getStockLevelColor = (quantity, threshold) => {
    const level = getStockLevel(quantity, threshold);
    if (level === 'critical') return '#ef4444';
    if (level === 'warning') return '#f59e0b';
    return '#10b981';
  };

  // Navigate to create order with optional prefill
  const goToCreateOrder = (prefillItems) => navigate('/orders/new', { state: { prefillItems } });

  const renderStockCard = (item) => {
    const isExpired = item.reason === 'Expired';
    const stockLevel = getStockLevel(item.quantity || 0, item.threshold || 0);
    const category = item.category; // normalized
    
    return (
      <div key={item._id} className={`stock-card ${stockLevel} ${isExpired ? 'expired' : ''}`}>
        <div className="stock-card-header">
          <div className="item-icon">
            <i className={
              category === 'medicine'
                ? 'fas fa-pills'
                : category === 'chemical'
                ? 'fas fa-flask'
                : category === 'equipment'
                ? 'fas fa-tools'
                : 'fas fa-box'
            }></i>
          </div>
          <div className="item-info">
            <h3 className="item-name">{item.name}</h3>
            <div className="item-meta">
              <span className={`category-badge ${category}`}>
                {category === 'medicine' ? '💊 Medicine' : category === 'chemical' ? '🧪 Chemical' : category === 'equipment' ? '🔧 Equipment' : 'Inventory'}
              </span>
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
                  backgroundColor: getStockLevelColor(item.quantity || 0, item.threshold || 0)
                }}
              ></div>
            </div>
            <div className={`stock-status ${stockLevel}`}>
              {stockLevel === 'critical' ? 'Critical Stock' : 'Low Stock'}
            </div>
          </div>
          <div className="threshold-info">
            <span className="threshold-label">Reorder Level:</span>
            <span className="threshold-value">{item.threshold || '—'}</span>
            {isExpired && <span className="expired-badge" style={{ marginLeft: 8 }}>EXPIRED</span>}
          </div>
        </div>
        <div className="stock-actions">
          <button className="action-btn update" onClick={() => goToCreateOrder([{ name: item.name, category: item.category }])}>
            <i className="fas fa-shopping-cart"></i>
            Create Order
          </button>
        </div>
      </div>
    );
  };

  const getFilteredItems = () => {
    const src = activeTab === 'lowStock' ? itemsState.low : itemsState.expired;
    let out = src;
    if (filterCategory !== 'all') {
      out = out.filter((it) => it.category === filterCategory);
    }
    // Sort by quantity ascending for low stock; for expired keep as-is
    if (activeTab === 'lowStock') {
      out = [...out].sort((a, b) => (a.quantity || 0) - (b.quantity || 0));
    }
    return out;
  };

  // Memoize items for filtering and summary
  const itemsState = useMemo(() => items, [items]);

  // Compute derived counts with hooks BEFORE any early returns to keep hook order stable
  const criticalCount = useMemo(() => {
    return itemsState.low.filter((it) => getStockLevel(it.quantity, it.threshold) === 'critical').length;
  }, [itemsState.low]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading stock data...</p>
        </div>
      </div>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <div className="low-stock-container">
          {/* Header */}
          <div className="low-stock-header">
            <div className="header-left">
              <button className="back-btn" onClick={() => navigate('/inventory-dashboard')}>
                <i className="fas fa-arrow-left"></i>
                Back to Dashboard
              </button>
              <h1>Stock Management</h1>
              <p className="header-subtitle">Monitor and manage low stock and expired items</p>
            </div>
            <div className="header-right">
              <button className="action-btn update" onClick={() => goToCreateOrder([])}>
                <i className="fas fa-shopping-cart"></i>
                Create Order
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="summary-stats">
            <div className="stat-item critical">
              <div className="stat-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{criticalCount}</div>
                <div className="stat-label">Critical Stock</div>
              </div>
            </div>

            <div className="stat-item warning">
              <div className="stat-icon">
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{itemsState.low.length}</div>
                <div className="stat-label">Low Stock Items</div>
              </div>
            </div>

            <div className="stat-item expired">
              <div className="stat-icon">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{itemsState.expired.length}</div>
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
                <span className="tab-count">{itemsState.low.length}</span>
              </button>
              <button 
                className={`tab ${activeTab === 'expired' ? 'active' : ''}`}
                onClick={() => setActiveTab('expired')}
              >
                <i className="fas fa-times-circle"></i>
                Expired Items
                <span className="tab-count">{itemsState.expired.length}</span>
              </button>
            </div>

            <div className="filters">
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="category-filter"
              >
                <option value="all">All Categories</option>
                <option value="medicine">Medicines</option>
                <option value="chemical">Chemicals</option>
                <option value="equipment">Equipment</option>
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
                {filteredItems.map((item) => renderStockCard(item))}
              </div>
            )}
          </div>
    </div>
  );
};

export default LowStockItems;