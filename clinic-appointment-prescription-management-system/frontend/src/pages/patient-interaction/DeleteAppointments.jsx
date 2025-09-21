
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/DeleteAppointments.css";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function DeleteAppointments() {
  const [id, setId] = useState("");
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qid = params.get("id");
    if (qid) setId(qid);
  }, [location.search]);

  // helper formatters
  const formatDateOnly = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  // fetch appointment details when id changes
  useEffect(() => {
    const load = async () => {
      setAppointment(null);
      setError("");
      if (!id) return;
      setLoading(true);
      try {
        const res = await axios.get(`/appointment/get/${id}`);
        const appt = res.data.appointment || res.data;
        setAppointment(appt);
      } catch (err) {
        const msg = err?.response?.data || err?.message || JSON.stringify(err);
        setError(msg);
        console.error("Failed to load appointment for delete:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!id) {
      window.alert("Please provide an appointment ID to delete.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this appointment? This cannot be undone.")) return;
    try {
      await axios.delete(`/appointment/delete/${id}`);
      window.alert("Appointment deleted!");
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data || err?.message || JSON.stringify(err);
      window.alert("Error deleting appointment: " + msg);
      console.error("Delete error:", err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f6f8fa' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <main style={{ flex: 1, padding: '32px 32px 32px 32px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', background: '#f6f8fa' }}>
          <div className="delete-appointments">
            <h2>Delete Appointment</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>Appointment ID</label>
              <input value={id} onChange={e => setId(e.target.value)} placeholder="Appointment ID" />
            </div>
            {loading ? (
              <div>Loading appointment details...</div>
            ) : error ? (
              <div style={{ color: "red" }}>Failed to load: {error}</div>
            ) : appointment ? (
              <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6 }}>
                <div><strong>Patient:</strong> {appointment.patient_id}</div>
                <div><strong>Doctor:</strong> {appointment.doctor_id}</div>
                <div><strong>Date:</strong> {formatDateOnly(appointment.date)}</div>
                <div><strong>Time:</strong> {appointment.time || "-"}</div>
                <div><strong>Status:</strong> {appointment.status || "-"}</div>
                <div><strong>Reason:</strong> {appointment.reason || "-"}</div>
                <div><strong>Follow-up:</strong> {appointment.follow_up && (appointment.follow_up.date || appointment.follow_up.time) ? (`${appointment.follow_up.date ? formatDateTime(appointment.follow_up.date) : "-"} ${appointment.follow_up.time ? `at ${appointment.follow_up.time}` : ""}`) : "-"}</div>
                {appointment.created_at && <div><small>Created: {formatDateTime(appointment.created_at)}</small></div>}
              </div>
            ) : (
              <div>No appointment loaded.</div>
            )}
            <div style={{ marginTop: 12 }}>
              <button onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DeleteAppointments;
