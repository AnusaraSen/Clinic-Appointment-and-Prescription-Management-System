import React, { useState, useEffect } from 'react';
import './UpdatePrescription.css';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAlert } from './AlertProvider.jsx';
import { validatePrescriptionForm, formatValidationErrors } from '../../../../utils/validation';

function UpdatePrescription() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const { pushAlert } = useAlert();

    const today = new Date().toISOString().split("T")[0];

    const [formData, setFormData] = useState({
        patient_ID: "",
        patient_name: "",
        doctor_Name: "",
        Date: today,
        Diagnosis: "",
        Symptoms: "",
        Medicines: [{ Medicine_Name: "", Dosage: "", Frequency: "", Duration: "" }],
        Instructions: ""
    });
    const [errors, setErrors] = useState({});

    //Fetch prescription data by ID
    useEffect(() => {
        setIsLoading(true);
        axios.get(`http://localhost:5000/prescription/get/${id}`)
            .then((res) => {
                console.log("Fetched Prescription:", res.data.Prescription);
                const prescription = res.data.Prescription;
                setFormData({
                    patient_ID: prescription.patient_ID,
                    patient_name: prescription.patient_name,
                    doctor_Name: prescription.doctor_Name,
                    Date: new Date(prescription.Date).toISOString().split("T")[0],
                    Diagnosis: prescription.Diagnosis,
                    Symptoms: prescription.Symptoms,
                    Medicines: Array.isArray(prescription.Medicines) && prescription.Medicines.length > 0
                        ? prescription.Medicines.map(med => ({
                            Medicine_Name: med.Medicine_Name || "",
                            Dosage: med.Dosage || "",
                            Frequency: med.Frequency || "",
                            Duration: med.Duration || ""
                        }))
                        : [{ Medicine_Name: "", Dosage: "", Frequency: "", Duration: "" }],
                    Instructions: prescription.Instructions || ""
                });
                
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching prescription:", err);
                pushAlert("Failed to fetch prescription","error");
                setIsLoading(false);
            });
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMedicineChange = (index, field, value) => {
        const newMedicines = formData.Medicines.map((medicine, i) =>
            i === index ? { ...medicine, [field]: value } : medicine
        );
        setFormData(prev => ({ ...prev, Medicines: newMedicines }));
    };

    const addMedicine = () => {
        setFormData(prev => ({
            ...prev,
            Medicines: [...prev.Medicines, { Medicine_Name: "", Dosage: "", Frequency: "", Duration: "" }]
        }));
    };

    const removeMedicine = (index) => {
        setFormData(prev => ({
            ...prev,
            Medicines: prev.Medicines.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const vErrors = validatePrescriptionForm(formData);
        setErrors(vErrors);
        if(Object.keys(vErrors).length){
          const errorMessage = formatValidationErrors(vErrors);
          pushAlert(errorMessage, 'error');
          return;
        }
        axios.put(`http://localhost:5000/prescription/update/${id}`, formData)
            .then(() => {
                pushAlert("Prescription updated","success");
                navigate("/prescription/all");
            })
            .catch((err) => {
                console.error("Update error:", err);
                pushAlert(err?.response?.data?.errors?.[0]?.message || "Error updating prescription","error");
            });
    };

    if (isLoading) {
        return (
            <div className="update-prescription-container">
                <div className="up-loading">
                    Loading prescription data...
                </div>
            </div>
        );
    }

    return (
        <div className="update-prescription-container">
            <div className="up-card">
                <div className="up-header">
                    <h1 className="up-title">Update Prescription</h1>
                    <p className="up-subtitle">Modify existing prescription details</p>
                </div>

                <form onSubmit={handleSubmit} className="up-form-grid">
                    <div className="up-form-row">
                        <div className="up-form-group">
                            <label>Patient ID</label>
                            <input type="text" name="patient_ID" className="form-control" value={formData.patient_ID} onChange={handleChange} required placeholder="Enter patient ID" />
                            {errors.patient_ID && <div className="text-danger">{errors.patient_ID}</div>}
                        </div>
                        <div className="up-form-group">
                            <label>Patient Name</label>
                            <input type="text" name="patient_name" className="form-control" value={formData.patient_name} onChange={handleChange} required placeholder="Enter patient name" />
                            {errors.patient_name && <div className="text-danger">{errors.patient_name}</div>}
                        </div>
                    </div>

                    <div className="up-form-row">
                        <div className="up-form-group">
                            <label>Doctor Name</label>
                            <input type="text" name="doctor_Name" className="form-control" value={formData.doctor_Name} onChange={handleChange} required placeholder="Enter doctor name" />
                            {errors.doctor_Name && <div className="text-danger">{errors.doctor_Name}</div>}
                        </div>
                        <div className="up-form-group">
                            <label>Date</label>
                            <input type="date" name="Date" className="form-control" value={formData.Date} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="up-form-row">
                        <div className="up-form-group">
                            <label>Diagnosis</label>
                            <input type="text" name="Diagnosis" className="form-control" value={formData.Diagnosis} onChange={handleChange} required placeholder="Enter diagnosis" />
                            {errors.Diagnosis && <div className="text-danger">{errors.Diagnosis}</div>}
                        </div>
                        <div className="up-form-group">
                            <label>Symptoms</label>
                            <input type="text" name="Symptoms" className="form-control" value={formData.Symptoms} onChange={handleChange} placeholder="Enter symptoms (optional)" />
                        </div>
                    </div>

                    <h5 className="up-section-title">Medicines Information</h5>
                    {formData.Medicines.map((med, index) => (
                        <div key={index} className="up-medicine-block" data-medicine-number={`Medicine ${index + 1}`}>
                            <div className="up-medicine-grid">
                                <div className="up-form-group">
                                    <label>Medicine Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={med.Medicine_Name}
                                        onChange={(e) => handleMedicineChange(index, "Medicine_Name", e.target.value)}
                                        required
                                        placeholder="Enter medicine name"
                                    />
                                    {errors[`Medicines[${index}].Medicine_Name`] && <div className="text-danger">{errors[`Medicines[${index}].Medicine_Name`]}</div>}
                                </div>

                                <div className="up-form-group">
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

                                <div className="up-form-group">
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

                                <div className="up-form-group">
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

                            {formData.Medicines.length > 1 && (
                                <button
                                    type="button"
                                    className="btn-up btn-up-danger btn-sm"
                                    onClick={() => removeMedicine(index)}
                                >
                                    Remove Medicine
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        type="button"
                        className="btn-up btn-up-add"
                        onClick={addMedicine}
                    >
                        Add Another Medicine
                    </button>

                    <div className="up-form-row single">
                        <div className="up-form-group">
                            <label>Special Instructions</label>
                            <textarea
                                className="form-control"
                                name="Instructions"
                                value={formData.Instructions}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Enter any special instructions for the patient..."
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button type="submit" className="btn-up btn-up-primary up-submit-btn">Update Prescription</button>
                        <button type="button" className="btn-up btn-up-danger" onClick={() => navigate('/prescription/all')}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdatePrescription;
