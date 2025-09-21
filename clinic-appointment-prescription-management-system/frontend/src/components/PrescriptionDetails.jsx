import React, { useState, useEffect } from 'react';
import './PrescriptionDetails.css';

const PrescriptionDetails = ({ prescription, onClose, onUpdate, pharmacistInfo }) => {
  const [isDispensing, setIsDispensing] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState(prescription);
  const [dispensingData, setDispensingData] = useState({
    medicationIndex: 0,
    quantityDispensed: '',
    notes: '',
    batchNumber: '',
    expiryDate: ''
  });

  // Update prescription data when prop changes
  useEffect(() => {
    setCurrentPrescription(prescription);
  }, [prescription]);

  // Listen for prescription updates from DispensingModule
  useEffect(() => {
    const handlePrescriptionUpdate = (event) => {
      const updatedPrescription = event.detail;
      if (updatedPrescription.id === currentPrescription?.prescriptionId) {
        setCurrentPrescription(prev => ({
          ...prev,
          status: updatedPrescription.status,
          medications: prev.medications?.map(med => {
            const updatedMed = updatedPrescription.medicines?.find(m => m.name === med.medicineName);
            if (updatedMed) {
              return {
                ...med,
                quantityDispensed: updatedMed.dispensed || 0,
                status: updatedMed.status,
                lastDispensedAt: new Date().toISOString()
              };
            }
            return med;
          })
        }));
      }
    };

    window.addEventListener('prescriptionUpdated', handlePrescriptionUpdate);
    return () => window.removeEventListener('prescriptionUpdated', handlePrescriptionUpdate);
  }, [currentPrescription?.prescriptionId]);

  if (!currentPrescription) return null;

  const handleDispenseClick = () => {
    setIsDispensing(true);
  };

  const handleDispenseCancel = () => {
    setIsDispensing(false);
    setDispensingData({
      medicationIndex: 0,
      quantityDispensed: '',
      notes: '',
      batchNumber: '',
      expiryDate: ''
    });
  };

  const handleDispenseConfirm = async () => {
    try {
      const token = localStorage.getItem('pharmacistToken');
      const response = await fetch(
        `http://localhost:5000/api/pharmacist/prescriptions/${currentPrescription._id}/dispense`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dispensingData)
        }
      );

      if (response.ok) {
        alert('Medication dispensed successfully!');
        onUpdate();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error dispensing medication:', error);
      alert('Error dispensing medication. Please try again.');
    }
  };

  const handleMarkAsDispensed = async () => {
    try {
      const token = localStorage.getItem('pharmacistToken');
      const response = await fetch(
        `http://localhost:5000/api/pharmacist/prescriptions/${currentPrescription._id}/status`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'Dispensed',
            notes: 'Marked as dispensed by pharmacist'
          })
        }
      );

      if (response.ok) {
        alert('Prescription marked as dispensed!');
        onUpdate();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating prescription status:', error);
      alert('Error updating prescription. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'green';
      case 'pending': return 'orange';
      case 'partially dispensed': return 'blue';
      case 'dispensed': return 'purple';
      case 'completed': return 'purple';
      default: return 'gray';
    }
  };

  const getMedicationStatus = (medication) => {
    const dispensed = medication.quantityDispensed || medication.dispensed || 0;
    const prescribed = medication.quantityPrescribed || medication.quantity || 0;
    
    if (dispensed === 0) return 'Not Dispensed';
    if (dispensed >= prescribed) return 'Fully Dispensed';
    return 'Partially Dispensed';
  };

  const getMedicationStatusClass = (medication) => {
    const status = getMedicationStatus(medication);
    switch (status) {
      case 'Not Dispensed': return 'not-dispensed';
      case 'Partially Dispensed': return 'partially-dispensed';
      case 'Fully Dispensed': return 'fully-dispensed';
      default: return 'not-dispensed';
    }
  };

  return (
    <div className="prescription-modal-overlay" onClick={onClose}>
      <div className="prescription-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-content">
            <h2>Prescription Details</h2>
            <span className="new-badge">NEW</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {/* Patient Information Section */}
          <div className="patient-info-section">
            <h3>Patient Information</h3>
            <div className="patient-info-grid">
              <div className="info-row">
                <div className="info-label">Patient</div>
                <div className="info-value">{currentPrescription.patientName || currentPrescription.patient?.name || 'N/A'}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Patient ID</div>
                <div className="info-value">{currentPrescription.prescriptionId || 'N/A'}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Prescribed By</div>
                <div className="info-value">{currentPrescription.doctorName || currentPrescription.prescribedBy?.name || 'N/A'}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Date</div>
                <div className="info-value">
                  {currentPrescription.dateIssued 
                    ? new Date(currentPrescription.dateIssued).toLocaleDateString('en-US') 
                    : new Date().toLocaleDateString('en-US')
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Medications Section */}
          <div className="medications-section">
            <h3>Medications</h3>
            <div className="medications-list">
              {currentPrescription.medications && currentPrescription.medications.length > 0 ? (
                currentPrescription.medications.map((medication, index) => (
                  <div key={index} className="medication-card">
                    <div className="medication-name">
                      {medication.medicineName || medication.name || `Medicine ${index + 1}`}
                    </div>
                    <div className="medication-info">
                      <div className="dosage-frequency">
                        <div className="dosage-section">
                          <span className="label">DOSAGE:</span>
                          <span className="value">{medication.dosage || '500mg'}</span>
                        </div>
                        <div className="frequency-section">
                          <span className="label">FREQUENCY:</span>
                          <span className="value">{medication.frequency || 'Tw'}</span>
                        </div>
                      </div>
                      {medication.instructions && (
                        <div className="instructions">
                          <span className="label">Instructions:</span>
                          <span className="value">{medication.instructions}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="medication-card">
                  <div className="medication-name">Metformin</div>
                  <div className="medication-info">
                    <div className="dosage-frequency">
                      <div className="dosage-section">
                        <span className="label">DOSAGE:</span>
                        <span className="value">500mg</span>
                      </div>
                      <div className="frequency-section">
                        <span className="label">FREQUENCY:</span>
                        <span className="value">Tw</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {currentPrescription.status === 'Pending' && (
            <button className="dispense-btn" onClick={handleDispenseClick}>
              Dispense Medicine
            </button>
          )}
          <button className="close-modal-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDetails;