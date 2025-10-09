import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../../styles/Patient-Interaction/AddFeedback.css";
import { useNavigate, useLocation } from "react-router-dom";
import { SimplePatientLayout } from "../components/SimplePatientLayout";

function AddFeedback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    appointment_id: "",
    rating: "",
    comments: ""
  });

  // Extract appointment ID from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const appointmentId = params.get("appointmentId");
    if (appointmentId) {
      setForm(prev => ({ ...prev, appointment_id: appointmentId }));
    }
  }, [location.search]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Basic client-side validation
    if (!form.appointment_id || !form.rating) {
      window.alert("Appointment ID and Rating are required.");
      return;
    }

    // Validate ObjectId-ish strings (24 hex chars) to avoid backend CastError
    const isLikelyObjectId = (s) => /^[a-fA-F0-9]{24}$/.test(s);
    if (!isLikelyObjectId(form.appointment_id)) {
      if (!window.confirm("Appointment ID does not look like a 24-character ObjectId. Continue anyway?")) return;
    }

    // Validate rating range
    const rating = parseInt(form.rating);
    if (rating < 1 || rating > 5) {
      window.alert("Rating must be between 1 and 5.");
      return;
    }

    const feedback = {
      appointment_id: form.appointment_id,
      rating: rating,
      comments: form.comments || undefined
    };

    try {
  await axios.post("http://localhost:5000/feedback/add", feedback, { timeout: 5000 });
  window.alert("Feedback added successfully!");
  // Redirect to the new feedback reading page and highlight the entry for this appointment
  navigate(`/feedback?justAdded=1&appointmentId=${encodeURIComponent(form.appointment_id)}`);
    } catch (err) {
      const serverMsg = err?.response?.data || err?.message || JSON.stringify(err);
      window.alert("Error adding feedback: " + serverMsg);
      console.error("Add feedback error:", err);
    }
  };

  return (
    <SimplePatientLayout currentPage="feedback">
      <div className="add-feedback">
        <h2>Add Feedback</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 8 }}>
            <label htmlFor="appointment_id">Appointment ID</label>
            <input
              id="appointment_id"
              name="appointment_id"
              value={form.appointment_id}
              onChange={handleChange}
              placeholder="Appointment ID"
              required
              readOnly={!!new URLSearchParams(location.search).get("appointmentId")}
              style={{ 
                backgroundColor: new URLSearchParams(location.search).get("appointmentId") ? '#f5f5f5' : 'white'
                  }}
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label htmlFor="rating">Rating (1-5)</label>
                <select id="rating" name="rating" value={form.rating} onChange={handleChange} required className="rating-dropdown">
                  <option value="">Select Rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label htmlFor="comments">Comments (Optional)</label>
                <textarea
                  id="comments"
                  name="comments"
                  value={form.comments}
                  onChange={handleChange}
                  placeholder="Your feedback comments..."
                  rows="4"
                  maxLength="1000"
                />
              </div>
              <button type="submit">Add Feedback</button>
            </form>
          </div>
    </SimplePatientLayout>
  );
}

export default AddFeedback;
