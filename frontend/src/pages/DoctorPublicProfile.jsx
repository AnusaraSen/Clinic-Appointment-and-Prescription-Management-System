import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export default function DoctorPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateDoctor = location.state?.doctor;
  const [doctor, setDoctor] = useState(stateDoctor || null);
  const [loading, setLoading] = useState(!stateDoctor);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (doctor) return; // already have doctor from state
    let active = true;
    (async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetch(`http://localhost:5000/api/users/${id}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Failed to fetch doctor');
        if (active) {
          const u = json.data || {};
          setDoctor({
            _id: u._id || u.id,
            name: u.name && u.name.startsWith('Dr.') ? u.name : `Dr. ${u.name}`,
            specialty: u.specialty || u.department || 'General Medicine',
            avatar: u.avatar || 'https://via.placeholder.com/120x120.png?text=Dr',
            rating: 4.8,
            bio: u.bio || 'Experienced clinician dedicated to patient care.'
          });
        }
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id, doctor]);

  if (loading) return <div style={{ padding:'100px 24px' }}>Loading doctor...</div>;
  if (error) return (
    <div style={{ padding:'100px 24px' }}>
      <p style={{ color:'#b91c1c' }}>Error: {error}</p>
      <button onClick={() => navigate('/doctors-directory')} style={{ marginTop: 8, background:'#1976d2', color:'#fff', border:'none', borderRadius:8, padding:'8px 12px' }}>Back to Doctors</button>
    </div>
  );
  if (!doctor) return (
    <div style={{ padding:'100px 24px' }}>
      <p>Profile not found.</p>
      <button onClick={() => navigate('/doctors-directory')} style={{ marginTop: 8, background:'#1976d2', color:'#fff', border:'none', borderRadius:8, padding:'8px 12px' }}>Back to Doctors</button>
    </div>
  );

  return (
    <div style={{ padding:'100px 24px' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16, background:'#e2e8f0', border:'none', borderRadius:8, padding:'8px 12px', cursor:'pointer' }}>← Back</button>
      <div style={{ display:'flex', gap:24, alignItems:'center' }}>
        <img src={doctor.avatar} alt={doctor.name} style={{ width:120, height:120, borderRadius:'50%', objectFit:'cover', boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }} />
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f766e', margin: 0 }}>{doctor.name}</h1>
          <p style={{ fontSize: 18, color: '#1f2937', marginTop: 6 }}>{doctor.specialty}</p>
          <p style={{ fontSize: 16, color: '#334155', marginTop: 6 }}>Rating: {doctor.rating} / 5.0</p>
        </div>
      </div>

      <div style={{ marginTop: 24, display:'flex', gap:12 }}>
        <button 
          onClick={() => navigate('/appointments/add', { state: { doctor } })}
          style={{ background: '#008080', color:'#fff', border:'none', borderRadius:8, padding:'12px 16px', fontWeight:700, cursor:'pointer' }}
        >
          Request Appointment
        </button>
        <button 
          onClick={() => navigate('/services')}
          style={{ background: '#1976d2', color:'#fff', border:'none', borderRadius:8, padding:'12px 16px', fontWeight:700, cursor:'pointer' }}
        >
          View Services
        </button>
      </div>

      <div style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color:'#0f766e' }}>About</h2>
        <p style={{ color: '#334155', lineHeight: 1.6 }}>
          {doctor.bio}
        </p>
      </div>
    </div>
  );
}
