import React, { useState } from 'react';
import '../../../styles/DashboardStats.css';

const DashboardStats = ({ data, onRefresh, onPrescriptionClick, onNavigateToPrescriptions, onNavigateToMedicineInventory, onNavigateToLowStockMedicines }) => {
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showMedicineDetails, setShowMedicineDetails] = useState(false);
  if (!data) {
    return (
      <div className="dashboard-loading">
        <p>Loading dashboard statistics...</p>
      </div>
    );
  }

  const { statistics, lowStockMedicines } = data;

  // Mock data for recent prescriptions and low stock
  const recentPrescriptions = [
    {
      id: 'P-001',
      patient: 'John Smith',
      time: '10:25 AM',
      status: 'Pending',
      action: 'Process'
    },
    {
      id: 'P-002', 
      patient: 'Sarah Johnson',
      time: '09:45 AM',
      status: 'Pending',
      action: 'Process'
    },
    {
      id: 'P-003',
      patient: 'Michael Brown',
      time: '08:15 AM',
      status: 'Dispensed',
      action: 'View'
    },
    {
      id: 'P-004',
      patient: 'Emily Davis',
      time: '08:30 AM',
      status: 'Pending',
      action: 'Process'
    },
    {
      id: 'P-005',
      patient: 'Robert Wilson',
      time: 'Yesterday',
      status: 'Dispensed',
      action: 'View'
    }
  ];

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
                <div className="stat-value">12</div>
                <div className="stat-detail">Requires attention</div>
              </div>
            </div>
            
            <div className="stat-card dispensed">
              <div className="stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-info">
                <div className="stat-label">Dispensed Today</div>
                <div className="stat-value">28</div>
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
                <div className="stat-value">156</div>
                <div className="stat-detail"></div>
              </div>
            </div>
          </div>

          {/* Recent Prescriptions */}
          <div className="recent-prescriptions">
            <div className="section-header">
              <h3>Recent Prescriptions</h3>
              <button 
                className="view-all-btn"
                onClick={() => onNavigateToPrescriptions && onNavigateToPrescriptions()}
              >
                View All
              </button>
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
        </div>

        {/* Right Side - Low Stock Medications */}
        <div className="right-content">
          <div className="low-stock-section">
            <div className="section-header">
              <h3>Low Stock Medications</h3>
              <button className="alert-btn">
                <i className="fas fa-bell"></i>
                Alert
              </button>
            </div>
            <div className="low-stock-list">
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
                lowStockMedications.map((medication, index) => (
                  <div 
                    key={medication._id || index} 
                    className={`medication-item ${medication.status} clickable`}
                    onClick={() => handleMedicineClick(medication)}
                    title="Click for more details"
                  >
                    <div className="medication-info">
                      <div className="medication-name">{medication.name || medication.medicineName}</div>
                      <div className="medication-details">
                        <div className="detail-row">
                          <span className="label">Current Stock:</span>
                          <span className={`current-stock ${medication.status}`}>
                            {medication.quantity} {medication.unit || 'units'}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Category:</span>
                          <span className="category">{medication.category || 'General'}</span>
                        </div>
                        {medication.expiryDate && (
                          <div className="detail-row">
                            <span className="label">Expires:</span>
                            <span className="expiry-date">
                              {new Date(medication.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {medication.batchNumber && (
                          <div className="detail-row">
                            <span className="label">Batch:</span>
                            <span className="batch-number">{medication.batchNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="stock-indicator">
                      <div className={`status-badge ${medication.status}`}>
                        {medication.status === 'critical' ? 'Critical' : 'Low Stock'}
                      </div>
                      <div className="quantity-display">
                        {medication.quantity}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <button 
                className="view-all-stock-btn"
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