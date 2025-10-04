import React from 'react';
import NavBar from '../components/NavBar';
import '../styles/ContactPage.css';

const ContactPage = () => {
  return (
    <div className="contact-page">
      <NavBar />
      
      <div className="contact-container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>Get in touch with Family Health Care - We're here to help you</p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-card">
              <div className="contact-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <h3>Our Location</h3>
              <p>123 Health Street<br />Colombo 07, Sri Lanka</p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">
                <i className="fas fa-phone"></i>
              </div>
              <h3>Phone</h3>
              <p>+94 11 123 4567<br />Emergency: +94 11 911</p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <h3>Email</h3>
              <p>info@familyhealthcare.lk<br />appointments@familyhealthcare.lk</p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h3>Working Hours</h3>
              <p>Mon - Fri: 8:00 AM - 8:00 PM<br />Sat - Sun: 9:00 AM - 5:00 PM</p>
            </div>
          </div>

          <div className="contact-form">
            <h2>Send us a Message</h2>
            <form>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" required />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select id="subject" name="subject" required>
                  <option value="">Select a subject</option>
                  <option value="appointment">Appointment Inquiry</option>
                  <option value="general">General Question</option>
                  <option value="emergency">Emergency</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows="5" required></textarea>
              </div>

              <button type="submit" className="submit-btn">
                <i className="fas fa-paper-plane"></i>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;