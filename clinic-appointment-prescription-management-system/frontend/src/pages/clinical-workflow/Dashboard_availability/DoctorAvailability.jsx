import React from "react";
import { useNavigate } from 'react-router-dom';
import DoctorCalendar from "./DoctorCalendar";

function DoctorAvailability() {
  const navigate = useNavigate();
  
  // TODO: Replace with real authenticated doctor's _id fetched after login.
  // The string must be a 24-character hex value to be a valid MongoDB ObjectId.
  const doctorId = "64a9b0d1234567890abcdef1"; // placeholder valid-length ObjectId

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'linear-gradient(135deg, #0d8c90 0%, #0a7075 100%)',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            color: 'white',
            fontWeight: '600',
            boxShadow: '0 3px 15px rgba(13, 140, 144, 0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #0a7075 0%, #085e63 100%)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(13, 140, 144, 0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #0d8c90 0%, #0a7075 100%)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 3px 15px rgba(13, 140, 144, 0.2)';
          }}
        >
          🏠 Back to Dashboard
        </button>
      </div>
      <DoctorCalendar doctorId={doctorId} />
    </div>
  );
}

export default DoctorAvailability;
