import React, { useState, useEffect, useRef } from "react";
import '../../../styles/clinical-workflow/UpdatePatient.css';
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAlert } from '../prescriptions/AlertProvider.jsx';
import { validatePatientForm } from '../../../utils/validation';

function UpdatePatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { pushAlert } = useAlert();

  const [formData, setFormData] = useState({
    patient_ID: "",
    patient_name: "",
    patient_age: "",
    Gender: "",
    Email: "",
    Emergency_Contact: "",
    Allergies: "None",
    Current_medical_conditions: "None",
    Past_surgeries: "None",
    Blood_group: "Not Specified",
    Smoking_status: "0",
    Alcohol_consumption: "0",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [showWebcam, setShowWebcam] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);
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

  //fetch patient data by ID

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`http://localhost:5000/patient/get/${id}`)
      .then((res) => {
        console.log("Fetched patient:", res.data.Patient);
        const patient = res.data.Patient;

  setFormData({
          patient_ID: patient.patient_ID,
          patient_name: patient.patient_name,
          patient_age: patient.patient_age,
          Gender: patient.Gender,
          Email: patient.Email,
          Emergency_Contact: patient.Emergency_Contact,
          Allergies: patient.Allergies || "None",
          Current_medical_conditions:
            patient.Current_medical_conditions || "None",
          Past_surgeries: patient.Past_surgeries || "None",
          Blood_group: patient.Blood_group || "Not Specified",
          Smoking_status: patient.Smoking_status || "0",
          Alcohol_consumption: patient.Alcohol_consumption || "0",
        });
  setIsLoading(false);
  setCurrentPhoto(patient.photo || null);
      })
      .catch((err) => {
        console.error("Error fetching patient data:", err);
  pushAlert("Failed to fetch patient","error");
        setIsLoading(false);
      });
  }, [id]);

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

  const handleSubmit = async (e) => {
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
      const response = await axios.put(
        `http://localhost:5000/patient/update/${id}`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (response.status === 200) {
        pushAlert("Patient updated","success");
        navigate("/getPatient");
      }
    } catch (error) {
      console.error("Error updating patient:", error);
      pushAlert(error.response?.data?.message || "Failed to update patient","error");
    }
  };

  if (isLoading) {
    return <div className="text-center mt-5">Loading prescription data...</div>;
  }

  // Get current numeric value for display (reverse mapping)
  const getNumericValue = (stringValue) => {
    return Object.keys(frequencyMap).find(
      key => frequencyMap[key] === stringValue
    ) || 0;
  
  };

  return (
    <div className="patient-update-wrapper">
      <h2 className="mb-4">Update Medical Record</h2>
  <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Photo upload/capture */}
        <div className="mb-3">
          <label className="form-label">Photo</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="file" accept="image/*" capture="user" onChange={handlePhotoChange} className="form-control" style={{ maxWidth: 220 }} />
            <button type="button" className="pt-btn pt-btn-outline" style={{ minWidth: 120, fontSize: 16, textDecoration: 'none' }} onClick={showWebcam ? stopWebcam : startWebcam}>
              {showWebcam ? 'Close Webcam' : 'Use Webcam'}
            </button>
          </div>
          {showWebcam && (
            <div style={{ marginTop: 12 }}>
              <video ref={videoRef} style={{ width: 220, borderRadius: 8, border: '1px solid #ccc' }} autoPlay muted />
              <div style={{ marginTop: 8 }}>
                <button type="button" className="pt-btn pt-btn-primary" style={{ fontSize: 16, textDecoration: 'none' }} onClick={capturePhoto}>Capture Photo</button>
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          )}
          {/* Show preview of new photo if selected, else current photo */}
          {preview ? (
            <img src={preview} alt="Preview" style={{ width: 100, marginTop: 8, borderRadius: '50%' }} />
          ) : currentPhoto ? (
            <img src={currentPhoto.startsWith('data:') ? currentPhoto : `data:image/jpeg;base64,${currentPhoto}`} alt="Current" style={{ width: 100, marginTop: 8, borderRadius: '50%' }} />
          ) : null}
        </div>
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
          />
          {errors.Email && <div className="text-danger small mt-1">{errors.Email}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Emergency Contact</label>
          <input
            type="text"
            className="form-control"
            name="Emergency_Contact"
            value={formData.Emergency_Contact}
            onChange={handleChange}
            required
          />
          {errors.Emergency_Contact && <div className="text-danger small mt-1">{errors.Emergency_Contact}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Allergies</label>
          <input
            type="text"
            className="form-control"
            name="Allergies"
            value={formData.Allergies}
            onChange={handleChange}
          />
          {errors.Allergies && <div className="text-danger small mt-1">{errors.Allergies}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Current Medical Conditions</label>
          <input
            type="text"
            className="form-control"
            name="Current_medical_conditions"
            value={formData.Current_medical_conditions}
            onChange={handleChange}
          />
          {errors.Current_medical_conditions && <div className="text-danger small mt-1">{errors.Current_medical_conditions}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Past Surgeries</label>
          <input
            type="text"
            className="form-control"
            name="Past_surgeries"
            value={formData.Past_surgeries}
            onChange={handleChange}
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
          >
            <option value="Not Specified">Not Specified</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
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

  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
    <button type="submit" className="pt-btn pt-btn-primary" style={{ fontSize: 16, textDecoration: 'none' }}>Update Patient</button>
    <button type="button" className="pt-btn pt-btn-outline" style={{ fontSize: 16, textDecoration: 'none' }} onClick={() => navigate('/getPatient')}>Cancel</button>
  </div>
      </form>
    </div>
  );
}

export default UpdatePatient;
