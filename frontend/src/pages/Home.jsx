import React, { useEffect, useRef, useState, useMemo } from 'react';
import '../styles/Home.css';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
// Icons
import { FaHeartbeat, FaUserMd, FaClock, FaPhoneAlt, FaClinicMedical, FaHome, FaPlus, FaLongArrowAltRight, FaWhatsapp, FaStethoscope, FaSyringe, FaFlask, FaBrain, FaCheck } from 'react-icons/fa';
// Assets
import familyCare1 from '../assets/familyCare1.jpg';
import doc3 from '../assets/doctor3.jpg';
import doc4 from '../assets/doctor4.jpg';
import doc1 from '../assets/doctor1.jpg';
import doc2 from '../assets/doctor2.jpg';
import home1 from '../assets/home1.jpg';
import home2 from '../assets/home2.jpg';
import service1 from '../assets/service1.jpg'
import service2 from '../assets/service2.jpg'
import service3 from '../assets/service3.jpg'
import service4 from '../assets/service4.jpg'

const Stat = ({ value, label, circle }) => (
  <div className={`home-stat${circle ? ' home-stat-circle' : ''}`}>
    {circle ? (
      <>
        <div className="home-circle-wrapper" data-target={value}>
          <svg viewBox="0 0 100 100" className="home-circle-chart">
            <circle className="bg" cx="50" cy="50" r="42" />
            <circle className="fg" cx="50" cy="50" r="42" strokeDasharray="0 999" />
            <text x="50" y="54" textAnchor="middle" className="home-circle-text">0%</text>
          </svg>
        </div>
        <div className="home-stat-label">{label}</div>
      </>
    ) : (
      <>
        <div className="home-stat-value" data-target={value}>0</div>
        <div className="home-stat-label">{label}</div>
      </>
    )}
  </div>
);

const ServiceCard = ({ icon, title }) => (
  <div className="home-service-card">
    <div className="home-service-icon">{icon}</div>
    <div className="home-service-title">{title}</div>
  </div>
);

const DoctorCard = ({ name, role, image }) => {
  const initials = name.split(' ').filter(Boolean).slice(-2).map(w => w[0]).join('').toUpperCase();
  return (
    <div className="home-doctor-card">
      <div className={`home-doctor-img${image ? '' : ' no-image'}`}> 
        {image ? (
          <img 
            src={image} 
            alt={name} 
            loading="lazy" 
            decoding="async" 
            onError={(e)=>{ e.currentTarget.style.display='none'; e.currentTarget.parentElement.classList.add('no-image'); }}
          />
        ) : (
          <div className="home-doctor-fallback" aria-hidden>{initials}</div>
        )}
        {!image && <span className="visually-hidden">{name}</span>}
      </div>
      <div className="home-doctor-role">{role}</div>
      <div className="home-doctor-name">{name}</div>
      <button className="home-outline-btn">View Profile →</button>
    </div>
  );
};

const FOUNDING_YEAR = 2018; // adjust if different

export default function Home() {
  const navigate = useNavigate();
  const ctaRef = useRef(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const statsRef = useRef(null);
  const [statsStarted, setStatsStarted] = useState(false);

  // Prepare slideshow images (import ensures bundling & caching)
  const heroImages = useMemo(() => {
    // Import all needed images eagerly once
    const imgs = import.meta.glob('../assets/home{11,12,13}.jpg', { eager: true, import: 'default' });
    return [
      
      imgs['../assets/home11.jpg'],
      imgs['../assets/home12.jpg'],
      imgs['../assets/home13.jpg'],
      // imgs['../assets/home4.jpg'],
      // imgs['../assets/home5.jpg'],
      // imgs['../assets/home6.jpg'],
      // imgs['../assets/home7.jpg'],
      // imgs['../assets/home8.jpg'],
      // imgs['../assets/home9.jpg']
    ].filter(Boolean);
  }, []);

  // Slideshow interval (1.5s)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return; // respect reduced motion
    if (!heroImages.length) return;
    const id = setInterval(() => {
      setSlideIndex(idx => (idx + 1) % heroImages.length);
    }, 2000); // 2s per request
    return () => clearInterval(id);
  }, [heroImages]);

  // Preload images explicitly (likely already cached due to eager import, but safe)
  useEffect(() => {
    heroImages.forEach(src => { const img = new Image(); img.src = src; });
  }, [heroImages]);

  // Observe stats section entering viewport
  useEffect(() => {
    if (statsStarted) return; // already triggered
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        setStatsStarted(true);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [statsStarted]);

  // Count-up animation when stats enter view
  useEffect(() => {
    if (!statsStarted) return;
    const numberEls = document.querySelectorAll('.home-stat-value');
    numberEls.forEach(el => {
      const target = parseInt(el.getAttribute('data-target') || '0', 10);
      const duration = 1200; // ms
      const startTime = performance.now();
      const step = (now) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const value = Math.round(target * progress);
        el.textContent = value.toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    // Circle stat animation
    const circleWrapper = document.querySelector('.home-circle-wrapper');
    if (circleWrapper) {
      const target = parseInt(circleWrapper.getAttribute('data-target') || '0', 10);
      const fg = circleWrapper.querySelector('circle.fg');
      const text = circleWrapper.querySelector('.home-circle-text');
      const maxDash = target * 2.64;
      const duration = 1200;
      const startTime = performance.now();
      const animate = (now) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const current = Math.round(target * progress);
        if (fg) fg.setAttribute('stroke-dasharray', `${(maxDash * progress).toFixed(2)} 999`);
        if (text) text.textContent = `${current}%`;
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [statsStarted]);

  // Trigger CTA stagger animation on mount
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    // Allow paint then add class for CSS animation
    const id = requestAnimationFrame(() => el.classList.add('loaded'));
    return () => cancelAnimationFrame(id);
  }, []);

  const services = [
    { title: 'General Practitioner Consultations', icon: <FaStethoscope /> },
    { title: 'Diabetes & Hypertension Care', icon: <FaHeartbeat /> },
    { title: 'Child Health & Vaccinations', icon: <FaSyringe /> },
    { title: 'Women\'s Health', icon: <FaClinicMedical /> },
    { title: 'Men\'s Health', icon: <FaCheck /> },
    { title: 'Senior Care Programs', icon: <FaHome /> },
    { title: 'Minor Procedures & Dressings', icon: <FaPlus /> },
    { title: 'Nutrition & Lifestyle Advice', icon: <FaHeartbeat /> },
    { title: 'Mental Health Support', icon: <FaBrain /> },
    { title: 'Laboratory Sample Collection', icon: <FaFlask /> },
    { title: 'Referral Coordination', icon: <FaLongArrowAltRight /> }
  ];

  return (
    <div className="home-page">
      <NavBar />
      
      <section className="home-hero">
        <div className="home-hero-slides" aria-hidden="true">
          {heroImages.map((src, i) => (
            <div
              key={i}
              className={`home-hero-slide${i === slideIndex ? ' active' : ''}`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <h1 className="home-hero-title">FAMILY HEALTH CARE</h1>
          <p className="home-hero-desc">Trusted Community Clinic Since {FOUNDING_YEAR}</p>
          <div className="home-hero-actions">
            <button className="home-primary-btn" onClick={() => navigate('/getPatient')}>
              <FaUserMd style={{ marginRight: 8 }} /> Our Doctors
            </button>
            <button className="home-primary-btn" onClick={() => navigate('/doctor-availability')}>
              <FaClock style={{ marginRight: 8 }} /> Opening Hours
            </button>
            <a className="home-call-btn" href="tel:0112576576">
              <FaPhoneAlt style={{ marginRight: 8 }} /> Call Now 0112 576 576
            </a>
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="home-cta-strip" aria-label="quick actions" ref={ctaRef}>
        <button className="home-cta-item home-cta-medical" onClick={() => navigate('/addPrescription')}>
          <span className="home-cta-icon" aria-hidden><FaHeartbeat /></span>
          <span className="home-cta-text"><strong>Book An Appointment</strong></span>
        </button>
        <button className="home-cta-item home-cta-mid" onClick={() => navigate('/getPatient')}>
          <span className="home-cta-label">OUR DOCTORS</span>
          <span className="home-cta-circle" aria-hidden><FaLongArrowAltRight /></span>
        </button>
        <button className="home-cta-item home-cta-mid" onClick={() => navigate('/doctor-availability')}>
          <span className="home-cta-label">SERVICES & CLINICS</span>
          <span className="home-cta-circle" aria-hidden><FaLongArrowAltRight /></span>
        </button>
        <a className="home-cta-item home-cta-call" href="tel:0112576576">
          <span className="home-cta-call-icon" aria-hidden><FaPhoneAlt /></span>
          <span className="home-cta-call-text"><small>Call Now</small><strong>0112 576 576</strong></span>
        </a>
      </section>

      <div className="home-after-cta">
      {/* Features */}
      <section className="home-feature-strip">
        <div className="home-feature">
          <div className="home-feature-icon"><FaClinicMedical /></div>
          <div className="home-feature-title">Comprehensive Primary Care</div>
          <p className="home-feature-desc">Consultations, chronic condition management, lifestyle and preventive guidance for all ages.</p>
        </div>
        <div className="home-feature">
          <div className="home-feature-icon"><FaHeartbeat /></div>
          <div className="home-feature-title">On-Site Diagnostics</div>
          <p className="home-feature-desc">Essential lab sample collection and coordinated referrals for imaging & specialist services.</p>
        </div>
        <div className="home-feature">
          <div className="home-feature-icon"><FaHome /></div>
          <div className="home-feature-title">Family & Preventive Health</div>
          <p className="home-feature-desc">Vaccinations, women’s & men’s health, senior support and personalised wellness planning.</p>
        </div>
      </section>

      {/* Welcome */}
      <section className="home-welcome">
        <div className="home-welcome-text">
          <h2>Welcome to Family Health Care Clinic</h2>
          <p>Family Health Care is a patient-focused community clinic offering attentive, relationship-based primary care. Our team provides continuity, clarity and a calm environment—because better health starts with listening.</p>
          <button className="home-outline-btn">Learn More</button>
        </div>
        <div className="home-welcome-image">
          <img src={familyCare1} alt="Welcome to Family Health Care Clinic" loading="lazy" decoding="async" />
        </div>
      </section>

      {/* Stats */}
      <section className="home-stats" ref={statsRef}>
        <Stat value={3200} label="Registered Patients" />
        <Stat value={12450} label="Consultations Completed" />
        <Stat value={4300} label="Follow-Up Visits" />
        <Stat value={780} label="Wellness Plans Active" />
  <Stat value={95} label="Customer Satisfaction" circle />
      </section>

      {/* Services */}
      <section className="home-services">
        <h3 className="home-section-title">Our Core Services</h3>
        <p className="home-section-sub">Personal primary and preventive care for every stage of life</p>
        <div className="home-services-grid">
          {services.map((s, i) => (
            <ServiceCard key={i} icon={s.icon} title={s.title} />
          ))}
        </div>
        <div className="home-actions-row">
          <button className="home-primary-btn" onClick={() => navigate('/doctor-availability')}>View All Clinics</button>
          <a className="home-call-btn" href="tel:0112576576"><FaPhoneAlt style={{ marginRight: 8 }} /> Call Now</a>
          <a className="home-outline-btn" href="https://wa.me/"><FaWhatsapp style={{ marginRight: 8 }} /> Whatsapp Chat</a>
        </div>
      </section>

      {/* Doctors */}
      <section className="home-doctors">
        <h3 className="home-section-title">Our Doctors and Medical Professionals</h3>
        <p className="home-section-sub">Experienced, approachable, and committed to continuity of care</p>
        <div className="home-doctors-row">
          <DoctorCard role="Psychologist" name="Mrs Rashmi Sooriyabandara" image={doc1} />
          <DoctorCard role="General Physician" name="Dr. Rashmira Balasuriya" image={doc2} />
          <DoctorCard role="Plastic Surgeon" name="Dr. Amila Siriwardana" image={doc3} />
          <DoctorCard role="General Physician" name="Dr. Chandana Galappaththi" image={doc4} />
        </div>
        <div className="home-center"><button className="home-outline-btn">View More</button></div>
      </section>

      {/* News */}
      <section className="home-news">
        <h3 className="home-section-title">News & Updates</h3>
        <p className="home-section-sub">Latest from the clinic</p>
        <div className="home-news-grid">
          {[
            'Seasonal Health Check Packages Open',
            'New Nutrition Guidance Program Launch',
            'Managing Blood Pressure at Home',
            'Expanded Chronic Care Support'
          ].map((title, i) => (
            <article className="home-news-card" key={i}>
              <div className="home-news-img" />
              <h4 className="home-news-title">{title}</h4>
              <p className="home-news-desc">A short update from our clinic team—focused on accessible, practical health improvements.</p>
              <button className="home-link-btn">read more →</button>
            </article>
          ))}
        </div>
        <div className="home-center"><button className="home-primary-btn">View More</button></div>
      </section>
      </div>
    </div>
  );
}
