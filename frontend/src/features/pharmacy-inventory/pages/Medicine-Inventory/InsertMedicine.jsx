import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../../styles/Medicine/MedicineForm.css";

function generateBatchNumber() {
  const d = new Date();
  const y = String(d.getFullYear()).slice(2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BATCH-${y}${m}${day}-${rnd}`;
}

const InsertMedicine = () => {
  const navigate = useNavigate();

  const GENERIC_NAMES = useMemo(
    () => [
      "Paracetamol",
      "Amoxicillin",
      "Ibuprofen",
      "Aspirin",
      "Metformin",
      "Omeprazole",
      "Cetirizine",
      "Azithromycin",
    ],
    []
  );
  const STRENGTHS = useMemo(
    () => ["100 mg", "250 mg", "500 mg", "1 g", "5 mg/ml", "10 mg/ml"],
    []
  );
  const UNITS = useMemo(
    () => [
      "tablets",
      "capsules",
      "ml",
      "l",
      "vials",
      "boxes",
      "tubes",
      "sachets",
      "bottles",
    ],
    []
  );
  const DOSAGE_FORMS = useMemo(
    () => [
      "Tablet",
      "Capsule",
      "Syrup",
      "Suspension",
      "Injection",
      "Ointment",
      "Cream",
      "Gel",
      "Drops",
      "Inhaler",
    ],
    []
  );

  const [medicine, setMedicine] = useState({
    medicineName: "",
    genericName: "",
    strength: "",
    unit: "",
    quantity: "",
    expiryDate: "",
    batchNumber: generateBatchNumber(),
    dosageForm: "",
    reorderLevel: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorDetails, setErrorDetails] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedicine((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setFieldErrors({});
    setErrorDetails([]);

    const requiredFields = ["medicineName", "unit", "quantity", "reorderLevel"];
    for (const f of requiredFields) {
      if (!medicine[f] || String(medicine[f]).trim() === "") {
        setSubmitting(false);
        setFieldErrors((prev) => ({ ...prev, [f]: "This field is required" }));
        setError("Please fix the highlighted fields.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    const payload = { ...medicine };
    [
      "medicineName",
      "genericName",
      "strength",
      "unit",
      "batchNumber",
      "dosageForm",
    ].forEach((f) => {
      if (typeof payload[f] === "string") payload[f] = payload[f].trim();
    });

    if (!payload.batchNumber) payload.batchNumber = generateBatchNumber();
    payload.quantity = medicine.quantity === "" ? 0 : Number(medicine.quantity);
    payload.reorderLevel = Number(medicine.reorderLevel);
    if (payload.expiryDate === "") delete payload.expiryDate;

    if (Number.isNaN(payload.quantity) || payload.quantity < 0) {
      setSubmitting(false);
      setFieldErrors((prev) => ({
        ...prev,
        quantity: "Quantity must be a non-negative number",
      }));
      setError("Please fix the highlighted fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (Number.isNaN(payload.reorderLevel) || payload.reorderLevel < 0) {
      setSubmitting(false);
      setFieldErrors((prev) => ({
        ...prev,
        reorderLevel: "Reorder level must be a non-negative number",
      }));
      setError("Please fix the highlighted fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      console.log("Submitting medicine payload:", payload);
      console.log("ReorderLevel value:", payload.reorderLevel, "Type:", typeof payload.reorderLevel);
      const response = await axios.post(
        `http://localhost:5000/api/medicines`,
        payload
      );
      console.log("Insert response:", response.data);
      alert("✅ Medicine added successfully!");
      setMedicine({
        medicineName: "",
        genericName: "",
        strength: "",
        unit: "",
        quantity: "",
        expiryDate: "",
        batchNumber: generateBatchNumber(),
        dosageForm: "",
        reorderLevel: "",
      });
      setFieldErrors({});
      setErrorDetails([]);
      setTimeout(() => navigate("/medicine-inventory", { replace: true }), 100);
    } catch (err) {
      console.error("Error adding medicine:", err);
      const data = err.response?.data;
      if (data) {
        if (data.details?.length) {
          const map = {};
          data.details.forEach((d) => {
            if (d.field) map[d.field] = d.message;
          });
          setFieldErrors(map);
          setError("Validation failed. Please check the highlighted fields.");
          setErrorDetails(data.details.map((d) => `${d.field}: ${d.message}`));
        } else if (data.field && data.message) {
          setFieldErrors({ [data.field]: data.message });
          setError(`${data.field}: ${data.message}`);
          setErrorDetails([`${data.field}: ${data.message}`]);
        } else if (data.errors && typeof data.errors === "object") {
          const map = {};
          const list = [];
          Object.entries(data.errors).forEach(([field, msg]) => {
            map[field] =
              typeof msg === "string" ? msg : msg?.message || "Invalid value";
            list.push(`${field}: ${map[field]}`);
          });
          setFieldErrors(map);
          setError("Validation failed. Please check the highlighted fields.");
          setErrorDetails(list);
        } else if (data.message || data.error) {
          const main = data.message || data.error;
          setError(main);
          const detailsArr = [];
          if (typeof data.error === "string" && data.error !== main)
            detailsArr.push(data.error);
          setErrorDetails(detailsArr.length ? detailsArr : [main]);
        } else {
          setError(
            "Failed to add medicine. Please check your input and try again."
          );
          setErrorDetails([]);
        }
      } else {
        setError("Failed to add medicine. Network or server error.");
        setErrorDetails([]);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
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
            <div style={{ marginBottom: errorDetails.length ? "0.5rem" : 0 }}>
              {error}
            </div>
            {errorDetails.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                {errorDetails.map((d, i) => (
                  <li key={i} style={{ lineHeight: 1.4 }}>
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="medicine-form" noValidate>
          <div className={`medicine-field ${fieldErrors.medicineName ? "error" : ""}`}>
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
            {fieldErrors.medicineName && (
              <div
                className="input-error"
                style={{ color: "#b91c1c", fontSize: "12px", marginTop: "6px" }}
              >
                {fieldErrors.medicineName}
              </div>
            )}
          </div>

          <div className={`medicine-field ${fieldErrors.genericName ? "error" : ""}`}>
            <label htmlFor="genericName">Generic Name</label>
            <select
              id="genericName"
              name="genericName"
              value={medicine.genericName}
              onChange={handleChange}
              disabled={submitting}
            >
              <option value="">Select generic name</option>
              {GENERIC_NAMES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {fieldErrors.genericName && (
              <div
                className="input-error"
                style={{ color: "#b91c1c", fontSize: "12px", marginTop: "6px" }}
              >
                {fieldErrors.genericName}
              </div>
            )}
          </div>

          <div className={`medicine-field ${fieldErrors.strength ? "error" : ""}`}>
            <label htmlFor="strength">Strength</label>
            <select
              id="strength"
              name="strength"
              value={medicine.strength}
              onChange={handleChange}
              disabled={submitting}
            >
              <option value="">Select strength</option>
              {STRENGTHS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {fieldErrors.strength && (
              <div
                className="input-error"
                style={{ color: "#b91c1c", fontSize: "12px", marginTop: "6px" }}
              >
                {fieldErrors.strength}
              </div>
            )}
          </div>

          <div className={`medicine-field ${fieldErrors.unit ? "error" : ""}`}>
            <label htmlFor="unit">Unit</label>
            <select
              id="unit"
              name="unit"
              value={medicine.unit}
              onChange={handleChange}
              required
              disabled={submitting}
            >
              <option value="">Select unit</option>
              {UNITS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {fieldErrors.unit && (
              <div
                className="input-error"
                style={{ color: "#b91c1c", fontSize: "12px", marginTop: "6px" }}
              >
                {fieldErrors.unit}
              </div>
            )}
          </div>

          <div className={`medicine-field ${fieldErrors.quantity ? "error" : ""}`}>
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
            {fieldErrors.quantity && (
              <div
                className="input-error"
                style={{ color: "#b91c1c", fontSize: "12px", marginTop: "6px" }}
              >
                {fieldErrors.quantity}
              </div>
            )}
          </div>

          <div className={`medicine-field ${fieldErrors.expiryDate ? "error" : ""}`}>
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              id="expiryDate"
              type="date"
              name="expiryDate"
              value={medicine.expiryDate}
              onChange={handleChange}
              disabled={submitting}
            />
            {fieldErrors.expiryDate && (
              <div
                className="input-error"
                style={{ color: "#b91c1c", fontSize: "12px", marginTop: "6px" }}
              >
                {fieldErrors.expiryDate}
              </div>
            )}
          </div>

          <div className={`medicine-field ${fieldErrors.batchNumber ? "error" : ""}`}>
            <label htmlFor="batchNumber">Batch Number</label>
            <input
              id="batchNumber"
              type="text"
              name="batchNumber"
              value={medicine.batchNumber}
              readOnly
              placeholder="Auto-generated batch number"
              required
              disabled={submitting}
            />
            <div style={{ color: "#64748b", fontSize: 12 }}>
              Auto-generated (duplicates allowed)
            </div>
            {fieldErrors.batchNumber && (
              <div
                className="input-error"
                style={{ color: "#b91c1c", fontSize: "12px", marginTop: "6px" }}
              >
                {fieldErrors.batchNumber}
              </div>
            )}
          </div>

          <div className={`medicine-field ${fieldErrors.dosageForm ? "error" : ""}`}>
            <label htmlFor="dosageForm">Dosage Form</label>
            <select
              id="dosageForm"
              name="dosageForm"
              value={medicine.dosageForm}
              onChange={handleChange}
              disabled={submitting}
            >
              <option value="">Select dosage form</option>
              {DOSAGE_FORMS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {fieldErrors.dosageForm && (
              <div
                className="input-error"
                style={{ color: "#b91c1c", fontSize: "12px", marginTop: "6px" }}
              >
                {fieldErrors.dosageForm}
              </div>
            )}
          </div>

          <div className={`medicine-field ${fieldErrors.reorderLevel ? "error" : ""}`}>
            <label htmlFor="reorderLevel">Reorder Level</label>
            <input
              id="reorderLevel"
              type="number"
              name="reorderLevel"
              value={medicine.reorderLevel}
              onChange={handleChange}
              placeholder="Enter reorder level"
              min="0"
              required
              disabled={submitting}
            />
            {fieldErrors.reorderLevel && (
              <div
                className="input-error"
                style={{ color: "#b91c1c", fontSize: "12px", marginTop: "6px" }}
              >
                {fieldErrors.reorderLevel}
              </div>
            )}
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
              onClick={() => navigate("/medicine-inventory")}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsertMedicine;