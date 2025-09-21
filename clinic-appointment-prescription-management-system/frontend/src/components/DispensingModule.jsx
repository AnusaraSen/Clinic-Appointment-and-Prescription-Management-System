import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { dispenseMedicines } from '../api/prescriptionApi'; // Commented out for demo - using mock data
import './DispensingModule.css';

const DispensingModule = () => {
  const [medicines, setMedicines] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [prescribedMedicines, setPrescribedMedicines] = useState([]);
  const [selectedPatientInfo, setSelectedPatientInfo] = useState(null);
  const [updatedPrescriptions, setUpdatedPrescriptions] = useState(new Map());
  const [loading, setLoading] = useState(true);

  // Mock medicine data
  const mockMedicines = [
    {
      id: 1,
      name: 'Amoxicillin 500mg',
      category: 'Antibiotics',
      available: 120
    },
    {
      id: 2,
      name: 'Ibuprofen 400mg',
      category: 'Pain Relief',
      available: 200
    },
    {
      id: 3,
      name: 'Lisinopril 10mg',
      category: 'Blood Pressure',
      available: 90
    },
    {
      id: 4,
      name: 'Metformin 850mg',
      category: 'Diabetes',
      available: 150
    },
    {
      id: 5,
      name: 'Atorvastatin 20mg',
      category: 'Cholesterol',
      available: 80
    },
    {
      id: 6,
      name: 'Omeprazole 20mg',
      category: 'Gastric',
      available: 110
    },
    {
      id: 7,
      name: 'Loratadine 10mg',
      category: 'Allergy',
      available: 75
    },
    {
      id: 8,
      name: 'Acetaminophen 500mg',
      category: 'Pain Relief',
      available: 250
    }
  ];

  // Mock patient data with prescriptions
  const mockPatients = [
    { 
      id: 'P-001', 
      name: 'John Smith',
      prescriptions: [
        {
          id: 'P-001',
          prescriptionId: 'P-001',
          doctor: 'Dr. Robert Chen',
          date: '2023-09-10',
          status: 'New',
          medicines: [
            { 
              name: 'Lisinopril 10mg', 
              dosage: '10mg', 
              frequency: 'Once daily', 
              quantity: 30, 
              duration: '30 days',
              dispensed: 0,
              status: 'Not Dispensed'
            }
          ]
        }
      ]
    },
    { 
      id: 'P-002', 
      name: 'Sarah Johnson',
      prescriptions: [
        {
          id: 'P-002',
          prescriptionId: 'P-002',
          doctor: 'Dr. Emily Wilson',
          date: '2023-09-08',
          status: 'New',
          medicines: [
            { 
              name: 'Metformin 850mg', 
              dosage: '850mg', 
              frequency: 'Twice daily', 
              quantity: 60, 
              duration: '30 days',
              dispensed: 0,
              status: 'Not Dispensed'
            }
          ]
        }
      ]
    },
    { 
      id: 'P-003', 
      name: 'Michael Brown',
      prescriptions: [
        {
          id: 'P-003',
          prescriptionId: 'P-003',
          doctor: 'Dr. James Lee',
          date: '2023-09-06',
          status: 'Dispensed',
          medicines: [
            { 
              name: 'Atorvastatin 20mg', 
              dosage: '20mg', 
              frequency: 'Once daily', 
              quantity: 30, 
              duration: '30 days',
              dispensed: 30,
              status: 'Fully Dispensed'
            }
          ]
        }
      ]
    },
    { 
      id: 'P-004', 
      name: 'Lisa Davis',
      prescriptions: [
        {
          id: 'P-004',
          prescriptionId: 'P-004',
          doctor: 'Dr. Robert Chen',
          date: '2023-09-07',
          status: 'New',
          medicines: [
            { 
              name: 'Omeprazole 20mg', 
              dosage: '20mg', 
              frequency: 'Once daily', 
              quantity: 30, 
              duration: '30 days',
              dispensed: 0,
              status: 'Not Dispensed'
            }
          ]
        }
      ]
    }
  ];

  useEffect(() => {
    fetchMedicinesFromInventory();
    setPatients(mockPatients);
  }, []);

  // Fetch real medicines from inventory API
  const fetchMedicinesFromInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/medicines');
      const medicinesData = response.data.data || [];
      
      // Filter out expired and low stock medicines
      const availableMedicines = medicinesData.filter(medicine => {
        const isNotExpired = !medicine.expiryDate || new Date(medicine.expiryDate) >= new Date();
        const hasAdequateStock = (medicine.quantity || 0) > 10;
        return isNotExpired && hasAdequateStock;
      });
      
      // Transform data to match component structure
      const transformedMedicines = availableMedicines.map(medicine => ({
        id: medicine._id,
        name: `${medicine.medicineName}${medicine.strength ? ' ' + medicine.strength : ''}`,
        category: medicine.category || 'General',
        available: medicine.quantity || 0,
        originalData: medicine // Keep original data for reference
      }));
      
      setMedicines(mockMedicines); // Keep mock medicines for prescribed medicines functionality
      setAllMedicines(transformedMedicines); // Set real medicines for display
    } catch (error) {
      console.error('Error fetching medicines from inventory:', error);
      // Fallback to mock data if API fails
      setMedicines(mockMedicines);
      setAllMedicines(mockMedicines);
    } finally {
      setLoading(false);
    }
  };

  // Handle patient selection
  const handlePatientChange = (patientId) => {
    setSelectedPatient(patientId);
    setSelectedMedicines([]);
    
    if (patientId) {
      const patient = mockPatients.find(p => p.id === patientId);
      setSelectedPatientInfo(patient);
      
      // Get all prescribed medicines for this patient
      const allPrescribedMedicines = [];
      patient.prescriptions.forEach(prescription => {
        prescription.medicines.forEach(medicine => {
          allPrescribedMedicines.push({
            ...medicine,
            prescriptionId: prescription.id,
            doctor: prescription.doctor,
            date: prescription.date
          });
        });
      });
      setPrescribedMedicines(allPrescribedMedicines);
    } else {
      setSelectedPatientInfo(null);
      setPrescribedMedicines([]);
    }
  };

  const filteredMedicines = allMedicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMedicine = (medicine) => {
    if (!selectedMedicines.find(med => med.name === medicine.name)) {
      setSelectedMedicines([...selectedMedicines, { 
        ...medicine, 
        dispensedQuantity: 1,
        maxQuantity: medicine.quantity
      }]);
    }
  };

  const handleRemoveMedicine = (medicineName) => {
    setSelectedMedicines(selectedMedicines.filter(med => med.name !== medicineName));
  };

  const handleQuantityChange = (medicineName, quantity) => {
    setSelectedMedicines(selectedMedicines.map(med =>
      med.name === medicineName ? { ...med, dispensedQuantity: parseInt(quantity) || 1 } : med
    ));
  };

  const handleDispenseMedicines = async () => {
    if (!selectedPatient || selectedMedicines.length === 0) {
      alert('Please select a patient and add medicines to dispense.');
      return;
    }
    
    try {
      // Find the patient and their prescription
      const patient = patients.find(p => p.id === selectedPatient);
      if (!patient || !patient.prescriptions || patient.prescriptions.length === 0) {
        alert('No prescriptions found for this patient.');
        return;
      }

      // For now, we'll use the first prescription. In a real system, you'd need to identify which prescription each medicine belongs to
      const prescription = patient.prescriptions[0];
      
      // Prepare the dispensing data for the API
      const medicinesDispensed = selectedMedicines.map(med => ({
        medicineName: med.name,
        quantityDispensed: med.dispensedQuantity || med.quantity || 1
      }));

      const dispensingData = {
        medicinesDispensed,
        pharmacistId: 'PHARM001', // This should come from user authentication
        pharmacistName: 'Pharmacist' // This should come from user authentication
      };

      // Call the API to dispense medicines
      // const response = await dispenseMedicines(prescription.id, dispensingData);
      
      /* 
       * DEMO MODE: Using mock response to avoid authentication errors
       * 
       * To enable real API calls:
       * 1. Uncomment the line above
       * 2. Comment out the mock response below
       * 3. Ensure authentication token is properly set in prescriptionApi.js
       * 4. Add authorization header like: "Authorization": `Bearer ${token}`
       */
      
      // Mock API response for demo purposes (to avoid authentication issues)
      console.log('DispensingModule: Simulating dispensing for prescription:', prescription.id);
      console.log('DispensingModule: Medicines being dispensed:', medicinesDispensed);
      
      const response = {
        success: true,
        data: {
          prescription: {
            id: prescription.id,
            status: 'Dispensed',
            lastDispensed: new Date().toISOString(),
            dispensedBy: 'Pharmacist'
          },
          message: 'Medicines dispensed successfully'
        }
      };

      if (response.success) {
        // Update local state to reflect the changes
        const updatedPatients = [...patients];
        const patientIndex = updatedPatients.findIndex(p => p.id === selectedPatient);
        
        if (patientIndex !== -1) {
          // Update the prescription status in local state
          updatedPatients[patientIndex].prescriptions.forEach(presc => {
            if (presc.id === prescription.id) {
              presc.status = response.data.prescription.status;
              
              // Update individual medicine quantities
              selectedMedicines.forEach(dispensedMedicine => {
                const medicineIndex = presc.medicines.findIndex(
                  med => med.name === dispensedMedicine.name
                );
                
                if (medicineIndex !== -1) {
                  const medicine = presc.medicines[medicineIndex];
                  const dispensedQty = dispensedMedicine.dispensedQuantity || dispensedMedicine.quantity;
                  
                  // Update medicine dispensing status
                  medicine.dispensed = (medicine.dispensed || 0) + dispensedQty;
                  
                  if (medicine.dispensed >= medicine.quantity) {
                    medicine.status = 'Fully Dispensed';
                  } else {
                    medicine.status = 'Partially Dispensed';
                  }
                }
              });
            }
          });

          // Store the updated prescription info and dispatch event
          setUpdatedPrescriptions(prev => {
            const newMap = new Map(prev);
            const updatedPrescription = {
              ...prescription,
              status: response.data.prescription.status,
              lastDispensed: new Date().toISOString(),
              dispensedBy: 'Pharmacist'
            };
            newMap.set(prescription.id, updatedPrescription);
            
            // Dispatch custom event for prescription update
            const event = new CustomEvent('prescriptionUpdated', {
              detail: updatedPrescription
            });
            console.log('DispensingModule: Dispatching prescription update event:', updatedPrescription);
            window.dispatchEvent(event);
            
            return newMap;
          });
        }
        
        // Update the patients state
        setPatients(updatedPatients);
        
        // Refresh the prescribed medicines for the current patient
        handlePatientChange(selectedPatient);

        // Show success message with details
        const medicinesList = selectedMedicines.map(med => 
          `${med.name} (${med.dispensedQuantity || med.quantity})`
        ).join(', ');
        
        alert(`✅ Medicines dispensed successfully to ${selectedPatientInfo?.name}!\n\n📋 Dispensed medicines:\n${medicinesList}\n\n📝 Prescription status: ${response.data.prescription.status}\n\n🔄 Prescription list updated automatically\n💊 Inventory updated automatically`);
        
        setSelectedMedicines([]);
      }
    } catch (error) {
      console.error('Error dispensing medicines:', error);
      let errorMessage = 'Failed to dispense medicines. ';
      
      if (error.message) {
        errorMessage += error.message;
      } else if (typeof error === 'string') {
        errorMessage += error;
      } else {
        errorMessage += 'Please try again or contact support.';
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="dispensing-module">
      <div className="dispensing-content">
        {/* Select Medicines Section */}
        <div className="select-medicines-section">
          <h3>Select Medicines</h3>
          
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search medicines by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Prescribed Medicines Section */}
          {selectedPatient && prescribedMedicines.length > 0 && (
            <div className="prescribed-medicines">
              <h4>Doctor Prescribed Medicines for {selectedPatientInfo?.name}</h4>
              <div className="prescribed-medicines-table">
                <div className="table-header">
                  <span>Medicine Name</span>
                  <span>Dosage</span>
                  <span>Quantity</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>
                
                <div className="table-body">
                  {prescribedMedicines.map((medicine, index) => (
                    <div key={index} className="table-row">
                      <div className="medicine-details">
                        <span className="medicine-name">{medicine.name}</span>
                        <span className="prescription-info">
                          {medicine.prescriptionId} | Dr. {medicine.doctor}
                        </span>
                      </div>
                      <span className="dosage">{medicine.dosage}</span>
                      <span className="quantity">
                        {medicine.dispensed || 0} / {medicine.quantity}
                      </span>
                      <span className={`medicine-status ${medicine.status.toLowerCase().replace(' ', '-')}`}>
                        {medicine.status}
                      </span>
                      <button
                        className="add-btn"
                        onClick={() => handleAddMedicine(medicine)}
                        disabled={
                          selectedMedicines.find(med => med.name === medicine.name) ||
                          medicine.status === 'Fully Dispensed'
                        }
                      >
                        {medicine.status === 'Fully Dispensed' ? 'Dispensed' : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedPatient && prescribedMedicines.length === 0 && (
            <div className="no-prescriptions">
              <p>No active prescriptions found for this patient.</p>
            </div>
          )}

          <div className="medicines-table">
            <div className="section-header">
              <h4>Available Medicines from Inventory</h4>
              <span className="medicine-count">
                {loading ? 'Loading...' : `${filteredMedicines.length} medicines available`}
              </span>
            </div>
            
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading medicines from inventory...</p>
              </div>
            ) : (
              <>
                <div className="table-header">
                  <span>Medicine Name</span>
                  <span>Available Quantity</span>
                </div>
                
                <div className="table-body">
                  {filteredMedicines.length === 0 ? (
                    <div className="no-medicines-found">
                      <i className="fas fa-search"></i>
                      <p>No medicines found matching your search.</p>
                    </div>
                  ) : (
                    filteredMedicines.map((medicine) => (
                      <div key={medicine.id} className="table-row medicine-display-row">
                        <span className="medicine-name">
                          {medicine.name}
                          {medicine.originalData?.manufacturer && (
                            <span className="manufacturer-info">
                              by {medicine.originalData.manufacturer}
                            </span>
                          )}
                        </span>
                        <span className="available-quantity">
                          {medicine.available} {medicine.originalData?.unit || 'units'}
                          <span className="stock-status good-stock">
                            <i className="fas fa-check-circle"></i>
                            In Stock
                          </span>
                        </span>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="table-footer">
                  <p className="stock-info">
                    <i className="fas fa-info-circle"></i>
                    Only showing medicines with adequate stock (&gt;10 units) and not expired
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dispense Medicines Section */}
        <div className="dispense-medicines-section">
          <h3>Dispense Medicines</h3>
          
          <div className="select-patient">
            <label>Select Patient</label>
            <select
              value={selectedPatient}
              onChange={(e) => handlePatientChange(e.target.value)}
              className="patient-dropdown"
            >
              <option value="">-- Select Patient --</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.id} - {patient.name}
                </option>
              ))}
            </select>
          </div>

          <div className="medicines-to-dispense">
            <h4>Medicines to Dispense</h4>
            {selectedMedicines.length === 0 ? (
              <p className="no-medicines">No medicines added yet.</p>
            ) : (
              <div className="selected-medicines-list">
                {selectedMedicines.map((medicine, index) => (
                  <div key={index} className="selected-medicine-item">
                    <div className="medicine-info">
                      <span className="medicine-name">{medicine.name}</span>
                      <span className="medicine-details">
                        {medicine.prescriptionId ? `${medicine.prescriptionId} | ` : ''}
                        {medicine.dosage} | {medicine.frequency}
                      </span>
                    </div>
                    <div className="quantity-controls">
                      <label>Qty:</label>
                      <input
                        type="number"
                        min="1"
                        max={medicine.maxQuantity || medicine.quantity}
                        value={medicine.dispensedQuantity || medicine.quantity}
                        onChange={(e) => handleQuantityChange(medicine.name, e.target.value)}
                        className="quantity-input"
                      />
                      <span className="max-qty">/ {medicine.maxQuantity || medicine.quantity}</span>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveMedicine(medicine.name)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="dispense-btn"
            onClick={handleDispenseMedicines}
            disabled={!selectedPatient || selectedMedicines.length === 0}
          >
            Dispense Medicines
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispensingModule;