import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Patient-Interaction/UpdateAppointments.css";
import { useNavigate, useLocation } from "react-router-dom";

import Sidebar from "../../components/SidebarPatient";
import Topbar from "../../components/Topbar";

function UpdateFeedback() {
  const [id, setId] = useState("");
  const [form, setForm] = useState({
    appointment_id: "",
    rating: "",
    comments: ""
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleIdChange = e => setId(e.target.value);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qid = params.get("id");
    if (qid) setId(qid);
  }, [location.search]);

  // Fetch feedback details when id is set
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
  const res = await axios.get(`/feedback/get/${id}`);
        const feedback = res.data.feedback || res.data;
        setForm({
          appointment_id: feedback.appointment_id?._id || feedback.appointment_id || "",
          rating: feedback.rating?.toString() || "",
          comments: feedback.comments || ""
        });
      } catch (err) {
        console.error("Failed to load feedback:", err);
        const msg = err?.response?.data || err?.message || JSON.stringify(err);
        window.alert("Failed to load feedback: " + msg);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault();

    // Basic validation
    if (!form.rating) {
      window.alert("Rating is required.");
      return;
    }

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
  await axios.put(`/feedback/update/${id}`, feedback);
      window.alert("Feedback updated!");
      navigate("/feedback");
    } catch (err) {
      const msg = err?.response?.data || err?.message || JSON.stringify(err);
      window.alert("Error updating feedback: " + msg);
      console.error("Update error:", err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Topbar />
        <main style={{ padding: '32px', maxWidth: 700, margin: '0 auto' }}>
          <div className="update-feedback">
            <h2>Update Feedback</h2>
            <div style={{ marginBottom: 8 }}>
              <label htmlFor="feedback_id">Feedback ID</label>
              <input id="feedback_id" value={id} onChange={handleIdChange} placeholder="Feedback ID" required />
            </div>
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
              <button type="submit">Update Feedback</button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UpdateFeedback;
