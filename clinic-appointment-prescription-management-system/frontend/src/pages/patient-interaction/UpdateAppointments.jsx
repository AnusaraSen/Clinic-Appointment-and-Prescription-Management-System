
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/UpdateAppointments.css";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function UpdateAppointments() {
  const [id, setId] = useState("");
  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: "",
    date: "",
    time: "",
    status: "",
    reason: "",
    follow_up_date: "",
    follow_up_time: ""
  });
  // Get doctor details from localStorage if available
  let doctor = null;
  try {
    const stored = localStorage.getItem('selectedDoctor');
    if (stored) doctor = JSON.parse(stored);
  } catch {}

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // When ID changes, fetch appointment details and update form
  const handleIdChange = async e => {
    const newId = e.target.value;
    setId(newId);
    if (newId) {
      try {
  const res = await axios.get(`/appointment/get/${newId}`);
        const appt = res.data.appointment || res.data;
        const toDateInput = (d) => {
          if (!d) return "";
          const dt = new Date(d);
          if (Number.isNaN(dt.getTime())) return "";
          const yyyy = dt.getFullYear();
          const mm = String(dt.getMonth() + 1).padStart(2, "0");
          const dd = String(dt.getDate()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        };
        setForm({
          patient_id: appt.patient_id || "",
          doctor_id: appt.doctor_id || "",
          date: toDateInput(appt.date),
          time: appt.time || "",
          status: appt.status || "",
          reason: appt.reason || "",
          follow_up_date: appt.follow_up?.date ? toDateInput(appt.follow_up.date) : "",
          follow_up_time: appt.follow_up?.time || ""
        });
      } catch (err) {
        console.error("Failed to load appointment:", err);
        const msg = err?.response?.data || err?.message || JSON.stringify(err);
        window.alert("Failed to load appointment: " + msg);
      }
    }
  };
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qid = params.get("id");
    if (qid) setId(qid);
  }, [location.search]);

  // Fetch appointment details when id is set
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
  const res = await axios.get(`/appointment/get/${id}`);
        const appt = res.data.appointment || res.data;
        // Map server fields into form; convert dates to input-friendly formats
        const toDateInput = (d) => {
          if (!d) return "";
          const dt = new Date(d);
          if (Number.isNaN(dt.getTime())) return "";
          const yyyy = dt.getFullYear();
          const mm = String(dt.getMonth() + 1).padStart(2, "0");
          const dd = String(dt.getDate()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        };
        setForm({
          patient_id: appt.patient_id || "",
          doctor_id: appt.doctor_id || "",
          date: toDateInput(appt.date),
          time: appt.time || "",
          status: appt.status || "",
          reason: appt.reason || "",
          follow_up_date: appt.follow_up?.date ? toDateInput(appt.follow_up.date) : "",
          follow_up_time: appt.follow_up?.time || ""
        });
      } catch (err) {
        console.error("Failed to load appointment:", err);
        const msg = err?.response?.data || err?.message || JSON.stringify(err);
        window.alert("Failed to load appointment: " + msg);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault();
    const appointment = {
      patient_id: form.patient_id,
      doctor_id: form.doctor_id,
      date: form.date,
      time: form.time,
      status: form.status,
      reason: form.reason,
      follow_up: {
        date: form.follow_up_date,
        time: form.follow_up_time
      }
    };
    try {
  await axios.put(`/appointment/update/${id}`, appointment);
      window.alert("Appointment updated!");
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data || err?.message || JSON.stringify(err);
      window.alert("Error updating appointment: " + msg);
      console.error("Update error:", err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f6f8fa' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
  <main style={{ padding: '32px', maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'row', gap: 40, alignItems: 'flex-start', justifyContent: 'flex-start', background: '#f6f8fa' }}>
          {/* Left: Doctor profile card and calendar */}
          {doctor && (
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
                  <span style={{ fontStyle: 'italic', color: '#aaa' }}>Calendar view coming soon...</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                  <span style={{ background: '#e0f7fa', borderRadius: 6, padding: '4px 10px', margin: 2 }}>10:00 AM</span>
                  <span style={{ background: '#e0f7fa', borderRadius: 6, padding: '4px 10px', margin: 2 }}>11:30 AM</span>
                  <span style={{ background: '#e0f7fa', borderRadius: 6, padding: '4px 10px', margin: 2 }}>2:00 PM</span>
                  <span style={{ background: '#e0f7fa', borderRadius: 6, padding: '4px 10px', margin: 2 }}>3:30 PM</span>
                </div>
              </div>
            </div>
          )}
          {/* Right: Update form */}
          <div className="update-appointments" style={{ flex: 1 }}>
            <h2>Update Appointment</h2>
            <div style={{ marginBottom: 8 }}>
              <label>Appointment ID</label>
              <input value={id} onChange={handleIdChange} placeholder="Appointment ID" required />
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 8 }}>
                <label>Patient ID</label>
                <input name="patient_id" value={form.patient_id} onChange={handleChange} placeholder="Patient ID" required />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>Doctor ID</label>
                <input name="doctor_id" value={form.doctor_id} onChange={handleChange} placeholder="Doctor ID" required />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>Date</label>
                <input name="date" type="date" value={form.date} onChange={handleChange} required />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>Time</label>
                <input name="time" type="time" value={form.time} onChange={handleChange} required />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>Reason</label>
                <input name="reason" value={form.reason} onChange={handleChange} placeholder="Reason" required />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>Follow-up date</label>
                <input name="follow_up_date" type="date" value={form.follow_up_date} onChange={handleChange} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>Follow-up time</label>
                <input name="follow_up_time" type="time" value={form.follow_up_time} onChange={handleChange} />
              </div>
              <button type="submit">Update Appointment</button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UpdateAppointments;
