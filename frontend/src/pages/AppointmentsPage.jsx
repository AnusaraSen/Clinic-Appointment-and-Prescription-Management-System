import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import '../styles/AppointmentsPage.css';

const AppointmentsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="appointments-page">
      <NavBar />
      
      <div className="appointments-container">
        <div className="appointments-header">
          <h1>Book an Appointment</h1>
          <p>Schedule your visit with our experienced healthcare professionals</p>
        </div>

        <div className="appointment-options">
          <div className="appointment-card">
            <div className="appointment-icon">
              <i className="fas fa-calendar-plus"></i>
            </div>
            <h3>New Appointment</h3>
            <p>Schedule a new appointment with our doctors</p>
            <button 
              className="appointment-btn primary"
              onClick={() => navigate('/appointments/add')}
            >
              Book Now
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>

          <div className="appointment-card">
            <div className="appointment-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <h3>View Appointments</h3>
            <p>Check your existing appointments and status</p>
            <button 
              className="appointment-btn secondary"
              onClick={() => navigate('/patient/appointments')}
            >
              View All
              <i className="fas fa-eye"></i>
            </button>
          </div>

          <div className="appointment-card">
            <div className="appointment-icon">
              <i className="fas fa-user-md"></i>
            </div>
            <h3>Our Doctors</h3>
            <p>Meet our qualified medical professionals</p>
            <button 
              className="appointment-btn tertiary"
              onClick={() => navigate('/doctors')}
            >
              View Doctors
              <i className="fas fa-stethoscope"></i>
            </button>
          </div>
        </div>

        <div className="appointment-info">
          <div className="info-section">
            <h2>How to Book an Appointment</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Choose Your Service</h4>
                  <p>Select the type of medical service you need</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Pick a Doctor</h4>
                  <p>Choose from our qualified healthcare professionals</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Select Date & Time</h4>
                  <p>Choose a convenient date and time slot</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Confirm Booking</h4>
                  <p>Review details and confirm your appointment</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-section">
            <h3>Need Help?</h3>
            <p>Our staff is here to assist you with booking appointments</p>
            <div className="contact-methods">
              <div className="contact-method">
                <i className="fas fa-phone"></i>
                <span>+94 11 123 4567</span>
              </div>
              <div className="contact-method">
                <i className="fas fa-envelope"></i>
                <span>appointments@familyhealthcare.lk</span>
              </div>
              <div className="contact-method">
                <i className="fas fa-whatsapp"></i>
                <span>WhatsApp: +94 70 123 4567</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;