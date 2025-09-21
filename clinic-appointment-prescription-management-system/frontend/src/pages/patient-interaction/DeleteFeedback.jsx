import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/DeleteFeedback.css";
import { useNavigate, useLocation } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function DeleteFeedback() {
  const [id, setId] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qid = params.get("id");
    if (qid) setId(qid);
  }, [location.search]);

  // helper formatters
  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  const getRatingDisplay = (rating) => {
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    return `${stars} (${rating}/5)`;
  };

  // fetch feedback details when id changes
  useEffect(() => {
    const load = async () => {
      setFeedback(null);
      setError("");
      if (!id) return;
      setLoading(true);
      try {
        const res = await axios.get(`/feedback/get/${id}`);
        const fb = res.data.feedback || res.data;
        setFeedback(fb);
      } catch (err) {
        const msg = err?.response?.data || err?.message || JSON.stringify(err);
        setError(msg);
        console.error("Failed to load feedback for delete:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!id) {
      window.alert("Please provide a feedback ID to delete.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this feedback? This cannot be undone.")) return;
    try {
      await axios.delete(`/feedback/delete/${id}`);
      window.alert("Feedback deleted!");
      navigate("/feedback");
    } catch (err) {
      const msg = err?.response?.data || err?.message || JSON.stringify(err);
      window.alert("Error deleting feedback: " + msg);
      console.error("Delete error:", err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Topbar />
        <main style={{ padding: '32px', maxWidth: 700, margin: '0 auto' }}>
          <div className="delete-feedback">
            <h2>Delete Feedback</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>Feedback ID</label>
              <input value={id} onChange={e => setId(e.target.value)} placeholder="Feedback ID" />
            </div>
            {loading ? (
              <div>Loading feedback details...</div>
            ) : error ? (
              <div style={{ color: "red" }}>Failed to load: {error}</div>
            ) : feedback ? (
              <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6 }}>
                <div><strong>Appointment ID:</strong> {feedback.appointment_id?._id || feedback.appointment_id}</div>
                {feedback.appointment_id?.patient_id && (
                  <>
                    <div><strong>Patient ID:</strong> {feedback.appointment_id.patient_id}</div>
                    <div><strong>Doctor ID:</strong> {feedback.appointment_id.doctor_id}</div>
                  </>
                )}
                <div><strong>Rating:</strong> {getRatingDisplay(feedback.rating)}</div>
                <div><strong>Comments:</strong> {feedback.comments || "No comments"}</div>
                {feedback.created_at && <div><small>Created: {formatDateTime(feedback.created_at)}</small></div>}
              </div>
            ) : (
              <div>No feedback loaded.</div>
            )}
            <div style={{ marginTop: 12 }}>
              <button onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DeleteFeedback;
