import React, { useState, useEffect } from 'react';
import '../../../styles/clinical-workflow/DeletePatient.css';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAlert } from '../prescriptions/AlertProvider.jsx';


function DeletePatient() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const { pushAlert } = useAlert();

    // State to hold patient data
    const [patientData, setPatientData] = useState({});

    // Fetch patient data by ID
    useEffect(() => {
        setIsLoading(true);
        axios.get(`http://localhost:5000/patient/get/${id}`)
            .then((res) => {
                console.log("Fetched Patient:", res.data.Patient);
                setPatientData(res.data.Patient);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching patient:", err);
                pushAlert("Failed to fetch patient","error");
                setIsLoading(false);
            });
    }, [id]);

    const handleDelete = () => {
        axios.delete(`http://localhost:5000/patient/delete/${id}`)
            .then(() => {
                pushAlert("Patient deleted","error");
                navigate('/getPatient');
            })
            .catch((err) => {
                console.error("Error deleting patient:", err);
                pushAlert("Failed to delete patient","error");
            });
    };

    if (isLoading) {
        return <div className="text-center mt-5">Loading patient data...</div>;
    }

    return (
        <div className="patient-delete-wrapper">
            <h2 className="mb-4">Delete Medical Record</h2>
            <div className="pt-delete-warning"><strong>Warning:</strong> This action cannot be undone. Confirm the deletion of the patient record below.</div>
            <ul>
                <li><strong>Patient ID:</strong> {patientData.patient_ID}</li>
                <li><strong>Patient Name:</strong> {patientData.patient_name}</li>
                <li><strong>Age:</strong> {patientData.patient_age}</li>
                <li><strong>Gender:</strong> {patientData.Gender}</li>
                <li><strong>Email:</strong> {patientData.Email}</li>
                <li><strong>Emergency Contact:</strong> {patientData.Emergency_Contact}</li>
                <li><strong>Allergies:</strong> {patientData.Allergies ||
                    "None"}</li>
                <li><strong>Current Medical Conditions:</strong> {patientData.Current_medical_conditions ||
                    "None"}</li>
                <li><strong>Past Surgeries:</strong> {patientData.Past_surgeries ||
                    "None"}</li>
                <li><strong>Blood Group:</strong> {patientData.Blood_group ||
                    "Not Specified"}</li>
                <li><strong>Smoking Status:</strong> {patientData.Smoking_status ||
                    "0"}</li>
                <li><strong>Alcohol Consumption:</strong> {patientData.Alcohol_consumption ||
                    "0"}</li>
            </ul>
                        <div className="pt-actions mt-3">
                            <button className="pt-btn pt-btn-danger" style={{ fontSize: 16, textDecoration: 'none', background: 'linear-gradient(135deg,#ff5a5f,#dc3545)', color: '#fff', borderColor: '#dc3545' }} onClick={handleDelete}>Delete Patient</button>
                            <button className="pt-btn pt-btn-outline" style={{ fontSize: 16, textDecoration: 'none' }} onClick={() => navigate('/getPatient')}>Cancel</button>
                        </div>
        </div>
    );
}


export default DeletePatient;