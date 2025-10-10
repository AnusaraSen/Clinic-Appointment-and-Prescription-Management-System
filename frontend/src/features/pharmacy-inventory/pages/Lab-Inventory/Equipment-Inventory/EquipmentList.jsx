import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
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
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>Equipment Inventory Items</h3>
                <Link 
                  to="/equipment-inventory/add" 
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textDecoration: 'none',
                    display: 'inline-block',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  + Add Equipment
                </Link>
              </div>
            </div>

            <div className="lab-item-body" style={{ paddingTop: 20 }}>
              {/* Search Bar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                  <Search style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    color: '#9ca3af'
                  }} />
                  <input
                    type="text"
                    placeholder="Search equipment by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#374151',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>

              <div style={{
                backgroundColor: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Filter Options:
                  </h4>
                  <label style={{
                    ...checkLabel,
                    backgroundColor: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db'
                  }}>
                    <input
                      type="checkbox"
                      name="lowStock"
                      checked={filters.lowStock}
                      onChange={handleFilterChange}
                      style={{ 
                        width: '16px',
                        height: '16px',
                        margin: '0',
                        marginRight: '8px',
                        cursor: 'pointer'
                      }}
                    />
                    Low Stock
                  </label>
                  <label style={{
                    ...checkLabel,
                    backgroundColor: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db'
                  }}>
                    <input
                      type="checkbox"
                      name="needsMaintenance"
                      checked={filters.needsMaintenance}
                      onChange={handleFilterChange}
                      style={{ 
                        width: '16px',
                        height: '16px',
                        margin: '0',
                        marginRight: '8px',
                        cursor: 'pointer'
                      }}
                    />
                    Needs Maintenance
                  </label>
                  <label style={{
                    ...checkLabel,
                    backgroundColor: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db'
                  }}>
                    <input
                      type="checkbox"
                      name="outOfService"
                      checked={filters.outOfService}
                      onChange={handleFilterChange}
                      style={{ 
                        width: '16px',
                        height: '16px',
                        margin: '0',
                        marginRight: '8px',
                        cursor: 'pointer'
                      }}
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
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      marginLeft: '12px'
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              {!loadingSummary && summary && (
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    backgroundColor: '#dbeafe',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    minWidth: '70px'
                  }}>
                    <div style={{ 
                      fontSize: '10px', 
                      fontWeight: '600', 
                      color: '#1e40af',
                      marginBottom: '2px',
                      opacity: 0.8
                    }}>
                      Total
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#1e3a8a',
                      lineHeight: 1
                    }}>
                      {summary.total || 0}
                    </div>
                  </div>
                  
                  <div style={{
                    backgroundColor: '#fef3c7',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    minWidth: '70px'
                  }}>
                    <div style={{ 
                      fontSize: '10px', 
                      fontWeight: '600', 
                      color: '#92400e',
                      marginBottom: '2px',
                      opacity: 0.8
                    }}>
                      Low Stock
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#92400e',
                      lineHeight: 1
                    }}>
                      {summary.lowStock || 0}
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#fecaca',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    minWidth: '70px'
                  }}>
                    <div style={{ 
                      fontSize: '10px', 
                      fontWeight: '600', 
                      color: '#991b1b',
                      marginBottom: '2px',
                      opacity: 0.8
                    }}>
                      Out of Service
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#991b1b',
                      lineHeight: 1
                    }}>
                      {summary.outOfService || 0}
                    </div>
                  </div>
                </div>
              )}

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

              {equipment.filter((item) => {
                if (!searchTerm) return true;
                const search = searchTerm.toLowerCase();
                return (
                  item.itemName?.toLowerCase().includes(search) ||
                  item.manufacturer?.toLowerCase().includes(search) ||
                  item.modelNumber?.toLowerCase().includes(search) ||
                  item.location?.toLowerCase().includes(search)
                );
              }).length === 0 ? (
                <div className="lab-item-empty">
                  {searchTerm ? (
                    <div>
                      No equipment found matching "{searchTerm}". Try a different search term.
                    </div>
                  ) : (
                    <div>
                      No equipment found. {(filters.lowStock || filters.needsMaintenance || filters.outOfService) && "Try adjusting your filters."}
                    </div>
                  )}
                </div>
              ) : equipment.length === 0 ? (
                <div className="lab-item-empty">
                  No equipment found. {(filters.lowStock || filters.needsMaintenance || filters.outOfService) && "Try adjusting your filters."}
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
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
                      {equipment
                        .filter((item) => {
                          if (!searchTerm) return true;
                          const search = searchTerm.toLowerCase();
                          return (
                            item.itemName?.toLowerCase().includes(search) ||
                            item.manufacturer?.toLowerCase().includes(search) ||
                            item.modelNumber?.toLowerCase().includes(search) ||
                            item.location?.toLowerCase().includes(search)
                          );
                        })
                        .map((item) => {
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
                              <div className="lab-item-actions" style={{ 
                                display: 'flex', 
                                gap: '4px', 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                flexWrap: 'nowrap',
                                minWidth: '180px'
                              }}>
                                <button
                                  className="lab-item-btn"
                                  disabled={!isLowStock}
                                  onClick={() => navigate('/orders')}
                                  style={{
                                    fontSize: '0.65rem', 
                                    padding: '6px 10px',
                                    borderRadius: '4px',
                                    backgroundColor: isLowStock ? '#10b981' : '#9ca3af',
                                    color: isLowStock ? 'white' : '#d1d5db',
                                    border: 'none',
                                    cursor: isLowStock ? 'pointer' : 'not-allowed',
                                    minWidth: '55px',
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    opacity: isLowStock ? 1 : 0.6
                                  }}
                                  title={!isLowStock ? 'Can only order low stock items' : 'Order equipment'}
                                >
                                  ORDER
                                </button>
                                <Link
                                  to={`/equipment-inventory/edit/${item._id}`}
                                  className="lab-item-btn"
                                  style={{ 
                                    fontSize: '0.65rem', 
                                    padding: '6px 10px',
                                    textDecoration: 'none',
                                    borderRadius: '4px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    minWidth: '55px',
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  UPDATE
                                </Link>
                                <button
                                  className="lab-item-btn"
                                  onClick={() => handleDeleteEquipment(item._id, item.itemName)}
                                  style={{ 
                                    fontSize: '0.65rem', 
                                    padding: '6px 10px',
                                    borderRadius: '4px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    minWidth: '55px',
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  DELETE
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