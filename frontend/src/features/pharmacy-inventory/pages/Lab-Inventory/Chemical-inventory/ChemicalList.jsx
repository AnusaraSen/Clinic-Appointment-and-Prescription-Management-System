import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
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
        <div className="lab-item-header">
          <h2 className="lab-item-title">Chemical Inventory</h2>
          <div className="lab-item-actions">
            <Link to="/chemical-inventory/add" className="lab-item-btn primary">
              + Add Chemical
            </Link>
          </div>
        </div>

        <div className="lab-item-body" style={{ paddingTop: 20 }}>
          <div
            style={{
              ...filtersBar,
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
                marginBottom: "12px",
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
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                }}
              >
                <input
                  type="checkbox"
                  name="lowStock"
                  checked={filters.lowStock}
                  onChange={handleFilterChange}
                  style={{ marginRight: "6px" }}
                />
                Low Stock
              </label>
              <label
                style={{
                  ...checkLabel,
                  backgroundColor: "#ffffff",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                }}
              >
                <input
                  type="checkbox"
                  name="expired"
                  checked={filters.expired}
                  onChange={handleFilterChange}
                  style={{ marginRight: "6px" }}
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
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Reset Filters
              </button>
            </div>

            {!loadingSummary && summary && (
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  fontSize: "13px",
                  color: "#6b7280",
                }}
              >
                <span>
                  Total: <strong style={{ color: "#374151" }}>{summary.total}</strong>
                </span>
                <span>
                  Low Stock: <strong style={{ color: "#dc2626" }}>{summary.lowStock}</strong>
                </span>
                <span>
                  Expired: <strong style={{ color: "#dc2626" }}>{summary.expired}</strong>
                </span>
              </div>
            )}
          </div>

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

          {chemicals.length === 0 ? (
            <div className="lab-item-empty">
              No chemicals found. {(filters.lowStock || filters.expired) &&
                "Try adjusting your filters."}
            </div>
          ) : (
            <div className="lab-item-table-wrapper">
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
                  {chemicals.map((chemical) => {
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
                            style={{ display: "flex", gap: "8px" }}
                          >
                            <Link
                              to={`/chemical-inventory/edit/${chemical._id}`}
                              className="lab-item-btn secondary small"
                            >
                              Update
                            </Link>
                            <button
                              className="lab-item-btn primary small"
                              disabled={!canOrder}
                              onClick={() => navigate("/orders")}
                              style={
                                !canOrder
                                  ? {
                                      backgroundColor: "#e5e7eb",
                                      color: "#6b7280",
                                      cursor: "not-allowed",
                                    }
                                  : undefined
                              }
                            >
                              Order
                            </button>
                            <button
                              className="lab-item-btn danger small"
                              onClick={() =>
                                handleDeleteChemical(
                                  chemical._id,
                                  chemical.itemName
                                )
                              }
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

export default ChemicalList;