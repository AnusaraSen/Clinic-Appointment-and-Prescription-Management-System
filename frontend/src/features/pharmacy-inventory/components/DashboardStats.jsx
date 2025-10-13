import React, { useState } from 'react';
import '../../../styles/DashboardStats.css';
import { useAuth } from '../../authentication/context/AuthContext.jsx';
import PharmacistMaintenanceRequestsSection from './PharmacistMaintenanceRequestsSection.jsx';

const DashboardStats = ({ data, recentPrescriptions = [], onRefresh, onPrescriptionClick, onNavigateToPrescriptions, onNavigateToMedicineInventory, onNavigateToLowStockMedicines, onNavigateToPrescriptionSummary }) => {
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showMedicineDetails, setShowMedicineDetails] = useState(false);
  const { user } = useAuth?.() || {};
  if (!data) {
    return (
      <div className="dashboard-loading">
        <p>Loading dashboard statistics...</p>
      </div>
    );
  }

  const { statistics, lowStockMedicines, inventoryKPIs } = data;
  const kpis = inventoryKPIs || {
    medicines: { total: 0, expired: 0, lowStock: 0, outOfStock: 0 },
    chemicals: { total: 0, expired: 0, lowStock: 0 },
    equipment: { total: 0, lowStock: 0, needsMaintenance: 0, outOfService: 0 },
    orders: { monthCount: 0, pending: 0 },
  };

  // If no real recentPrescriptions provided, keep empty array to show no items

  // Use real low stock medications from API data
  const lowStockMedications = lowStockMedicines || [];

  const handleMedicineClick = (medicine) => {
    setSelectedMedicine(medicine);
    setShowMedicineDetails(true);
  };

  const closeMedicineDetails = () => {
    setShowMedicineDetails(false);
    setSelectedMedicine(null);
  };

  return (
    <div className="dashboard-main">
      <div className="dashboard-content">
        {/* Left Side - Statistics and Recent Prescriptions */}
        <div className="left-content">
          {/* Statistics Cards */}
          <div className="stats-row">
            <div className="stat-card pending">
              <div className="stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-info">
                <div className="stat-label">Pending Prescriptions</div>
                <div className="stat-value">{statistics?.pendingPrescriptions ?? statistics?.newPrescriptions ?? 0}</div>
                <div className="stat-detail">Requires attention</div>
              </div>
            </div>
            
            <div className="stat-card dispensed">
              <div className="stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-info">
                <div className="stat-label">Dispensed Today</div>
                <div className="stat-value">{statistics?.dispensedToday ?? 0}</div>
                <div className="stat-detail">91% vs yesterday</div>
              </div>
            </div>

            <div className="stat-card low-stock">
              <div className="stat-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="stat-info">
                <div className="stat-label">Low Stock Medicines</div>
                <div className="stat-value">{lowStockMedications.length}</div>
                <div className="stat-detail">
                  {lowStockMedications.filter(med => med.status === 'critical').length > 0 
                    ? `${lowStockMedications.filter(med => med.status === 'critical').length} critical`
                    : 'Needs restocking'
                  }
                </div>
              </div>
            </div>

            <div className="stat-card patients">
              <div className="stat-icon">
                <i className="fas fa-user-friends"></i>
              </div>
              <div className="stat-info">
                <div className="stat-label">New Patients</div>
                <div className="stat-value">{statistics?.totalPrescriptions ?? 0}</div>
                <div className="stat-detail"></div>
              </div>
            </div>
          </div>

          {/* Inventory KPI Cards - Chemicals & Equipment */}
          <div className="stats-row inventory">
            <div className="stat-card chemicals">
              <div className="stat-icon">
                <i className="fas fa-flask"></i>
              </div>
              <div className="stat-info">
                <div className="stat-label">Chemicals Low Stock</div>
                <div className="stat-value">{kpis.chemicals.lowStock ?? 0}</div>
                <div className="stat-detail">Expired: {kpis.chemicals.expired ?? 0}</div>
              </div>
            </div>

            <div className="stat-card equipment">
              <div className="stat-icon">
                <i className="fas fa-tools"></i>
              </div>
              <div className="stat-info">
                <div className="stat-label">Equipment Low Stock</div>
                <div className="stat-value">{kpis.equipment.lowStock ?? 0}</div>
                <div className="stat-detail">Out of Service: {kpis.equipment.outOfService ?? 0} • Needs Maint: {kpis.equipment.needsMaintenance ?? 0}</div>
              </div>
            </div>
          </div>

          {/* Recent Prescriptions */}
          <div className="recent-prescriptions">
            <div className="section-header">
              <h3>Recent Prescriptions</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="view-all-btn"
                  onClick={() => onNavigateToPrescriptionSummary && onNavigateToPrescriptionSummary()}
                  style={{
                    backgroundColor: '#0d9488',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#0f766e'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#0d9488'}
                >
                  <i className="fas fa-file-alt" style={{ marginRight: '6px' }}></i>
                  Summary Report
                </button>
                <button 
                  className="view-all-btn"
                  onClick={() => onNavigateToPrescriptions && onNavigateToPrescriptions()}
                >
                  View All
                </button>
              </div>
            </div>
            <div className="prescriptions-table">
              <div className="table-header">
                <span>Patient</span>
                <span>ID</span>
                <span>Time</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              {recentPrescriptions.map((prescription, index) => (
                <div key={index} className="table-row">
                  <span className="patient-name">{prescription.patient}</span>
                  <span className="prescription-id">{prescription.id}</span>
                  <span className="time">{prescription.time}</span>
                  <span className={`status status-${prescription.status.toLowerCase()}`}>
                    {prescription.status}
                  </span>
                  <button 
                    className={`action-button ${prescription.status.toLowerCase()}`}
                    onClick={() => {
                      if (prescription.status === 'Pending' && prescription.action === 'Process') {
                        onNavigateToPrescriptions && onNavigateToPrescriptions();
                      } else if (prescription.action === 'View') {
                        onPrescriptionClick && onPrescriptionClick(prescription);
                      }
                    }}
                  >
                    {prescription.action}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance Requests (Pharmacist) */}
          {user?.role === 'Pharmacist' && (
            <div style={{ marginTop: '16px' }}>
              <PharmacistMaintenanceRequestsSection />
            </div>
          )}
        </div>

        {/* Right Side - Stock Alerts */}
        <div className="right-content">
          <div className="low-stock-section">
            <div className="section-header">
              <h3>Stock Alerts</h3>
              <i className="fas fa-chevron-down" style={{ color: '#9ca3af', fontSize: '16px' }}></i>
            </div>
            
            {/* Stock Alert Badges */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              padding: '16px 20px',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <span style={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600'
              }}>
                Low Stock ({lowStockMedications.filter(m => m.status === 'low').length})
              </span>
              <span style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600'
              }}>
                Expired ({lowStockMedications.filter(m => m.status === 'critical').length})
              </span>
            </div>

            <div className="low-stock-list" style={{ padding: '16px 20px' }}>
              {lowStockMedications.length === 0 ? (
                <div className="no-low-stock">
                  <div className="no-stock-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="no-stock-message">
                    All medicines are adequately stocked
                  </div>
                </div>
              ) : (
                lowStockMedications.map((medication, index) => {
                  const isExpired = medication.status === 'critical' || (medication.expiryDate && new Date(medication.expiryDate) < new Date());
                  const maxStock = 20; // Assumed max for progress bar
                  const stockPercentage = Math.min((medication.quantity / maxStock) * 100, 100);
                  
                  return (
                    <div 
                      key={medication._id || index} 
                      style={{
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                          {/* Warning Icon */}
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: isExpired ? '#fee2e2' : '#fff3cd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {isExpired ? (
                              <i className="fas fa-times-circle" style={{ color: '#dc2626', fontSize: '18px' }}></i>
                            ) : (
                              <i className="fas fa-exclamation-triangle" style={{ color: '#d97706', fontSize: '16px' }}></i>
                            )}
                          </div>
                          
                          {/* Medicine Info */}
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontWeight: '600', 
                              color: '#1f2937',
                              fontSize: '14px',
                              marginBottom: '4px'
                            }}>
                              {medication.name || medication.medicineName}
                            </div>
                            <div style={{ 
                              fontSize: '13px', 
                              color: '#6b7280',
                              marginBottom: isExpired ? '0' : '8px'
                            }}>
                              {isExpired 
                                ? `Expired: ${medication.expiryDate ? new Date(medication.expiryDate).toLocaleDateString() : 'N/A'}`
                                : `${medication.quantity} ${medication.unit || 'capsules'} left`
                              }
                            </div>
                            
                            {/* Progress Bar - only for low stock items */}
                            {!isExpired && (
                              <div style={{
                                width: '100%',
                                height: '6px',
                                backgroundColor: '#e5e7eb',
                                borderRadius: '3px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${stockPercentage}%`,
                                  height: '100%',
                                  backgroundColor: medication.quantity <= 3 ? '#dc2626' : '#f59e0b',
                                  transition: 'width 0.3s ease'
                                }}></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <button 
                style={{
                  width: '100%',
                  marginTop: '12px',
                  color: '#2563eb',
                  backgroundColor: 'transparent',
                  border: '1px solid #dbeafe',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#eff6ff';
                  e.target.style.borderColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#dbeafe';
                }}
                onClick={() => onNavigateToLowStockMedicines && onNavigateToLowStockMedicines()}
              >
                View All Low Stock
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Medicine Details Modal */}
      {showMedicineDetails && selectedMedicine && (
        <div className="medicine-modal-overlay" onClick={closeMedicineDetails}>
          <div className="medicine-modal" onClick={(e) => e.stopPropagation()}>
            <div className="medicine-modal-header">
              <h3>{selectedMedicine.name || selectedMedicine.medicineName}</h3>
              <button className="close-modal" onClick={closeMedicineDetails}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="medicine-modal-body">
              <div className="modal-detail-grid">
                <div className="modal-detail-item">
                  <span className="modal-label">Current Stock:</span>
                  <span className={`modal-value stock-${selectedMedicine.status}`}>
                    {selectedMedicine.quantity} {selectedMedicine.unit || 'units'}
                  </span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-label">Status:</span>
                  <span className={`modal-value status-badge ${selectedMedicine.status}`}>
                    {selectedMedicine.status === 'critical' ? 'Critical Stock' : 'Low Stock'}
                  </span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-label">Category:</span>
                  <span className="modal-value">{selectedMedicine.category || 'General'}</span>
                </div>
                {selectedMedicine.manufacturer && (
                  <div className="modal-detail-item">
                    <span className="modal-label">Manufacturer:</span>
                    <span className="modal-value">{selectedMedicine.manufacturer}</span>
                  </div>
                )}
                {selectedMedicine.expiryDate && (
                  <div className="modal-detail-item">
                    <span className="modal-label">Expiry Date:</span>
                    <span className="modal-value">
                      {new Date(selectedMedicine.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {selectedMedicine.batchNumber && (
                  <div className="modal-detail-item">
                    <span className="modal-label">Batch Number:</span>
                    <span className="modal-value">{selectedMedicine.batchNumber}</span>
                  </div>
                )}
                {selectedMedicine.supplier && (
                  <div className="modal-detail-item">
                    <span className="modal-label">Supplier:</span>
                    <span className="modal-value">{selectedMedicine.supplier}</span>
                  </div>
                )}
                <div className="modal-detail-item">
                  <span className="modal-label">Recommended Action:</span>
                  <span className="modal-value action-recommendation">
                    {selectedMedicine.status === 'critical' 
                      ? 'Immediate restocking required' 
                      : 'Schedule restocking soon'
                    }
                  </span>
                </div>
              </div>
            </div>
            <div className="medicine-modal-footer">
              <button 
                className="reorder-btn"
                onClick={() => {
                  closeMedicineDetails();
                  onNavigateToLowStockMedicines && onNavigateToLowStockMedicines();
                }}
              >
                Go to Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;