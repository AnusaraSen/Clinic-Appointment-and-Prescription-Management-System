import React, { useState } from "react";
import '../../../styles/clinical-workflow/AddPrescription.css';
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import { useAlert } from './AlertProvider.jsx';
import { validatePrescriptionForm } from '../../../utils/validation';

function AddPrescription() {
  const today = new Date().toISOString().split("T")[0];

  const [pName, setPName] = useState("");
  const [pId, setPId] = useState("");
  const [dName, setDName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [date, setDate] = useState(today);
  const [symptoms, setSymptoms] = useState("");
  const [instructions, setInstructions] = useState("");

  const [medicines, setMedicines] = useState([
    { Medicine_Name: "", Dosage: "", Frequency: "", Duration: "" }
  ]);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { pushAlert } = useAlert();

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
      pushAlert('Please fix validation errors','error');
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
        navigate("/get");
        setPName(""); 
        setPId(""); 
        setDName("");
        setMedicines([{ Medicine_Name: "", Dosage: "", Frequency: "", Duration: "" }]);
        setDate(today); 
        setDiagnosis(""); 
        setSymptoms(""); 
        setInstructions("");
      })
      .catch((err) => {
        pushAlert(err?.response?.data?.message || 'Failed to add prescription','error');
      });
  }

  return (
    <div className="ap-form-wrapper">
      <h2 className="mb-3">Add Prescription</h2>
      <form onSubmit={sendData}>
        <div className="mb-2">
          <label>Patient ID</label>
          <input type="text" value={pId} maxLength={12} required onChange={(e) => setPId(e.target.value)} className="form-control" />
          {errors.patient_ID && <div className="text-danger small mt-1">{errors.patient_ID}</div>}
        </div>

        <div className="mb-2">
          <label>Patient Name</label>
          <input type="text" value={pName} required onChange={(e) => setPName(e.target.value)} className="form-control" />
          {errors.patient_name && <div className="text-danger small mt-1">{errors.patient_name}</div>}
        </div>

        <div className="mb-2">
          <label>Doctor Name</label>
          <input type="text" value={dName} required onChange={(e) => setDName(e.target.value)} className="form-control" />
          {errors.doctor_Name && <div className="text-danger small mt-1">{errors.doctor_Name}</div>}
        </div>

        <div className="mb-2">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-control" />
        </div>

        <div className="mb-2">
          <label>Diagnosis</label>
          <input type="text" value={diagnosis} required onChange={(e) => setDiagnosis(e.target.value)} className="form-control" />
          {errors.Diagnosis && <div className="text-danger small mt-1">{errors.Diagnosis}</div>}
        </div>

        <div className="mb-2">
          <label>Symptoms</label>
          <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} className="form-control" />
        </div>

        <h5 className="ap-section-title">Medicines</h5>
        {medicines.map((med, index) => (
          <div key={index} className="ap-medicine-block">
            <div className="mb-2">
              <label>Medicine Name</label>
              <input type="text" className="form-control" value={med.Medicine_Name}
                onChange={(e) => handleMedicineChange(index, "Medicine_Name", e.target.value)} required />
              {errors[`Medicines[${index}].Medicine_Name`] && <div className="text-danger small mt-1">{errors[`Medicines[${index}].Medicine_Name`]}</div>}
            </div>

            <div className="mb-2">
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
              {errors[`Medicines[${index}].Dosage`] && <div className="text-danger small mt-1">{errors[`Medicines[${index}].Dosage`]}</div>}
            </div>

            <div className="mb-2">
              <label>Frequency</label>
              <select className="form-select" value={med.Frequency}
                onChange={(e) => handleMedicineChange(index, "Frequency", e.target.value)} required>
                <option value="">Select Frequency</option>
                <option value="1 hour">1 Hour</option>
                <option value="2 hours">2 Hours</option>
                <option value="3 hours">3 Hours</option>
                <option value="4 hours">4 Hours</option>
                <option value="5 hours">5 Hours</option>
                <option value="6 hours">6 Hours</option>
                <option value="8 hours">8 Hours</option>
                <option value="10 hours">10 Hours</option>
                <option value="12 hours">12 Hours</option>
              </select>
              {errors[`Medicines[${index}].Frequency`] && <div className="text-danger small mt-1">{errors[`Medicines[${index}].Frequency`]}</div>}
            </div>

            <div className="mb-2">
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
                <option value="7 days">7 Days</option>
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
              {errors[`Medicines[${index}].Duration`] && <div className="text-danger small mt-1">{errors[`Medicines[${index}].Duration`]}</div>}
            </div>

            {medicines.length > 1 && (
              <button type="button" className="btn-ap btn-ap-danger btn-sm mt-2" onClick={() => removeMedicine(index)}>Remove</button>
            )}
          </div>
        ))}
        <button type="button" className="btn-ap btn-ap-add mb-3" onClick={addMedicine}>Add Medicine</button>

        <div className="mb-3">
          <label>Instructions</label>
          <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} className="form-control" />
        </div>

  <button type="submit" className="btn-ap btn-ap-primary">Create Prescription</button>
      </form>
    </div>
  );
}

export default AddPrescription;
