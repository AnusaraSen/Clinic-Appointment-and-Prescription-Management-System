
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/AllFeedback.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Star, Pencil, Trash2 } from "lucide-react";

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}


function getRatingStars(rating) {
  return (
    <span>
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={20} style={{ marginRight: 2 }} color={i < rating ? "#fbbf24" : "#d1d5db"} fill={i < rating ? "#fbbf24" : "none"} />
      ))}
    </span>
  );
}

function AllFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Safely stringify an id or object for display
  const asText = (val) => {
    if (val == null) return "-";
    if (typeof val === "string" || typeof val === "number") return String(val);
    if (val && typeof val === "object") {
      // If it's a populated doc with _id
      if (val._id) return String(val._id);
      try { return JSON.stringify(val); } catch { return String(val); }
    }
    return String(val);
  };

  const endpoints = [
    "/feedback/", // proxy to backend when dev server is used
    "http://localhost:5000/feedback/",
    "http://127.0.0.1:5000/feedback/",
  ];

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError("");
    setFeedbacks([]);
    let lastErr = null;

    for (const url of endpoints) {
      try {
        const res = await axios.get(url, { timeout: 5000 });
        setFeedbacks(res.data || []);
        setLoading(false);
        setError("");
        return;
      } catch (err) {
        lastErr = err;
        console.warn(`Failed to fetch from ${url}:`, err?.response?.status, err?.message || err);
      }
    }

    const status = lastErr?.response?.status;
    const data = lastErr?.response?.data;
    const msg = data || lastErr?.message || "Failed to reach backend";
    setError(
      `Unable to reach backend. Tried: ${endpoints.join(", ")}.\nStatus: ${status || "n/a"}. Error: ${msg}.\nSuggestions: ensure backend is running on port 5000, check CORS, or open the browser devtools network tab for more details.`
    );
    console.error("All fetch attempts failed:", { status, data, err: lastErr });
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Topbar />
        <main style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
          <div className="all-feedback">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>All Feedback</h2>
              <div>
                <button className="redo-btn" onClick={fetchFeedbacks} disabled={loading}>
                  {loading ? "Loading..." : "Refresh"}
                </button>
              </div>
            </div>
            {error && (
              <div style={{ color: "red", marginBottom: "1rem", whiteSpace: "pre-wrap" }}>
                {error}
              </div>
            )}
            {loading ? (
              <div>Loading feedback...</div>
            ) : feedbacks.length === 0 ? (
              <div>No feedback found.</div>
            ) : (
              <div className="feedback-card-list">
                {feedbacks.map((feedback) => {
                  const appointment = feedback.appointment_id || {};
                  return (
                    <div className="feedback-card" key={feedback._id}>
                      <div className="feedback-card-header">
                        <div className="feedback-card-id">Appointment ID: <span>{asText(appointment._id || appointment)}</span></div>
                        <div className="feedback-card-names">
                          <span className="feedback-card-patient">Patient: <b>{asText(appointment.patient_name || appointment.patient_id || '-')}</b></span>
                          <span className="feedback-card-doctor">Doctor: <b>{asText(appointment.doctor_name || appointment.doctor_id || '-')}</b></span>
                        </div>
                      </div>
                      <div className="feedback-card-rating">
                        {getRatingStars(feedback.rating)}
                        <span style={{ marginLeft: 8, color: '#555', fontWeight: 500 }}>({feedback.rating}/5)</span>
                      </div>
                      <div className="feedback-card-comments">
                        <span style={{ color: '#008080', fontWeight: 600 }}>Comments:</span> {feedback.comments || "No comments"}
                      </div>
                      {feedback.created_at && <div className="feedback-card-date">Created: {formatDateTime(feedback.created_at)}</div>}
                      <div className="feedback-card-actions">
                        <span style={{ cursor: 'pointer', marginRight: 12 }} title="Update" onClick={() => navigate(`/feedback/update?id=${feedback._id}`)}>
                          <Pencil size={22} color="#43a047" style={{ verticalAlign: 'middle' }} />
                        </span>
                        <span style={{ cursor: 'pointer' }} title="Delete" onClick={() => navigate(`/feedback/delete?id=${feedback._id}`)}>
                          <Trash2 size={22} color="#d32f2f" style={{ verticalAlign: 'middle' }} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AllFeedback;
