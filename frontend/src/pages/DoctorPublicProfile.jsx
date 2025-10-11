import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import '../styles/Patient-Interaction/DoctorsPage.css';

export default function DoctorPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialDoctor = location.state?.doctor;

  const [doctor, setDoctor] = useState(initialDoctor || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState([]);

  // Fetch doctor details if not provided
  useEffect(() => {
    let active = true;
    if (doctor && doctor._id) return; // already have doctor
    (async () => {
      setLoading(true); setError(null);
      try {
        // Try to fetch doctor by id; fall back silently if endpoint differs
        const res = await fetch(`http://localhost:5000/api/users/${id}`);
        if (res.ok) {
          const json = await res.json();
          const u = json?.data || json; // support either {success,data} or raw
          if (u) {
            const mapped = {
              _id: u._id || u.id || id,
              name: u.name && u.name.startsWith('Dr.') ? u.name : `Dr. ${u.name || 'Unknown'}`,
              specialty: u.specialty || u.department || 'General Medicine',
              avatar: u.avatar || 'https://via.placeholder.com/128x128.png?text=Dr',
              rating: 4.8,
              bio: u.bio || u.about || '',
              experience: u.experience || undefined,
              qualifications: u.qualifications || u.licenses || [],
            };
            if (active) setDoctor(mapped);
          }
        } else {
          // If specific endpoint missing, try listing endpoint and filter
          const listRes = await fetch('http://localhost:5000/api/users?role=Doctor');
          const listJson = await listRes.json();
          const match = (listJson?.data || []).find(d => (d._id || d.id) === id);
          if (match && active) {
            setDoctor({
              _id: match._id || match.id || id,
              name: match.name && match.name.startsWith('Dr.') ? match.name : `Dr. ${match.name}`,
              specialty: match.specialty || match.department || 'General Medicine',
              avatar: match.avatar || 'https://via.placeholder.com/128x128.png?text=Dr',
              rating: 4.8,
              bio: match.bio || '',
            });
          }
        }
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id, doctor]);

  // Fetch availability blocks (optional info)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const doctorId = (doctor?._id) || id;
        if (!doctorId) return;
        const res = await fetch(`http://localhost:5000/api/availability/doctor/${doctorId}`);
        if (!res.ok) return;
        const blocks = await res.json();
        if (active) setAvailability(Array.isArray(blocks) ? blocks : (blocks?.data || []));
      } catch {}
    })();
    return () => { active = false; };
  }, [doctor, id]);

  const nextBlock = useMemo(() => {
    if (!availability?.length) return null;
    const sorted = [...availability].sort((a,b) => new Date(a.date) - new Date(b.date));
    return sorted[0];
  }, [availability]);

  if (!doctor && loading) {
    return (
      <div className="doctors-page" style={{ paddingTop: '110px' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading profile...</div>
      </div>
    );
  }

  if (!doctor && error) {
    return (
      <div className="doctors-page" style={{ paddingTop: '110px' }}>
        <div style={{ textAlign: 'center', color: '#b91c1c', padding: '2rem' }}>Failed to load doctor: {error}</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="doctors-page" style={{ paddingTop: '110px' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Doctor not found.</div>
      </div>
    );
  }

  return (
    <div className="doctors-page" style={{ paddingTop: '110px' }}>
      <div className="doctors-header">
        <h1 className="h1">{doctor.name}</h1>
        <p className="p">{doctor.specialty}</p>
      </div>

      <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
        <div className="doctor-card" style={{ padding: 24 }}>
          <img className="doctor-avatar" src={doctor.avatar} alt={doctor.name} style={{ width: 120, height: 120 }} />
          <div className="doctor-name" style={{ fontSize: '1.4rem' }}>{doctor.name}</div>
          <div className="doctor-specialty">{doctor.specialty}</div>
          <div className="doctor-rating" style={{ marginTop: 6 }}>
            <Star size={18} fill="#fbbf24" color="#fbbf24" /> {doctor.rating || 4.8}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <button
              className="doctor-request-btn"
              onClick={() => navigate('/appointments/add', { state: { doctor } })}
            >
              Request Appointment
            </button>
            <button
              className="doctor-request-btn"
              style={{ background: '#64748b' }}
              onClick={() => navigate('/doctors')}
            >
              Back to Find Doctors
            </button>
          </div>
        </div>

        <div className="doctor-card" style={{ padding: 24 }}>
          <h2 className="h1" style={{ fontSize: '1.3rem', marginBottom: 8 }}>About</h2>
          <p className="p" style={{ marginBottom: 16 }}>
            {doctor.bio || 'This doctor has not added a bio yet.'}
          </p>

          <div style={{ marginTop: 8 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Next Availability</h3>
            {!availability?.length && <div className="p">No availability published.</div>}
            {nextBlock && (
              <div className="p">
                {new Date(nextBlock.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                {nextBlock.startTime ? ` • ${nextBlock.startTime}` : ''}
                {nextBlock.endTime ? ` - ${nextBlock.endTime}` : ''}
              </div>
            )}
          </div>

          {doctor.qualifications && doctor.qualifications.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Qualifications</h3>
              <ul className="p" style={{ paddingLeft: 18, listStyle: 'disc' }}>
                {doctor.qualifications.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
