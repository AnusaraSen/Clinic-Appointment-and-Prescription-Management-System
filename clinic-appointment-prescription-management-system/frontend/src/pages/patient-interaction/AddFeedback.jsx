import React, { useState } from "react";
import axios from "axios";
import "../css/AddFeedback.css";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

function AddFeedback() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    appointment_id: "",
    rating: "",
    comments: ""
  });

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
      await axios.post("/feedback/add", feedback, { timeout: 5000 });
      window.alert("Feedback added!");
      navigate("/feedback");
    } catch (err) {
      const serverMsg = err?.response?.data || err?.message || JSON.stringify(err);
      window.alert("Error adding feedback: " + serverMsg);
      console.error("Add feedback error:", err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Topbar />
        <main style={{ padding: '90px 32px 32px 32px', maxWidth: 700, margin: '0 auto' }}>
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
        </main>
      </div>
    </div>
  );
}

export default AddFeedback;
