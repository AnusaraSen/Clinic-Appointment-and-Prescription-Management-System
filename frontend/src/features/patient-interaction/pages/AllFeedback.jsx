import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../../styles/Patient-Interaction/AllFeedback.css";
import { useNavigate } from "react-router-dom";
import { SimplePatientLayout } from "../components/SimplePatientLayout";
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
    try {
      if (val == null) return "-";
      if (typeof val === "string" || typeof val === "number") return String(val);
      if (val && typeof val === "object") {
        // If it's a populated doc with _id
        if (val._id) return String(val._id);
        try { return JSON.stringify(val); } catch { return String(val); }
      }
      return String(val);
    } catch (err) {
      console.error("Error in asText:", err);
      return "-";
    }
  };

  const endpoints = [
    "/feedback/", // proxy to backend when dev server is used
    "http://localhost:5000/feedback/",
    "http://127.0.0.1:5000/feedback/",
  ];

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError("");
    let lastErr = null;

    for (const url of endpoints) {
      try {
        const res = await axios.get(url, { timeout: 5000 });
        const data = res.data || [];
        // Sort feedback by creation date (newest first)
        const sortedFeedbacks = Array.isArray(data) ? data.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA; // Newest first
        }) : [];
        
        setFeedbacks(sortedFeedbacks);
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
    try {
      // Clear any malformed patient data that might cause issues
      const patientId = localStorage.getItem('patientId');
      if (patientId && !/^[a-f\d]{24}$/i.test(patientId)) {
        console.warn('Clearing malformed patient ID:', patientId);
        localStorage.removeItem('patientId');
      }
      
      fetchFeedbacks();
    } catch (err) {
      console.error("Error in useEffect:", err);
      setError("Failed to initialize feedback component");
      setLoading(false);
    }
  }, []);

  // Refresh feedback when navigating back to this page
  useEffect(() => {
    const handleFocus = () => {
      fetchFeedbacks();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Add error boundary within the component
  if (error && error.includes("Failed to initialize")) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Error Loading Feedback</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }

  try {
    return (
      <SimplePatientLayout currentPage="feedback">
        <div className="all-feedback">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>All Feedback</h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={() => navigate('/feedback/add')} 
                style={{ 
                  background: 'linear-gradient(135deg, #008080 0%, #20b2aa 100%)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Add New Feedback
              </button>
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
          
          {/* Info message about appointment IDs */}
          {feedbacks.length > 0 && feedbacks.some(f => !f.appointment_id) && (
            <div style={{ 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              borderRadius: '8px', 
              padding: '12px 16px', 
              marginBottom: '16px',
              color: '#856404'
            }}>
              ℹ️ <strong>Note:</strong> Some feedback entries were created without appointment IDs. 
              When creating new feedback, please ensure to provide a valid appointment ID.
            </div>
          )}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '1.2rem', color: '#6b7280' }}>Loading your feedback...</div>
                </div>
              ) : feedbacks.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px', 
                  background: '#f8fafc', 
                  borderRadius: '12px', 
                  margin: '20px 0' 
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💭</div>
                  <h3 style={{ color: '#374151', marginBottom: '8px' }}>No feedback yet</h3>
                  <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                    You haven't submitted any feedback yet. Share your experience to help us improve!
                  </p>
                  <button 
                    onClick={() => navigate('/feedback/add')} 
                    style={{ 
                      background: 'linear-gradient(135deg, #008080 0%, #20b2aa 100%)', 
                      color: 'white', 
                      border: 'none', 
                      padding: '12px 24px', 
                      borderRadius: '8px', 
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    Add Your First Feedback
                  </button>
                </div>
              ) : (
                <div className="feedback-card-list">
                  {feedbacks.map((feedback) => {
                    try {
                      const appointment = feedback.appointment_id || null;
                      const appointmentId = appointment?._id || appointment || null;
                      
                      return (
                        <div className="feedback-card" key={feedback._id}>
                          <div className="feedback-card-header">
                            <div className="feedback-card-id">
                              <strong style={{ color: '#006064' }}>Appointment ID:</strong> 
                              <span style={{ 
                                marginLeft: 8, 
                                padding: '2px 8px', 
                                backgroundColor: appointmentId ? '#e0f7fa' : '#ffeaa7',
                                borderRadius: 4,
                                fontFamily: 'monospace',
                                fontSize: '0.95rem',
                                border: appointmentId ? '1px solid #b0e0e6' : '1px solid #fdcb6e',
                                color: appointmentId ? '#006064' : '#e17055'
                              }}>
                                {appointmentId || 'Not provided'}
                              </span>
                            </div>
                            <div className="feedback-card-names">
                              <span className="feedback-card-patient">Patient: <b>{asText(appointment?.patient_name || appointment?.patient_id || '-')}</b></span>
                              <span className="feedback-card-doctor">Doctor: <b>{asText(appointment?.doctor_name || appointment?.doctor_id || '-')}</b></span>
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
                            <span 
                              style={{ cursor: 'pointer', marginRight: 12 }} 
                              title="Update" 
                              onClick={() => navigate(`/feedback/update?id=${feedback._id}${appointmentId ? `&appointmentId=${appointmentId}` : ''}`)}
                            >
                              <Pencil size={22} color="#43a047" style={{ verticalAlign: 'middle' }} />
                            </span>
                            <span 
                              style={{ cursor: 'pointer' }} 
                              title="Delete" 
                              onClick={() => navigate(`/feedback/delete?id=${feedback._id}${appointmentId ? `&appointmentId=${appointmentId}` : ''}`)}
                            >
                              <Trash2 size={22} color="#d32f2f" style={{ verticalAlign: 'middle' }} />
                            </span>
                          </div>
                        </div>
                      );
                    } catch (cardError) {
                      console.error("Error rendering feedback card:", cardError, feedback);
                      return (
                        <div key={feedback._id || Math.random()} style={{ padding: '10px', border: '1px solid red' }}>
                          Error rendering feedback
                        </div>
                      );
                    }
                  })}
                </div>
              )}
            </div>
      </SimplePatientLayout>
    );
  } catch (renderError) {
    console.error("Error rendering AllFeedback component:", renderError);
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Error Loading Feedback</h3>
        <p>Something went wrong. Please try refreshing the page.</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }
}

export default AllFeedback;
