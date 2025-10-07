import React, { useState, useEffect } from "react";
import '../../../../styles/clinical-workflow/AddPrescription.css';
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import { useAlert } from './AlertProvider.jsx';
import { validatePrescriptionForm, formatValidationErrors } from '../../../../utils/validation';
import { useAuth } from '../../../../features/authentication/context/AuthContext.jsx';

function AddPrescription() {
  const today = new Date().toISOString().split("T")[0];

  const [pName, setPName] = useState("");
  const [pId, setPId] = useState("");
  const [dName, setDName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [date, setDate] = useState(today);
  const [symptoms, setSymptoms] = useState("");
  const [instructions, setInstructions] = useState("");
  const [patients, setPatients] = useState([]); // list of {patient_ID, patient_name}
  const [loadingPatients, setLoadingPatients] = useState(false);

  const [medicines, setMedicines] = useState([
    { Medicine_Name: "", Dosage: "", Frequency: "", Duration: "" }
  ]);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { pushAlert } = useAlert();
  const { user } = useAuth();

  // Derive doctor display name from user object
  useEffect(() => {
    if (user) {
      // Derive raw name
      let base = user.fullName || user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || '';
      base = base.replace(/[^A-Za-z .'-]/g,' ').replace(/\s+/g,' ').trim();
      if(base.toLowerCase().startsWith('dr. ')) base = base.slice(4).trim(); // remove existing Dr. to avoid duplication
      const prefixed = base ? `Dr. ${base}` : '';
      if (prefixed && prefixed !== dName) setDName(prefixed);
    } else if (dName) {
      setDName("");
    }
  }, [user]);

  // Fetch patients for dropdown
  useEffect(() => {
    setLoadingPatients(true);
    axios.get('http://localhost:5000/patient/get')
      .then(res => {
        setPatients(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        pushAlert(err?.message || 'Failed to load patients list','error');
      })
      .finally(()=> setLoadingPatients(false));
  }, [pushAlert]);

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

  const addMedicine = () => {
    setMedicines([...medicines, { Medicine_Name: "", Dosage: "", Frequency: "", Duration: "" }]);
  };

  const removeMedicine = (index) => {
    const updated = [...medicines];
    updated.splice(index, 1);
    setMedicines(updated);
  };

  function sendData(e) {
    e.preventDefault();
    const vErrors = validatePrescriptionForm({
      patient_ID: pId,
      patient_name: pName,
      doctor_Name: dName,
      Medicines: medicines,
      Date: date,
      Diagnosis: diagnosis,
      Symptoms: symptoms,
      Instructions: instructions
    });
    setErrors(vErrors);
    if(Object.keys(vErrors).length){
      const errorMessage = formatValidationErrors(vErrors);
      pushAlert(errorMessage, 'error');
      return;
    }

    const newPrescription = {
      patient_ID: pId,
      patient_name: pName,
      doctor_Name: dName,
      Medicines: medicines,
      Date: date,
      Diagnosis: diagnosis,
      Symptoms: symptoms,
      Instructions: instructions,
    };

    axios.post("http://localhost:5000/prescription/add", newPrescription)
      .then(() => {
        pushAlert("Prescription created","info");
        navigate("/prescription/all");
        setPName(""); 
        setPId(""); 
        // Keep doctor name (still logged in) so don't clear dName
        setMedicines([{ Medicine_Name: "", Dosage: "", Frequency: "", Duration: "" }]);
        setDate(today); 
        setDiagnosis(""); 
        setSymptoms(""); 
        setInstructions("");
      })
      .catch((err) => {
        const resp = err?.response?.data;
        if(resp?.errors && Array.isArray(resp.errors)){
          // Map backend errors to local field errors shape for inline hints
          const backendFieldErrors = {};
          resp.errors.forEach(e => {
            if(e.field && e.message) backendFieldErrors[e.field] = e.message;
          });
            setErrors(prev => ({...prev, ...backendFieldErrors}));
          // Show first error prominently
          const first = resp.errors[0];
          pushAlert(`${first.field || 'Validation'}: ${first.message}`, 'error');
          console.warn('Prescription validation errors:', resp.errors);
        } else {
          pushAlert(resp?.message || 'Failed to add prescription','error');
        }
      });
  }

  return (
    <div className="ap-form-wrapper">
      <h2>Add New Prescription</h2>
      <form onSubmit={sendData}>
        <div className="ap-form-grid">
          <div className="ap-form-row">
            <div className="ap-form-group">
              <label>Patient ID</label>
              <select
                className="form-select"
                value={pId}
                required
                onChange={(e) => {
                  const val = e.target.value;
                  setPId(val);
                  const match = patients.find(p => p.patient_ID === val);
                  if (match) setPName(match.patient_name || '');
                }}
              >
                <option value="">{loadingPatients ? 'Loading patients...' : 'Select Patient ID'}</option>
                {patients.map(p => (
                  <option key={p._id || p.patient_ID} value={p.patient_ID}>{p.patient_ID}</option>
                ))}
              </select>
              {errors.patient_ID && <div className="text-danger">{errors.patient_ID}</div>}
              {!loadingPatients && !patients.length && <div className="text-warning" style={{fontSize:'0.8rem'}}>No patients found. Add a patient first.</div>}
            </div>

            <div className="ap-form-group">
              <label>Patient Name</label>
              <input
                type="text"
                value={pName}
                required
                readOnly
                className="form-control"
                placeholder={pId ? 'Auto-filled' : 'Select a patient ID first'}
                style={{ background:'#f3f6f8', cursor:'not-allowed' }}
              />
              {errors.patient_name && <div className="text-danger">{errors.patient_name}</div>}
            </div>
          </div>

          <div className="ap-form-row">
            <div className="ap-form-group">
              <label>Doctor Name</label>
              <input
                type="text"
                value={dName}
                required
                readOnly
                className="form-control"
                placeholder={user ? 'Auto-filled from your profile' : 'Login required'}
                style={{ background:'#f3f6f8', cursor:'not-allowed' }}
              />
              {errors.doctor_Name && <div className="text-danger">{errors.doctor_Name}</div>}
              {!dName && <div style={{fontSize:'0.7rem', color:'#666'}}>Doctor name will appear after login.</div>}
            </div>

            <div className="ap-form-group">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-control" />
            </div>
          </div>

          <div className="ap-form-row single">
            <div className="ap-form-group">
              <label>Diagnosis</label>
              <input type="text" value={diagnosis} required onChange={(e) => setDiagnosis(e.target.value)} className="form-control" placeholder="Enter diagnosis" />
              {errors.Diagnosis && <div className="text-danger">{errors.Diagnosis}</div>}
            </div>
          </div>

          <div className="ap-form-row single">
            <div className="ap-form-group">
              <label>Symptoms</label>
              <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} className="form-control" rows="3" placeholder="Describe symptoms..." />
            </div>
          </div>
        </div>

        <h5 className="ap-section-title">💊 Medicines Information</h5>
        {medicines.map((med, index) => (
          <div key={index} className="ap-medicine-block" data-medicine-number={`Medicine ${index + 1}`}>
            <div className="ap-medicine-grid">
              <div className="ap-form-group">
                <label>Medicine Name</label>
                <input type="text" className="form-control" value={med.Medicine_Name}
                  onChange={(e) => handleMedicineChange(index, "Medicine_Name", e.target.value)} required placeholder="Enter medicine name" />
                {errors[`Medicines[${index}].Medicine_Name`] && <div className="text-danger">{errors[`Medicines[${index}].Medicine_Name`]}</div>}
              </div>

              <div className="ap-form-group">
                <label>Dosage</label>
                <select className="form-select" value={med.Dosage}
                  onChange={(e) => handleMedicineChange(index, "Dosage", e.target.value)} required>
                  <option value="">Select Dosage</option>
                  <option value="1/2">Half (1/2)</option>
                  <option value="1">One (1)</option>
                  <option value="1 1/2">One and Half (1 1/2)</option>
                  <option value="2">Two (2)</option>
                  <option value="2 1/2">Two and Half (2 1/2)</option>
                  <option value="3">Three (3)</option>
                  <option value="4">Four (4)</option>
                </select>
                {errors[`Medicines[${index}].Dosage`] && <div className="text-danger">{errors[`Medicines[${index}].Dosage`]}</div>}
              </div>

              <div className="ap-form-group">
                <label>Frequency</label>
                <select className="form-select" value={med.Frequency}
                  onChange={(e) => handleMedicineChange(index, "Frequency", e.target.value)} required>
                  <option value="">Select Frequency</option>
                  <option value="1 hour">Every 1 Hour</option>
                  <option value="2 hours">Every 2 Hours</option>
                  <option value="3 hours">Every 3 Hours</option>
                  <option value="4 hours">Every 4 Hours</option>
                  <option value="5 hours">Every 5 Hours</option>
                  <option value="6 hours">Every 6 Hours</option>
                  <option value="8 hours">Every 8 Hours</option>
                  <option value="10 hours">Every 10 Hours</option>
                  <option value="12 hours">Every 12 Hours</option>
                </select>
                {errors[`Medicines[${index}].Frequency`] && <div className="text-danger">{errors[`Medicines[${index}].Frequency`]}</div>}
              </div>

              <div className="ap-form-group">
                <label>Duration</label>
                <select className="form-select" value={med.Duration}
                  onChange={(e) => handleMedicineChange(index, "Duration", e.target.value)} required>
                  <option value="">Select Duration</option>
                  <option value="1 day">1 Day</option>
                  <option value="2 days">2 Days</option>
                  <option value="3 days">3 Days</option>
                  <option value="4 days">4 Days</option>
                  <option value="5 days">5 Days</option>
                  <option value="6 days">6 Days</option>
                  <option value="7 days">1 Week</option>
                  <option value="8 days">8 Days</option>
                  <option value="9 days">9 Days</option>
                  <option value="10 days">10 Days</option>
                  <option value="2 weeks">2 Weeks</option>
                  <option value="3 weeks">3 Weeks</option>
                  <option value="1 month">1 Month</option>
                  <option value="2 months">2 Months</option>
                  <option value="3 months">3 Months</option>
                  <option value="6 months">6 Months</option>
                </select>
                {errors[`Medicines[${index}].Duration`] && <div className="text-danger">{errors[`Medicines[${index}].Duration`]}</div>}
              </div>
            </div>

            {medicines.length > 1 && (
              <button type="button" className="btn-ap btn-ap-danger btn-sm" onClick={() => removeMedicine(index)}>
                🗑️ Remove Medicine
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn-ap btn-ap-add" onClick={addMedicine}>
          ➕ Add Another Medicine
        </button>

        <div className="ap-form-row single">
          <div className="ap-form-group">
            <label>📝 Special Instructions</label>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} className="form-control" rows="4" placeholder="Enter any special instructions for the patient..." />
          </div>
        </div>

        <button type="submit" className="btn-ap btn-ap-primary ap-submit-btn">
          ✅ Create Prescription
        </button>
      </form>
    </div>
  );
}

export default AddPrescription;
