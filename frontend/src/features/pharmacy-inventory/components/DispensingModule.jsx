import React, { useState, useEffect } from 'react';
import axios from 'axios';
import prescriptionsApi from '../../../api/prescriptionsApi';
import { emitPrescriptionUpdated, setDispenseOverride, getDispenseOverride } from '../../../utils/prescriptionEvents';
// import { dispenseMedicines } from '../api/prescriptionApi'; // Commented out for demo - using mock data
import '../../../styles/DispensingModule.css';

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

  // Load patients from current prescriptions
  useEffect(() => {
    const loadPatientsFromPrescriptions = async () => {
      try {
        const res = await prescriptionsApi.list();
        const raw = Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || []);
        // Build unique list of patients who have prescriptions
        const map = new Map();
        raw.forEach((d) => {
          const pid = d.patient_ID || d.patientId || d.patient?.id || d.patient?.code || '';
          const pname = d.patient_name || d.patientName || d.patient?.name || '';
          if (pid && pname && !map.has(pid)) {
            map.set(pid, { id: pid, name: pname });
          }
        });
        setPatients(Array.from(map.values()));
      } catch (e) {
        console.error('Failed to load patients from prescriptions', e);
        setPatients([]);
      }
    };
    loadPatientsFromPrescriptions();
  }, []);

  useEffect(() => {
    fetchMedicinesFromInventory();
  }, []);

  // Fetch real medicines from inventory API
  const fetchMedicinesFromInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/medicines');
      const medicinesData = response.data.data || [];
      
      // Filter to medicines with OK status (align with Medicine Inventory):
      // OK = not expired AND quantity > reorderLevel (fallback to 10 if missing)
      const availableMedicines = medicinesData.filter(medicine => {
        const qty = Number(medicine.quantity ?? 0);
        const reorder = Number(
          medicine.reorderLevel === undefined || medicine.reorderLevel === null || isNaN(medicine.reorderLevel)
            ? 10
            : medicine.reorderLevel
        );
        const notExpired = !medicine.expiryDate || new Date(medicine.expiryDate) >= new Date();
        const okStatus = qty > reorder;
        return notExpired && okStatus;
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
  const handlePatientChange = async (patientId) => {
    setSelectedPatient(patientId);
    setSelectedMedicines([]);

    if (!patientId) {
      setSelectedPatientInfo(null);
      setPrescribedMedicines([]);
      return;
    }

    const pInfo = patients.find((p) => p.id === patientId) || null;
    setSelectedPatientInfo(pInfo);

    try {
      // Prefer by-patient API if available; otherwise filter the full list
      const byPatient = await prescriptionsApi.listByPatient(patientId).catch(() => null);
      let list = [];
      if (byPatient && (Array.isArray(byPatient.data) || Array.isArray(byPatient.data?.items))) {
        list = Array.isArray(byPatient.data) ? byPatient.data : byPatient.data.items;
      } else {
        const res = await prescriptionsApi.list();
        const raw = Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || []);
        list = raw.filter((d) => (d.patient_ID || d.patientId || d.patient?.id || d.patient?.code) === patientId);
      }

      const normalized = list.map((d) => {
        const meds = Array.isArray(d.Medicines)
          ? d.Medicines.map((m) => ({
              name: m.Medicine_Name || m.name || '',
              dosage: m.Dosage || m.dosage || '',
              frequency: m.Frequency || m.frequency || '',
              quantity: m.Quantity || m.quantity || 0,
              duration: m.Duration || m.duration || '',
              dispensed: 0,
              status: 'Not Dispensed',
            }))
          : [];
        return {
          id: (d._id || d.id || '').toString(),
          doctor: d.doctor_Name || d.doctorName || d.doctor?.name || 'Doctor',
          date: d.Date ? new Date(d.Date).toISOString().slice(0, 10) : '',
          medicines: meds,
        };
      });

      const flattened = [];
      normalized.forEach((pres) => {
        pres.medicines.forEach((m) => {
          const override = getDispenseOverride(pres.id, m.name);
          flattened.push({
            ...m,
            dispensed: override?.dispensed ?? m.dispensed ?? 0,
            status: override?.status ?? m.status ?? 'Not Dispensed',
            prescriptionId: pres.id,
            doctor: pres.doctor,
            date: pres.date,
          });
        });
      });
      setPrescribedMedicines(flattened);
    } catch (e) {
      console.error('Failed to load prescriptions for patient', patientId, e);
      setPrescribedMedicines([]);
    }
  };

  const filteredMedicines = allMedicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMedicine = (medicine) => {
    if (!selectedMedicines.find(med => med.name === medicine.name)) {
      const total = Number(medicine.quantity || 0);
      const already = Number(medicine.dispensed || 0);
      const remaining = Math.max(0, total - already);
      setSelectedMedicines([...selectedMedicines, { 
        ...medicine, 
        // default to 1 but cap by remaining
        dispensedQuantity: remaining > 0 ? Math.min(1, remaining) : 0,
        maxQuantity: remaining || 0
      }]);
    }
  };

  const handleRemoveMedicine = (medicineName) => {
    setSelectedMedicines(selectedMedicines.filter(med => med.name !== medicineName));
  };

  const handleQuantityChange = (medicineName, quantity) => {
    setSelectedMedicines(selectedMedicines.map(med => {
      if (med.name !== medicineName) return med;
      const maxQ = Number(med.maxQuantity || med.quantity || 1);
      const val = Math.max(1, Math.min(maxQ, parseInt(quantity) || 1));
      return { ...med, dispensedQuantity: val };
    }));
  };

  const increaseQuantity = (medicineName) => {
    setSelectedMedicines(selectedMedicines.map(med => {
      if (med.name !== medicineName) return med;
      const maxQ = Number(med.maxQuantity || med.quantity || 1);
      const val = Math.min(maxQ, Number(med.dispensedQuantity || 1) + 1);
      return { ...med, dispensedQuantity: val };
    }));
  };

  const decreaseQuantity = (medicineName) => {
    setSelectedMedicines(selectedMedicines.map(med => {
      if (med.name !== medicineName) return med;
      const val = Math.max(1, Number(med.dispensedQuantity || 1) - 1);
      return { ...med, dispensedQuantity: val };
    }));
  };

  const handleDispenseMedicines = async () => {
    if (!selectedPatient || selectedMedicines.length === 0) {
      alert('Please select a patient and add medicines to dispense.');
      return;
    }

    try {
      // Group by prescriptionId to simulate per-prescription dispensing
      const groups = selectedMedicines.reduce((acc, m) => {
        const pid = m.prescriptionId || 'unknown';
        acc[pid] = acc[pid] || [];
        acc[pid].push(m);
        return acc;
      }, {});

      const summary = [];
      for (const [prescriptionId, meds] of Object.entries(groups)) {
        const medicinesDispensed = meds.map(med => ({
          medicineName: med.name,
          quantityDispensed: med.dispensedQuantity || med.quantity || 1,
        }));

        // Simulate success
        const response = {
          success: true,
          data: {
            prescription: {
              id: prescriptionId,
              status: 'Dispensed',
              lastDispensed: new Date().toISOString(),
              dispensedBy: 'Pharmacist',
            },
          },
        };

        if (response.success) {
          // Update local prescribedMedicines entries
          setPrescribedMedicines(prev => prev.map(pm => {
            const match = meds.find(m => (m.name === pm.name) && ((m.prescriptionId || 'unknown') === (pm.prescriptionId || 'unknown')));
            if (!match) return pm;
            const dispensedQty = match.dispensedQuantity || match.quantity || 1;
            const newDispensed = (pm.dispensed || 0) + dispensedQty;
            const newStatus = newDispensed >= pm.quantity ? 'Fully Dispensed' : 'Partially Dispensed';
            // persist override so reselecting patient retains status
            setDispenseOverride(pm.prescriptionId, pm.name, { dispensed: newDispensed, status: newStatus });
            return { ...pm, dispensed: newDispensed, status: newStatus };
          }));

          setUpdatedPrescriptions(prev => {
            const newMap = new Map(prev);
            const updatedPrescription = {
              id: prescriptionId,
              status: response.data.prescription.status,
              lastDispensed: new Date().toISOString(),
              dispensedBy: 'Pharmacist',
            };
            newMap.set(prescriptionId, updatedPrescription);
            // Broadcast to whole app and persist override
            emitPrescriptionUpdated(updatedPrescription);
            return newMap;
          });

          summary.push(`Prescription ${prescriptionId}: ${meds.map(m => `${m.name} (${m.dispensedQuantity || m.quantity})`).join(', ')}`);
        }
      }

      setSelectedMedicines([]);
      alert(`✅ Medicines dispensed successfully to ${selectedPatientInfo?.name} (ID: ${selectedPatient}).\n\n${summary.join('\n')}`);
    } catch (error) {
      console.error('Error dispensing medicines:', error);
      alert(`Failed to dispense medicines. ${error?.message || ''}`);
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
                    Showing medicines with OK status: not expired and quantity above reorder level
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
                      <div className="medicine-meta-row">
                        {medicine.prescriptionId && (
                          <span className="pill pill-id" title={medicine.prescriptionId}>
                            {String(medicine.prescriptionId).slice(0, 8)}
                          </span>
                        )}
                        {medicine.doctor && (
                          <span className="pill pill-doctor">Dr. {medicine.doctor}</span>
                        )}
                        {medicine.duration && (
                          <span className="pill pill-duration">{medicine.duration}</span>
                        )}
                      </div>
                      <span className="medicine-details">
                        {medicine.dosage} | {medicine.frequency}
                      </span>
                      <span className="remaining-info">
                        Remaining: {Math.max(0, (medicine.maxQuantity ?? medicine.quantity ?? 0))} of {medicine.quantity || 0}
                      </span>
                    </div>
                    <div className="quantity-controls">
                      <label>Qty</label>
                      <div className="quantity-stepper">
                        <button type="button" className="qty-btn" onClick={() => decreaseQuantity(medicine.name)}>-</button>
                        <input
                          type="number"
                          min="1"
                          max={medicine.maxQuantity || medicine.quantity}
                          value={medicine.dispensedQuantity || 1}
                          onChange={(e) => handleQuantityChange(medicine.name, e.target.value)}
                          className="quantity-input"
                        />
                        <button type="button" className="qty-btn" onClick={() => increaseQuantity(medicine.name)}>+</button>
                      </div>
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