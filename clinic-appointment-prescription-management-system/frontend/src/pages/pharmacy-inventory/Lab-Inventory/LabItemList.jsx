import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import labApi from "../../../api/labApi";
import InventoryNavigationSidebar from "../../../components/InventoryNavigationSidebar";
import "../../../styles/labInventory/LabItemList.css";

const LOW_STOCK_THRESHOLD = 20;

const LabItemList = () => {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    lowStock: false,
    expired: false,
  });

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      
      // Add filter parameters for backend API
      if (filters.lowStock) params.lowStock = 1;
      if (filters.expired) params.expired = 1;
      
      console.log('Fetching lab items with filters:', filters);
      const res = await labApi.get("/", { params });
      console.log('Lab API response:', res.data);
      
      let itemsData = res.data.data || [];
      
      // Client-side filtering as backup if backend doesn't support filtering
      if (filters.lowStock || filters.expired) {
        itemsData = itemsData.filter(item => {
          const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
          const isLowStock = item.quantity <= LOW_STOCK_THRESHOLD;
          
          if (filters.lowStock && filters.expired) {
            return isLowStock || isExpired;
          } else if (filters.lowStock) {
            return isLowStock;
          } else if (filters.expired) {
            return isExpired;
          }
          return true;
        });
      }
      
      setItems(itemsData);
    } catch (e) {
      console.error('Error fetching lab items:', e);
      setError(e.message || "Failed to load lab items");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchSummary = useCallback(async () => {
    try {
      setLoadingSummary(true);
      const res = await labApi.get("/summary/basic");
      console.log('Lab summary API response:', res.data);
      // Handle the response format {success, data: {total, lowStock, expired}}
      setSummary(res.data.data);
    } catch (error) {
      console.error('Error fetching lab summary:', error);
      /* ignore */
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters((p) => ({ ...p, [name]: checked }));
  };

  const resetFilters = () => setFilters({ lowStock: false, expired: false });

  return (
    <div className="inventory-nav-layout">
      <InventoryNavigationSidebar />
      <div className="inventory-nav-content">
        <div className="lab-item-details-page">
      <div className="lab-item-card">
        <div className="lab-item-header">
              <h2 className="lab-item-title">Lab Inventory</h2>
              <div className="lab-item-actions">
                <Link to="/lab/add" className="lab-item-btn primary">
                  + Add Lab Item
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
                />{" "}
                Low Stock (≤ {LOW_STOCK_THRESHOLD} items)
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
                  name="expired"
                  checked={filters.expired}
                  onChange={handleFilterChange}
                />{" "}
                Expired Items
              </label>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                className="lab-item-btn"
                style={{ 
                  background: "#3b82f6",
                  color: 'white',
                  padding: '8px 16px',
                  fontSize: '14px'
                }}
                onClick={() => fetchItems()}
                disabled={loading}
              >
                {loading ? "Applying..." : "Apply Filters"}
              </button>
              <button
                type="button"
                className="lab-item-btn"
                style={{ 
                  background: "#6b7280",
                  color: 'white',
                  padding: '8px 16px',
                  fontSize: '14px'
                }}
                onClick={() => {
                  setFilters({ lowStock: false, expired: false });
                }}
                disabled={loading}
              >
                Reset Filters
              </button>
              {(filters.lowStock || filters.expired) && (
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  marginLeft: '20px'
                }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Active:</span>
                  {filters.lowStock && (
                    <span style={{
                      backgroundColor: '#fbbf24',
                      color: '#92400e',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      Low Stock
                    </span>
                  )}
                  {filters.expired && (
                    <span style={{
                      backgroundColor: '#f87171',
                      color: '#991b1b',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      Expired
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={summaryBar}>
            {loadingSummary ? (
              <span className="text-muted">Loading summary...</span>
            ) : summary ? (
              <>
                <SummaryChip 
                  label={filters.lowStock || filters.expired ? "Filtered Results" : "Total"} 
                  value={filters.lowStock || filters.expired ? items.length : summary.total} 
                />
                {!filters.lowStock && !filters.expired && (
                  <>
                    <SummaryChip label="Low Stock" value={summary.lowStock} tone="warn" />
                    <SummaryChip
                      label="Expired"
                      value={summary.expired}
                      tone="danger"
                    />
                  </>
                )}
                {(filters.lowStock || filters.expired) && (
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    marginLeft: '16px',
                    padding: '4px 8px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    <span>Showing: {items.length} items matching your filters</span>
                  </div>
                )}
              </>
            ) : null}
          </div>

            {loading && <p className="text-muted">Loading items...</p>}
            {error && <p className="text-danger">{error}</p>}

          {!loading && !error && (
            <div style={{ overflowX: "auto" }}>
              <table style={table}>
                <thead>
                  <tr style={theadRow}>
                    <Th>Name</Th>
                    <Th align="right">Quantity</Th>
                    <Th>Unit</Th>
                    <Th>Location</Th>
                    <Th>Expiry</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        style={{ padding: "1.5rem", textAlign: "center" }}
                        className="text-muted"
                      >
                        {filters.lowStock || filters.expired ? (
                          <div>
                            <div style={{ marginBottom: '8px', fontSize: '16px' }}>
                              No items match your current filters
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                              Try adjusting your filter settings or{' '}
                              <button
                                onClick={() => setFilters({ lowStock: false, expired: false })}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#3b82f6',
                                  textDecoration: 'underline',
                                  cursor: 'pointer',
                                  fontSize: '14px'
                                }}
                              >
                                clear all filters
                              </button>
                              {' '}to see all items
                            </div>
                          </div>
                        ) : (
                          "No lab items found."
                        )}
                      </td>
                    </tr>
                  )}
                  {items.map((it) => {
                    const expired =
                      it.expiryDate && new Date(it.expiryDate) < new Date();
                    const low = it.quantity <= LOW_STOCK_THRESHOLD;
                    return (
                      <tr key={it._id} style={row}>
                        <Td>{it.itemName}</Td>
                        <Td align="right">{it.quantity}</Td>
                        <Td>{it.unit}</Td>
                        <Td>{it.location || "-"}</Td>
                        <Td>
                          {it.expiryDate
                            ? new Date(it.expiryDate).toLocaleDateString()
                            : "-"}
                        </Td>
                        <Td>
                          {expired ? (
                            <span className="lab-status-badge expired">
                              Expired
                            </span>
                          ) : low ? (
                            <span className="lab-status-badge low">Low</span>
                          ) : (
                            <span className="lab-status-badge ok">OK</span>
                          )}
                        </Td>
                        <Td>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <Link 
                              to={`/lab/edit/${it._id}`} 
                              className="lab-item-btn"
                              style={{ 
                                fontSize: "0.7rem", 
                                padding: "4px 8px",
                                textDecoration: "none",
                                borderRadius: "4px",
                                backgroundColor: "#3b82f6",
                                color: "white",
                                border: "none",
                                cursor: "pointer"
                              }}
                            >
                              Update
                            </Link>
                            <Link 
                              to={`/lab/delete/${it._id}`} 
                              className="lab-item-btn"
                              style={{ 
                                fontSize: "0.7rem", 
                                padding: "4px 8px",
                                textDecoration: "none",
                                borderRadius: "4px",
                                backgroundColor: "#ef4444",
                                color: "white",
                                border: "none",
                                cursor: "pointer"
                              }}
                            >
                              Delete
                            </Link>
                          </div>
                        </Td>
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
      </div>
    </div>
  );
};

const Th = ({ children, align = "left" }) => (
  <th style={{ ...thBase, textAlign: align }}>{children}</th>
);
const Td = ({ children, align = "left" }) => (
  <td style={{ ...tdBase, textAlign: align }}>{children}</td>
);

const SummaryChip = ({ label, value, tone }) => {
  const colors = {
    warn: { bg: "#fef3c7", color: "#92400e" },
    danger: { bg: "#fee2e2", color: "#991b1b" },
    default: { bg: "#e2e8f0", color: "#334155" },
  };
  const c = colors[tone] || colors.default;
  return (
    <div style={{ ...chip, background: c.bg, color: c.color }}>
      <span style={chipLabel}>{label}</span>
      <span style={chipValue}>{value}</span>
    </div>
  );
};

const filtersBar = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
  marginBottom: "1rem",
};
const checkLabel = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: ".75rem",
  fontWeight: 600,
  letterSpacing: ".05em",
  textTransform: "uppercase",
};
const summaryBar = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1rem",
  marginBottom: "1.25rem",
};
const table = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: ".9rem",
};
const theadRow = { background: "#f1f5f9" };
const row = { borderBottom: "1px solid #e5e7eb" };
const thBase = {
  padding: ".7rem .75rem",
  fontWeight: 600,
  fontSize: ".7rem",
  letterSpacing: ".05em",
  textTransform: "uppercase",
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
};
const tdBase = {
  padding: ".65rem .75rem",
  verticalAlign: "top",
  whiteSpace: "nowrap",
};
const chip = {
  padding: "0.5rem 0.75rem",
  borderRadius: 10,
  fontSize: ".75rem",
  fontWeight: 600,
  letterSpacing: ".05em",
  display: "flex",
  flexDirection: "column",
  minWidth: 90,
  textAlign: "center",
};
const chipLabel = { fontSize: ".65rem", opacity: 0.8 };
const chipValue = { fontSize: "1rem", lineHeight: 1 };

export default LabItemList;