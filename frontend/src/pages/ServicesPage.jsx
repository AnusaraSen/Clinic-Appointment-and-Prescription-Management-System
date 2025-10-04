import React from 'react';
import NavBar from '../components/NavBar';
import '../styles/ServicesPage.css';

const ServicesPage = () => {
  const services = [
    {
      id: 1,
      title: 'General Medicine',
      description: 'Comprehensive primary care for all your health needs',
      icon: 'fas fa-stethoscope',
      features: ['Health checkups', 'Chronic disease management', 'Preventive care', 'Medical consultations']
    },
    {
      id: 2,
      title: 'Pediatrics',
      description: 'Specialized care for infants, children, and adolescents',
      icon: 'fas fa-baby',
      features: ['Child health checkups', 'Vaccinations', 'Growth monitoring', 'Developmental assessments']
    },
    {
      id: 3,
      title: 'Laboratory Services',
      description: 'Complete diagnostic testing with accurate results',
      icon: 'fas fa-flask',
      features: ['Blood tests', 'Urine analysis', 'X-rays', 'ECG monitoring']
    },
    {
      id: 4,
      title: 'Pharmacy',
      description: 'Full-service pharmacy with prescription medications',
      icon: 'fas fa-pills',
      features: ['Prescription dispensing', 'Medication counseling', 'Drug interactions check', 'Generic alternatives']
    },
    {
      id: 5,
      title: 'Emergency Care',
      description: '24/7 emergency medical services for urgent health needs',
      icon: 'fas fa-ambulance',
      features: ['Emergency treatment', 'Trauma care', 'Critical care', 'Urgent consultations']
    },
    {
      id: 6,
      title: 'Mental Health',
      description: 'Professional mental health support and counseling services',
      icon: 'fas fa-brain',
      features: ['Counseling sessions', 'Therapy programs', 'Mental health assessments', 'Support groups']
    }
  ];

  return (
    <div className="services-page">
      <NavBar />
      
      <div className="services-container">
        <div className="services-header">
          <h1>Our Services</h1>
          <p>Comprehensive healthcare services designed to meet all your medical needs</p>
        </div>

        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-icon">
                <i className={service.icon}></i>
              </div>
              <h3>{service.title}</h3>
              <p className="service-description">{service.description}</p>
              <ul className="service-features">
                {service.features.map((feature, index) => (
                  <li key={index}>
                    <i className="fas fa-check"></i>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="service-btn">
                Learn More
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          ))}
        </div>

        <div className="services-cta">
          <div className="cta-content">
            <h2>Ready to Book an Appointment?</h2>
            <p>Our experienced medical professionals are here to provide you with the best healthcare services.</p>
            <div className="cta-buttons">
              <button className="primary-btn">
                <i className="fas fa-calendar-check"></i>
                Book Appointment
              </button>
              <button className="secondary-btn">
                <i className="fas fa-phone"></i>
                Call Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;