import React, { useState, useEffect } from 'react';
import '../../../styles/clinical-workflow/DeletePrescription.css';
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
                navigate("/get");
            })
            .catch((err) => {
                console.error("Update error:", err);
                pushAlert("Error deleting prescription","error");
            });
    };

    if (isLoading) {
        return <div className="text-center mt-5">Loading prescription data...</div>;
    }

    return (
        <div className="ap-form-wrapper">
            <h1 className="mb-4">Delete Prescription</h1>
            <form onSubmit={handleSubmit}>
                <div className="ap-readonly-block">
                    <label>Patient ID</label>
                    <input type="text" name="patient_ID" className="form-control" value={formData.patient_ID} readOnly/>
                </div>
                <div className="ap-readonly-block">
                    <label>Patient Name</label>
                    <input type="text" name="patient_name" className="form-control" value={formData.patient_name} readOnly />
                </div>
                <div className="ap-readonly-block">
                    <label>Doctor Name</label>
                    <input type="text" name="doctor_Name" className="form-control" value={formData.doctor_Name} readOnly />
                </div>
                <div className="ap-readonly-block">
                    <label>Date</label>
                    <input type="date" name="Date" className="form-control" value={formData.Date} readOnly />
                </div>
                <div className="ap-readonly-block">
                    <label>Diagnosis</label>
                    <input type="text" name="Diagnosis" className="form-control" value={formData.Diagnosis} readOnly />
                </div>
                <div className="ap-readonly-block">
                    <label>Symptoms</label>
                    <input type="text" name="Symptoms" className="form-control" value={formData.Symptoms} readOnly />
                </div>

                <h4 className="mt-4">Medicines</h4>
                {formData.Medicines.map((med, index) => (
                    <div key={index} className="ap-readonly-block">
                        <div className="mb-2">
                            <label>Medicine Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={med.Medicine_Name}
                                readOnly
    
                            />
                        </div>

                        <div className="mb-2">
                            <label>Dosage</label>
                            <select className="form-select" value={med.Dosage}
                                readOnly required>
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
                                readOnly required>
                                <option value="">Select Frequency</option>
                                <option value="1 Hour">1 Hour</option>
                                <option value="2 Hours">2 Hours</option>
                                <option value="3 Hours">3 Hours</option>
                                <option value="4 Hours">4 Hours</option>
                                <option value="5 Hours">5 Hours</option>
                                <option value="6 Hours">6 Hours</option>
                                <option value="8 Hours">8 Hours</option>
                                <option value="10 Hours">10 Hours</option>
                                <option value="12 Hours">12 Hours</option>
                            </select>
                        </div>

                        <div className="mb-2">
                            <label>Duration</label>
                            <select className="form-select" value={med.Duration}
                                readOnly required>
                                <option value="">Select Duration</option>
                                <option value="1 Day">1 Day</option>
                                <option value="2 Days">2 Days</option>
                                <option value="3 Days">3 Days</option>
                                <option value="4 Days">4 Days</option>
                                <option value="5 Days">5 Days</option>
                                <option value="6 Days">6 Days</option>
                                <option value="7 Days">7 Days</option>
                                <option value="8 Days">8 Days</option>
                                <option value="9 Days">9 Days</option>
                                <option value="10 Days">10 Days</option>
                                <option value="2 Weeks">2 Weeks</option>
                                <option value="3 Weeks">3 Weeks</option>
                                <option value="1 Month">1 Month</option>
                                <option value="2 Months">2 Months</option>
                                <option value="3 Months">3 Months</option>
                                <option value="6 Months">6 Months</option>
                            </select>
                        </div>
                    </div>
                ))}


                                <div className="ap-readonly-block">
                    <label>Instructions</label>
                    <textarea
                        className="form-control"
                        name="Instructions"
                        value={formData.Instructions}
                        readOnly
                    />
                </div>
                                <div className="ap-delete-warning"><strong>Warning:</strong> This action cannot be undone. Confirm deletion.</div>
                                <div className="ap-actions-row mt-3">
                                    <button type="button" className="btn-ap-cancel" onClick={() => navigate("/get")}>Cancel</button>
                                    <button type="submit" className="btn-ap-delete">Delete Prescription</button>
                                </div>
            </form>
        </div>
    );
}

export default DeletePrescription;
