import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../styles/UpdateMedicine.css";

const InsertMedicine = () => {
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState({
    medicineName: "",
    genericName: "",
    strength: "",
    unit: "",
    quantity: "",
    expiryDate: "",
    batchNumber: "",
    dosageForm: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      console.log('Adding new medicine...', medicine);
      const response = await axios.post(`http://localhost:5000/api/medicines`, medicine);
      console.log('Insert response:', response.data);
      
      // Show success message and navigate after user acknowledges
      alert("✅ Medicine added successfully!");
      
      // Clear the form
      setMedicine({
        medicineName: "",
        genericName: "",
        strength: "",
        unit: "",
        quantity: "",
        expiryDate: "",
        batchNumber: "",
        dosageForm: "",
      });
      
      // Navigate to medicine list after a small delay to ensure alert is closed
      console.log('Navigating to medicine list...');
      setTimeout(() => {
        navigate("/medicine/list", { replace: true });
      }, 100);
      
    } catch (err) {
      console.error("Error adding medicine:", err);
      setError("Failed to add medicine. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="medicine-container">
      <div className="medicine-card">
        <h2 className="medicine-title">Add New Medicine</h2>

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
              value={medicine.quantity}
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
              {submitting ? "Adding Medicine..." : "Add Medicine"}
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

export default InsertMedicine;