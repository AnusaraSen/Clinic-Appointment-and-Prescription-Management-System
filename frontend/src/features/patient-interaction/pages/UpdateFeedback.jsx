import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../../styles/Patient-Interaction/UpdateFeedback.css";
import { useNavigate, useLocation } from "react-router-dom";
import { SimplePatientLayout } from "../components/SimplePatientLayout";
import { Star } from "lucide-react";

function UpdateFeedback() {
  const [id, setId] = useState("");
  const [form, setForm] = useState({
    appointment_id: "",
    rating: "",
    comments: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [characterCount, setCharacterCount] = useState(0);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Update character count for comments
    if (name === 'comments') {
      setCharacterCount(value.length);
    }
    
    // Clear error/success messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleIdChange = e => setId(e.target.value);
  const navigate = useNavigate();
  const location = useLocation();

  // Utility functions
  const getRatingText = (rating) => {
    const ratingTexts = {
      "1": "Poor",
      "2": "Fair", 
      "3": "Good",
      "4": "Very Good",
      "5": "Excellent"
    };
    return ratingTexts[rating] || "";
  };

  const renderStars = (rating) => {
    const numRating = parseInt(rating) || 0;
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={20}
        className="star"
        style={{
          color: i < numRating ? "#ffc107" : "#e0e0e0",
          fill: i < numRating ? "#ffc107" : "none"
        }}
      />
    ));
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qid = params.get("id");
    const appointmentId = params.get("appointmentId");
    
    if (qid) setId(qid);
    
    // Pre-populate appointment ID if provided in URL
    if (appointmentId) {
      setForm(prevForm => ({
        ...prevForm,
        appointment_id: appointmentId
      }));
    }
  }, [location.search]);

  // Fetch feedback details when id is set
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      
      setLoading(true);
      setError("");
      
      try {
        const res = await axios.get(`/feedback/get/${id}`);
        const feedback = res.data.feedback || res.data;
        setForm({
          appointment_id: feedback.appointment_id?._id || feedback.appointment_id || "",
          rating: feedback.rating?.toString() || "",
          comments: feedback.comments || ""
        });
        setCharacterCount((feedback.comments || "").length);
        setSuccess("Feedback loaded successfully!");
      } catch (err) {
        console.error("Failed to load feedback:", err);
        const msg = err?.response?.data?.error || err?.response?.data || err?.message || "Failed to load feedback";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault();
    
    setError("");
    setSuccess("");

    // Basic validation
    if (!form.rating) {
      setError("Rating is required.");
      return;
    }

    const rating = parseInt(form.rating);
    if (rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    if (form.comments && form.comments.length > 1000) {
      setError("Comments cannot exceed 1000 characters.");
      return;
    }

    const feedback = {
      appointment_id: form.appointment_id,
      rating: rating,
      comments: form.comments || undefined
    };

    setLoading(true);
    
    try {
      await axios.put(`/feedback/update/${id}`, feedback);
      setSuccess("Feedback updated successfully!");
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate("/feedback");
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data || err?.message || "Error updating feedback";
      setError(msg);
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SimplePatientLayout currentPage="feedback">
      <div className={`update-feedback ${loading ? 'loading' : ''}`}>
        <h2>Update Feedback</h2>
        
        {/* Status Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        {/* Feedback ID Input */}
        <div className="id-input-group">
          <label htmlFor="feedback_id">Feedback ID</label>
          <input 
            id="feedback_id" 
            value={id} 
            onChange={handleIdChange} 
            placeholder="Enter the feedback ID to update" 
            required 
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Appointment ID Field */}
          <div className="form-group">
            <label htmlFor="appointment_id">
              Appointment ID
              {new URLSearchParams(location.search).get("appointmentId") && 
                <span style={{ color: '#00bfae', fontSize: '0.9rem', marginLeft: '8px' }}>
                  (Auto-filled)
                </span>
              }
            </label>
            <input 
              id="appointment_id" 
              name="appointment_id" 
              value={form.appointment_id} 
              onChange={handleChange} 
              placeholder="Enter appointment ID" 
              required 
              readOnly={!!new URLSearchParams(location.search).get("appointmentId")}
              style={{ 
                backgroundColor: new URLSearchParams(location.search).get("appointmentId") ? '#f0f9ff' : 'transparent',
                cursor: new URLSearchParams(location.search).get("appointmentId") ? 'not-allowed' : 'text'
              }}
            />
            {new URLSearchParams(location.search).get("appointmentId") && (
              <div style={{ fontSize: '0.9rem', color: '#006064', marginTop: '6px' }}>
                ✓ Appointment ID automatically loaded from feedback record
              </div>
            )}
          </div>

          {/* Rating Field */}
          <div className="form-group">
            <label htmlFor="rating">Rating (1-5)</label>
            <select 
              id="rating" 
              name="rating" 
              value={form.rating} 
              onChange={handleChange} 
              required 
              className="rating-dropdown"
            >
              <option value="">Select Rating</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
            
            {/* Rating Preview */}
            {form.rating && (
              <div className="rating-preview">
                <div className="stars">
                  {renderStars(form.rating)}
                </div>
                <span className="rating-text">
                  {form.rating}/5 - {getRatingText(form.rating)}
                </span>
              </div>
            )}
          </div>

          {/* Comments Field */}
          <div className="form-group">
            <label htmlFor="comments">Comments (Optional)</label>
            <textarea 
              id="comments" 
              name="comments" 
              value={form.comments} 
              onChange={handleChange} 
              placeholder="Share your detailed feedback here..."
              rows="5"
              maxLength="1000"
            />
            <div className={`character-counter ${characterCount > 800 ? 'warning' : ''} ${characterCount > 950 ? 'danger' : ''}`}>
              {characterCount}/1000 characters
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading || !id}
            style={{
              opacity: loading || !id ? 0.6 : 1,
              cursor: loading || !id ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Updating...' : 'Update Feedback'}
          </button>
        </form>
      </div>
    </SimplePatientLayout>
  );
}

export default UpdateFeedback;
