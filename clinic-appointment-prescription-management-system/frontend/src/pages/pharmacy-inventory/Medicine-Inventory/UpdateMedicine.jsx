import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../../styles/UpdateMedicine.css";


const UpdateMedicine = () => {
  const { id } = useParams(); // get medicine id from URL
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState({
    medicineName: "",
    genericName: "",
    strength: "",
    unit: "",
    expiryDate: "",
    batchNumber: "",
    dosageForm: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch medicine details when page loads
  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        setError("");
        console.log('Fetching medicine with ID:', id); // Debug log
        const res = await axios.get(`http://localhost:5000/api/medicines/${id}`);
        console.log('API response:', res.data); // Debug log
        const medicineData = res.data.data; // Extract data from API response structure
        console.log('Medicine data:', medicineData); // Debug log
        setMedicine({
          ...medicineData,
          expiryDate: medicineData.expiryDate?.split("T")[0], // format for input type=date
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching medicine:", err);
        setError("Failed to load medicine details. Please try again.");
        setLoading(false);
      }
    };

    if (id) {
      fetchMedicine();
    }
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    setMedicine({ ...medicine, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    
    try {
      console.log('Submitting medicine update...', medicine);
      const response = await axios.put(`http://localhost:5000/api/medicines/${id}`, medicine);
      console.log('Update response:', response.data);
      
      alert("✅ Medicine updated successfully");
      
      // Navigate back to medicine list with replace to prevent back button issues
      console.log('Navigating back to medicine list...');
      setTimeout(() => {
        navigate("/medicine/list", { replace: true });
      }, 100);
      
    } catch (err) {
      console.error("Error updating medicine:", err);
      setError("Failed to update medicine. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="medicine-container">
      <div className="medicine-loading">
        Loading medicine details...
      </div>
    </div>
  );

  return (
    <div className="medicine-container">
      <div className="medicine-card">
        <h2 className="medicine-title">Update Medicine</h2>

        {error && (
          <div className="medicine-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="medicine-form" noValidate>
          <div className="medicine-field">
            <label htmlFor="medicineName">Medicine Name</label>
            <input
              id="medicineName"
              type="text"
              name="medicineName"
              value={medicine.medicineName}
              onChange={handleChange}
              placeholder="Enter medicine name"
              required
              disabled={submitting}
            />
          </div>

          <div className="medicine-field">
            <label htmlFor="genericName">Generic Name</label>
            <input
              id="genericName"
              type="text"
              name="genericName"
              value={medicine.genericName}
              onChange={handleChange}
              placeholder="Enter generic name"
              required
              disabled={submitting}
            />
          </div>

          <div className="medicine-field">
            <label htmlFor="strength">Strength</label>
            <input
              id="strength"
              type="text"
              name="strength"
              value={medicine.strength}
              onChange={handleChange}
              placeholder="Enter strength (e.g., 500mg)"
              required
              disabled={submitting}
            />
          </div>

          <div className="medicine-field">
            <label htmlFor="unit">Unit</label>
            <input
              id="unit"
              type="text"
              name="unit"
              value={medicine.unit}
              onChange={handleChange}
              placeholder="Enter unit (e.g., tablets, ml)"
              required
              disabled={submitting}
            />
          </div>

          <div className="medicine-field">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              name="quantity"
              value={medicine.quantity || ''}
              onChange={handleChange}
              placeholder="Enter quantity"
              min="0"
              required
              disabled={submitting}
            />
          </div>

          <div className="medicine-field">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              id="expiryDate"
              type="date"
              name="expiryDate"
              value={medicine.expiryDate}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="medicine-field">
            <label htmlFor="batchNumber">Batch Number</label>
            <input
              id="batchNumber"
              type="text"
              name="batchNumber"
              value={medicine.batchNumber}
              onChange={handleChange}
              placeholder="Enter batch number"
              required
              disabled={submitting}
            />
          </div>

          <div className="medicine-field">
            <label htmlFor="dosageForm">Dosage Form</label>
            <input
              id="dosageForm"
              type="text"
              name="dosageForm"
              value={medicine.dosageForm}
              onChange={handleChange}
              placeholder="Enter dosage form (e.g., tablet, capsule)"
              required
              disabled={submitting}
            />
          </div>

          <div className="medicine-actions">
            <button 
              type="submit" 
              className="medicine-btn medicine-btn-primary"
              disabled={submitting}
            >
              {submitting ? "Updating Medicine..." : "Update Medicine"}
            </button>
            <button
              type="button"
              className="medicine-btn medicine-btn-secondary"
              onClick={() => navigate("/medicine/list")}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default UpdateMedicine;