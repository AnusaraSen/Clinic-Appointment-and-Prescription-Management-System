import React, { useState, useEffect } from 'react';
import { useHideNavbar } from '../../../shared/hooks/useHideNavbar';

const PatientSearchModal = ({ isOpen, onClose, onSelectPatient }) => {
  useHideNavbar(isOpen);
  
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);

  // Load all patients when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPatients();
    }
  }, [isOpen]);

  // Filter patients based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/patients/search');
      if (response.ok) {
        const data = await response.json();
        console.log('Patients loaded:', data);
        // Handle the response - search endpoint returns both 'patients' and 'data' arrays
        const patientsData = data.patients || data.data || [];
        
        setPatients(patientsData);
        setFilteredPatients(patientsData);
      } else {
        console.error('Failed to load patients');
        setPatients([]);
        setFilteredPatients([]);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient) => {
    onSelectPatient(patient);
    onClose();
    setSearchTerm('');
  };

  const handleClose = () => {
    onClose();
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Select Patient</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name or patient ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        {/* Patient List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              {searchTerm ? 'No patients found matching your search.' : 'No patients available.'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPatients.map((patient) => (
                <div
                  key={patient._id}
                  onClick={() => handleSelectPatient(patient)}
                  className="p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="font-medium text-gray-800">{patient.name}</div>
                  <div className="text-sm text-gray-600">ID: {patient.patient_id}</div>
                  {patient.email && (
                    <div className="text-sm text-gray-500">{patient.email}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientSearchModal;