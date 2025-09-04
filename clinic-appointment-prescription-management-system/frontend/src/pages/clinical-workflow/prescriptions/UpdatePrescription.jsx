import React, { useState, useEffect } from 'react';
import '../../../styles/clinical-workflow/UpdatePrescription.css';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAlert } from './AlertProvider.jsx';

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
        axios.put(`http://localhost:5000/prescription/update/${id}`, formData)
            .then(() => {
                pushAlert("Prescription updated","success");
                navigate("/get");
            })
            .catch((err) => {
                console.error("Update error:", err);
                pushAlert("Error updating prescription","error");
            });
    };

    if (isLoading) {
        return <div className="text-center mt-5">Loading prescription data...</div>;
    }

    return (
        <div className="ap-form-wrapper">
            <h1 className="mb-4">Update Prescription</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Patient ID</label>
                    <input type="text" name="patient_ID" className="form-control" value={formData.patient_ID} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Patient Name</label>
                    <input type="text" name="patient_name" className="form-control" value={formData.patient_name} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Doctor Name</label>
                    <input type="text" name="doctor_Name" className="form-control" value={formData.doctor_Name} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Date</label>
                    <input type="date" name="Date" className="form-control" value={formData.Date} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Diagnosis</label>
                    <input type="text" name="Diagnosis" className="form-control" value={formData.Diagnosis} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Symptoms</label>
                    <input type="text" name="Symptoms" className="form-control" value={formData.Symptoms} onChange={handleChange} />
                </div>

                <h4 className="ap-section-title">Medicines</h4>
                {formData.Medicines.map((med, index) => (
                    <div key={index} className="ap-medicine-block">
                        <div className="mb-2">
                            <label>Medicine Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={med.Medicine_Name}
                                onChange={(e) => handleMedicineChange(index, "Medicine_Name", e.target.value)}
                                required
                            />
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
                        </div>

                        {formData.Medicines.length > 1 && (
                            <button
                                type="button"
                                className="btn-ap btn-ap-remove btn-sm mt-2"
                                onClick={() => removeMedicine(index)}
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    className="btn-ap btn-ap-add mb-3"
                    onClick={addMedicine}
                >
                    Add Medicine
                </button>

                <div className="mb-3">
                    <label>Instructions</label>
                    <textarea
                        className="form-control"
                        name="Instructions"
                        value={formData.Instructions}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="btn-ap btn-ap-primary">Update Prescription</button>
            </form>
        </div>
    );
}

export default UpdatePrescription;
