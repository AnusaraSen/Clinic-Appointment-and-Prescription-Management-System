import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../../styles/Patient-Interaction/DeleteFeedback.css";
import { useNavigate, useLocation } from "react-router-dom";
import { SimplePatientLayout } from "../components/SimplePatientLayout";

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
    const appointmentId = params.get("appointmentId");
    
    if (qid) setId(qid);
    
    // Log the appointment ID for reference (could be used for additional validation)
    if (appointmentId) {
      console.log("Appointment ID from URL:", appointmentId);
    }
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
    <SimplePatientLayout currentPage="feedback">
      <div className="delete-feedback" style={{ maxWidth: 700, margin: '0 auto', padding: '32px' }}>
        <h2>Delete Feedback</h2>
        <div style={{ marginBottom: 20 }}>
          <label style={{ 
            display: "block", 
            marginBottom: 8, 
            fontWeight: 600, 
            color: '#008080',
            fontSize: '1.1rem'
          }}>
            Feedback ID 
            {new URLSearchParams(location.search).get("id") && 
              <span style={{ color: '#00bfae', fontSize: '0.9rem', marginLeft: '8px' }}>
                (Auto-filled)
              </span>
            }
          </label>
          <input 
            value={id} 
            onChange={e => setId(e.target.value)} 
            placeholder="Enter feedback ID to delete" 
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e0f2f1',
              borderRadius: '8px',
              fontSize: '1rem',
              backgroundColor: new URLSearchParams(location.search).get("id") ? '#f0f9ff' : '#fff',
              fontFamily: 'monospace',
              letterSpacing: '1px'
            }}
            readOnly={!!new URLSearchParams(location.search).get("id")}
          />
          {new URLSearchParams(location.search).get("id") && (
            <div style={{ fontSize: '0.9rem', color: '#006064', marginTop: '6px' }}>
              ✓ Feedback ID automatically loaded for deletion
            </div>
          )}
        </div>
            {loading ? (
              <div>Loading feedback details...</div>
            ) : error ? (
              <div style={{ color: "red" }}>Failed to load: {error}</div>
            ) : feedback ? (
              <div style={{ 
                border: "2px solid #f0f0f0", 
                padding: 20, 
                borderRadius: 12, 
                backgroundColor: '#fafafa',
                margin: '16px 0'
              }}>
                <h3 style={{ color: '#008080', marginBottom: 16 }}>Feedback Details to Delete:</h3>
                
                <div style={{ marginBottom: 12 }}>
                  <strong style={{ color: '#006064' }}>Appointment ID:</strong> 
                  <span style={{ 
                    marginLeft: 8, 
                    padding: '4px 8px', 
                    backgroundColor: '#e0f7fa',
                    borderRadius: 4,
                    fontFamily: 'monospace',
                    border: '1px solid #b0e0e6'
                  }}>
                    {feedback.appointment_id?._id || feedback.appointment_id || 'Not specified'}
                  </span>
                </div>
                
                {feedback.appointment_id?.patient_id && (
                  <>
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: '#006064' }}>Patient ID:</strong> 
                      <span style={{ marginLeft: 8 }}>{feedback.appointment_id.patient_id}</span>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: '#006064' }}>Doctor ID:</strong> 
                      <span style={{ marginLeft: 8 }}>{feedback.appointment_id.doctor_id}</span>
                    </div>
                  </>
                )}
                
                <div style={{ marginBottom: 12 }}>
                  <strong style={{ color: '#006064' }}>Rating:</strong> 
                  <span style={{ marginLeft: 8, fontSize: '1.1rem' }}>{getRatingDisplay(feedback.rating)}</span>
                </div>
                
                <div style={{ marginBottom: 12 }}>
                  <strong style={{ color: '#006064' }}>Comments:</strong> 
                  <div style={{ 
                    marginTop: 6, 
                    padding: 12, 
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: 6,
                    fontStyle: feedback.comments ? 'normal' : 'italic',
                    color: feedback.comments ? '#333' : '#999'
                  }}>
                    {feedback.comments || "No comments provided"}
                  </div>
                </div>
                
                {feedback.created_at && (
                  <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #e0e0e0' }}>
                    <small style={{ color: '#666' }}>
                      <strong>Created:</strong> {formatDateTime(feedback.created_at)}
                    </small>
                  </div>
                )}
                
                <div style={{ 
                  marginTop: 16, 
                  padding: 12, 
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: 6,
                  color: '#856404'
                }}>
                  ⚠️ <strong>Warning:</strong> This action cannot be undone. Please review the details carefully before proceeding.
                </div>
              </div>
            ) : (
              <div>No feedback loaded.</div>
            )}
            <div style={{ marginTop: 24, display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button 
                onClick={handleDelete}
                disabled={!feedback}
                style={{
                  padding: '14px 28px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  backgroundColor: feedback ? '#dc3545' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: feedback ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  boxShadow: feedback ? '0 4px 12px rgba(220, 53, 69, 0.3)' : 'none'
                }}
                onMouseOver={(e) => {
                  if (feedback) {
                    e.target.style.backgroundColor = '#c82333';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (feedback) {
                    e.target.style.backgroundColor = '#dc3545';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                🗑️ Delete Feedback
              </button>
              <button 
                onClick={() => navigate("/feedback")}
                style={{
                  padding: '14px 28px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#5a6268';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#6c757d';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
    </SimplePatientLayout>
  );
}

export default DeleteFeedback;
