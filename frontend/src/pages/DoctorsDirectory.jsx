import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function DoctorsDirectory() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch('http://localhost:5000/api/users?role=Doctor');
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Failed to fetch doctors');
        if (active) {
          const mapped = (json.data || []).map(u => ({
            _id: u._id || u.id,
            name: u.name && u.name.startsWith('Dr.') ? u.name : `Dr. ${u.name}`,
            specialty: u.specialty || u.department || 'General Medicine',
            avatar: u.avatar || 'https://via.placeholder.com/96x96.png?text=Dr',
            rating: 4.8
          }));
          setDoctors(mapped);
        }
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filtered = doctors.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '100px 24px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f766e', marginBottom: 12 }}>Our Doctors</h1>
      <p style={{ color: '#1976d2', marginBottom: 16 }}>Browse doctors and view their public profiles.</p>

      <div style={{ display:'flex', gap:12, marginBottom:18 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or specialization"
          style={{ flex: 1, minWidth: 260, padding: '12px 16px', border: '2px solid #3b82f6', borderRadius: 8 }}
        />
      </div>

      {loading && <div>Loading doctors...</div>}
      {!loading && error && <div style={{ color:'#b91c1c' }}>{error}</div>}
      {!loading && !error && filtered.length === 0 && <div>No doctors found.</div>}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:16 }}>
        {filtered.map(d => (
          <div key={d._id} style={{ background:'#f0f4f8', borderRadius: 12, padding: 16, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
            <img src={d.avatar} alt={d.name} style={{ width:96, height:96, borderRadius:'50%', objectFit:'cover' }} />
            <div style={{ marginTop:8, fontWeight:700, color:'#0f766e' }}>{d.name}</div>
            <div style={{ color:'#334155' }}>{d.specialty}</div>
            <div style={{ marginTop:12, display:'flex', gap:8 }}>
              <button
                onClick={() => navigate(`/doctors-directory/${d._id}`, { state: { doctor: d } })}
                style={{ background:'#1976d2', color:'#fff', border:'none', borderRadius:8, padding:'8px 12px', fontWeight:700, cursor:'pointer' }}
              >
                View Profile
              </button>
              <button
                onClick={() => navigate('/appointments/add', { state: { doctor: d } })}
                style={{ background:'#008080', color:'#fff', border:'none', borderRadius:8, padding:'8px 12px', fontWeight:700, cursor:'pointer' }}
              >
                Request Appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
