import React, { useState, useEffect } from 'react';
import './DeletePrescription.css';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAlert } from './AlertProvider.jsx';

function DeletePrescription() {
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


    const handleSubmit = (e) => {
        e.preventDefault();
        axios.delete(`http://localhost:5000/prescription/delete/${id}`, formData)
            .then(() => {
                pushAlert("Prescription deleted","error");
                navigate("/prescription/all");
            })
            .catch((err) => {
                console.error("Update error:", err);
                pushAlert("Error deleting prescription","error");
            });
    };

    if (isLoading) {
        return (
            <div className="delete-prescription-container">
                <div className="dp-loading">
                    Loading prescription data...
                </div>
            </div>
        );
    }

    return (
        <div className="delete-prescription-container">
            <div className="dp-card">
                <div className="dp-header">
                    <h1 className="dp-title">Delete Prescription</h1>
                    <p className="dp-subtitle">Review prescription details before deletion</p>
                </div>

                <div className="dp-warning-box">
                    <div className="dp-warning-icon">⚠️</div>
                    <div className="dp-warning-text">Warning: This action cannot be undone!</div>
                    <div className="dp-warning-subtext">Please review the prescription details carefully before proceeding with deletion.</div>
                </div>

                <div className="dp-info-grid">
                    <div className="dp-info-row">
                        <div className="dp-info-group">
                            <label className="dp-info-label">Patient ID</label>
                            <div className="dp-info-value">{formData.patient_ID || 'N/A'}</div>
                        </div>
                        <div className="dp-info-group">
                            <label className="dp-info-label">Patient Name</label>
                            <div className="dp-info-value">{formData.patient_name || 'N/A'}</div>
                        </div>
                    </div>

                    <div className="dp-info-row">
                        <div className="dp-info-group">
                            <label className="dp-info-label">Doctor Name</label>
                            <div className="dp-info-value">{formData.doctor_Name || 'N/A'}</div>
                        </div>
                        <div className="dp-info-group">
                            <label className="dp-info-label">Date</label>
                            <div className="dp-info-value">{formData.Date ? new Date(formData.Date).toLocaleDateString() : 'N/A'}</div>
                        </div>
                    </div>

                    <div className="dp-info-row">
                        <div className="dp-info-group">
                            <label className="dp-info-label">Diagnosis</label>
                            <div className="dp-info-value">{formData.Diagnosis || 'N/A'}</div>
                        </div>
                        <div className="dp-info-group">
                            <label className="dp-info-label">Symptoms</label>
                            <div className={`dp-info-value ${!formData.Symptoms ? 'empty' : ''}`}>
                                {formData.Symptoms || 'No symptoms recorded'}
                            </div>
                        </div>
                    </div>
                </div>

                <h5 className="dp-section-title">Prescribed Medicines</h5>
                {formData.Medicines && formData.Medicines.length > 0 ? (
                    formData.Medicines.map((med, index) => (
                        <div key={index} className="dp-medicine-block" data-medicine-number={`Medicine ${index + 1}`}>
                            <div className="dp-medicine-grid">
                                <div className="dp-medicine-item">
                                    <span className="dp-medicine-label">Medicine Name</span>
                                    <div className="dp-medicine-value">{med.Medicine_Name || 'N/A'}</div>
                                </div>
                                <div className="dp-medicine-item">
                                    <span className="dp-medicine-label">Dosage</span>
                                    <div className="dp-medicine-value">{med.Dosage || 'N/A'}</div>
                                </div>
                                <div className="dp-medicine-item">
                                    <span className="dp-medicine-label">Frequency</span>
                                    <div className="dp-medicine-value">{med.Frequency || 'N/A'}</div>
                                </div>
                                <div className="dp-medicine-item">
                                    <span className="dp-medicine-label">Duration</span>
                                    <div className="dp-medicine-value">{med.Duration || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="dp-info-group">
                        <div className="dp-info-value empty">No medicines prescribed</div>
                    </div>
                )}

                {formData.Instructions && (
                    <div className="dp-info-group" style={{ marginTop: '2rem' }}>
                        <label className="dp-info-label">Special Instructions</label>
                        <div className="dp-info-value">{formData.Instructions}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="dp-button-group">
                        <button type="button" className="btn-dp btn-dp-secondary" onClick={() => navigate("/prescription/all")}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-dp btn-dp-danger dp-delete-btn">
                            Confirm Delete
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default DeletePrescription;
