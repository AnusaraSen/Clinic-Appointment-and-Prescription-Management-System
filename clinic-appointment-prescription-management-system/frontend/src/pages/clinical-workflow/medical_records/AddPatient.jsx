import React, { useState, useRef } from "react";
import '../../../styles/clinical-workflow/AddPatient.css';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import { useAlert } from '../prescriptions/AlertProvider.jsx';
import { validatePatientForm } from '../../../utils/validation';


function AddPatient() {
  const [formData, setFormData] = useState({
    patient_ID: "",
    patient_name: "",
    patient_age: "",
    Gender: "Male",
    Email: "",
    Emergency_Contact: "",
    Allergies: "None",
    Current_medical_conditions: "None",
    Past_surgeries: "None",
    Blood_group: "Not Specified",
    Smoking_status: "0",
    Alcohol_consumption: "0"
  });
  
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [showWebcam, setShowWebcam] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  // Webcam logic
  const startWebcam = async () => {
    setShowWebcam(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      pushAlert("Could not access webcam","error");
      setShowWebcam(false);
    }
  };

  const stopWebcam = () => {
    setShowWebcam(false);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      setPhoto(blob);
      setPreview(URL.createObjectURL(blob));
      stopWebcam();
    }, 'image/jpeg');
  };
  const frequencyMap = {
    0: "Never",
    1: "Rarely",
    2: "Sometimes",
    3: "Often",
    4: "Regularly",
    5: "Heavy"
  };

  const navigate = useNavigate();
  const { pushAlert } = useAlert();


  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "Smoking_status" || name === "Alcohol_consumption") {
      const numericValue = parseInt(value);
      setFormData(prev => ({
        ...prev,
        [name]: frequencyMap[numericValue],
        [`${name}_numeric`]: numericValue  
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };


  

  const sendData = async (e) => {
    e.preventDefault();
    const vErrors = validatePatientForm(formData);
    setErrors(vErrors);
    if(Object.keys(vErrors).length){
      pushAlert('Please fix validation errors','error');
      return;
    }
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (photo) data.append('photo', photo);
      const response = await axios.post("http://localhost:5000/patient/add", data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.status === 200) {
        pushAlert("Patient created","info");
        navigate("/getPatient");
      }
    } catch (error) {
      console.error("Error adding patient:", error);
      pushAlert(error.response?.data?.message || "Failed to add patient","error");
    }
  };

  // Get current numeric value for display (reverse mapping)
  const getNumericValue = (stringValue) => {
    return Object.keys(frequencyMap).find(
      key => frequencyMap[key] === stringValue
    ) || 0;
  
  };

  return (
    <div className="patient-form-wrapper">
      <h2 className="mb-4">Add New Medical Record</h2>
  <form onSubmit={sendData} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">Patient ID</label>
          <input
            type="text"
            className="form-control"
            name="patient_ID"
            value={formData.patient_ID}
            onChange={handleChange}
            required
            maxLength={12}
          />
          {errors.patient_ID && <div className="text-danger small mt-1">{errors.patient_ID}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Patient Name</label>
          <input
            type="text"
            className="form-control"
            name="patient_name"
            value={formData.patient_name}
            onChange={handleChange}
            required
          />
          {errors.patient_name && <div className="text-danger small mt-1">{errors.patient_name}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Age</label>
          <input
            type="number"
            className="form-control"
            name="patient_age"
            value={formData.patient_age}
            onChange={handleChange}
            required
            min="0"
            max="120"
          />
          {errors.patient_age && <div className="text-danger small mt-1">{errors.patient_age}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Gender</label>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="Gender"
              id="male"
              value="Male"
              checked={formData.Gender === "Male"}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="male">
              Male
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="Gender"
              id="female"
              value="Female"
              checked={formData.Gender === "Female"}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="female">
              Female
            </label>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
            required
            placeholder="example@domain.com"
          />
          {errors.Email && <div className="text-danger small mt-1">{errors.Email}</div>}
        </div>

        
        <div className="mb-3">
          <label className="form-label">Emergency Contact</label>
          <input
            type="tel"
            className="form-control"
            name="Emergency_Contact"
            value={formData.Emergency_Contact}
            onChange={handleChange}
            required
            placeholder="0701234567"
          />
          {errors.Emergency_Contact && <div className="text-danger small mt-1">{errors.Emergency_Contact}</div>}
        </div>

       
        <div className="mb-3">
          <label className="form-label">Allergies</label>
          <textarea
            className="form-control"
            name="Allergies"
            value={formData.Allergies}
            onChange={handleChange}
            rows="2"
          />
          {errors.Allergies && <div className="text-danger small mt-1">{errors.Allergies}</div>}
        </div>

        
        <div className="mb-3">
          <label className="form-label">Current Medical Conditions</label>
          <textarea
            className="form-control"
            name="Current_medical_conditions"
            value={formData.Current_medical_conditions}
            onChange={handleChange}
            rows="2"
          />
          {errors.Current_medical_conditions && <div className="text-danger small mt-1">{errors.Current_medical_conditions}</div>}
        </div>

        
        <div className="mb-3">
          <label className="form-label">Past Surgeries</label>
          <textarea
            className="form-control"
            name="Past_surgeries"
            value={formData.Past_surgeries}
            onChange={handleChange}
            rows="2"
          />
          {errors.Past_surgeries && <div className="text-danger small mt-1">{errors.Past_surgeries}</div>}
        </div>

        
        <div className="mb-3">
          <label className="form-label">Blood Group</label>
          <select
            className="form-select"
            name="Blood_group"
            value={formData.Blood_group}
            onChange={handleChange}
            required
          >
            <option value="">Select Blood Group</option>
            <option value="Not Specified">Not Specified</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
          {errors.Blood_group && <div className="text-danger small mt-1">{errors.Blood_group}</div>}
        </div>

        
  <div className="pt-range-group">
        <label className="form-label">
          Smoking Status: {formData.Smoking_status}
        </label>
        <input
          type="range"
          className="form-range"
          name="Smoking_status"
          min="0"
          max="5"
          value={getNumericValue(formData.Smoking_status)}
          onChange={handleChange}
        />
        <div className="text-muted small">
          0 (Never) — 1 (Rarely) — 2 (Sometimes) — 3 (Often) — 4 (Regularly) — 5 (Heavy)
        </div>
      </div>

        
  <div className="pt-range-group mb-3">
        <label className="form-label">
          Alcohol Consumption: {formData.Alcohol_consumption}
        </label>
        <input
          type="range"
          className="form-range"
          name="Alcohol_consumption"
          min="0"
          max="5"
          value={getNumericValue(formData.Alcohol_consumption)}
          onChange={handleChange}
        />
        <div className="text-muted small">
          0 (Never) — 1 (Rarely) — 2 (Sometimes) — 3 (Often) — 4 (Regularly) — 5 (Heavy)
        </div>
      </div>

        {/* Photo upload/capture */}
        <div className="mb-3">
          <label className="form-label">Photo</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="file" accept="image/*" capture="user" onChange={handlePhotoChange} className="form-control" style={{ maxWidth: 220 }} />
            <button type="button" className="pt-btn pt-btn-outline" style={{ minWidth: 120 }} onClick={showWebcam ? stopWebcam : startWebcam}>
              {showWebcam ? 'Close Webcam' : 'Use Webcam'}
            </button>
          </div>
          {showWebcam && (
            <div style={{ marginTop: 12 }}>
              <video ref={videoRef} style={{ width: 220, borderRadius: 8, border: '1px solid #ccc' }} autoPlay muted />
              <div style={{ marginTop: 8 }}>
                <button type="button" className="pt-btn pt-btn-primary" onClick={capturePhoto}>Capture Photo</button>
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          )}
          {preview && <img src={preview} alt="Preview" style={{ width: 100, marginTop: 8, borderRadius: '50%' }} />}
        </div>
        <div className="d-grid gap-2 mt-2">
          <button type="submit" className="pt-btn pt-btn-primary">Add Patient</button>
          <button type="button" className="pt-btn pt-btn-outline" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );

}


export default AddPatient;