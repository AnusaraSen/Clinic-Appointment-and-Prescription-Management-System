import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import equipmentApi from "../../../../../api/equipmentApi";
import "../../../../../styles/labInventory/LabItemList.css";

const EquipmentList = () => {
  const [equipment, setEquipment] = useState([]);
  const [duplicateReorderLevels, setDuplicateReorderLevels] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    lowStock: false,
    needsMaintenance: false,
    outOfService: false,
  });
  const navigate = useNavigate();

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      
      // Add filter parameters for backend API
      if (filters.lowStock) params.lowStock = 1;
      if (filters.needsMaintenance) params.needsMaintenance = 1;
      if (filters.outOfService) params.outOfService = 1;
      
      console.log('Fetching equipment with filters:', filters);
      const res = await equipmentApi.get("/", { params });
      console.log('Equipment API response:', res.data);
      
      let equipmentData = res.data.data || [];

      // Assign unique default reorder levels if not present
      let defaultReorder = 5; // Lower default for equipment
      equipmentData = equipmentData.map((item, idx) => {
        let updatedItem = { ...item };
        // Assign a unique default reorderLevel if missing
        if (updatedItem.reorderLevel === undefined || updatedItem.reorderLevel === null || isNaN(updatedItem.reorderLevel)) {
          updatedItem.reorderLevel = defaultReorder + idx;
        }
        return updatedItem;
      });
      
      // Client-side filtering as backup if backend doesn't support filtering
      if (filters.lowStock || filters.needsMaintenance || filters.outOfService) {
        equipmentData = equipmentData.filter(item => {
          const isLowStock = item.quantity <= item.reorderLevel;
          const needsMaintenanceCheck = item.nextMaintenanceDate && new Date(item.nextMaintenanceDate) <= new Date();
          const isOutOfService = item.condition === 'Out of Service' || item.condition === 'Needs Repair';
          
          if (filters.lowStock && filters.needsMaintenance && filters.outOfService) {
            return isLowStock || needsMaintenanceCheck || isOutOfService;
          } else if (filters.lowStock && filters.needsMaintenance) {
            return isLowStock || needsMaintenanceCheck;
          } else if (filters.lowStock && filters.outOfService) {
            return isLowStock || isOutOfService;
          } else if (filters.needsMaintenance && filters.outOfService) {
            return needsMaintenanceCheck || isOutOfService;
          } else if (filters.lowStock) {
            return isLowStock;
          } else if (filters.needsMaintenance) {
            return needsMaintenanceCheck;
          } else if (filters.outOfService) {
            return isOutOfService;
          }
          return true;
        });
      }

      // Check for duplicate reorder levels
      const reorderLevels = equipmentData.map(item => item.reorderLevel).filter(v => v !== undefined);
      const duplicates = reorderLevels.filter((v, i, arr) => arr.indexOf(v) !== i && arr.lastIndexOf(v) === i);
      setDuplicateReorderLevels([...new Set(duplicates)]);
      
      setEquipment(equipmentData);
    } catch (e) {
      console.error('Error fetching equipment:', e);
      setError(e.message || "Failed to load equipment");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchSummary = useCallback(async () => {
    try {
      setLoadingSummary(true);
      const res = await equipmentApi.get("/summary/basic");
      console.log('Equipment summary API response:', res.data);
      setSummary(res.data.data);
    } catch (error) {
      console.error('Error fetching equipment summary:', error);
      /* ignore */
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters((p) => ({ ...p, [name]: checked }));
  };

  const resetFilters = () => setFilters({ 
    lowStock: false, 
    needsMaintenance: false, 
    outOfService: false 
  });

  const handleOrderEquipment = (item) => {
    alert(`Order initiated for ${item.itemName}`);
  };

  const handleDeleteEquipment = async (id, name) => {
    const ok = window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`);
    if (!ok) return;
    try {
      await equipmentApi.delete(`/${id}`);
      setEquipment((prev) => prev.filter((e) => e._id !== id));
      fetchSummary();
    } catch (e) {
      console.error('Delete equipment failed:', e);
      alert(e?.response?.data?.message || e.message || 'Failed to delete equipment');
    }
  };

  const getEquipmentStatus = (item) => {
    const isLowStock = (item.quantity || 0) <= item.reorderLevel;
    const needsMaintenance = item.nextMaintenanceDate && new Date(item.nextMaintenanceDate) <= new Date();
    const outOfService = item.condition === 'Out of Service' || item.condition === 'Needs Repair';

    if (outOfService) return { label: 'EXPIRED', variant: 'expired' }; // reuse red styling
    if (needsMaintenance) return { label: 'LOW', variant: 'low' }; // reuse amber styling
    if (isLowStock) return { label: 'LOW', variant: 'low' };
    return { label: 'OK', variant: 'ok' };
  };

  const filtersBar = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap'
  };

  const checkLabel = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
    cursor: 'pointer'
  };

  if (loading) {
    return (
      <div className="lab-item-details-page">
        <div className="lab-item-loading">Loading equipment...</div>
      </div>
    );
  }

  return (
    <div className="lab-item-details-page">
      <div className="lab-item-card">
            <div className="lab-item-header">
              <h2 className="lab-item-title">Equipment Inventory</h2>
              <div className="lab-item-actions">
                <Link to="/equipment-inventory/add" className="lab-item-btn primary">
                  + Add Equipment
                </Link>
              </div>
            </div>

            <div className="lab-item-body" style={{ paddingTop: 20 }}>
              <div style={{
                ...filtersBar,
                backgroundColor: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  marginBottom: '12px'
                }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Filter Options:
                  </h4>
                  <label style={{
                    ...checkLabel,
                    backgroundColor: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db'
                  }}>
                    <input
                      type="checkbox"
                      name="lowStock"
                      checked={filters.lowStock}
                      onChange={handleFilterChange}
                      style={{ marginRight: '6px' }}
                    />
                    Low Stock
                  </label>
                  <label style={{
                    ...checkLabel,
                    backgroundColor: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db'
                  }}>
                    <input
                      type="checkbox"
                      name="needsMaintenance"
                      checked={filters.needsMaintenance}
                      onChange={handleFilterChange}
                      style={{ marginRight: '6px' }}
                    />
                    Needs Maintenance
                  </label>
                  <label style={{
                    ...checkLabel,
                    backgroundColor: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db'
                  }}>
                    <input
                      type="checkbox"
                      name="outOfService"
                      checked={filters.outOfService}
                      onChange={handleFilterChange}
                      style={{ marginRight: '6px' }}
                    />
                    Out of Service
                  </label>
                  <button
                    onClick={resetFilters}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Reset Filters
                  </button>
                </div>

                {!loadingSummary && summary && (
                  <div style={{
                    display: 'flex',
                    gap: '20px',
                    fontSize: '13px',
                    color: '#6b7280'
                  }}>
                    <span>Total: <strong style={{ color: '#374151' }}>{summary.total}</strong></span>
                    <span>Low Stock: <strong style={{ color: '#dc2626' }}>{summary.lowStock}</strong></span>
                    <span>Needs Maintenance: <strong style={{ color: '#f59e0b' }}>{summary.needsMaintenance}</strong></span>
                    <span>Out of Service: <strong style={{ color: '#dc2626' }}>{summary.outOfService}</strong></span>
                  </div>
                )}
              </div>

              {error && (
                <div className="lab-item-error" style={{ marginBottom: '20px' }}>
                  {error}
                </div>
              )}

              {duplicateReorderLevels.length > 0 && (
                <div className="lab-item-warning" style={{ 
                  marginBottom: '20px',
                  padding: '12px',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '6px',
                  color: '#92400e'
                }}>
                  ⚠️ Warning: Duplicate reorder levels found: {duplicateReorderLevels.join(', ')}. 
                  Each equipment should have a unique reorder level for proper inventory management.
                </div>
              )}

              {equipment.length === 0 ? (
                <div className="lab-item-empty">
                  No equipment found. {(filters.lowStock || filters.needsMaintenance || filters.outOfService) && "Try adjusting your filters."}
                </div>
              ) : (
                <div className="lab-item-table-wrapper">
                  <table className="lab-item-table">
                    <thead>
                      <tr>
                        <th>Equipment Name</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Location</th>
                        <th>Model Number</th>
                        <th>Manufacturer</th>
                        <th>Condition</th>
                        <th>Calibration Date</th>
                        <th>Maintenance Schedule</th>
                        <th>Reorder Level</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipment.map((item) => {
                        const status = getEquipmentStatus(item);
                        const needsMaintenance = item.nextMaintenanceDate && new Date(item.nextMaintenanceDate) <= new Date();
                        const isLowStock = (item.quantity || 0) <= item.reorderLevel;
                        
                        return (
                          <tr key={item._id}>
                            <td style={{ fontWeight: '500' }}>{item.itemName}</td>
                            <td>{item.quantity}</td>
                            <td>{item.unit}</td>
                            <td>{item.location || 'N/A'}</td>
                            <td>{item.modelNumber || 'N/A'}</td>
                            <td>{item.manufacturer || 'N/A'}</td>
                            <td>
                              <span className={`condition-badge condition-${item.condition?.toLowerCase().replace(/\s/g, '-')}`}>
                                {item.condition || 'Good'}
                              </span>
                            </td>
                            <td>
                              {item.calibrationDate ? new Date(item.calibrationDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td>{item.maintenanceSchedule || 'N/A'}</td>
                            <td>
                              <span style={{
                                backgroundColor: duplicateReorderLevels.includes(item.reorderLevel) ? '#fee2e2' : '#f3f4f6',
                                color: duplicateReorderLevels.includes(item.reorderLevel) ? '#dc2626' : '#374151',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '12px'
                              }}>
                                {item.reorderLevel}
                              </span>
                            </td>
                            <td>
                              <span className={`lab-status-badge ${status.variant}`}>
                                {status.label}
                              </span>
                            </td>
                            <td>
                              <div className="lab-item-actions" style={{ display: 'flex', gap: '8px' }}>
                                <Link
                                  to={`/equipment-inventory/edit/${item._id}`}
                                  className="lab-item-btn secondary small"
                                >
                                  Update
                                </Link>
                                <button
                                  className="lab-item-btn primary small"
                                  disabled={!isLowStock}
                                  onClick={() => navigate('/orders')}
                                  style={!isLowStock ? { backgroundColor: '#e5e7eb', color: '#6b7280', cursor: 'not-allowed' } : undefined}
                                >
                                  Order
                                </button>
                                <button
                                  className="lab-item-btn danger small"
                                  onClick={() => handleDeleteEquipment(item._id, item.itemName)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
      </div>
    </div>
  );
};

export default EquipmentList;