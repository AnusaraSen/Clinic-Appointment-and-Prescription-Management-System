import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import chemicalApi from "../../../../../api/chemicalApi";
import "../../../../../styles/labInventory/LabItemList.css";

const LOW_STOCK_THRESHOLD = 20;

const ChemicalList = () => {
  const [chemicals, setChemicals] = useState([]);
  const [duplicateReorderLevels, setDuplicateReorderLevels] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ lowStock: false, expired: false });
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchChemicals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (filters.lowStock) params.lowStock = 1;
      if (filters.expired) params.expired = 1;

      const res = await chemicalApi.get("/", { params });
      let chemicalData = res.data.data || [];

      // Ensure reorderLevel exists with sensible defaults
      let defaultReorder = 10;
      chemicalData = chemicalData.map((chemical, idx) => {
        const updated = { ...chemical };
        if (
          updated.reorderLevel === undefined ||
          updated.reorderLevel === null ||
          isNaN(updated.reorderLevel)
        ) {
          updated.reorderLevel = defaultReorder + idx;
        }
        return updated;
      });

      // Fallback client-side filtering
      if (filters.lowStock || filters.expired) {
        chemicalData = chemicalData.filter((chemical) => {
          const isExpired = chemical.expiryDate && new Date(chemical.expiryDate) < new Date();
          const isLowStock = (chemical.quantity || 0) <= chemical.reorderLevel;
          if (filters.lowStock && filters.expired) return isLowStock || isExpired;
          if (filters.lowStock) return isLowStock;
          if (filters.expired) return isExpired;
          return true;
        });
      }

      // Duplicate reorder levels
      const reorderLevels = chemicalData
        .map((c) => c.reorderLevel)
        .filter((v) => v !== undefined);
      const duplicates = reorderLevels.filter(
        (v, i, arr) => arr.indexOf(v) !== i && arr.lastIndexOf(v) === i
      );
      setDuplicateReorderLevels([...new Set(duplicates)]);

      setChemicals(chemicalData);
    } catch (e) {
      console.error("Error fetching chemicals:", e);
      setError(e.message || "Failed to load chemicals");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchSummary = useCallback(async () => {
    try {
      setLoadingSummary(true);
      const res = await chemicalApi.get("/summary/basic");
      setSummary(res.data.data);
    } catch (error) {
      console.error("Error fetching chemical summary:", error);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    fetchChemicals();
  }, [fetchChemicals]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters((p) => ({ ...p, [name]: checked }));
  };

  const resetFilters = () => setFilters({ lowStock: false, expired: false });

  const handleDeleteChemical = async (id, name) => {
    const ok = window.confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`
    );
    if (!ok) return;
    try {
      await chemicalApi.delete(`/${id}`);
      setChemicals((prev) => prev.filter((c) => c._id !== id));
      fetchSummary();
    } catch (e) {
      console.error("Delete chemical failed:", e);
      alert(
        e?.response?.data?.message || e.message || "Failed to delete chemical"
      );
    }
  };

  const getChemicalStatus = (chemical) => {
    const now = new Date();
    const isExpired = chemical.expiryDate
      ? new Date(chemical.expiryDate) < now
      : false;
    const isLowStock = (chemical.quantity || 0) <= chemical.reorderLevel;
    if (isExpired) return { label: "EXPIRED", variant: "expired" };
    if (isLowStock) return { label: "LOW", variant: "low" };
    return { label: "OK", variant: "ok" };
  };

  const filtersBar = {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  };

  const checkLabel = {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "14px",
    cursor: "pointer",
  };

  if (loading) {
    return (
      <div className="lab-item-details-page">
        <div className="lab-item-loading">Loading chemicals...</div>
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
            }}>Chemical Inventory Items</h3>
            <Link 
              to="/chemical-inventory/add" 
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
              + Add Chemical
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
                placeholder="Search chemicals by name or category..."
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

          <div
            style={{
              backgroundColor: "#f8fafc",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Filter Options:
              </h4>
              <label
                style={{
                  ...checkLabel,
                  backgroundColor: "#ffffff",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                }}
              >
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
              <label
                style={{
                  ...checkLabel,
                  backgroundColor: "#ffffff",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                }}
              >
                <input
                  type="checkbox"
                  name="expired"
                  checked={filters.expired}
                  onChange={handleFilterChange}
                  style={{ 
                    width: '16px',
                    height: '16px',
                    margin: '0',
                    marginRight: '8px',
                    cursor: 'pointer'
                  }}
                />
                Expired
              </label>
              <button
                onClick={resetFilters}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  marginLeft: "12px",
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
                  Expired
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#991b1b',
                  lineHeight: 1
                }}>
                  {summary.expired || 0}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="lab-item-error" style={{ marginBottom: "20px" }}>
              {error}
            </div>
          )}

          {duplicateReorderLevels.length > 0 && (
            <div
              className="lab-item-warning"
              style={{
                marginBottom: "20px",
                padding: "12px",
                backgroundColor: "#fef3c7",
                border: "1px solid #f59e0b",
                borderRadius: "6px",
                color: "#92400e",
              }}
            >
              ⚠️ Warning: Duplicate reorder levels found: {duplicateReorderLevels.join(", ")}. Each
              chemical should have a unique reorder level for proper inventory management.
            </div>
          )}

          {chemicals.filter((chemical) => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
              chemical.itemName?.toLowerCase().includes(search) ||
              chemical.hazardClass?.toLowerCase().includes(search) ||
              chemical.location?.toLowerCase().includes(search)
            );
          }).length === 0 ? (
            <div className="lab-item-empty">
              {searchTerm ? (
                <div>
                  No chemicals found matching "{searchTerm}". Try a different search term.
                </div>
              ) : (
                <div>
                  No chemicals found. {(filters.lowStock || filters.expired) &&
                    "Try adjusting your filters."}
                </div>
              )}
            </div>
          ) : chemicals.length === 0 ? (
            <div className="lab-item-empty">
              No chemicals found. {(filters.lowStock || filters.expired) &&
                "Try adjusting your filters."}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="lab-item-table">
                <thead>
                  <tr>
                    <th>Chemical Name</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Location</th>
                    <th>Concentration</th>
                    <th>pH Level</th>
                    <th>Hazard Class</th>
                    <th>Storage Temp</th>
                    <th>Expiry Date</th>
                    <th>Reorder Level</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {chemicals
                    .filter((chemical) => {
                      if (!searchTerm) return true;
                      const search = searchTerm.toLowerCase();
                      return (
                        chemical.itemName?.toLowerCase().includes(search) ||
                        chemical.hazardClass?.toLowerCase().includes(search) ||
                        chemical.location?.toLowerCase().includes(search)
                      );
                    })
                    .map((chemical) => {
                    const status = getChemicalStatus(chemical);
                    const isExpired = status.variant === "expired";
                    const isLowStock = status.variant === "low";
                    const canOrder = isExpired || isLowStock;

                    return (
                      <tr key={chemical._id}>
                        <td style={{ fontWeight: "500" }}>{chemical.itemName}</td>
                        <td>{chemical.quantity}</td>
                        <td>{chemical.unit}</td>
                        <td>{chemical.location || "N/A"}</td>
                        <td>{chemical.concentration || "N/A"}</td>
                        <td>{chemical.phLevel || "N/A"}</td>
                        <td>{chemical.hazardClass || "N/A"}</td>
                        <td>{chemical.storageTemp || "N/A"}</td>
                        <td>
                          {chemical.expiryDate
                            ? new Date(chemical.expiryDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>
                          <span
                            style={{
                              backgroundColor: duplicateReorderLevels.includes(
                                chemical.reorderLevel
                              )
                                ? "#fee2e2"
                                : "#f3f4f6",
                              color: duplicateReorderLevels.includes(
                                chemical.reorderLevel
                              )
                                ? "#dc2626"
                                : "#374151",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "12px",
                            }}
                          >
                            {chemical.reorderLevel}
                          </span>
                        </td>
                        <td>
                          <span className={`lab-status-badge ${status.variant}`}>
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <div
                            className="lab-item-actions"
                            style={{ 
                              display: "flex", 
                              gap: "4px", 
                              justifyContent: "center", 
                              alignItems: "center",
                              flexWrap: "nowrap",
                              minWidth: "180px"
                            }}
                          >
                            <button
                              className="lab-item-btn"
                              disabled={!canOrder}
                              onClick={() => navigate("/orders")}
                              style={{
                                fontSize: "0.65rem", 
                                padding: "6px 10px",
                                borderRadius: "4px",
                                backgroundColor: canOrder ? "#10b981" : "#9ca3af",
                                color: canOrder ? "white" : "#d1d5db",
                                border: "none",
                                cursor: canOrder ? "pointer" : "not-allowed",
                                minWidth: "55px",
                                textAlign: "center",
                                fontWeight: "600",
                                whiteSpace: "nowrap",
                                opacity: canOrder ? 1 : 0.6
                              }}
                              title={!canOrder ? "Can only order low stock or expired items" : "Order chemical"}
                            >
                              ORDER
                            </button>
                            <Link
                              to={`/chemical-inventory/edit/${chemical._id}`}
                              className="lab-item-btn"
                              style={{ 
                                fontSize: "0.65rem", 
                                padding: "6px 10px",
                                textDecoration: "none",
                                borderRadius: "4px",
                                backgroundColor: "#3b82f6",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                minWidth: "55px",
                                textAlign: "center",
                                fontWeight: "600",
                                whiteSpace: "nowrap"
                              }}
                            >
                              UPDATE
                            </Link>
                            <button
                              className="lab-item-btn"
                              onClick={() =>
                                handleDeleteChemical(
                                  chemical._id,
                                  chemical.itemName
                                )
                              }
                              style={{ 
                                fontSize: "0.65rem", 
                                padding: "6px 10px",
                                borderRadius: "4px",
                                backgroundColor: "#ef4444",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                minWidth: "55px",
                                textAlign: "center",
                                fontWeight: "600",
                                whiteSpace: "nowrap"
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

export default ChemicalList;