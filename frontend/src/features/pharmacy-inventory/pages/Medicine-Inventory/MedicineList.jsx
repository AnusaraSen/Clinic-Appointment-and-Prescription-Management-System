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
import "../../../../styles/Medicine/MedicineList.css";

// Use reorderLevel from each medicine instead of fixed threshold
// const LOW_STOCK_THRESHOLD = 20; // Old fixed threshold - now using dynamic reorder levels

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
  const [searchTerm, setSearchTerm] = useState("");

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
      console.log('Sample medicine from API:', data.data && data.data[0]);
      if (data.data && data.data.length > 0) {
        console.log('First medicine reorderLevel:', data.data[0].reorderLevel);
        console.log('First medicine full object:', JSON.stringify(data.data[0], null, 2));
        // Check all medicines for reorderLevel
        data.data.forEach((med, idx) => {
          console.log(`Medicine ${idx}: ${med.medicineName}, reorderLevel:`, med.reorderLevel, typeof med.reorderLevel);
        });
      }
      
      let medicinesList = data.data || [];
      
      // Client-side filtering as backup if backend doesn't support filtering
      if (filters.lowStock || filters.expired) {
        medicinesList = medicinesList.filter(medicine => {
          const isExpired = medicine.expiryDate && new Date(medicine.expiryDate) < new Date();
          const isLowStock = (medicine.quantity || 0) <= (medicine.reorderLevel || 5);
          
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
        const lowStock = medicinesList.filter(med => (med.quantity || 0) <= (med.reorderLevel || 5)).length;
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
    <div className="flex flex-col bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Medicine Inventory</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </div>
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
                }}>Medicine Inventory Items</h3>
                <Link 
                  to="/medicine/add" 
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '10px 20px',
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
                  + Add Medicine
                </Link>
              </div>
            </div>
            
            <div className="p-6">
          {/* Search Bar */}
          <div style={{
            marginBottom: '20px'
          }}>
            <div style={{
              position: 'relative',
              maxWidth: '400px'
            }}>
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
                placeholder="Search medicines by name or category..."
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
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ffffff',
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                cursor: 'pointer'
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
                    cursor: 'pointer'
                  }}
                />
                Low Stock
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ffffff',
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  name="expired"
                  checked={filters.expired}
                  onChange={handleFilterChange}
                  style={{
                    width: '16px',
                    height: '16px',
                    margin: '0',
                    cursor: 'pointer'
                  }}
                />
                Expired
              </label>
              <button
                type="button"
                onClick={() => {
                  setFilters({ lowStock: false, expired: false });
                }}
                disabled={loading}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
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

          {(filters.lowStock || filters.expired) && (
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              marginBottom: '20px',
              padding: '12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Active Filters:</span>
              {filters.lowStock && (
                <span style={{
                  backgroundColor: '#fbbf24',
                  color: '#92400e',
                  padding: '4px 8px',
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
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  Expired
                </span>
              )}
            </div>
          )}

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
                    <Th>Reorder Level</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.filter((medicine) => {
                      if (!searchTerm) return true;
                      const search = searchTerm.toLowerCase();
                      return (
                        medicine.medicineName?.toLowerCase().includes(search) ||
                        medicine.genericName?.toLowerCase().includes(search) ||
                        medicine.category?.toLowerCase().includes(search) ||
                        medicine.dosageForm?.toLowerCase().includes(search)
                      );
                    }).length === 0 && (
                    <tr>
                      <td
                        colSpan={11}
                        style={{ padding: "1.5rem", textAlign: "center" }}
                        className="text-muted"
                      >
                        {searchTerm ? (
                          <div>
                            <div style={{ marginBottom: '8px', fontSize: '16px' }}>
                              No medicines found matching "{searchTerm}"
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                              Try a different search term
                            </div>
                          </div>
                        ) : filters.lowStock || filters.expired ? (
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
                  {medicines
                    .filter((medicine) => {
                      if (!searchTerm) return true;
                      const search = searchTerm.toLowerCase();
                      return (
                        medicine.medicineName?.toLowerCase().includes(search) ||
                        medicine.genericName?.toLowerCase().includes(search) ||
                        medicine.category?.toLowerCase().includes(search) ||
                        medicine.dosageForm?.toLowerCase().includes(search)
                      );
                    })
                    .map((medicine) => {
                    const expired =
                      medicine.expiryDate && new Date(medicine.expiryDate) < new Date();
                    const low = (medicine.quantity || 0) <= (medicine.reorderLevel || 5);
                    return (
                      <tr key={medicine._id} style={row}>
                        <Td>{medicine.medicineName || 'N/A'}</Td>
                        <Td>{medicine.genericName || 'N/A'}</Td>
                        <Td>{medicine.strength || 'N/A'}</Td>
                        <Td>{medicine.unit || 'N/A'}</Td>
                        <Td>
                          <span 
                            className={`quantity-badge ${low ? 'low-stock' : 'normal-stock'}`}
                            title={`Quantity: ${medicine.quantity || 0}${low ? ` (Low Stock - ≤${medicine.reorderLevel || 5})` : ' (Normal Stock)'}`}
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
                        <Td>{medicine.reorderLevel || 0}</Td>
                        <Td>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            {expired ? (
                              <span 
                                className="medicine-status-badge expired"
                                style={{
                                  backgroundColor: '#fee2e2',
                                  color: '#991b1b',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  border: '1px solid #fca5a5',
                                  minWidth: '70px',
                                  textAlign: 'center'
                                }}
                              >
                                EXPIRED
                              </span>
                            ) : low ? (
                              <span 
                                className="medicine-status-badge low"
                                style={{
                                  backgroundColor: '#fef3c7',
                                  color: '#92400e',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  border: '1px solid #fbbf24',
                                  minWidth: '70px',
                                  textAlign: 'center'
                                }}
                              >
                                LOW
                              </span>
                            ) : (
                              <span 
                                className="medicine-status-badge ok"
                                style={{
                                  backgroundColor: '#dcfce7',
                                  color: '#166534',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  border: '1px solid #86efac',
                                  minWidth: '70px',
                                  textAlign: 'center'
                                }}
                              >
                                OK
                              </span>
                            )}
                          </div>
                        </Td>
                        <Td>
                          <div style={{ 
                            display: "flex", 
                            gap: "4px", 
                            justifyContent: "center", 
                            alignItems: "center",
                            flexWrap: "nowrap",
                            minWidth: "180px"
                          }}>
                            {(expired || low) ? (
                              <button 
                                className="medicine-item-btn"
                                onClick={() => navigate('/orders')}
                                style={{ 
                                  fontSize: "0.65rem", 
                                  padding: "6px 10px",
                                  borderRadius: "4px",
                                  backgroundColor: "#10b981",
                                  color: "white",
                                  border: "none",
                                  cursor: "pointer",
                                  minWidth: "55px",
                                  textAlign: "center",
                                  fontWeight: "600",
                                  whiteSpace: "nowrap"
                                }}
                              >
                                ORDER
                              </button>
                            ) : (
                              <button 
                                disabled
                                className="medicine-item-btn"
                                style={{ 
                                  fontSize: "0.65rem", 
                                  padding: "6px 10px",
                                  borderRadius: "4px",
                                  backgroundColor: "#9ca3af",
                                  color: "#d1d5db",
                                  border: "none",
                                  cursor: "not-allowed",
                                  minWidth: "55px",
                                  textAlign: "center",
                                  fontWeight: "600",
                                  whiteSpace: "nowrap",
                                  opacity: 0.6
                                }}
                                title="Can only order low stock or expired medicines"
                              >
                                ORDER
                              </button>
                            )}
                            {expired ? (
                              <button 
                                disabled
                                className="medicine-item-btn"
                                style={{ 
                                  fontSize: "0.65rem", 
                                  padding: "6px 10px",
                                  borderRadius: "4px",
                                  backgroundColor: "#9ca3af",
                                  color: "#d1d5db",
                                  border: "none",
                                  cursor: "not-allowed",
                                  minWidth: "55px",
                                  textAlign: "center",
                                  fontWeight: "600",
                                  whiteSpace: "nowrap",
                                  opacity: 0.6
                                }}
                                title="Cannot update expired medicine"
                              >
                                UPDATE
                              </button>
                            ) : (
                              <Link 
                                to={`/medicine/edit/${medicine._id}`} 
                                className="medicine-item-btn"
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
                            )}
                            <Link 
                              to={`/medicine/delete/${medicine._id}`} 
                              className="medicine-item-btn"
                              style={{ 
                                fontSize: "0.65rem", 
                                padding: "6px 10px",
                                textDecoration: "none",
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
