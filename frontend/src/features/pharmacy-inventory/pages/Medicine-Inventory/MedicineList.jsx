import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Package, 
  AlertTriangle, 
  XCircle, 
  DollarSign, 
  Plus, 
  Activity, 
  ChevronDown,
  User,
  Search,
  Bell
} from 'lucide-react';

const LOW_STOCK_THRESHOLD = 20; // Medicines threshold

const MedicineList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState("");
  
  // Initialize filters based on URL parameters
  const getInitialFilters = () => {
    const urlParams = new URLSearchParams(location.search);
    return {
      lowStock: urlParams.get('filter') === 'lowStock',
      expired: urlParams.get('filter') === 'expired',
    };
  };
  
  const [filters, setFilters] = useState(getInitialFilters);

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      
      // Add filter parameters for backend API
      if (filters.lowStock) params.lowStock = 1;
      if (filters.expired) params.expired = 1;
      
      console.log('Fetching medicines with filters:', filters);
      const url = new URL("http://localhost:5000/api/medicines");
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch medicines");
      const data = await res.json();
      console.log('Medicine API response:', data);
      
      let medicinesList = data.data || [];
      
      // Client-side filtering as backup if backend doesn't support filtering
      if (filters.lowStock || filters.expired) {
        medicinesList = medicinesList.filter(medicine => {
          const isExpired = medicine.expiryDate && new Date(medicine.expiryDate) < new Date();
          const isLowStock = medicine.quantity <= LOW_STOCK_THRESHOLD;
          
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
      
      setMedicines(medicinesList);
    } catch (e) {
      console.error('Error fetching medicines:', e);
      setError(e.message || "Failed to load medicines");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchSummary = useCallback(async () => {
    try {
      setLoadingSummary(true);
      const res = await fetch("http://localhost:5000/api/medicines");
      if (res.ok) {
        const data = await res.json();
        const medicinesList = data.data || [];
        
        const total = medicinesList.length;
        const lowStock = medicinesList.filter(med => (med.quantity || 0) <= LOW_STOCK_THRESHOLD).length;
        const expired = medicinesList.filter(med => 
          med.expiryDate && new Date(med.expiryDate) < new Date()
        ).length;
        
        setSummary({ total, lowStock, expired });
      }
    } catch (error) {
      console.error('Error fetching medicine summary:', error);
      /* ignore */
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Update filters when URL changes (e.g., navigating from dashboard)
  useEffect(() => {
    const newFilters = getInitialFilters();
    setFilters(newFilters);
  }, [location.search]);

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters((p) => ({ ...p, [name]: checked }));
  };

  const resetFilters = () => setFilters({ lowStock: false, expired: false });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">Family Health Care</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">CLINIC MANAGEMENT SYSTEM</div>
            </div>
          </div>
        </div>
        
        <nav className="mt-8">
          <div className="px-6">
            <div className="flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg mb-2 cursor-pointer"
                 onClick={() => navigate('/inventory-dashboard')}>
              <Package className="w-5 h-5 mr-3" />
              <span>Dashboard</span>
            </div>
            
            <div className="flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg mb-2 cursor-pointer"
                 onClick={() => navigate('/lab/list')}>
              <div className="w-5 h-5 mr-3 bg-gray-300 rounded"></div>
              <span>Lab Inventory</span>
            </div>
            
            <div className="flex items-center p-3 bg-blue-50 text-blue-600 rounded-lg mb-2">
              <div className="w-5 h-5 mr-3 bg-gray-300 rounded"></div>
              <span className="font-medium">Medicine Inventory</span>
            </div>
            
            <div className="flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg mb-2 cursor-pointer"
                 onClick={() => navigate('/order-management')}>
              <div className="w-5 h-5 mr-3 bg-gray-300 rounded"></div>
              <span>Order Management</span>
            </div>
            
            <div className="flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg mb-2 cursor-pointer"
                 onClick={() => navigate('/profile')}>
              <div className="w-5 h-5 mr-3 bg-gray-300 rounded"></div>
              <span>Profile</span>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Medicine Inventory</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-gray-600" />
              <div className="flex items-center space-x-2">
                <User className="w-8 h-8 text-gray-600" />
                <span className="text-gray-700">Inventory Manager</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm h-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Medicine Inventory Items</h3>
                <Link to="/medicine/add" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                  + Add Medicine
                </Link>
              </div>
            </div>
            
            <div className="p-6">
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
                className="medicine-item-btn"
                style={{ 
                  background: "#3b82f6",
                  color: 'white',
                  padding: '8px 16px',
                  fontSize: '14px'
                }}
                onClick={() => fetchMedicines()}
                disabled={loading}
              >
                {loading ? "Applying..." : "Apply Filters"}
              </button>
              <button
                type="button"
                className="medicine-item-btn"
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
                  value={filters.lowStock || filters.expired ? medicines.length : summary.total} 
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
                    <span>Showing: {medicines.length} medicines matching your filters</span>
                  </div>
                )}
              </>
            ) : null}
          </div>

            {loading && <p className="text-muted">Loading medicines...</p>}
            {error && <p className="text-danger">{error}</p>}

          {!loading && !error && (
            <div style={{ overflowX: "auto" }}>
              <table style={table}>
                <thead>
                  <tr style={theadRow}>
                    <Th>Medicine Name</Th>
                    <Th>Generic Name</Th>
                    <Th>Strength</Th>
                    <Th>Unit</Th>
                    <Th>Quantity</Th>
                    <Th>Expiry</Th>
                    <Th>Batch Number</Th>
                    <Th>Dosage Form</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        style={{ padding: "1.5rem", textAlign: "center" }}
                        className="text-muted"
                      >
                        {filters.lowStock || filters.expired ? (
                          <div>
                            <div style={{ marginBottom: '8px', fontSize: '16px' }}>
                              No medicines match your current filters
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
                              {' '}to see all medicines
                            </div>
                          </div>
                        ) : (
                          "No medicines found."
                        )}
                      </td>
                    </tr>
                  )}
                  {medicines.map((medicine) => {
                    const expired =
                      medicine.expiryDate && new Date(medicine.expiryDate) < new Date();
                    const low = (medicine.quantity || 0) <= LOW_STOCK_THRESHOLD;
                    return (
                      <tr key={medicine._id} style={row}>
                        <Td>{medicine.medicineName || 'N/A'}</Td>
                        <Td>{medicine.genericName || 'N/A'}</Td>
                        <Td>{medicine.strength || 'N/A'}</Td>
                        <Td>{medicine.unit || 'N/A'}</Td>
                        <Td>
                          <span 
                            className={`quantity-badge ${low ? 'low-stock' : 'normal-stock'}`}
                            title={`Quantity: ${medicine.quantity || 0}${low ? ' (Low Stock - ≤20)' : ' (Normal Stock)'}`}
                          >
                            {medicine.quantity || 0}
                          </span>
                        </Td>
                        <Td>
                          {medicine.expiryDate
                            ? new Date(medicine.expiryDate).toLocaleDateString()
                            : "-"}
                        </Td>
                        <Td>{medicine.batchNumber || 'N/A'}</Td>
                        <Td>{medicine.dosageForm || 'N/A'}</Td>
                        <Td>
                          {expired ? (
                            <span className="medicine-status-badge expired">
                              Expired
                            </span>
                          ) : low ? (
                            <span className="medicine-status-badge low">Low</span>
                          ) : (
                            <span className="medicine-status-badge ok">OK</span>
                          )}
                        </Td>
                        <Td>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <Link 
                              to={`/medicine/edit/${medicine._id}`} 
                              className="medicine-item-btn"
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
                              to={`/medicine/delete/${medicine._id}`} 
                              className="medicine-item-btn"
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
  color: "#000000",
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
  color: "#000000",
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
  color: "#000000",
};
const tdBase = {
  padding: ".65rem .75rem",
  verticalAlign: "top",
  whiteSpace: "nowrap",
  color: "#000000",
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

export default MedicineList;
