import React from 'react';
import '../../../styles/clinical-workflow/DoctorProfile.css';
import { useNavigate } from 'react-router-dom';

const DoctorProfile = () => {
  const navigate = useNavigate();

  const doctorData = {
    name: 'Dr. Alex Mitchell',
    title: 'Chief Medical Officer',
    specialization: 'Internal Medicine & Cardiology',
    email: 'alex.mitchell@medidash.com',
    phone: '+1 (555) 123-4567',
    address: '123 Medical Plaza, Healthcare City, HC 12345',
    licenseNumber: 'MD-2018-45678',
    experience: '12 Years',
    education: [
      'MD - Harvard Medical School (2012)',
      'Residency - Johns Hopkins Hospital (2016)',
      'Fellowship - Mayo Clinic Cardiology (2018)'
    ],
    certifications: [
      'Board Certified Internal Medicine',
      'Board Certified Cardiology',
      'Advanced Cardiac Life Support (ACLS)',
      'Basic Life Support (BLS)'
    ],
    languages: ['English', 'Spanish', 'French'],
    joinDate: 'January 2019',
    bio: 'Dr. Alex Mitchell is a highly experienced internal medicine physician with specialized training in cardiology. With over 12 years of clinical experience, Dr. Mitchell has been dedicated to providing comprehensive healthcare services and has been instrumental in implementing digital health solutions at MediDash.',
    achievements: [
      'Excellence in Patient Care Award 2023',
      'Digital Healthcare Innovation Award 2022',
      'Best Doctor Recognition 2021-2023',
      'Published 15+ research papers in peer-reviewed journals'
    ]
  };

  return (
    <div className="doctor-profile-wrapper">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Doctor Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-photo-section">
            <div className="profile-photo">
              <span className="photo-placeholder">👨‍⚕️</span>
            </div>
            <div className="profile-basic-info">
              <h2>{doctorData.name}</h2>
              <p className="title">{doctorData.title}</p>
              <p className="specialization">{doctorData.specialization}</p>
              <div className="experience-badge">
                {doctorData.experience} Experience
              </div>
            </div>
          </div>

          <div className="profile-details-grid">
            <div className="detail-section">
              <h3>Contact Information</h3>
              <div className="detail-item">
                <span className="label">Email:</span>
                <span className="value">{doctorData.email}</span>
              </div>
              <div className="detail-item">
                <span className="label">Phone:</span>
                <span className="value">{doctorData.phone}</span>
              </div>
              <div className="detail-item">
                <span className="label">Address:</span>
                <span className="value">{doctorData.address}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Professional Details</h3>
              <div className="detail-item">
                <span className="label">License Number:</span>
                <span className="value">{doctorData.licenseNumber}</span>
              </div>
              <div className="detail-item">
                <span className="label">Join Date:</span>
                <span className="value">{doctorData.joinDate}</span>
              </div>
              <div className="detail-item">
                <span className="label">Languages:</span>
                <span className="value">{doctorData.languages.join(', ')}</span>
              </div>
            </div>

            <div className="detail-section full-width">
              <h3>Education</h3>
              <ul className="list-items">
                {doctorData.education.map((edu, index) => (
                  <li key={index}>{edu}</li>
                ))}
              </ul>
            </div>

            <div className="detail-section full-width">
              <h3>Certifications</h3>
              <div className="certifications-grid">
                {doctorData.certifications.map((cert, index) => (
                  <div key={index} className="certification-badge">{cert}</div>
                ))}
              </div>
            </div>

            <div className="detail-section full-width">
              <h3>About</h3>
              <p className="bio-text">{doctorData.bio}</p>
            </div>

            <div className="detail-section full-width">
              <h3>Achievements & Recognition</h3>
              <ul className="achievements-list">
                {doctorData.achievements.map((achievement, index) => (
                  <li key={index} className="achievement-item">
                    <span className="achievement-icon">🏆</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn-edit-profile">Edit Profile</button>
            <button className="btn-download-cv">Download CV</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;