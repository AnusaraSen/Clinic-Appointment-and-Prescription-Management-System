import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../../../styles/Medicine/InsertMedicine.css";

const DeleteMedicine = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/medicines/${id}`);
        console.log('Medicine data response:', res.data);
        // Handle the API response structure - it might be res.data.data or just res.data
        const medicineData = res.data.data || res.data;
        setMedicine(medicineData);
      } catch (err) {
        console.error("Error fetching medicine:", err);
        setError("Failed to load medicine");
      } finally {
        setLoading(false);
      }
    };
    fetchMedicine();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/medicines/${id}`);
      alert("✅ Medicine deleted successfully");
      setTimeout(() => {
        navigate("/medicine/list", { replace: true });
      }, 100);
    } catch (err) {
      console.error("Error deleting medicine:", err);
      alert("❌ Failed to delete medicine");
    }
  };

  if (loading) {
    return (
      <div className="medicine-container">
        <div className="medicine-card">
          <div className="medicine-title">Delete Medicine</div>
          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "1.1rem" }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="medicine-container">
        <div className="medicine-card">
          <div className="medicine-title">Delete Medicine</div>
          <div style={{ padding: "2rem", textAlign: "center", color: "#dc2626", fontSize: "1.1rem" }}>
            {error}
          </div>
        </div>
      </div>
    );
  }
  
  if (!medicine) return null;

  return (
    <div className="medicine-container">
      <div className="medicine-card">
        <h2 className="medicine-title">Delete Medicine</h2>
        <p style={{ textAlign: "center", marginBottom: 16, padding: "0 2.5rem", color: "#64748b", fontSize: "1rem" }}>
          Are you sure you want to delete the following medicine?
        </p>

        <div className="medicine-details">
          <div className="detail-row">
            <span className="detail-label">Medicine Name:</span>
            <span className="detail-value">{medicine.medicineName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Generic Name:</span>
            <span className="detail-value">{medicine.genericName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Strength:</span>
            <span className="detail-value">{medicine.strength}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Unit:</span>
            <span className="detail-value">{medicine.unit}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Dosage Form:</span>
            <span className="detail-value">{medicine.dosageForm}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Batch Number:</span>
            <span className="detail-value">{medicine.batchNumber}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Expiry Date:</span>
            <span className="detail-value">
              {medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Medicine ID:</span>
            <span className="detail-value">{medicine.medicine_id}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", padding: "0 2.5rem 2.5rem" }}>
          <button
            type="button"
            className="medicine-btn"
            style={{ background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)" }}
            onClick={handleDelete}
          >
            DELETE
          </button>
          <button
            type="button"
            className="medicine-btn"
            style={{ background: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)" }}
            onClick={() => navigate(-1)}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMedicine;