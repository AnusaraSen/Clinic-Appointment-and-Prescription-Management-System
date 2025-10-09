import React, { useState, useEffect } from 'react';
import prescriptionsApi from '../../../api/prescriptionsApi';
import { getAllStatusOverrides, PRESCRIPTION_CHANGED_EVENT } from '../../../utils/prescriptionEvents';
import '../../../styles/PrescriptionsList.css';

const PrescriptionsList = ({ onPrescriptionClick, onRefresh }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const filters = ['All', 'New', 'Dispensed'];

  // Source array from backend
  const [allPrescriptions, setAllPrescriptions] = useState([]);

  useEffect(() => {
    fetchPrescriptions();
  }, [activeFilter, searchTerm]);

  // Listen for prescription updates from the dispensing module
  useEffect(() => {
    const handlePrescriptionUpdate = (event) => {
      const updatedPrescription = event.detail;
      console.log('PrescriptionsList: Received prescription update:', updatedPrescription);
      
      setPrescriptions(prev => {
        const updated = prev.map(prescription => {
          const matches = prescription._id === updatedPrescription.id || 
                         prescription.prescriptionId === updatedPrescription.id;
          
          if (matches) {
            console.log(`PrescriptionsList: Updating prescription ${prescription.prescriptionId} status to ${updatedPrescription.status}`);
            return { 
              ...prescription, 
              status: updatedPrescription.status, 
              lastDispensed: updatedPrescription.lastDispensed 
            };
          }
          return prescription;
        });
        
        console.log('PrescriptionsList: Updated prescriptions:', updated);
        return updated;
      });

      // Show a brief visual indication that an update occurred
      const prescriptionElements = document.querySelectorAll(`[data-prescription-id="${updatedPrescription.id}"]`);
      prescriptionElements.forEach(element => {
        element.classList.add('prescription-updated');
        setTimeout(() => {
          element.classList.remove('prescription-updated');
        }, 2000);
      });
    };

    window.addEventListener('prescriptionUpdated', handlePrescriptionUpdate);
    // If external changes occur (delete/update), refetch list
    const handleChanged = () => fetchPrescriptions();
    window.addEventListener(PRESCRIPTION_CHANGED_EVENT, handleChanged);
    
    return () => {
      window.removeEventListener('prescriptionUpdated', handlePrescriptionUpdate);
      window.removeEventListener(PRESCRIPTION_CHANGED_EVENT, handleChanged);
    };
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      // Fetch from clinical workflow endpoint: GET /prescription/get
      const res = await prescriptionsApi.list();
  const raw = Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || []);
      // Normalize to UI shape
      const overrides = getAllStatusOverrides();
      const mapped = raw.map((d) => {
        const id = d._id || d.id;
        const dateRaw = d.Date || d.date || d.created_at;
  const patientName = d.patient_name || d.patientName || d.patient?.name || '';
  const patientId = d.patient_ID || d.patientId || d.patient?.id || d.patient?.code || '';
        const doctorName = d.doctor_Name || d.doctorName || d.doctor?.name || '';
        const meds = Array.isArray(d.Medicines)
          ? d.Medicines.map((m) => ({
              name: m.Medicine_Name || m.name || '',
              dosage: m.Dosage || m.dosage || '',
              quantity: m.Quantity || m.quantity,
              frequency: m.Frequency || m.frequency || '',
              duration: m.Duration || m.duration || '',
            }))
          : Array.isArray(d.medicines)
          ? d.medicines
          : [];
  const status = overrides?.[(typeof id === 'object' && id?.toString) ? id.toString() : String(id)] || d.status || 'New';
        return {
          _id: typeof id === 'object' && id?.toString ? id.toString() : String(id),
          prescriptionId: d.prescriptionId || (typeof id === 'object' && id?.toString ? id.toString() : String(id)),
          patient: { name: patientName },
          patientId,
          doctor: { name: doctorName },
          dateIssued: dateRaw ? new Date(dateRaw).toISOString().slice(0, 10) : '',
          status,
          medications: meds,
        };
      });
      // Sort newest first (use Date; fallback to ObjectId timestamp if present)
      const sorted = [...mapped].sort((a, b) => {
        const da = a.dateIssued ? new Date(a.dateIssued).getTime() : (a._id ? parseInt(a._id.substring(0,8),16)*1000 : 0);
        const db = b.dateIssued ? new Date(b.dateIssued).getTime() : (b._id ? parseInt(b._id.substring(0,8),16)*1000 : 0);
        return db - da;
      });
      setAllPrescriptions(sorted);

      // Then apply UI filters/search on the sorted array
      let filtered = sorted;
      if (activeFilter !== 'All') {
        filtered = filtered.filter((p) => (p.status || 'New') === activeFilter);
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (p) => p.patient.name.toLowerCase().includes(q) || p.prescriptionId.toLowerCase().includes(q)
        );
      }
      setPrescriptions(filtered);
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedPrescription(null);
  };

  const handleMarkAsDispensed = (prescriptionId) => {
    setPrescriptions(prev => 
      prev.map(p => 
        p._id === prescriptionId 
          ? { ...p, status: 'Dispensed' }
          : p
      )
    );
    if (selectedPrescription && selectedPrescription._id === prescriptionId) {
      setSelectedPrescription(prev => ({ ...prev, status: 'Dispensed' }));
    }
  };

  return (
    <div className="prescriptions-page">
      <div className="prescriptions-main">
        {/* Header */}
        <div className="prescriptions-header">
          <div className="header-top">
            <h1>Prescriptions</h1>
            
          </div>
          
          {/* Filter Tabs */}
          <div className="filter-tabs">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => handleFilterChange(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Prescriptions Table */}
        <div className="prescriptions-table-container">
          <div className="table-header">
            <span>Patient</span>
            <span>Patient ID</span>
            <span>Prescribed by</span>
            <span>Date</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          
          <div className="table-body">
            {loading ? (
              <div className="loading">Loading prescriptions...</div>
            ) : prescriptions.length > 0 ? (
              prescriptions.map((prescription) => (
                <div 
                  key={prescription._id} 
                  className="table-row"
                  data-prescription-id={prescription.prescriptionId}
                >
                  <span className="patient-name">{prescription.patient.name}</span>
                  <span className="patient-id">{prescription.patientId || '-'}</span>
                  <span className="doctor-name">{prescription.doctor.name}</span>
                  <span className="date">{prescription.dateIssued}</span>
                  <span className={`status status-${prescription.status.toLowerCase()}`}>
                    {prescription.status}
                  </span>
                  <div className="actions">
                    <button 
                      className="view-btn"
                      onClick={() => handleViewPrescription(prescription)}
                    >
                      <i className="fas fa-eye"> </i>
                    </button>
                    
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No prescriptions found</div>
            )}
          </div>
        </div>
      </div>

      {/* Patient Details Modal */}
      {showDetails && selectedPrescription && (
        <div className="prescription-details-panel" onClick={handleCloseDetails}>
          <div className="prescription-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="details-header">
              <h3>
                Prescription Details
                <span className={`status-badge-modal ${selectedPrescription.status.toLowerCase()}`}>
                  {selectedPrescription.status}
                </span>
              </h3>
              <button className="close-btn" onClick={handleCloseDetails}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="details-content">
              <div className="patient-info">
                <h4>Patient Information</h4>
                <div className="info-row">
                  <span className="label">Patient</span>
                  <span className="value">{selectedPrescription.patient.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Patient ID</span>
                  <span className="value">{selectedPrescription.patientId || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Prescribed By</span>
                  <span className="value">{selectedPrescription.doctor.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Date</span>
                  <span className="value">{selectedPrescription.dateIssued}</span>
                </div>
              </div>

              <div className="medications-section">
                <h4>Medications</h4>
                {selectedPrescription.medications.map((medication, index) => (
                  <div key={index} className="medication-item">
                    <div className="medication-name">{medication.name}</div>
                    <div className="medication-details">
                      <div className="detail-item">
                        <span className="detail-label">Dosage:</span>
                        <span className="detail-value">{medication.dosage}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Frequency:</span>
                        <span className="detail-value">{medication.frequency}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Duration:</span>
                        <span className="detail-value">{medication.duration || '-'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="action-buttons">
                <button className="close-details-btn" onClick={handleCloseDetails}>
                  Close
                </button>
                {selectedPrescription.status === 'New' && (
                  <button 
                    className="mark-dispensed-btn"
                    onClick={() => handleMarkAsDispensed(selectedPrescription._id)}
                  >
                    <i className="fas fa-check"></i>
                    Mark as Dispensed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionsList;