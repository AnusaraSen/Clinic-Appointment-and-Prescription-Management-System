import React, { useState } from "react";
import axios from "axios";
import Sidebar from "../../components/SidebarPatient";
import Topbar from "../../components/Topbar";
import "../../styles/Patient-Interaction/AddAppointments.css";
import { useNavigate, useLocation } from "react-router-dom";

function AddAppointments() {
  const navigate = useNavigate();
  const location = useLocation();
  // Try to get doctor from navigation state, else from localStorage
  let doctor = location.state?.doctor;
  React.useEffect(() => {
    // Debug log to verify doctor object
    console.log('Doctor from state:', location.state?.doctor);
    if (location.state?.doctor) {
      localStorage.setItem('selectedDoctor', JSON.stringify(location.state.doctor));
    }
  }, [location.state]);
  if (!doctor) {
    try {
      const stored = localStorage.getItem('selectedDoctor');
      if (stored) doctor = JSON.parse(stored);
    } catch { }
  }
  // Debug log to verify doctor from localStorage
  console.log('Doctor used for card:', doctor);
  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: "",
    date: "",
    time: "",
    reason: "",
    follow_up_date: "",
    follow_up_time: ""
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Basic client-side validation
    if (!form.patient_id || !form.doctor_id) {
      alert("Patient ID and Doctor ID are required and must be valid IDs.");
      return;
    }

    // Validate ObjectId-ish strings (24 hex chars) to avoid backend CastError
    const isLikelyObjectId = (s) => /^[a-fA-F0-9]{24}$/.test(s);
    if (!isLikelyObjectId(form.patient_id) || !isLikelyObjectId(form.doctor_id)) {
      if (!window.confirm("Patient ID or Doctor ID does not look like a 24-character ObjectId. Continue anyway?")) return;
    }

    // Ensure date is not in the past (simple check)
    if (form.date) {
      const d = new Date(form.date);
      const now = new Date();
      // normalize to date-only for comparison
      d.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      if (d < now) {
        window.alert("Appointment date cannot be in the past.");
        return;
      }
    }

    const appointment = {
      patient_id: form.patient_id,
      doctor_id: form.doctor_id,
      date: form.date,
      time: form.time,
      reason: form.reason,
      follow_up: form.follow_up_date || form.follow_up_time ? { date: form.follow_up_date || undefined, time: form.follow_up_time || undefined } : undefined
    };
    try {
      // prefer proxy so dev server forwards to backend
      await axios.post("http://localhost:5000/appointment/add", appointment, { timeout: 5000 });
      window.alert("Appointment added!");
      // redirect to dashboard after adding
      navigate("/dashboard");
    } catch (err) {
      // show detailed server error when available
      const serverMsg = err?.response?.data || err?.message || JSON.stringify(err);
      window.alert("Error adding appointment: " + serverMsg);
      console.error("Add appointment error:", err);
    }
  };

  if (!doctor) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: 220 }}>
          <Topbar />
          <main style={{ padding: '32px', maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 10, padding: 32, textAlign: 'center', boxShadow: '0 2px 8px rgba(255,215,0,0.08)' }}>
              <h2 style={{ color: '#d48806', marginBottom: 16 }}>No Doctor Selected</h2>
              <p style={{ color: '#555', marginBottom: 24 }}>Please select a doctor from the Doctors page to book an appointment.</p>
              <button style={{ background: '#008080', color: 'white', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/doctors')}>Go to Doctors Page</button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Topbar />
        <main style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 40, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
            {/* Left: Doctor profile card */}
            <div style={{
              minWidth: 260,
              maxWidth: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: '#e6f7fa',
              borderRadius: 12,
              padding: '32px 18px',
              boxShadow: '0 2px 8px rgba(0,128,128,0.08)'
            }}>
              <img src={doctor.avatar} alt={doctor.name} style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 18 }} />
              <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#008080', marginBottom: 6 }}>{doctor.name}</div>
              <div style={{ color: '#555', fontSize: '1.05rem', marginBottom: 6 }}>{doctor.specialty}</div>
              <div style={{ color: '#fbbf24', fontWeight: 600, marginBottom: 18 }}>Rating: {doctor.rating}</div>
              {/* Calendar View Placeholder */}
              <div style={{ width: '100%', marginTop: 12, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,128,128,0.07)', padding: '12px 8px', textAlign: 'center' }}>
                <h3 style={{ color: '#008080', fontSize: '1.08rem', marginBottom: 8 }}>Available Time Slots</h3>
                <div style={{ color: '#555', fontSize: '0.98rem', marginBottom: 8 }}>
                  {/* Replace this with a real calendar component later */}
                  <span style={{ fontStyle: 'italic', color: '#aaa' }}>Calendar view coming soon...</span>
                </div>
                {/* Example: Show some static slots for demo */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                  <span style={{ background: '#e0f7fa', borderRadius: 6, padding: '4px 10px', margin: 2 }}>10:00 AM</span>
                  <span style={{ background: '#e0f7fa', borderRadius: 6, padding: '4px 10px', margin: 2 }}>11:30 AM</span>
                  <span style={{ background: '#e0f7fa', borderRadius: 6, padding: '4px 10px', margin: 2 }}>2:00 PM</span>
                  <span style={{ background: '#e0f7fa', borderRadius: 6, padding: '4px 10px', margin: 2 }}>3:30 PM</span>
                </div>
              </div>
            </div>
            {/* Right: Form */}
            <div className="add-appointments" style={{ flex: 1 }}>
              <h2>Add Appointment</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 8 }}>
                  <label htmlFor="patient_id">Patient ID</label>
                  <input id="patient_id" name="patient_id" value={form.patient_id} onChange={handleChange} placeholder="Patient ID" required />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label htmlFor="doctor_id">Doctor ID</label>
                  <input id="doctor_id" name="doctor_id" value={form.doctor_id} onChange={handleChange} placeholder="Doctor ID" required />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label htmlFor="date">Date</label>
                  <input id="date" name="date" type="date" value={form.date} onChange={handleChange} required />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label htmlFor="time">Time</label>
                  <input id="time" name="time" type="time" value={form.time} onChange={handleChange} required />
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label htmlFor="reason">Reason</label>
                  <input id="reason" name="reason" value={form.reason} onChange={handleChange} placeholder="Reason" required />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label htmlFor="follow_up_date">Follow-up date</label>
                  <input id="follow_up_date" name="follow_up_date" type="date" value={form.follow_up_date} onChange={handleChange} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label htmlFor="follow_up_time">Follow-up time</label>
                  <input id="follow_up_time" name="follow_up_time" type="time" value={form.follow_up_time} onChange={handleChange} />
                </div>
                <button type="submit">Submit</button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AddAppointments;
