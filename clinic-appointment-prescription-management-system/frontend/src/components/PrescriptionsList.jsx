import React, { useState, useEffect } from 'react';
import './PrescriptionsList.css';

const PrescriptionsList = ({ onPrescriptionClick, onRefresh }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const filters = ['All', 'New', 'Dispensed'];

  // Mock prescription data matching your screenshot
  const mockPrescriptions = [
    {
      _id: 'P-001',
      prescriptionId: 'P-001',
      patient: { 
        name: 'John Smith', 
        age: 45, 
        gender: 'Male',
        phone: '+1-555-0123',
        address: '123 Main St, City',
        email: 'john.smith@email.com'
      },
      doctor: { name: 'Dr. Robert Chen' },
      dateIssued: '2023-09-10',
      status: 'New',
      priority: 'Normal',
      medications: [
        { 
          name: 'Lisinopril', 
          dosage: '10mg',
          quantity: 30,
          frequency: 'Once daily',
          duration: '30 days'
        }
      ]
    },
    {
      _id: 'P-002',
      prescriptionId: 'P-002',
      patient: { 
        name: 'Sarah Johnson', 
        age: 32, 
        gender: 'Female',
        phone: '+1-555-0124',
        address: '456 Oak Ave, City',
        email: 'sarah.j@email.com'
      },
      doctor: { name: 'Dr. Emily Wilson' },
      dateIssued: '2023-09-08',
      status: 'New',
      priority: 'Normal',
      medications: [
        { 
          name: 'Metformin', 
          dosage: '850mg',
          quantity: 60,
          frequency: 'Twice daily',
          duration: '30 days'
        }
      ]
    },
    {
      _id: 'P-003',
      prescriptionId: 'P-003',
      patient: { 
        name: 'Michael Brown', 
        age: 28, 
        gender: 'Male',
        phone: '+1-555-0125',
        address: '789 Pine St, City',
        email: 'michael.b@email.com'
      },
      doctor: { name: 'Dr. James Lee' },
      dateIssued: '2023-09-06',
      status: 'Dispensed',
      priority: 'Normal',
      medications: [
        { 
          name: 'Atorvastatin', 
          dosage: '20mg',
          quantity: 30,
          frequency: 'Once daily',
          duration: '30 days'
        }
      ]
    },
    {
      _id: 'P-004',
      prescriptionId: 'P-004',
      patient: { 
        name: 'Lisa Davis', 
        age: 55, 
        gender: 'Female',
        phone: '+1-555-0126',
        address: '321 Elm St, City',
        email: 'lisa.davis@email.com'
      },
      doctor: { name: 'Dr. Robert Chen' },
      dateIssued: '2023-09-07',
      status: 'New',
      priority: 'Normal',
      medications: [
        { 
          name: 'Omeprazole', 
          dosage: '20mg',
          quantity: 30,
          frequency: 'Once daily',
          duration: '30 days'
        }
      ]
    }
  ];

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
    
    return () => {
      window.removeEventListener('prescriptionUpdated', handlePrescriptionUpdate);
    };
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    
    // Filter prescriptions based on active filter
    let filteredPrescriptions = mockPrescriptions;
    
    if (activeFilter !== 'All') {
      filteredPrescriptions = mockPrescriptions.filter(
        prescription => prescription.status === activeFilter
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      filteredPrescriptions = filteredPrescriptions.filter(
        prescription => 
          prescription.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prescription.prescriptionId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setPrescriptions(filteredPrescriptions);
    setLoading(false);
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
                  <span className="patient-id">{prescription.prescriptionId}</span>
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
                  <span className="value">{selectedPrescription.prescriptionId}</span>
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
                        <span className="detail-value">{medication.duration}</span>
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